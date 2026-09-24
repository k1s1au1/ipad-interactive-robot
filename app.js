import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.querySelector("#scene");
const startScreen = document.querySelector("#startScreen");
const pauseScreen = document.querySelector("#pauseScreen");
const winScreen = document.querySelector("#winScreen");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const resumeBtn = document.querySelector("#resumeBtn");
const restartBtn = document.querySelector("#restartBtn");
const playAgainBtn = document.querySelector("#playAgainBtn");
const jumpBtn = document.querySelector("#jumpBtn");
const dashBtn = document.querySelector("#dashBtn");
const spinBtn = document.querySelector("#spinBtn");
const stickZone = document.querySelector("#stickZone");
const stickKnob = document.querySelector("#stickKnob");
const starsEl = document.querySelector("#stars");
const friendsEl = document.querySelector("#friends");
const heartsEl = document.querySelector("#hearts");
const messageEl = document.querySelector("#message");
const resultText = document.querySelector("#resultText");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bdcff);
scene.fog = new THREE.Fog(0xb8ecff, 28, 78);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 120);
camera.position.set(0, 5.5, 8.5);

const hemi = new THREE.HemisphereLight(0xdff8ff, 0x4a6d53, 2.5);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(8, 14, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -28;
sun.shadow.camera.right = 28;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -34;
scene.add(sun);

const mats = {
  white: new THREE.MeshStandardMaterial({ color: 0xf5fbff, roughness: 0.32, metalness: 0.12 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x167cff, roughness: 0.3, metalness: 0.18 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x45e8ff, emissive: 0x0b81a8, emissiveIntensity: 0.8, roughness: 0.22 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x061528, roughness: 0.2, metalness: 0.32 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x55ce79, roughness: 0.85 }),
  rock: new THREE.MeshStandardMaterial({ color: 0xe6eef1, roughness: 0.92 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffd45e, emissive: 0x9a5b00, emissiveIntensity: 0.65, roughness: 0.28, metalness: 0.5 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xff6aa8, emissive: 0x8b154b, emissiveIntensity: 0.35 }),
  enemy: new THREE.MeshStandardMaterial({ color: 0xff556d, emissive: 0x7a0d20, emissiveIntensity: 0.35 }),
  portal: new THREE.MeshStandardMaterial({ color: 0x71efff, emissive: 0x10a4c9, emissiveIntensity: 1.4, side: THREE.DoubleSide })
};

function mesh(geo, mat, parent, cast = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = cast;
  parent?.add(m);
  return m;
}

function createRobot(scale = 1) {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  const body = mesh(new THREE.SphereGeometry(0.62, 24, 18), mats.white, g);
  body.scale.set(0.9, 1.05, 0.72);
  body.position.y = 1.35;

  const chest = mesh(new THREE.SphereGeometry(0.47, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mats.blue, g);
  chest.scale.set(0.72, 0.72, 0.22);
  chest.position.set(0, 1.42, 0.47);
  chest.rotation.x = -0.12;

  const head = new THREE.Group();
  head.position.y = 2.28;
  g.add(head);

  const shell = mesh(new THREE.SphereGeometry(0.72, 28, 20), mats.white, head);
  shell.scale.set(1.15, 0.9, 0.82);

  const visor = mesh(new THREE.SphereGeometry(0.61, 28, 18), mats.dark, head);
  visor.scale.set(1.12, 0.77, 0.48);
  visor.position.z = 0.39;

  const eyeGeo = new THREE.SphereGeometry(0.105, 14, 10);
  const leftEye = mesh(eyeGeo, mats.cyan, head, false);
  const rightEye = mesh(eyeGeo, mats.cyan, head, false);
  leftEye.scale.set(1.15, 0.65, 0.35);
  rightEye.scale.copy(leftEye.scale);
  leftEye.position.set(-0.23, 0.04, 0.72);
  rightEye.position.set(0.23, 0.04, 0.72);

  const antenna = new THREE.Group();
  const stem = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), mats.white, antenna);
  stem.rotation.z = -0.35;
  stem.position.set(0.07, 0.19, 0);
  const orb = mesh(new THREE.SphereGeometry(0.09, 12, 10), mats.cyan, antenna, false);
  orb.position.set(0.14, 0.39, 0);
  antenna.position.set(0.24, 0.62, 0);
  head.add(antenna);

  function arm(x) {
    const a = new THREE.Group();
    a.position.set(x, 1.55, 0);
    const upper = mesh(new THREE.CapsuleGeometry(0.16, 0.36, 6, 12), mats.white, a);
    upper.rotation.z = x > 0 ? -0.18 : 0.18;
    upper.position.y = -0.2;
    const cuff = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 14), mats.blue, a);
    cuff.position.y = -0.52;
    const hand = mesh(new THREE.SphereGeometry(0.19, 14, 10), mats.white, a);
    hand.scale.set(0.9, 1.08, 0.82);
    hand.position.y = -0.68;
    g.add(a);
    return a;
  }
  const armL = arm(-0.72);
  const armR = arm(0.72);

  function leg(x) {
    const l = new THREE.Group();
    l.position.set(x, 0.85, 0);
    const thigh = mesh(new THREE.CapsuleGeometry(0.2, 0.4, 6, 12), mats.white, l);
    thigh.position.y = -0.28;
    const cuff = mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.18, 14), mats.blue, l);
    cuff.position.y = -0.62;
    const foot = mesh(new THREE.SphereGeometry(0.24, 16, 12), mats.cyan, l);
    foot.scale.set(0.9, 0.72, 1.2);
    foot.position.set(0, -0.79, 0.08);
    g.add(l);
    return l;
  }
  const legL = leg(-0.3);
  const legR = leg(0.3);

  const scarf = mesh(new THREE.ConeGeometry(0.23, 0.95, 3), mats.blue, g, false);
  scarf.position.set(0, 1.78, -0.6);
  scarf.rotation.x = -1.33;
  scarf.rotation.z = 0.18;

  g.userData = { head, leftEye, rightEye, armL, armR, legL, legR, scarf };
  return g;
}

