// Manager para persistir e recuperar o histórico da partida no localStorage
import MatchHistory from '../objects/MatchHistory.js';

const STORAGE_KEY = 'poketeamguess_match_history';

export function saveMatchHistory(history) {
  if (!(history instanceof MatchHistory)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.toJSON()));
}

export function getMatchHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return new MatchHistory();
  try {
    const parsed = JSON.parse(raw);
    return MatchHistory.fromJSON(parsed);
  } catch {
    return new MatchHistory();
  }
}

export function clearMatchHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
