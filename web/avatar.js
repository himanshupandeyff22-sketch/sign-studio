import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {loadResearchMotion, createResearchRetargeter} from './asl-loader.js?v=20261019-4';
import {animationById} from './vocabulary.mjs?v=20261019-4';

export async function createAvatar(container, {onFinish, onStep, onProgress, onRenderState} = {}) {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .05, 30);
  camera.position.set(0, 1.3, 3.3); camera.lookAt(0, 1.3, 0);
  let renderer, model, observer, scalpMesh, animationFrame = null, disposed = false, suspended = false, playbackPaused = false, hasViewport = false;
  const materials = [], geometries = new Set(), textures = new Set();
  const bones = {}, rest = {}, reference = {}, faceMeshes = [], shirtColor = {value: new THREE.Color('#426f74')};
  const vector = (x, y, z) => new THREE.Vector3(x, y, z), world = node => node.getWorldPosition(new THREE.Vector3());
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth = (start, end, value) => THREE.MathUtils.smoothstep(value, start, end);
  const motionIds = new Set(['hello', 'thanks', 'yes', 'no', 'help', 'love', 'talk']);
  const preparedMotions = new Map();
  let preparation = null;
  const maxCachedMotions = 40;
  const clipDuration = item => {
    const registered = item?.motionUrl ? animationById(item.id) : null;
    // Only procedural demonstrations use a bounded presentation duration.
    // Source recordings keep their registered duration, including future clips
    // longer than twelve seconds; caller metadata cannot trim a recording.
    return registered && registered.motionUrl === item.motionUrl ? registered.duration : THREE.MathUtils.clamp(Number(item?.duration) || 3.2, .8, 12);
  };
  // A stable signing-space envelope prevents the camera from pumping between
  // signs. Actual face/finger bone extents can enlarge it, including on resize.
  const neutralSigningBounds = new THREE.Box3(vector(-.40, 1.00, -.2), vector(.40, 1.80, .12));
  const signingBounds = neutralSigningBounds.clone();
  let framingNodes = [];
  let sequence = [], savedSequence = [], index = 0, elapsed = 0, completedDuration = 0, totalDuration = 0;
  let previous = performance.now(), speed = 1, playing = false, heldPosition = false, idleTime = 0, settling = null, entrance = null, lastPose = null, lastProgressAt = -Infinity;
  let rigTransition = null, contextUnavailable = false;
  const captureRig = () => Object.fromEntries(Object.entries(bones).map(([name, bone]) => [name, {position: bone.position.clone(), quaternion: bone.quaternion.clone()}]));
  function cancelPreparation() { preparation?.abort(); preparation = null; prunePrepared(); }
  function prunePrepared(extra = []) {
    // An intentionally long queue may exceed the cache budget. Never evict a
    // clip still needed by that queue or its replay; discard older inspections.
    const keep = new Set([...sequence, ...savedSequence, ...extra].filter(item => item?.motionUrl).map(item => item.id));
    for (const [id] of preparedMotions) if (preparedMotions.size > maxCachedMotions && !keep.has(id)) preparedMotions.delete(id);
  }
  function includeSigningPose(bounds) {
    for (const node of framingNodes) {
      const point = world(node);
      bounds.expandByPoint(point.clone().addScalar(.035)); bounds.expandByPoint(point.clone().addScalar(-.035));
      if (/Hand(?:Thumb|Index|Middle|Ring|Pinky)3$/.test(node.name)) {
        const tip = node.localToWorld(vector(0, node.position.length() * .7, 0));
        bounds.expandByPoint(tip.clone().addScalar(.035)); bounds.expandByPoint(tip.clone().addScalar(-.035));
      }
    }
  }
  function fitCamera() {
    if (!hasViewport) return;
    includeSigningPose(signingBounds);
    const center = signingBounds.getCenter(new THREE.Vector3()), size = signingBounds.getSize(new THREE.Vector3());
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // 6% safe margin includes skin outside the joints and UI edge clearance.
    const distance = Math.max(size.y / 2 / tangent, size.x / 2 / tangent / camera.aspect) / .94;
    camera.position.set(center.x, center.y, signingBounds.max.z + distance);
    camera.lookAt(center.x, center.y, 0); camera.updateMatrixWorld(true);
  }
  function resize() {
    if (!renderer || disposed) return;
    const width = container.clientWidth, height = container.clientHeight;
    hasViewport = width > 0 && height > 0;
    // Hidden library/history stages must never assign a NaN aspect or stall startup.
    if (!hasViewport) return;
    renderer.setSize(width, height); camera.aspect = width / height;
    camera.fov = 30; camera.updateProjectionMatrix(); fitCamera();
  }
  function dispose() {
    if (disposed) return;
    disposed = true; playing = false;
    cancelPreparation(); preparedMotions.clear(); rigTransition = null;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null; observer?.disconnect();
    model?.traverse(node => {
      if (node.geometry) geometries.add(node.geometry);
      for (const material of (Array.isArray(node.material) ? node.material : [node.material])) if (material) {
        if (!materials.includes(material)) materials.push(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    });
    geometries.forEach(item => item.dispose()); textures.forEach(item => item.dispose()); materials.forEach(item => item.dispose());
    scene.traverse(node => node.shadow?.dispose());
    renderer?.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer?.domElement.removeEventListener('webglcontextrestored', contextRestored);
    renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove(); scene.clear();
  }
  function suspend() {
    if (disposed || suspended) return;
    suspended = true; if (animationFrame !== null) cancelAnimationFrame(animationFrame); animationFrame = null;
  }
  function wake() {
    if (disposed || contextUnavailable) return;
    suspended = false; previous = performance.now(); resize();
    if (animationFrame === null) animationFrame = requestAnimationFrame(tick);
  }
  function contextLost(event) { event.preventDefault(); contextUnavailable = true; pause(); suspend(); onRenderState?.({status:'lost'}); }
  function contextRestored() { contextUnavailable = false; if (!document.hidden) wake(); onRenderState?.({status:'restored'}); }
  try {
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Aarav, an articulated human avatar. His face, both hands, and signing space remain visible.');
    renderer.domElement.addEventListener('webglcontextlost', contextLost); renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    container.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xfffaf3, 0x83939b, .85));
    for (const [color, intensity, x, y, z, shadow] of [[0xfff4e7, 3.0, -2, 3, 4, true], [0xe8f4ff, 1.45, 3, 2, 3, false], [0xf6fbff, 1.6, 0, 3, -2, false]]) {
      const light = new THREE.DirectionalLight(color, intensity); light.position.set(x, y, z); light.target.position.set(0, 1.2, 0);
      if (shadow) {
        light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.normalBias = .018; light.shadow.bias = -.0002;
        Object.assign(light.shadow.camera, {left: -1.1, right: 1.1, top: 1.1, bottom: -1.1, near: .5, far: 9});
      }
      scene.add(light, light.target);
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(.5, 64), new THREE.MeshBasicMaterial({color: 0xabbab2, transparent: true, opacity: .17}));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .004; geometries.add(shadow.geometry); materials.push(shadow.material); scene.add(shadow);
    const loading = message => { const label = container.querySelector?.('[data-loading-message]'); if (label) label.textContent = message; };
    model = (await new GLTFLoader().loadAsync('/web/assets/aarav.glb', event => {
      loading(event.total ? `Loading Aarav’s model… ${Math.round(event.loaded / event.total * 100)}%` : `Loading Aarav’s model… ${Math.round(event.loaded / 1024)} KB received`);
    })).scene;
    scene.add(model); model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model), height = bounds.max.y - bounds.min.y;
    if (!Number.isFinite(height) || height <= 0) throw Error('The human model has invalid dimensions.');
    const scale = 1.75 / height, center = bounds.getCenter(new THREE.Vector3());
    model.scale.setScalar(scale); model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale); model.updateMatrixWorld(true);
    let cleanFaceTexture = null, hasHeadTexture = false;
    model.traverse(node => {
      for (const material of (Array.isArray(node.material) ? node.material : [node.material])) if (material?.name === 'm006_head' && material.map) hasHeadTexture = true;
    });
    if (hasHeadTexture) {
      loading('Preparing Aarav’s face texture…');
      cleanFaceTexture = await new THREE.TextureLoader().loadAsync('/web/assets/aarav-clean-shaven.png');
      cleanFaceTexture.colorSpace = THREE.SRGBColorSpace; cleanFaceTexture.flipY = false; textures.add(cleanFaceTexture);
    }
    loading('Preparing the character rig and materials…');
    model.traverse(node => {
      if (node.isBone) {
        bones[node.name] = node; rest[node.name] = {quaternion: node.quaternion.clone(), position: node.position.clone()};
        reference[node.name] = node.getWorldQuaternion(new THREE.Quaternion());
      }
      if (!node.isMesh) return;
      node.frustumCulled = false; node.castShadow = true; node.receiveShadow = true;
      // The body atlas also contains both hands. Identify cloth by skin weights,
      // never by animated height or skin colour: raising a hand must not tint it.
      const skinIndex = node.geometry.getAttribute('skinIndex'), skinWeight = node.geometry.getAttribute('skinWeight');
      if (node.isSkinnedMesh && skinIndex && skinWeight) {
        const cloth = new Float32Array(skinIndex.count), skin = new Float32Array(skinIndex.count);
        for (let vertex = 0; vertex < skinIndex.count; vertex++) {
          let bodyWeight = 0, handWeight = 0;
          for (let component = 0; component < 4; component++) {
            const name = node.skeleton.bones[skinIndex.array[vertex * 4 + component]]?.name || '', weight = skinWeight.array[vertex * 4 + component];
            if (/Hand/.test(name)) handWeight += weight;
            if (/^(Spine\d*|Neck|(?:Left|Right)(?:Shoulder|Arm|ForeArm))$/.test(name)) bodyWeight += weight;
          }
          cloth[vertex] = handWeight > .001 ? 0 : THREE.MathUtils.smoothstep(bodyWeight, .45, .85);
          skin[vertex] = THREE.MathUtils.smoothstep(handWeight, .05, .7);
        }
        node.geometry.setAttribute('avatarCloth', new THREE.BufferAttribute(cloth, 1));
        node.geometry.setAttribute('avatarSkin', new THREE.BufferAttribute(skin, 1));
      }
      const originals = Array.isArray(node.material) ? node.material : [node.material];
      if (originals.some(material => material?.name === 'm006_head')) scalpMesh = node;
      // Crop both the opaque hair volume and its edge cards. Styling only the
      // transparent cards leaves the original bulky silhouette underneath.
      // Coordinates are specific to the retained Rocketbox model; the forehead,
      // eyes, mouth and all bones stay below/outside this crown adjustment.
      if (originals.some(material => ['m006_opacity', 'm006_head'].includes(material?.name))) {
        geometries.add(node.geometry);
        node.geometry = node.geometry.clone(); geometries.add(node.geometry);
        const positions = node.geometry.getAttribute('position');
        let hairPixels = null, hairWidth = 0, hairHeight = 0;
        const headTexture = originals.find(material => material?.name === 'm006_head')?.map?.image;
        if (headTexture && document.createElement) {
          const sampler = document.createElement('canvas'); sampler.width = headTexture.width; sampler.height = headTexture.height;
          const context = sampler.getContext('2d', {willReadFrequently: true});
          if (context) { context.drawImage(headTexture, 0, 0); hairWidth = sampler.width; hairHeight = sampler.height; hairPixels = context.getImageData(0, 0, hairWidth, hairHeight).data; }
        }
        // Retain the separate eyelashes, but remove the old crown's hair cards.
        // The new crop is independent geometry, not another silhouette squeeze.
        if (originals.some(material => material?.name === 'm006_opacity')) {
          const oldIndex = node.geometry.index, indices = [];
          const count = oldIndex ? oldIndex.count : positions.count;
          for (let i = 0; i < count; i += 3) {
            const triangle = [0, 1, 2].map(offset => oldIndex ? oldIndex.getX(i + offset) : i + offset);
            const y = triangle.reduce((sum, vertex) => sum + positions.getY(vertex), 0) / 3;
            const z = triangle.reduce((sum, vertex) => sum + positions.getZ(vertex), 0) / 3;
            const x = triangle.reduce((sum, vertex) => sum + positions.getX(vertex), 0) / 3;
            const facialCard = z > .075 && Math.abs(x) < .07 && y < 1.68;
            if (y < 1.60 || facialCard) indices.push(...triangle);
          }
          node.geometry.setIndex(indices);
        }
        for (let i = 0; i < positions.count; i++) if (positions.getY(i) > 1.635) {
          const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
          // Project excess hair volume onto a rounded scalp envelope. A smooth
          // blend at the temples avoids the flat top and flared polygon edges
          // produced by independently squeezing the horizontal/vertical axes.
          const amount = THREE.MathUtils.smoothstep(y, 1.635, 1.68);
          const nx = x / .079, ny = Math.max(0, y - 1.655) / .082, nz = (z - .012) / .095;
          const radius = Math.sqrt(nx * nx + ny * ny + nz * nz);
          const scale = radius > 1 ? 1 / radius : 1;
          positions.setXYZ(i, THREE.MathUtils.lerp(x, x * scale, amount), THREE.MathUtils.lerp(y, 1.655 + (y - 1.655) * scale, amount), THREE.MathUtils.lerp(z, .012 + (z - .012) * scale, amount));
        }
        // The old hairstyle is also baked into the head atlas at the temples.
        // Fit those dark hair vertices under the new cap without moving ears,
        // skin, eyebrows, or other facial features.
        const uv = node.geometry.getAttribute('uv');
        if (hairPixels && uv) for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
          if (y < 1.60 || (Math.abs(x) < .07 && z > .075 && y < 1.68)) continue;
          const pixelX = THREE.MathUtils.clamp(Math.round(uv.getX(i) * (hairWidth - 1)), 0, hairWidth - 1);
          const pixelY = THREE.MathUtils.clamp(Math.round(uv.getY(i) * (hairHeight - 1)), 0, hairHeight - 1);
          const pixel = (pixelY * hairWidth + pixelX) * 4;
          if (Math.max(hairPixels[pixel], hairPixels[pixel + 1], hairPixels[pixel + 2]) > 110) continue;
          const amount = THREE.MathUtils.smoothstep(y, 1.60, 1.64);
          const radius = Math.sqrt((x / .073) ** 2 + (Math.max(0, y - 1.65) / .082) ** 2 + ((z - .012) / .091) ** 2);
          const scale = radius > 1 ? 1 / radius : 1;
          positions.setXYZ(i, THREE.MathUtils.lerp(x, x * scale, amount), THREE.MathUtils.lerp(y, 1.65 + (y - 1.65) * scale, amount), THREE.MathUtils.lerp(z, .012 + (z - .012) * scale, amount));
        }
        positions.needsUpdate = true; node.geometry.computeVertexNormals(); node.geometry.computeBoundingBox(); node.geometry.computeBoundingSphere();
      }
      const copies = originals.map(original => {
        const material = original.clone(); material.roughness = material.name === 'm006_head' ? .58 : .92;
        if (material.name === 'm006_head' && cleanFaceTexture) { textures.add(material.map); material.map = cleanFaceTexture; }
        // The legacy conversion omits metallicFactor; glTF defaults it to 1.
        // Skin, fabric, and hair need dielectric shading to retain their texture detail.
        material.metalness = 0;
        material.normalScale?.setScalar(material.name === 'm006_head' ? .18 : .8);
        for (const map of [material.map, material.normalMap]) if (map) map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        if (material.name === 'm006_opacity') {
          // Alpha blending made overlapping hair cards look cloudy. A cutout
          // with multisample coverage keeps crisp curls and eyelashes.
          material.transparent = false; material.alphaTest = .28; material.alphaToCoverage = true; material.depthWrite = true;
          material.specularIntensity = .25; material.specularColor?.set('#ffffff'); node.castShadow = false;
        }
        if (material.name.includes('casualsuit') || material.name === 'm006_body') material.onBeforeCompile = shader => {
          shader.uniforms.companionShirt = shirtColor;
          shader.vertexShader = 'attribute float avatarCloth;\nattribute float avatarSkin;\nvarying float skinRegion;\nvarying float clothRegion;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nclothRegion = avatarCloth; skinRegion = avatarSkin;');
          shader.fragmentShader = 'uniform vec3 companionShirt;\nvarying float skinRegion;\nvarying float clothRegion;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat shade = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); float skinMask = smoothstep(0.025, 0.10, diffuseColor.r - diffuseColor.b) * smoothstep(0.08, 0.22, shade); diffuseColor.rgb = mix(diffuseColor.rgb, mix(diffuseColor.rgb, vec3(0.88, 0.75, 0.66), 0.30), skinMask * skinRegion); diffuseColor.rgb = mix(diffuseColor.rgb, companionShirt * (0.35 + shade * 1.8), clothRegion * 0.96);');
        };
        if (material.name === 'm006_head') material.onBeforeCompile = shader => {
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat skinShade = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); float skinMask = smoothstep(0.025, 0.10, diffuseColor.r - diffuseColor.b) * smoothstep(0.08, 0.22, skinShade); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.88, 0.75, 0.66), skinMask * 0.30);');
        };
        materials.push(material); return material;
      });
      node.material = Array.isArray(node.material) ? copies : copies[0]; originals.forEach(material => material.dispose());
      if (node.morphTargetDictionary) faceMeshes.push(node);
    });
    for (const side of ['Left', 'Right']) {
      for (const joint of ['Shoulder', 'Arm', 'ForeArm', 'Hand']) if (!bones[side + joint]) throw Error('Avatar is missing a required arm bone.');
      for (const finger of ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']) for (let segment = 1; segment <= 3; segment++) if (!bones[side + 'Hand' + finger + segment]) throw Error('Avatar is missing a required articulated finger.');
    }
    if (scalpMesh) {
      // Original procedural hair: short tapered sides, a fitted crown and
      // overlapping swept locks. Bind to Head in the source skeleton so the
      // crop follows every head movement without changing any signing bones.
      const headIndex = scalpMesh.skeleton.bones.findIndex(bone => bone.name === 'Head');
      if (headIndex < 0) throw Error('The hairstyle requires the retained head joint.');
      const capPoint = (angle, polar, lift = 0) => vector(
        (.087 + lift) * Math.sin(polar) * Math.sin(angle),
        1.655 + (.094 + lift) * Math.cos(polar),
        .012 + (.105 + lift) * Math.sin(polar) * Math.cos(angle)
      );
      const bindHair = (geometry, material, name) => {
        const count = geometry.getAttribute('position').count;
        const joints = new Uint16Array(count * 4), weights = new Float32Array(count * 4);
        for (let i = 0; i < count; i++) { joints[i * 4] = headIndex; weights[i * 4] = 1; }
        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(joints, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
        const mesh = new THREE.SkinnedMesh(geometry, material); mesh.name = name;
        mesh.position.copy(scalpMesh.position); mesh.quaternion.copy(scalpMesh.quaternion); mesh.scale.copy(scalpMesh.scale);
        mesh.bind(scalpMesh.skeleton, scalpMesh.bindMatrix.clone());
        mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true;
        scalpMesh.parent.add(mesh); geometries.add(geometry); materials.push(material);
      };
      const hairMaterial = color => {
        const material = new THREE.MeshStandardMaterial({color, roughness: .98, metalness: 0});
        material.onBeforeCompile = shader => {
          shader.vertexShader = 'varying vec2 cropUV;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ncropUV = uv;');
          shader.fragmentShader = 'varying vec2 cropUV;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat grain = 0.87 + 0.13 * sin(cropUV.x * 210.0 + sin(cropUV.y * 12.0)); diffuseColor.rgb *= grain;');
        };
        return material;
      };
      const capVertices = [], capUV = [], capIndices = [], columns = 64, rows = 24;
      for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
        const angle = column / columns * Math.PI * 2;
        // High, clean front hairline; short temples; lower natural nape.
        const front = Math.cos(angle), edgeY = front > 0 ? 1.630 + .053 * front ** 4 : 1.630 + .023 * front;
        const edge = Math.acos((edgeY - 1.655) / .094), polar = row / rows * edge;
        const textureLift = .0008 * Math.sin(angle * 27 + polar * 9) * Math.sin(polar);
        capVertices.push(...capPoint(angle, polar, textureLift).toArray()); capUV.push(column / columns, row / rows);
        if (row < rows && column < columns) {
          const a = row * (columns + 1) + column, b = a + columns + 1;
          capIndices.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
      const cap = new THREE.BufferGeometry();
      cap.setAttribute('position', new THREE.Float32BufferAttribute(capVertices, 3));
      cap.setAttribute('uv', new THREE.Float32BufferAttribute(capUV, 2)); cap.setIndex(capIndices); cap.computeVertexNormals();
      bindHair(cap, hairMaterial('#241a15'), 'Aarav · short crop base');
      const lockVertices = [], lockUV = [], lockIndices = [];
      let seed = 29;
      const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      for (let lock = 0; lock < 125; lock++) {
        const angle = random() * Math.PI * 2, polar = .16 + random() * 1.24;
        const root = capPoint(angle, polar, .0005);
        const normal = vector(root.x / .087, (root.y - 1.655) / .094, (root.z - .012) / .105).normalize();
        const sweep = vector(-.6, .1, -.8); sweep.addScaledVector(normal, -sweep.dot(normal)).normalize();
        const length = .018 + random() * .019, width = .003 + random() * .0025;
        const arch = .0015 + random() * .0025;
        const curve = new THREE.QuadraticBezierCurve3(root, root.clone().addScaledVector(sweep, length * .5).addScaledVector(normal, arch * 2), root.clone().addScaledVector(sweep, length).addScaledVector(normal, .0005));
        const start = lockVertices.length / 3, steps = 8, ring = 6;
        for (let step = 0; step <= steps; step++) {
          const t = step / steps, point = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
          const side = new THREE.Vector3().crossVectors(tangent, normal).normalize();
          const up = new THREE.Vector3().crossVectors(side, tangent).normalize();
          const taper = Math.max(.05, Math.sin(Math.PI * (.15 + .85 * t)));
          for (let segment = 0; segment <= ring; segment++) {
            const a = segment / ring * Math.PI * 2;
            lockVertices.push(...point.clone().addScaledVector(side, Math.cos(a) * width * taper).addScaledVector(up, Math.sin(a) * width * .37 * taper).toArray());
            lockUV.push(segment / ring, t);
            if (step < steps && segment < ring) {
              const a0 = start + step * (ring + 1) + segment, b0 = a0 + ring + 1;
              lockIndices.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1);
            }
          }
        }
      }
      const locks = new THREE.BufferGeometry();
      locks.setAttribute('position', new THREE.Float32BufferAttribute(lockVertices, 3));
      locks.setAttribute('uv', new THREE.Float32BufferAttribute(lockUV, 2)); locks.setIndex(lockIndices); locks.computeVertexNormals();
      bindHair(locks, hairMaterial('#38261c'), 'Aarav · swept textured locks');
      model.updateMatrixWorld(true);
    }
    framingNodes = Object.entries(bones).filter(([name]) => /Hand|Shoulder|ForeArm|^Head$|Eye|Eyebrow|Mouth|Nose/.test(name)).map(([, bone]) => bone);
  } catch (error) { dispose(); throw error; }
  const modelBaseY = model.position.y, armLengths = {}, eyes = {Left: bones.LeftEye || bones.Bip01_LEye, Right: bones.RightEye || bones.Bip01_REye};
  for (const side of ['Left', 'Right']) armLengths[side] = [world(bones[side + 'ForeArm']).distanceTo(world(bones[side + 'Arm'])), world(bones[side + 'Hand']).distanceTo(world(bones[side + 'ForeArm']))];
  function setWorldQuaternion(bone, quaternion) {
    const parent = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.copy(parent.invert().multiply(quaternion)).normalize(); bone.updateMatrixWorld(true);
  }
  function pointBone(bone, child, target) {
    // Keep the reference roll; rebuilding from local +Y twists sleeves and wrists.
    const bind = reference[bone.name], axis = child.position.clone().normalize().applyQuaternion(bind);
    const direction = target.clone().sub(world(bone)).normalize();
    setWorldQuaternion(bone, new THREE.Quaternion().setFromUnitVectors(axis, direction).multiply(bind));
  }
  function solveArm(side, wristTarget, palmAngle, curl, thumbUp, handWeight) {
    const upper = bones[side + 'Arm'], lower = bones[side + 'ForeArm'], hand = bones[side + 'Hand'];
    const shoulder = world(upper), [upperLength, lowerLength] = armLengths[side], direction = wristTarget.clone().sub(shoulder);
    const distance = THREE.MathUtils.clamp(direction.length(), Math.abs(upperLength - lowerLength) + .035, upperLength + lowerLength - .012); direction.normalize();
    const cosine = THREE.MathUtils.clamp((upperLength ** 2 + distance ** 2 - lowerLength ** 2) / (2 * upperLength * distance), -1, 1);
    const bend = vector((side === 'Left' ? 1 : -1) * .8, -.8, .55); bend.addScaledVector(direction, -bend.dot(direction)).normalize();
    const elbow = shoulder.clone().addScaledVector(direction, upperLength * cosine).addScaledVector(bend, upperLength * Math.sqrt(Math.max(0, 1 - cosine * cosine)));
    const wrist = shoulder.clone().addScaledVector(direction, distance);
    pointBone(upper, lower, elbow); pointBone(lower, hand, wrist);
    const naturalHand = lower.getWorldQuaternion(new THREE.Quaternion()).multiply(rest[hand.name].quaternion);
    const gestureHand = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.16, 0, palmAngle));
    setWorldQuaternion(hand, naturalHand.slerp(gestureHand, handWeight));
    for (const finger of ['Index', 'Middle', 'Ring', 'Pinky']) for (let segment = 1; segment <= 3; segment++) {
      const name = side + 'Hand' + finger + segment, bone = bones[name];
      // Rocketbox has mirrored local finger axes. Applying a positive curl to
      // both sides hyperextends the right hand instead of closing its fingers.
      const flexion = curl * (side === 'Left' ? 1 : -1) * [0, .70, .95, .65][segment];
      if (bone) bone.quaternion.copy(rest[name].quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(flexion, 0, 0)));
    }
    for (let segment = 1; segment <= 3; segment++) {
      const name = side + 'HandThumb' + segment, bone = bones[name];
      const thumbFlexion = (thumbUp ? -.18 * handWeight : curl * .22) * (side === 'Left' ? 1 : -1);
      if (bone) bone.quaternion.copy(rest[name].quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(thumbFlexion, 0, 0)));
    }
  }
  function setFace(name, value) {
    for (const mesh of faceMeshes) { const target = mesh.morphTargetDictionary[name]; if (target !== undefined) mesh.morphTargetInfluences[target] = value; }
  }
  function setLanguage(config) {
    // Neutral grey hoodie and consistent lighter face/hand complexion.
    stop(); shirtColor.value.set('#93999f');
    for (const material of materials) {
      if (material.name.includes('casualsuit') || material.name === 'm006_body') material.color.setRGB(1.45, 1.38, 1.30);
      else if (material.name.includes('body') || material.name === 'm006_head') material.color.setRGB(1.45, 1.38, 1.30);
      else if (material.name.includes('ponytail') || material.name.includes('eyebrows')) material.color.set(config.hair || '#423930').lerp(new THREE.Color('#ffffff'), .4);
    }
  }
  function getState() {
    const state = disposed ? 'disposed' : playing ? (playbackPaused ? 'paused' : 'playing') : sequence.length && (index >= sequence.length || completedDuration + elapsed >= totalDuration) ? 'completed' : 'idle';
    const item = sequence[index] || null, duration = item ? clipDuration(item) : 0;
    const queueElapsed = Math.min(totalDuration, completedDuration + elapsed);
    return {state, suspended, index: Math.min(index, Math.max(0, sequence.length - 1)), item, elapsed, duration, queueElapsed, totalDuration, progress: totalDuration ? queueElapsed / totalDuration : 0, speed, length: sequence.length};
  }
  function progress(force = false) {
    if (force || previous - lastProgressAt >= 100) { lastProgressAt = previous; onProgress?.(getState()); }
  }
  function pause() {
    if (!playing || disposed || playbackPaused) return;
    playbackPaused = true; progress(true);
  }
  function resume() {
    if (!playing || disposed || !playbackPaused) return;
    playbackPaused = false; previous = performance.now(); progress(true);
  }
  async function prepare(items, {signal} = {}) {
    if (disposed) throw Error('Avatar has been disposed.');
    if (!Array.isArray(items)) throw Error('Playback requires an ordered motion queue.');
    cancelPreparation();
    const controller = new AbortController(); preparation = controller;
    const abort = () => controller.abort(signal.reason);
    signal?.addEventListener('abort', abort, {once: true});
    if (signal?.aborted) abort();
    const reports = [];
    try {
    for (const item of items) {
      controller.signal.throwIfAborted();
      if (!item?.motionUrl) { if (!motionIds.has(item?.id)) throw Error('Animation unavailable: ' + (item?.id || 'missing ID')); continue; }
      const registration=animationById(item.id);
      if (!registration || registration.signLanguage!=='ASL') throw Error('Research motion ID is invalid or unregistered.');
      if (item.motionUrl !== registration.motionUrl) throw Error('Research motion ID and URL do not match the manifest.');
      let ready = preparedMotions.get(item.id);
      if (!ready) {
        const data = await loadResearchMotion(item.motionUrl, {signal: controller.signal});
        controller.signal.throwIfAborted();
        if (disposed) throw Error('Avatar was disposed while preparing research motion.');
        if (data.id !== item.id) throw Error('Research motion ID and source asset do not match.');
        ready = createResearchRetargeter(data, bones, rest);
        ready.signingBounds = neutralSigningBounds.clone();
        const before = captureRig();
        try {
          // Preflight every source pose once. Frame the complete queue before
          // playback rather than zooming in and out as its hands move.
          for (let time = 0; time <= data.duration + 1 / 30; time += 1 / 30) {
            ready.apply(Math.min(time, data.duration)); includeSigningPose(ready.signingBounds);
          }
          const d = ready.diagnostics;
          if (d.maxReachError > .12 || d.maxFingerDirectionError > .01 || d.maxPalmAngleError > .02 || d.maxNearContactSeparationError > .08) throw Error('Research clip quarantined: excessive reach, hand-axis or contact distortion.');
          d.technicalStatus = 'previewable-unverified'; preparedMotions.set(item.id, ready);
        } finally {
          for (const [name, pose] of Object.entries(before)) { bones[name].position.copy(pose.position); bones[name].quaternion.copy(pose.quaternion); }
          model.updateMatrixWorld(true);
        }
        // Let input/cancel events run between clips, after restoring the live rig.
        await new Promise(resolve => setTimeout(resolve, 0));
        controller.signal.throwIfAborted();
      }
      // Refresh insertion order so the cache discards the oldest inspections.
      preparedMotions.delete(item.id); preparedMotions.set(item.id, ready);
      reports.push({...ready.diagnostics});
    }
    return reports;
    } finally {
      signal?.removeEventListener('abort', abort);
      if (preparation === controller) { preparation = null; prunePrepared(items); }
    }
  }
  function play(items) {
    if (disposed) return;
    if (!Array.isArray(items)) throw Error('Playback requires an ordered motion queue.');
    if (items.some(item => !item || (item.motionUrl ? !preparedMotions.has(item.id) : !motionIds.has(item.id)))) throw Error('The playback queue contains a motion without an available prepared animation.');
    signingBounds.copy(neutralSigningBounds);
    for (const item of items) if (item.motionUrl) signingBounds.union(preparedMotions.get(item.id).signingBounds);
    rigTransition = items[0]?.motionUrl ? null : {pose: captureRig(), time: 0, duration: .25};
    entrance = lastPose ? {pose: lastPose, time: 0} : null;
    sequence = items.map(item => ({...item, duration: clipDuration(item)})); savedSequence = sequence.map(item => ({...item}));
    prunePrepared();
    index = 0; elapsed = completedDuration = 0; totalDuration = sequence.reduce((sum, item) => sum + item.duration, 0);
    settling = null; heldPosition = false; previous = performance.now(); playing = sequence.length > 0; playbackPaused = false;
    if (playing) onStep?.(0, sequence[0]); else onFinish?.({reason: 'empty', state: getState()});
    progress(true);
  }
  function replay() { if (disposed) return; play(savedSequence); }
  function seek(seconds) {
    const value = Number(seconds);
    if (disposed || !sequence.length || !Number.isFinite(value)) return false;
    const position = THREE.MathUtils.clamp(value, 0, totalDuration), wasPlaying = playing && !playbackPaused;
    let before = 0, next = 0;
    // A boundary selects the following clip; the queue endpoint holds the last
    // source frame. No source time is trimmed or redistributed between clips.
    while (next < sequence.length - 1 && position >= before + clipDuration(sequence[next])) before += clipDuration(sequence[next++]);
    index = next; completedDuration = before; elapsed = Math.min(clipDuration(sequence[index]), position - before);
    playing = position < totalDuration; playbackPaused = playing && !wasPlaying; heldPosition = true;
    entrance = settling = rigTransition = null; previous = performance.now();
    onStep?.(index, sequence[index]);
    // Seeking must update the pose immediately, including while paused or
    // suspended. It must not start a second animation loop or render a hidden stage.
    tick(previous, {advance: false, schedule: false}); progress(true);
    return true;
  }
  function stop() {
    if (disposed) return;
    cancelPreparation();
    const hadQueue = sequence.length > 0;
    if (lastPose) settling = {pose: lastPose, time: 0};
    rigTransition = {pose: captureRig(), time: 0, duration: .30};
    playing = playbackPaused = heldPosition = false; entrance = null; sequence = []; index = 0; elapsed = completedDuration = totalDuration = 0;
    if (hadQueue) onFinish?.({reason: 'stopped', state: getState()});
    progress(true);
  }
  function tick(now, {advance = true, schedule = true} = {}) {
    if (schedule) animationFrame = null;
    if (disposed || (suspended && advance)) return;
    const delta = advance ? Math.min(.1, Math.max(0, (now - previous) / 1000)) : 0; previous = now;
    if (!playbackPaused && !(heldPosition && !playing)) idleTime += delta;
    if (playing && !playbackPaused) elapsed += delta * speed;
    const active = playing || heldPosition ? sequence[index] : null, duration = clipDuration(active), t = Math.min(elapsed, duration);
    const weight = active ? smooth(0, .4, t) * (1 - smooth(duration - .45, duration, t)) : 0, wave = Math.sin(t * 6) * (reduceMotion ? .15 : 1);
    for (const [name, bone] of Object.entries(bones)) { bone.quaternion.copy(rest[name].quaternion); bone.position.copy(rest[name].position); }
    const sourceActive = Boolean(active?.motionUrl);
    const breath = reduceMotion || sourceActive ? 0 : Math.sin(idleTime * 1.6); model.position.y = modelBaseY + breath * .0018;
    if (bones.Spine1) bones.Spine1.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(breath * .006, 0, 0)));
    model.updateMatrixWorld(true);
    const right = vector(-.25, .86, .09), left = vector(.25, .86, .09);
    let target = right.clone(), other = left.clone(), curl = .08, leftCurl = .08, angle = -Math.PI, otherAngle = Math.PI, thumbUp = false, nod = 0, shake = 0;
    switch (active?.id) {
      case 'hello': target.set(-.37 - wave * .035, 1.62, .19); angle = wave * .12; curl = 0; break;
      case 'thanks': { const reach = smooth(.45, duration - .5, t); target.set(-.04 - reach * .075, 1.53 - reach * .18, .24 + reach * .14); angle = -.9; curl = 0; break; }
      case 'yes': target.set(-.29, 1.28 + wave * .025, .30); angle = 0; curl = 1.25; thumbUp = true; nod = wave * .07; break;
      case 'no': target.set(-.29, 1.30, .28); angle = Math.PI; curl = 1.25; thumbUp = true; shake = wave * .08; break;
      case 'help': target.set(-.06, 1.19 + wave * .02, .33); other.set(.09, 1.10 + wave * .02, .35); angle = -.2; otherAngle = -Math.PI / 2; curl = 1.2; leftCurl = 0; thumbUp = true; break;
      case 'love': target.set(.12, 1.37, .30); other.set(-.12, 1.35, .39); angle = -.8; otherAngle = .8; curl = .6; leftCurl = .6; break;
      case 'talk': {
        // Expressive emphasis for arbitrary text; not sign translation or audio lip sync.
        const emphasis = Math.sin(t * 2.4); target.set(-.23 - emphasis * .025, 1.16 + emphasis * .018, .31); other.set(.25 + emphasis * .02, 1.11 - emphasis * .012, .29);
        angle = -.42; otherAngle = .42; curl = leftCurl = .16; nod = Math.sin(t * 2) * .022; break;
      }
    }
    target.lerp(right, 1 - weight); other.lerp(left, 1 - weight);
    let pose = {target, other, angle, otherAngle, curl: .08 + (curl - .08) * weight, leftCurl: .08 + (leftCurl - .08) * weight, thumbUp, weight, nod: nod * weight, shake: shake * weight};
    if (entrance && active) {
      if (!playbackPaused) entrance.time += delta;
      const progress = smooth(0, .25, entrance.time), from = entrance.pose;
      pose.target.lerp(from.target, 1 - progress); pose.other.lerp(from.other, 1 - progress);
      for (const property of ['angle', 'otherAngle', 'curl', 'leftCurl', 'weight', 'nod', 'shake']) pose[property] = THREE.MathUtils.lerp(from[property], pose[property], progress);
      if (progress === 1) entrance = null;
    }
    if (settling && !active) {
      settling.time += delta; const progress = smooth(0, .3, settling.time), from = settling.pose;
      pose = {...from, target: from.target.clone().lerp(right, progress), other: from.other.clone().lerp(left, progress), curl: THREE.MathUtils.lerp(from.curl, .08, progress), leftCurl: THREE.MathUtils.lerp(from.leftCurl, .08, progress), weight: from.weight * (1 - progress), nod: from.nod * (1 - progress), shake: from.shake * (1 - progress)};
      if (progress === 1) settling = null;
    }
    lastPose = pose;
    const research = active?.motionUrl ? preparedMotions.get(active.id) : null;
    // Recorded clips must keep their original handshape/contact/timing. Fading
    // them into a rest pose used to alter the first and last .4 seconds.
    if (research) research.apply(t, 1);
    else { solveArm('Right', pose.target, pose.angle, pose.curl, pose.thumbUp, pose.weight); solveArm('Left', pose.other, pose.otherAngle, pose.leftCurl, false, pose.weight); }
    if (rigTransition && !research) {
      if (!playbackPaused) rigTransition.time += delta;
      const blend = smooth(0, rigTransition.duration, rigTransition.time);
      for (const [name, from] of Object.entries(rigTransition.pose)) { bones[name].position.lerp(from.position, 1 - blend); bones[name].quaternion.slerp(from.quaternion, 1 - blend); }
      if (blend === 1) rigTransition = null;
    }
    if (bones.Head && !research) { const attention = reduceMotion ? 0 : Math.sin(idleTime * .7) * .009; bones.Head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.nod + breath * .004, pose.shake + attention, attention * .3))); }
    for (const eye of Object.values(eyes)) if (eye && !active && !reduceMotion) eye.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.sin(idleTime * .8) * .008, 0)));
    // The source recordings contain no facial capture. Keep their face neutral;
    // idle expressions are not ASL grammatical or emotional facial markers.
    const blinkTime = idleTime % 5.3, blink = !active && !reduceMotion && blinkTime > 5.08 ? Math.sin((blinkTime - 5.08) / .22 * Math.PI) : 0;
    setFace('eyeBlinkLeft', blink); setFace('eyeBlinkRight', blink);
    setFace('mouthSmileLeft', active ? 0 : .06); setFace('mouthSmileRight', active ? 0 : .06);
    setFace('browInnerUp', 0); setFace('jawOpen', 0); setFace('viseme_aa', 0);
    if (playing && !playbackPaused && elapsed >= duration) {
      completedDuration += duration; elapsed = Math.max(0, elapsed - duration); index++;
      if (index >= sequence.length) { playing = false; elapsed = 0; rigTransition = {pose: captureRig(), time: 0, duration: .3}; progress(true); onFinish?.({reason: 'completed', state: getState()}); }
      else { entrance = lastPose ? {pose: lastPose, time: 0} : null; onStep?.(index, sequence[index]); progress(true); }
    }
    if (playing) progress();
    if (!disposed && !suspended && hasViewport) { model.updateMatrixWorld(true); fitCamera(); renderer.render(scene, camera); }
    if (schedule && !disposed && !suspended) animationFrame = requestAnimationFrame(tick);
  }
  // Frame a genuine neutral pose, not the GLB's wide unposed T-pose. The old
  // initial measurement permanently pulled the camera far away on phones.
  solveArm('Right', vector(-.25, .86, .09), -Math.PI, .08, false, 0);
  solveArm('Left', vector(.25, .86, .09), Math.PI, .08, false, 0);
  model.updateMatrixWorld(true); includeSigningPose(signingBounds);
  observer = new ResizeObserver(resize); observer.observe(container); resize();
  wake();
  function resetCamera() {
    signingBounds.copy(neutralSigningBounds);
    for(const item of sequence)if(item.motionUrl&&preparedMotions.has(item.id))signingBounds.union(preparedMotions.get(item.id).signingBounds);
    resize();
  }
  return {prepare, cancelPreparation, play, replay, stop, seek, setLanguage, pause, resume, suspend, wake, dispose, getState, resetCamera, researchDiagnostics() { return [...preparedMotions.values()].map(item => ({...item.diagnostics})); }, setSpeed(value) { const number = Number(value); if (Number.isFinite(number)) { speed = THREE.MathUtils.clamp(number, .2, 3); progress(true); } }};
}

