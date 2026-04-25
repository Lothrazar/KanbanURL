//  Celebration animations 
const canvas = document.getElementById('celebCanvas');
const ctx = canvas.getContext('2d');
let animId = null;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function celebrate() {
  const fns = [runConfetti, runFireworks, runBubbles, runStars, runHearts, runRainbow];
  if (animId) cancelAnimationFrame(animId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fns[Math.floor(Math.random() * fns.length)]();
}

function runConfetti() {
  const pieces = Array.from({ length: 130 }, () => ({
    x:    Math.random() * canvas.width,
    y:    -10 - Math.random() * 120,
    vx:   (Math.random() - 0.5) * 4,
    vy:   3 + Math.random() * 4,
    rot:  Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.18,
    w:    8 + Math.random() * 8,
    h:    4 + Math.random() * 4,
    color: `hsl(${Math.random() * 360},90%,60%)`,
  }));
  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (ts - t0 < 3200) animId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animId = requestAnimationFrame(frame);
}

function runFireworks() {
  const bursts = [];
  let burstsDone = 0;
  let t0 = null;

  function burst() {
    const x = 80 + Math.random() * (canvas.width - 160);
    const y = 60 + Math.random() * (canvas.height * 0.5);
    const color = `hsl(${Math.random() * 360},90%,65%)`;
    bursts.push({
      color,
      pts: Array.from({ length: 55 }, () => {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 6;
        return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 };
      }),
    });
  }

  function frame(ts) {
    if (!t0) t0 = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (burstsDone < 7 && ts - t0 > burstsDone * 380) { burst(); burstsDone++; }
    bursts.forEach(b => {
      b.pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.life -= 0.017;
        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });
    ctx.globalAlpha = 1;
    const alive = bursts.some(b => b.pts.some(p => p.life > 0));
    if (alive || ts - t0 < 2800) animId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animId = requestAnimationFrame(frame);
}

function runBubbles() {
  const bubs = Array.from({ length: 55 }, () => ({
    x:  Math.random() * canvas.width,
    y:  canvas.height + 20 + Math.random() * 80,
    r:  8 + Math.random() * 22,
    vy: -(1.4 + Math.random() * 2.5),
    vx: (Math.random() - 0.5) * 1.2,
    color: `hsla(${180 + Math.random() * 80},80%,72%,0.55)`,
  }));
  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubs.forEach(b => {
      b.y += b.vy; b.x += b.vx;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    if (ts - t0 < 3200) animId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animId = requestAnimationFrame(frame);
}

function runStars() {
  const stars = Array.from({ length: 80 }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     3 + Math.random() * 5,
    phase: Math.random() * Math.PI * 2,
    spd:   0.05 + Math.random() * 0.08,
  }));
  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    const elapsed = ts - t0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const alpha = (Math.sin(elapsed * s.spd + s.phase) + 1) / 2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fbbf24';
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? s.r : s.r / 2.5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    if (elapsed < 3200) animId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animId = requestAnimationFrame(frame);
}

function runHearts() {
  const hearts = Array.from({ length: 35 }, () => ({
    x:    Math.random() * canvas.width,
    y:    canvas.height + 20 + Math.random() * 60,
    vy:   -(1.4 + Math.random() * 2.2),
    vx:   (Math.random() - 0.5) * 1.5,
    size: 12 + Math.random() * 22,
    color: `hsl(${330 + Math.random() * 40},90%,65%)`,
  }));

  function drawHeart(x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.25);
    ctx.bezierCurveTo( s * 0.5, -s,  s,   -s * 0.25, 0,  s * 0.55);
    ctx.bezierCurveTo(-s,       -s * 0.25, -s * 0.5, -s, 0, -s * 0.25);
    ctx.fill();
    ctx.restore();
  }

  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(h => { h.y += h.vy; h.x += h.vx; drawHeart(h.x, h.y, h.size, h.color); });
    if (ts - t0 < 3200) animId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animId = requestAnimationFrame(frame);
}

function runRainbow() {
  const cx = canvas.width / 2;
  const cy = canvas.height + 80;
  const BANDS = ['#f87171','#fb923c','#fbbf24','#4ade80','#60a5fa','#a78bfa'];
  const maxR = Math.hypot(canvas.width / 2, canvas.height) * 1.05;
  let t0 = null;

  function frame(ts) {
    if (!t0) t0 = ts;
    const elapsed = ts - t0;
    const progress = Math.min(1, elapsed / 900);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    BANDS.forEach((color, i) => {
      const r = maxR - i * 30;
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 24;
      ctx.globalAlpha = progress * 0.65;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    if (elapsed < 3200) animId = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animId = requestAnimationFrame(frame);
}
