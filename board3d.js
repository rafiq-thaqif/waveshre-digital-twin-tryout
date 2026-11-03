import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const HOTSPOTS = {
  mcu: { label: 'ESP32-S3', position: [0.2, 1.1, 0.0] },
  di: { label: 'Digital inputs', position: [-2.65, 1.22, -1.12] },
  do: { label: 'Digital outputs', position: [2.55, 1.22, -1.12] },
  ethernet: { label: 'Ethernet / PoE', position: [-2.45, 0.34, 2.35] },
  usb: { label: 'USB-C', position: [-1.45, 0.28, 2.42] },
  rs485: { label: 'RS485', position: [1.20, 0.46, 2.34] },
  can: { label: 'CAN', position: [2.15, 0.46, 2.34] },
  power: { label: 'Power', position: [3.0, 0.46, 2.34] },
  antenna: { label: 'Antenna', position: [-4.05, 1.25, 2.1] },
  terminals: { label: 'Terminal blocks', position: [0.0, 0.75, 2.3] }
};

const viewers = [];

function makeSpriteTexture(active = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,128,128);
  ctx.beginPath();
  ctx.arc(64,64,42,0,Math.PI*2);
  ctx.fillStyle = active ? '#0f172a' : 'rgba(255,255,255,.96)';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = active ? '#60a5fa' : '#1677ff';
  ctx.stroke();
  ctx.fillStyle = active ? '#ffffff' : '#1677ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 72px Inter, Arial';
  ctx.fillText('+', 64, 68);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function loadTexture(url, opts = {}) {
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  if (opts.rotation) {
    texture.center.set(0.5, 0.5);
    texture.rotation = opts.rotation;
  }
  if (opts.flipY !== undefined) texture.flipY = opts.flipY;
  return texture;
}

function createBoardModel() {
  const group = new THREE.Group();

  const topTex = loadTexture('./assets/top_texture.png', { rotation: Math.PI / 2 });
  const frontTex = loadTexture('./assets/front_texture.png');
  const backTex = loadTexture('./assets/back_texture.png');
  const sideTex = loadTexture('./assets/side_texture.png');
  const sideTexMirror = loadTexture('./assets/side_texture_mirror.png');

  const black = new THREE.MeshStandardMaterial({ color: '#12171d', roughness: 0.6, metalness: 0.15 });
  const topMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: topTex, roughness: 0.7, metalness: 0.1 });
  const frontMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: frontTex, roughness: 0.72, metalness: 0.05 });
  const backMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: backTex, roughness: 0.72, metalness: 0.05 });
  const leftMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: sideTex, roughness: 0.72, metalness: 0.06 });
  const rightMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: sideTexMirror, roughness: 0.72, metalness: 0.06 });

  const bodyGeo = new THREE.BoxGeometry(7.0, 1.8, 4.05);
  const body = new THREE.Mesh(bodyGeo, [rightMat, leftMat, topMat, black, frontMat, backMat]);
  body.castShadow = true;
  body.receiveShadow = true;
  body.position.y = 0.9;
  group.add(body);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(7.8, 0.42, 4.7),
    new THREE.MeshStandardMaterial({ color: '#15181f', roughness: 0.8, metalness: 0.08 })
  );
  base.position.y = 0.1;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const railSlot = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.16, 0.56),
    new THREE.MeshStandardMaterial({ color: '#0a0d12', roughness: 0.9, metalness: 0.02 })
  );
  railSlot.position.set(0, -0.03, 2.08);
  group.add(railSlot);

  const antennaBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.14, 18),
    new THREE.MeshStandardMaterial({ color: '#8f6a32', roughness: 0.4, metalness: 0.7 })
  );
  antennaBase.rotation.z = Math.PI / 2;
  antennaBase.position.set(-3.64, 0.68, 1.74);
  group.add(antennaBase);

  const antenna = new THREE.Group();
  const stem1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 16), new THREE.MeshStandardMaterial({ color: '#1a1c22', roughness: 0.9 }));
  const stem2 = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.12, 1.0, 16), new THREE.MeshStandardMaterial({ color: '#22252e', roughness: 0.9 }));
  const tip = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.24, 4, 8), new THREE.MeshStandardMaterial({ color: '#171a20', roughness: 0.95 }));
  stem1.position.y = 0.6;
  stem2.position.y = 1.62;
  tip.position.y = 2.3;
  antenna.add(stem1, stem2, tip);
  antenna.rotation.z = THREE.MathUtils.degToRad(7);
  antenna.position.set(-3.86, 0.92, 1.85);
  group.add(antenna);

  // small feet screw cutout accents
  const footMat = new THREE.MeshStandardMaterial({ color: '#0e1015', roughness: 0.95 });
  [[-3.45,1.71], [3.45,1.71], [-3.45,-1.71], [3.45,-1.71]].forEach(([x,z]) => {
    const cut = new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.02,20), footMat);
    cut.rotation.x = Math.PI/2;
    cut.position.set(x,1.77,z);
    group.add(cut);
  });

  return group;
}

