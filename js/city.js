/* THE CITY I BUILD: procedural scroll-driven city.
   Vanilla Three.js (vendored), no build step. The camera travels a
   spline of per-district poses keyed to the page's [data-district]
   sections; districts light up as their story scrolls past. */

import * as THREE from "../vendor/three.module.min.js";

const canvas = document.getElementById("city");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = window.matchMedia("(max-width: 860px)").matches;

if (!canvas) throw new Error("no #city canvas");

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  document.dispatchEvent(new CustomEvent("city:nogl"));
  throw e;
}
// The city is deliberately detail-rich. A modest DPR cap keeps it responsive
// on Retina displays without making the linework look soft.
renderer.setPixelRatio(Math.min(mobile ? 0.72 : 0.86, window.devicePixelRatio || 1));
renderer.setClearColor(0x000000, 0); // the dusk-sky gradient lives in CSS behind the canvas
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x140d08, mobile ? 0.008 : 0.0058);

const camera = new THREE.PerspectiveCamera(mobile ? 50 : 42, 1, 0.5, 600);

/* ---------------- palette: SODIUM & BRICK (lockstep with DESIGN.md) ---------------- */
const ACC = {
  gateway: 0xe89c3f, fintech: 0x2357ff, rescue: 0x0b9b68, infra: 0x7657ff,
  ailab: 0xff5c35, maaahr: 0xa64cff, atelier: 0xe9a200, hawsr: 0xff5c35, origins: 0xc9bca6,
};
const BUILD = new THREE.MeshStandardMaterial({ color: 0x342a1e, roughness: 0.8, metalness: 0.12, emissive: 0x160e07, emissiveIntensity: 1 });
const BUILD_DARK = new THREE.MeshStandardMaterial({ color: 0x241c13, roughness: 0.92, metalness: 0.08, emissive: 0x0e0906, emissiveIntensity: 1 });

/* ---------------- lights: dusk: warm sodium west, cool east fill ---------------- */
scene.add(new THREE.HemisphereLight(0x6b5136, 0x0e0a06, 1.7));
const sun = new THREE.DirectionalLight(0xffb066, 1.8);
sun.position.set(80, 35, -60); // low dusk sun
scene.add(sun);
const fill = new THREE.DirectionalLight(0x4a5570, 0.55);
fill.position.set(-60, 50, 40);
scene.add(fill);

/* ---------------- ground + drafting grid ---------------- */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(700, 700),
  new THREE.MeshStandardMaterial({ color: 0x0e0a07, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.05;
scene.add(ground);

const grid = new THREE.GridHelper(700, 140, 0x8a6636, 0x2e2214);
grid.material.transparent = true;
grid.material.opacity = 0;
scene.add(grid);

/* avenues: gateway → districts */
const CENTERS = {
  gateway: new THREE.Vector3(0, 0, 0),
  fintech: new THREE.Vector3(70, 0, 10),
  rescue: new THREE.Vector3(40, 0, 85),
  infra: new THREE.Vector3(-38, 0, 72),
  ailab: new THREE.Vector3(-6, 0, -72),
  maaahr: new THREE.Vector3(-48, 0, -52),
  atelier: new THREE.Vector3(46, 0, -60),
  hawsr: new THREE.Vector3(102, 0, -112),
  origins: new THREE.Vector3(-82, 0, -4),
};
const avenueMat = new THREE.LineBasicMaterial({ color: 0xe89c3f, transparent: true, opacity: 0.18 });
const lampPts = [];
for (const k of Object.keys(CENTERS)) {
  if (k === "gateway") continue;
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.06, 0), CENTERS[k].clone().setY(0.06),
  ]);
  scene.add(new THREE.Line(g, avenueMat));
  // sodium streetlamps pacing each avenue
  const end = CENTERS[k];
  const n = Math.round(end.length() / 9);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    lampPts.push(end.x * t + (Math.random() - 0.5) * 1.5, 1.1, end.z * t + (Math.random() - 0.5) * 1.5);
  }
}
/* lamp Points are created after the bridges push their own lamps (see below) */

/* ---------------- helpers ---------------- */
const rand = (a, b) => a + Math.random() * (b - a);
const ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
const smooth = (k) => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };

const risers = [];    // { mesh, delay } · intro rise animation
const districts = {}; // key → { group, edgeMat, light, placed }

/* soft radial glow texture, shared by lamps / stars / blinkers */
function glowTexture(inner, mid) {
  const cv2 = document.createElement("canvas");
  cv2.width = cv2.height = 64;
  const c2 = cv2.getContext("2d");
  const gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, inner);
  gr.addColorStop(0.35, mid);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  c2.fillStyle = gr;
  c2.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(cv2);
}

/* ================================================================
   THE TIGRIS: the river crosses the city; Origins sits on the far bank
   ================================================================ */
const riverCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-52, 0, -190),
  new THREE.Vector3(-70, 0, -95),
  new THREE.Vector3(-50, 0, -16),
  new THREE.Vector3(-66, 0, 52),
  new THREE.Vector3(-56, 0, 130),
  new THREE.Vector3(-70, 0, 200),
]);
{
  const SAMPLES = 90, HALF = 13;
  const pos = [], idx = [];
  const pts = riverCurve.getSpacedPoints(SAMPLES);
  for (let i = 0; i <= SAMPLES; i++) {
    const p = pts[i];
    const t = riverCurve.getTangent(i / SAMPLES);
    const nx = -t.z, nz = t.x; // perpendicular on the ground plane
    pos.push(p.x + nx * HALF, 0.02, p.z + nz * HALF, p.x - nx * HALF, 0.02, p.z - nz * HALF);
    if (i < SAMPLES) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const riverGeo = new THREE.BufferGeometry();
  riverGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  riverGeo.setIndex(idx);
  riverGeo.computeVertexNormals();
  const river = new THREE.Mesh(riverGeo, new THREE.MeshStandardMaterial({
    color: 0x0c1a1c, roughness: 0.25, metalness: 0.7,
    emissive: 0x07211f, emissiveIntensity: 0.7,
  }));
  scene.add(river);

  // banks: hairline teal edges
  const bankPos = [];
  for (let i = 0; i < SAMPLES; i++) {
    const a = i * 6, b = (i + 1) * 6;
    bankPos.push(pos[a], 0.06, pos[a + 2], pos[b], 0.06, pos[b + 2]);
    bankPos.push(pos[a + 3], 0.06, pos[a + 5], pos[b + 3], 0.06, pos[b + 5]);
  }
  const bankGeo = new THREE.BufferGeometry();
  bankGeo.setAttribute("position", new THREE.Float32BufferAttribute(bankPos, 3));
  scene.add(new THREE.LineSegments(bankGeo, new THREE.LineBasicMaterial({ color: 0x4fb8a8, transparent: true, opacity: 0.28 })));

  // moonlight glints drifting on the water
  const glintPts = [];
  for (let i = 0; i < (mobile ? 40 : 90); i++) {
    const p = riverCurve.getPointAt(Math.random());
    const t = riverCurve.getTangent(Math.random());
    const nx = -t.z, nz = t.x, off = rand(-HALF * 0.8, HALF * 0.8);
    glintPts.push(p.x + nx * off, 0.15, p.z + nz * off);
  }
  const glintGeo = new THREE.BufferGeometry();
  glintGeo.setAttribute("position", new THREE.Float32BufferAttribute(glintPts, 3));
  scene.add(new THREE.Points(glintGeo, new THREE.PointsMaterial({
    map: glowTexture("rgba(190,240,230,0.9)", "rgba(120,200,190,0.35)"),
    color: 0x9fe8dc, size: 1.1, sizeAttenuation: true,
    transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending,
  })));
}

/* two bridges over the river */
const BRIDGES = [
  { from: new THREE.Vector3(-40, 0, -2), to: new THREE.Vector3(-84, 0, -6) },   // gateway → origins avenue
  { from: new THREE.Vector3(-46, 0, 62), to: new THREE.Vector3(-88, 0, 52) },   // northern crossing
];
for (const b of BRIDGES) {
  const mid = b.from.clone().lerp(b.to, 0.5).setY(2.6);
  const deck = new THREE.QuadraticBezierCurve3(b.from.clone().setY(0.4), mid, b.to.clone().setY(0.4));
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(deck, 24, 0.5, 6, false),
    new THREE.MeshStandardMaterial({ color: 0x342a1e, roughness: 0.8, metalness: 0.15, emissive: 0x160e07 })
  );
  scene.add(tube);
  scene.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(tube.geometry, 30),
    new THREE.LineBasicMaterial({ color: 0xe89c3f, transparent: true, opacity: 0.35 })
  ));
  // lamps along the deck
  for (let i = 1; i < 5; i++) {
    const p = deck.getPointAt(i / 5);
    lampPts.push(p.x, p.y + 1.1, p.z);
  }
}

/* streetlamp Points cloud is created at the end of the LIFE section,
   after minarets have added their lantern positions */

/* ================================================================
   PALMS: line-drawn date palms along the banks and the plaza
   ================================================================ */
{
  const segs = [];
  function palm(x, z, h) {
    const lean = rand(-0.1, 0.1);
    let px = x, py = 0;
    const STEPS = 4;
    for (let i = 0; i < STEPS; i++) {   // gently curved trunk
      const nx2 = x + lean * (i + 1) * (i + 1) * 0.35, ny = (h / STEPS) * (i + 1);
      segs.push(px, py, z, nx2, ny, z);
      px = nx2; py = ny;
    }
    const cx = px, cy = py, cz = z;
    for (let f = 0; f < 8; f++) {       // fronds: smooth arcs, gentle droop
      const a = (f / 8) * Math.PI * 2 + rand(-0.15, 0.15);
      const len = rand(1.5, 2.2);
      const dx = Math.cos(a), dz = Math.sin(a);
      let lx = cx, ly = cy, lz = cz;
      for (let s = 1; s <= 3; s++) {
        const t = s / 3;
        const nx3 = cx + dx * len * t;
        const ny3 = cy + Math.sin(t * Math.PI * 0.85) * len * 0.4 - t * t * len * 0.28;
        const nz3 = cz + dz * len * t;
        segs.push(lx, ly, lz, nx3, ny3, nz3);
        lx = nx3; ly = ny3; lz = nz3;
      }
    }
  }
  const N = mobile ? 16 : 34;
  for (let i = 0; i < N; i++) {         // river banks
    const p = riverCurve.getPointAt(0.18 + 0.64 * (i / N));
    const t = riverCurve.getTangent(0.18 + 0.64 * (i / N));
    const nx = -t.z, nz = t.x;
    const side = i % 2 === 0 ? 1 : -1;
    if (side < 0 && p.z > 8 && p.z < 46) continue; // keep the madrasa forecourt clear
    const off = 13 + rand(2.5, 7);
    palm(p.x + nx * off * side, p.z + nz * off * side, rand(6, 9));
  }
  for (let i = 0; i < (mobile ? 4 : 8); i++) {  // gateway plaza ring
    const a = rand(0, Math.PI * 2), r = rand(27, 34);
    palm(Math.cos(a) * r, Math.sin(a) * r, rand(6, 8));
  }
  const palmGeo = new THREE.BufferGeometry();
  palmGeo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
  const palms = new THREE.LineSegments(palmGeo, new THREE.LineBasicMaterial({ color: 0x415A39, transparent: true, opacity: 0.55 }));
  scene.add(palms);
  risers.push({ mesh: palms, delay: 1.1 });
}