const world = new THREE.Group();
scene.add(world);

const platforms = [];
const collectibles = [];
const friends = [];
const enemies = [];
let portal = null;

function addIsland(x, y, z, sx, sz, rot = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rot;
  world.add(group);

  const base = mesh(new THREE.CylinderGeometry(Math.max(sx, sz) * 0.5, Math.max(sx, sz) * 0.38, 1.3, 8), mats.rock, group);
  base.scale.set(sx / Math.max(sx, sz), 1, sz / Math.max(sx, sz));
  base.position.y = -0.65;

  const top = mesh(new THREE.CylinderGeometry(Math.max(sx, sz) * 0.51, Math.max(sx, sz) * 0.5, 0.25, 8), mats.grass, group);
  top.scale.set(sx / Math.max(sx, sz), 1, sz / Math.max(sx, sz));
  top.position.y = 0.08;

  const halfX = sx * 0.46;
  const halfZ = sz * 0.46;
  platforms.push({ x, z, y: y + 0.23, halfX, halfZ, group });
  return group;
}

function addStar(x, y, z) {
  const star = mesh(new THREE.IcosahedronGeometry(0.24, 0), mats.gold, world, false);
  star.position.set(x, y, z);
  star.userData.baseY = y;
  collectibles.push(star);
}

function addFriend(x, y, z) {
  const f = createRobot(0.46);
  f.position.set(x, y, z);
  const ring = mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 32), mats.cyan, f, false);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.1;
  f.userData.ring = ring;
  world.add(f);
  friends.push(f);
}

