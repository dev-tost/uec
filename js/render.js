import { state } from './state.js?v=202607291634';
import { $, initials, memberById, inGame } from './helpers.js?v=202607291634';
import {
  renderLosowanie, renderZespol, renderHistoria, renderStatystyki, renderRanking,
} from './render-tabs.js?v=202607291634';
import { renderModal } from './render-modals.js?v=202607291634';
import { attachEvents } from './events.js?v=202607291634';

/* ---------- RENDER GŁÓWNY ---------- */
let lastRenderedTab = null;

export function render() {
  if (!state.whoAmI) {
    $('#app').innerHTML = renderWhoAmI();
    attachEvents();
    return;
  }

  const tabChanged = state.tab !== lastRenderedTab;
  lastRenderedTab = state.tab;

  $('#app').innerHTML = `
    ${renderTopbar()}
    ${renderTabs()}
    <div id="tab-content" class="${tabChanged ? 'fade-in' : ''}">
      ${renderTab()}
    </div>
    ${state.modal ? renderModal() : ''}
  `;
  attachEvents();
}

/* ---------- EKRAN WYBORU OSOBY ---------- */
function renderWhoAmI() {
  return `
    <div class="whoami-screen">
      <img src="lockup-poziom-6a.svg" alt="Kawa prawem, nie towarem" style="width:360px; margin-bottom:20px">
      <div class="mono" style="margin-bottom:32px; color:var(--ink-soft)">zaloguj się</div>
      <div class="whoami-list">
        ${state.data.team.filter(p => p.active).map(p => `
          <button class="whoami-btn" data-who="${p.id}">
            <div class="avatar avatar-lg">${initials(p.name)}</div>
            <span>${p.name}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTopbar() {
  const me = memberById(state.whoAmI);
  return `
    <div class="topbar">
      <div class="brand">
        <img src="lockup-poziom-6a.svg" alt="Kawa prawem, nie towarem" style="height:70px">
        <div class="subtitle">runda ${state.data.currentRound} · ${inGame().length} z ${state.data.team.filter(p => p.active).length} w grze</div>
      </div>
      <div class="who-am-i">
        <span class="label">kawosz:</span>
        <select id="who-select">
          ${state.data.team.map(p => `
            <option value="${p.id}" ${p.id === state.whoAmI ? 'selected' : ''}>${p.name}</option>
          `).join('')}
        </select>
      </div>
    </div>
  `;
}

function renderTabs() {
  const tabs = [
    { id: 'losowanie',  label: 'Losowanie' },
    { id: 'zespol',     label: 'Zespół' },
    { id: 'historia',   label: 'Historia' },
    { id: 'statystyki', label: 'Statystyki' },
    { id: 'ranking',    label: 'Ranking' },
  ];
  return `
    <div class="tabs">
      ${tabs.map(t => `
        <button class="tab ${state.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
          ${t.label}
        </button>
      `).join('')}
    </div>
  `;
}

function renderTab() {
  switch (state.tab) {
    case 'losowanie':  return renderLosowanie();
    case 'zespol':     return renderZespol();
    case 'historia':   return renderHistoria();
    case 'statystyki': return renderStatystyki();
    case 'ranking':    return renderRanking();
  }
  return '';
}