/* ================================================================
   SKY: stars and a crescent moon
   ================================================================ */
{
  const starPts = [];
  for (let i = 0; i < (mobile ? 120 : 240); i++) {
    const a = rand(0, Math.PI * 2), r = rand(120, 420);
    starPts.push(Math.cos(a) * r, rand(60, 260), Math.sin(a) * r);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    map: glowTexture("rgba(255,250,240,1)", "rgba(255,240,210,0.4)"),
    color: 0xfff4e0, size: 1.6, sizeAttenuation: true,
    transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
  })));

  const mc = document.createElement("canvas");
  mc.width = mc.height = 128;
  const m2 = mc.getContext("2d");
  m2.fillStyle = "rgba(255,240,214,0.95)";
  m2.beginPath(); m2.arc(64, 64, 34, 0, Math.PI * 2); m2.fill();
  m2.globalCompositeOperation = "destination-out";
  m2.beginPath(); m2.arc(84, 52, 32, 0, Math.PI * 2); m2.fill();
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(mc), transparent: true, opacity: 0.9,
    depthWrite: false,
  }));
  moon.position.set(170, 120, -240);
  moon.scale.setScalar(30);
  scene.add(moon);
}

/* ---------------- lit windows: the city comes alive after the rise ---------------- */
const winMats = [];
const WIN_COLORS = [0xffc98a, 0xffc98a, 0xffc98a, 0xffb870, 0xbfe3dc, 0x9a7748];
const winGeo = new THREE.PlaneGeometry(0.55, 0.8);
let winBudget = mobile ? 900 : 1800;

function buildWindows(group, cells) {
  if (winBudget <= 0 || !cells.length) return;
  const slots = [];
  const density = mobile ? 0.2 : 0.32;
  for (const c of cells) {
    const faces = [
      { rx: 0, dx: 0, dz: c.d / 2 + 0.03, along: "x", span: c.w },
      { rx: Math.PI, dx: 0, dz: -c.d / 2 - 0.03, along: "x", span: c.w },
      { rx: Math.PI / 2, dx: c.w / 2 + 0.03, dz: 0, along: "z", span: c.d },
      { rx: -Math.PI / 2, dx: -c.w / 2 - 0.03, dz: 0, along: "z", span: c.d },
    ];
    for (const f of faces) {
      const cols = Math.max(1, Math.floor((f.span - 1) / 1.5));
      const rows = Math.max(1, Math.floor((c.h - 1.4) / 2.1));
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        if (Math.random() > density) continue;
        const off = (q - (cols - 1) / 2) * 1.5;
        slots.push({
          x: c.x + f.dx + (f.along === "x" ? off : 0),
          y: 1.4 + r * 2.1,
          z: c.z + f.dz + (f.along === "z" ? off : 0),
          ry: f.rx,
        });
      }
    }
  }
  const count = Math.min(slots.length, winBudget);
  winBudget -= count;
  const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide });
  const im = new THREE.InstancedMesh(winGeo, mat, count);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const s = slots[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.ry, 0);
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
    im.setColorAt(i, col.setHex(WIN_COLORS[Math.floor(Math.random() * WIN_COLORS.length)]));
  }
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  group.add(im);
  winMats.push(mat);
}

function addBuilding(group, x, z, w, h, d, edgeMat, mat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(0, h / 2, 0); // origin at the ground → scale.y rises from the blueprint
  const m = new THREE.Mesh(geo, mat || BUILD);
  m.position.set(x, 0, z);
  group.add(m);
  if (edgeMat) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    e.position.copy(m.position);
    group.add(e);
    m.userData.edge = e;
  }
  return m;
}

/* ---------------- district landmark kit ----------------
   Every project gets the same dark, low-poly material language.
   Brand artwork stays flat and exact on small 3D signs while the
   surrounding object is real geometry, so the city remains light. */
const textureLoader = new THREE.TextureLoader();
const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
const ASSET = {
  qi: new URL("../assets/districts/qi-mark.svg", import.meta.url).href,
  cardyMascot: new URL("../assets/districts/cardy-mascot.webp", import.meta.url).href,
  cardyLogo: new URL("../assets/districts/cardy-logo.webp", import.meta.url).href,
  asheerty: new URL("../assets/districts/asheerty-icon.webp", import.meta.url).href,
  sadeek: new URL("../assets/districts/sadeek-mascot.webp", import.meta.url).href,
};
const landmarks = [];

function districtMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: opts.color || color,
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.28,
    emissive: opts.emissive ?? color,
    emissiveIntensity: opts.emissiveIntensity ?? 0.11,
    transparent: opts.transparent || false,
    opacity: opts.opacity ?? 1,
    depthWrite: opts.depthWrite ?? !opts.transparent,
    side: opts.side || THREE.FrontSide,
  });
}

function outlined(parent, geometry, material, position, rotation, color, opacity = 0.62) {
  const root = new THREE.Group();
  if (position) root.position.copy(position);
  if (rotation) root.rotation.copy(rotation);
  const mesh = new THREE.Mesh(geometry, material);
  root.add(mesh);
  // Edge extraction is useful on architectural solids but surprisingly costly
  // on curved meshes. Smooth sculptures get their shape from light instead.
  const edgeFriendly = geometry.type === "BoxGeometry" ||
    geometry.type === "CylinderGeometry" || geometry.type === "ConeGeometry";
  if (edgeFriendly) {
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 28),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
    root.add(edge);
  }
  parent.add(root);
  return root;
}

function box(parent, size, position, rotation, material, color, opacity) {
  return outlined(
    parent,
    new THREE.BoxGeometry(size.x, size.y, size.z),
    material,
    position,
    rotation || new THREE.Euler(),
    color,
    opacity
  );
}

function tubeBetween(parent, a, b, radius, material, color, opacity = 0.6, segments = 8) {
  const dir = b.clone().sub(a);
  const root = outlined(
    parent,
    new THREE.CylinderGeometry(radius, radius, dir.length(), segments),
    material,
    a.clone().add(b).multiplyScalar(0.5),
    new THREE.Euler(),
    color,
    opacity
  );
  root.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return root;
}

function curveTube(parent, points, radius, material, color, opacity = 0.6) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 28, radius, 7, false);
  return outlined(parent, geometry, material, new THREE.Vector3(), null, color, opacity);
}

function loadBrand(url, material) {
  textureLoader.load(url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    material.map = texture;
    material.color.setHex(0xffffff);
    material.needsUpdate = true;
  });
}

function brandPanel(parent, url, width, height, position, rotation, color, opts = {}) {
  const root = new THREE.Group();
  root.position.copy(position);
  root.rotation.copy(rotation || new THREE.Euler());
  parent.add(root);
  const depth = opts.depth || 0.65;
  box(
    root,
    new THREE.Vector3(width, height, depth),
    new THREE.Vector3(),
    null,
    opts.backing || BUILD_DARK,
    color,
    0.72
  );
  const faceMat = new THREE.MeshBasicMaterial({
    color: opts.placeholder || color,
    transparent: true,
    alphaTest: opts.alphaTest ?? 0.02,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  loadBrand(url, faceMat);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(width * (opts.faceScaleX || 0.88), height * (opts.faceScaleY || 0.82)),
    faceMat
  );
  face.position.z = depth / 2 + 0.015;
  root.add(face);
  return root;
}

function canvasTexture(width, height, draw) {
  const cv = document.createElement("canvas");
  cv.width = width; cv.height = height;
  const cx = cv.getContext("2d");
  draw(cx, width, height);
  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function canvasPanel(parent, texture, width, height, position, rotation, color) {
  const root = new THREE.Group();
  root.position.copy(position);
  root.rotation.copy(rotation || new THREE.Euler());
  parent.add(root);
  box(root, new THREE.Vector3(width, height, 0.62), new THREE.Vector3(), null, BUILD_DARK, color, 0.7);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.92, height * 0.92),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
  );
  face.position.z = 0.326;
  root.add(face);
  return root;
}

function registerLandmark(key, root, baseRotation, bob = 0.16, sway = 0.025, animate = null) {
  const landmark = {
    key, root, baseRotation, baseY: root.position.y, bob, sway, animate,
    phase: rand(0, 6.28), reveal: 0,
  };
  root.visible = false;
  landmarks.push(landmark);
  return landmark;
}

function makeDistrict(key, opts) {
  const c = CENTERS[key];
  const group = new THREE.Group();
  group.position.copy(c);
  scene.add(group);

  const edgeMat = new THREE.LineBasicMaterial({ color: ACC[key], transparent: true, opacity: 0.24 });
  const light = new THREE.PointLight(ACC[key], 120, 130, 2);
  light.position.set(0, 20, 0);
  group.add(light);

  const n = Math.round((opts.n ?? 24) * (mobile ? 0.55 : 1));
  const placed = [];
  for (let i = 0; i < n; i++) {
    let x, z, ok = false, tries = 0;
    let w = rand(opts.wMin || 3, opts.wMax || 7);
    let d = rand(opts.wMin || 3, opts.wMax || 7);
    while (!ok && tries++ < 20) {
      x = rand(-opts.r, opts.r); z = rand(-opts.r, opts.r);
      if (Math.hypot(x, z) > opts.r) continue;
      if (opts.hole && Math.hypot(x, z) < opts.hole) continue;
      ok = placed.every((p) => Math.abs(p.x - x) > (p.w + w) / 2 + 1 || Math.abs(p.z - z) > (p.d + d) / 2 + 1);
    }
    if (!ok) continue;
    const h = rand(opts.hMin || 4, opts.hMax || 16);
    placed.push({ x, z, w, d, h });
    const withEdge = Math.random() < (opts.edgeP ?? 0.55);
    const m = addBuilding(group, x, z, w, h, d, withEdge ? edgeMat : null, opts.mat);
    risers.push({ mesh: m, delay: (c.length() + Math.hypot(x, z)) * 0.012 + Math.random() * 0.25 });
  }
  if (opts.windows !== false) buildWindows(group, placed);
  districts[key] = { group, edgeMat, light, base: 120, placed };
  return group;
}

/* ---------------- districts ---------------- */

/* Central Gateway: the Hands of Victory (crossed swords) + ring of stat monoliths */
{
  const g = new THREE.Group();
  scene.add(g);
  const edgeMat = new THREE.LineBasicMaterial({ color: ACC.gateway, transparent: true, opacity: 0.6 });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xd9cfba, metalness: 0.85, roughness: 0.3,
    emissive: 0x3a342a, emissiveIntensity: 0.55,
  });
  // one hand rising from the ground, sword arcing to cross at the apex
  const mkHand = (side, delay) => {
    // mound plinth
    const plinthGeo = new THREE.CylinderGeometry(1.6, 3.2, 2.6, 10);
    plinthGeo.translate(0, 1.3, 0);
    const plinth = new THREE.Mesh(plinthGeo, BUILD_DARK);
    plinth.position.set(side * 13, 0, 0);
    g.add(plinth);
    const pe = new THREE.LineSegments(new THREE.EdgesGeometry(plinthGeo, 30), edgeMat);
    pe.position.copy(plinth.position);
    g.add(pe);
    plinth.userData.edge = pe;
    risers.push({ mesh: plinth, delay });
    // forearm leaning toward the center, fist at the top
    const armCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 13, 2.2, 0),
      new THREE.Vector3(side * 12.2, 5.2, 0),
      new THREE.Vector3(side * 10.6, 7.4, 0)
    );
    const armGeo = new THREE.TubeGeometry(armCurve, 10, 1.05, 7, false);
    const arm = new THREE.Mesh(armGeo, BUILD_DARK);
    g.add(arm);
    risers.push({ mesh: arm, delay: delay + 0.15 });
    const fistGeo = new THREE.SphereGeometry(1.5, 10, 8);
    fistGeo.translate(side * 10.6, 7.6, 0);
    const fist = new THREE.Mesh(fistGeo, BUILD_DARK);
    g.add(fist);
    const fe = new THREE.LineSegments(new THREE.EdgesGeometry(fistGeo, 40), edgeMat);
    g.add(fe);
    fist.userData.edge = fe;
    risers.push({ mesh: fist, delay: delay + 0.25 });
    // the sword: guard, then the long blade arcing past the center
    const guardGeo = new THREE.BoxGeometry(2.6, 0.5, 0.9);
    guardGeo.translate(side * 10.2, 8.9, 0);
    const guard = new THREE.Mesh(guardGeo, bladeMat);
    g.add(guard);
    risers.push({ mesh: guard, delay: delay + 0.3 });
    const bladeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 10.2, 9.1, 0),
      new THREE.Vector3(side * 5.2, 16.8, 0),
      new THREE.Vector3(-side * 2.6, 21.2, 0)
    );
    const bladeGeo = new THREE.TubeGeometry(bladeCurve, 22, 0.42, 6, false);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    g.add(blade);
    const be = new THREE.LineSegments(new THREE.EdgesGeometry(bladeGeo, 30), edgeMat);
    g.add(be);
    blade.userData.edge = be;
    risers.push({ mesh: blade, delay: delay + 0.4 });
  };
  mkHand(-1, 0.05);
  mkHand(1, 0.15);
  // monolith ring
  const monoGeo = new THREE.BoxGeometry(3.4, 9, 1.1);
  monoGeo.translate(0, 4.5, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const m = new THREE.Mesh(monoGeo, BUILD_DARK);
    m.position.set(Math.cos(a) * 17, 0, Math.sin(a) * 17);
    m.rotation.y = -a + Math.PI / 2;
    g.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(monoGeo), edgeMat);
    e.position.copy(m.position); e.rotation.copy(m.rotation);
    g.add(e);
    m.userData.edge = e;
    risers.push({ mesh: m, delay: 0.3 + i * 0.08 });
  }
  const light = new THREE.PointLight(ACC.gateway, 160, 100, 2);
  light.position.set(0, 14, 0);
  g.add(light);
  districts.gateway = { group: g, edgeMat, light, base: 160 };
}

