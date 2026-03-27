// Script extraído de index.html

let currentSelectedSlot = null;
let draggedSlotIndex = null;
let renderPokemonDropdown = null;
let searchDebounceTimer = null;
let cachedAllPokemon = [];
let importedOpponentData = null;
let hasValidOpponentCode = false;
let ownEncryptedMatchCode = '';
let importCodeDebounceTimer = null;

const SEARCH_DEBOUNCE_MS = 120;
const MAX_DROPDOWN_RESULTS_WHEN_EMPTY = 60;
const MATCH_CODE_SECRET = 'PokeTeamGuess::Exchange::2026';
const MATCH_CODE_PREFIX = 'PTG1';

document.addEventListener('DOMContentLoaded', async () => {
  if (!UserManager.isPlayerRegistered()) {
    window.location.href = 'register.html';
  } else {
    cachedAllPokemon = getAllPokemon();
    const player = UserManager.getPlayerData();
    document.getElementById('welcome-message').textContent = player.nickname;
    document.getElementById('main-title').textContent = `TREINADOR ${player.nickname.toUpperCase()}`;
    document.getElementById('player-details').textContent = `Nível ${player.level} | XP: ${player.experience}`;
    refreshPlayerStats();
    const avatarContainer = document.getElementById('avatar-container');
    const playerAvatar = document.getElementById('player-avatar');
    playerAvatar.src = `assets/players/${player.avatar}`;
    avatarContainer.style.display = 'flex';
    const teamSection = document.getElementById('team-section');
    teamSection.style.display = 'block';
    setupPokemonSearch();
    setupSelectorButtons();
    window.addEventListener('resize', adjustPokemonDropdownHeight);
    requestAnimationFrame(adjustPokemonDropdownHeight);
    loadTeamDisplay();
    setupMatchCodeSection();
    await refreshEncryptedMatchCode();
    const profileButtons = document.getElementById('profile-buttons');
    profileButtons.style.display = 'flex';
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      window.location.href = 'register.html';
    });
    const playBtn = document.getElementById('play-btn');
    const resumeBtn = document.getElementById('resume-match-btn');
    playBtn.addEventListener('click', () => {
      if (playBtn.disabled) return;
      UserManager.clearMatchState();
      const playerName = UserManager.getPlayerData()?.nickname || '';
      const opponentName = importedOpponentData?.nickname || '';
      const params = new URLSearchParams({
        playerName,
        opponentName
      });
      window.location.href = `guess.html?${params.toString()}`;
    });
    resumeBtn.addEventListener('click', () => {
      if (resumeBtn.disabled) return;
      const savedMatch = UserManager.getMatchState();
      const playerName = UserManager.getPlayerData()?.nickname || '';
      const persistedOpponentName = savedMatch?.opponentData?.nickname || UserManager.getOpponentData()?.nickname || '';
      const opponentName = importedOpponentData?.nickname || persistedOpponentName;
      const params = new URLSearchParams({
        playerName,
        opponentName
      });
      window.location.href = `guess.html?${params.toString()}`;
    });
    document.getElementById('go-to-register-btn').style.display = 'none';
    updatePlayButton();
    document.querySelectorAll('.team-slot').forEach(slot => {
      slot.addEventListener('click', selectTeamSlot);
    });
    setupTeamDragAndDrop();
  }
});

async function setupMatchCodeSection() {
  const copyButton = document.getElementById('copy-match-code-btn');
  const opponentCodeInput = document.getElementById('opponent-match-code');
  const storedOpponent = UserManager.getOpponentData();

  if (storedOpponent && Array.isArray(storedOpponent.team) && storedOpponent.team.length === 6) {
    if (storedOpponent.source !== 'ai') {
      importedOpponentData = storedOpponent;
      hasValidOpponentCode = false;
      setMatchCodeStatus('Código do adversário já carregado para a próxima partida.', false);
    } else {
      UserManager.clearOpponentData();
    }
  }

  copyButton?.addEventListener('click', async () => {
    const code = ownEncryptedMatchCode.trim();
    if (!code) {
      setMatchCodeStatus('Monte seu time completo para gerar o código.', true);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setMatchCodeStatus('Código copiado com sucesso.', false);
    } catch (error) {
      setMatchCodeStatus('Não foi possível copiar automaticamente. Copie manualmente.', true);
    }
  });

  opponentCodeInput?.addEventListener('input', () => {
    hasValidOpponentCode = false;
    importedOpponentData = null;
    UserManager.clearOpponentData();
    updatePlayButton();
    clearTimeout(importCodeDebounceTimer);
    importCodeDebounceTimer = setTimeout(() => {
      importOpponentCode(opponentCodeInput.value.trim());
    }, 250);
  });
}

