import { state } from './state.js?v=202607311530';
import {
  coffeeById,
  memberById,
  initials,
  buyVerb,
  avgScore,
  purchasesForCoffee,
  myRatingForPurchase,
  ocenLabel,
} from './helpers.js?v=202607311530';

/* ---------- MODALE ---------- */
function fieldError(key) {
  const msg = state.modalData.errors?.[key];
  return msg ? `<div class="field-error">${msg}</div>` : '';
}

function errorClass(key) {
  return state.modalData.errors?.[key] ? 'field-input-error' : '';
}

export function renderModal() {
  if (state.modal === 'purchase') return renderModalPurchase();
  if (state.modal === 'rating') return renderModalRating();
  if (state.modal === 'addMember') return renderModalAddMember();
  if (state.modal === 'editMember') return renderModalEditMember();
  if (state.modal === 'coffeeCard') return renderModalCoffeeCard();
  return '';
}

function renderModalPurchase() {
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Zarejestruj zakup</h3>
          <button class="btn btn-ghost" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <label class="field-label">Palarnia / marka</label>
          <input class="field-input ${errorClass('brand')}" id="f-brand" value="${state.modalData.brand || ''}" list="coffee-brands" placeholder="np. HAYB" />
          <datalist id="coffee-brands">
            ${[...new Set(state.data.coffees.map((c) => c.brand))].map((b) => `<option value="${b}">`).join('')}
          </datalist>
          ${fieldError('brand')}

          <label class="field-label">Odmiana</label>
          <input class="field-input ${errorClass('variety')}" id="f-variety" value="${state.modalData.variety || ''}" list="coffee-varieties" placeholder="np. Etiopia Sidamo" />
          <datalist id="coffee-varieties">
            ${[...new Set(state.data.coffees.map((c) => c.variety))].map((v) => `<option value="${v}">`).join('')}
          </datalist>
          ${fieldError('variety')}

          <label class="field-label">Cena (zł)</label>
          <input class="field-input ${errorClass('price')}" id="f-price" type="number" value="${state.modalData.price || ''}" placeholder="np. 79" />
          ${fieldError('price')}

          <label class="field-label">Zdjęcie opakowania <span id="photo-required-hint">*</span></label>
          <input class="field-input ${errorClass('photo')}" id="f-photo" type="file" accept="image/*" />
          <div class="mono" id="photo-hint" style="margin-top:4px; color:var(--ink-soft)"></div>
          ${fieldError('photo')}

          ${state.saving ? '<div class="mono" style="color:var(--coffee); margin-top:8px">zapisuję...</div>' : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-close-2">Anuluj</button>
          <button class="btn btn-primary" id="btn-save-purchase" ${state.saving ? 'disabled' : ''}>
            Zapisz zakup
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderModalRating() {
  const purchase = state.data.purchases.find((p) => p.id === state.modalData.purchaseId);
  const coffee = coffeeById(purchase.coffeeId);
  const currentScore = state.modalData.score || 5;
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Oceń kawę</h3>
          <button class="btn btn-ghost" id="modal-close">✕</button>
        </div>
        <div class="modal-body" style="text-align:center">
          <div style="font-size:18px; font-weight:600; margin-bottom:4px">${coffee.brand}</div>
          <div class="mono" style="margin-bottom:24px">${coffee.variety}</div>

          <div class="score-picker">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
              .map(
                (n) => `
              <button class="score-btn ${n === currentScore ? 'active' : ''}" data-score="${n}">${n}</button>
            `,
              )
              .join('')}
          </div>
          <div class="mono" style="margin-top:8px">wybrana ocena: <strong>${currentScore}</strong> / 10</div>

          <label class="field-label" style="text-align:left; margin-top:20px">Komentarz (opcjonalnie)</label>
          <textarea class="field-input" id="f-rating-comment" rows="3" placeholder="Co sądzisz o tej kawie?" style="width:100%; resize:vertical; font-family:inherit; box-sizing:border-box">${state.modalData.comment || ''}</textarea>

          ${state.saving ? '<div class="mono" style="color:var(--coffee); margin-top:8px">zapisuję...</div>' : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-close-2">Anuluj</button>
          <button class="btn btn-primary" id="btn-save-rating" ${state.saving ? 'disabled' : ''}>
            Zapisz ocenę
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderModalCoffeeCard() {
  const coffee = coffeeById(state.modalData.coffeeId);
  if (!coffee) return '';

  const events = purchasesForCoffee(coffee.id)
    .map((p) => {
      const draw = state.data.rounds.flatMap((r) => r.draws).find((d) => d.id === p.drawId);
      const buyer = draw ? memberById(draw.memberId) : null;
      const ratings = state.data.ratings
        .filter((r) => r.purchaseId === p.id)
        .sort((a, b) => b.score - a.score);
      return { ...p, draw, buyer, ratings, myRating: myRatingForPurchase(p.id) };
    })
    .sort((a, b) => new Date(b.draw?.date || 0) - new Date(a.draw?.date || 0));

  const pooledRatings = events.flatMap((e) => e.ratings);
  const score = pooledRatings.length
    ? pooledRatings.reduce((s, r) => s + r.score, 0) / pooledRatings.length
    : null;
  const anyNeedsRate = events.some((e) => !e.myRating);

  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal" style="width:min(620px, 94vw)">
        <div class="modal-header">
          <h3>Karta kawy ${anyNeedsRate ? `<span class="badge badge-rate" style="margin-left:8px; vertical-align:middle">do oceny</span>` : ''}</h3>
          <button class="btn btn-ghost" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="coffee-card-head">
            <div class="coffee-card-photo">
              <img src="${coffee.photo}" alt="kawa"/>
            </div>
            <div class="coffee-card-info">
              <div style="font-size:18px; font-weight:600">${coffee.brand}</div>
              <div class="mono">${coffee.variety}</div>
              <div class="mono" style="margin-top:6px; color:var(--ink-soft)">
                kupiona ${events.length} ${events.length === 1 ? 'raz' : 'razy'}
              </div>
            </div>
            <div class="coffee-card-score">
              <div class="value">${score !== null ? score.toFixed(1) : '—'}</div>
              <div class="mono">${pooledRatings.length} ${ocenLabel(pooledRatings.length)}</div>
            </div>
          </div>

          <hr class="divider"/>

          <h3 style="margin-bottom:8px">Historia zakupów</h3>
          <div class="purchase-event-list">
            ${events
              .map((e) => {
                const eventScore = avgScore(e.id);
                return `
              <div class="purchase-event">
                <div class="purchase-event-head">
                  <div class="avatar" style="width:32px; height:32px; font-size:12px">${initials(e.buyer?.name || '?')}</div>
                  <div class="purchase-event-info">
                    <div>${e.buyer ? `${e.buyer.name} ${buyVerb(e.buyer)}` : 'nieznany'}</div>
                    <div class="mono">${e.draw?.date || ''} · ${e.price} zł</div>
                  </div>
                  <div class="purchase-event-score">
                    <span class="mono">${eventScore !== null ? eventScore.toFixed(1) : '—'}</span>
                    ${!e.myRating ? `<button class="btn btn-primary" data-rate-purchase="${e.id}">Oceń</button>` : ''}
                  </div>
                </div>
                ${
                  e.ratings.length === 0
                    ? `<div class="mono" style="padding:6px 0">jeszcze nikt nie ocenił tego zakupu</div>`
                    : `<div class="comment-list">
                      ${e.ratings
                        .map((r) => {
                          const m = memberById(r.memberId);
                          return `
                          <div class="comment-row">
                            <div class="avatar" style="width:32px; height:32px; font-size:12px">${initials(m?.name || '?')}</div>
                            <div class="comment-body">
                              <div class="comment-top">
                                <span class="comment-name">${m?.name || 'nieznany'}</span>
                                <span class="comment-score">${r.score}/10</span>
                              </div>
                              ${
                                r.comment
                                  ? `<div class="comment-text">${r.comment}</div>`
                                  : `<div class="comment-text comment-empty">bez komentarza</div>`
                              }
                            </div>
                          </div>
                        `;
                        })
                        .join('')}
                    </div>`
                }
              </div>
              `;
              })
              .join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-close-2">Zamknij</button>
        </div>
      </div>
    </div>
  `;
}

function renderModalAddMember() {
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Dodaj uczestnika</h3>
          <button class="btn btn-ghost" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <label class="field-label">Imię</label>
          <input class="field-input ${errorClass('name')}" id="f-member-name" value="${state.modalData.name || ''}" placeholder="np. Zosia" autocomplete="off" />
          ${fieldError('name')}

          <label class="field-label">Płeć</label>
          <div style="display:flex; gap:8px; margin-bottom:12px">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer">
              <input type="radio" name="f-gender" value="K" ${(state.modalData.gender || 'K') === 'K' ? 'checked' : ''} /> Kobieta
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer">
              <input type="radio" name="f-gender" value="M" ${state.modalData.gender === 'M' ? 'checked' : ''} /> Mężczyzna
            </label>
          </div>

          <label class="field-label">Ulubiona kawa</label>
          <input class="field-input" id="f-member-drink" value="${state.modalData.drink || ''}" placeholder="np. flat white, espresso..." />

          ${state.saving ? '<div class="mono" style="color:var(--coffee); margin-top:8px">zapisuję...</div>' : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-close-2">Anuluj</button>
          <button class="btn btn-primary" id="btn-save-member" ${state.saving ? 'disabled' : ''}>
            Dodaj do zespołu
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderModalEditMember() {
  const member = memberById(state.modalData.memberId);
  if (!member) return '';
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>✎ Edytuj uczestnika</h3>
          <button class="btn btn-ghost" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <label class="field-label">Imię</label>
          <input class="field-input ${errorClass('name')}" id="f-edit-member-name" value="${state.modalData.name ?? member.name}" autocomplete="off" />
          ${fieldError('name')}

          <label class="field-label">Płeć</label>
          <div style="display:flex; gap:8px; margin-bottom:12px">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer">
              <input type="radio" name="f-edit-gender" value="K" ${(state.modalData.gender ?? member.gender) === 'K' ? 'checked' : ''} /> Kobieta
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer">
              <input type="radio" name="f-edit-gender" value="M" ${(state.modalData.gender ?? member.gender) === 'M' ? 'checked' : ''} /> Mężczyzna
            </label>
          </div>

          <label class="field-label">Ulubiona kawa</label>
          <input class="field-input" id="f-edit-member-drink" value="${state.modalData.drink ?? member.drink}" placeholder="np. flat white, espresso..." />

          ${state.saving ? '<div class="mono" style="color:var(--coffee); margin-top:8px">zapisuję...</div>' : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="modal-close-2">Anuluj</button>
          <button class="btn btn-primary" id="btn-save-edit-member" ${state.saving ? 'disabled' : ''}>
            Zapisz zmiany
          </button>
        </div>
      </div>
    </div>
  `;
}