makeDistrict("fintech", { r: 28, hole: 20, n: 0, hMin: 8, hMax: 28, wMin: 3, wMax: 6, edgeP: 0.7 });
makeDistrict("infra", { r: 26, hole: 18, n: 0, hMin: 3, hMax: 8, wMin: 7, wMax: 13, edgeP: 0.5 });
makeDistrict("origins", { r: 22, n: 18, hMin: 2, hMax: 10, wMin: 4, wMax: 8, edgeP: 0.9, mat: BUILD_DARK });
makeDistrict("maaahr", { r: 21, hole: 16, n: 0, hMin: 3, hMax: 9, wMin: 4, wMax: 7, edgeP: 0.6 });
makeDistrict("hawsr", { r: 27, hole: 20, n: 0, hMin: 4, hMax: 14, wMin: 4, wMax: 8, edgeP: 0.75 });

/* AI Lab: floating translucent slabs over low plinths */
{
  const g = makeDistrict("ailab", { r: 24, hole: 17, n: 0, hMin: 2, hMax: 6, wMin: 4, wMax: 8, edgeP: 0.4 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xff8a6b, transparent: true, opacity: 0.13, roughness: 0.15, metalness: 0.6,
    emissive: 0xff8a6b, emissiveIntensity: 0.06, depthWrite: false,
  });
  districts.ailab.floaters = [];
  for (let i = 0; i < (mobile ? 3 : 5); i++) {
    const geo = new THREE.BoxGeometry(rand(5, 10), rand(1, 2.2), rand(5, 10));
    const s = new THREE.Mesh(geo, glass);
    s.position.set(rand(-14, 14), rand(9, 18), rand(-14, 14));
    g.add(s);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), districts.ailab.edgeMat);
    e.position.copy(s.position);
    g.add(e);
    districts.ailab.floaters.push({ mesh: s, edge: e, y: s.position.y, ph: rand(0, 6.28) });
  }
}

/* Rescue district: broken → repaired on scroll + expanding venue network */
const rescueParts = [];
{
  /* no windows here: its buildings fly apart and repair; lights come from the venue network */
  const g = makeDistrict("rescue", { r: 27, hole: 18, n: 0, hMin: 5, hMax: 16, wMin: 3, wMax: 7, edgeP: 0.7, windows: false });
  g.children.forEach((child) => {
    if (!child.isMesh) return;
    rescueParts.push({
      obj: child,
      home: { p: child.position.clone(), r: new THREE.Euler() },
      broke: {
        p: child.position.clone().add(new THREE.Vector3(rand(-7, 7), rand(2, 9), rand(-7, 7))),
        r: new THREE.Euler(rand(-0.5, 0.5), rand(-0.6, 0.6), rand(-0.5, 0.5)),
      },
    });
  });
  // venue network overlay
  const hub = new THREE.Vector3(0, 10, 0);
  const nodeMat = new THREE.MeshBasicMaterial({ color: ACC.rescue });
  const netPts = [];
  districts.rescue.nodes = [];
  for (let i = 0; i < 9; i++) {
    const a = rand(0, Math.PI * 2), r = rand(11, 22);
    const p = new THREE.Vector3(Math.cos(a) * r, rand(6, 14), Math.sin(a) * r);
    netPts.push(hub.clone(), p);
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), nodeMat);
    node.position.copy(p);
    node.scale.setScalar(0.001);
    g.add(node);
    districts.rescue.nodes.push(node);
  }
  const netGeo = new THREE.BufferGeometry().setFromPoints(netPts);
  const net = new THREE.LineSegments(netGeo, new THREE.LineBasicMaterial({ color: ACC.rescue, transparent: true, opacity: 0.5 }));
  net.geometry.setDrawRange(0, 0);
  g.add(net);
  districts.rescue.net = net;
  districts.rescue.netCount = netPts.length;
}

/* Fintech payment rails: glowing curves with travelling packets */
const packets = [];
{
  const g = districts.fintech.group;
  const railMat = new THREE.LineBasicMaterial({ color: ACC.fintech, transparent: true, opacity: 0.35 });
  const dotGeo = new THREE.SphereGeometry(0.32, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: ACC.fintech });
  for (let r = 0; r < 3; r++) {
    const pts = [];
    for (let i = 0; i < 5; i++) pts.push(new THREE.Vector3(rand(-24, 24), 0.4 + r * 0.2, rand(-24, 24)));
    pts.push(pts[0].clone());
    const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.6);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
    g.add(new THREE.Line(lineGeo, railMat));
    for (let i = 0; i < (mobile ? 2 : 4); i++) {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      g.add(dot);
      packets.push({ curve, t: Math.random(), speed: rand(0.02, 0.045), mesh: dot });
    }
  }
}

/* Infra: packet loop with a red retry lane */
{
  const g = districts.infra.group;
  const loopPts = [
    new THREE.Vector3(-16, 2.5, -10), new THREE.Vector3(16, 2.5, -10),
    new THREE.Vector3(16, 2.5, 10), new THREE.Vector3(-16, 2.5, 10),
  ];
  const curve = new THREE.CatmullRomCurve3(loopPts, true, "catmullrom", 0.15);
  g.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)),
    new THREE.LineBasicMaterial({ color: ACC.infra, transparent: true, opacity: 0.4 })
  ));
  const retry = new THREE.CatmullRomCurve3([
    new THREE.Vector3(16, 2.5, 10), new THREE.Vector3(22, 5, 0), new THREE.Vector3(16, 2.5, -10),
  ]);
  g.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(retry.getPoints(30)),
    new THREE.LineBasicMaterial({ color: 0xd98a6a, transparent: true, opacity: 0.35 })
  ));
  const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  for (let i = 0; i < (mobile ? 4 : 8); i++) {
    const fail = i % 4 === 0;
    const mesh = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: fail ? 0xd98a6a : ACC.infra }));
    g.add(mesh);
    packets.push({ curve, alt: fail ? retry : null, t: i / 8, speed: 0.05, mesh, phase: 0 });
  }
}

/* Maaahr: circular waveform */
let wave, wavePts;
{
  const g = districts.maaahr.group;
  wavePts = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    wavePts.push(new THREE.Vector3(Math.cos(a) * 7, 6, Math.sin(a) * 7));
  }
  wave = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(wavePts),
    new THREE.LineBasicMaterial({ color: ACC.maaahr, transparent: true, opacity: 0.8 })
  );
  g.add(wave);
}

/* Atelier: golden tree grows with scroll */
let tree, treeCount = 0;
{
  const g = makeDistrict("atelier", { r: 23, hole: 16, n: 0, hMin: 2, hMax: 7, wMin: 4, wMax: 7, edgeP: 0.6 });
  const segs = [];
  const queue = [{ p: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(0, 1, 0), len: 5.5, depth: 0 }];
  while (queue.length) {
    const b = queue.shift();
    const end = b.p.clone().addScaledVector(b.dir, b.len);
    segs.push({ a: b.p, b: end, depth: b.depth });
    if (b.depth < 5) {
      const kids = b.depth === 0 ? 3 : 2;
      for (let i = 0; i < kids; i++) {
        const dir = b.dir.clone()
          .applyAxisAngle(new THREE.Vector3(1, 0, 0), rand(-0.55, 0.55))
          .applyAxisAngle(new THREE.Vector3(0, 0, 1), rand(-0.55, 0.55))
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), rand(0, 6.28))
          .normalize();
        dir.y = Math.abs(dir.y) * 0.9 + 0.25;
        queue.push({ p: end, dir: dir.normalize(), len: b.len * 0.72, depth: b.depth + 1 });
      }
    }
  }
  segs.sort((x, y) => x.depth - y.depth);
  const pts = [];
  segs.forEach((s) => pts.push(s.a, s.b));
  treeCount = pts.length;
  tree = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: ACC.atelier, transparent: true, opacity: 0.95 })
  );
  tree.geometry.setDrawRange(0, 0);
  g.add(tree);
}

/* ================================================================
   PROJECT LANDMARKS: one readable 3D object per district
   ================================================================ */