async function refreshEncryptedMatchCode() {
  const team = UserManager.getTeam();
  const player = UserManager.getPlayerData();
  const copyButton = document.getElementById('copy-match-code-btn');

  if (!player || team.length !== 6) {
    ownEncryptedMatchCode = '';
    if (copyButton) {
      copyButton.disabled = true;
    }
    return;
  }

  try {
    ownEncryptedMatchCode = await encryptMatchCode({
      nickname: player.nickname,
      teamIds: team.map(pokemon => Number(pokemon.id))
    });
    if (copyButton) {
      copyButton.disabled = false;
    }
  } catch (error) {
    ownEncryptedMatchCode = '';
    if (copyButton) {
      copyButton.disabled = true;
    }
    setMatchCodeStatus('Falha ao gerar o código criptografado.', true);
  }
}

async function importOpponentCode(code) {
  if (!code) {
    hasValidOpponentCode = false;
    importedOpponentData = null;
    UserManager.clearOpponentData();
    setMatchCodeStatus('Cole o código do adversário para importar automaticamente.', false);
    updatePlayButton();
    return;
  }

  try {
    const payload = await decryptMatchCode(code);
    const opponentTeam = buildPokemonTeamFromIds(payload.teamIds || []);
    if (!payload.nickname || opponentTeam.length !== 6) {
      throw new Error('Código inválido');
    }

    importedOpponentData = UserManager.setOpponentData({
      nickname: payload.nickname,
      team: opponentTeam,
      source: 'code'
    });
    hasValidOpponentCode = true;

    setMatchCodeStatus('Código do adversário importado automaticamente com sucesso.', false);
    updatePlayButton();
  } catch (error) {
    hasValidOpponentCode = false;
    importedOpponentData = null;
    UserManager.clearOpponentData();
    setMatchCodeStatus('Código inválido ou incompleto.', true);
    updatePlayButton();
  }
}

function setMatchCodeStatus(message, isError) {
  const status = document.getElementById('match-code-status');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#ff8f8f' : '#90EE90';
}

function buildPokemonTeamFromIds(teamIds) {
  const allPokemon = cachedAllPokemon.length ? cachedAllPokemon : getAllPokemon();
  return teamIds
    .map(id => allPokemon.find(pokemon => String(pokemon.id) === String(id)))
    .filter(Boolean);
}

async function encryptMatchCode(payload) {
  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveMatchCodeKey(salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encodedPayload);
  return `${MATCH_CODE_PREFIX}.${toBase64Url(salt)}.${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}

async function decryptMatchCode(code) {
  const parts = code.split('.');
  if (parts.length !== 4 || parts[0] !== MATCH_CODE_PREFIX) {
    throw new Error('Formato inválido');
  }

  const salt = fromBase64Url(parts[1]);
  const iv = fromBase64Url(parts[2]);
  const encrypted = fromBase64Url(parts[3]);
  const key = await deriveMatchCodeKey(salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

async function deriveMatchCodeKey(salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(MATCH_CODE_SECRET),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 120000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64Url(bytes) {
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

function setupSelectorButtons() {
  document.getElementById('random-team-btn').addEventListener('click', () => {
    const all = cachedAllPokemon.length ? cachedAllPokemon : getAllPokemon();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const randomTeam = shuffled.slice(0, 6);
    UserManager.saveTeam(randomTeam);
    loadTeamDisplay();
    updatePlayButton();
    refreshPlayerStats();
    refreshEncryptedMatchCode();
    if (renderPokemonDropdown) renderPokemonDropdown();
  });

  document.getElementById('clear-team-btn').addEventListener('click', () => {
    UserManager.saveTeam([]);
    loadTeamDisplay();
    updatePlayButton();
    refreshPlayerStats();
    refreshEncryptedMatchCode();
    if (renderPokemonDropdown) renderPokemonDropdown();
  });
}

function setupPokemonSearch() {
  const searchInput = document.getElementById('pokemon-search');
  const dropdown = document.getElementById('pokemon-search-dropdown');
  const allPokemon = cachedAllPokemon.length ? cachedAllPokemon : getAllPokemon();

  function renderDropdown() {
    const team = UserManager.getTeam();
    const isFull = team.length >= 6;
    searchInput.disabled = isFull;
    dropdown.innerHTML = '';
    if (isFull) {
      adjustPokemonDropdownHeight();
      return;
    }
    const searchTerm = searchInput.value.trim().toLowerCase();
    let filtered = allPokemon.filter(p => p.name.toLowerCase().includes(searchTerm));
    if (!searchTerm) {
      filtered = filtered.slice(0, MAX_DROPDOWN_RESULTS_WHEN_EMPTY);
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(pokemon => {
      if (team.some(t => t && t.id === pokemon.id)) return;

      const item = document.createElement('div');
      item.className = 'pokemon-search-item';
      item.innerHTML = `<img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy" decoding="async"><span class="name">${pokemon.name}</span>`;
      item.onclick = () => {
        const team = UserManager.getTeam();
        if (team.length < 6) {
          team.push(pokemon);
          UserManager.saveTeam(team);
          searchInput.value = '';
          renderDropdown();
          loadTeamDisplay();
          updatePlayButton();
          refreshPlayerStats();
          refreshEncryptedMatchCode();
        }
      };
      fragment.appendChild(item);
    });

    dropdown.appendChild(fragment);

    if (!searchTerm && filtered.length >= MAX_DROPDOWN_RESULTS_WHEN_EMPTY) {
      const hint = document.createElement('div');
      hint.className = 'pokemon-search-item';
      hint.textContent = `Mostrando ${MAX_DROPDOWN_RESULTS_WHEN_EMPTY} resultados. Digite para filtrar.`;
      hint.style.cursor = 'default';
      dropdown.appendChild(hint);
    }

    adjustPokemonDropdownHeight();
  }

  function scheduleRenderDropdown() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(renderDropdown, SEARCH_DEBOUNCE_MS);
  }

  renderPokemonDropdown = renderDropdown;
  searchInput.addEventListener('input', scheduleRenderDropdown);
  renderDropdown();
}