function addEnemy(x, y, z, axis = "x", range = 2) {
  const e = new THREE.Group();
  e.position.set(x, y, z);
  const body = mesh(new THREE.SphereGeometry(0.48, 18, 14), mats.enemy, e);
  body.scale.set(1, 0.72, 1);
  const eye1 = mesh(new THREE.SphereGeometry(0.075, 10, 8), mats.dark, e, false);
  const eye2 = eye1.clone();
  eye1.position.set(-0.15, 0.1, 0.43);
  eye2.position.set(0.15, 0.1, 0.43);
  e.add(eye2);
  world.add(e);
  e.userData = { origin: e.position.clone(), axis, range, phase: Math.random() * Math.PI * 2, alive: true };
  enemies.push(e);
}

function addPortal(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const ring = mesh(new THREE.TorusGeometry(1.25, 0.13, 16, 48), mats.portal, g, false);
  ring.rotation.y = Math.PI / 2;
  const inner = mesh(new THREE.CircleGeometry(1.08, 42), new THREE.MeshBasicMaterial({ color: 0x59ddff, transparent: true, opacity: 0.28, side: THREE.DoubleSide }), g, false);
  inner.rotation.y = Math.PI / 2;
  world.add(g);
  portal = g;
}

function addDecor() {
  for (let i = 0; i < 24; i++) {
    const cloud = new THREE.Group();
    const count = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const c = mesh(new THREE.SphereGeometry(0.7 + Math.random() * 0.7, 12, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }), cloud, false);
      c.position.set((j - count / 2) * 0.8, Math.random() * 0.4, Math.random() * 0.6);
    }
    cloud.position.set((Math.random() - 0.5) * 70, 8 + Math.random() * 10, -10 - Math.random() * 70);
    cloud.scale.setScalar(1 + Math.random() * 1.5);
    world.add(cloud);
  }
}

function buildLevel() {
  while (world.children.length) world.remove(world.children[0]);
  platforms.length = 0;
  collectibles.length = 0;
  friends.length = 0;
  enemies.length = 0;
  portal = null;

  addIsland(0, 0, 0, 8, 8);
  addIsland(-4, 0.7, -8, 5, 5, 0.15);
  addIsland(3, 1.45, -14, 5.5, 5.5, -0.12);
  addIsland(0, 2.1, -21, 7, 5.5, 0.08);
  addIsland(-5, 2.75, -28, 5, 5);
  addIsland(3, 3.4, -34, 6, 5.2);
  addIsland(0, 4.05, -42, 10, 8);

  [
    [1.5,1.2,-1.5],[-1.4,1.2,-3.1],[-4,1.9,-8],[3,2.65,-14],
    [-1.2,3.25,-21],[-5,3.95,-28],[3,4.6,-34],[1.8,5.25,-41]
  ].forEach(p => addStar(...p));

  addFriend(-3.8,1.12,-8);
  addFriend(1.3,2.85,-21);
  addFriend(-1.9,4.8,-42);

  addEnemy(1.2,0.72,-1.8,"x",2.1);
  addEnemy(3,2.18,-14,"z",1.7);
  addEnemy(-4.8,3.48,-28,"x",1.2);
  addEnemy(2.2,4.1,-34,"x",1.5);

  addPortal(0,5.25,-45.2);
  addDecor();
}

buildLevel();

const player = createRobot(0.72);
scene.add(player);

const state = {
  playing: false,
  paused: false,
  won: false,
  stars: 0,
  friends: 0,
  hearts: 3,
  grounded: false,
  spin: 0,
  dash: 0,
  invuln: 0,
  checkpoint: new THREE.Vector3(0, 0.25, 1.8),
  move: new THREE.Vector2(),
  keys: new Set(),
  facing: new THREE.Vector3(0, 0, -1)
};

const velocity = new THREE.Vector3();
player.position.copy(state.checkpoint);

function resetStats() {
  state.stars = 0;
  state.friends = 0;
  state.hearts = 3;
  state.won = false;
  state.spin = 0;
  state.dash = 0;
  state.invuln = 0;
  velocity.set(0,0,0);
  player.position.copy(state.checkpoint.set(0,0.25,1.8));
  updateHUD();
}