/* Fintech: Qi card, Tasdid bill, notes and coin stacks */
function buildFintechLandmark() {
  const root = new THREE.Group();
  root.position.set(10, 0, 6);
  root.rotation.y = -0.5;
  districts.fintech.group.add(root);
  const accent = districtMat(ACC.fintech, { metalness: 0.38, roughness: 0.48 });
  const gold = districtMat(0xf3cd00, { metalness: 0.58, roughness: 0.36, emissiveIntensity: 0.08 });
  const paper = districtMat(0xf4f1e8, { metalness: 0.06, roughness: 0.88, emissive: 0x3d392f, emissiveIntensity: 0.05 });
  outlined(root, new THREE.CylinderGeometry(11, 12, 0.8, 24), BUILD_DARK, new THREE.Vector3(0, 0.4, 0), null, ACC.fintech, 0.75);

  const billTexture = canvasTexture(512, 700, (cx, w, h) => {
    cx.fillStyle = "#f4f1e8"; cx.fillRect(0, 0, w, h);
    cx.fillStyle = "#2357ff"; cx.fillRect(0, 0, w, 94);
    cx.fillStyle = "#ffffff"; cx.font = "700 42px Inter, sans-serif"; cx.fillText("TASDID+", 34, 61);
    cx.fillStyle = "#11130f"; cx.font = "700 34px Inter, sans-serif"; cx.fillText("BILL", 34, 158);
    cx.fillStyle = "#777b71";
    for (let i = 0; i < 5; i++) cx.fillRect(34, 210 + i * 62, i === 4 ? 220 : 390, 16);
    cx.fillStyle = "#2357ff"; cx.fillRect(34, 555, 444, 92);
    cx.fillStyle = "#ffffff"; cx.beginPath(); cx.arc(78, 601, 22, 0, Math.PI * 2); cx.fill();
  });
  const billPanel = canvasPanel(root, billTexture, 7.6, 10.4, new THREE.Vector3(-5.2, 7, 0.8), new THREE.Euler(0.02, 0.16, -0.08), ACC.fintech);
  const qiCard = brandPanel(
    root, ASSET.qi, 10.8, 6.6,
    new THREE.Vector3(4.2, 8.6, 1.3),
    new THREE.Euler(-0.05, -0.18, 0.08),
    0xf3cd00,
    { faceScaleX: 0.3, faceScaleY: 0.54, placeholder: 0xf3cd00 }
  );
  box(qiCard, new THREE.Vector3(5.4, 0.16, 0.08), new THREE.Vector3(1.5, -2.1, 0.4), null, paper, 0xf3cd00, 0.25);
  const coins = [];
  for (let stack = 0; stack < 3; stack++) {
    const x = 1.5 + stack * 2.25;
    const count = 2 + stack;
    for (let i = 0; i < count; i++) {
      const coin = outlined(root, new THREE.CylinderGeometry(1, 1, 0.42, 18), gold, new THREE.Vector3(x, 0.9 + i * 0.44, 4.4), null, 0xffe47a, 0.6);
      coin.userData.baseY = coin.position.y;
      coin.userData.order = coins.length;
      coins.push(coin);
    }
  }
  for (let i = 0; i < 3; i++) {
    box(root, new THREE.Vector3(5.6, 0.16, 2.6), new THREE.Vector3(-5 + i * 0.45, 1.05 + i * 0.2, 4.1 + i * 0.3), new THREE.Euler(0, -0.18 + i * 0.12, 0), paper, ACC.fintech, 0.45);
  }
  registerLandmark("fintech", root, root.rotation.y, 0.1, 0.014, (t, dt, show, on) => {
    const energy = on ? 1 : 0.22;
    billPanel.rotation.z = -0.08 + Math.sin(t * 0.38) * 0.018 * energy;
    qiCard.rotation.z = 0.08 - Math.sin(t * 0.34 + 1) * 0.02 * energy;
    qiCard.position.y = 8.6 + Math.sin(t * 0.62 + 0.8) * 0.16 * energy;
    coins.forEach((coin) => {
      const arrive = smooth(show * 2.2 - coin.userData.order * 0.075);
      coin.scale.setScalar(Math.max(0.001, arrive));
      coin.position.y = coin.userData.baseY + Math.sin(t * 0.9 + coin.userData.order * 0.7) * 0.035 * energy;
    });
  });
}

/* SportsTech: the real Cardy artwork staged as a kinetic membership object */
function buildCardyLandmark() {
  const root = new THREE.Group();
  root.position.set(2, 0, -7);
  root.rotation.y = 0.76;
  districts.rescue.group.add(root);
  const green = districtMat(ACC.rescue, { roughness: 0.38, metalness: 0.42, emissiveIntensity: 0.16 });
  const glass = districtMat(ACC.rescue, { transparent: true, opacity: 0.14, roughness: 0.2, metalness: 0.6 });
  const ivory = districtMat(0xf4f1e8, { roughness: 0.82, metalness: 0.04, emissive: 0x2b332a, emissiveIntensity: 0.04 });
  outlined(root, new THREE.CylinderGeometry(10.5, 11.5, 0.7, 32), BUILD_DARK, new THREE.Vector3(0, 0.35, 0), null, ACC.rescue, 0.72);

  const stage = new THREE.Group();
  stage.position.set(mobile ? -2.2 : -24.4, 0.8, 1.2);
  stage.scale.setScalar(1.24);
  root.add(stage);

  // A clover-shaped kinetic halo borrows the mascot silhouette without
  // attempting to redraw the mascot itself.
  const halo = new THREE.Group();
  halo.position.set(0, 8.2, -0.7);
  stage.add(halo);
  const petals = [[0, 3.1, 0], [-2.8, 0.6, 0.12], [2.8, 0.6, -0.12], [0, -2.1, 0.06]];
  const haloPetals = petals.map(([x, y, z], i) => {
    const petal = outlined(
      halo,
      new THREE.TorusGeometry(2.85, i === 0 ? 0.13 : 0.1, 8, 48),
      i % 2 ? glass : green,
      new THREE.Vector3(x, y, z),
      new THREE.Euler(0, 0, i * 0.06),
      ACC.rescue,
      0.58
    );
    petal.scale.set(i === 0 ? 0.9 : 1.08, i === 0 ? 1.1 : 0.82, 1);
    return petal;
  });

  const mascotCard = brandPanel(
    stage, ASSET.cardyMascot, 6.1, 11.6,
    new THREE.Vector3(-0.2, 8, 1.8),
    new THREE.Euler(-0.035, 0.06, -0.025),
    ACC.rescue,
    { depth: 0.5, faceScaleX: 0.84, faceScaleY: 0.92 }
  );
  const logoCard = brandPanel(
    stage, ASSET.cardyLogo, 10.6, 2.15,
    new THREE.Vector3(3, 2.8, 2.7),
    new THREE.Euler(-0.05, -0.12, 0.035),
    ACC.rescue,
    { depth: 0.42, faceScaleX: 0.9, faceScaleY: 0.72 }
  );

  // Member tokens move around the piece like people entering venues.
  const tokenRail = new THREE.Group();
  tokenRail.position.set(0, 6.8, 0);
  stage.add(tokenRail);
  const tokens = [];
  for (let i = 0; i < 8; i++) {
    const token = outlined(
      tokenRail,
      new THREE.CylinderGeometry(0.62, 0.62, 0.22, 20),
      i % 3 === 0 ? ivory : green,
      new THREE.Vector3(),
      new THREE.Euler(Math.PI / 2, 0, 0),
      ACC.rescue,
      0.58
    );
    token.userData.angle = (i / 8) * Math.PI * 2;
    token.userData.radius = 7.4 + (i % 2) * 0.8;
    tokens.push(token);
  }

  const gate = new THREE.Group();
  gate.position.set(6.5, 0.8, -0.8);
  stage.add(gate);
  box(gate, new THREE.Vector3(0.65, 5.6, 0.65), new THREE.Vector3(-2.1, 2.8, 0), null, glass, ACC.rescue, 0.5);
  box(gate, new THREE.Vector3(0.65, 5.6, 0.65), new THREE.Vector3(2.1, 2.8, 0), null, glass, ACC.rescue, 0.5);
  curveTube(gate, [
    new THREE.Vector3(-2.1, 5.5, 0),
    new THREE.Vector3(0, 7, 0.3),
    new THREE.Vector3(2.1, 5.5, 0),
  ], 0.18, green, ACC.rescue, 0.62);

  registerLandmark("rescue", root, root.rotation.y, 0.1, 0.014, (t, dt, show, on) => {
    const energy = on ? 1 : 0.25;
    mascotCard.rotation.z = -0.025 + Math.sin(t * 0.55) * 0.018 * energy;
    mascotCard.rotation.y = 0.06 + Math.sin(t * 0.38) * 0.035 * energy;
    logoCard.position.y = 2.8 + Math.sin(t * 0.72 + 1.2) * 0.18 * energy;
    halo.rotation.z = Math.sin(t * 0.18) * 0.08;
    haloPetals.forEach((petal, i) => { petal.rotation.z += dt * (i % 2 ? -0.08 : 0.06) * energy; });
    tokens.forEach((token, i) => {
      const a = token.userData.angle + t * (0.16 + (i % 2) * 0.025);
      const r = token.userData.radius;
      token.position.set(Math.cos(a) * r, Math.sin(a) * 4.3, Math.sin(a * 1.7) * 1.4 - 1.1);
      token.rotation.z = a;
      token.scale.setScalar(Math.max(0.001, smooth(show * 2.4 - i * 0.09)));
    });
  });
}

/* GenealogyTech: reviewed family data unfolding into an organic living tree */
function buildAsheertyLandmark() {
  const root = new THREE.Group();
  root.position.set(10, 0, 8);
  root.rotation.y = -0.48;
  districts.atelier.group.add(root);
  const gold = districtMat(ACC.atelier, { metalness: 0.5, roughness: 0.34, emissiveIntensity: 0.15 });
  const ivory = districtMat(0xf4f1e8, { metalness: 0.06, roughness: 0.82, emissive: 0x3b321e, emissiveIntensity: 0.05 });
  const glass = districtMat(ACC.atelier, { transparent: true, opacity: 0.12, roughness: 0.18, metalness: 0.55 });
  outlined(root, new THREE.CylinderGeometry(10.8, 11.8, 0.7, 32), BUILD_DARK, new THREE.Vector3(0, 0.35, 0), null, ACC.atelier, 0.72);

  const treeSculpture = new THREE.Group();
  treeSculpture.position.set(-1.8, 0.9, 0.8);
  root.add(treeSculpture);
  const appMedallion = brandPanel(
    root, ASSET.asheerty, 5.8, 5.8,
    new THREE.Vector3(8.4, 10.5, 1.5),
    new THREE.Euler(-0.04, 0.12, -0.045),
    ACC.atelier,
    { depth: 0.48, faceScaleX: 0.88, faceScaleY: 0.88 }
  );

  const familyNodes = [
    new THREE.Vector3(0, 2.2, 0.2),
    new THREE.Vector3(-3.1, 5.2, -0.25), new THREE.Vector3(3.2, 5.4, 0.45),
    new THREE.Vector3(-5.7, 8.8, 0.5), new THREE.Vector3(-1.4, 9.2, -0.55),
    new THREE.Vector3(1.7, 9.3, 0.65), new THREE.Vector3(5.7, 8.7, -0.35),
    new THREE.Vector3(-7, 12.5, -0.2), new THREE.Vector3(-4.2, 13.1, 0.7),
    new THREE.Vector3(-0.6, 13.5, -0.35), new THREE.Vector3(2.8, 13.3, 0.8),
    new THREE.Vector3(6.5, 12.7, 0.2),
  ];
  const familyLinks = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[3,8],[4,9],[5,10],[6,11]];
  familyLinks.forEach(([a, b], i) => {
    const from = familyNodes[a], to = familyNodes[b];
    const bend = new THREE.Vector3(
      (from.x + to.x) * 0.5 + (i % 2 ? 0.4 : -0.35),
      (from.y + to.y) * 0.5,
      Math.max(from.z, to.z) + 0.5
    );
    curveTube(treeSculpture, [from, bend, to], i < 2 ? 0.14 : 0.085, gold, ACC.atelier, 0.66);
  });

  const portraitNodes = familyNodes.map((position, i) => {
    const node = new THREE.Group();
    node.position.copy(position);
    treeSculpture.add(node);
    outlined(node, new THREE.CylinderGeometry(0.76, 0.76, 0.22, 24), ivory, new THREE.Vector3(), new THREE.Euler(Math.PI / 2, 0, 0), ACC.atelier, 0.66);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.08, 7, 28), gold);
    ring.position.z = 0.18;
    node.add(ring);
    const mark = new THREE.Mesh(new THREE.CircleGeometry(i === 0 ? 0.23 : 0.16, 16), new THREE.MeshBasicMaterial({ color: i === 0 ? 0x11130f : ACC.atelier, toneMapped: false }));
    mark.position.z = 0.31;
    node.add(mark);
    return node;
  });

  const organicFrames = [];
  for (let i = 0; i < 3; i++) {
    const frame = outlined(
      treeSculpture,
      new THREE.TorusGeometry(6.5 - i * 0.75, 0.075, 6, 64),
      i === 1 ? glass : gold,
      new THREE.Vector3(0, 8.2, -1.5 - i * 0.35),
      new THREE.Euler(0, 0, i * 0.17 - 0.14),
      ACC.atelier,
      0.3
    );
    frame.scale.y = 1.22 - i * 0.08;
    organicFrames.push(frame);
  }

  registerLandmark("atelier", root, root.rotation.y, 0.07, 0.01, (t, dt, show, on) => {
    const energy = on ? 1 : 0.22;
    appMedallion.position.y = 10.5 + Math.sin(t * 0.62) * 0.16 * energy;
    appMedallion.rotation.z = -0.045 + Math.sin(t * 0.34) * 0.02 * energy;
    organicFrames.forEach((frame, i) => { frame.rotation.z += dt * (i % 2 ? -0.035 : 0.026) * energy; });
    portraitNodes.forEach((node, i) => {
      const born = smooth(show * 2.15 - i * 0.075);
      node.scale.setScalar(Math.max(0.001, born));
      node.position.y = familyNodes[i].y + Math.sin(t * 0.72 + i * 0.8) * 0.08 * energy;
    });
  });
}

