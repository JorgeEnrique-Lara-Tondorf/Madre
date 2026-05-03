/* ============================================================
   script.js — Día de la Madre por Coque
   ============================================================ */

/* ══════════════════════════════════════════════════════
   1. FLORES REALISTAS — Canvas con física natural
   Tipos: Rosa · Margarita · Tulipán · Cerezo
   Con pétalos bezier, gradientes, venas, estambres,
   rotación 3D simulada y péndulo suave
══════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('flowerCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H;
  const flowers = [];
  const COUNT   = 18;

  function lerpColor(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0]-c1[0])*t),
      Math.round(c1[1] + (c2[1]-c1[1])*t),
      Math.round(c1[2] + (c2[2]-c1[2])*t),
    ];
  }

  function rgba(c, a) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  const FLOWER_DEFS = [
    {
      type: 'rose',
      colors: [
        { inner:[255,182,193], outer:[210,80,110],  vein:[255,220,225] },
        { inner:[255,160,180], outer:[190,50,90],   vein:[255,200,210] },
        { inner:[255,200,160], outer:[220,120,80],  vein:[255,230,210] },
        { inner:[240,180,220], outer:[180,80,160],  vein:[250,220,240] },
      ],
      petals: 5,
      centerColor: [[255,240,200],[255,220,100]],
      weight: 3,
    },
    {
      type: 'daisy',
      colors: [
        { inner:[255,255,255], outer:[220,230,255], vein:[200,210,255] },
        { inner:[255,245,200], outer:[255,200,80],  vein:[255,230,150] },
        { inner:[255,220,240], outer:[255,150,200], vein:[255,200,230] },
      ],
      petals: 12,
      centerColor: [[255,220,50],[200,140,30]],
      weight: 2,
    },
    {
      type: 'tulip',
      colors: [
        { inner:[255,100,120], outer:[200,30,60],   vein:[255,160,170] },
        { inner:[255,180,50],  outer:[220,130,0],   vein:[255,220,120] },
        { inner:[180,100,220], outer:[120,40,180],  vein:[220,170,240] },
        { inner:[255,120,80],  outer:[200,60,20],   vein:[255,180,150] },
      ],
      petals: 6,
      centerColor: [[220,250,200],[120,180,80]],
      weight: 2,
    },
    {
      type: 'cherry',
      colors: [
        { inner:[255,220,230], outer:[230,160,180], vein:[255,240,245] },
        { inner:[255,200,215], outer:[220,130,155], vein:[255,225,235] },
      ],
      petals: 5,
      centerColor: [[255,240,180],[230,180,80]],
      weight: 4,
    },
  ];

  const POOL = [];
  FLOWER_DEFS.forEach((d, i) => { for (let w = 0; w < d.weight; w++) POOL.push(i); });

  function drawRosePetal(ctx, size, skewY, col, phase) {
    const w    = size * 0.6;
    const h    = size * 1.5;
    const curl = size * 0.08 * Math.sin(phase);
    const grad = ctx.createRadialGradient(0, -h*0.3, size*0.1, 0, -h*0.15, size*1.1);
    grad.addColorStop(0,   rgba(col.inner, 1));
    grad.addColorStop(0.6, rgba(lerpColor(col.inner, col.outer, 0.5), 0.95));
    grad.addColorStop(1,   rgba(col.outer, 0.85));

    ctx.save();
    ctx.scale(1, skewY);
    ctx.shadowColor   = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur    = size * 0.5;
    ctx.shadowOffsetX = size * 0.04;
    ctx.shadowOffsetY = size * 0.08;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w*0.9+curl, -h*0.2,  w+curl, -h*0.7,  curl*0.5, -h);
    ctx.bezierCurveTo(-w+curl,    -h*0.7,  -w*0.9+curl, -h*0.2, 0, 0);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle   = rgba(col.outer, 0.25);
    ctx.lineWidth     = size * 0.03;
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(curl*0.3, -h*0.5, curl*0.2, -h*0.95);
    ctx.strokeStyle = rgba(col.vein, 0.55);
    ctx.lineWidth   = size * 0.055;
    ctx.lineCap     = 'round';
    ctx.stroke();

    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -h*0.25);
      ctx.quadraticCurveTo(s*w*0.5, -h*0.55, s*w*0.75+curl, -h*0.65);
      ctx.strokeStyle = rgba(col.vein, 0.3);
      ctx.lineWidth   = size * 0.028;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDaisyPetal(ctx, size, skewY, col) {
    const w = size * 0.22;
    const h = size * 1.8;
    const grad = ctx.createLinearGradient(0, 0, 0, -h);
    grad.addColorStop(0,   rgba(lerpColor(col.inner, col.outer, 0.3), 0.9));
    grad.addColorStop(0.5, rgba(col.inner, 0.97));
    grad.addColorStop(1,   rgba(col.inner, 0.7));

    ctx.save();
    ctx.scale(1, skewY);
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur  = size * 0.3;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w, -h*0.3,  w, -h*0.7,  0, -h);
    ctx.bezierCurveTo(-w, -h*0.7, -w, -h*0.3,  0,  0);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(0, -h*0.1);
    ctx.lineTo(0, -h*0.9);
    ctx.strokeStyle = rgba(col.vein, 0.4);
    ctx.lineWidth   = size * 0.025;
    ctx.lineCap     = 'round';
    ctx.stroke();

    ctx.restore();
  }

  function drawTulipPetal(ctx, size, skewY, col, idx, total) {
    const w     = size * 0.7;
    const h     = size * 1.6;
    const scale = idx < total / 2 ? 1.1 : 0.95;
    const grad  = ctx.createRadialGradient(0, -h*0.4, 0, 0, -h*0.4, size*1.2);
    grad.addColorStop(0,   rgba(col.inner, 1));
    grad.addColorStop(0.5, rgba(lerpColor(col.inner, col.outer, 0.4), 0.95));
    grad.addColorStop(1,   rgba(col.outer, 0.88));

    ctx.save();
    ctx.scale(scale, skewY * scale);
    ctx.shadowColor   = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur    = size * 0.5;
    ctx.shadowOffsetY = size * 0.06;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w*0.8, -h*0.1,  w, -h*0.55,  w*0.3, -h);
    ctx.quadraticCurveTo(0, -h*1.08, -w*0.3, -h);
    ctx.bezierCurveTo(-w, -h*0.55, -w*0.8, -h*0.1, 0, 0);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle   = rgba(col.outer, 0.2);
    ctx.lineWidth     = size * 0.025;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -h*0.05);
    ctx.quadraticCurveTo(0, -h*0.5, 0, -h*0.98);
    ctx.strokeStyle = rgba(col.vein, 0.45);
    ctx.lineWidth   = size * 0.06;
    ctx.lineCap     = 'round';
    ctx.stroke();

    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s*w*0.1, -h*0.3);
      ctx.quadraticCurveTo(s*w*0.55, -h*0.55, s*w*0.7, -h*0.75);
      ctx.strokeStyle = rgba(col.vein, 0.3);
      ctx.lineWidth   = size * 0.03;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCherryPetal(ctx, size, skewY, col) {
    const w    = size * 0.65;
    const h    = size * 1.3;
    const grad = ctx.createRadialGradient(0, -h*0.35, size*0.05, 0, -h*0.35, size*1.1);
    grad.addColorStop(0, rgba(col.inner, 1));
    grad.addColorStop(1, rgba(col.outer, 0.82));

    ctx.save();
    ctx.scale(1, skewY);
    ctx.shadowColor = 'rgba(0,0,0,0.14)';
    ctx.shadowBlur  = size * 0.45;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w*0.9, -h*0.15,  w, -h*0.6,  w*0.35, -h*0.88);
    ctx.quadraticCurveTo(w*0.12, -h, 0, -h*0.94);
    ctx.quadraticCurveTo(-w*0.12, -h, -w*0.35, -h*0.88);
    ctx.bezierCurveTo(-w, -h*0.6, -w*0.9, -h*0.15,  0, 0);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur  = 0;
    ctx.strokeStyle = rgba(col.outer, 0.22);
    ctx.lineWidth   = size * 0.028;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, -h*0.5, 0, -h*0.92);
    ctx.strokeStyle = rgba(col.vein, 0.5);
    ctx.lineWidth   = size * 0.05;
    ctx.lineCap     = 'round';
    ctx.stroke();

    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -h*0.28);
      ctx.quadraticCurveTo(s*w*0.45, -h*0.52, s*w*0.6, -h*0.72);
      ctx.strokeStyle = rgba(col.vein, 0.28);
      ctx.lineWidth   = size * 0.025;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCenter(ctx, size, def) {
    const [cInner, cOuter] = def.centerColor;
    const r  = def.type === 'daisy' ? size * 0.32 : size * 0.22;
    const cg = ctx.createRadialGradient(-r*0.15, -r*0.15, 0, 0, 0, r);
    cg.addColorStop(0,   rgba(cInner, 1));
    cg.addColorStop(0.6, rgba(lerpColor(cInner, cOuter, 0.5), 1));
    cg.addColorStop(1,   rgba(cOuter, 1));

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle   = cg;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur  = r * 0.8;
    ctx.fill();
    ctx.shadowBlur  = 0;

    const dots = def.type === 'daisy' ? 28 : 10;
    for (let i = 0; i < dots; i++) {
      const a  = Math.random() * Math.PI * 2;
      const rd = Math.random() * r * 0.82;
      ctx.beginPath();
      ctx.arc(Math.cos(a)*rd, Math.sin(a)*rd, r*0.055, 0, Math.PI*2);
      ctx.fillStyle = rgba(cOuter, 0.65);
      ctx.fill();
    }

    if (def.type === 'rose' || def.type === 'cherry') {
      for (let i = 0; i < 8; i++) {
        const a   = (Math.PI * 2 / 8) * i + 0.3;
        const len = r * (0.9 + Math.random() * 0.5);

        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*r*0.5, Math.sin(a)*r*0.5);
        ctx.lineTo(Math.cos(a)*len,   Math.sin(a)*len);
        ctx.strokeStyle = rgba([255,200,80], 0.85);
        ctx.lineWidth   = r * 0.09;
        ctx.lineCap     = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(Math.cos(a)*len, Math.sin(a)*len, r*0.1, 0, Math.PI*2);
        ctx.fillStyle = rgba([255,220,60], 1);
        ctx.fill();
      }
    }
  }

  function drawFlower(f) {
    const def = FLOWER_DEFS[f.defIdx];
    const col = def.colors[f.colIdx];
    const n   = def.petals;

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);

    const layers = def.type === 'rose' ? 2 : 1;

    for (let layer = 0; layer < layers; layer++) {
      const layerScale = 1 - layer * 0.18;
      const layerRot   = layer * (Math.PI / n);
      const colLayer   = layer === 0 ? col : {
        inner: lerpColor(col.inner, [255,255,255], 0.2),
        outer: lerpColor(col.outer, [255,255,255], 0.15),
        vein:  col.vein,
      };

      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 / n) * i + layerRot + f.phase;
        const skewY = 0.3 + Math.abs(Math.sin(f.rot3d + i * (Math.PI*2/n))) * 0.7;
        const pSize = f.size * layerScale;

        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -pSize * (def.type === 'daisy' ? 0.28 : 0.18));

        if (def.type === 'rose')   drawRosePetal(ctx, pSize, skewY, colLayer, f.phase + i);
        if (def.type === 'daisy')  drawDaisyPetal(ctx, pSize, skewY, colLayer);
        if (def.type === 'tulip')  drawTulipPetal(ctx, pSize, skewY, colLayer, i, n);
        if (def.type === 'cherry') drawCherryPetal(ctx, pSize, skewY, colLayer);

        ctx.restore();
      }
    }

    drawCenter(ctx, f.size, def);
    ctx.restore();
  }

  function newFlower(startAtTop) {
    const defIdx = POOL[Math.floor(Math.random() * POOL.length)];
    const def    = FLOWER_DEFS[defIdx];
    return {
      x:       Math.random() * W,
      y:       startAtTop ? -50 - Math.random() * 300 : Math.random() * H,
      size:    13 + Math.random() * 14,
      speedY:  0.4  + Math.random() * 0.85,
      speedX:  (Math.random() - 0.5) * 0.35,
      rot:     Math.random() * Math.PI * 2,
      rotZ:    (Math.random() - 0.5) * 0.014,
      rot3d:   Math.random() * Math.PI * 2,
      rot3dS:  0.01  + Math.random() * 0.018,
      swing:   Math.random() * Math.PI * 2,
      swingS:  0.006 + Math.random() * 0.01,
      swingA:  10   + Math.random() * 20,
      phase:   Math.random() * Math.PI * 2,
      defIdx,
      colIdx:  Math.floor(Math.random() * def.colors.length),
      opacity: 0.72 + Math.random() * 0.28,
    };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < COUNT; i++) flowers.push(newFlower(false));

  function loop() {
    ctx.clearRect(0, 0, W, H);

    for (const f of flowers) {
      f.swing += f.swingS;
      f.rot   += f.rotZ;
      f.rot3d += f.rot3dS;
      f.x     += Math.sin(f.swing) * f.swingA * 0.016 + f.speedX;
      f.y     += f.speedY;

      ctx.globalAlpha = f.opacity;
      drawFlower(f);

      if (f.y > H + 80 || f.x < -100 || f.x > W + 100) {
        Object.assign(f, newFlower(true));
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  loop();
})();

/* ══════════════════════════════════════════════════════
   2. TEMAS DE COLOR
══════════════════════════════════════════════════════ */
const THEMES = [
  { name:'🌸 Rosa',   bg:'#fdf6f0', surface:'#fff9f5', text:'#3a1c10', muted:'#8a5c4a', accent:'#c45b6a', accent2:'#e8a0a8', gold:'#d4a050', border:'rgba(180,100,80,0.12)', hbg1:'#fce4e8', hbg2:'#fdf0e8', hbg3:'#fce8f0' },
  { name:'💜 Lila',   bg:'#f7f4fc', surface:'#faf8ff', text:'#2a1842', muted:'#7a5a9a', accent:'#8b5cf6', accent2:'#c4b5fd', gold:'#a78bfa', border:'rgba(139,92,246,0.12)', hbg1:'#ede5f7', hbg2:'#f5f0ff', hbg3:'#e8dffa' },
  { name:'🌿 Verde',  bg:'#f4faf4', surface:'#f8fff8', text:'#1a2e1a', muted:'#4a7a4a', accent:'#3d8b5c', accent2:'#86c99a', gold:'#7dbb6e', border:'rgba(61,139,92,0.12)',  hbg1:'#dff0e3', hbg2:'#edfbf0', hbg3:'#ddf5e5' },
  { name:'💙 Azul',   bg:'#f0f6fd', surface:'#f5faff', text:'#0e2240', muted:'#4a6a8a', accent:'#2563eb', accent2:'#93c5fd', gold:'#60a5fa', border:'rgba(37,99,235,0.12)',  hbg1:'#dbeafe', hbg2:'#eff6ff', hbg3:'#dde8fb' },
  { name:'✨ Dorado', bg:'#fdf8ef', surface:'#fffcf5', text:'#2d1f00', muted:'#8a6a30', accent:'#d97706', accent2:'#fcd34d', gold:'#b45309', border:'rgba(217,119,6,0.12)',  hbg1:'#fef3c7', hbg2:'#fffbeb', hbg3:'#fef0c0' },
];
let currentTheme = 0;

