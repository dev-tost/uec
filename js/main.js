import { loadData } from './state.js?v=202607311530';
import { $ } from './helpers.js?v=202607311530';
import { render } from './render.js?v=202607311530';

/* ---------- START ---------- */
(async function init() {
  try {
    await loadData();
    render();
  } catch (err) {
    $('#app').innerHTML = `
      <div style="padding:60px; text-align:center; color:var(--ink-soft)">
        <div class="mono">błąd ładowania danych</div>
        <div style="font-size:12px; margin-top:8px; color:var(--ink-soft)">${err.message}</div>
      </div>
    `;
  }
})();
