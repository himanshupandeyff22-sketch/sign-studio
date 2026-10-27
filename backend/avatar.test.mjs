import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {animationById,animations} from '../web/vocabulary.mjs';
import {loadResearchMotion, createResearchRetargeter, MAX_RESEARCH_MOTION_BYTES} from '../web/asl-loader.js';

const source = fs.readFileSync(new URL('../web/avatar.js', import.meta.url), 'utf8');
const modelPath = source.match(/loadAsync\('([^']+\.glb)'\s*[,)]/)?.[1];
assert(modelPath, 'the player must load a bundled GLB');
const binary = fs.readFileSync(new URL('..' + modelPath, import.meta.url));
const gltf = JSON.parse(binary.subarray(20, 20 + binary.readUInt32LE(12)));
const binaryStart = 20 + binary.readUInt32LE(12) + 8;
function accessorAttribute(index) {
  const accessor = gltf.accessors[index], view = gltf.bufferViews[accessor.bufferView];
  assert(!view.byteStride && !accessor.sparse, 'test decoder expects packed accessors');
  const Constructor = {5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array}[accessor.componentType];
  const components = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16}[accessor.type];
  const start = binaryStart + (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const copy = Uint8Array.from(binary.subarray(start, start + accessor.count * components * Constructor.BYTES_PER_ELEMENT));
  return new THREE.BufferAttribute(new Constructor(copy.buffer), components, accessor.normalized || false);
}

test('bundled human model has licensed provenance and a complete articulated rig', () => {
  const joints = new Set(gltf.skins.flatMap(skin => skin.joints.map(index => gltf.nodes[index].name)));
  for (const side of ['Left', 'Right']) {
    for (const joint of ['Shoulder', 'Arm', 'ForeArm', 'Hand']) assert(joints.has(side + joint));
    for (const finger of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) for (let segment = 1; segment <= 3; segment++) assert(joints.has(side + 'Hand' + finger + segment));
  }
  assert(gltf.meshes.some(mesh => mesh.extras?.targetNames?.includes('eyeBlinkLeft')));
  assert(gltf.materials.some(material => material.pbrMetallicRoughness?.baseColorTexture));
  assert.match(fs.readFileSync(new URL('../web/assets/AARAV-LICENSE.md', import.meta.url), 'utf8'), /MIT|Permission is hereby granted/);
  assert.match(fs.readFileSync(new URL('../web/assets/AARAV-SOURCE.md', import.meta.url), 'utf8'), /microsoft\/Microsoft-Rocketbox/);
});

test('research motion requests cancel, report missing assets and retry without poisoned cache', async () => {
  const originalFetch = globalThis.fetch, registration = animations[0];
  try {
    let observedSignal;
    globalThis.fetch = async (url, {signal}) => {
      observedSignal = signal;
      return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), {once: true}));
    };
    const controller = new AbortController();
    const pending = loadResearchMotion(registration.motionUrl, {signal: controller.signal});
    assert(observedSignal instanceof AbortSignal, 'the caller signal must reach the network request');
    controller.abort();
    await assert.rejects(pending, {name: 'AbortError'});
    assert(observedSignal.aborted);
    for (const status of [404, 503]) {
      globalThis.fetch = async () => ({ok: false, status});
      await assert.rejects(loadResearchMotion(registration.motionUrl), new RegExp('HTTP ' + status));
    }
    globalThis.fetch = async () => ({ok: true, arrayBuffer: async () => {
      const bytes = fs.readFileSync(new URL('..' + registration.motionUrl, import.meta.url));
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }});
    assert.equal((await loadResearchMotion(registration.motionUrl)).id, registration.id, 'an aborted or failed download must not poison a subsequent retry');
  } finally { globalThis.fetch = originalFetch; }
});

