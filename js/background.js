/**
 * background.js — Animated ambient background
 * Calm glowing orbs behind frosted glass, natural green/blue/teal palette
 */
(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  let animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  // ── Orb definitions ───────────────────────────────────────────────────────
  const orbs = [
    { x: 0.15, y: 0.25, r: 0.38, color: '#0e4a3a', speed: 0.00018, angle: 0.3,   drift: 0.06 },
    { x: 0.75, y: 0.15, r: 0.30, color: '#0a3352', speed: 0.00014, angle: 2.1,   drift: 0.07 },
    { x: 0.55, y: 0.72, r: 0.34, color: '#0d4a2e', speed: 0.00016, angle: 4.5,   drift: 0.05 },
    { x: 0.30, y: 0.80, r: 0.25, color: '#0a3d4d', speed: 0.00022, angle: 1.2,   drift: 0.08 },
    { x: 0.85, y: 0.60, r: 0.28, color: '#1a4a1a', speed: 0.00012, angle: 3.7,   drift: 0.06 },
    { x: 0.50, y: 0.42, r: 0.20, color: '#2a5a3a', speed: 0.00025, angle: 0.8,   drift: 0.04 },
    { x: 0.10, y: 0.65, r: 0.22, color: '#0c3d5c', speed: 0.00020, angle: 5.2,   drift: 0.07 },
    { x: 0.90, y: 0.35, r: 0.18, color: '#1a5c3a', speed: 0.00017, angle: 2.9,   drift: 0.05 },
  ];

  // Pre-resolve base positions as pixels
  const state = orbs.map(o => ({
    bx: o.x * 1000,  // will be rescaled
    by: o.y * 1000,
    r:  o.r,
    color: o.color,
    speed: o.speed,
    angle: o.angle,
    drift: o.drift,
    cx: 0, cy: 0,    // current position
  }));

  let t = 0;

  function draw(ts) {
    t = ts * 0.001;

    ctx.clearRect(0, 0, W, H);

    // Deep dark base
    ctx.fillStyle = '#050808';
    ctx.fillRect(0, 0, W, H);

    // Draw each glowing orb
    state.forEach((o, i) => {
      const orb = orbs[i];

      // Slow organic drift
      const ox = Math.sin(t * orb.speed * 1000 + orb.angle) * orb.drift;
      const oy = Math.cos(t * orb.speed * 700  + orb.angle + 1.3) * orb.drift;

      o.cx = (orb.x + ox) * W;
      o.cy = (orb.y + oy) * H;

      const radius = orb.r * Math.min(W, H);

      // Soft breathing pulse
      const pulse = 1 + Math.sin(t * orb.speed * 800 + i) * 0.08;
      const r = radius * pulse;

      // Radial gradient — rich center, fades to transparent
      const grad = ctx.createRadialGradient(o.cx, o.cy, 0, o.cx, o.cy, r);
      grad.addColorStop(0,    hexAlpha(orb.color, 0.55));
      grad.addColorStop(0.35, hexAlpha(orb.color, 0.28));
      grad.addColorStop(0.65, hexAlpha(orb.color, 0.10));
      grad.addColorStop(1,    hexAlpha(orb.color, 0));

      ctx.beginPath();
      ctx.arc(o.cx, o.cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Subtle noise grain overlay — baked as tiny alpha rects
    // (done via CSS, not canvas — see style)

    animId = requestAnimationFrame(draw);
  }

  // Convert hex + alpha to rgba string
  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  requestAnimationFrame(draw);
})();