function applyTheme(t) {
  const r = document.documentElement.style;
  r.setProperty('--color-bg',         t.bg);
  r.setProperty('--color-surface',    t.surface);
  r.setProperty('--color-text',       t.text);
  r.setProperty('--color-text-muted', t.muted);
  r.setProperty('--color-accent',     t.accent);
  r.setProperty('--color-accent-2',   t.accent2);
  r.setProperty('--color-gold',       t.gold);
  r.setProperty('--color-border',     t.border);
  r.setProperty('--theme-bg1',        t.hbg1);
  r.setProperty('--theme-bg2',        t.hbg2);
  r.setProperty('--theme-bg3',        t.hbg3);
}

document.getElementById('colorBtn').addEventListener('click', () => {
  currentTheme = (currentTheme + 1) % THEMES.length;
  applyTheme(THEMES[currentTheme]);
  showToast('Tema: ' + THEMES[currentTheme].name);
  vibrate([30, 20, 30]);
});

applyTheme(THEMES[0]);

/* ══════════════════════════════════════════════════════
   3. MÚSICA — Web Audio API
══════════════════════════════════════════════════════ */
let audioCtx = null, musicPlaying = false, loopTimer = null;
const musicBtn = document.getElementById('musicBtn');

const NOTE = {
  C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.00, A4:440.00, B4:493.88, C5:523.25,
};

