// A small stack of sticky notes in WebGL. Tilts toward the cursor, fans open on hover.
// Loaded lazily after the page is idle. Falls back to the CSS stack on any failure.
import * as THREE from 'three';
import { gsap } from './scroll';

const COLORS = [0xffd84d, 0xffb3c1, 0xa8d8ff, 0xbde8c4, 0xffb25c, 0xffd84d, 0xffb3c1];

export function mount(slot: HTMLElement) {
  const size = 220;
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(size, size, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  camera.position.set(0, 0, 4.6);

  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(1.15, 1.15);
  // soft shadow under the stack
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ color: 0x14120f, transparent: true, opacity: 0.16 }));
  shadow.position.set(0.08, -0.1, -0.06);
  group.add(shadow);
  const meshes: THREE.Mesh[] = COLORS.map((c, i) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    const k = i - 3;
    m.position.set(k * 0.028, k * 0.02, i * 0.03);
    m.rotation.z = k * 0.045;
    // a faint edge so each sheet reads as paper, not a flat fill
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x14120f, transparent: true, opacity: 0.18 }));
    m.add(edge);
    group.add(m);
    return m;
  });
  group.rotation.set(0.28, -0.35, 0.12);
  scene.add(group);

  const base = { x: 0.28, y: -0.35 };
  const target = { x: base.x, y: base.y };
  let dirty = true, fanned = false, visible = true;

  window.addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    target.y = base.y + nx * 0.9;
    target.x = base.x + ny * 0.7;
  }, { passive: true });

  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(slot);

  const fan = (on: boolean) => {
    fanned = on;
    meshes.forEach((m, i) => {
      const k = i - 3;
      gsap.to(m.position, { x: on ? k * 0.26 : 0, y: on ? k * 0.07 : 0, z: on ? i * 0.06 + 0.05 : i * 0.03, duration: 0.7, ease: 'back.out(1.6)', onUpdate: () => (dirty = true) });
      gsap.to(m.rotation, { z: on ? k * 0.2 : k * 0.035, duration: 0.7, ease: 'back.out(1.6)', onUpdate: () => (dirty = true) });
    });
  };
  canvas.addEventListener('pointerenter', () => fan(true));
  canvas.addEventListener('pointerleave', () => fan(false));

  const tick = () => {
    if (!visible) return;
    const dx = target.x - group.rotation.x, dy = target.y - group.rotation.y;
    if (Math.abs(dx) > 1e-4 || Math.abs(dy) > 1e-4) {
      group.rotation.x += dx * 0.08;
      group.rotation.y += dy * 0.08;
      dirty = true;
    }
    if (dirty || fanned) { renderer.render(scene, camera); dirty = false; }
  };
  gsap.ticker.add(tick);

  const teardown = () => {
    gsap.ticker.remove(tick);
    geo.dispose();
    (shadow.material as THREE.Material).dispose(); shadow.geometry.dispose();
    meshes.forEach((m) => (m.material as THREE.Material).dispose());
    renderer.dispose();
    canvas.remove();
    slot.querySelector('.css-stack')?.removeAttribute('hidden');
  };
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); teardown(); });

  slot.querySelector('.css-stack')?.setAttribute('hidden', '');
  slot.appendChild(canvas);
  renderer.render(scene, camera);
}
