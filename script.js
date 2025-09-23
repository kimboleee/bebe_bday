// Confetti + checklist logic
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Tiny confetti
  const canvas = document.getElementById('confetti');
  const btn = document.getElementById('confettiBtn');
  const ctx = canvas.getContext('2d');
  const W = () => (canvas.width = window.innerWidth);
  const H = () => (canvas.height = window.innerHeight);
  W(); H();
  window.addEventListener('resize', () => { W(); H(); });

  let pieces = [];
  function burst(x, y, n = 120) {
    for (let i = 0; i < n; i++) {
      pieces.push({
        x, y,
        vx: (Math.random() * 2 - 1) * 4,
        vy: (Math.random() * -1) * 6 - 2,
        g: 0.12 + Math.random() * 0.12,
        a: 1,
        r: 2 + Math.random() * 3
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = ['#5bc0be','#6fffe9','#eaf2ff','#f9d976','#ffaaa7'][Math.floor(Math.random() * 5)];
      ctx.fill();
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.a -= 0.01;
    }
    pieces = pieces.filter(p => p.a > 0 && p.y < canvas.height + 20);
    requestAnimationFrame(draw);
  }
  draw();

  // Old Celebrate button still works if present
  if (btn) btn.addEventListener('click', () => burst(window.innerWidth * 0.5, 120));

  // NEW: Make all <img> trigger confetti on click
function wireImageConfetti() {
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.confettiBound === '1') return;
    img.dataset.confettiBound = '1';

    img.addEventListener('click', () => {
      const rect = img.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      burst(x, y, 90);
    });

    // Optional: keyboard accessibility
    img.setAttribute('tabindex', '0');
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const rect = img.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        burst(x, y, 90);
      }
    });
  });
}


  // Run once now (script is loaded at end of body, so DOM is ready)
  wireImageConfetti();

  // Checklist
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

// Typing effect for the word "puffer"
document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("typed-word");
  if (!target) return;
  const word = "Puffer 🐡!!!!";
  let i = 0;

  // Random delay per character, with a longer pause on punctuation/space
  function nextDelay(ch) {
    const baseMin = 200;  // fastest
    const baseMax = 400;  // slowest (normal char)
    const jitter = baseMin + Math.random() * (baseMax - baseMin);

    if (",.;:!? ".includes(ch)) {
      return jitter + 200; // extra pause after punctuation/space
    }
    return jitter;
  }

  function type() {
    if (i < word.length) {
      const ch = word.charAt(i);
      target.textContent += ch;
      i++;
      setTimeout(type, nextDelay(ch));
    }
  }
  type();
});