test('research motion transfer accepts the largest pinned recording and bounds declared and streamed bytes', async () => {
  const originalFetch = globalThis.fetch;
  try {
    const largest = animations.map(registration => ({registration, size: fs.statSync(new URL('..' + registration.motionUrl, import.meta.url)).size})).sort((a, b) => b.size - a.size)[0];
    largest.bytes = fs.readFileSync(new URL('..' + largest.registration.motionUrl, import.meta.url));
    assert(largest.bytes.byteLength > 2 * 1024 * 1024 && largest.bytes.byteLength <= MAX_RESEARCH_MOTION_BYTES, 'the larger licensed library recording must remain within the explicit 4 MiB budget');
    globalThis.fetch = async () => new Response(largest.bytes, {headers: {'Content-Length': String(largest.bytes.byteLength)}});
    assert.equal((await loadResearchMotion(largest.registration.motionUrl)).id, largest.registration.id, 'the largest real recording must pass streaming, pinned-hash and motion validation');
    let cancelled = false;
    globalThis.fetch = async () => new Response(new ReadableStream({cancel() { cancelled = true; }}), {headers: {'Content-Length': String(MAX_RESEARCH_MOTION_BYTES + 1)}});
    await assert.rejects(loadResearchMotion(largest.registration.motionUrl), /too large.*4 MiB/);
    assert(cancelled, 'an oversized declared response must be cancelled without consuming its body');
    for (const declaredLength of [null, '1']) {
      cancelled = false;
      const chunk = new Uint8Array(1024 * 1024); let sent = 0;
      globalThis.fetch = async () => new Response(new ReadableStream({
        pull(controller) { controller.enqueue(chunk); if (++sent === 5) controller.close(); },
        cancel() { cancelled = true; }
      }), declaredLength === null ? undefined : {headers: {'Content-Length': declaredLength}});
      await assert.rejects(loadResearchMotion(largest.registration.motionUrl), /too large.*4 MiB/);
      assert(cancelled || sent === 5, 'stream transfer must terminate at the byte limit even without a trustworthy size header');
    }
  } finally { globalThis.fetch = originalFetch; }
});

