import { state } from './state.js?v=202608251347';
import { $, inGame } from './helpers.js?v=202608251347';
import { render } from './render.js?v=202608251347';

/* ---------- ANIMACJA LOSOWANIA ---------- */
export function animateReel(winner) {
  const track = $('#reel-track');
  if (!track) return;

  const items = track.querySelectorAll('.reel-name');
  if (items.length === 0) return;

  const itemWidth = 60 + items[0].offsetWidth;
  const players = inGame();
  const winnerIdx = players.findIndex((p) => p.id === winner.id);
  const targetIdx = players.length * 2 + winnerIdx;

  const reel = track.parentElement;
  const reelCenter = reel.offsetWidth / 2;
  const targetX = targetIdx * itemWidth + items[0].offsetWidth / 2 - reelCenter;

  let start = null;
  const duration = 3500;

  const settleAt = 0.8; // do tego momentu bęben swobodnie się kręci, dopiero potem ląduje na wyniku

  function tick(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased =
      progress < settleAt
        ? (progress / settleAt) * 0.6
        : 0.6 + 0.4 * (1 - Math.pow(1 - (progress - settleAt) / (1 - settleAt), 3));
    const x = -targetX * eased;
    track.style.transform = `translateX(${x}px)`;

    items.forEach((el, i) => {
      const elCenter = i * itemWidth + items[0].offsetWidth / 2 + x;
      const dist = Math.abs(elCenter - reelCenter);
      const closeness = progress < settleAt ? 0 : Math.max(0, 1 - dist / 200);
      el.style.opacity = 0.3 + closeness * 0.7;
      el.style.transform = `scale(${1 + closeness * 0.4})`;
      el.style.color = closeness > 0.7 ? 'var(--coffee)' : 'var(--ink-2)';
    });

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(() => {
        state.draw.stage = 'wynik';
        render();
        loadGif();
        spawnConfetti();
      }, 400);
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- GIPHY ---------- */
async function loadGif() {
  const slot = $('#gif-slot');
  if (!slot) return;
  const KEY = 'Ul846NALYcUAu7Zwm3vbhuKJCYjeSevx';
  const tags = ['coffee', 'celebration', 'drama', 'wow'];
  const tag = tags[Math.floor(Math.random() * tags.length)];
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${KEY}&tag=${tag}&rating=g`,
    );
    const json = await res.json();
    const url = json.data?.images?.fixed_height?.url;
    if (url) slot.innerHTML = `<img src="${url}" alt="mem"/>`;
    else slot.innerHTML = '<span class="mono">brak gifa 😅</span>';
  } catch {
    slot.innerHTML = '<span class="mono">giphy offline</span>';
  }
}

/* ---------- KONFETTI ---------- */
function spawnConfetti() {
  const stage = $('#result-stage');
  if (!stage) return;
  const colors = ['#22c55e', '#6ee7b7', '#ffffff', '#0b0a10', '#d4183d'];
  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 0.6 + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    stage.appendChild(c);
    setTimeout(() => c.remove(), 2200);
  }
}
