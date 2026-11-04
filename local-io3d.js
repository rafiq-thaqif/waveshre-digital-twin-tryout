import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBoardModel } from './board3d.js';

const host = document.getElementById('local-io-3d');
if (host) initLocalLab(host);

function mat(color, roughness = 0.55, metalness = 0.08, emissive = '#000000') {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: 0.0 });
}
function addBox(parent, size, position, material, radius = 0) {
  const geometry = radius ? new THREE.BoxGeometry(...size) : new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function addCylinder(parent, radiusTop, radiusBottom, height, position, material, rotation = [0,0,0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32), material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function wire(parent, points, color, radius = 1.2) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.12 }));
  mesh.castShadow = true; parent.add(mesh); return mesh;
}
function textSprite(text, color = '#243244') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,512,128); ctx.fillStyle = color; ctx.font = '700 44px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text,256,64,490);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:texture, transparent:true, depthTest:false })); sprite.scale.set(34,8.5,1); return sprite;
}

function initLocalLab(host) {
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'local-io-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, host.clientWidth/host.clientHeight, 0.1, 1600);
  camera.position.set(260, 205, 330);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 28, 0); controls.enableDamping = true; controls.dampingFactor = 0.055; controls.enablePan = false; controls.minDistance = 190; controls.maxDistance = 560; controls.maxPolarAngle = 1.48; controls.autoRotate = false;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8f9bab, 1.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(220,360,240); key.castShadow = true; key.shadow.mapSize.set(1024,1024); scene.add(key);
  const fill = new THREE.DirectionalLight(0xd6eaff, 0.9); fill.position.set(-240,170,-180); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1100,900), new THREE.MeshStandardMaterial({color:'#f2f5f8',roughness:1})); floor.rotation.x=-Math.PI/2; floor.position.y=-4; floor.receiveShadow=true; scene.add(floor);
  const grid = new THREE.GridHelper(700,35,0xd7e0e9,0xe7edf2); grid.position.y=-3.5; grid.material.transparent=true; grid.material.opacity=.35; scene.add(grid);

  const board = createBoardModel();
  board.root.scale.setScalar(0.82);
  board.root.position.set(0,0,0);
  scene.add(board.root);

  // 24 V bench supply
  const supply = new THREE.Group(); scene.add(supply);
  const supplyBody = mat('#e6eaf0',.42,.25);
  addBox(supply,[54,30,42],[-132,17,-75],supplyBody);
  addBox(supply,[48,2,35],[-132,33,-75],mat('#f8fafc',.3,.1));
  addBox(supply,[17,9,3],[-146,23,-52],mat('#d9413b',.35,.1));
  addBox(supply,[17,9,3],[-119,23,-52],mat('#344050',.5,.1));
  const plusLabel = textSprite('+24V','#c83232'); plusLabel.position.set(-146,43,-75); supply.add(plusLabel);
  const zeroLabel = textSprite('0V','#3b4758'); zeroLabel.position.set(-119,43,-75); supply.add(zeroLabel);
  const supplyTitle = textSprite('24 V SUPPLY','#344054'); supplyTitle.position.set(-132,55,-75); supply.add(supplyTitle);

  // Push button
  const button = new THREE.Group(); scene.add(button);
  addBox(button,[34,8,34],[-132,5,44],mat('#303943',.62,.16));
  addCylinder(button,8,8,7,[-132,13,44],mat('#8b969f',.38,.55));
  const buttonCapMat = mat('#21a86a',.25,.08,'#0b4d2d');
  const buttonCap = addCylinder(button,11,10,9,[-132,21,44],buttonCapMat);
  const buttonLabel = textSprite('PUSH BUTTON','#344054'); buttonLabel.position.set(-132,52,44); button.add(buttonLabel);

  // Tower lamp
  const lamp = new THREE.Group(); scene.add(lamp);
  addBox(lamp,[32,8,32],[132,5,44],mat('#303943',.62,.16));
  addCylinder(lamp,7,8,10,[132,14,44],mat('#aeb7c0',.35,.5));
  const lampMat = new THREE.MeshStandardMaterial({color:'#7dbf4b',roughness:.24,metalness:.05,emissive:'#286b16',emissiveIntensity:.05});
  const lampGlobe = addCylinder(lamp,9,9,26,[132,32,44],lampMat);
  const lampCap = addCylinder(lamp,9,9,3,[132,46.5,44],mat('#20262d',.5,.12));
  const lampLabel = textSprite('24 V LAMP','#344054'); lampLabel.position.set(132,64,44); lamp.add(lampLabel);
  const lampLight = new THREE.PointLight(0x9df06a,0,105); lampLight.position.set(132,36,44); scene.add(lampLight);

  // A small visual DO1 indicator on the model, near the output terminal bank.
  const doLedMat = new THREE.MeshStandardMaterial({color:'#4a5865',roughness:.3,emissive:'#21b76c',emissiveIntensity:0});
  const doLed = addCylinder(board.root,2.4,2.4,1.5,[-45,42,40],doLedMat);

  // Educational wire routing: red = +24 V, green = DI1, orange = DO1, blue = 0 V.
  wire(scene,[[-146,25,-52],[-146,55,-12],[-146,42,20],[-132,26,44]],'#d83f37',1.65);
  wire(scene,[[-121,24,44],[-92,42,70],[-25,55,73],[7,38,33]],'#1b9a68',1.45);
  wire(scene,[[-132,18,-75],[-165,10,-25],[-155,8,80],[-95,8,88],[5,14,34]],'#3979c9',1.25);
  wire(scene,[[-132,24,-75],[-80,12,-112],[80,12,-112],[132,18,44]],'#d83f37',1.55);
  wire(scene,[[-31,38,33],[18,42,70],[83,45,76],[132,24,44]],'#df962a',1.55);
  wire(scene,[[-132,18,-75],[-100,7,-135],[80,7,-135],[130,18,44]],'#3979c9',1.2);

  const floating = textSprite('DI1 INPUT','#167b50'); floating.position.set(-10,75,68); scene.add(floating);
  const floating2 = textSprite('DO1 OUTPUT','#b97917'); floating2.position.set(65,75,75); scene.add(floating2);

  let pressed = false;
  function setPressed(state) {
    pressed = Boolean(state);
    buttonCap.position.y = pressed ? 17.5 : 21;
    buttonCapMat.emissiveIntensity = pressed ? .65 : .08;
    lampMat.emissiveIntensity = pressed ? 1.25 : .05;
    lampLight.intensity = pressed ? 2.2 : 0;
    doLedMat.emissiveIntensity = pressed ? 1.1 : 0;
    doLedMat.color.set(pressed ? '#2bd17b' : '#4a5865');
  }
  window.addEventListener('localio:state', event => setPressed(Boolean(event.detail?.di1 && event.detail?.do1)));
  window.addEventListener('localio:reset', () => setPressed(false));

  // Allow direct interaction with the 3D push button as well as the accessible HTML control.
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener('pointerdown', event => { down={x:event.clientX,y:event.clientY}; });
  renderer.domElement.addEventListener('pointerup', event => {
    if (!down) return; const moved=Math.hypot(event.clientX-down.x,event.clientY-down.y); down=null; if (moved>5) return;
    const rect=renderer.domElement.getBoundingClientRect(); pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObject(buttonCap,true);
    if (hits.length) window.dispatchEvent(new CustomEvent('localio:toggle'));
  });
  renderer.domElement.addEventListener('pointermove', event => {
    const rect=renderer.domElement.getBoundingClientRect(); pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,camera); renderer.domElement.style.cursor=raycaster.intersectObject(buttonCap,true).length?'pointer':'grab';
  });

  const resize = () => { const w=Math.max(1,host.clientWidth), h=Math.max(1,host.clientHeight); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); window.addEventListener('board:resize',resize);
  let inView=true; const io=new IntersectionObserver(entries=>{inView=Boolean(entries[0]?.isIntersecting);if(inView)resize();}); io.observe(host);
  function animate(){requestAnimationFrame(animate);if(!inView||document.visibilityState!=='visible')return;controls.update();renderer.render(scene,camera);}
  animate();
}
