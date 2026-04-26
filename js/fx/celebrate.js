export class Celebrations {
  constructor(settings) {
    this._settings = settings;
    this._canvas = $('celebCanvas');
    this._ctx = this._canvas.getContext('2d');
    this._animId = null;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  celebrate() {
    const fns = {
      confetti:      () => this._runConfetti(),
      fireworks:     () => this._runFireworks(),
      bubbles:       () => this._runBubbles(),
      stars:         () => this._runStars(),
      hearts:        () => this._runHearts(),
      rainbow:       () => this._runRainbow(),
      shootingStars: () => this._runShootingStars(),
      balloons:      () => this._runBalloons(),
    };
    const enabled = Object.keys(fns).filter(k => this._settings.celebrations[k]);
    const pool = enabled.length ? enabled : Object.keys(fns);
    if (this._animId) cancelAnimationFrame(this._animId);
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    fns[pool[Math.floor(Math.random() * pool.length)]]();
  }

  _resize() {
    this._canvas.width  = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  _runConfetti() {
    const pieces = Array.from({ length: 130 }, () => ({
      x:    Math.random() * this._canvas.width,
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
    const frame = (ts) => {
      if (!t0) t0 = ts;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        this._ctx.save();
        this._ctx.translate(p.x, p.y);
        this._ctx.rotate(p.rot);
        this._ctx.fillStyle = p.color;
        this._ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this._ctx.restore();
      });
      if (ts - t0 < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _runFireworks() {
    const bursts = [];
    let burstsDone = 0;
    let t0 = null;

    const burst = () => {
      const x = 80 + Math.random() * (this._canvas.width - 160);
      const y = 60 + Math.random() * (this._canvas.height * 0.5);
      const color = `hsl(${Math.random() * 360},90%,65%)`;
      bursts.push({
        color,
        pts: Array.from({ length: 55 }, () => {
          const a = Math.random() * Math.PI * 2;
          const s = 2 + Math.random() * 6;
          return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 };
        }),
      });
    };

    const frame = (ts) => {
      if (!t0) t0 = ts;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      if (burstsDone < 7 && ts - t0 > burstsDone * 380) { burst(); burstsDone++; }
      bursts.forEach(b => {
        b.pts.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.life -= 0.017;
          if (p.life > 0) {
            this._ctx.globalAlpha = p.life;
            this._ctx.fillStyle = b.color;
            this._ctx.beginPath();
            this._ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this._ctx.fill();
          }
        });
      });
      this._ctx.globalAlpha = 1;
      const alive = bursts.some(b => b.pts.some(p => p.life > 0));
      if (alive || ts - t0 < 2800) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _runBubbles() {
    const bubs = Array.from({ length: 55 }, () => ({
      x:  Math.random() * this._canvas.width,
      y:  this._canvas.height + 20 + Math.random() * 80,
      r:  8 + Math.random() * 22,
      vy: -(1.4 + Math.random() * 2.5),
      vx: (Math.random() - 0.5) * 1.2,
      color: `hsla(${180 + Math.random() * 80},80%,72%,0.55)`,
    }));
    let t0 = null;
    const frame = (ts) => {
      if (!t0) t0 = ts;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      bubs.forEach(b => {
        b.y += b.vy; b.x += b.vx;
        this._ctx.beginPath();
        this._ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        this._ctx.fillStyle = b.color;
        this._ctx.fill();
        this._ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        this._ctx.lineWidth = 1.5;
        this._ctx.stroke();
      });
      if (ts - t0 < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _runStars() {
    const colors = ['#fbbf24', '#f9fafb', '#67e8f9', '#fde68a', '#c4b5fd'];
    const stars = Array.from({ length: 80 }, () => ({
      x:     Math.random() * this._canvas.width,
      y:     Math.random() * this._canvas.height,
      r:     3 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      spd:   0.0015 + Math.random() * 0.002,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let t0 = null;
    const frame = (ts) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        const alpha = (Math.sin(elapsed * s.spd + s.phase) + 1) / 2;
        this._ctx.globalAlpha = alpha;
        this._ctx.fillStyle = s.color;
        this._ctx.save();
        this._ctx.translate(s.x, s.y);
        this._ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          const r = i % 2 === 0 ? s.r : s.r / 2.5;
          this._ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        this._ctx.closePath();
        this._ctx.fill();
        this._ctx.restore();
      });
      this._ctx.globalAlpha = 1;
      if (elapsed < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _runShootingStars() {
    const colors = ['#fbbf24', '#f9fafb', '#67e8f9', '#c4b5fd'];
    const stars = Array.from({ length: 36 }, (_, i) => {
      const angle = Math.PI * 0.1 + Math.random() * Math.PI * 0.25;
      const spd   = 8 + Math.random() * 10;
      return {
        x:     Math.random() * this._canvas.width,
        y:     -20 - i * 60,
        vx:    Math.cos(angle) * spd,
        vy:    Math.sin(angle) * spd,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      };
    });
    let t0 = null;
    const frame = (ts) => {
      if (!t0) t0 = ts;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      stars.forEach(s => {
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 28) s.trail.shift();
        s.x += s.vx; s.y += s.vy;
        s.trail.forEach((pt, i) => {
          this._ctx.globalAlpha = (i / s.trail.length) * 0.8;
          this._ctx.fillStyle = s.color;
          this._ctx.beginPath();
          this._ctx.arc(pt.x, pt.y, (i / s.trail.length) * 3, 0, Math.PI * 2);
          this._ctx.fill();
        });
        this._ctx.globalAlpha = 1;
        this._ctx.fillStyle = '#ffffff';
        this._ctx.beginPath();
        this._ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        this._ctx.fill();
      });
      this._ctx.globalAlpha = 1;
      if (ts - t0 < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _runHearts() {
    const hearts = Array.from({ length: 35 }, () => ({
      x:    Math.random() * this._canvas.width,
      y:    this._canvas.height + 20 + Math.random() * 60,
      vy:   -(1.4 + Math.random() * 2.2),
      vx:   (Math.random() - 0.5) * 1.5,
      size: 12 + Math.random() * 22,
      color: `hsl(${330 + Math.random() * 40},90%,65%)`,
    }));
    let t0 = null;
    const frame = (ts) => {
      if (!t0) t0 = ts;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      hearts.forEach(h => { h.y += h.vy; h.x += h.vx; this._drawHeart(h.x, h.y, h.size, h.color); });
      if (ts - t0 < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _drawHeart(x, y, s, color) {
    this._ctx.save();
    this._ctx.translate(x, y);
    this._ctx.fillStyle = color;
    this._ctx.beginPath();
    this._ctx.moveTo(0, -s * 0.25);
    this._ctx.bezierCurveTo( s * 0.5, -s,  s,   -s * 0.25, 0,  s * 0.55);
    this._ctx.bezierCurveTo(-s,       -s * 0.25, -s * 0.5, -s, 0, -s * 0.25);
    this._ctx.fill();
    this._ctx.restore();
  }

  _runRainbow() {
    const cx = this._canvas.width / 2;
    const cy = this._canvas.height + 80;
    const BANDS = ['#f87171','#fb923c','#fbbf24','#4ade80','#60a5fa','#a78bfa'];
    const maxR = Math.hypot(this._canvas.width / 2, this._canvas.height) * 1.05;
    let t0 = null;
    const frame = (ts) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0;
      const progress = Math.min(1, elapsed / 900);
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      BANDS.forEach((color, i) => {
        const r = maxR - i * 30;
        this._ctx.beginPath();
        this._ctx.arc(cx, cy, r, Math.PI, 0);
        this._ctx.strokeStyle = color;
        this._ctx.lineWidth = 24;
        this._ctx.globalAlpha = progress * 0.65;
        this._ctx.stroke();
      });
      this._ctx.globalAlpha = 1;
      if (elapsed < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _runBalloons() {
    const balloons = Array.from({ length: 30 }, () => ({
      x:     Math.random() * this._canvas.width,
      y:     this._canvas.height + 30 + Math.random() * 120,
      vy:    -(1.2 + Math.random() * 2),
      vx:    (Math.random() - 0.5) * 0.6,
      w:     18 + Math.random() * 22,
      sway:  Math.random() * Math.PI * 2,
      swayS: 0.018 + Math.random() * 0.018,
      color: `hsl(${Math.random() * 360},85%,65%)`,
    }));
    let t0 = null;
    const frame = (ts) => {
      if (!t0) t0 = ts;
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      balloons.forEach(b => {
        b.sway += b.swayS;
        b.x += b.vx + Math.sin(b.sway) * 0.5;
        b.y += b.vy;
        this._drawBalloon(b.x, b.y, b.w, b.color);
      });
      if (ts - t0 < 3200) this._animId = requestAnimationFrame(frame);
      else this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._animId = requestAnimationFrame(frame);
  }

  _drawBalloon(x, y, w, color) {
    const h = w * 1.25;
    this._ctx.beginPath();
    this._ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    this._ctx.fillStyle = color;
    this._ctx.fill();
    this._ctx.beginPath();
    this._ctx.ellipse(x - w * 0.14, y - h * 0.14, w * 0.11, h * 0.09, -0.5, 0, Math.PI * 2);
    this._ctx.fillStyle = 'rgba(255,255,255,0.38)';
    this._ctx.fill();
    this._ctx.beginPath();
    this._ctx.moveTo(x - 3, y + h / 2);
    this._ctx.lineTo(x + 3, y + h / 2);
    this._ctx.lineTo(x, y + h / 2 + 5);
    this._ctx.closePath();
    this._ctx.fillStyle = color;
    this._ctx.fill();
    this._ctx.beginPath();
    this._ctx.moveTo(x, y + h / 2 + 5);
    this._ctx.bezierCurveTo(x + 9, y + h / 2 + 18, x - 9, y + h / 2 + 34, x + 5, y + h / 2 + 48);
    this._ctx.strokeStyle = 'rgba(160,160,160,0.55)';
    this._ctx.lineWidth = 1;
    this._ctx.stroke();
  }
}