const melody = [
  [NOTE.E4,0.5],[NOTE.G4,0.5],[NOTE.A4,1],
  [NOTE.G4,0.5],[NOTE.E4,0.5],[NOTE.C4,1],
  [NOTE.D4,0.5],[NOTE.F4,0.5],[NOTE.G4,1],
  [NOTE.E4,0.5],[NOTE.D4,0.5],[NOTE.C4,1.5],
  [NOTE.G4,0.5],[NOTE.A4,0.5],[NOTE.B4,1],
  [NOTE.A4,0.5],[NOTE.G4,0.5],[NOTE.E4,1],
  [NOTE.F4,0.5],[NOTE.A4,0.5],[NOTE.C5,1],
  [NOTE.B4,0.5],[NOTE.G4,0.5],[NOTE.E4,1.5],
];

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function makeReverb(ctx) {
  const conv = ctx.createConvolver();
  const buf  = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.5);
  }
  conv.buffer = buf;
  return conv;
}

function playLoop() {
  if (!musicPlaying) return;
  const ctx  = getCtx();
  const beat = 60 / 66;
  const rev  = makeReverb(ctx);

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.14, ctx.currentTime);
  rev.connect(masterGain);
  masterGain.connect(ctx.destination);

  const dry = ctx.createGain();
  dry.gain.setValueAtTime(0.2, ctx.currentTime);
  dry.connect(ctx.destination);

  let t = ctx.currentTime + 0.05;
  let totalDur = 0;

  for (const [freq, dur] of melody) {
    if (!musicPlaying) break;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.55, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur * beat * 0.9);
    osc.connect(gain); gain.connect(rev); gain.connect(dry);
    osc.start(t); osc.stop(t + dur * beat);

    const osc2  = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.1, t + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + dur * beat * 0.7);
    osc2.connect(gain2); gain2.connect(rev);
    osc2.start(t); osc2.stop(t + dur * beat);

    t += dur * beat;
    totalDur += dur * beat;
  }

  const chords = [[NOTE.C4,NOTE.E4,NOTE.G4],[NOTE.F4,NOTE.A4,NOTE.C5]];
  for (const chord of chords) {
    for (const freq of chord) {
      const op = ctx.createOscillator();
      const gp = ctx.createGain();
      op.type = 'triangle';
      op.frequency.setValueAtTime(freq/2, ctx.currentTime);
      gp.gain.setValueAtTime(0.04, ctx.currentTime);
      gp.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      gp.gain.linearRampToValueAtTime(0, ctx.currentTime + totalDur);
      op.connect(gp); gp.connect(rev);
      op.start(ctx.currentTime + 0.05);
      op.stop(ctx.currentTime + totalDur + 0.1);
    }
  }

  loopTimer = setTimeout(playLoop, (totalDur - 0.3) * 1000);
}

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    musicPlaying = false;
    clearTimeout(loopTimer);
    if (audioCtx) audioCtx.suspend();
    musicBtn.textContent = '🎵';
    showToast('Música pausada ⏸');
  } else {
    musicPlaying = true;
    playLoop();
    musicBtn.textContent = '🔇';
    showToast('♪ Reproduciendo música 🌸');
  }
  vibrate([40]);
});