/* Notification infrastructure: server stack, provider ring and delivery cards */
function buildNotifyLandmark() {
  const root = new THREE.Group();
  root.position.set(-10, 0, -9);
  root.rotation.y = 0.58;
  districts.infra.group.add(root);
  const violet = districtMat(ACC.infra, { metalness: 0.44, roughness: 0.42, emissiveIntensity: 0.12 });
  const status = new THREE.MeshBasicMaterial({ color: 0xcaff3d, toneMapped: false });
  outlined(root, new THREE.CylinderGeometry(10.5, 11.2, 0.8, 24), BUILD_DARK, new THREE.Vector3(0, 0.4, 0), null, ACC.infra, 0.72);
  for (let i = 0; i < 4; i++) {
    box(root, new THREE.Vector3(7.8, 2.25, 5.4), new THREE.Vector3(0, 2 + i * 2.45, 0), null, BUILD_DARK, ACC.infra, 0.78);
    for (let q = 0; q < 4; q++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.12), status);
      led.position.set(-2.7 + q * 0.8, 2 + i * 2.45, 2.78);
      root.add(led);
    }
  }
  const ring1 = outlined(root, new THREE.TorusGeometry(8.3, 0.13, 6, 42), violet, new THREE.Vector3(0, 7, 0), new THREE.Euler(Math.PI / 2, 0, 0), ACC.infra, 0.72);
  ring1.scale.z = 0.82;
  const beacon = new THREE.Group(); beacon.position.set(0, 13.2, 0); root.add(beacon);
  outlined(beacon, new THREE.DodecahedronGeometry(1.7, 0), violet, new THREE.Vector3(), null, ACC.infra, 0.72);
  const beaconRings = [];
  for (let i = 0; i < 3; i++) {
    const pulse = outlined(beacon, new THREE.TorusGeometry(2.5 + i * 0.8, 0.07, 6, 40), violet, new THREE.Vector3(), new THREE.Euler(i * 0.52, i * 0.3, 0), ACC.infra, 0.48 - i * 0.08);
    beaconRings.push(pulse);
  }
  const cardPositions = [[-7,9,-1],[7,7,1],[-6,4,2],[6,12,-2]];
  const notificationCards = [];
  for (const [x,y,z] of cardPositions) {
    const card = box(root, new THREE.Vector3(3.6, 2.3, 0.38), new THREE.Vector3(x,y,z), new THREE.Euler(0, -x * 0.035, 0), BUILD_DARK, ACC.infra, 0.72);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), status); dot.position.set(-1.25, 0.45, 0.24); card.add(dot);
    card.userData.base = card.position.clone();
    notificationCards.push(card);
  }
  const deliveryDots = [];
  for (let i = 0; i < 7; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), status);
    dot.userData.angle = (i / 7) * Math.PI * 2;
    root.add(dot);
    deliveryDots.push(dot);
  }
  registerLandmark("infra", root, root.rotation.y, 0.1, 0.014, (t, dt, show, on) => {
    const energy = on ? 1 : 0.22;
    ring1.rotation.z += dt * 0.08 * energy;
    beacon.rotation.y += dt * 0.18 * energy;
    beaconRings.forEach((ring, i) => {
      ring.rotation.z += dt * (i % 2 ? -0.2 : 0.16) * energy;
      const pulse = 0.92 + Math.sin(t * 1.5 - i * 0.6) * 0.08 * energy;
      ring.scale.setScalar(pulse);
    });
    notificationCards.forEach((card, i) => {
      card.position.y = card.userData.base.y + Math.sin(t * 0.78 + i * 1.3) * 0.2 * energy;
      card.scale.setScalar(Math.max(0.001, smooth(show * 2.1 - i * 0.13)));
    });
    deliveryDots.forEach((dot, i) => {
      const a = dot.userData.angle + t * 0.36;
      dot.position.set(Math.cos(a) * 8.2, 7 + Math.sin(a * 2) * 1.8, Math.sin(a) * 6.6);
      dot.scale.setScalar(Math.max(0.001, show));
    });
  });
}

/* E-commerce: Sadeek sign on a small second-hand storefront */
function buildSadeekLandmark() {
  const root = new THREE.Group();
  root.position.set(4, 0, 0);
  root.rotation.y = -0.58;
  districts.ailab.group.add(root);
  const orange = districtMat(ACC.ailab, { metalness: 0.2, roughness: 0.6, emissiveIntensity: 0.1 });
  const cream = districtMat(0xf4f1e8, { metalness: 0.04, roughness: 0.86, emissive: 0x32251d, emissiveIntensity: 0.04 });
  box(root, new THREE.Vector3(18, 0.7, 13), new THREE.Vector3(0, 0.35, 0), null, BUILD_DARK, ACC.ailab, 0.66);
  box(root, new THREE.Vector3(16, 11, 1), new THREE.Vector3(0, 6, -5), null, BUILD_DARK, ACC.ailab, 0.64);
  box(root, new THREE.Vector3(1, 11, 10), new THREE.Vector3(-7.5, 6, 0), null, BUILD_DARK, ACC.ailab, 0.48);
  const shopSign = brandPanel(root, ASSET.sadeek, 7.6, 5.7, new THREE.Vector3(0, 9.6, -4.35), new THREE.Euler(0, 0, 0), ACC.ailab, { faceScaleX: 0.9, faceScaleY: 0.88, backing: cream });
  const awning = [];
  for (let i = 0; i < 7; i++) {
    const strip = box(root, new THREE.Vector3(2.1, 0.55, 5.2), new THREE.Vector3(-6.3 + i * 2.1, 6.6 - (i % 2) * 0.18, -1.1), new THREE.Euler(0, 0, i % 2 ? 0.11 : -0.11), i % 2 ? orange : cream, ACC.ailab, 0.35);
    strip.userData.baseY = strip.position.y;
    awning.push(strip);
  }
  box(root, new THREE.Vector3(11, 0.35, 2.6), new THREE.Vector3(1, 2.8, -2.5), null, cream, ACC.ailab, 0.42);
  const productColors = [0x2357ff, 0xe9a200, 0x0b9b68, 0xa64cff];
  const products = [];
  for (let i = 0; i < 4; i++) {
    const productMat = districtMat(productColors[i], { roughness: 0.65, metalness: 0.12, emissiveIntensity: 0.04 });
    const product = outlined(root, new THREE.DodecahedronGeometry(0.9 + (i % 2) * 0.3, 0), productMat, new THREE.Vector3(-2.6 + i * 2.5, 4, -2.3), new THREE.Euler(i * 0.2, i * 0.4, 0), ACC.ailab, 0.32);
    product.userData.base = product.position.clone();
    products.push(product);
  }
  registerLandmark("ailab", root, root.rotation.y, 0.07, 0.01, (t, dt, show, on) => {
    const energy = on ? 1 : 0.2;
    shopSign.rotation.z = Math.sin(t * 0.34) * 0.018 * energy;
    awning.forEach((strip, i) => {
      strip.position.y = strip.userData.baseY + Math.sin(t * 0.72 + i * 0.42) * 0.07 * energy;
      strip.scale.z = 0.88 + smooth(show * 1.7 - i * 0.08) * 0.12;
    });
    products.forEach((product, i) => {
      product.position.y = product.userData.base.y + Math.sin(t * 0.9 + i * 1.15) * 0.18 * energy;
      product.rotation.y += dt * (0.16 + i * 0.035) * energy;
      product.scale.setScalar(Math.max(0.001, smooth(show * 2.2 - i * 0.16)));
    });
  });
}

/* HRTech: a live interview staged as voice, people and structured signal */
function buildMaaahrLandmark() {
  const root = new THREE.Group();
  root.position.set(mobile ? -3 : -17, 0, 0);
  root.rotation.y = 0.64;
  districts.maaahr.group.add(root);
  const purple = districtMat(ACC.maaahr, { metalness: 0.42, roughness: 0.34, emissiveIntensity: 0.16 });
  const ivory = districtMat(0xf4f1e8, { metalness: 0.05, roughness: 0.82, emissive: 0x32283b, emissiveIntensity: 0.04 });
  const glass = districtMat(ACC.maaahr, { transparent: true, opacity: 0.13, roughness: 0.2, metalness: 0.5 });
  outlined(root, new THREE.CylinderGeometry(10.4, 11.2, 0.72, 30), BUILD_DARK, new THREE.Vector3(0, 0.36, 0), null, ACC.maaahr, 0.72);

  const interviewTexture = canvasTexture(420, 720, (cx, w, h) => {
    cx.fillStyle = "#11130f"; cx.fillRect(0, 0, w, h);
    cx.fillStyle = "#a64cff"; cx.fillRect(0, 0, w, 94);
    cx.fillStyle = "#f4f1e8"; cx.font = "700 30px Inter, sans-serif"; cx.fillText("INTERVIEW", 28, 59);
    cx.fillStyle = "#77736f"; cx.font = "600 19px Inter, sans-serif";
    cx.fillText("Question 04 / 08", 28, 145);
    cx.strokeStyle = "#caff3d"; cx.lineWidth = 10; cx.beginPath();
    for (let i = 0; i < 16; i++) {
      const x = 40 + i * 22, y = 330 + Math.sin(i * 1.4) * 58;
      i ? cx.lineTo(x, y) : cx.moveTo(x, y);
    }
    cx.stroke();
    cx.fillStyle = "#f4f1e8"; cx.beginPath(); cx.arc(w/2, 520, 62, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = "#a64cff"; cx.fillRect(w/2 - 12, 482, 24, 72); cx.beginPath(); cx.arc(w/2, 482, 30, Math.PI, 0); cx.fill();
  });
  const appScreen = canvasPanel(root, interviewTexture, 5.2, 9, new THREE.Vector3(0, 7, 3.1), new THREE.Euler(-0.04, 0, 0), ACC.maaahr);

  const participants = [];
  const addPortrait = (x, z, flip) => {
    const portrait = new THREE.Group();
    portrait.position.set(x, 7.2, z);
    portrait.rotation.y = flip ? -0.16 : 0.16;
    root.add(portrait);
    outlined(portrait, new THREE.CylinderGeometry(3.05, 3.05, 0.34, 36), glass, new THREE.Vector3(), new THREE.Euler(Math.PI / 2, 0, 0), ACC.maaahr, 0.62);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.16, 8, 48), purple);
    rim.position.z = 0.26;
    portrait.add(rim);
    const head = new THREE.Mesh(new THREE.CircleGeometry(0.72, 24), new THREE.MeshBasicMaterial({ color: 0xf4f1e8, toneMapped: false }));
    head.position.set(0, 0.82, 0.44);
    portrait.add(head);
    const shoulders = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.7, 32, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xf4f1e8, side: THREE.DoubleSide, toneMapped: false }));
    shoulders.position.set(0, -1.22, 0.44);
    portrait.add(shoulders);
    participants.push(portrait);
  };
  addPortrait(-6.3, 0.1, false);
  addPortrait(6.3, -0.3, true);

  const voiceRibbon = curveTube(root, [
    new THREE.Vector3(-8.4, 7.2, 0.1),
    new THREE.Vector3(-4.5, 10.8, 1.2),
    new THREE.Vector3(0, 8.1, 2.1),
    new THREE.Vector3(4.5, 4.8, 1.3),
    new THREE.Vector3(8.4, 7.2, -0.2),
  ], 0.12, purple, ACC.maaahr, 0.72);

  const transcriptCards = [];
  [[-7.4,3.1,1.7],[7.2,11.7,0.7],[-5.3,12.3,-0.7]].forEach(([x,y,z], i) => {
    const card = box(root, new THREE.Vector3(3.7, 2.15, 0.32), new THREE.Vector3(x,y,z), new THREE.Euler(0, i === 1 ? -0.18 : 0.14, 0), i === 1 ? ivory : BUILD_DARK, ACC.maaahr, 0.62);
    for (let line = 0; line < 3; line++) {
      box(card, new THREE.Vector3(2.2 - line * 0.32, 0.09, 0.05), new THREE.Vector3(0, 0.5 - line * 0.42, 0.2), null, line === 0 ? purple : ivory, ACC.maaahr, 0.2);
    }
    card.userData.base = card.position.clone();
    transcriptCards.push(card);
  });

  registerLandmark("maaahr", root, root.rotation.y, 0.09, 0.012, (t, dt, show, on) => {
    const energy = on ? 1 : 0.22;
    appScreen.position.y = 7 + Math.sin(t * 0.66) * 0.16 * energy;
    appScreen.rotation.z = Math.sin(t * 0.32) * 0.016 * energy;
    participants.forEach((portrait, i) => {
      const pulse = 1 + Math.sin(t * 1.25 + i * 2.2) * 0.025 * energy;
      portrait.scale.setScalar(pulse * Math.max(0.001, smooth(show * 1.8 - i * 0.18)));
      portrait.rotation.z = Math.sin(t * 0.42 + i) * 0.025 * energy;
    });
    transcriptCards.forEach((card, i) => {
      card.position.y = card.userData.base.y + Math.sin(t * 0.72 + i * 1.6) * 0.2 * energy;
      card.scale.setScalar(Math.max(0.001, smooth(show * 2.2 - 0.3 - i * 0.16)));
    });
    voiceRibbon.rotation.z = Math.sin(t * 0.4) * 0.018 * energy;
  });
}

