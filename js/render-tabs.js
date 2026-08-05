import { state } from './state.js?v=202607311530';
import {
  initials,
  memberById,
  coffeeById,
  daysAgo,
  paidThisRound,
  inGame,
  out,
  ho,
  emptyState,
  avgScore,
  purchaseForDraw,
  drawForPurchase,
  rankedCoffees,
  coffeeScore,
  ocenLabel,
  myRatingForPurchase,
} from './helpers.js?v=202607311530';

/* ---------- ZAKŁADKA: LOSOWANIE ---------- */
export function renderLosowanie() {
  if (state.draw.stage === 'reel') return renderDrawReel();
  if (state.draw.stage === 'wynik') return renderDrawResult();
  return renderDrawIdle();
}

function renderDrawIdle() {
  const players = inGame();
  const last = state.data.rounds[0]?.draws[0];
  const lastMember = last ? memberById(last.memberId) : null;
  const lastPurchase = last ? purchaseForDraw(last.id) : null;
  const lastDrawHasPurchase = last ? !!lastPurchase : true;
  const roundDone = players.length === 0;
  const canDraw = players.length > 0 && lastDrawHasPurchase;
  const canNewRound = roundDone && lastDrawHasPurchase;

  const currentRoundObj = state.data.rounds.find((r) => r.number === state.data.currentRound);
  const myDraw = currentRoundObj?.draws.find((d) => d.memberId === state.whoAmI);
  const myPurchase = myDraw ? purchaseForDraw(myDraw.id) : null;
  const isMyTurn = !!(myDraw && !myPurchase);
  const daysSinceDrawn = myDraw ? Math.floor((Date.now() - new Date(myDraw.date)) / 86400000) : 0;
  const remaining = Math.max(0, 7 - daysSinceDrawn);

  return `
    <div class="draw-stage">
      <div class="draw-main">
        ${
          isMyTurn
            ? `
          <div class="my-turn-card">
            <div class="mono" style="color:var(--ink); margin-bottom:14px">twoja kolej · runda ${state.data.currentRound}</div>
            <div class="my-turn-headline">${memberById(state.whoAmI)?.name}!</div>
            <div class="my-turn-sub">wylosowano Cię ${daysAgo(myDraw.date)}${remaining > 0 ? ` · zostało Ci ${remaining} ${remaining === 1 ? 'dzień' : 'dni'}` : ''}</div>
            <button class="btn btn-primary my-turn-btn" id="btn-my-turn-register">Zarejestruj zakup</button>
                      <div class="my-turn-footer mono">kolejne losowanie odblokuje się po zarejestrowaniu zakupu</div>
          </div>
        `
            : canDraw
              ? `<button class="btn-draw" id="btn-draw">LOSUJ</button>`
              : `<span class="tooltip-wrap" data-tooltip="${roundDone ? 'Runda zakończona. Wszyscy wylosowani' : 'Zarejestruj zakup przed kolejnym losowaniem'}">
               <button class="btn-draw" id="btn-draw" disabled>LOSUJ</button>
             </span>`
        }
        ${
          !isMyTurn
            ? `
          <div class="draw-hint">
            ${roundDone ? 'Runda zakończona' : !lastDrawHasPurchase ? 'zarejestruj zakup przed kolejnym losowaniem' : ''}
          </div>
          ${
            roundDone
              ? `
            ${
              canNewRound
                ? `<button class="btn btn-primary" id="btn-new-round" style="margin-top:16px">↻ Nowa runda (${state.data.currentRound + 1})</button>`
                : `<span class="tooltip-wrap" data-tooltip="Zarejestruj zakup przed nową rundą" style="display:inline-block; margin-top:16px">
                   <button class="btn btn-primary" id="btn-new-round" disabled>↻ Nowa runda (${state.data.currentRound + 1})</button>
                 </span>`
            }
          `
              : ''
          }
        `
            : ''
        }
      </div>

      <div class="round-info">
        ${
          last && lastMember
            ? `
          <div class="last-drawn-card">
            <div class="mono" style="margin-bottom:12px">↩ ostatnio wylosowany</div>
            <div class="last-drawn-body">
              <div class="avatar avatar-lg" style="background: var(--coffee); color: var(--paper);">${initials(lastMember.name)}</div>
              <div class="last-drawn-info">
                <div class="last-drawn-name">${lastMember.name}</div>
                <div class="last-drawn-meta">
                  <span class="chip mono">${daysAgo(last.date)}</span>
                  ${
                    !lastPurchase
                      ? `<span class="chip mono" style="color:var(--coffee-2); border-color:var(--gold)">czekamy na rejestrację</span>`
                      : `<span class="chip mono" style="color:var(--ink-soft)">zakup zarejestrowany</span>`
                  }
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <div class="card">
          <h3>W grze w tej rundzie <span class="mono">(${players.length})</span></h3>
          <div class="member-list">
            ${
              players
                .map(
                  (p) => `
              <div class="member-row">
                <div class="avatar">${initials(p.name)}</div>
                <span class="name">${p.name}</span>
                <span class="badge badge-game">w grze</span>
              </div>
            `,
                )
                .join('') || '<div class="mono" style="padding:8px">Brak. Runda się skończyła</div>'
            }
          </div>

          ${
            out().length
              ? `
            <hr class="divider"/>
            <h3>Wylosowani w tej rundzie <span class="mono">(${out().length})</span></h3>
            <div class="member-list">
              ${(() => {
                const currentRoundObj = state.data.rounds.find(
                  (r) => r.number === state.data.currentRound,
                );
                return out()
                  .map((p) => {
                    const draw = currentRoundObj?.draws.find((d) => d.memberId === p.id);
                    const purchase = draw ? purchaseForDraw(draw.id) : null;
                    const coffee = purchase ? coffeeById(purchase.coffeeId) : null;
                    return `
                    <div class="member-row drawn-row">
                      <div class="drawn-thumb">
                        ${
                          coffee?.photo
                            ? `<img src="${coffee.photo}" alt="kawa"/>`
                            : `<span>${initials(p.name)}</span>`
                        }
                      </div>
                      <div class="drawn-info">
                        <div style="font-weight:500">${p.name}</div>
                        ${
                          coffee
                            ? `<div class="mono">${coffee.brand} · ${coffee.variety}</div>`
                            : `<div class="mono" style="color:var(--gold)">czekamy na rejestrację</div>`
                        }
                      </div>
                      <span class="badge badge-out">wylosowany</span>
                    </div>
                  `;
                  })
                  .join('');
              })()}
            </div>
          `
              : ''
          }

          ${
            ho().length
              ? `
            <hr class="divider"/>
            <h3>Dziś nieobecni <span class="mono">(${ho().length})</span></h3>
            <div class="member-list">
              ${ho()
                .map(
                  (p) => `
                <div class="member-row is-ho">
                  <div class="avatar">${initials(p.name)}</div>
                  <span class="name">${p.name}</span>
                  <span class="badge badge-ho">nieobecny</span>
                </div>
              `,
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>

      </div>
    </div>
  `;
}

function renderDrawReel() {
  const players = inGame();
  const long = [...players, ...players, ...players, ...players, ...players];
  return `
    <div class="draw-stage" style="grid-template-columns: 1fr">
      <div class="draw-main">
        <div class="mono" style="margin-bottom: 8px; color: var(--coffee);">● TRWA LOSOWANIE ●</div>
        <div class="draw-headline">kto to będzie...?</div>
        <div class="reel">
          <div class="reel-line"></div>
          <div class="reel-pointer-top"></div>
          <div class="reel-pointer-bottom"></div>
          <div class="reel-track" id="reel-track">
            ${long.map((p) => `<div class="reel-name">${p.name}</div>`).join('')}
          </div>
        </div>
        <div class="draw-hint">drum roll... 🥁</div>
      </div>
    </div>
  `;
}

function renderDrawResult() {
  const winner = memberById(state.draw.winner);
  return `
    <div class="result fade-in" id="result-stage">
      <div class="mono">wynik losowania · runda ${state.data.currentRound}</div>
      <div class="avatar avatar-xl pop" style="background: var(--coffee); color: var(--paper); margin: 16px auto;">
        ${initials(winner.name)}
      </div>
      <div class="result-name">${winner.name}!</div>
      <div class="result-gif" id="gif-slot">
        <span class="mono">ładuję mem...</span>
      </div>
      <div class="result-actions">
        <button class="btn btn-ghost" id="btn-back">← Powrót</button>
      </div>
    </div>
  `;
}

/* ---------- ZAKŁADKA: ZESPÓŁ ---------- */
export function renderZespol() {
  const paid = paidThisRound();
  const active = state.data.team.filter((p) => p.active);
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
      <h2>Zespół (${active.length})</h2>
      <button class="btn btn-primary" id="btn-open-add-member">+ Dodaj uczestnika</button>
    </div>
    ${
      active.length === 0
        ? emptyState('brak uczestników')
        : `
    <table class="data">
      <thead>
        <tr>
          <th></th>
          <th>imię</th>
          <th>ulubiona kawa</th>
          <th>status w rundzie</th>
          <th>dziś w biurze</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${active
          .map(
            (p) => `
          <tr>
            <td style="width:48px"><div class="avatar">${initials(p.name)}</div></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="mono">${p.drink}</span></td>
            <td>
              ${
                paid.includes(p.id)
                  ? '<span class="badge badge-out">wylosowany</span>'
                  : p.today_off
                    ? '<span class="badge badge-ho">nieobecny</span>'
                    : '<span class="badge badge-game">w grze</span>'
              }
            </td>
            <td>
              <div class="presence-toggle">
                <button class="presence-btn ${!p.today_off ? 'active-here' : ''}"
                  data-presence="${p.id}" data-off="false">✓ W biurze</button>
                <button class="presence-btn ${p.today_off ? 'active-off' : ''}"
                  data-presence="${p.id}" data-off="true">✕ Nieobecny</button>
              </div>
            </td>
            <td style="width:70px; text-align:center; white-space:nowrap">
              <button class="btn-edit" data-edit="${p.id}" title="Edytuj uczestnika">✎</button>
              <button class="btn-deactivate" data-deactivate="${p.id}" title="Usuń uczestnika">✕</button>
            </td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
    `
    }
  `;
}

/* ---------- ZAKŁADKA: HISTORIA ---------- */
export function renderHistoria() {
  const totalDraws = state.data.rounds.reduce((s, r) => s + r.draws.length, 0);
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h2>Historia losowań</h2>
    </div>
    ${
      totalDraws === 0
        ? emptyState('brak losowań')
        : `
    ${state.data.rounds
      .map((round) => {
        const completed = round.draws.length === state.data.team.filter((p) => p.active).length;
        return `
        <div class="history-section">
          <div class="label">runda ${round.number} ${completed ? '(zakończona)' : '— bieżąca'} · ${round.draws.length} losowań</div>
          ${[...round.draws]
            .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id))
            .map((d) => {
              const m = memberById(d.memberId);
              const p = purchaseForDraw(d.id);
              const coffee = p ? coffeeById(p.coffeeId) : null;
              const score = p ? avgScore(p.id) : null;
              return `
              <div class="history-row ${completed ? 'is-completed' : ''}">
                <span class="date">${d.date}</span>
                <div class="avatar" style="width:30px; height:30px; font-size:11px">${initials(m.name)}</div>
                <span class="who">${m.name}</span>
                <span class="what">${coffee ? `${coffee.brand} · ${coffee.variety}` : '<em style="color:var(--ink-soft)">brak zakupu</em>'}</span>
                <span class="price">${p ? `${p.price} zł` : '<span class="empty">—</span>'}</span>
                <span class="score">${score !== null ? score.toFixed(1) : '<span class="empty">—</span>'}</span>
              </div>
            `;
            })
            .join('')}
        </div>
      `;
      })
      .join('')}
    `
    }
  `;
}

/* ---------- ZAKŁADKA: STATYSTYKI ---------- */
export function renderStatystyki() {
  const purchases = state.data.purchases;
  if (purchases.length === 0)
    return `<h2 style="margin-bottom:16px">Statystyki</h2>${emptyState('brak danych')}`;

  const total = purchases.reduce((s, p) => s + p.price, 0);
  const avg = total / purchases.length;
  const ratings = state.data.ratings;
  const avgRating = ratings.length
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : null;
  const purchaseYears = [
    ...new Set(
      purchases
        .map((p) => drawForPurchase(p)?.date)
        .filter(Boolean)
        .map((d) => new Date(d).getFullYear()),
    ),
  ];
  const yearLabel =
    purchaseYears.length === 0
      ? '—'
      : purchaseYears.length === 1
        ? `rok ${purchaseYears[0]}`
        : `${Math.min(...purchaseYears)}–${Math.max(...purchaseYears)}`;
  const minP = Math.min(...purchases.map((p) => p.price));
  const maxP = Math.max(...purchases.map((p) => p.price));
  const cupsPerKg = 140;
  const cups = purchases.length * cupsPerKg;
  const priciest = purchases.reduce((a, b) => (b.price > a.price ? b : a));
  const priciestCoffee = coffeeById(priciest.coffeeId);
  const ranked = rankedCoffees();
  const best = ranked[0];

  return `
    <h2 style="margin-bottom:16px">Statystyki</h2>
    <div class="kpi-grid">
      <div class="kpi accent">
        <div class="label">łącznie wydane</div>
        <div class="value">${total} zł</div>
        <div class="sub">${yearLabel}</div>
      </div>
      <div class="kpi">
        <div class="label">zakupów</div>
        <div class="value">${purchases.length}</div>
        <div class="sub">1kg każdy</div>
      </div>
      <div class="kpi">
        <div class="label">średnia / zakup</div>
        <div class="value">${avg.toFixed(0)} zł</div>
        <div class="sub">min ${minP} — max ${maxP}</div>
      </div>
      <div class="kpi">
        <div class="label">średnia ocen</div>
        <div class="value">${avgRating !== null ? avgRating.toFixed(1) : '—'}</div>
        <div class="sub">/ 10</div>
      </div>
      <div class="kpi accent">
        <div class="label">filiżanki</div>
        <div class="value">${cups}</div>
        <div class="sub">~${cupsPerKg} filiżanek / 1kg</div>
      </div>
      <div class="kpi">
        <div class="label">najdroższa</div>
        <div class="value">${priciest.price} zł</div>
        <div class="sub">${priciestCoffee.brand}</div>
      </div>
      ${
        best
          ? `
      <div class="kpi">
        <div class="label">najlepiej oceniona</div>
        <div class="value">${best.score.toFixed(1)}</div>
        <div class="sub">${best.brand}</div>
      </div>
      `
          : ''
      }
      <div class="kpi">
        <div class="label">koszt / filiżanka</div>
        <div class="value">${(total / cups).toFixed(2)} zł</div>
        <div class="sub">średnio</div>
      </div>
    </div>
  `;
}

/* ---------- ZAKŁADKA: RANKING ---------- */
function coffeeMeta(c) {
  if (c.purchases.length === 1) {
    const draw = state.data.rounds
      .flatMap((r) => r.draws)
      .find((d) => d.id === c.purchases[0].drawId);
    const buyer = memberById(draw.memberId);
    return `${buyer.name} · ${c.purchases[0].price} zł · ${c.votes} ${ocenLabel(c.votes)}`;
  }
  const prices = c.purchases.map((p) => p.price);
  const min = Math.min(...prices),
    max = Math.max(...prices);
  const priceText = min === max ? `${min} zł` : `${min}–${max} zł`;
  return `${c.purchases.length}× kupione · ${priceText} · ${c.votes} ${ocenLabel(c.votes)}`;
}

export function renderRanking() {
  const ranked = rankedCoffees();
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  // kawy bez żadnej oceny — nie trafiają jeszcze do rankingu, więc pokazujemy je osobno (wejście przez kartę kawy)
  const unrated = state.data.coffees.filter((c) => coffeeScore(c.id) === null);

  // przycisk rejestracji: aktywny tylko dla wylosowanych w bieżącej rundzie bez zakupu
  const currentRound = state.data.rounds.find((r) => r.number === state.data.currentRound);
  const myDrawInCurrentRound = currentRound?.draws.find((d) => d.memberId === state.whoAmI);
  const canRegister = myDrawInCurrentRound && !purchaseForDraw(myDrawInCurrentRound.id);

  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <h2>Ranking</h2>
      <button class="btn ${canRegister ? 'btn-primary' : 'btn-primary-disabled'}" id="btn-open-register"
        title="${canRegister ? '' : 'Rejestracja zakupu dostępna tylko dla wylosowanych uczestników w bieżącej rundzie'}">
        + Zarejestruj zakup
      </button>
    </div>

    ${
      unrated.length > 0
        ? `
      <div class="card" style="margin-bottom:20px; border-left: 3px solid var(--coffee);">
        <h3 style="margin-bottom:12px">jeszcze nieocenione</h3>
        ${unrated
          .map(
            (c) => `
          <div class="history-row" style="margin-bottom:8px; cursor:pointer" data-card="${c.id}">
            <span class="what">${c.brand} · ${c.variety}</span>
            <span class="mono" style="color:var(--ink-soft)">karta kawy →</span>
          </div>
        `,
          )
          .join('')}
      </div>
    `
        : ''
    }

    ${
      ranked.length === 0
        ? emptyState('brak ocenionych zakupów')
        : `
    <div class="ranking-top">
      ${top3
        .map((c, i) => {
          const needsRate = c.purchases.some((p) => !myRatingForPurchase(p.id));
          return `
          <div class="rank-card ${i === 0 ? 'top1' : ''} ${needsRate ? 'needs-rate' : ''}" data-card="${c.id}">
            <div class="photo">
              <img src="${c.photo}" alt="kawa" style="width:100%;height:100%;object-fit:contain;border-radius:8px"/>
            </div>
            <div class="body">
              <div class="header">
                <span class="rank-num">#${i + 1}</span>
                <span class="score">${c.score.toFixed(1)}</span>
              </div>
              ${needsRate ? `<span class="badge badge-rate" style="display:inline-block; margin-bottom:6px">do oceny</span>` : ''}
              <div class="brand">${c.brand}</div>
              <div class="variety">${c.variety}</div>
              <div class="meta">${coffeeMeta(c)}</div>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>

    ${
      rest.length
        ? `
      <div class="mono" style="margin-bottom:8px">pozostałe</div>
      <div class="rank-list">
        ${rest
          .map((c, idx) => {
            const needsRate = c.purchases.some((p) => !myRatingForPurchase(p.id));
            return `
            <div class="rank-row ${needsRate ? 'needs-rate' : ''}" data-card="${c.id}">
              <span class="num">#${idx + 4}</span>
              <div class="thumb">
                ${c.photo ? `<img src="${c.photo}" style="width:100%;height:100%;object-fit:contain;border-radius:4px"/>` : ''}
              </div>
              <div class="text">
                <div class="b">${c.brand} <span class="v">· ${c.variety}</span> ${needsRate ? `<span class="badge badge-rate">do oceny</span>` : ''}</div>
                <div class="v">${coffeeMeta(c)}</div>
              </div>
              <span class="score" style="font-size:22px; font-weight:600">${c.score.toFixed(1)}</span>
            </div>
          `;
          })
          .join('')}
      </div>
    `
        : ''
    }
    `
    }
  `;
}
