import { requirePlayerProfile } from '../config/sectionManager.js';
import { getPlayer, savePlayer } from '../store/manager/playerManager.js';
// import já existente no topo, não duplicar
import { getAllPokemon } from './pokemonData.js';
import { getOpponent } from '../store/manager/opponentManager.js';

let currentSelectedSlot = null;
let draggedSlotIndex = null;
let renderPokemonDropdown = null;
let searchDebounceTimer = null;
let cachedAllPokemon = [];

const SEARCH_DEBOUNCE_MS = 120;
const MAX_DROPDOWN_RESULTS_WHEN_EMPTY = 60;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requirePlayerProfile()) return;
  const player = getPlayer();
  cachedAllPokemon = getAllPokemon();
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
  const profileButtons = document.getElementById('profile-buttons');
  if (profileButtons) profileButtons.style.display = 'flex';
  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) editProfileBtn.addEventListener('click', () => {
    globalThis.location.href = 'register.html';
  });
  const playBtn = document.getElementById('play-btn');
  const resumeBtn = document.getElementById('resume-match-btn');
  if (playBtn) playBtn.addEventListener('click', () => {
    if (playBtn.disabled) return;
    const playerName = getPlayer()?.nickname || '';
    const opponentName = document.getElementById('opponent-name-input')?.value?.trim() || '';
    const params = new URLSearchParams({
      playerName,
      opponentName
    });
    globalThis.location.href = `guess.html?${params.toString()}`;
  });
  // Atualiza o botão ao digitar o nome do adversário
  const opponentNameInput = document.getElementById('opponent-name-input');
  if (opponentNameInput) opponentNameInput.addEventListener('input', updatePlayButton);
  if (resumeBtn) resumeBtn.addEventListener('click', () => {
    if (resumeBtn.disabled) return;
    const savedMatch = getMatchState();
    const playerName = getPlayer()?.nickname || '';
    const persistedOpponentName = savedMatch?.opponentData?.nickname || getOpponent()?.nickname || '';
    const opponentName = importedOpponentData?.nickname || persistedOpponentName;
    const params = new URLSearchParams({
      playerName,
      opponentName
    });
    globalThis.location.href = `guess.html?${params.toString()}`;
  });
  const goToRegisterBtn = document.getElementById('go-to-register-btn');
  if (goToRegisterBtn) goToRegisterBtn.style.display = 'none';
  updatePlayButton();
  document.querySelectorAll('.team-slot').forEach(slot => {
    slot.addEventListener('click', selectTeamSlot);
  });
  setupTeamDragAndDrop();
});







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



function toBase64Url(bytes) {
  const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, char => char.codePointAt(0));
}

function setupSelectorButtons() {
  document.getElementById('random-team-btn').addEventListener('click', () => {
    const all = cachedAllPokemon.length ? cachedAllPokemon : getAllPokemon();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const randomTeam = shuffled.slice(0, 6);
    saveTeam(randomTeam);
    loadTeamDisplay();
    updatePlayButton();
    refreshPlayerStats();

    if (renderPokemonDropdown) renderPokemonDropdown();
  });

  document.getElementById('clear-team-btn').addEventListener('click', () => {
    saveTeam([]);
    loadTeamDisplay();
    updatePlayButton();
    refreshPlayerStats();

    if (renderPokemonDropdown) renderPokemonDropdown();
  });
}

function setupPokemonSearch() {
  const searchInput = document.getElementById('pokemon-search');
  const dropdown = document.getElementById('pokemon-search-dropdown');
  const allPokemon = cachedAllPokemon.length ? cachedAllPokemon : getAllPokemon();

  function renderDropdown() {
    const team = getTeam();
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
        const team = getTeam();
        if (team.length < 6) {
          team.push(pokemon);
          saveTeam(team);
          searchInput.value = '';
          renderDropdown();
          loadTeamDisplay();
          updatePlayButton();
          refreshPlayerStats();

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
  const stats = getStats();
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

  const selectorStyles = globalThis.getComputedStyle(selector);
  const inputStyles = searchInput ? globalThis.getComputedStyle(searchInput) : null;
  const buttonsStyles = buttons ? globalThis.getComputedStyle(buttons) : null;
  const dropdownStyles = globalThis.getComputedStyle(dropdown);

  let availableHeight = selectorHeight;
  availableHeight -= (Number.parseFloat(selectorStyles.paddingTop) || 0) + (Number.parseFloat(selectorStyles.paddingBottom) || 0);

  if (searchInput) {
    availableHeight -= searchInput.offsetHeight;
    availableHeight -= Number.parseFloat(inputStyles?.marginBottom || '0');
  }

  if (buttons) {
    availableHeight -= buttons.offsetHeight;
    availableHeight -= Number.parseFloat(buttonsStyles?.marginTop || '0');
    availableHeight -= Number.parseFloat(buttonsStyles?.marginBottom || '0');
  }

  availableHeight -= Number.parseFloat(dropdownStyles.marginTop || '0');

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
  const team = getTeam();
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
      const team = getTeam();
      team.splice(idx, 1);
      saveTeam(team);
      loadTeamDisplay();
      updatePlayButton();
      refreshPlayerStats();

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
  const team = getTeam();

  if (!team[fromIndex]) {
    return;
  }

  const [movedPokemon] = team.splice(fromIndex, 1);
  team.splice(toIndex, 0, movedPokemon);

  saveTeam(team);
  loadTeamDisplay();
  updatePlayButton();
  refreshPlayerStats();

  if (renderPokemonDropdown) {
    renderPokemonDropdown();
  }
}

function updatePlayButton() {
  const playBtn = document.getElementById('play-btn');
  const resumeBtn = document.getElementById('resume-match-btn');
  const opponentNameInput = document.getElementById('opponent-name-input');
  const team = getTeam();
  const opponentName = opponentNameInput?.value?.trim() || '';
  const canPlay = team.length === 6 && opponentName.length > 0;

  playBtn.textContent = '► J O G A R ◄';
  playBtn.style.display = 'block';
  playBtn.classList.remove('is-hidden');
  if (team.length === 6) {
    playBtn.disabled = !canPlay;
  } else {
    playBtn.disabled = true;
  }

  if (resumeBtn) {
    const hasMatch = !!getMatchState();
    resumeBtn.style.display = 'block';
    resumeBtn.disabled = !hasMatch;
  }
}

// Funções auxiliares para manipular o time e stats do player


function getTeam() {
  const player = getPlayer();
  return player && Array.isArray(player.team) ? player.team : [];
}

function saveTeam(team) {
  const player = getPlayer();
  if (!player) return false;
  player.team = team;
  savePlayer(player);
  return true;
}

function getStats() {
  const player = getPlayer();
  if (!player) return null;
  return {
    matchesWon: player.matchesWon || 0,
    matchesLost: player.matchesLost || 0,
    matchesPlayed: player.matchesPlayed || 0,
    winRate: player.matchesPlayed ? Math.round(100 * (player.matchesWon || 0) / player.matchesPlayed) : 0,
    level: player.level || 1,
    experience: player.experience || 0,
    teamSize: Array.isArray(player.team) ? player.team.length : 0
  };
}