/* HAWSR: a cutaway apartment interior, like a model opened in the browser */
function buildHawsrLandmark() {
  const root = new THREE.Group();
  root.position.set(10, 0, 10);
  root.rotation.y = -0.76;
  districts.hawsr.group.add(root);
  const clay = districtMat(ACC.hawsr, { metalness: 0.18, roughness: 0.64, emissiveIntensity: 0.08 });
  const cream = districtMat(0xd8cdbc, { metalness: 0.03, roughness: 0.92, emissive: 0x35271f, emissiveIntensity: 0.04 });
  const wood = districtMat(0x745039, { metalness: 0.08, roughness: 0.74, emissive: 0x24140d, emissiveIntensity: 0.04 });
  const roomPieces = [];
  const trackPiece = (piece, explode) => {
    piece.userData.home = piece.position.clone();
    piece.userData.explode = explode;
    roomPieces.push(piece);
    return piece;
  };
  box(root, new THREE.Vector3(20, 0.8, 15), new THREE.Vector3(0, 0.4, 0), null, wood, ACC.hawsr, 0.64);
  trackPiece(box(root, new THREE.Vector3(20, 12, 0.8), new THREE.Vector3(0, 6, -7.1), null, cream, ACC.hawsr, 0.48), new THREE.Vector3(0, 0, -4));
  trackPiece(box(root, new THREE.Vector3(0.8, 12, 14), new THREE.Vector3(-9.6, 6, -0.2), null, cream, ACC.hawsr, 0.48), new THREE.Vector3(-4, 0, 0));
  trackPiece(box(root, new THREE.Vector3(8.2, 2.2, 3.4), new THREE.Vector3(-3.7, 2.1, -4.1), null, clay, ACC.hawsr, 0.52), new THREE.Vector3(-3, 1.2, 1.5));
  for (let i = 0; i < 3; i++) box(root, new THREE.Vector3(2.35, 1.65, 3.1), new THREE.Vector3(-6.1 + i * 2.45, 3.6, -4), null, cream, ACC.hawsr, 0.38);
  trackPiece(outlined(root, new THREE.CylinderGeometry(2, 2.2, 0.55, 16), wood, new THREE.Vector3(3.5, 1.7, -0.2), null, ACC.hawsr, 0.5), new THREE.Vector3(2, 1.4, 0));
  tubeBetween(root, new THREE.Vector3(3.5, 0.8, -0.2), new THREE.Vector3(3.5, 1.5, -0.2), 0.3, wood, ACC.hawsr, 0.4);
  trackPiece(box(root, new THREE.Vector3(7.5, 0.2, 4.6), new THREE.Vector3(3.5, 0.92, 3.4), null, clay, ACC.hawsr, 0.34), new THREE.Vector3(2.5, 0.8, 2.4));
  trackPiece(box(root, new THREE.Vector3(4.5, 0.45, 1.2), new THREE.Vector3(5.8, 8.3, -6.55), null, wood, ACC.hawsr, 0.4), new THREE.Vector3(1.8, 2.2, -1));
  for (let i = 0; i < 5; i++) box(root, new THREE.Vector3(0.42, 2.1 + i * 0.25, 0.7), new THREE.Vector3(4.1 + i * 0.85, 9.3, -6.05), new THREE.Euler(0,0,(i-2)*0.05), i === 2 ? clay : BUILD_DARK, ACC.hawsr, 0.28);
  tubeBetween(root, new THREE.Vector3(7.5, 0.8, -3.8), new THREE.Vector3(7.5, 8.4, -3.8), 0.16, wood, ACC.hawsr, 0.42);
  const lampShade = trackPiece(outlined(root, new THREE.ConeGeometry(1.45, 2.1, 12, 1, true), clay, new THREE.Vector3(7.5, 8.8, -3.8), new THREE.Euler(0,0,Math.PI), ACC.hawsr, 0.46), new THREE.Vector3(2.2, 2.8, 0));
  const plant = new THREE.Group(); plant.position.set(-7.8, 0.8, 4.5); root.add(plant);
  outlined(plant, new THREE.CylinderGeometry(0.75, 1, 1.8, 10), wood, new THREE.Vector3(0, 0.9, 0), null, ACC.hawsr, 0.4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    tubeBetween(plant, new THREE.Vector3(0, 1.7, 0), new THREE.Vector3(Math.cos(a) * 1.5, 4.5 + (i % 2), Math.sin(a) * 1.5), 0.12, clay, ACC.hawsr, 0.35, 6);
  }
  registerLandmark("hawsr", root, root.rotation.y, 0.02, 0.004, (t, dt, show, on) => {
    roomPieces.forEach((piece, i) => {
      piece.position.copy(piece.userData.home).addScaledVector(piece.userData.explode, 1 - smooth(show));
      if (on && i > 1) piece.position.y += Math.sin(t * 0.38 + i) * 0.025;
    });
    lampShade.rotation.y += dt * 0.045 * (on ? 1 : 0.2);
    plant.rotation.y = Math.sin(t * 0.22) * 0.035 * (on ? 1 : 0.2);
  });
}

// Build only what the visitor is about to see. This keeps the hero light and
// avoids paying for seven detailed sculptures during the first page load.
const landmarkBuilders = new Map([
  ["fintech", buildFintechLandmark],
  ["rescue", buildCardyLandmark],
  ["atelier", buildAsheertyLandmark],
  ["infra", buildNotifyLandmark],
  ["ailab", buildSadeekLandmark],
  ["maaahr", buildMaaahrLandmark],
  ["hawsr", buildHawsrLandmark],
]);
const buildingLandmarks = new Set();
function ensureLandmark(key) {
  const build = landmarkBuilders.get(key);
  if (!build || buildingLandmarks.has(key)) return;
  buildingLandmarks.add(key);
  build();
  landmarkBuilders.delete(key);
}

const landmarkObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const key = entry.target.dataset.district;
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 32));
    schedule(() => ensureLandmark(key), { timeout: 450 });
    landmarkObserver.unobserve(entry.target);
  }
}, { rootMargin: mobile ? "65% 0px" : "115% 0px", threshold: 0 });

for (const section of document.querySelectorAll(".sec-district[data-district]")) {
  if (landmarkBuilders.has(section.dataset.district)) landmarkObserver.observe(section);
}

/* ================================================================
   LANDMARKS · Al-Shaheed and the Mustansiriya
   ================================================================ */

/* Martyr's Monument: the split turquoise dome, north of the gateway */
{
  const g = new THREE.Group();
  g.position.set(16, 0, -40);
  scene.add(g);
  // platform
  const platGeo = new THREE.CylinderGeometry(11, 11.6, 0.7, 28);
  platGeo.translate(0, 0.35, 0);
  const plat = new THREE.Mesh(platGeo, BUILD_DARK);
  g.add(plat);
  risers.push({ mesh: plat, delay: 0.5 });
  // teardrop profile of the dome, lathed as two half shells
  const prof = [
    new THREE.Vector2(5.2, 0), new THREE.Vector2(6.9, 2.2), new THREE.Vector2(7.2, 4.2),
    new THREE.Vector2(6.2, 7.4), new THREE.Vector2(4.2, 10), new THREE.Vector2(2.2, 12),
    new THREE.Vector2(0.7, 13.4), new THREE.Vector2(0.02, 14.4),
  ];
  const glaze = new THREE.MeshStandardMaterial({
    color: 0x257685, roughness: 0.46, metalness: 0.2,
    emissive: 0x0a2c33, emissiveIntensity: 0.55, side: THREE.DoubleSide,
  });
  const rimMat = new THREE.LineBasicMaterial({ color: 0x4fb8a8, transparent: true, opacity: 0.55 });
  const mkHalf = (offsetX, phiStart, rotY) => {
    const geo = new THREE.LatheGeometry(prof, 36, phiStart, Math.PI);
    const half = new THREE.Mesh(geo, glaze);
    half.position.x = offsetX;
    half.rotation.y = rotY;
    g.add(half);
    // the cut rim, the monument's signature silhouette
    const rimGeo = new THREE.BufferGeometry().setFromPoints(
      prof.flatMap((p, i) => i < prof.length - 1
        ? [new THREE.Vector3(prof[i].x, prof[i].y, 0), new THREE.Vector3(prof[i + 1].x, prof[i + 1].y, 0),
           new THREE.Vector3(-prof[i].x, prof[i].y, 0), new THREE.Vector3(-prof[i + 1].x, prof[i + 1].y, 0)]
        : [])
    );
    const rim = new THREE.LineSegments(rimGeo, rimMat);
    rim.position.x = offsetX;
    rim.rotation.y = rotY;
    g.add(rim);
    half.userData.edge = rim;
    risers.push({ mesh: half, delay: 0.7 + Math.random() * 0.2 });
  };
  // the two shells slide apart, one turned slightly, like the real one
  mkHalf(-2.1, Math.PI / 2, -0.18);
  mkHalf(2.1, -Math.PI / 2, 0.18);
  // the eternal flame between the shells
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture("rgba(255,200,130,1)", "rgba(232,156,63,0.45)"),
    color: 0xe89c3f, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  flame.position.set(0, 2.6, 0);
  flame.scale.setScalar(3.4);
  g.add(flame);
}