function refreshPlayerStats() {
  const stats = UserManager.getStats();
  const statsDisplay = document.getElementById('stats-display');

  if (!stats) {
    statsDisplay.style.display = 'none';
    return;
  }

  statsDisplay.innerHTML = `
    <span>🏆 Vitórias: ${stats.matchesWon}</span>
    <span>💥 Derrotas: ${stats.matchesLost}</span>
    <span>🎮 Partidas: ${stats.matchesPlayed}</span>
    <span>📊 Taxa de Vitória: ${stats.winRate}%</span>
    <span>⭐ Nível: ${stats.level}</span>
    <span>✨ XP: ${stats.experience}</span>
    <span>🎯 Time: ${stats.teamSize}/6</span>
  `;
  statsDisplay.style.display = 'grid';
}

function adjustPokemonDropdownHeight() {
  const selector = document.getElementById('pokemon-selector');
  const searchInput = document.getElementById('pokemon-search');
  const buttons = selector?.querySelector('.selector-buttons');
  const dropdown = document.getElementById('pokemon-search-dropdown');

  if (!selector || !dropdown) {
    return;
  }

  const selectorHeight = selector.clientHeight;
  if (selectorHeight <= 0) {
    return;
  }

  const selectorStyles = window.getComputedStyle(selector);
  const inputStyles = searchInput ? window.getComputedStyle(searchInput) : null;
  const buttonsStyles = buttons ? window.getComputedStyle(buttons) : null;
  const dropdownStyles = window.getComputedStyle(dropdown);

  let availableHeight = selectorHeight;
  availableHeight -= (parseFloat(selectorStyles.paddingTop) || 0) + (parseFloat(selectorStyles.paddingBottom) || 0);

  if (searchInput) {
    availableHeight -= searchInput.offsetHeight;
    availableHeight -= parseFloat(inputStyles?.marginBottom || '0');
  }

  if (buttons) {
    availableHeight -= buttons.offsetHeight;
    availableHeight -= parseFloat(buttonsStyles?.marginTop || '0');
    availableHeight -= parseFloat(buttonsStyles?.marginBottom || '0');
  }

  availableHeight -= parseFloat(dropdownStyles.marginTop || '0');

  const finalHeight = Math.max(availableHeight, 120);
  dropdown.style.height = `${finalHeight}px`;
}

function selectTeamSlot(e) {
  if (e.target.classList.contains('team-slot')) {
    currentSelectedSlot = Number.parseInt(e.target.dataset.index);
    const selector = document.getElementById('pokemon-selector');
    selector.style.display = 'block';
  }
}