// Exercise the actual bundled bone hierarchy and player against a deterministic
// frame clock. Real WebGL material appearance is checked separately in browser.
test('queued human playback frames face, both hands and fingertips on desktop/mobile and cleans up', async () => {
  const jointIndices = new Set(gltf.skins.flatMap(skin => skin.joints));
  const nodes = gltf.nodes.map((data, index) => {
    const node = jointIndices.has(index) ? new THREE.Bone() : new THREE.Object3D();
    node.name = THREE.PropertyBinding.sanitizeNodeName(data.name || '');
    if (data.translation) node.position.fromArray(data.translation);
    if (data.rotation) node.quaternion.fromArray(data.rotation);
    if (data.scale) node.scale.fromArray(data.scale);
    return node;
  });
  gltf.nodes.forEach((data, index) => data.children?.forEach(child => nodes[index].add(nodes[child])));
  const model = new THREE.Group();
  gltf.scenes[gltf.scene || 0].nodes.forEach(index => model.add(nodes[index]));
  const skeletons = gltf.skins.map(skin => {
    const matrices = accessorAttribute(skin.inverseBindMatrices).array;
    return new THREE.Skeleton(skin.joints.map(index => nodes[index]), skin.joints.map((_, index) => new THREE.Matrix4().fromArray(matrices, index * 16)));
  });
  const skinSamples = [];
  gltf.nodes.forEach((data, index) => {
    if (data.mesh === undefined) return;
    const meshData = gltf.meshes[data.mesh];
    for (const primitive of meshData.primitives) {
      const accessor = gltf.accessors[primitive.attributes.POSITION], geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', accessorAttribute(primitive.attributes.POSITION));
      geometry.setAttribute('skinIndex', accessorAttribute(primitive.attributes.JOINTS_0));
      geometry.setAttribute('skinWeight', accessorAttribute(primitive.attributes.WEIGHTS_0));
      geometry.boundingBox = new THREE.Box3(new THREE.Vector3().fromArray(accessor.min), new THREE.Vector3().fromArray(accessor.max));
      const material = new THREE.MeshStandardMaterial();
      material.name = gltf.materials[primitive.material]?.name || '';
      const mesh = new THREE.SkinnedMesh(geometry, material);
      mesh.bind(skeletons[data.skin], new THREE.Matrix4());
      const skinIndex = geometry.getAttribute('skinIndex'), skinWeight = geometry.getAttribute('skinWeight');
      const candidates = [];
      for (let vertex = 0; vertex < skinIndex.count; vertex++) {
        const names = [0, 1, 2, 3].filter(component => skinWeight.array[vertex * 4 + component] > .2).map(component => mesh.skeleton.bones[skinIndex.array[vertex * 4 + component]].name);
        if (names.some(name => /Hand|^Head$|Eye|Mouth|Nose/.test(name))) candidates.push(vertex);
      }
      // Sample real skin-weighted vertices as well as joints; viewport safety
      // must include the rendered skin around fingertips and the whole face.
      for (let sample = 0; sample < Math.min(32, candidates.length); sample++) skinSamples.push({mesh, vertex: candidates[Math.floor(sample * candidates.length / Math.min(32, candidates.length))]});
      if (meshData.extras?.targetNames) {
        mesh.morphTargetDictionary = Object.fromEntries(meshData.extras.targetNames.map((name, target) => [name, target]));
        mesh.morphTargetInfluences = meshData.extras.targetNames.map(() => 0);
      }
      nodes[index].add(mesh);
    }
  });
  const boneByName = Object.fromEntries(nodes.filter(node => node.isBone).map(node => [node.name, node]));
  const originalRigRest = Object.fromEntries(Object.entries(boneByName).map(([name, bone]) => [name, {position: bone.position.clone(), quaternion: bone.quaternion.clone()}]));
  const rightIndexRest = boneByName.RightHandIndex1.quaternion.clone();
  let now = 0, rafId = 0, renderCount = 0, disposeCount = 0, transformChecks = 0;
  const pendingFrames = new Map(), observers = [], rendererEvents = new Map(), finishes = [], steps = [], reports = [];
  const replacementGlobals = {
    document: {hidden: false}, devicePixelRatio: 1, performance: {now: () => now}, matchMedia: () => ({matches: false}),
    fetch: async url => ({ok: true, arrayBuffer: async () => {const b=fs.readFileSync(new URL('..'+url,import.meta.url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}}),
    requestAnimationFrame: fn => { const id = ++rafId; pendingFrames.set(id, fn); return id; },
    cancelAnimationFrame: id => pendingFrames.delete(id),
    ResizeObserver: class { constructor(fn) { this.fn = fn; observers.push(this); } observe() { this.fn(); } disconnect() { this.disconnected = true; } }
  };
  const originalGlobals = Object.fromEntries(Object.keys(replacementGlobals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(replacementGlobals)) Object.defineProperty(globalThis, key, {value, configurable: true, writable: true});
  class TestRenderer {
    constructor() { this.shadowMap = {}; this.capabilities = {getMaxAnisotropy: () => 4}; this.domElement = {setAttribute() {}, addEventListener(name, fn) { rendererEvents.set(name, fn); }, removeEventListener(name) { rendererEvents.delete(name); }, remove() {}}; }
    setPixelRatio() {} setSize() {}
    render(scene, camera) {
      renderCount++; scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
      assert(camera.projectionMatrix.elements.every(Number.isFinite), 'narrow stages must preserve valid projection');
      scene.traverse(node => {
        if (!node.isBone) return;
        assert(node.quaternion.toArray().every(Number.isFinite), node.name + ' orientation must remain finite');
        assert(Math.abs(node.quaternion.length() - 1) < 1e-5, node.name + ' orientation must remain normalized');
        assert(node.matrixWorld.elements.every(Number.isFinite), node.name + ' world transform must remain finite');
        transformChecks++;
        if (!/Hand|Shoulder|ForeArm|^Head$|Eye|Eyebrow|Mouth|Nose/.test(node.name)) return;
        const points = [node.getWorldPosition(new THREE.Vector3())];
        if (/Hand(?:Thumb|Index|Middle|Ring|Pinky)3$/.test(node.name)) points.push(node.localToWorld(new THREE.Vector3(0, node.position.length() * .7, 0)));
        for (const world of points) {
          const point = world.project(camera);
          assert(point.toArray().every(Number.isFinite));
          assert(Math.abs(point.x) <= .92 && Math.abs(point.y) <= .92 && point.z > -1 && point.z < 1, `${node.name} must stay inside safe signing space (${point.toArray()})`);
        }
      });
      for (const {mesh, vertex} of skinSamples) {
        const point = mesh.getVertexPosition(vertex, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld).project(camera);
        assert(point.toArray().every(Number.isFinite), 'skin deformation must remain finite');
        assert(Math.abs(point.x) <= .97 && Math.abs(point.y) <= .97 && point.z > -1 && point.z < 1, 'visible hand/face skin must remain framed');
      }
    }
    dispose() { disposeCount++; } forceContextLoss() {}
  }
  class TestLoader { async loadAsync() { return {scene: model}; } }
  const playerSource = source.replace(/^import.*;\r?\n/gm, '').replace('export async function', 'async function');
  const create = new Function('THREE', 'GLTFLoader', 'loadResearchMotion', 'createResearchRetargeter','animationById', playerSource + '\nreturn createAvatar;')({...THREE, WebGLRenderer: TestRenderer}, TestLoader, loadResearchMotion, createResearchRetargeter,animationById);
  let avatar;const graphicsStates=[];
  const stage = {clientWidth: 0, clientHeight: 0, appendChild() {}};
  function advance(seconds) {
    for (let frame = 0; frame < Math.ceil(seconds * 60); frame++) {
      now += 1000 / 60;
      const callbacks = [...pendingFrames.values()]; pendingFrames.clear(); callbacks.forEach(fn => fn(now));
    }
  }
  try {
    avatar = await create(stage, {onFinish: event => finishes.push(event), onStep: (index, item) => steps.push({index, id: item.id}), onProgress: state => reports.push(state),onRenderState:state=>graphicsStates.push(state.status)});
    assert.equal(avatar.seek(1), false, 'an empty player must reject seeking without creating a queue');
    advance(.1); assert.equal(renderCount, 0, 'hidden startup should succeed without rendering');
    avatar.setLanguage({color: '#568a73', skin: '#cfa480', hair: '#423930'});
    let clothVertices = 0, handVertices = 0;
    model.traverse(mesh => {
      if (!mesh.isSkinnedMesh) return;
      assert.equal(mesh.material.metalness, 0, 'skin, fabric and hair must remain dielectric');
      if (mesh.material.name === 'm006_opacity') {
        assert.equal(mesh.material.transparent, false, 'overlapping hair cards must use stable cutouts');
        assert(mesh.material.alphaTest > 0 && mesh.material.alphaToCoverage);
      }
      if (mesh.material.name !== 'm006_body') return;
      const indices = mesh.geometry.getAttribute('skinIndex'), weights = mesh.geometry.getAttribute('skinWeight'), cloth = mesh.geometry.getAttribute('avatarCloth');
      assert.equal(cloth.count, indices.count);
      for (let vertex = 0; vertex < cloth.count; vertex++) {
        assert(cloth.array[vertex] >= 0 && cloth.array[vertex] <= 1);
        if (cloth.array[vertex] > .5) clothVertices++;
        const handWeight = [0, 1, 2, 3].reduce((sum, component) => sum + (/Hand/.test(mesh.skeleton.bones[indices.array[vertex * 4 + component]].name) ? weights.array[vertex * 4 + component] : 0), 0);
        if (handWeight > .001) { handVertices++; assert.equal(cloth.array[vertex], 0, 'clothing recolour must never affect skin weighted to hands'); }
      }
      const shader = {uniforms: {}, vertexShader: '#include <begin_vertex>', fragmentShader: '#include <map_fragment>'};
      mesh.material.onBeforeCompile(shader);
      assert.match(shader.vertexShader, /clothRegion = avatarCloth/);
      assert.doesNotMatch(shader.fragmentShader, /colorwayHeight|smoothstep\(0\.16/);
    });
    assert(clothVertices > 50 && handVertices > 50, 'the inspected atlas must separate actual clothing and hand vertices');
    const motions = ['hello', 'thanks', 'yes', 'no', 'help', 'love', 'talk'];
    for (const [width, height] of [[720, 560], [360, 380], [150, 385]]) {
      stage.clientWidth = width; stage.clientHeight = height; observers[0].fn();
      for (const id of motions) {
        const before = finishes.length; avatar.play([{id, duration: 1}]); advance(1.15);
        assert.equal(finishes.length, before + 1, id + ' must finish at ' + width + 'px');
        assert.equal(finishes.at(-1).reason, 'completed'); assert.equal(avatar.getState().progress, 1);
      }
    }
    avatar.play([{id: 'yes', duration: 2}]); advance(.8);
    const rightCurl = rightIndexRest.clone().invert().multiply(boneByName.RightHandIndex1.quaternion);
    assert(rightCurl.x < 0, 'right finger flexion must use its mirrored axis');
    avatar.pause(); avatar.pause(); const paused = avatar.getState(); const beforePause = renderCount;
    advance(3); assert.equal(avatar.getState().elapsed, paused.elapsed, 'playback pause must freeze its clock');
    assert(renderCount > beforePause, 'playback pause must preserve a visible renderer');
    assert.equal(avatar.getState().state, 'paused');
    avatar.suspend(); avatar.suspend(); const beforeSuspend = renderCount;
    advance(8); assert.equal(renderCount, beforeSuspend, 'visibility suspension must stop rendering');
    avatar.wake(); avatar.wake(); assert.equal(pendingFrames.size, 1, 'repeated wake must keep one frame loop');
    advance(.1); assert.equal(avatar.getState().state, 'paused', 'restoring visibility must not undo user pause');
    avatar.resume(); avatar.resume(); advance(1.4); assert.equal(avatar.getState().state, 'completed');
    const queue = motions.slice(0, 6).map(id => ({id, duration: .8}));
    steps.length = 0; reports.length = 0; avatar.play(queue); advance(5);
    assert.deepEqual(steps.map(step => step.id), motions.slice(0, 6), 'ordered playback must preserve all clips');
    assert(reports.every((state, index) => index === 0 || state.progress >= reports[index - 1].progress), 'queue progress must be monotonic');
    avatar.replay(); advance(.4); avatar.stop(); assert.equal(finishes.at(-1).reason, 'stopped'); assert.equal(avatar.getState().state, 'idle');
    avatar.replay(); assert.equal(avatar.getState().length, 6, 'stop must retain the last queue for replay');
    for (let repeat = 0; repeat < 10; repeat++) { avatar.play([{id: 'hello', duration: .8}]); advance(.03); }
    assert.equal(pendingFrames.size, 1, 'repeated submissions must reuse one frame loop');
    const longQueue = Array.from({length: 500}, (_, index) => ({id: motions[index % 6], duration: .8}));
    avatar.setSpeed(3); avatar.play(longQueue); advance(134);
    assert.equal(avatar.getState().progress, 1); assert.equal(avatar.getState().length, 500, 'player must retain and complete 500 mapped words');
    assert.throws(() => avatar.play([{id: 'unavailable'}]), /without an available.*animation/);
    const researchQueue = animations.map(a=>({id:a.id,motionUrl:a.motionUrl,duration:a.duration}));
    assert.throws(() => avatar.play(researchQueue), /prepared animation/, 'research motions must require explicit preparation');
    const diagnostics = await avatar.prepare(researchQueue); assert.equal(diagnostics.length, animations.length);
    assert(diagnostics.every(item => item.technicalStatus === 'previewable-unverified' && item.linguisticStatus === 'pending'));
    const firstMotionData = await loadResearchMotion(researchQueue[0].motionUrl);
    const expectedRetargeter = createResearchRetargeter(firstMotionData, boneByName, originalRigRest);
    const inspectionQueue = researchQueue.slice(0, 3), clipSeconds = inspectionQueue.map(clip => clip.duration);
    stage.clientWidth = 360; stage.clientHeight = 380; observers[0].fn();
    avatar.setSpeed(1); avatar.play(inspectionQueue.map((clip, index) => index ? clip : {...clip, duration: .01})); avatar.pause();
    assert.equal(avatar.getState().totalDuration, clipSeconds.reduce((sum, seconds) => sum + seconds, 0), 'caller metadata must not truncate a registered recording');
    const finishesBeforeSeek = finishes.length, renderBeforeSeek = renderCount;
    assert.equal(avatar.seek(-5), true); assert.equal(avatar.getState().queueElapsed, 0); assert.equal(avatar.getState().index, 0);
    assert.equal(avatar.seek(NaN), false); assert.equal(avatar.getState().queueElapsed, 0);
    const midpoint = clipSeconds[0] / 2;
    avatar.seek(midpoint); assert.equal(avatar.getState().state, 'paused'); assert.equal(avatar.getState().elapsed, midpoint);
    assert(renderCount > renderBeforeSeek, 'paused seeking must render its pose immediately');
    const inspectedHand = boneByName.RightHand.getWorldPosition(new THREE.Vector3()), inspectedFinger = boneByName.RightHandIndex1.getWorldQuaternion(new THREE.Quaternion());
    advance(.6); assert.equal(avatar.getState().queueElapsed, midpoint);
    assert(inspectedHand.distanceTo(boneByName.RightHand.getWorldPosition(new THREE.Vector3())) < 1e-9, 'a sought paused recording must hold its wrist pose');
    assert(inspectedFinger.angleTo(boneByName.RightHandIndex1.getWorldQuaternion(new THREE.Quaternion())) < 1e-7, 'a sought paused recording must hold its finger pose');
    // At the clip's start/end, rendering must equal the source retargeter rather
    // than an artificial fade to rest. Facial capture is absent, so no idle or
    // sinusoidal smile/brow/lip movement may be overlaid during a recording.
    for (const time of [.02, Math.max(.03, clipSeconds[0] - .02)]) {
      avatar.seek(time);
      const observed = Object.fromEntries(Object.entries(boneByName).map(([name, bone]) => [name, bone.quaternion.clone()]));
      expectedRetargeter.apply(time, 1);
      for (const name of ['RightHand', 'LeftHand', 'RightHandIndex1', 'LeftHandThumb2']) assert(observed[name].angleTo(boneByName[name].quaternion) < 1e-6, name + ' must preserve full source poses without start/end fading');
      model.traverse(mesh => { if (mesh.morphTargetInfluences) assert(mesh.morphTargetInfluences.every(value => value === 0), 'recordings without facial capture must retain a neutral face'); });
    }
    avatar.seek(clipSeconds[0]); assert.equal(avatar.getState().index, 1); assert.equal(avatar.getState().elapsed, 0, 'an exact clip boundary must select the following clip');
    avatar.seek(clipSeconds[0] + clipSeconds[1] + .2); assert.equal(avatar.getState().index, 2); assert(Math.abs(avatar.getState().elapsed - .2) < 1e-9);
    assert.equal(steps.at(-1).id, inspectionQueue[2].id, 'seeking across clips must report the current motion');
    const fullDuration = clipSeconds.reduce((sum, value) => sum + value, 0);
    avatar.seek(fullDuration + 30); assert.equal(avatar.getState().state, 'completed'); assert.equal(avatar.getState().progress, 1); assert.equal(avatar.getState().index, 2);
    assert.equal(avatar.getState().item.id, inspectionQueue[2].id); assert.equal(avatar.getState().elapsed, clipSeconds[2]);
    advance(.3); assert.equal(avatar.getState().queueElapsed, fullDuration); assert.equal(finishes.length, finishesBeforeSeek, 'manual seeking must not emit a natural playback-completion event');
    avatar.seek(midpoint); assert.equal(avatar.getState().state, 'paused', 'seeking back from completion must remain paused');
    avatar.resume(); avatar.seek(.25); assert.equal(avatar.getState().state, 'playing', 'keyboard-style seeking must preserve active playback');
    const runningPosition = avatar.getState().queueElapsed; advance(.1); assert(avatar.getState().queueElapsed > runningPosition);
    avatar.pause(); avatar.suspend(); const seekHiddenRenderCount = renderCount;
    avatar.seek(clipSeconds[0] + .4); assert.equal(renderCount, seekHiddenRenderCount, 'a suspended stage must not render during seeking');
    assert.equal(avatar.getState().index, 1); assert.equal(pendingFrames.size, 0);
    avatar.wake(); assert.equal(pendingFrames.size, 1); advance(.1); assert.equal(avatar.getState().state, 'paused');
    rendererEvents.get('webglcontextlost')({preventDefault() {}}); const lostRenderCount = renderCount;
    avatar.seek(midpoint); assert.equal(renderCount, lostRenderCount, 'context loss must suppress immediate seek rendering');
    rendererEvents.get('webglcontextrestored')(); advance(.1); assert.equal(avatar.getState().state, 'paused');
    assert.equal(avatar.getState().queueElapsed, midpoint);
    stage.clientWidth = stage.clientHeight = 0; observers[0].fn(); const noViewportRenderCount = renderCount;
    avatar.seek(.3); assert.equal(renderCount, noViewportRenderCount, 'zero-sized stages must not render during seeking');
    stage.clientWidth = 720; stage.clientHeight = 560; observers[0].fn(); advance(.1);
    avatar.stop(); assert.equal(avatar.seek(1), false, 'stopped queues must be replayed before seeking');
    avatar.replay(); assert.equal(avatar.getState().queueElapsed, 0); assert.equal(avatar.getState().length, inspectionQueue.length);
    assert.equal(pendingFrames.size, 1, 'repeated seeks, wake and replay must retain one frame loop');
    for (const [width, height] of [[720, 560], [360, 380]]) {
      stage.clientWidth = width; stage.clientHeight = height; observers[0].fn(); avatar.setSpeed(1);
      for (const clip of researchQueue) { await avatar.prepare([clip]); avatar.play([clip]); advance(clip.duration + .15); assert.equal(finishes.at(-1).reason, 'completed'); }
    }
    assert(avatar.researchDiagnostics().length <= 40, 'completed unrelated inspections must have a bounded motion cache');
    const aborted = new AbortController(); aborted.abort();
    await assert.rejects(avatar.prepare([researchQueue[0]], {signal: aborted.signal}), {name: 'AbortError'});
    await avatar.prepare([researchQueue[0]]); avatar.play([researchQueue[0]]); advance(.1);
    assert.equal(avatar.getState().state, 'playing', 'retrying the same asset after an abort must work');
    await assert.rejects(avatar.prepare([{id: '3dlex-hello', motionUrl: '/web/assets/asl/hello.motion.json'}]), /invalid/);
    avatar.play([]); assert.equal(finishes.at(-1).reason, 'empty');
    avatar.play([{id: 'hello', duration: 2}]); advance(.1);
    rendererEvents.get('webglcontextlost')({preventDefault() {}}); const contextElapsed = avatar.getState().elapsed;
    advance(1); assert.equal(avatar.getState().elapsed, contextElapsed);
    assert.equal(graphicsStates.at(-1),'lost');avatar.wake();advance(.1);assert.equal(avatar.getState().elapsed,contextElapsed,'wake cannot resume a lost graphics context');
    rendererEvents.get('webglcontextrestored')(); advance(.1); assert.equal(graphicsStates.at(-1),'restored');assert.equal(avatar.getState().elapsed, contextElapsed, 'graphics recovery must wait for explicit resume');
    avatar.resume(); advance(.1); assert(avatar.getState().elapsed > contextElapsed);
    stage.clientWidth = stage.clientHeight = 0; observers[0].fn(); advance(.1);
    stage.clientWidth = 500; stage.clientHeight = 390; observers[0].fn(); advance(.1);
    avatar.dispose(); avatar.dispose(); assert.equal(disposeCount, 1); assert.equal(pendingFrames.size, 0);
    assert.equal(avatar.seek(1), false, 'disposed players must reject seeking');
    assert.equal(rendererEvents.size, 0); assert(observers[0].disconnected); assert.equal(avatar.getState().state, 'disposed');
    assert(transformChecks > 100000, 'all animation frames must exercise the real bone hierarchy');
  } finally {
    avatar?.dispose();
    for (const [key, descriptor] of Object.entries(originalGlobals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
});
