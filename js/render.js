import { state } from './state.js?v=202608251347';
import { $, initials, inGame, memberById } from './helpers.js?v=202608251347';
import {
  renderLosowanie,
  renderZespol,
  renderHistoria,
  renderStatystyki,
  renderRanking,
} from './render-tabs.js?v=202608251347';
import { renderModal } from './render-modals.js?v=202608251347';
import { attachEvents } from './events.js?v=202608251347';

/* ---------- RENDER GŁÓWNY ---------- */
let lastRenderedTab = null;

export function render() {
  const app = $('#app');

  if (!state.whoAmI) {
    app.classList.add('login-mode');
    app.innerHTML = renderWhoAmI();
    attachEvents();
    return;
  }
  app.classList.remove('login-mode');

  const tabChanged = state.tab !== lastRenderedTab;
  lastRenderedTab = state.tab;

  app.innerHTML = `
    <div class="shell">
      ${renderSidebar()}
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <main class="main-content">
        <button class="mobile-menu-btn" id="btn-mobile-menu" aria-label="Menu">${ICON_MENU}</button>
        <div class="content-inner">
          ${renderContentHeader()}
          <div id="tab-content" class="${tabChanged ? 'fade-in' : ''}">
            ${renderTab()}
          </div>
        </div>
      </main>
    </div>
    ${state.modal ? renderModal() : ''}
  `;
  attachEvents();
}

/* ---------- EKRAN WYBORU OSOBY ---------- */
function renderWhoAmI() {
  return `
    <div class="login-screen">
      <div class="login-hero">
        <h1 class="login-wordmark">UN-EXPENSED<br>COFFEE</h1>
        <div class="login-tagline">Wylosuj. Kup. Oceń.</div>
      </div>
      <div class="login-panel">
        <div class="mono login-panel-label" style="color:var(--ink-soft)">zaloguj się</div>
        <div class="whoami-list">
          ${state.data.team
            .filter((p) => p.active)
            .map(
              (p) => `
            <button class="whoami-btn" data-who="${p.id}">
              <div class="avatar avatar-lg">${initials(p.name)}</div>
              <span>${p.name}</span>
            </button>
          `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

/* ---------- IKONY (inline SVG, styl kreskowy) ---------- */
const ICON_MENU = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>`;
const ICON_DICE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none"/></svg>`;
const ICON_USERS = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const ICON_CLOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`;
const ICON_CHART = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>`;
const ICON_TROPHY = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 5"/><path d="M17 5h3a3 3 0 0 1-3 5"/></svg>`;

const TABS = [
  { id: 'losowanie', label: 'Losowanie', icon: ICON_DICE },
  { id: 'zespol', label: 'Zespół', icon: ICON_USERS },
  { id: 'historia', label: 'Historia', icon: ICON_CLOCK },
  { id: 'statystyki', label: 'Statystyki', icon: ICON_CHART },
  { id: 'ranking', label: 'Ranking', icon: ICON_TROPHY },
];

/* ---------- SIDEBAR ---------- */
function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">UN-EXPENSED COFFEE</div>
        <div class="mono sidebar-round">runda ${state.data.currentRound} · ${inGame().length} z ${state.data.team.filter((p) => p.active).length} w grze</div>
      </div>
      <nav class="nav-list">
        ${TABS.map(
          (t) => `
          <button class="nav-item ${state.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
            ${t.icon}
            <span>${t.label}</span>
          </button>
        `,
        ).join('')}
      </nav>
      <div class="sidebar-footer">
        <span class="current-name">${memberById(state.whoAmI)?.name ?? ''}</span>
        <button class="btn btn-ghost" id="btn-logout">Wyloguj</button>
      </div>
    </aside>
  `;
}

/* ---------- NAGŁÓWEK NAD TREŚCIĄ ZAKŁADKI ---------- */
function renderContentHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 18 ? 'Dzień dobry' : 'Dobry wieczór';
  return `
    <div class="content-header mono">
      <span class="content-header-dot"></span> ${greeting} · ${memberById(state.whoAmI)?.name ?? ''}
    </div>
  `;
}

function renderTab() {
  switch (state.tab) {
    case 'losowanie':
      return renderLosowanie();
    case 'zespol':
      return renderZespol();
    case 'historia':
      return renderHistoria();
    case 'statystyki':
      return renderStatystyki();
    case 'ranking':
      return renderRanking();
  }
  return '';
}