/* Mustansiriya Madrasa: brick courtyard school on the east bank of the Tigris */
{
  const g = new THREE.Group();
  g.position.set(-35.5, 0, 26);
  g.rotation.y = 0.12;
  scene.add(g);
  const W = 18, D = 12, H = 6.5, T = 1.2;
  const walls = [
    { w: T, d: D, x: -W / 2 + T / 2, z: 0 },   // west facade, faces the river
    { w: T, d: D, x: W / 2 - T / 2, z: 0 },
    { w: W - 2 * T, d: T, x: 0, z: -D / 2 + T / 2 },
    { w: W - 2 * T, d: T, x: 0, z: D / 2 - T / 2 },
  ];
  const cells = [];
  const mdEdge = new THREE.LineBasicMaterial({ color: 0xc9bca6, transparent: true, opacity: 0.3 });
  for (const wl of walls) {
    const geo = new THREE.BoxGeometry(wl.w, H, wl.d);
    geo.translate(0, H / 2, 0);
    const m = new THREE.Mesh(geo, BUILD);
    m.position.set(wl.x, 0, wl.z);
    g.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mdEdge);
    e.position.copy(m.position);
    g.add(e);
    m.userData.edge = e;
    risers.push({ mesh: m, delay: rand(0.5, 0.8) });
    cells.push({ x: wl.x, z: wl.z, w: wl.w, d: wl.d, h: H });
  }
  buildWindows(g, cells);
  // the arcade: rows of pointed arches on the river facade, tall iwan in the middle
  const segs = [];
  const arch = (cx, base, w, h) => {
    for (const dir of [-1, 1]) {
      let lx = cx + dir * w / 2, ly = base;
      for (let s = 1; s <= 5; s++) {
        const t = s / 5;
        const nx = cx + dir * (w / 2) * Math.cos(t * Math.PI / 2) * (1 - t * 0.08);
        const ny = base + h * Math.sin(t * Math.PI / 2);
        segs.push(lx, ly, 0, nx, ny, 0);
        lx = nx; ly = ny;
      }
    }
  };
  arch(0, 0, 4.2, 5.6);                 // the iwan
  for (const cz of [-4.2, -2.4, 2.4, 4.2]) arch(cz, 0, 1.5, 3.1);
  for (const cz of [-4.2, -2.4, 0, 2.4, 4.2]) arch(cz, 4.4, 1.1, 1.6); // upper gallery
  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
  const arcade = new THREE.LineSegments(arcGeo, new THREE.LineBasicMaterial({ color: 0xd9a845, transparent: true, opacity: 0.5 }));
  arcade.rotation.y = -Math.PI / 2;              // wrap onto the west facade plane
  arcade.position.set(-W / 2 - 0.06, 0, 0);
  g.add(arcade);
  risers.push({ mesh: arcade, delay: 0.9 });
}

/* ================================================================
   LIFE: traffic, cranes, minarets, tower blinkers
   ================================================================ */

/* traffic: headlights out, taillights home, as moving glows on every avenue */
{
  const headTex = glowTexture("rgba(255,244,215,1)", "rgba(255,230,180,0.4)");
  const tailTex = glowTexture("rgba(255,140,105,1)", "rgba(217,106,74,0.4)");
  for (const k of Object.keys(CENTERS)) {
    if (k === "gateway") continue;
    const out = new THREE.LineCurve3(new THREE.Vector3(0, 0.4, 0), CENTERS[k].clone().setY(0.4));
    const back = new THREE.LineCurve3(CENTERS[k].clone().setY(0.4), new THREE.Vector3(0, 0.4, 0));
    const lanes = [
      { c: out, tex: headTex, color: 0xfff2d0, off: 0.9 },
      { c: back, tex: tailTex, color: 0xd96a4a, off: -0.9 },
    ];
    for (const lane of lanes) {
      for (let i = 0; i < (mobile ? 1 : 2); i++) {
        const mesh = new THREE.Sprite(new THREE.SpriteMaterial({
          map: lane.tex, color: lane.color, transparent: true, opacity: 0.7,
          depthWrite: false, blending: THREE.AdditiveBlending,
        }));
        mesh.scale.setScalar(1.0);
        const t0 = Math.random();
        lane.c.getPointAt(t0, mesh.position);
        const tan = lane.c.getTangent(0);
        const laneOff = { x: -tan.z * lane.off, z: tan.x * lane.off };
        mesh.position.x += laneOff.x;
        mesh.position.z += laneOff.z;
        scene.add(mesh);
        packets.push({ curve: lane.c, t: t0, speed: rand(0.025, 0.05), mesh, lane: laneOff });
      }
    }
  }
}

/* construction cranes over the rescue district: the rebuild, visible */
const cranes = [];
{
  const mkCrane = (x, z, h, jib) => {
    const cg = new THREE.Group();
    cg.position.set(x, 0, z);
    const segs = [];
    // lattice mast: four corner rails + rungs
    const M = 0.7;
    const corners = [[-M, -M], [M, -M], [M, M], [-M, M]];
    for (const [cx, cz] of corners) segs.push(cx, 0, cz, cx, h, cz);
    for (let y = 2; y < h; y += 2.4) {
      for (let c = 0; c < 4; c++) {
        const [ax, az] = corners[c], [bx, bz] = corners[(c + 1) % 4];
        segs.push(ax, y, az, bx, y, bz);
      }
    }
    // jib + counter-jib + ties + hanging cable and hook
    segs.push(0, h, 0, jib, h, 0);
    segs.push(0, h, 0, -jib * 0.35, h, 0);
    segs.push(0, h + 2.2, 0, jib * 0.6, h, 0);
    segs.push(0, h + 2.2, 0, -jib * 0.3, h, 0);
    segs.push(0, h, 0, 0, h + 2.2, 0);
    const hookX = jib * 0.7, drop = h * 0.55;
    segs.push(hookX, h, 0, hookX, h - drop, 0);
    segs.push(hookX - 0.5, h - drop, 0, hookX + 0.5, h - drop, 0);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x85c77e, transparent: true, opacity: 0.7 }));
    cg.add(lines);
    // warning beacon on top
    const beacon = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture("rgba(255,140,110,1)", "rgba(230,110,80,0.4)"),
      color: 0xd98a6a, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    beacon.position.set(0, h + 2.8, 0);
    beacon.scale.setScalar(2.4);
    cg.add(beacon);
    districts.rescue.group.add(cg);
    risers.push({ mesh: cg, delay: rand(0.6, 1) });
    cranes.push({ group: cg, beacon, spin: rand(0.02, 0.05) * (Math.random() < 0.5 ? -1 : 1), phase: rand(0, 6) });
  };
  mkCrane(14, -16, 20, 11);
  if (!mobile) mkCrane(-17, 12, 16, 9);
}

/* minarets and domes across the river in Origins: the old city */
{
  const g = districts.origins.group;
  const edge = districts.origins.edgeMat;
  const mkMinaret = (x, z, h) => {
    const shaft = new THREE.CylinderGeometry(0.7, 0.95, h, 8);
    shaft.translate(0, h / 2, 0);
    const m = new THREE.Mesh(shaft, BUILD_DARK);
    m.position.set(x, 0, z);
    g.add(m);
    const cap = new THREE.CylinderGeometry(0.02, 0.85, 2.6, 8);
    cap.translate(0, h + 1.3, 0);
    const c = new THREE.Mesh(cap, BUILD_DARK);
    c.position.set(x, 0, z);
    g.add(c);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(shaft, 20), edge);
    e.position.copy(m.position);
    g.add(e);
    m.userData.edge = e;
    risers.push({ mesh: m, delay: rand(0.5, 0.9) }, { mesh: c, delay: rand(0.9, 1.2) });
    // a lit lantern ring near the top
    lampPts.push(CENTERS.origins.x + x, h - 1.2, CENTERS.origins.z + z);
  };
  const mkDome = (x, z, r) => {
    const base = new THREE.BoxGeometry(r * 2.4, r * 1.1, r * 2.4);
    base.translate(0, r * 0.55, 0);
    const bm = new THREE.Mesh(base, BUILD_DARK);
    bm.position.set(x, 0, z);
    g.add(bm);
    const dome = new THREE.SphereGeometry(r, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    dome.translate(0, r * 1.1, 0);
    const dm = new THREE.Mesh(dome, BUILD);
    dm.position.set(x, 0, z);
    g.add(dm);
    const de = new THREE.LineSegments(new THREE.EdgesGeometry(dome, 18), edge);
    de.position.copy(dm.position);
    g.add(de);
    dm.userData.edge = de;
    risers.push({ mesh: bm, delay: rand(0.4, 0.7) }, { mesh: dm, delay: rand(0.7, 1) });
  };
  mkMinaret(-8, -10, 16);
  mkMinaret(9, 7, 13);
  mkDome(1, -2, 3.2);
  if (!mobile) mkDome(-12, 9, 2.3);
}

/* red blinkers on the tallest fintech towers */
const blinkers = [];
{
  const placed = (districts.fintech.placed || []).slice().sort((a, b) => b.h - a.h).slice(0, mobile ? 3 : 5);
  for (const c of placed) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture("rgba(255,120,100,1)", "rgba(230,100,80,0.35)"),
      color: 0xff7060, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    s.position.set(c.x, c.h + 1.2, c.z);
    s.scale.setScalar(1.9);
    districts.fintech.group.add(s);
    blinkers.push({ sprite: s, phase: rand(0, 6.28) });
  }
}

