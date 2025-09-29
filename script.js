// Confetti + checklist logic
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Confetti setup ----
  const canvas = document.getElementById('confetti');
  if (!canvas) {
    console.warn('[confetti] #confetti canvas not found');
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('[confetti] 2D context not available');
    return;
  }

  const sizeCanvas = () => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width  = Math.floor(window.innerWidth  * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  };
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  let pieces = [];
  function burst(x, y, n = 120) {
    for (let i = 0; i < n; i++) {
      pieces.push({
        x, y,
        vx: (Math.random() * 2 - 1) * 4,
        vy: (Math.random() * -1) * 6 - 2,
        g: 0.12 + Math.random() * 0.12,
        a: 1,
        r: 2 + Math.random() * 3,
        c: ['#5bc0be','#6fffe9','#eaf2ff','#f9d976','#ffaaa7'][Math.floor(Math.random() * 5)]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.a -= 0.01;
    }
    pieces = pieces.filter(p => p.a > 0 && p.y < window.innerHeight + 40);
    requestAnimationFrame(draw);
  }
  draw();

  // Button-triggered celebrate (if present)
  document.getElementById('confettiBtn')?.addEventListener('click', () => {
    burst(window.innerWidth * 0.5, 120, 140);
  });

  // Listen for custom celebrate events (used by the typing code)
  document.addEventListener('puffer:celebrate', (e) => {
    const d = e.detail || {};
    const x = d.x ?? window.innerWidth * 0.5;
    const y = d.y ?? 140;
    const n = d.n ?? 160;
    burst(x, y, n);
  });

  // ---- Images trigger confetti (scoped) ----
  function bindImageBursts() {
    const selectors = ['.cta-row img', '.hero-gallery img'];
    document.querySelectorAll(selectors.join(',')).forEach(img => {
      if (img.dataset.confettiBound === '1') return;
      img.dataset.confettiBound = '1';

      const fire = () => {
        const rect = img.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        burst(x, y, 90);
      };

      img.addEventListener('click', fire);
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindImageBursts, { once: true });
  } else {
    bindImageBursts();
  }

  // ---- Checklist ----
  const TODOS = [
    { id:'tank', text:'Pick puffer species + appropriate tank size' },
    { id:'cycle', text:'Fishless cycle complete (0 ammonia/0 nitrite)' },
    { id:'heater', text:'Heater + thermometer installed; temp stable' },
    { id:'filter', text:'Filter chosen; flow gentle; media seeded' },
    { id:'test', text:'Water test kits ready (NH3/NO2/NO3/pH; salinity if needed)' },
    { id:'hardscape', text:'Hiding spots, plants, and sand/substrate added' },
    { id:'food', text:'Stock varied foods (incl. crunchy shells)' },
    { id:'schedule', text:'Make weekly water-change schedule' },
  ];

  const listEl = document.getElementById('todoList');
  const KEY = 'noah_puffer_checklist_v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}

  function render() {
    if (!listEl) return;
    listEl.innerHTML = '';
    TODOS.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'todo';
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.id = item.id; cb.checked = !!state[item.id];
      const lab = document.createElement('label');
      lab.setAttribute('for', item.id);
      lab.textContent = item.text;
      wrap.appendChild(cb); wrap.appendChild(lab);
      listEl.appendChild(wrap);
      cb.addEventListener('change', () => {
        state[item.id] = cb.checked;
        localStorage.setItem(KEY, JSON.stringify(state));
      });
    });
  }
  render();

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    state = {}; localStorage.setItem(KEY, JSON.stringify(state)); render();
  });
  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
})();

// ---- Typing effect for the title (auto-confetti on finish) ----
document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("typed-word");
  if (!target) return;

  const word = "My Baby's Guide to Owning a Puffer 🐡!!!!";
  let i = 0;

  function nextDelay(ch) {
    const baseMin = 200;
    const baseMax = 400;
    const jitter = baseMin + Math.random() * (baseMax - baseMin);
    if (",.;:!? ".includes(ch)) return jitter + 200;
    return jitter;
  }

  function type() {
    if (i < word.length) {
      const ch = word.charAt(i);
      target.textContent += ch;
      i++;
      setTimeout(type, nextDelay(ch));
    } else {
      // Title finished typing → celebrate!
      setTimeout(() => {
        const hero = document.querySelector('.hero'); // try to center near the hero section
        let x = window.innerWidth * 0.5;
        let y = 140;
        if (hero) {
          const r = hero.getBoundingClientRect();
          x = r.left + r.width / 2;
          y = Math.max(120, r.top + 60);
        }
        document.dispatchEvent(new CustomEvent('puffer:celebrate', {
          detail: { x, y, n: 180 }
        }));
      }, 300);
    }
  }
  type();
});

// Mascot tips: click (or Enter/Space) to toggle a small bubble
(function(){
  function closeAllTips(){
    document.querySelectorAll('.mascot-tip').forEach(x => x.remove());
  }

  function bindMascots(){
    document.querySelectorAll('.section-title .mascot[data-tip]').forEach(img => {
      if (img.dataset.tipBound === '1') return;
      img.dataset.tipBound = '1';
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Show tip');

      function toggleTip(){
        const holder = img.closest('.section-title');
        const existing = holder.querySelector('.mascot-tip');
        if (existing) { existing.remove(); return; }

        closeAllTips(); // one bubble at a time
        const tip = document.createElement('div');
        tip.className = 'mascot-tip';
        tip.textContent = img.dataset.tip || '';
        holder.appendChild(tip);
        // show with transition
        requestAnimationFrame(() => tip.classList.add('show'));
      }

      img.addEventListener('click', toggleTip);
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTip(); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMascots, { once: true });
  } else {
    bindMascots();
  }

  // Close bubbles when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.section-title')) closeAllTips();
  });
})();

