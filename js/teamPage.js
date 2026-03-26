// Script extraído de index.html

let currentSelectedSlot = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!UserManager.isPlayerRegistered()) {
    window.location.href = 'register.html';
  } else {
    const player = UserManager.getPlayerData();
    document.getElementById('welcome-message').textContent = player.nickname;
    document.getElementById('main-title').textContent = `TREINADOR ${player.nickname.toUpperCase()}`;
    document.getElementById('player-details').textContent = `Nível ${player.level} | XP: ${player.experience}`;
    const statsDisplay = document.getElementById('stats-display');
    statsDisplay.innerHTML = `
      <span>🏆 Vitórias: ${player.matchesWon || 0}</span>
      <span>⭐ Nível: ${player.level}</span>
      <span>✨ XP: ${player.experience}</span>
      <span>🎯 Time: ${(player.team || []).length}/6</span>
    `;
    statsDisplay.style.display = 'grid';
    const avatarContainer = document.getElementById('avatar-container');
    const playerAvatar = document.getElementById('player-avatar');
    playerAvatar.src = `assets/players/${player.avatar}`;
    avatarContainer.style.display = 'block';
    const teamSection = document.getElementById('team-section');
    teamSection.style.display = 'block';
    setupPokemonSearch();
    loadTeamDisplay();
    const profileButtons = document.getElementById('profile-buttons');
    profileButtons.style.display = 'flex';
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      window.location.href = 'register.html';
    });
    document.getElementById('go-to-register-btn').style.display = 'none';
    updatePlayButton();
    document.querySelectorAll('.team-slot').forEach(slot => {
      slot.addEventListener('click', selectTeamSlot);
    });
  }
});

function setupPokemonSearch() {
  const searchInput = document.getElementById('pokemon-search');
  const dropdown = document.getElementById('pokemon-search-dropdown');
  function renderDropdown() {
    const team = UserManager.getTeam();
    const isFull = team.length >= 6;
    searchInput.disabled = isFull;
    dropdown.innerHTML = '';
    if (isFull) return;
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
        }
      };
      dropdown.appendChild(item);
    });
  }
  searchInput.addEventListener('input', renderDropdown);
  renderDropdown();
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
      slot.innerHTML = '';
      slot.classList.remove('filled');
      slot.classList.add('empty');
    }
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
    };
  });
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
