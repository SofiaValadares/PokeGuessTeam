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

// Para usar em cada página:
// import { requirePlayerProfile } from '../config/sectionManager.js';
// if (!requirePlayerProfile()) return;