function updateHUD() {
  starsEl.textContent = state.stars;
  friendsEl.textContent = state.friends;
  heartsEl.textContent = "♥ ".repeat(state.hearts).trim() || "—";
}

let msgTimer = 0;
function say(text, ms = 1200) {
  clearTimeout(msgTimer);
  messageEl.textContent = text;
  messageEl.classList.add("show");
  msgTimer = setTimeout(() => messageEl.classList.remove("show"), ms);
}

let audioCtx = null;
function tone(freq = 520, duration = 0.08, type = "sine", gain = 0.045) {
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const now = audioCtx.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.connect(g).connect(audioCtx.destination);
    o.start(now);
    o.stop(now + duration + 0.02);
  } catch {}
}

function jump() {
  if (!state.playing || state.paused || state.won) return;
  if (state.grounded) {
    velocity.y = 6.6;
    state.grounded = false;
    tone(620, 0.11);
  }
}

function dash() {
  if (!state.playing || state.paused || state.won || state.dash > 0) return;
  state.dash = 0.34;
  const d = state.facing.clone().setY(0).normalize();
  velocity.x += d.x * 8.4;
  velocity.z += d.z * 8.4;
  tone(310, 0.16, "sawtooth", 0.03);
}

function spin() {
  if (!state.playing || state.paused || state.won || state.spin > 0) return;
  state.spin = 0.62;
  tone(760, 0.16, "triangle", 0.03);
}

jumpBtn.addEventListener("pointerdown", e => { e.preventDefault(); jump(); });
dashBtn.addEventListener("pointerdown", e => { e.preventDefault(); dash(); });
spinBtn.addEventListener("pointerdown", e => { e.preventDefault(); spin(); });

let stickPointer = null;
const stick = { centerX: 0, centerY: 0, max: 46 };
function updateStick(e) {
  const dx = e.clientX - stick.centerX;
  const dy = e.clientY - stick.centerY;
  const len = Math.hypot(dx, dy) || 1;
  const mag = Math.min(stick.max, len);
  const nx = dx / len * mag;
  const ny = dy / len * mag;
  stickKnob.style.transform = `translate(${nx}px,${ny}px)`;
  state.move.set(nx / stick.max, ny / stick.max);
}
stickZone.addEventListener("pointerdown", e => {
  e.preventDefault();
  stickPointer = e.pointerId;
  stickZone.setPointerCapture?.(e.pointerId);
  const r = stickZone.getBoundingClientRect();
  stick.centerX = r.left + r.width / 2;
  stick.centerY = r.top + r.height / 2;
  updateStick(e);
});
stickZone.addEventListener("pointermove", e => {
  if (e.pointerId === stickPointer) updateStick(e);
});
function releaseStick(e) {
  if (e.pointerId !== stickPointer) return;
  stickPointer = null;
  state.move.set(0,0);
  stickKnob.style.transform = "translate(0,0)";
}
stickZone.addEventListener("pointerup", releaseStick);
stickZone.addEventListener("pointercancel", releaseStick);

addEventListener("keydown", e => {
  state.keys.add(e.code);
  if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
  if (e.code === "Space") jump();
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") dash();
  if (e.code === "KeyE") spin();
});
addEventListener("keyup", e => state.keys.delete(e.code));

function keyboardMove() {
  let x = 0, y = 0;
  if (state.keys.has("KeyA") || state.keys.has("ArrowLeft")) x -= 1;
  if (state.keys.has("KeyD") || state.keys.has("ArrowRight")) x += 1;
  if (state.keys.has("KeyW") || state.keys.has("ArrowUp")) y -= 1;
  if (state.keys.has("KeyS") || state.keys.has("ArrowDown")) y += 1;
  if (x || y) {
    const l = Math.hypot(x,y);
    return new THREE.Vector2(x/l,y/l);
  }
  return state.move.clone();
}

function platformTopAt(x, z) {
  let best = null;
  for (const p of platforms) {
    if (Math.abs(x - p.x) <= p.halfX && Math.abs(z - p.z) <= p.halfZ) {
      if (!best || p.y > best.y) best = p;
    }
  }
  return best;
}

