// Funções para manipular o objeto Opponent no storage
import { saveToStorage, getFromStorage, removeFromStorage } from './storageManager.js';

const OPPONENT_KEY = 'poketeamguess_opponent_data';

export function saveOpponent(nickname) {
  // Salva apenas o nome do oponente
  return saveToStorage(OPPONENT_KEY, { nickname });
}

export function getOpponent() {
  const data = getFromStorage(OPPONENT_KEY);
  return data && typeof data.nickname === 'string' ? { nickname: data.nickname } : null;
}

export function removeOpponent() {
  return removeFromStorage(OPPONENT_KEY);
}
