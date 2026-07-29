import { state } from './state.js?v=202607291634';
import { sb } from './supabase.js?v=202607291634';
import { $, uid, inGame, memberById } from './helpers.js?v=202607291634';
import { render } from './render.js?v=202607291634';
import { animateReel } from './animations.js?v=202607291634';
import { showToast } from './toast.js?v=202607291634';

/* ---------- AKCJE ZAPISU ---------- */

export async function startDraw() {
  const players = inGame();
  if (players.length === 0) return;

  const winner = players[Math.floor(Math.random() * players.length)];
  state.draw.winner = winner.id;
  state.draw.stage = 'reel';
  render();

  setTimeout(() => animateReel(winner), 50);

  // zapisz draw do Supabase
  try {
    const drawId = 'd' + uid();
    const today = new Date().toISOString().slice(0, 10);
    const savedDraw = await sb.post('draws', {
      id: drawId,
      round_number: state.data.currentRound,
      member_id: winner.id,
      draw_date: today,
    });
    // użyj ID z bazy (może się różnić od lokalnie wygenerowanego)
    const actualDrawId = (Array.isArray(savedDraw) ? savedDraw[0] : savedDraw)?.id ?? drawId;
    // dodaj lokalnie (bez przeładowania strony, żeby nie przerywać animacji)
    let currentRoundObj = state.data.rounds.find(r => r.number === state.data.currentRound);
    if (!currentRoundObj) {
      currentRoundObj = { number: state.data.currentRound, draws: [] };
      state.data.rounds.unshift(currentRoundObj);
    }
    currentRoundObj.draws.unshift({ id: actualDrawId, memberId: winner.id, date: today });
    state.draw.savedDrawId = actualDrawId;
  } catch (err) {
    console.error('Błąd zapisu losowania:', err);
  }
}

export async function savePurchase() {
  const brand    = $('#f-brand')?.value?.trim();
  const variety  = $('#f-variety')?.value?.trim();
  const priceRaw = $('#f-price')?.value;
  const price    = parseInt(priceRaw, 10);
  const fileInput = $('#f-photo');
  const file    = fileInput?.files?.[0];
  const drawId  = state.modalData.drawId;

  const existingCoffee = brand && variety && state.data.coffees.find(c =>
    c.brand.trim().toLowerCase() === brand.toLowerCase() &&
    c.variety.trim().toLowerCase() === variety.toLowerCase());

  const errors = {};
  if (!brand) errors.brand = 'Podaj markę.';
  if (!variety) errors.variety = 'Podaj odmianę.';
  if (!priceRaw || isNaN(price) || price <= 0) errors.price = 'Podaj poprawną cenę.';
  if (!existingCoffee && !file && !errors.brand && !errors.variety) {
    errors.photo = 'Dodaj zdjęcie opakowania (nowa kawa).';
  }

  if (Object.keys(errors).length > 0) {
    Object.assign(state.modalData, { errors, brand, variety, price: priceRaw });
    render();
    return;
  }

  state.saving = true;
  render();

  try {
    let coffeeId;
    if (existingCoffee) {
      coffeeId = existingCoffee.id;
    } else {
      const ext = file.name.split('.').pop();
      const path = `${drawId}_${uid()}.${ext}`;
      const photoUrl = await sb.uploadPhoto(file, path);

      coffeeId = 'c' + uid();
      await sb.post('coffees', {
        id: coffeeId,
        brand,
        variety,
        photo_url: photoUrl,
      });
      state.data.coffees.push({ id: coffeeId, brand, variety, photo: photoUrl });
    }

    const purchaseId = 'p' + uid();
    await sb.post('purchases', {
      id: purchaseId,
      draw_id: drawId,
      coffee_id: coffeeId,
      price,
    });

    // dodaj lokalnie
    state.data.purchases.push({ id: purchaseId, drawId, coffeeId, price });

    state.modal = null;
    state.modalData = {};
    state.saving = false;
    state.draw = { stage: 'idle', winner: null, gifUrl: null };
    state.tab = 'ranking';
    render();
    showToast('Zakup zarejestrowany!');
  } catch (err) {
    console.error('Błąd zapisu zakupu:', err);
    state.saving = false;
    render();
    showToast('Błąd zapisu: ' + err.message, 'error');
  }
}

export async function saveRating() {
  const purchaseId = state.modalData.purchaseId;
  const score      = state.modalData.score;
  const comment    = $('#f-rating-comment')?.value?.trim() || null;

  if (!purchaseId || !score) return;

  state.saving = true;
  render();

  try {
    await sb.post('ratings', {
      purchase_id: purchaseId,
      member_id: state.whoAmI,
      score,
      comment,
    });

    // dodaj lokalnie
    state.data.ratings.push({ purchaseId, memberId: state.whoAmI, score, comment });

    state.modal = null;
    state.modalData = {};
    state.saving = false;
    render();
  } catch (err) {
    console.error('Błąd zapisu oceny:', err);
    state.saving = false;
    render();
    showToast('Błąd zapisu: ' + err.message, 'error');
  }
}

