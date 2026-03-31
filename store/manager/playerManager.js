// Funções para manipular o objeto Player no storage
import Player from '../objects/Player.js';
import { saveToStorage, getFromStorage, removeFromStorage } from './storageManager.js';

const PLAYER_KEY = 'poketeamguess_player';

export function savePlayer(playerObj) {
  const player = playerObj instanceof Player ? playerObj : new Player(playerObj);
  return saveToStorage(PLAYER_KEY, player);
}

export function getPlayer() {
  const data = getFromStorage(PLAYER_KEY);
  return data ? new Player(data) : null;
}

export function removePlayer() {
  return removeFromStorage(PLAYER_KEY);
}
