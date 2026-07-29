import { sb } from './supabase.js?v=202607291634';

/* ---------- STAN APLIKACJI ---------- */
export const state = {
  data: null,
  tab: 'losowanie',
  whoAmI: localStorage.getItem('akcja-kawowa-who') || null,
  draw: { stage: 'idle', winner: null, gifUrl: null },
  modal: null, // 'purchase' | 'rating' | null
  modalData: {},
  saving: false,
};

/* ---------- ŁADOWANIE DANYCH ---------- */
export async function loadData() {
  const [team, rounds, draws, coffees, purchases, ratings] = await Promise.all([
    sb.get('team', 'order=name'),
    sb.get('rounds', 'order=number.desc'),
    sb.get('draws', 'order=draw_date.desc'),
    sb.get('coffees', 'order=id'),
    sb.get('purchases', 'order=id'),
    sb.get('ratings', 'order=id'),
  ]);

  // Jeśli brak rund w bazie — utwórz rundę 1 jako bieżącą
  let activeRounds = rounds;
  if (activeRounds.length === 0) {
    const created = await sb.post('rounds', { number: 1, is_current: true });
    activeRounds = Array.isArray(created) ? created : [created];
  }

  const currentRound = activeRounds.find(r => r.is_current);

  // normalizujemy do struktury podobnej do data.json
  state.data = {
    team,
    currentRound: currentRound?.number ?? 1,
    rounds: activeRounds.map(r => ({
      number: r.number,
      draws: draws
        .filter(d => d.round_number === r.number)
        .map(d => ({ id: d.id, memberId: d.member_id, date: d.draw_date })),
    })),
    coffees: coffees.map(c => ({
      id: c.id, brand: c.brand, variety: c.variety, photo: c.photo_url,
    })),
    purchases: purchases.map(p => ({
      id: p.id, drawId: p.draw_id, coffeeId: p.coffee_id, price: p.price,
    })),
    ratings: ratings.map(r => ({
      purchaseId: r.purchase_id, memberId: r.member_id, score: r.score, comment: r.comment ?? null,
    })),
  };
}