/* sodium streetlamps: avenues, bridge decks, minaret lanterns */
{
  const lampGeo = new THREE.BufferGeometry();
  lampGeo.setAttribute("position", new THREE.Float32BufferAttribute(lampPts, 3));
  scene.add(new THREE.Points(lampGeo, new THREE.PointsMaterial({
    map: glowTexture("rgba(255,208,150,1)", "rgba(255,172,92,0.5)"),
    color: 0xffb870, size: 2.4, sizeAttenuation: true,
    transparent: true, opacity: 0.9, depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
}

/* ---------------- camera poses per section ---------------- */
function pose(cx, cz, dx, dy, dz, lx, ly, lz) {
  return {
    pos: new THREE.Vector3(cx + dx, dy, cz + dz),
    look: new THREE.Vector3(cx + lx, ly, cz + lz),
  };
}
const POSES = {
  gateway:  pose(0, 0,      30, 26, 66,   0, 10, -6),
  gateway2: pose(0, 0,     -24, 14, 38,   2, 7, -2),
  fintech:  pose(70, 10,   -36, 22, 30,  10, 8, -2),
  rescue:   pose(40, 85,    32, 19, 30, -12, 5, -2),
  infra:    pose(-38, 72,  -30, 16, 30,  10, 4, -2),
  ailab:    pose(-6, -72,   26, 17, 34,  -9, 8, 0),
  maaahr:   pose(-48, -52,  27, 13, 25,  -8, 6, 0),
  atelier:  pose(46, -60,  -30, 15, 30,  10, 8, 0),
  hawsr:    pose(102, -112, -36, 18, 34,  10, 6, 0),
  origins:  pose(-82, -4,   30, 17, 32, -11, 4, 0),
  rules:    { pos: new THREE.Vector3(70, 85, 100), look: new THREE.Vector3(0, 0, 0) },
  personal: { pos: new THREE.Vector3(54, 68, 112), look: new THREE.Vector3(-6, 2, -8) },
  finale:   { pos: new THREE.Vector3(0, 105, 130), look: new THREE.Vector3(0, 4, 0) },
};

/* Portrait cameras are intentionally independent from desktop. The project
   surface occupies the top or bottom of the phone, so the landmark is centered
   horizontally and framed inside the open half instead of inheriting the
   desktop's side-biased composition. */
const MOBILE_POSES = {
  gateway:  pose(0, 0,       0, 28, 72,   0, 10, -6),
  gateway2: pose(0, 0,       0, 18, 52,   0, 7,  -2),
  fintech:  pose(80, 16,     0, 26, 58,   0, 18,  0),
  rescue:   pose(40, 78,     0, 24, 58,   0, -5,  0),
  atelier:  pose(56, -52,    0, 26, 58,   0, 18,  0),
  infra:    pose(-48, 63,    0, 23, 58,   0, -5,  0),
  ailab:    pose(-2, -72,    0, 25, 58,   0, 17,  0),
  maaahr:   pose(-51, -52,   0, 23, 58,   0, -5,  0),
  hawsr:    pose(112, -102,  0, 27, 60,   0, 18,  0),
  origins:  pose(-82, -4,    0, 23, 58,   0, -5,  0),
  rules:    { pos: new THREE.Vector3(0, 86, 126), look: new THREE.Vector3(0, 2, 0) },
  personal: { pos: new THREE.Vector3(0, 74, 118), look: new THREE.Vector3(0, 3, -4) },
  finale:   { pos: new THREE.Vector3(0, 108, 138), look: new THREE.Vector3(0, 4, 0) },
};

if (mobile) Object.assign(POSES, MOBILE_POSES);

const sections = [...document.querySelectorAll("[data-district]")];
let anchors = [];
const landmarkRanges = new Map();
let rescueRange = null, atelierRange = null;
function measure() {
  anchors = sections.map((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    return { key: el.dataset.district, top, bottom: top + el.offsetHeight, el };
  });
  anchors[0].top = 0;
  landmarkRanges.clear();
  for (const anchor of anchors) landmarkRanges.set(anchor.key, anchor);
  const rs = document.getElementById("d-rescue");
  const at = document.getElementById("d-atelier");
  if (rs) {
    const t = rs.getBoundingClientRect().top + window.scrollY;
    rescueRange = [t - window.innerHeight * 0.8, t + rs.offsetHeight * 0.55];
  }
  if (at) {
    const t = at.getBoundingClientRect().top + window.scrollY;
    atelierRange = [t - window.innerHeight * 0.7, t + at.offsetHeight * 0.6];
  }
}

function poseAt(scrollY) {
  const focus = scrollY + window.innerHeight * 0.45;
  let i = 0;
  while (i < anchors.length - 1 && focus >= anchors[i + 1].top) i++;
  const a = POSES[anchors[i].key] || POSES.gateway;
  if (i === anchors.length - 1) return { pos: a.pos.clone(), look: a.look.clone(), key: anchors[i].key };
  const nextAnchor = anchors[i + 1];
  const b = POSES[nextAnchor.key] || a;
  // Stay with the current project while it is being read. The move happens
  // only at the tail of the section and finishes exactly as the next arrives.
  const transitionStart = Math.min(
    nextAnchor.top - 1,
    Math.max(anchors[i].top, anchors[i].bottom - window.innerHeight * 0.14)
  );
  const span = Math.max(1, nextAnchor.top - transitionStart);
  const t = smooth((focus - transitionStart) / span);
  return {
    pos: a.pos.clone().lerp(b.pos, t),
    look: a.look.clone().lerp(b.look, t),
    key: t > 0.72 ? nextAnchor.key : anchors[i].key,
  };
}

function landmarkVisibility(key, scrollY) {
  const range = landmarkRanges.get(key);
  if (!range) return 0;
  const vh = window.innerHeight;
  const enter = smooth((scrollY - (range.top - vh * 0.54)) / (vh * 0.18));
  const leave = 1 - smooth((scrollY - (range.bottom - vh * 0.24)) / (vh * 0.18));
  return Math.min(enter, leave);
}

/* ---------------- intro rise ---------------- */
const seen = sessionStorage.getItem("city:seen") === "1";
let riseStart = seen ? -10 : 2.4; // seconds on the clock; already risen if seen
risers.forEach((r) => {
  if (!seen) r.mesh.scale.y = 0.001;
});
document.addEventListener("city:skip", () => { riseStart = -10; risers.forEach((r) => (r.mesh.scale.y = 1)); grid.material.opacity = 0.3; });

/* ---------------- pointer parallax ---------------- */
let px = 0, py = 0;
window.addEventListener("pointermove", (e) => {
  px = (e.clientX / window.innerWidth - 0.5) * 2;
  py = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

/* ---------------- resize ---------------- */
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  measure();
}
window.addEventListener("resize", resize);
resize();
window.addEventListener("load", measure);

/* ---------------- render loop ---------------- */
const camPos = POSES.gateway.pos.clone();
const camLook = POSES.gateway.look.clone();
let raf = null;
let frameTimer = null;
let lastT = 0;

function frame(now, manual = false) {
  raf = null;
  const t = now / 1000;
  const dt = Math.min(0.05, t - (lastT || t)); // real delta → same speed at 60/120 Hz
  lastT = t;
  const sy = window.scrollY;
  const damp = Math.min(1, dt * 3.8);

  // intro rise
  if (grid.material.opacity < 0.38) grid.material.opacity = Math.min(0.38, t * 0.25);
  if (riseStart > -5) {
    let done = true;
    for (const r of risers) {
      const k = ease((t - riseStart - r.delay) / 0.9);
      r.mesh.scale.y = Math.max(0.001, k);
      if (r.mesh.userData.edge) r.mesh.userData.edge.scale.y = Math.max(0.001, k);
      if (k < 1) done = false;
    }
    if (done) riseStart = -10;
  }

  // camera
  const p = poseAt(sy);
  camPos.lerp(p.pos, damp);
  camLook.lerp(p.look, damp);
  camera.position.set(
    camPos.x + px * 1.6 + Math.sin(t * 0.23) * 0.7,
    camPos.y + py * -0.9 + Math.sin(t * 0.31) * 0.4,
    camPos.z
  );
  camera.lookAt(camLook);

  // district activation
  const activeKey = p.key || "gateway";
  const night = activeKey === "finale" || activeKey === "rules" || activeKey === "personal";
  for (const k of Object.keys(districts)) {
    const d = districts[k];
    const on = k === activeKey || night || (activeKey === "gateway2" && k === "gateway");
    d.light.intensity += ((on ? d.base * (night ? 1.4 : 1) : d.base * 0.25) - d.light.intensity) * damp * 0.8;
    d.edgeMat.opacity += ((on ? 0.8 : night ? 0.65 : 0.34) - d.edgeMat.opacity) * damp * 0.8;
  }

  // A project cannot leak into the previous chapter. It assembles as its own
  // section enters, holds while the story is readable, then clears the view.
  for (const lm of landmarks) {
    const on = lm.key === activeKey;
    const target = landmarkVisibility(lm.key, sy);
    const revealDamp = Math.min(1, dt * (target > lm.reveal ? 6.5 : 9));
    lm.reveal += (target - lm.reveal) * revealDamp;
    lm.root.visible = lm.reveal > 0.008;
    if (!lm.root.visible) continue;
    const show = ease(lm.reveal);
    const energy = on ? 1 : 0.28;
    const scale = 0.74 + show * 0.26;
    lm.root.scale.setScalar(scale);
    lm.root.position.y = lm.baseY - (1 - show) * 3.8 + Math.sin(t * 0.72 + lm.phase) * lm.bob * energy;
    lm.root.rotation.y = lm.baseRotation + (1 - show) * 0.24 + Math.sin(t * 0.24 + lm.phase) * lm.sway * energy;
    if (lm.animate) lm.animate(t, dt, show, on);
  }

  // windows turn on once the blueprint has risen: the city comes alive
  const winTarget = riseStart <= -5 ? (night ? 1 : 0.92) : 0;
  for (const m of winMats) m.opacity += (winTarget - m.opacity) * damp * 0.6;

  // packets + traffic
  for (const pk of packets) {
    pk.t += pk.speed * dt;
    if (pk.t >= 1) { pk.t = 0; if (pk.alt) pk.phase = pk.phase ? 0 : 1; }
    const c = pk.phase && pk.alt ? pk.alt : pk.curve;
    c.getPointAt(Math.min(pk.t, 0.9999), pk.mesh.position);
    if (pk.lane) { pk.mesh.position.x += pk.lane.x; pk.mesh.position.z += pk.lane.z; }
  }

  // cranes turn slowly; beacons and tower blinkers breathe
  for (const cr of cranes) {
    cr.group.rotation.y += cr.spin * dt;
    cr.beacon.material.opacity = Math.sin(t * 2.2 + cr.phase) > 0 ? 0.9 : 0.15;
  }
  for (const bl of blinkers) {
    bl.sprite.material.opacity = Math.sin(t * 2.6 + bl.phase) > 0.3 ? 0.85 : 0.1;
  }

  // rescue repair
  if (rescueRange) {
    const rp = smooth((sy - rescueRange[0]) / (rescueRange[1] - rescueRange[0]));
    for (const part of rescueParts) {
      part.obj.position.lerpVectors(part.broke.p, part.home.p, rp);
      part.obj.rotation.set(
        part.broke.r.x * (1 - rp), part.broke.r.y * (1 - rp), part.broke.r.z * (1 - rp)
      );
      if (part.obj.userData.edge) {
        part.obj.userData.edge.position.copy(part.obj.position);
        part.obj.userData.edge.rotation.copy(part.obj.rotation);
      }
    }
    const net = districts.rescue;
    net.net.geometry.setDrawRange(0, Math.floor(net.netCount * rp));
    net.nodes.forEach((n, i) => n.scale.setScalar(Math.max(0.001, ease(rp * 9 - i * 0.6))));
  }

  // atelier tree growth
  if (atelierRange && tree) {
    const ap = smooth((sy - atelierRange[0]) / (atelierRange[1] - atelierRange[0]));
    tree.geometry.setDrawRange(0, Math.floor(treeCount * ap));
  }

  // ai lab floaters bob
  if (districts.ailab.floaters) {
    for (const f of districts.ailab.floaters) {
      f.mesh.position.y = f.y + Math.sin(t * 0.6 + f.ph) * 0.6;
      f.edge.position.y = f.mesh.position.y;
    }
  }

  // maaahr waveform
  if (wave) {
    const pos = wave.geometry.attributes.position;
    for (let i = 0; i < wavePts.length; i++) {
      pos.setY(i, 6 + Math.sin(i * 0.6 + t * 2.4) * 0.9 * Math.sin(t * 0.8 + i * 0.05));
    }
    pos.needsUpdate = true;
  }

  renderer.render(scene, camera);
  if (!manual) {
    frameTimer = window.setTimeout(() => {
      frameTimer = null;
      raf = requestAnimationFrame(frame);
    }, mobile ? 34 : 22);
  }
}

window.__city = {
  scene, camera, renderer, districts, anchors: () => anchors,
  /* debug: step the loop synchronously (headless/hidden-tab inspection) */
  settle(steps = 90) {
    const t0 = performance.now();
    lastT = 0;
    cancelAnimationFrame(raf);
    clearTimeout(frameTimer);
    for (let i = 0; i < steps; i++) frame(t0 + i * 16.7, true);
    cancelAnimationFrame(raf); raf = null;
    clearTimeout(frameTimer); frameTimer = null;
    if (!document.hidden) raf = requestAnimationFrame(frame);
  },
};

/* reduced motion / hidden tab handling */
if (reduced) {
  // one static, fully-risen overview frame
  risers.forEach((r) => (r.mesh.scale.y = 1));
  grid.material.opacity = 0.3;
  winMats.forEach((m) => (m.opacity = 0.95));
  tree && tree.geometry.setDrawRange(0, treeCount);
  rescueParts.forEach((part) => part.obj.position.copy(part.home.p));
  camera.position.copy(POSES.rules.pos);
  camera.lookAt(POSES.rules.look);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
} else {
  raf = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf); raf = null;
      clearTimeout(frameTimer); frameTimer = null;
    }
    else if (!raf) { lastT = 0; raf = requestAnimationFrame(frame); }
  });
}