function hurt() {
  if (state.invuln > 0 || !state.playing || state.won) return;
  state.hearts--;
  state.invuln = 1.35;
  velocity.y = 4.5;
  velocity.z += 3.5;
  tone(145, 0.22, "square", 0.04);
  updateHUD();
  say("انتبه!");
  if (state.hearts <= 0) {
    state.hearts = 3;
    player.position.copy(state.checkpoint);
    velocity.set(0,0,0);
    updateHUD();
    say("رجعناك لآخر نقطة");
  }
}

function rescueFriend(f) {
  f.visible = false;
  state.friends++;
  updateHUD();
  tone(880, 0.16);
  setTimeout(() => tone(1170, 0.18), 90);
  say("تم إنقاذ رفيق!");
  if (state.friends === 3) say("كل الرفقاء بأمان — توجه للبوابة!", 1900);
}

function collectStar(s) {
  s.visible = false;
  state.stars++;
  updateHUD();
  tone(980, 0.09);
  say("نجمة!");
}

function win() {
  if (state.won) return;
  if (state.friends < 3) {
    say(`باقي ${3 - state.friends} من الرفقاء`, 1500);
    return;
  }
  state.won = true;
  state.playing = false;
  resultText.textContent = `أنقذت 3 رفقاء وجمعت ${state.stars} من 8 نجوم.`;
  winScreen.classList.remove("hidden");
  tone(660,0.16);
  setTimeout(()=>tone(880,0.18),120);
  setTimeout(()=>tone(1100,0.24),260);
}

function animateRobot(t, dt, moveMag) {
  const u = player.userData;
  const run = moveMag > 0.08 && state.grounded;
  const phase = t * (run ? 10 : 3.2);
  const swing = run ? Math.sin(phase) * 0.5 : Math.sin(phase) * 0.08;

  u.legL.rotation.x = swing;
  u.legR.rotation.x = -swing;
  u.armL.rotation.x = -swing * 0.7;
  u.armR.rotation.x = swing * 0.7;
  u.scarf.rotation.z = 0.18 + Math.sin(t * 5) * 0.08;

  if (state.spin > 0) {
    player.rotation.y += dt * 15;
    u.armL.rotation.z = -1.05;
    u.armR.rotation.z = 1.05;
  } else {
    u.armL.rotation.z *= 0.85;
    u.armR.rotation.z *= 0.85;
  }

  if (!state.grounded) {
    u.legL.rotation.x = -0.45;
    u.legR.rotation.x = 0.45;
  }

  u.head.rotation.z = Math.sin(t * 2.8) * 0.025;
}

