// Script extraído de index.html

let currentSelectedSlot = null;
let draggedSlotIndex = null;
let renderPokemonDropdown = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!UserManager.isPlayerRegistered()) {
    window.location.href = 'register.html';
  } else {
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
    const profileButtons = document.getElementById('profile-buttons');
    profileButtons.style.display = 'flex';
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      window.location.href = 'register.html';
    });
    document.getElementById('play-btn').addEventListener('click', () => {
      if (!document.getElementById('play-btn').disabled) {
        window.location.href = 'guess.html';
      }
    });
    document.getElementById('go-to-register-btn').style.display = 'none';
    updatePlayButton();
    document.querySelectorAll('.team-slot').forEach(slot => {
      slot.addEventListener('click', selectTeamSlot);
    });
    setupTeamDragAndDrop();
  }
});

function setupSelectorButtons() {
  document.getElementById('random-team-btn').addEventListener('click', () => {
    const all = getAllPokemon();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const randomTeam = shuffled.slice(0, 6);
    UserManager.saveTeam(randomTeam);
    loadTeamDisplay();
    updatePlayButton();
    refreshPlayerStats();
    if (renderPokemonDropdown) renderPokemonDropdown();
  });

  document.getElementById('clear-team-btn').addEventListener('click', () => {
    UserManager.saveTeam([]);
    loadTeamDisplay();
    updatePlayButton();
    refreshPlayerStats();
    if (renderPokemonDropdown) renderPokemonDropdown();
  });
}

function setupPokemonSearch() {
  const searchInput = document.getElementById('pokemon-search');
  const dropdown = document.getElementById('pokemon-search-dropdown');
  function renderDropdown() {
    const team = UserManager.getTeam();
    const isFull = team.length >= 6;
    searchInput.disabled = isFull;
    dropdown.innerHTML = '';
    if (isFull) {
      adjustPokemonDropdownHeight();
      return;
    }
    const allPokemon = getAllPokemon();
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filtered = allPokemon.filter(p => p.name.toLowerCase().includes(searchTerm));
    filtered.forEach(pokemon => {
      if (team.some(t => t && t.id === pokemon.id)) return;
      const item = document.createElement('div');
      item.className = 'pokemon-search-item';
      item.innerHTML = `<img src="${pokemon.sprite}" alt="${pokemon.name}"><span class="name">${pokemon.name}</span>`;
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
        }
      };
      dropdown.appendChild(item);
    });
    adjustPokemonDropdownHeight();
  }
  renderPokemonDropdown = renderDropdown;
  searchInput.addEventListener('input', renderDropdown);
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
          <img src="${pokemon.sprite}" alt="${pokemon.name}" onerror="this.src='${pokemon.sprite}'">
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
  if (renderPokemonDropdown) {
    renderPokemonDropdown();
  }
}

function updatePlayButton() {
  const playBtn = document.getElementById('play-btn');
  const team = UserManager.getTeam();
  if (team.length === 6) {
    playBtn.style.display = 'block';
    playBtn.disabled = false;
  } else {
    playBtn.style.display = 'block';
    playBtn.disabled = true;
  }
}
