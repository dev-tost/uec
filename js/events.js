import { state } from './state.js?v=202607311530';
import { $, purchaseForDraw } from './helpers.js?v=202607311530';
import { render } from './render.js?v=202607311530';
import {
  startDraw,
  savePurchase,
  saveRating,
  saveNewMember,
  saveEditMember,
  deactivateMember,
  startNewRound,
  togglePresence,
} from './actions.js?v=202607311530';

/* ---------- EVENTY ---------- */
export function attachEvents() {
  // wybór osoby (ekran startowy)
  document.querySelectorAll('[data-who]').forEach((el) => {
    el.onclick = () => {
      state.whoAmI = el.dataset.who;
      localStorage.setItem('akcja-kawowa-who', state.whoAmI);
      render();
    };
  });

  // zmiana zakładki (sidebar)
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.onclick = () => {
      state.tab = el.dataset.tab;
      render();
    };
  });

  // mobilne menu — pokaż/schowaj sidebar (bez pełnego render(), to tylko stan UI)
  const btnMobileMenu = $('#btn-mobile-menu');
  if (btnMobileMenu)
    btnMobileMenu.onclick = () => {
      $('.shell')?.classList.toggle('sidebar-open');
    };
  const sidebarBackdrop = $('#sidebar-backdrop');
  if (sidebarBackdrop)
    sidebarBackdrop.onclick = () => {
      $('.shell')?.classList.remove('sidebar-open');
    };

  // wyloguj (wróć do ekranu wyboru osoby)
  const btnLogout = $('#btn-logout');
  if (btnLogout)
    btnLogout.onclick = () => {
      state.whoAmI = null;
      localStorage.removeItem('akcja-kawowa-who');
      render();
    };

  // przycisk LOSUJ
  const btnDraw = $('#btn-draw');
  if (btnDraw) btnDraw.onclick = startDraw;

  // powrót z wyniku
  const btnBack = $('#btn-back');
  if (btnBack)
    btnBack.onclick = () => {
      state.draw = { stage: 'idle', winner: null, gifUrl: null };
      render();
    };

  // zarejestruj zakup (karta "twoja kolej")
  const btnMyTurnRegister = $('#btn-my-turn-register');
  if (btnMyTurnRegister)
    btnMyTurnRegister.onclick = () => {
      const cr = state.data.rounds.find((r) => r.number === state.data.currentRound);
      const myDraw = cr?.draws.find((d) => d.memberId === state.whoAmI);
      if (!myDraw) return;
      state.modal = 'purchase';
      state.modalData = { drawId: myDraw.id };
      render();
    };

  // zarejestruj zakup (z rankingu)
  const btnOpenRegister = $('#btn-open-register');
  if (btnOpenRegister)
    btnOpenRegister.onclick = () => {
      const cr = state.data.rounds.find((r) => r.number === state.data.currentRound);
      const myDraw = cr?.draws.find((d) => d.memberId === state.whoAmI && !purchaseForDraw(d.id));
      if (!myDraw) return;
      state.modal = 'purchase';
      state.modalData = { drawId: myDraw.id };
      render();
    };

  // zamknij modal
  ['modal-close', 'modal-close-2', 'modal-overlay'].forEach((id) => {
    const el = $(`#${id}`);
    if (el)
      el.onclick = (e) => {
        if (id !== 'modal-overlay' || e.target === el) {
          state.modal = null;
          state.modalData = {};
          render();
        }
      };
  });

  // zapisz zakup
  const btnSavePurchase = $('#btn-save-purchase');
  if (btnSavePurchase) btnSavePurchase.onclick = savePurchase;

  // przyciski oceny
  document.querySelectorAll('.score-btn').forEach((el) => {
    el.onclick = () => {
      state.modalData.score = parseInt(el.dataset.score);
      render();
    };
  });

  // komentarz do oceny — nie przerysowujemy całego widoku, żeby pole nie straciło fokusu podczas pisania
  const ratingComment = $('#f-rating-comment');
  if (ratingComment)
    ratingComment.oninput = (e) => {
      state.modalData.comment = e.target.value;
    };

  // zapisz ocenę
  const btnSaveRating = $('#btn-save-rating');
  if (btnSaveRating) btnSaveRating.onclick = saveRating;

  // otwórz kartę kawy (klik na kartę/wiersz w rankingu)
  document.querySelectorAll('[data-card]').forEach((el) => {
    el.onclick = () => {
      state.modal = 'coffeeCard';
      state.modalData = { coffeeId: el.dataset.card };
      render();
    };
  });

  // oceń konkretny zakup (przycisk w karcie kawy, per partia)
  document.querySelectorAll('[data-rate-purchase]').forEach((el) => {
    el.onclick = () => {
      const purchaseId = el.dataset.ratePurchase;
      state.modal = 'rating';
      state.modalData = { purchaseId, score: 7, comment: '' };
      render();
    };
  });

  // marka/odmiana w formularzu zakupu — jeśli to znana kawa, zdjęcie przestaje być wymagane
  // (nie przerysowujemy całego widoku, żeby pole nie straciło fokusu podczas pisania)
  const updatePhotoRequirement = () => {
    const brand = $('#f-brand')?.value?.trim().toLowerCase();
    const variety = $('#f-variety')?.value?.trim().toLowerCase();
    const known =
      !!brand &&
      !!variety &&
      state.data.coffees.some(
        (c) => c.brand.trim().toLowerCase() === brand && c.variety.trim().toLowerCase() === variety,
      );
    const hint = $('#photo-hint');
    if (hint) hint.textContent = known ? 'znana kawa — zdjęcie niewymagane' : '';
    const req = $('#photo-required-hint');
    if (req) req.style.display = known ? 'none' : 'inline';
  };
  ['f-brand', 'f-variety'].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.oninput = updatePhotoRequirement;
  });

  // przyciski obecności (W biurze / Nieobecny)
  document.querySelectorAll('[data-presence]').forEach((el) => {
    el.onclick = () => {
      const isOff = el.dataset.off === 'true';
      togglePresence(el.dataset.presence, isOff);
    };
  });

  // dezaktywacja uczestnika
  document.querySelectorAll('[data-deactivate]').forEach((el) => {
    el.onclick = () => deactivateMember(el.dataset.deactivate);
  });

  // edycja uczestnika — otwórz modal
  document.querySelectorAll('[data-edit]').forEach((el) => {
    el.onclick = () => {
      state.modal = 'editMember';
      state.modalData = { memberId: el.dataset.edit };
      render();
    };
  });

  // edycja uczestnika — zapisz
  const btnSaveEditMember = $('#btn-save-edit-member');
  if (btnSaveEditMember) btnSaveEditMember.onclick = saveEditMember;

  // dodaj uczestnika — otwórz modal
  const btnOpenAddMember = $('#btn-open-add-member');
  if (btnOpenAddMember)
    btnOpenAddMember.onclick = () => {
      state.modal = 'addMember';
      state.modalData = {};
      render();
    };

  // dodaj uczestnika — zapisz
  const btnSaveMember = $('#btn-save-member');
  if (btnSaveMember) btnSaveMember.onclick = saveNewMember;

  // nowa runda
  const btnNewRound = $('#btn-new-round');
  if (btnNewRound) btnNewRound.onclick = startNewRound;
}
