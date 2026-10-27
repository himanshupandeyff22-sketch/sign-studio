import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {animations} from '../web/vocabulary.mjs';
import {validateMotion, createResearchRetargeter} from '../web/asl-loader.js';

function targetRig() {
  const buffer = fs.readFileSync(new URL('../web/assets/aarav.glb', import.meta.url));
  const gltf = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12))), joints = new Set(gltf.skins.flatMap(skin => skin.joints));
  const nodes = gltf.nodes.map((data, index) => {
    const node = joints.has(index) ? new THREE.Bone() : new THREE.Object3D(); node.name = THREE.PropertyBinding.sanitizeNodeName(data.name || '');
    if (data.translation) node.position.fromArray(data.translation); if (data.rotation) node.quaternion.fromArray(data.rotation); if (data.scale) node.scale.fromArray(data.scale); return node;
  });
  gltf.nodes.forEach((data, index) => data.children?.forEach(child => nodes[index].add(nodes[child])));
  const root = new THREE.Group(); root.scale.setScalar(1.75 / 1.70); gltf.scenes[gltf.scene || 0].nodes.forEach(index => root.add(nodes[index])); root.updateMatrixWorld(true);
  const bones = Object.fromEntries(nodes.filter(node => node.isBone).map(node => [node.name, node]));
  const rest = Object.fromEntries(Object.entries(bones).map(([name, node]) => [name, {position: node.position.clone(), quaternion: node.quaternion.clone()}]));
  return {root, bones, rest};
}
const motions = animations.map(a=>JSON.parse(fs.readFileSync(new URL('..'+a.motionUrl,import.meta.url))));

test('research files retain licensed finite animation/inverse-bind metadata and no source mesh', () => {
  for (const motion of motions) {
    assert.equal(validateMotion(motion), motion);
    assert.equal(motion.review.linguisticStatus, 'pending'); assert.equal(motion.review.defaultVocabularyEnabled, false);
    assert.match(motion.provenance.sourceGLBSHA256, /^[a-f0-9]{64}$/);
    for (const key of ['meshes', 'images', 'materials', 'textures', 'buffers']) assert.equal(motion[key], undefined);
    assert.equal(motion.inverseBind.length, 68);
    for (const item of motion.inverseBind) {
      const matrix = new THREE.Matrix4().fromArray(item.matrix), identity = matrix.clone().multiply(matrix.clone().invert());
      assert(identity.elements.every((value, i) => Math.abs(value - (i % 5 === 0 ? 1 : 0)) < 1e-6));
    }
  }
  const broken = structuredClone(motions[0]); broken.tracks[0].values[0] = NaN; assert.throws(() => validateMotion(broken), /invalid keyframes/);
  const unlicensed = structuredClone(motions[0]); unlicensed.provenance.license = ''; assert.throws(() => validateMotion(unlicensed), /provenance/);
});

test('anatomical calibration maps differing source rigs and preserves finite target finger directions', () => {
  for (const motion of motions) {
    const {root, bones, rest} = targetRig(), retargeter = createResearchRetargeter(motion, bones, rest);
    assert(retargeter.diagnostics.excludedEndNodes.length === 10);
    assert.equal(retargeter.diagnostics.facialCaptureIncluded, false);
    assert(retargeter.diagnostics.bodyScale > .8 && retargeter.diagnostics.bodyScale < 1.3);
    assert(retargeter.diagnostics.alignment.every(Number.isFinite));
    for (let frame = 0; frame <= Math.ceil(motion.duration * 60); frame++) {
      retargeter.apply(frame / 60); root.updateMatrixWorld(true);
      for (const bone of Object.values(bones)) {
        assert(bone.matrixWorld.elements.every(Number.isFinite)); assert(Math.abs(bone.quaternion.length() - 1) < 1e-5);
      }
      const bodyUp = bones.Head.getWorldPosition(new THREE.Vector3()).sub(bones.Hips.getWorldPosition(new THREE.Vector3())).normalize();
      assert(bodyUp.angleTo(new THREE.Vector3(0, 1, 0)) < .35, 'every recorded frame must retain an upright target body');
      const faceForward = bones.Bip01_LEye.getWorldPosition(new THREE.Vector3()).add(bones.Bip01_REye.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5).sub(bones.Head.getWorldPosition(new THREE.Vector3()));
      faceForward.y = 0; assert(faceForward.normalize().angleTo(new THREE.Vector3(0, 0, 1)) < .6, 'target face must remain towards the viewer');
    }
    assert(retargeter.diagnostics.maxFingerDirectionError < .001, 'calibrated target segment directions must match source directions');
    console.log(JSON.stringify({id: motion.id, usableDuration: retargeter.diagnostics.usableDuration, bodyUpDegrees: retargeter.diagnostics.maxBodyUpAngle * 180 / Math.PI, faceForwardDegrees: retargeter.diagnostics.maxFaceForwardAngle * 180 / Math.PI, contactAdjustment: retargeter.diagnostics.maxContactWristAdjustment, preservedPairError: retargeter.diagnostics.maxPreservedContactPairError, reach: retargeter.diagnostics.maxReachError, palmAngle: retargeter.diagnostics.maxPalmAngleError, wristLocation: retargeter.diagnostics.maxWristLocationError, nearContactSeparation: retargeter.diagnostics.maxNearContactSeparationError, contact: retargeter.diagnostics.closestHandContact, chest: retargeter.diagnostics.closestChestPose}));
    assert(retargeter.diagnostics.maxReachError < .12, 'severe arm reach distortion must quarantine a clip');
    assert.equal(retargeter.diagnostics.linguisticStatus, 'pending');
    const hips = motion.tracks.find(track => track.node === 'Hips' && track.path === 'rotation');
    const reset = hips?.times.findIndex((time, index) => index > 0 && new THREE.Quaternion().fromArray(hips.values, (index - 1) * 4).angleTo(new THREE.Quaternion().fromArray(hips.values, index * 4)) > .8) ?? -1;
    assert.equal(retargeter.diagnostics.terminalResetExcluded, reset > 0, motion.id + ': exclusion must match an actual source discontinuity');
    if (reset > 0) {
      assert(hips.times[reset] >= motion.duration - .2, 'a reset inside the signing motion must be quarantined');
      assert.equal(retargeter.diagnostics.usableDuration, hips.times[reset - 1], 'the detected terminal reset must be excluded from runtime sampling');
    } else {
      assert.equal(retargeter.diagnostics.usableDuration, motion.duration, 'a continuous source recording must retain its complete duration');
    }
    assert(retargeter.diagnostics.maxPreservedContactPairError < .001, 'near-contact source pairs must be preserved after proportional IK');
  }
});
