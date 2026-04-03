// SectionManager: garante que todas as páginas só carregam se o player estiver cadastrado

import { getPlayer } from '../store/manager/playerManager.js';

export function requirePlayerProfile() {
  const player = getPlayer();
  if (!player) {
    window.location.href = 'register.html';
    return false;
  }
  return true;
}
