import { state } from './state.js?v=20260728';

/* ---------- POMOCNICZE FUNKCJE ---------- */
export const $ = (sel) => document.querySelector(sel);
export const byId = (list, id) => list.find(x => x.id === id);
export const memberById = (id) => byId(state.data.team, id);
export const coffeeById = (id) => byId(state.data.coffees, id);
export const initials = (name) => name.slice(0, 2).toUpperCase();
export const uid = () => Math.random().toString(36).slice(2, 10);
export const buyVerb = (member) => member?.gender === 'M' ? 'kupił' : 'kupiła';
export const emptyState = (text) => `<div class="mono" style="padding:40px;text-align:center">${text}</div>`;

export function ocenLabel(n) {
  if (n === 1) return 'ocena';
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'oceny';
  return 'ocen';
}

export function daysAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'dziś';
  if (diff === 1) return '1 dzień temu';
  return `${diff} dni temu`;
}

export function paidThisRound() {
  const round = state.data.rounds.find(r => r.number === state.data.currentRound);
  if (!round) return [];
  return round.draws.map(d => d.memberId);
}

export function inGame() {
  const paid = paidThisRound();
  return state.data.team.filter(p => p.active && !p.today_off && !paid.includes(p.id));
}

export function out() {
  const paid = paidThisRound();
  return state.data.team.filter(p => paid.includes(p.id));
}

export function ho() {
  return state.data.team.filter(p => p.active && p.today_off);
}

export function avgScore(purchaseId) {
  const rs = state.data.ratings.filter(r => r.purchaseId === purchaseId);
  if (rs.length === 0) return null;
  return rs.reduce((s, r) => s + r.score, 0) / rs.length;
}

export function purchasesForCoffee(coffeeId) {
  return state.data.purchases.filter(p => p.coffeeId === coffeeId);
}

export function ratingsForCoffee(coffeeId) {
  const ids = purchasesForCoffee(coffeeId).map(p => p.id);
  return state.data.ratings.filter(r => ids.includes(r.purchaseId));
}

export function coffeeScore(coffeeId) {
  const rs = ratingsForCoffee(coffeeId);
  if (rs.length === 0) return null;
  return rs.reduce((s, r) => s + r.score, 0) / rs.length;
}

export function rankedCoffees() {
  return state.data.coffees
    .map(c => ({
      ...c,
      score: coffeeScore(c.id),
      votes: ratingsForCoffee(c.id).length,
      purchases: purchasesForCoffee(c.id),
    }))
    .filter(c => c.score !== null)
    .sort((a, b) => b.score - a.score);
}

export function purchaseForDraw(drawId) {
  return state.data.purchases.find(p => p.drawId === drawId);
}

export function drawForPurchase(purchase) {
  return state.data.rounds.flatMap(r => r.draws).find(d => d.id === purchase.drawId);
}

export function myRatingForPurchase(purchaseId) {
  return state.data.ratings.find(r => r.purchaseId === purchaseId && r.memberId === state.whoAmI);
}
