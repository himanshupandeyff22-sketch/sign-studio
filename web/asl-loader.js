import * as THREE from 'three';
import {animationById,animations} from './vocabulary.mjs?v=20261019-4';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const world = node => node.getWorldPosition(V());
const worldQ = node => node.getWorldQuaternion(new THREE.Quaternion());
const finite = array => Array.isArray(array) && array.every(Number.isFinite);
const upperBody = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'LeftShoulder', 'RightShoulder'];
const fingers = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
export const MAX_RESEARCH_MOTION_BYTES = 4 * 1024 * 1024;

async function readMotionBytes(response, signal) {
  const tooLarge = () => Error('Research motion file is too large (maximum 4 MiB).');
  const declaredLength = Number(response.headers?.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RESEARCH_MOTION_BYTES) {
    await response.body?.cancel(); throw tooLarge();
  }
  // Bound transfer memory as bytes arrive. A missing or false Content-Length
  // must not allow a large response to be buffered before the size check.
  if (response.body?.getReader) {
    const reader = response.body.getReader(), chunks = []; let length = 0;
    try {
      while (true) {
        signal.throwIfAborted();
        const {done, value} = await reader.read();
        signal.throwIfAborted();
        if (done) break;
        length += value.byteLength;
        if (length > MAX_RESEARCH_MOTION_BYTES) { await reader.cancel(); throw tooLarge(); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
  }
  // Test doubles and older response implementations may not expose a reader.
  const bytes = await response.arrayBuffer(); signal.throwIfAborted();
  if (bytes.byteLength > MAX_RESEARCH_MOTION_BYTES) throw tooLarge();
  return bytes;
}

export function validateMotion(motion) {
  if (motion?.schema !== '3dlex-motion/1' || motion.signedLanguage!=='ASL' || !/^3dlex-[a-z][a-z0-9-]{0,63}$/.test(motion.id)) throw Error('Unrecognized ASL research motion.');
  if (motion.provenance?.license !== 'CC BY 4.0' || motion.review?.targetRetargetValidated !== false || motion.review?.defaultVocabularyEnabled !== false) throw Error('Research motion provenance or validation status is invalid.');
  if (!Number.isFinite(motion.duration) || motion.duration <= 0 || motion.duration > 30 || !Array.isArray(motion.nodes) || motion.nodes.length > 100 || !Array.isArray(motion.tracks) || motion.tracks.length > 180) throw Error('Research motion exceeds inspection bounds.');
  if (['meshes', 'materials', 'textures', 'images', 'buffers'].some(key => key in motion)) throw Error('Research file must contain motion only.');
  const names = new Set(motion.nodes.map(node => node.name));
  if (names.size !== motion.nodes.length) throw Error('Research rig contains duplicate nodes.');
  for (const node of motion.nodes) {
    if (!finite(node.position) || node.position.length !== 3 || !finite(node.quaternion) || node.quaternion.length !== 4 || !finite(node.scale) || node.scale.length !== 3 || node.scale.some(value => value <= 0) || (node.parent && !names.has(node.parent))) throw Error('Research rig has invalid transforms.');
    const visited = new Set([node.name]); let parent = node.parent;
    while (parent) { if (visited.has(parent)) throw Error('Research rig has cyclic parents.'); visited.add(parent); parent = motion.nodes.find(item => item.name === parent)?.parent; }
  }
  const tracks = new Set();
  for (const track of motion.tracks) {
    const width = {rotation: 4, translation: 3, scale: 3}[track.path];
    if (!width || !names.has(track.node) || !['LINEAR', 'STEP'].includes(track.interpolation) || !finite(track.times) || !finite(track.values) || !track.times.length || track.times.length > 2000 || track.values.length !== width * track.times.length || track.times.some((time, i) => time < 0 || time > motion.duration + 1e-5 || (i && time < track.times[i - 1]))) throw Error('Research motion has invalid keyframes.');
    const key = track.node + '.' + track.path; if (tracks.has(key)) throw Error('Duplicate research motion track.'); tracks.add(key);
    if (track.path === 'rotation') for (let i = 0; i < track.values.length; i += 4) if (Math.abs(Math.hypot(...track.values.slice(i, i + 4)) - 1) > .01) throw Error('Research quaternion is not normalized.');
  }
  for (const side of ['Left', 'Right']) {
    for (const part of ['Shoulder', 'Arm', 'ForeArm', 'Hand']) if (!names.has(side + part)) throw Error('Research arm chain is incomplete.');
    for (const finger of fingers) for (let segment = 1; segment <= 3; segment++) if (!tracks.has(side + 'Hand' + finger + segment + '.rotation')) throw Error('Research finger articulation is incomplete.');
  }
  if (!Array.isArray(motion.inverseBind) || motion.inverseBind.some(item => !names.has(item.node) || !finite(item.matrix) || item.matrix.length !== 16 || Math.abs(new THREE.Matrix4().fromArray(item.matrix).determinant()) < 1e-12)) throw Error('Research inverse-bind metadata is invalid.');
  return motion;
}

export async function loadResearchMotion(url, {signal} = {}) {
  const registration=animations.find(item=>item.motionUrl===url);
  if (!registration || !/^\/web\/assets\/asl\/[a-z0-9-]+\.motion\.json$/.test(url)) throw Error('Research motion URL is outside the bundled manifest.');
  const timeout = AbortSignal.timeout(15000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  requestSignal.throwIfAborted();
  const response = await fetch(url, {signal: requestSignal});
  if (!response.ok) throw Error('Research clip unavailable (HTTP ' + response.status + ').');
  const bytes = await readMotionBytes(response, requestSignal);
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(value=>value.toString(16).padStart(2,'0')).join('');
  if(hash!==registration.sha256)throw Error('Research motion content differs from its registered hash.');
  const motion=validateMotion(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
  if(motion.id!==registration.id||motion.signedLanguage!==registration.signLanguage)throw Error('Research motion identity/language differs from its manifest.');
  return motion;
}

function basis(x, y) {
  y = y.clone().normalize(); x = x.clone().addScaledVector(y, -x.dot(y));
  if (x.lengthSq() < 1e-8 || y.lengthSq() < .9) throw Error('Anatomical frame is degenerate.');
  x.normalize(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, x.clone().cross(y).normalize())).normalize();
}
function bodyBasis(nodes) {
  const up = world(nodes.Head).sub(world(nodes.Hips)).normalize();
  const eyeL = nodes.LeftEye || nodes.Bip01_LEye, eyeR = nodes.RightEye || nodes.Bip01_REye;
  if (!eyeL || !eyeR) throw Error('Source anatomical forward cannot be determined without eye landmarks.');
  const forward = world(eyeL).add(world(eyeR)).multiplyScalar(.5).sub(world(nodes.Head));
  forward.addScaledVector(up, -forward.dot(up)).normalize();
  const across = up.clone().cross(forward).normalize();
  if (across.dot(world(nodes.LeftArm).sub(world(nodes.RightArm))) < 0) throw Error('Research rig is reflected or has inconsistent left/right anatomy.');
  return basis(across, up);
}
function palmFrame(nodes, side, alignment = new THREE.Quaternion()) {
  const palmY = world(nodes[side + 'HandMiddle1']).sub(world(nodes[side + 'Hand'])).applyQuaternion(alignment);
  const across = world(nodes[side + 'HandIndex1']).sub(world(nodes[side + 'HandPinky1'])).applyQuaternion(alignment);
  return basis(across, palmY);
}
function segmentFrame(direction, palm, thumb) {
  const palmX = V(1, 0, 0).applyQuaternion(palm), palmZ = V(0, 0, 1).applyQuaternion(palm);
  let x = thumb ? palmZ.clone().cross(direction) : palmX;
  if (x.clone().addScaledVector(direction, -x.dot(direction)).lengthSq() < 1e-7) x = palmZ.clone().cross(direction);
  return basis(x, direction);
}
function setWorld(bone, quaternion) {
  bone.quaternion.copy(worldQ(bone.parent).invert().multiply(quaternion)).normalize(); bone.updateMatrixWorld(true);
}

export function createResearchRetargeter(input, target, targetRest) {
  const motion = validateMotion(input), source = {}, sourceRoot = new THREE.Group();
  for (const data of motion.nodes) { const node = new THREE.Object3D(); node.name = data.name; node.position.fromArray(data.position); node.quaternion.fromArray(data.quaternion).normalize(); node.scale.fromArray(data.scale); source[data.name] = node; }
  for (const data of motion.nodes) (data.parent ? source[data.parent] : sourceRoot).add(source[data.name]);
  const hipsTrack = motion.tracks.find(track => track.node === 'Hips' && track.path === 'rotation');
  let usableDuration = motion.duration;
  if (hipsTrack) for (let i = 1; i < hipsTrack.times.length; i++) {
    const jump = new THREE.Quaternion().fromArray(hipsTrack.values, (i - 1) * 4).angleTo(new THREE.Quaternion().fromArray(hipsTrack.values, i * 4));
    if (jump > .8) {
      if (hipsTrack.times[i] < motion.duration - .2) throw Error('Research clip quarantined: a large source actor-axis reset occurs inside the motion.');
      usableDuration = Math.min(usableDuration, hipsTrack.times[i - 1]); break;
    }
  }
  // FBX exports can store node defaults in a different actor orientation from
  // their animation keys. Calibrate against the actual first recorded pose,
  // not the unused static node pose, or the target inherits a large body tilt.
  for (const track of motion.tracks) {
    if (/Hand.*4$/.test(track.node)) continue;
    if (track.path === 'rotation') source[track.node].quaternion.fromArray(track.values, 0).normalize();
    else source[track.node][track.path === 'translation' ? 'position' : 'scale'].fromArray(track.values, 0);
  }
  sourceRoot.updateMatrixWorld(true);
  const initial = Object.fromEntries(Object.entries(target).map(([name, node]) => [name, {position: node.position.clone(), quaternion: node.quaternion.clone()}]));
  for (const [name, data] of Object.entries(targetRest)) { target[name].position.copy(data.position); target[name].quaternion.copy(data.quaternion); }
  target.Hips.parent.updateWorldMatrix(true, true);
  const sourceFrame = bodyBasis(source), targetFrame = bodyBasis(target), alignment = targetFrame.clone().multiply(sourceFrame.clone().invert());
  const sourceRestQ = Object.fromEntries(Object.entries(source).map(([name, node]) => [name, worldQ(node)]));
  const targetRestQ = Object.fromEntries(Object.entries(target).map(([name, node]) => [name, worldQ(node)]));
  const sourceHip = world(source.Hips), targetHip = world(target.Hips), localAxes = {}, palmOffsets = {}, fingerOffsets = {}, lengths = {};
  const sourceHeight = world(source.Head).distanceTo(sourceHip), targetHeight = world(target.Head).distanceTo(targetHip), bodyScale = targetHeight / sourceHeight;
  for (const side of ['Left', 'Right']) {
    const palm = palmFrame(target, side); palmOffsets[side] = palm.clone().invert().multiply(targetRestQ[side + 'Hand']);
    lengths[side] = [world(target[side + 'Arm']).distanceTo(world(target[side + 'ForeArm'])), world(target[side + 'ForeArm']).distanceTo(world(target[side + 'Hand']))];
    for (const part of ['Arm', 'ForeArm']) {
      const child = target[side + (part === 'Arm' ? 'ForeArm' : 'Hand')]; localAxes[side + part] = child.position.clone().normalize();
    }
    for (const finger of fingers) for (let segment = 1; segment <= 3; segment++) {
      const name = side + 'Hand' + finger + segment, child = target[side + 'Hand' + finger + (segment + 1)];
      if (!target[name]) throw Error('Target finger rig is incomplete.');
      const axis = child ? child.position.clone().normalize() : V(0, 1, 0); localAxes[name] = axis;
      const direction = axis.clone().applyQuaternion(targetRestQ[name]);
      fingerOffsets[name] = segmentFrame(direction, palm, finger === 'Thumb').invert().multiply(targetRestQ[name]);
    }
  }
  for (const [name, pose] of Object.entries(initial)) { target[name].position.copy(pose.position); target[name].quaternion.copy(pose.quaternion); }
  target.Hips.parent.updateWorldMatrix(true, true);
  const diagnostics = {id: motion.id, technicalStatus: 'pending-review', linguisticStatus: 'pending', calibrationPose: 'actual first animation keyframe', sourceFrame: sourceFrame.toArray(), targetFrame: targetFrame.toArray(), alignment: alignment.toArray(), bodyScale,
    excludedEndNodes: motion.nodes.filter(node => /Hand.*4$/.test(node.name)).map(node => node.name), ignoredTranslations: motion.tracks.filter(track => track.path === 'translation' && track.node !== 'Hips').map(track => track.node),
    facialCaptureIncluded: false, usableDuration, sourceDuration: motion.duration, terminalResetExcluded: usableDuration < motion.duration,
    maxReachError: 0, maxFingerDirectionError: 0, maxPalmAngleError: 0, maxWristLocationError: 0, maxBodyUpAngle: 0, maxSourceBodyUpAngle: 0, maxFaceForwardAngle: 0, maxContactWristAdjustment: 0, maxPreservedContactPairError: 0,
    maxNearContactSeparationError: 0, closestHandContact: null, closestChestPose: null,
    reasons: ['Retargeted handshape, location, contact and sense require fluent ASL review.', 'Source GLBs contain no facial capture.']};
  function sample(time) {
    const t = THREE.MathUtils.clamp(time, 0, usableDuration);
    for (const data of motion.nodes) { const node = source[data.name]; node.position.fromArray(data.position); node.quaternion.fromArray(data.quaternion); node.scale.fromArray(data.scale); }
    for (const track of motion.tracks) {
      // Outlying joint-4 nodes are not used for target deformation or framing.
      if (/Hand.*4$/.test(track.node)) continue;
      let high = track.times.findIndex(value => value >= t); if (high < 0) high = track.times.length - 1;
      const low = Math.max(0, high - 1), width = track.path === 'rotation' ? 4 : 3;
      const alpha = track.interpolation === 'STEP' || track.times[high] === track.times[low] ? 0 : THREE.MathUtils.clamp((t - track.times[low]) / (track.times[high] - track.times[low]), 0, 1);
      if (track.path === 'rotation') source[track.node].quaternion.fromArray(track.values, low * width).slerp(new THREE.Quaternion().fromArray(track.values, high * width), alpha).normalize();
      else source[track.node][track.path === 'translation' ? 'position' : 'scale'].fromArray(track.values, low * width).lerp(V().fromArray(track.values, high * width), alpha);
    }
    sourceRoot.updateMatrixWorld(true); return source;
  }
  function point(name, child, direction) {
    const reference = targetRestQ[name], bindAxis = child.position.clone().normalize().applyQuaternion(reference);
    setWorld(target[name], new THREE.Quaternion().setFromUnitVectors(bindAxis, direction.clone().normalize()).multiply(reference));
  }
  function apply(time, blend = 1) {
    sample(time);
    for (const [name, pose] of Object.entries(targetRest)) { target[name].position.copy(pose.position); target[name].quaternion.copy(pose.quaternion); }
    target.Hips.parent.updateWorldMatrix(true, true);
    const hipPosition = world(source.Hips).sub(sourceHip).applyQuaternion(alignment).multiplyScalar(bodyScale).add(targetHip);
    target.Hips.position.copy(target.Hips.parent.worldToLocal(hipPosition)); target.Hips.updateMatrixWorld(true);
    for (const name of upperBody) if (target[name] && source[name]) {
      const delta = worldQ(source[name]).multiply(sourceRestQ[name].clone().invert());
      setWorld(target[name], alignment.clone().multiply(delta).multiply(alignment.clone().invert()).multiply(targetRestQ[name]));
    }
    const sourceGoals = Object.fromEntries(['Left', 'Right'].map(side => [side, world(source[side + 'Hand']).sub(world(source.Head)).applyQuaternion(alignment).multiplyScalar(bodyScale).add(world(target.Head))]));
    const goals = {Left: sourceGoals.Left.clone(), Right: sourceGoals.Right.clone()};
    function solveSide(side, wrist) {
      const upper = target[side + 'Arm'], lower = target[side + 'ForeArm'], hand = target[side + 'Hand'];
      const shoulder = world(upper), direction = wrist.clone().sub(shoulder), [a, b] = lengths[side];
      const desiredDistance = direction.length(), distance = THREE.MathUtils.clamp(desiredDistance, Math.abs(a - b) + .02, a + b - .006); direction.normalize();
      diagnostics.maxReachError = Math.max(diagnostics.maxReachError, Math.abs(distance - desiredDistance));
      const cosine = THREE.MathUtils.clamp((a * a + distance * distance - b * b) / (2 * a * distance), -1, 1);
      const bend = world(source[side + 'ForeArm']).sub(world(source[side + 'Arm'])).applyQuaternion(alignment); bend.addScaledVector(direction, -bend.dot(direction));
      if (bend.lengthSq() < 1e-8) bend.set(side === 'Left' ? 1 : -1, -.7, .3).addScaledVector(direction, -bend.dot(direction));
      bend.normalize();
      const elbow = shoulder.clone().addScaledVector(direction, a * cosine).addScaledVector(bend, a * Math.sqrt(Math.max(0, 1 - cosine * cosine)));
      point(side + 'Arm', lower, elbow.clone().sub(shoulder)); point(side + 'ForeArm', hand, shoulder.clone().addScaledVector(direction, distance).sub(world(lower)));
      const palm = palmFrame(source, side, alignment); setWorld(hand, palm.clone().multiply(palmOffsets[side]));
      for (const finger of fingers) for (let segment = 1; segment <= 3; segment++) {
        const name = side + 'Hand' + finger + segment;
        const direction = V(0, 1, 0).applyQuaternion(worldQ(source[name])).applyQuaternion(alignment).normalize();
        setWorld(target[name], segmentFrame(direction, palm, finger === 'Thumb').multiply(fingerOffsets[name]));
        const actual = localAxes[name].clone().applyQuaternion(worldQ(target[name]));
        diagnostics.maxFingerDirectionError = Math.max(diagnostics.maxFingerDirectionError, actual.angleTo(direction));
      }
      diagnostics.maxPalmAngleError = Math.max(diagnostics.maxPalmAngleError, palm.angleTo(palmFrame(target, side)));
    }
    for (const side of ['Left', 'Right']) solveSide(side, goals[side]);
    const handLandmarks = (nodes, side) => ['Hand', 'HandIndex1', 'HandMiddle1', 'HandThumb3', 'HandMiddle3'].map(part => world(nodes[side + part]));
    const sourceLeft = handLandmarks(source, 'Left'), sourceRight = handLandmarks(source, 'Right');
    let sourceGap = Infinity, targetGap = Infinity, pairLeft = 0, pairRight = 0;
    for (let i = 0; i < sourceLeft.length; i++) for (let j = 0; j < sourceRight.length; j++) {
      const gap = sourceLeft[i].distanceTo(sourceRight[j]) * bodyScale;
      if (gap < sourceGap) { sourceGap = gap; pairLeft = i; pairRight = j; }
    }
    // Preserve the recorded near-contact landmark pair despite different hand
    // sizes. Symmetric wrist IK correction retains the source pair vector,
    // handshape and palm orientation; it adds no new gesture or contact event.
    const contactWeight = 1 - THREE.MathUtils.smoothstep(sourceGap, .055, .11);
    if (contactWeight > 0) for (let iteration = 0; iteration < 3; iteration++) {
      const actual = handLandmarks(target, 'Left')[pairLeft].sub(handLandmarks(target, 'Right')[pairRight]);
      const expected = sourceLeft[pairLeft].clone().sub(sourceRight[pairRight]).applyQuaternion(alignment).multiplyScalar(bodyScale);
      const correction = expected.sub(actual).multiplyScalar(contactWeight * .5);
      if (correction.length() > .06) throw Error('Research clip quarantined: source contact requires excessive target wrist correction.');
      goals.Left.add(correction); goals.Right.sub(correction);
      for (const side of ['Left', 'Right']) solveSide(side, goals[side]);
    }
    for (const side of ['Left', 'Right']) {
      diagnostics.maxContactWristAdjustment = Math.max(diagnostics.maxContactWristAdjustment, goals[side].distanceTo(sourceGoals[side]));
      diagnostics.maxWristLocationError = Math.max(diagnostics.maxWristLocationError, world(target[side + 'Hand']).distanceTo(sourceGoals[side]));
    }
    const targetLeft = handLandmarks(target, 'Left'), targetRight = handLandmarks(target, 'Right');
    if (sourceGap < .055) diagnostics.maxPreservedContactPairError = Math.max(diagnostics.maxPreservedContactPairError, Math.abs(sourceGap - targetLeft[pairLeft].distanceTo(targetRight[pairRight])));
    for (const a of targetLeft) for (const b of targetRight) targetGap = Math.min(targetGap, a.distanceTo(b));
    if (sourceGap < .10) diagnostics.maxNearContactSeparationError = Math.max(diagnostics.maxNearContactSeparationError, Math.abs(sourceGap - targetGap));
    if (!diagnostics.closestHandContact || sourceGap < diagnostics.closestHandContact.sourceGap) diagnostics.closestHandContact = {time, sourceGap, targetGap, separationError: Math.abs(sourceGap - targetGap), measurement: 'nearest wrist/knuckle/distal-joint landmarks; not skin contact'};
    const sourceChest = world(source.Spine2), targetChest = world(target.Spine2);
    const sourceChestDistance = (world(source.LeftHand).distanceTo(sourceChest) + world(source.RightHand).distanceTo(sourceChest)) * bodyScale / 2;
    const targetChestDistance = (world(target.LeftHand).distanceTo(targetChest) + world(target.RightHand).distanceTo(targetChest)) / 2;
    if (!diagnostics.closestChestPose || sourceChestDistance < diagnostics.closestChestPose.sourceDistance) diagnostics.closestChestPose = {time, sourceDistance: sourceChestDistance, targetDistance: targetChestDistance, distanceError: Math.abs(sourceChestDistance - targetChestDistance), measurement: 'mean wrist distance to Spine2; not chest skin contact'};
    const upright = V(0, 1, 0).applyQuaternion(targetFrame);
    diagnostics.maxBodyUpAngle = Math.max(diagnostics.maxBodyUpAngle, world(target.Head).sub(world(target.Hips)).normalize().angleTo(upright));
    diagnostics.maxSourceBodyUpAngle = Math.max(diagnostics.maxSourceBodyUpAngle, world(source.Head).sub(world(source.Hips)).normalize().applyQuaternion(alignment).angleTo(upright));
    const faceForward = world(target.LeftEye || target.Bip01_LEye).add(world(target.RightEye || target.Bip01_REye)).multiplyScalar(.5).sub(world(target.Head));
    faceForward.addScaledVector(upright, -faceForward.dot(upright)).normalize();
    diagnostics.maxFaceForwardAngle = Math.max(diagnostics.maxFaceForwardAngle, faceForward.angleTo(V(0, 0, 1).applyQuaternion(targetFrame)));
    if (diagnostics.maxBodyUpAngle > .35 || diagnostics.maxSourceBodyUpAngle > .35) throw Error('Research clip quarantined: source/target body orientation exceeds the upright lexical-preview bounds.');
    if (diagnostics.maxFaceForwardAngle > .6) throw Error('Research clip quarantined: face turns outside the frontal lexical-preview bounds.');
    const weight = THREE.MathUtils.clamp(blend, 0, 1);
    if (weight < 1) for (const [name, pose] of Object.entries(targetRest)) { target[name].position.lerp(pose.position, 1 - weight); target[name].quaternion.slerp(pose.quaternion, 1 - weight); }
    target.Hips.parent.updateWorldMatrix(true, true);
    for (const node of Object.values(target)) if (!node.quaternion.toArray().every(Number.isFinite) || !node.position.toArray().every(Number.isFinite)) throw Error('Research retarget produced a non-finite transform.');
    return diagnostics;
  }
  return {motion, diagnostics, sample, apply};
}