function addHotspots(scene, model) {
  const markers = [];
  Object.entries(HOTSPOTS).forEach(([id, data]) => {
    const material = new THREE.SpriteMaterial({ map: makeSpriteTexture(false), depthTest: false, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(...data.position);
    sprite.scale.set(0.42, 0.42, 1);
    sprite.userData = { id, label: data.label };
    model.add(sprite);
    markers.push(sprite);
  });
  return markers;
}

function initViewer(host) {
  const mode = host.dataset.mode || 'hero';
  let renderer;
  try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'viewer-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.set(8.7, 5.2, 8.9);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.85, 0);
  controls.minDistance = 6;
  controls.maxDistance = 16;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.4;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.enablePan = false;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcad4e5, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(8, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcbe7ff, 0.9);
  fill.position.set(-7, 5, -6);
  scene.add(fill);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(4.75, 4.75, 0.16, 72),
    new THREE.MeshStandardMaterial({ color: '#edf2f9', roughness: 0.92, metalness: 0.02 })
  );
  platform.position.y = -0.12;
  platform.receiveShadow = true;
  scene.add(platform);

  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(4.65, 48),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.039;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const model = createBoardModel();
  model.rotation.y = THREE.MathUtils.degToRad(-28);
  model.rotation.x = THREE.MathUtils.degToRad(6);
  scene.add(model);

  let markers = [];
  let selectedId = 'mcu';
  if (mode === 'interactive') {
    markers = addHotspots(scene, model);
    const toolbar = document.createElement('div');
    toolbar.className = 'viewer-toolbar';
    toolbar.innerHTML = '<button type="button" data-action="reset">Reset</button><button type="button" data-action="spin">Pause spin</button>';
    host.appendChild(toolbar);
    const label = document.createElement('div');
    label.className = 'viewer-label';
    label.textContent = 'Drag to rotate · scroll to zoom · click a hotspot';
    host.appendChild(label);

    toolbar.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      if (button.dataset.action === 'reset') resetView();
      if (button.dataset.action === 'spin') {
        controls.autoRotate = !controls.autoRotate;
        button.textContent = controls.autoRotate ? 'Pause spin' : 'Resume spin';
      }
    });
  }

  function setActive(id) {
    selectedId = id;
    markers.forEach(sprite => {
      const active = sprite.userData.id === id;
      sprite.material.map = makeSpriteTexture(active);
      sprite.material.needsUpdate = true;
      sprite.scale.setScalar(active ? 0.52 : 0.42);
    });
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart = null;
  renderer.domElement.addEventListener('pointerdown', (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  renderer.domElement.addEventListener('pointerup', (event) => {
    if (mode !== 'interactive' || !pointerStart) return;
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (moved > 5) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(markers, false)[0];
    if (hit?.object?.userData?.id) {
      setActive(hit.object.userData.id);
      window.dispatchEvent(new CustomEvent('board:component-selected', { detail: { id: hit.object.userData.id } }));
    }
  });
  renderer.domElement.addEventListener('pointermove', (event) => {
    if (mode !== 'interactive') return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(markers, false)[0];
    renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
  });

  function resetView() {
    camera.position.set(8.7, 5.2, 8.9);
    controls.target.set(0, 0.85, 0);
    controls.update();
  }

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  window.addEventListener('board:resize', resize);
  window.addEventListener('board:reset', resetView);
  window.addEventListener('board:spin', (event) => {
    controls.autoRotate = Boolean(event.detail?.enabled);
  });
  window.addEventListener('board:focus-component', (event) => {
    const id = event.detail?.id;
    if (!id || mode !== 'interactive') return;
    setActive(id);
  });

  if (mode === 'interactive') setActive('mcu');

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    if (mode === 'hero') {
      model.position.y = Math.sin(elapsed * 1.2) * 0.05;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  viewers.push({ host, renderer, controls, camera, model, setActive });
  } catch (error) {
    console.error('Waveshare 3D viewer failed to initialize:', error);
    const notice = document.createElement('div');
    notice.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;color:#667085;font:14px Inter,Arial,sans-serif;background:#f7f9fc;';
    notice.textContent = 'The 3D model could not load. Check that the assets folder is uploaded and that this page can access the Three.js CDN.';
    host.appendChild(notice);
  }
}

document.querySelectorAll('.board-viewer').forEach(initViewer);