function updateGame(dt, t) {
  if (!state.playing || state.paused || state.won) return;

  state.spin = Math.max(0, state.spin - dt);
  state.dash = Math.max(0, state.dash - dt);
  state.invuln = Math.max(0, state.invuln - dt);

  const input = keyboardMove();
  const speed = state.dash > 0 ? 2.1 : 5.1;
  const moveLen = Math.min(1, input.length());

  const desired = new THREE.Vector3(input.x, 0, input.y);
  if (desired.lengthSq() > 0.001) {
    desired.normalize();
    state.facing.lerp(desired, Math.min(1, dt * 12)).normalize();
    const targetAngle = Math.atan2(state.facing.x, state.facing.z);
    let delta = targetAngle - player.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    if (state.spin <= 0) player.rotation.y += delta * Math.min(1, dt * 12);
  }

  velocity.x += (desired.x * speed - velocity.x) * Math.min(1, dt * (state.grounded ? 10 : 3.5));
  velocity.z += (desired.z * speed - velocity.z) * Math.min(1, dt * (state.grounded ? 10 : 3.5));
  velocity.y -= 15.5 * dt;

  const prevY = player.position.y;
  player.position.x += velocity.x * dt;
  player.position.y += velocity.y * dt;
  player.position.z += velocity.z * dt;

  const p = platformTopAt(player.position.x, player.position.z);
  state.grounded = false;
  if (p && velocity.y <= 0 && player.position.y <= p.y + 0.06 && prevY >= p.y - 0.25) {
    player.position.y = p.y;
    velocity.y = 0;
    state.grounded = true;
    if (p.z < state.checkpoint.z - 5) state.checkpoint.set(p.x, p.y + 0.03, p.z + Math.min(1.3, p.halfZ * 0.45));
  }

  if (player.position.y < -6) {
    player.position.copy(state.checkpoint);
    velocity.set(0,0,0);
    state.hearts = Math.max(1, state.hearts - 1);
    updateHUD();
    say("انتبه للحواف!");
    tone(170,0.18,"square",0.035);
  }

  for (const s of collectibles) {
    if (!s.visible) continue;
    s.rotation.y += dt * 2.7;
    s.rotation.x += dt * 1.2;
    s.position.y = s.userData.baseY + Math.sin(t * 3 + s.position.x) * 0.14;
    if (s.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,1,0))) < 1.05) collectStar(s);
  }

  for (const f of friends) {
    if (!f.visible) continue;
    f.rotation.y = Math.sin(t * 1.7 + f.position.z) * 0.35;
    f.position.y += Math.sin(t * 2.5 + f.position.x) * 0.0008;
    f.userData.ring.rotation.z += dt * 1.8;
    if (f.position.distanceTo(player.position) < 1.35) rescueFriend(f);
  }

  for (const e of enemies) {
    if (!e.userData.alive) continue;
    const u = e.userData;
    const offs = Math.sin(t * 1.8 + u.phase) * u.range;
    e.position[u.axis] = u.origin[u.axis] + offs;
    e.rotation.y += dt * 1.6;

    const d = e.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,0.5,0)));
    if (state.spin > 0 && d < 1.45) {
      u.alive = false;
      e.visible = false;
      tone(260,0.12,"square",0.03);
      say("تم!");
    } else if (d < 1.0) hurt();
  }

  if (portal) {
    portal.rotation.z += dt * 0.35;
    const ring = portal.children[0];
    if (ring) ring.rotation.x += dt * 0.25;
    if (portal.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,1,0))) < 1.75) win();
  }

  animateRobot(t, dt, moveLen);
  player.visible = !(state.invuln > 0 && Math.floor(state.invuln * 12) % 2 === 0);
}

const camTarget = new THREE.Vector3();
const camPos = new THREE.Vector3();
function updateCamera(dt) {
  camTarget.set(player.position.x, player.position.y + 1.35, player.position.z);
  camPos.set(player.position.x, player.position.y + 5.3, player.position.z + 8.7);
  camera.position.lerp(camPos, 1 - Math.pow(0.0008, dt));
  const currentLook = new THREE.Vector3();
  camera.getWorldDirection(currentLook);
  camera.lookAt(camTarget);
}

startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  state.playing = true;
  state.paused = false;
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  say("أنقذ 3 رفقاء ثم ادخل البوابة", 2200);
});

pauseBtn.addEventListener("click", () => {
  if (!state.playing || state.won) return;
  state.paused = true;
  pauseScreen.classList.remove("hidden");
});
resumeBtn.addEventListener("click", () => {
  state.paused = false;
  pauseScreen.classList.add("hidden");
});
restartBtn.addEventListener("click", () => {
  buildLevel();
  resetStats();
  pauseScreen.classList.add("hidden");
  state.paused = false;
  state.playing = true;
});
playAgainBtn.addEventListener("click", () => {
  buildLevel();
  resetStats();
  winScreen.classList.add("hidden");
  state.playing = true;
});

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize, { passive: true });

const clock = new THREE.Clock();
let elapsed = 0;
function loop() {
  const dt = Math.min(clock.getDelta(), 0.033);
  elapsed += dt;
  updateGame(dt, elapsed);
  updateCamera(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
updateHUD();
loop();

if ("serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
