import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const PARTS = {
  di:        { label: 'Digital inputs DI1–DI8', position: [-34, 27, 44], focus: 88 },
  do:        { label: 'Digital outputs DO1–DO8', position: [30, 27, 44], focus: 88 },
  power:     { label: '7–36 V power input', position: [73, 26, 44], focus: 80 },
  rs485:     { label: 'RS485 terminals', position: [-68, 27, -42], focus: 78 },
  can:       { label: 'CAN terminals', position: [-47, 27, -42], focus: 78 },
  usb:       { label: 'USB Type-C', position: [11, 24, -43], focus: 72 },
  ethernet:  { label: 'Ethernet / PoE', position: [40, 24, -43], focus: 76 },
  antenna:   { label: 'External antenna', position: [76, 30, -47], focus: 90 },
  mcu:       { label: 'ESP32-S3 controller', position: [0, 41, 0], focus: 90 },
  buzzer:    { label: 'Onboard buzzer', position: [-55, 41, 5], focus: 80 }
};

const material = (color, roughness = 0.65, metalness = 0.08) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

function roundedBox(parent, size, position, mat, radius = 2, segments = 3) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius), mat);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function box(parent, size, position, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, radius, height, position, mat, segments = 20, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), mat);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeTopLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111519';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4bd28a';
  ctx.fillRect(210, 78, 6, 830);
  ctx.fillRect(260, 365, 1525, 8);
  ctx.fillStyle = '#f3f5f6';
  ctx.font = '700 75px Arial';
  ctx.fillText('WAVESHARE', 260, 210);
  ctx.fillStyle = '#5fe19a';
  ctx.font = '800 100px Arial';
  ctx.fillText('W', 85, 205);
  ctx.fillStyle = '#f5f7f8';
  ctx.font = '700 64px Arial';
  ctx.fillText('ESP32-S3-POE-ETH-8DI-8DO', 260, 300);
  ctx.fillStyle = '#b8c2ca';
  ctx.font = '36px Arial';
  ctx.fillText('8CH DIGITAL INPUTS  ·  8CH DIGITAL OUTPUTS', 265, 350);

  ctx.fillStyle = '#69df9d';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('DIGITAL OUTPUTS', 235, 540);
  ctx.fillText('DIGITAL INPUTS', 1125, 540);
  ctx.fillStyle = '#e3e8ec';
  ctx.font = '26px Arial';
  ctx.fillText('COM  GND   8   7   6   5   4   3   2   1', 235, 590);
  ctx.fillText('COM  GND   8   7   6   5   4   3   2   1', 1125, 590);
  ctx.strokeStyle = '#d7e0e6';
  ctx.lineWidth = 5;
  for (let i = 0; i < 10; i++) {
    const x1 = 245 + i * 50;
    const x2 = 1135 + i * 50;
    ctx.strokeRect(x1, 620, 28, 32);
    ctx.strokeRect(x2, 620, 28, 32);
  }
  ctx.fillStyle = '#69df9d';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('7–36V', 1780, 720);
  ctx.fillStyle = '#e8eef2';
  ctx.font = 'bold 26px Arial';
  ctx.fillText('+     −', 1785, 770);
  ctx.fillStyle = '#7e8a95';
  ctx.font = '22px Arial';
  ctx.fillText('MODEL 32108  ·  INDUSTRIAL CONTROLLER', 260, 870);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function addTextPlane(parent, text, width, height, position, rotation, color = '#e9f0f5', fontSize = 18) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = color;
  ctx.font = `700 ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64, 500);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function createTerminalBank(parent, { centerX, z, width, count, label, front = true, accent = '#218c58' }) {
  const green = material(accent, 0.48, 0.04);
  const greenLip = material('#136e45', 0.55, 0.02);
  const screw = material('#b8c1c9', 0.3, 0.72);
  const slot = material('#66727b', 0.5, 0.3);
  const depth = 10;
  const y = 20;
  roundedBox(parent, [width, 13, depth], [centerX, y, z], green, 1.2, 3);
  box(parent, [width - 2, 1.6, 2], [centerX, y + 6.7, z + (front ? 2.7 : -2.7)], greenLip);
  const spacing = (width - 6) / count;
  for (let i = 0; i < count; i++) {
    const x = centerX - width / 2 + 3 + spacing * (i + 0.5);
    cylinder(parent, 1.45, 1.0, [x, y + 7.25, z], screw, 16);
    box(parent, [1.8, 0.25, 0.35], [x, y + 7.82, z], slot);
    roundedBox(parent, [Math.max(2.6, spacing - 1.2), 4.2, 0.8], [x, y - 1.2, z + (front ? 5.15 : -5.15)], material('#101820', 0.86, 0), 0.3, 2);
  }
  addTextPlane(parent, label, Math.min(width, 60), 4, [centerX, 29.5, z + (front ? 5.4 : -5.4)], [front ? 0 : 0, front ? 0 : Math.PI, 0], '#eff8f2', 22);
}

function createRj45(parent, x, z) {
  const black = material('#10171e', 0.55, 0.12);
  const inner = material('#070b0f', 0.9, 0.02);
  const metal = material('#9ba8b2', 0.25, 0.72);
  roundedBox(parent, [18, 16, 11], [x, 21, z], black, 1.3, 3);
  roundedBox(parent, [12.8, 10.5, 1.5], [x, 20.5, z - 5.6], inner, 0.7, 3);
  for (let i = 0; i < 8; i++) box(parent, [0.75, 0.6, 0.7], [x - 4.7 + i * 1.35, 24.3, z - 6.5], material('#d3a64d', 0.3, 0.65));
  box(parent, [15, 1.4, 1.2], [x, 27.5, z - 5.4], metal);
}

function createUsbC(parent, x, z) {
  const silver = material('#aeb9c3', 0.28, 0.78);
  const dark = material('#080d12', 0.75, 0.12);
  roundedBox(parent, [10, 5.6, 5], [x, 20.5, z], silver, 2.2, 4);
  roundedBox(parent, [7.2, 2.5, 1], [x, 20.5, z - 2.8], dark, 0.42, 4);
  box(parent, [5.4, 0.4, 0.5], [x, 20.5, z - 3.4], material('#8e9ba6', 0.3, 0.6));
}

function createAntenna(parent) {
  const gold = material('#b98a39', 0.3, 0.75);
  const black = material('#151a20', 0.84, 0.02);
  cylinder(parent, 4.2, 3.5, [76, 25, -41], gold, 24, [Math.PI / 2, 0, 0]);
  cylinder(parent, 2.7, 5, [76, 25, -45], black, 24, [Math.PI / 2, 0, 0]);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 62, 20), black);
  rod.position.set(76, 31, -76);
  rod.rotation.x = Math.PI / 2 - 0.13;
  rod.castShadow = true;
  parent.add(rod);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 12), black);
  cap.position.set(76, 35, -105);
  parent.add(cap);
}

function makeHotspotTexture(active = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.beginPath(); ctx.arc(64, 64, 43, 0, Math.PI * 2);
  ctx.fillStyle = active ? '#132235' : 'rgba(255,255,255,.97)'; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = active ? '#f2ad35' : '#2777c9'; ctx.stroke();
  ctx.fillStyle = active ? '#fff' : '#2777c9'; ctx.font = 'bold 76px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+', 64, 68);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

function createBoardModel() {
  const root = new THREE.Group();
  const shellGroup = new THREE.Group();
  const internalGroup = new THREE.Group();
  root.add(shellGroup, internalGroup);
  internalGroup.visible = false;

  const abs = material('#111519', 0.76, 0.05);
  const absEdge = material('#20262d', 0.72, 0.06);
  const metal = material('#8f9ba5', 0.3, 0.7);
  const darkMetal = material('#303941', 0.5, 0.6);
  const redLatch = material('#b73528', 0.55, 0.06);
  const green = material('#218b59', 0.48, 0.03);

  // 175 x 90 mm mounting flange and 40 mm enclosure height.
  roundedBox(shellGroup, [175, 5, 90], [0, 2.5, 0], absEdge, 3, 5);
  roundedBox(shellGroup, [158, 34, 72], [0, 22, 0], abs, 4, 6);
  roundedBox(shellGroup, [153, 1.3, 67], [0, 39.1, 0], material('#0d1115', 0.9, 0.02), 2, 4);

  // Printed top label: vector-drawn markings, not a photo texture.
  const labelTex = makeTopLabelTexture();
  const label = new THREE.Mesh(new THREE.PlaneGeometry(148, 64), new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide }));
  label.rotation.x = -Math.PI / 2;
  label.position.set(0, 39.85, 0);
  shellGroup.add(label);

  // Mounting ears and recessed fasteners.
  const holeMat = material('#05080b', 0.92, 0.02);
  const ringMat = material('#5d6872', 0.32, 0.6);
  for (const x of [-82, 82]) for (const z of [-38, 38]) {
    cylinder(shellGroup, 4.2, 0.9, [x, 5.25, z], ringMat, 24);
    cylinder(shellGroup, 2.5, 1.1, [x, 5.9, z], holeMat, 24);
  }

  // Front terminal banks: DO (COM/GND + 8 channels), DI (COM/GND + 8 channels), and DC supply.
  createTerminalBank(shellGroup, { centerX: -35, z: 39.2, width: 59, count: 10, label: 'DO1–DO8', front: true });
  createTerminalBank(shellGroup, { centerX: 31, z: 39.2, width: 59, count: 10, label: 'DI1–DI8', front: true });
  createTerminalBank(shellGroup, { centerX: 73, z: 39.2, width: 13, count: 2, label: '7–36V', front: true, accent: '#237e53' });

  // Rear connector edge: RS485, CAN, USB-C, Ethernet/PoE, header and antenna.
  createTerminalBank(shellGroup, { centerX: -68, z: -39.2, width: 19, count: 3, label: '485', front: false, accent: '#25895b' });
  createTerminalBank(shellGroup, { centerX: -45, z: -39.2, width: 19, count: 3, label: 'CAN', front: false, accent: '#25895b' });
  createUsbC(shellGroup, 2, -39.5);
  createRj45(shellGroup, 31, -39.5);
  // Small pin header and its gold pins.
  roundedBox(shellGroup, [16, 5, 7], [-18, 18, -39.2], material('#111820', 0.7, 0.08), 1, 3);
  for (let i = 0; i < 8; i++) {
    box(shellGroup, [1.0, 5.2, 1.0], [-24 + i * 1.7, 21.5, -40.2], material('#c5a052', 0.28, 0.7));
  }
  createAntenna(shellGroup);

  // Ventilation slots on both short ends.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      roundedBox(shellGroup, [1.2, 2.2, 42], [side * 79.4, 21 + (i - 1.5) * 5, 0], material('#05080b', 0.9, 0), 0.5, 2);
      roundedBox(shellGroup, [1.3, 0.8, 39], [side * 79.1, 21 + (i - 1.5) * 5, 0], material('#2b333a', 0.9, 0), 0.4, 2);
    }
  }

  // Red/orange locking tabs visible below the enclosure in the supplied photographs.
  for (const x of [-52, 52]) {
    roundedBox(shellGroup, [20, 3.5, 7], [x, 1.1, 42.7], redLatch, 1.2, 3);
    roundedBox(shellGroup, [8, 2.4, 4], [x, 0.5, 45], material('#d34a35', 0.52, 0.02), 0.8, 3);
  }
  // Small status windows and green printed port tags on the rear/top lip.
  for (let i = 0; i < 5; i++) {
    roundedBox(shellGroup, [10, 1.0, 3], [48 + i * 8, 39.3, -28], green, 0.42, 2);
  }

  // Conceptual internals: revealed only when the user selects "Show internals".
  const pcb = roundedBox(internalGroup, [145, 2.2, 62], [0, 19, 0], material('#176747', 0.6, 0.04), 1, 3);
  const goldPad = material('#c7a35c', 0.32, 0.72);
  for (let i = 0; i < 30; i++) {
    const x = -67 + (i % 15) * 9.5;
    const z = i < 15 ? -27 : 27;
    roundedBox(internalGroup, [4, 0.8, 2.8], [x, 20.6, z], goldPad, 0.4, 2);
  }
  // ESP32-S3 module / RF can.
  roundedBox(internalGroup, [35, 6, 25], [0, 24, -2], material('#aeb9c1', 0.28, 0.78), 2, 4);
  roundedBox(internalGroup, [28, 0.6, 18], [0, 27.3, -2], material('#d7dce0', 0.28, 0.65), 0.25, 3);
  addTextPlane(internalGroup, 'ESP32-S3-WROOM-1U', 27, 5, [0, 27.8, -2], [-Math.PI / 2, 0, 0], '#243342', 18);
  // W5500 and I/O expander.
  roundedBox(internalGroup, [17, 4, 16], [-43, 22.5, 3], material('#171d24', 0.42, 0.15), 1, 3);
  addTextPlane(internalGroup, 'W5500', 13, 4, [-43, 24.8, 3], [-Math.PI / 2, 0, 0], '#e9eff4', 22);
  roundedBox(internalGroup, [12, 3.5, 12], [37, 22.2, 6], material('#1a2027', 0.45, 0.12), 1, 3);
  addTextPlane(internalGroup, 'TCA9554', 10, 3, [37, 24.3, 6], [-Math.PI / 2, 0, 0], '#e9eff4', 18);
  // Isolated power section and optocoupler blocks.
  roundedBox(internalGroup, [27, 8, 17], [55, 24, -16], material('#242b32', 0.58, 0.15), 1, 3);
  for (let i = 0; i < 8; i++) {
    roundedBox(internalGroup, [5, 4, 6], [-59 + i * 8, 22.5, 15], material(i % 2 ? '#d6dbe0' : '#a7b3bc', 0.4, 0.4), 0.7, 2);
  }
  // On-board buzzer and RTC package.
  cylinder(internalGroup, 6.5, 5, [-59, 23, -15], material('#171d22', 0.72, 0.04), 28);
  roundedBox(internalGroup, [11, 3, 10], [56, 22, 16], material('#222a31', 0.45, 0.12), 1, 3);

  // Transparent shell overlay used for the exploded/internal view.
  return { root, shellGroup, internalGroup, label };
}

function createViewer(host) {
  const mode = host.dataset.viewer;
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1200);
  camera.position.set(245, 170, 265);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8d99a6, 1.45); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(210, 320, 240); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.camera.left = -230; key.shadow.camera.right = 230; key.shadow.camera.top = 230; key.shadow.camera.bottom = -230; scene.add(key);
  const fill = new THREE.DirectionalLight(0xd9eaff, 1.0); fill.position.set(-220, 140, -180); scene.add(fill);
  const rim = new THREE.PointLight(0xa9d7ff, 190, 500); rim.position.set(20, 170, 220); scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.MeshStandardMaterial({ color: '#f0f3f6', roughness: 1, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(600, 30, 0xd6dfe8, 0xe5eaf0); grid.position.y = -0.6; grid.material.transparent = true; grid.material.opacity = 0.34; scene.add(grid);
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(118, 118, 5, 80), material('#e7ecf1', 0.8, 0.02)); turntable.position.y = -3; turntable.receiveShadow = true; scene.add(turntable);

  const model = createBoardModel();
  model.root.position.y = 1;
  scene.add(model.root);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 20, 0); controls.enableDamping = true; controls.dampingFactor = 0.055; controls.enablePan = false; controls.minDistance = 75; controls.maxDistance = 600; controls.minPolarAngle = 0.28; controls.maxPolarAngle = 1.48;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.55;

  let markers = [];
  let selectedId = 'mcu';
  if (mode !== 'home') {
    const markerGroup = new THREE.Group(); model.root.add(markerGroup);
    Object.entries(PARTS).forEach(([id, part]) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeHotspotTexture(false), depthTest: false, depthWrite: false, transparent: true }));
      sprite.position.set(...part.position); sprite.scale.set(8.5, 8.5, 1); sprite.userData = { id, label: part.label }; markerGroup.add(sprite); markers.push(sprite);
    });
    const hint = document.createElement('div'); hint.className = 'viewer-hint'; hint.textContent = 'Select a component to pause rotation and zoom in'; host.appendChild(hint);
  }

  function setInternals(show) {
    model.internalGroup.visible = show;
    model.shellGroup.traverse(obj => {
      if (!obj.isMesh || !obj.material) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => { m.transparent = show; m.opacity = show ? 0.18 : 1; m.depthWrite = !show; m.needsUpdate = true; });
    });
  }

  function setMarkerActive(id) {
    selectedId = id;
    markers.forEach(sprite => {
      const active = sprite.userData.id === id;
      sprite.material.map = makeHotspotTexture(active); sprite.material.needsUpdate = true;
      sprite.scale.setScalar(active ? 11 : 8.5);
    });
  }

  let cameraAnimation = null;
  function focusPart(id) {
    const part = PARTS[id]; if (!part) return;
    controls.autoRotate = false;
    const target = new THREE.Vector3(...part.position);
    const direction = camera.position.clone().sub(controls.target).normalize();
    if (!Number.isFinite(direction.x) || direction.length() < 0.1) direction.set(0.65, 0.55, 0.65).normalize();
    const distance = part.focus || 88;
    const destination = target.clone().add(direction.multiplyScalar(distance));
    cameraAnimation = { start: performance.now(), duration: 780, fromPosition: camera.position.clone(), toPosition: destination, fromTarget: controls.target.clone(), toTarget: target };
    setMarkerActive(id);
  }

  function resetView(resume = true) {
    cameraAnimation = { start: performance.now(), duration: 650, fromPosition: camera.position.clone(), toPosition: new THREE.Vector3(245, 170, 265), fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(0, 20, 0) };
    if (resume) controls.autoRotate = true;
    if (mode !== 'home') markers.forEach(sprite => { sprite.material.map = makeHotspotTexture(false); sprite.material.needsUpdate = true; sprite.scale.setScalar(8.5); });
  }

  if (mode !== 'home') {
    const toolbar = document.createElement('div'); toolbar.className = 'viewer-controls';
    toolbar.innerHTML = '<button type="button" data-view-action="reset">Reset</button><button type="button" data-view-action="spin">Pause spin</button><button type="button" data-view-action="internals">Show internals</button>';
    host.appendChild(toolbar);
    toolbar.addEventListener('pointerdown', e => e.stopPropagation());
    toolbar.addEventListener('click', e => {
      const button = e.target.closest('button[data-view-action]'); if (!button) return;
      if (button.dataset.viewAction === 'reset') { resetView(true); toolbar.querySelector('[data-view-action="spin"]').textContent = 'Pause spin'; }
      if (button.dataset.viewAction === 'spin') { controls.autoRotate = !controls.autoRotate; button.textContent = controls.autoRotate ? 'Pause spin' : 'Resume spin'; }
      if (button.dataset.viewAction === 'internals') {
        const showing = !model.internalGroup.visible; setInternals(showing);
        button.textContent = showing ? 'Hide internals' : 'Show internals';
        controls.autoRotate = false;
        if (showing) focusPart('mcu');
      }
    });
  }

  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let down = null;
  if (mode !== 'home') {
    renderer.domElement.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    renderer.domElement.addEventListener('pointermove', e => {
      const rect = renderer.domElement.getBoundingClientRect(); pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(markers, false)[0]; renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
    });
    renderer.domElement.addEventListener('pointerup', e => {
      if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null; if (moved > 5) return;
      const rect = renderer.domElement.getBoundingClientRect(); pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects(markers, false)[0];
      if (hit?.object?.userData?.id) { const id = hit.object.userData.id; focusPart(id); window.dispatchEvent(new CustomEvent('board:component-selected', { detail: { id } })); }
    });
  }

  window.addEventListener('board:focus', e => { if (mode !== 'home' && e.detail?.id) focusPart(e.detail.id); });
  window.addEventListener('board:reset', () => resetView(true));
  window.addEventListener('board:spin', e => { controls.autoRotate = Boolean(e.detail?.enabled); });
  window.addEventListener('board:internals', e => { const show = Boolean(e.detail?.show); setInternals(show); });
  window.addEventListener('board:resize', () => resize());

  function resize() {
    const w = Math.max(1, host.clientWidth); const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  const visibility = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) resize(); }); visibility.observe(host);

  let inView = true;
  const viewportObserver = new IntersectionObserver(entries => { inView = Boolean(entries[0]?.isIntersecting); if (inView) resize(); });
  viewportObserver.observe(host);
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!inView || document.visibilityState !== 'visible') return;
    if (cameraAnimation) {
      const t = Math.min(1, (performance.now() - cameraAnimation.start) / cameraAnimation.duration);
      const eased = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(cameraAnimation.fromPosition, cameraAnimation.toPosition, eased);
      controls.target.lerpVectors(cameraAnimation.fromTarget, cameraAnimation.toTarget, eased);
      if (t >= 1) cameraAnimation = null;
    }
    controls.update(); renderer.render(scene, camera);
  }
  animate();
  host._cleanup = () => { observer.disconnect(); visibility.disconnect(); viewportObserver.disconnect(); controls.dispose(); renderer.dispose(); };
}

document.querySelectorAll('.three-host').forEach(createViewer);