export async function saveNewMember() {
  const name      = $('#f-member-name')?.value?.trim();
  const drinkRaw  = $('#f-member-drink')?.value?.trim();
  const drink     = drinkRaw || 'kawa';
  const gender    = document.querySelector('input[name="f-gender"]:checked')?.value || 'K';

  if (!name) {
    Object.assign(state.modalData, { errors: { name: 'Wpisz imię uczestnika.' }, name, drink: drinkRaw, gender });
    render();
    return;
  }

  const nameExists = state.data.team.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    Object.assign(state.modalData, { errors: { name: `„${name}” już jest w zespole.` }, name, drink: drinkRaw, gender });
    render();
    return;
  }

  state.saving = true;
  render();

  try {
    const memberId = 'm' + uid();
    await sb.post('team', {
      id: memberId,
      name,
      drink,
      gender,
      active: true,
      today_off: false,
    });

    // dodaj lokalnie
    state.data.team.push({ id: memberId, name, drink, gender, active: true, today_off: false });
    state.data.team.sort((a, b) => a.name.localeCompare(b.name));

    state.modal = null;
    state.modalData = {};
    state.saving = false;
    render();
  } catch (err) {
    console.error('Błąd zapisu uczestnika:', err);
    state.saving = false;
    render();
    showToast('Błąd zapisu: ' + err.message, 'error');
  }
}

export async function saveEditMember() {
  const memberId = state.modalData.memberId;
  const member = memberById(memberId);
  if (!member) return;

  const name      = $('#f-edit-member-name')?.value?.trim();
  const drinkRaw  = $('#f-edit-member-drink')?.value?.trim();
  const drink     = drinkRaw || 'kawa';
  const gender    = document.querySelector('input[name="f-edit-gender"]:checked')?.value || 'K';

  if (!name) {
    Object.assign(state.modalData, { errors: { name: 'Wpisz imię uczestnika.' }, name, drink: drinkRaw, gender });
    render();
    return;
  }

  const nameExists = state.data.team.some(p => p.id !== memberId && p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    Object.assign(state.modalData, { errors: { name: `„${name}” już jest w zespole.` }, name, drink: drinkRaw, gender });
    render();
    return;
  }

  state.saving = true;
  render();

  try {
    await sb.patch('team', `id=eq.${memberId}`, { name, drink, gender });

    // zaktualizuj lokalnie
    member.name = name;
    member.drink = drink;
    member.gender = gender;
    state.data.team.sort((a, b) => a.name.localeCompare(b.name));

    state.modal = null;
    state.modalData = {};
    state.saving = false;
    render();
    showToast('Zapisano zmiany.');
  } catch (err) {
    console.error('Błąd edycji uczestnika:', err);
    state.saving = false;
    render();
    showToast('Błąd zapisu: ' + err.message, 'error');
  }
}

export async function deactivateMember(memberId) {
  const member = memberById(memberId);
  if (!member) return;
  if (!confirm(`Usunąć ${member.name} z zespołu? Osoba zniknie z losowania, ale historia pozostanie.`)) return;

  // zmieniamy od razu na ekranie, nie czekając na odpowiedź serwera
  member.active = false;
  render();

  try {
    await sb.patch('team', `id=eq.${memberId}`, { active: false });
  } catch (err) {
    console.error('Błąd dezaktywacji:', err);
    member.active = true;
    render();
    showToast('Błąd: ' + err.message, 'error');
  }
}

export async function startNewRound() {
  const newNumber = state.data.currentRound + 1;
  if (!confirm(`Rozpocząć rundę ${newNumber}? Wszyscy wracają do losowania.`)) return;

  try {
    await sb.patch('rounds', 'is_current=eq.true', { is_current: false });
    await sb.post('rounds', { number: newNumber, is_current: true });

    state.data.rounds.unshift({ number: newNumber, draws: [] });
    state.data.currentRound = newNumber;
    state.draw = { stage: 'idle', winner: null, gifUrl: null };
    render();
  } catch (err) {
    console.error('Błąd tworzenia nowej rundy:', err);
    showToast('Błąd: ' + err.message, 'error');
  }
}

export async function togglePresence(memberId, isOff) {
  const member = memberById(memberId);
  if (!member) return;

  // zmieniamy od razu na ekranie, nie czekając na odpowiedź serwera
  member.today_off = isOff;
  render();

  try {
    await sb.patch('team', `id=eq.${memberId}`, { today_off: isOff });
  } catch (err) {
    console.error('Błąd zapisu obecności:', err);
    // cofnij
    member.today_off = !isOff;
    render();
  }
}