/* ══════════════════════════════════════════════════════
   4. TOAST
══════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ══════════════════════════════════════════════════════
   5. VIBRACIÓN HÁPTICA
══════════════════════════════════════════════════════ */
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
document.querySelectorAll('.photo-card, .reason-item').forEach(el => {
  el.addEventListener('touchstart', () => vibrate([12]), { passive: true });
});

/* ══════════════════════════════════════════════════════
   6. RIPPLE TÁCTIL
══════════════════════════════════════════════════════ */
document.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  const r = document.createElement('div');
  const s = 80;
  r.className = 'ripple';
  r.style.cssText = `width:${s}px;height:${s}px;left:${t.clientX-s/2}px;top:${t.clientY-s/2}px`;
  document.body.appendChild(r);
  setTimeout(() => r.remove(), 700);
}, { passive: true });

/* ══════════════════════════════════════════════════════
   7. SCROLL FADE-IN
══════════════════════════════════════════════════════ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ══════════════════════════════════════════════════════
   8. CARGAR FOTOS
══════════════════════════════════════════════════════ */
function loadPhoto(input) {
  const file  = input.files[0];
  if (!file) return;

  const url   = URL.createObjectURL(file);
  const label = input.closest('label');
  const card  = input.closest('.photo-card');
  const img   = document.createElement('img');

  img.src = url;
  img.alt = 'Foto especial con mamá';
  img.loading = 'lazy';

  label.replaceWith(img);

  card.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.05)'; });
  card.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; });

  vibrate([20, 30, 20]);
  showToast('¡Foto añadida! 📸');
}