function loadTeamDisplay() {
  const team = UserManager.getTeam();
  const teamGrid = document.getElementById('team-grid');
  const slots = teamGrid.querySelectorAll('.team-slot');
  slots.forEach((slot, index) => {
    if (team[index]) {
      const pokemon = team[index];
      slot.setAttribute('draggable', 'true');
      slot.innerHTML = `
        <div class="team-slot-pokemon">
          <img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy" decoding="async" onerror="this.src='${pokemon.sprite}'">
          <div class="name">${pokemon.name}</div>
        </div>
        <button class="remove-pokemon-btn" title="Remover" data-index="${index}">-</button>
      `;
      slot.classList.add('filled');
      slot.classList.remove('empty');
    } else {
      slot.setAttribute('draggable', 'false');
      slot.innerHTML = '';
      slot.classList.remove('filled');
      slot.classList.add('empty');
    }
    slot.classList.remove('dragging', 'drag-over');
  });
  document.querySelectorAll('.remove-pokemon-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = Number.parseInt(btn.dataset.index);
      const team = UserManager.getTeam();
      team.splice(idx, 1);
      UserManager.saveTeam(team);
      loadTeamDisplay();
      updatePlayButton();
      refreshPlayerStats();
      refreshEncryptedMatchCode();
      if (renderPokemonDropdown) {
        renderPokemonDropdown();
      }
    };
  });
}

function setupTeamDragAndDrop() {
  const slots = document.querySelectorAll('.team-slot');

  slots.forEach(slot => {
    slot.addEventListener('dragstart', handleSlotDragStart);
    slot.addEventListener('dragover', handleSlotDragOver);
    slot.addEventListener('dragleave', handleSlotDragLeave);
    slot.addEventListener('drop', handleSlotDrop);
    slot.addEventListener('dragend', handleSlotDragEnd);
  });
}

function handleSlotDragStart(event) {
  const slot = event.currentTarget;
  if (!slot.classList.contains('filled')) {
    event.preventDefault();
    return;
  }

  draggedSlotIndex = Number.parseInt(slot.dataset.index, 10);
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', String(draggedSlotIndex));
  slot.classList.add('dragging');
}

function handleSlotDragOver(event) {
  if (draggedSlotIndex === null) {
    return;
  }

  event.preventDefault();
  const slot = event.currentTarget;
  const targetIndex = Number.parseInt(slot.dataset.index, 10);

  slot.classList.toggle('drag-over', targetIndex !== draggedSlotIndex);
}

function handleSlotDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleSlotDrop(event) {
  event.preventDefault();

  const targetSlot = event.currentTarget;
  const targetIndex = Number.parseInt(targetSlot.dataset.index, 10);

  targetSlot.classList.remove('drag-over');

  if (draggedSlotIndex === null || draggedSlotIndex === targetIndex) {
    return;
  }

  reorderTeam(draggedSlotIndex, targetIndex);
}

function handleSlotDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.team-slot.drag-over').forEach(slot => slot.classList.remove('drag-over'));
  draggedSlotIndex = null;
}

function reorderTeam(fromIndex, toIndex) {
  const team = UserManager.getTeam();

  if (!team[fromIndex]) {
    return;
  }

  const [movedPokemon] = team.splice(fromIndex, 1);
  team.splice(toIndex, 0, movedPokemon);

  UserManager.saveTeam(team);
  loadTeamDisplay();
  updatePlayButton();
  refreshPlayerStats();
  refreshEncryptedMatchCode();
  if (renderPokemonDropdown) {
    renderPokemonDropdown();
  }
}

function updatePlayButton() {
  const playBtn = document.getElementById('play-btn');
  const resumeBtn = document.getElementById('resume-match-btn');
  const opponentCodeInput = document.getElementById('opponent-match-code');
  const team = UserManager.getTeam();
  const playerCode = UserManager.getPlayerCode();
  const canResume = UserManager.hasActiveMatchForPlayer(playerCode);
  const typedCode = opponentCodeInput?.value?.trim() || '';
  const hasValidTypedCode = Boolean(typedCode)
    && hasValidOpponentCode
    && importedOpponentData
    && Array.isArray(importedOpponentData.team)
    && importedOpponentData.team.length === 6;
  const canPlay = team.length === 6 && hasValidTypedCode;

  const hasOpponentName = Boolean(importedOpponentData?.nickname)
    && Array.isArray(importedOpponentData?.team)
    && importedOpponentData.team.length === 6;

  if (hasOpponentName) {
    playBtn.textContent = `► JOGAR CONTRA ${importedOpponentData.nickname.toUpperCase()} ◄`;
  } else {
    playBtn.textContent = '► J O G A R ◄';
  }

  if (team.length === 6) {
    playBtn.style.display = 'block';
    playBtn.disabled = !canPlay;
  } else {
    playBtn.style.display = 'block';
    playBtn.disabled = true;
  }

  if (resumeBtn) {
    resumeBtn.style.display = 'block';
    resumeBtn.disabled = !canResume;
  }
}
