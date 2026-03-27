const TYPE_OPTIONS = ['Qualquer', 'Grass', 'Poison', 'Fire', 'Flying', 'Water', 'Ground', 'Fighting', 'Steel', 'Psychic', 'Dark', 'Ghost', 'Fairy'];
const TYPE_COLORS = {
  Grass: '#78C850',
  Poison: '#A040A0',
  Fire: '#F08030',
  Flying: '#A890F0',
  Water: '#6890F0',
  Ground: '#E0C068',
  Fighting: '#C03028',
  Steel: '#B8B8D0',
  Psychic: '#F85888',
  Dark: '#705848',
  Ghost: '#705898',
  Fairy: '#EE99AC'
};
const COLOR_OPTIONS = ['Qualquer', 'green', 'orange', 'blue', 'purple', 'yellow', 'gray', 'brown', 'pink', 'red', 'black', 'white'];
const COLOR_LABELS = {
  green: 'Verde',
  orange: 'Laranja',
  blue: 'Azul',
  purple: 'Roxo',
  yellow: 'Amarelo',
  gray: 'Cinza',
  brown: 'Marrom',
  pink: 'Rosa',
  red: 'Vermelho',
  black: 'Preto',
  white: 'Branco',
  '#78C850': 'Verde',
  '#F08030': 'Laranja',
  '#78C8F0': 'Azul',
  '#A040A0': 'Roxo',
  '#F8D030': 'Amarelo',
  '#A8A8A8': 'Cinza',
  '#A07850': 'Marrom',
  '#EE99AC': 'Rosa',
  '#C03028': 'Vermelho',
  '#3a3a3a': 'Preto',
  '#f0f0f0': 'Branco',
  '#B8B8D0': 'Cinza',
  '#A8A878': 'Cinza',
  '#B8A038': 'Marrom',
  '#705848': 'Marrom',
  '#705898': 'Roxo',
  '#E0C068': 'Marrom',
  '#A8B820': 'Verde'
};

const LEGACY_HEX_TO_COLOR_NAME = {
  '#78C850': 'green',
  '#F08030': 'orange',
  '#78C8F0': 'blue',
  '#A040A0': 'purple',
  '#F8D030': 'yellow',
  '#A8A8A8': 'gray',
  '#A07850': 'brown',
  '#EE99AC': 'pink',
  '#C03028': 'red',
  '#3a3a3a': 'black',
  '#f0f0f0': 'white',
  '#B8B8D0': 'gray',
  '#A8A878': 'gray',
  '#B8A038': 'brown',
  '#705848': 'brown',
  '#705898': 'purple',
  '#E0C068': 'brown',
  '#A8B820': 'green'
};

const STORAGE_KEY_GUESS = 'poketeamguess_match_notes';
const NOTES_PERSIST_DEBOUNCE_MS = 180;

const state = {
  selectedEnemySlot: null,
  matchResult: null,
  allPokemon: [],
  pokemonById: new Map(),
  persistTimerId: null,
  enemySlots: Array.from({ length: 6 }, () => ({
    type1: 'Qualquer',
    type2: 'Qualquer',
    generation: 'Qualquer',
    color: 'Qualquer',
    weightMin: '',
    weightMax: '',
    heightMin: '',
    heightMax: '',
    selectedGuessId: '',
    confirmedGuessId: ''
  })),
  selfSlots: Array.from({ length: 6 }, () => ({
    guessedInfoKeys: [],
    pokemonGuessed: false,
    weightGuessMin: '',
    weightGuessMax: '',
    heightGuessMin: '',
    heightGuessMax: ''
  })),
  freeNotes: ''
};

document.addEventListener('DOMContentLoaded', () => {
  const player = UserManager.getPlayerData();
  if (!player) {
    window.location.href = 'register.html';
    return;
  }

  if (!UserManager.isTeamComplete()) {
    window.location.href = 'index.html';
    return;
  }

  state.allPokemon = getAllPokemon();
  state.pokemonById = new Map(state.allPokemon.map(pokemon => [String(pokemon.id), pokemon]));
  hydrateSavedNotes();
  setupHeader(player);
  setupBanner(player);

  renderEnemyTeamCards();
  renderSelfTeam(player.team || []);
  setupGuessActions();
  setupNotes();
  setupFinishMatch();
  evaluateMatchState();
});

function setupHeader(player) {
  document.getElementById('battle-player-name').textContent = `TREINADOR ${player.nickname.toUpperCase()}`;
}

function setupBanner(player) {
  const playerAvatar = document.getElementById('player-battle-avatar');
  const opponentAvatar = document.getElementById('opponent-battle-avatar');
  const enemyAvatar = player.avatar === 'Spr_FRLG_Leaf.png' ? 'Spr_FRLG_Red.png' : 'Spr_FRLG_Leaf.png';
  const backAvatarMap = {
    'Spr_FRLG_Leaf.png': 'E_Leaf_Back.png',
    'Spr_FRLG_Red.png': 'E_Red_Back.png'
  };

  playerAvatar.src = `assets/players/${backAvatarMap[player.avatar] || player.avatar}`;
  playerAvatar.decoding = 'async';
  playerAvatar.fetchPriority = 'high';
  opponentAvatar.src = `assets/players/${enemyAvatar}`;
  opponentAvatar.decoding = 'async';
  opponentAvatar.fetchPriority = 'high';
}

function renderEnemyTeamCards() {
  const container = document.getElementById('enemy-team-grid');
  container.innerHTML = '';

  for (let index = 0; index < 6; index += 1) {
    const slot = state.enemySlots[index];
    const card = document.createElement('div');
    card.className = `enemy-slot-card ${state.selectedEnemySlot === index ? 'selected' : ''}`;

    const guessedPokemon = getPokemonById(slot.confirmedGuessId || slot.selectedGuessId);
    const squareLabel = guessedPokemon
      ? `<img class="enemy-square-sprite" src="${guessedPokemon.sprite}" alt="${guessedPokemon.name}" loading="lazy" decoding="async">`
      : 'CHUTAR';

    card.innerHTML = `
      <div class="card-left-col">
        <button class="enemy-square-btn" data-slot-index="${index}" title="Selecionar slot para chutar">${squareLabel}</button>
      </div>
      <div class="card-right-col">
        <div class="card-row row-types">
          <span class="row-label">Tipos:</span>
          <select class="enemy-field enemy-type1" data-slot-index="${index}">${renderOptions(TYPE_OPTIONS, slot.type1)}</select>
          <select class="enemy-field enemy-type2" data-slot-index="${index}">${renderOptions(TYPE_OPTIONS, slot.type2)}</select>
          <div class="type-tags-preview">
            ${renderTypeTag(slot.type1)}
            ${renderTypeTag(slot.type2)}
          </div>
        </div>
        <div class="card-row">
          <span class="row-label">Geração:</span>
          <select class="enemy-field enemy-generation" data-slot-index="${index}">${renderOptions(['Qualquer', '1', '2', '3', '4', '5', '6', '7', '8', '9'], slot.generation)}</select>
        </div>
        <div class="card-row">
          <span class="row-label">Cor:</span>
          <select class="enemy-field enemy-color" data-slot-index="${index}">${renderColorOptions(slot.color)}</select>
        </div>
        <div class="card-row range-row">
          <span class="row-label">Peso:</span>
          <span class="row-value">?</span>
          <input class="enemy-field enemy-weight-min" data-slot-index="${index}" type="number" step="0.1" min="0" value="${escapeHtml(slot.weightMin)}" placeholder="mín">
          <input class="enemy-field enemy-weight-max" data-slot-index="${index}" type="number" step="0.1" min="0" value="${escapeHtml(slot.weightMax)}" placeholder="máx">
        </div>
        <div class="card-row range-row">
          <span class="row-label">Altura:</span>
          <span class="row-value">?</span>
          <input class="enemy-field enemy-height-min" data-slot-index="${index}" type="number" step="0.1" min="0" value="${escapeHtml(slot.heightMin)}" placeholder="mín">
          <input class="enemy-field enemy-height-max" data-slot-index="${index}" type="number" step="0.1" min="0" value="${escapeHtml(slot.heightMax)}" placeholder="máx">
        </div>
      </div>
    `;

    container.appendChild(card);
  }

  bindEnemyCardEvents();
  updateCandidateGrid();
}

function bindEnemyCardEvents() {
  document.querySelectorAll('.enemy-square-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      state.selectedEnemySlot = Number.parseInt(event.currentTarget.dataset.slotIndex, 10);
      renderEnemyTeamCards();
      persistNotes();
    });
  });

  const bindField = (selector, key) => {
    document.querySelectorAll(selector).forEach(field => {
      field.addEventListener('input', (event) => {
        const slotIndex = Number.parseInt(event.currentTarget.dataset.slotIndex, 10);
        state.enemySlots[slotIndex][key] = event.currentTarget.value;
        if (state.selectedEnemySlot === slotIndex) {
          updateCandidateGrid();
        }
        schedulePersistNotes();
      });
      field.addEventListener('change', (event) => {
        const slotIndex = Number.parseInt(event.currentTarget.dataset.slotIndex, 10);
        state.enemySlots[slotIndex][key] = event.currentTarget.value;
        renderEnemyTeamCards();
        persistNotes();
      });
    });
  };

  bindField('.enemy-type1', 'type1');
  bindField('.enemy-type2', 'type2');
  bindField('.enemy-generation', 'generation');
  bindField('.enemy-color', 'color');
  bindField('.enemy-weight-min', 'weightMin');
  bindField('.enemy-weight-max', 'weightMax');
  bindField('.enemy-height-min', 'heightMin');
  bindField('.enemy-height-max', 'heightMax');
}

function setupGuessActions() {
  document.getElementById('close-guess-btn').addEventListener('click', () => {
    state.selectedEnemySlot = null;
    renderEnemyTeamCards();
    setGuessFeedback('', false);
    persistNotes();
  });

  document.getElementById('clear-filters-btn').addEventListener('click', () => {
    if (state.selectedEnemySlot === null) {
      setGuessFeedback('Selecione um slot primeiro.', true);
      return;
    }

    const slot = state.enemySlots[state.selectedEnemySlot];
    slot.type1 = 'Qualquer';
    slot.type2 = 'Qualquer';
    slot.generation = 'Qualquer';
    slot.color = 'Qualquer';
    slot.weightMin = '';
    slot.weightMax = '';
    slot.heightMin = '';
    slot.heightMax = '';
    slot.selectedGuessId = '';

    renderEnemyTeamCards();
    persistNotes();
  });

  document.getElementById('enemy-guess-select').addEventListener('change', (event) => {
    if (state.selectedEnemySlot === null) return;
    state.enemySlots[state.selectedEnemySlot].selectedGuessId = event.target.value;
    persistNotes();
  });

  document.getElementById('confirm-guess-btn').addEventListener('click', () => {
    if (state.selectedEnemySlot === null) {
      setGuessFeedback('Clique no quadrado do slot para tentar chute.', true);
      return;
    }

    const slotData = state.enemySlots[state.selectedEnemySlot];
    if (!slotData.selectedGuessId) {
      setGuessFeedback('Selecione um Pokémon antes de confirmar o chute.', true);
      return;
    }

    slotData.confirmedGuessId = slotData.selectedGuessId;
    const pokemon = getPokemonById(slotData.confirmedGuessId);
    setGuessFeedback(`Chute salvo para Slot ${state.selectedEnemySlot + 1}: ${pokemon?.name || 'Pokémon'}.`, false);

    state.selectedEnemySlot = null;
    renderEnemyTeamCards();
    evaluateMatchState();
    persistNotes();
  });

  document.getElementById('clear-guess-btn').addEventListener('click', () => {
    if (state.selectedEnemySlot === null) {
      setGuessFeedback('Selecione um slot para limpar o chute.', true);
      return;
    }

    const slotData = state.enemySlots[state.selectedEnemySlot];
    slotData.selectedGuessId = '';
    slotData.confirmedGuessId = '';
    setGuessFeedback(`Chute do Slot ${state.selectedEnemySlot + 1} removido.`, false);

    renderEnemyTeamCards();
    evaluateMatchState();
    persistNotes();
  });
}

function updateCandidateGrid() {
  const countLabel = document.getElementById('candidates-count');
  const grid = document.getElementById('candidate-grid');
  const select = document.getElementById('enemy-guess-select');
  const guessBox = document.querySelector('.guess-box');
  const guessActionRow = document.querySelector('.guess-action-row');
  const guessFeedback = document.getElementById('guess-feedback');

  if (state.selectedEnemySlot === null) {
    if (guessBox) guessBox.style.display = 'none';
    if (guessActionRow) guessActionRow.style.display = 'none';
    if (guessFeedback) guessFeedback.style.display = 'none';
    select.innerHTML = '<option value="">Selecione um slot primeiro</option>';
    select.value = '';
    return;
  }

  if (guessBox) guessBox.style.display = 'flex';
  if (guessActionRow) guessActionRow.style.display = 'grid';
  if (guessFeedback) guessFeedback.style.display = 'block';

  const slot = state.enemySlots[state.selectedEnemySlot];
  const candidates = filterCandidates(slot);

  countLabel.textContent = `${candidates.length} opções para Slot ${state.selectedEnemySlot + 1}`;
  renderCandidateGrid(candidates, slot.selectedGuessId);
  renderGuessSelect(candidates, slot.selectedGuessId);
}

function filterCandidates(slot) {
  return state.allPokemon.filter(pokemon => {
    if (slot.type1 !== 'Qualquer' && pokemon.types[0] !== slot.type1) return false;

    if (slot.type2 !== 'Qualquer') {
      const type2 = pokemon.types[1] || 'Qualquer';
      if (type2 !== slot.type2) return false;
    }

    if (slot.generation !== 'Qualquer' && String(pokemon.generation) !== String(slot.generation)) return false;
    if (slot.color !== 'Qualquer' && pokemon.primaryColor !== slot.color) return false;

    const weightMin = Number.parseFloat(slot.weightMin);
    const weightMax = Number.parseFloat(slot.weightMax);
    const heightMin = Number.parseFloat(slot.heightMin);
    const heightMax = Number.parseFloat(slot.heightMax);

    if (!Number.isNaN(weightMin) && pokemon.weight < weightMin) return false;
    if (!Number.isNaN(weightMax) && pokemon.weight > weightMax) return false;
    if (!Number.isNaN(heightMin) && pokemon.height < heightMin) return false;
    if (!Number.isNaN(heightMax) && pokemon.height > heightMax) return false;

    return true;
  });
}

function renderCandidateGrid(candidates, selectedGuessId) {
  const grid = document.getElementById('candidate-grid');
  grid.innerHTML = '';

  if (!candidates.length) {
    grid.innerHTML = '<p class="empty-hint">Sem opções para os filtros atuais.</p>';
    return;
  }

  candidates.forEach(pokemon => {
    const card = document.createElement('button');
    card.className = `candidate-card ${String(pokemon.id) === String(selectedGuessId) ? 'selected' : ''}`;
    card.innerHTML = `
      <img src="${pokemon.sprite}" alt="${pokemon.name}" loading="lazy" decoding="async">
      <span>${pokemon.name}</span>
    `;
    card.addEventListener('click', () => {
      state.enemySlots[state.selectedEnemySlot].selectedGuessId = String(pokemon.id);
      renderCandidateGrid(candidates, String(pokemon.id));
      renderGuessSelect(candidates, String(pokemon.id));
      persistNotes();
    });
    grid.appendChild(card);
  });
}

function renderGuessSelect(candidates, selectedGuessId) {
  const select = document.getElementById('enemy-guess-select');
  select.innerHTML = '<option value="">Selecione um Pokémon para chutar</option>';

  candidates.forEach(pokemon => {
    const option = document.createElement('option');
    option.value = String(pokemon.id);
    option.textContent = pokemon.name;
    select.appendChild(option);
  });

  select.value = selectedGuessId || '';
}

function setGuessFeedback(message, isError) {
  const feedback = document.getElementById('guess-feedback');
  feedback.textContent = message;
  feedback.className = `guess-feedback ${isError ? 'error' : 'success'}`;
}

function renderSelfTeam(team) {
  const container = document.getElementById('self-team-grid');
  container.innerHTML = '';

  team.forEach((pokemon, index) => {
    if (!state.selfSlots[index]) {
      state.selfSlots[index] = {
        guessedInfoKeys: [],
        pokemonGuessed: false,
        weightGuessMin: '',
        weightGuessMax: '',
        heightGuessMin: '',
        heightGuessMax: ''
      };
    }

    const slotState = state.selfSlots[index];
    const guessed = new Set(slotState.guessedInfoKeys || []);
    const mood = resolveMoodFromState(slotState);

    const card = document.createElement('div');
    card.className = 'self-slot-card';

    const type2Label = pokemon.types[1] || 'Nenhum';

    card.innerHTML = `
      <div class="card-left-col">
        <img class="self-slot-sprite ${slotState.pokemonGuessed ? 'pokemon-guessed' : ''}" data-self-index="${index}" src="${resolveMoodSprite(pokemon, mood)}" alt="${pokemon.name}" title="Clique para ${slotState.pokemonGuessed ? 'desmarcar' : 'marcar'} acerto do Pokémon" loading="lazy" decoding="async">
      </div>
      <div class="card-right-col">
        <button class="self-info-btn ${guessed.has('type1') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="type1">Tipo Primário:
          <span class="type-tags-preview">${renderTypeTag(pokemon.types[0])}</span>
        </button>
        <button class="self-info-btn ${guessed.has('type2') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="type2">Tipo Secundário:
          <span class="type-tags-preview">${pokemon.types[1] ? renderTypeTag(pokemon.types[1]) : `<span class="type-tag neutral">${type2Label}</span>`}</span>
        </button>
        <button class="self-info-btn ${guessed.has('generation') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="generation">Geração: ${pokemon.generation}</button>
        <button class="self-info-btn ${guessed.has('color') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="color">Cor: ${COLOR_LABELS[pokemon.primaryColor] || pokemon.primaryColor}</button>
        <div class="card-row range-row">
          <button class="self-info-btn ${guessed.has('weight') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="weight">Peso: ${pokemon.weight}kg</button>
          <input class="self-range" data-self-index="${index}" data-self-field="weightGuessMin" type="number" step="0.1" min="0" value="${escapeHtml(slotState.weightGuessMin)}" placeholder="mín chutado">
          <input class="self-range" data-self-index="${index}" data-self-field="weightGuessMax" type="number" step="0.1" min="0" value="${escapeHtml(slotState.weightGuessMax)}" placeholder="máx chutado">
        </div>
        <div class="card-row range-row">
          <button class="self-info-btn ${guessed.has('height') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="height">Altura: ${pokemon.height}m</button>
          <input class="self-range" data-self-index="${index}" data-self-field="heightGuessMin" type="number" step="0.1" min="0" value="${escapeHtml(slotState.heightGuessMin)}" placeholder="mín chutado">
          <input class="self-range" data-self-index="${index}" data-self-field="heightGuessMax" type="number" step="0.1" min="0" value="${escapeHtml(slotState.heightGuessMax)}" placeholder="máx chutado">
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  bindSelfTeamEvents(team);
}

function bindSelfTeamEvents(team) {
  document.querySelectorAll('.self-slot-sprite').forEach(sprite => {
    sprite.addEventListener('click', (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.selfIndex, 10);
      state.selfSlots[index].pokemonGuessed = !state.selfSlots[index].pokemonGuessed;
      renderSelfTeam(team);
      evaluateMatchState();
      persistNotes();
    });
  });

  document.querySelectorAll('.self-info-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.selfIndex, 10);
      const key = event.currentTarget.dataset.selfKey;
      const guessed = new Set(state.selfSlots[index].guessedInfoKeys || []);
      if (guessed.has(key)) guessed.delete(key);
      else guessed.add(key);
      state.selfSlots[index].guessedInfoKeys = Array.from(guessed);
      renderSelfTeam(team);
      persistNotes();
    });
  });

  document.querySelectorAll('.self-range').forEach(input => {
    input.addEventListener('input', (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.selfIndex, 10);
      const field = event.currentTarget.dataset.selfField;
      state.selfSlots[index][field] = event.currentTarget.value;
      schedulePersistNotes();
    });
  });
}

function resolveMoodFromState(slotState) {
  if (slotState.pokemonGuessed) return 'dizzy';
  if ((slotState.guessedInfoKeys || []).length >= 3) return 'sad';
  return 'happy';
}

function resolveMoodSprite(pokemon, mood) {
  return pokemon.sprite;
}

function renderTypeTag(type) {
  if (!type || type === 'Qualquer') return '<span class="type-tag neutral">---</span>';
  const color = TYPE_COLORS[type] || '#777777';
  return `<span class="type-tag" style="border-color:${color};color:${color};background:${hexToRgba(color, 0.18)}">${type}</span>`;
}

function renderOptions(options, selectedValue) {
  return options.map(option => `<option value="${option}" ${option === selectedValue ? 'selected' : ''}>${option}</option>`).join('');
}

function renderColorOptions(selectedValue) {
  const options = COLOR_OPTIONS;
  const normalizedSelected = normalizeLegacyColorValue(selectedValue);
  return options
    .map(option => {
      const text = option === 'Qualquer' ? 'Qualquer' : (COLOR_LABELS[option] || option);
      return `<option value="${option}" ${option === normalizedSelected ? 'selected' : ''}>${text}</option>`;
    })
    .join('');
}

function setupNotes() {
  const notesInput = document.getElementById('free-notes');
  notesInput.value = state.freeNotes;

  notesInput.addEventListener('input', (event) => {
    state.freeNotes = event.target.value;
    schedulePersistNotes();
  });

  document.getElementById('save-notes-btn').addEventListener('click', () => {
    persistNotes();
    const status = document.getElementById('notes-status');
    status.textContent = 'Anotações salvas!';
    setTimeout(() => {
      status.textContent = '';
    }, 1200);
  });
}

function setupFinishMatch() {
  const finishButton = document.getElementById('finish-match-btn');
  const giveUpButton = document.getElementById('give-up-btn');

  finishButton.addEventListener('click', () => {
    if (!state.matchResult) return;

    UserManager.registerMatchResult(state.matchResult);

    localStorage.removeItem(STORAGE_KEY_GUESS);
    window.location.href = 'index.html';
  });

  giveUpButton.addEventListener('click', () => {
    const confirmed = window.confirm('Tem certeza que deseja desistir da partida?');
    if (!confirmed) return;

    UserManager.registerMatchResult('giveup');

    localStorage.removeItem(STORAGE_KEY_GUESS);
    window.location.href = 'index.html';
  });
}

function evaluateMatchState() {
  const enemySolvedCount = state.enemySlots.filter(slot => Boolean(slot.confirmedGuessId)).length;
  const selfSolvedCount = state.selfSlots.filter(slot => Boolean(slot.pokemonGuessed)).length;

  let nextResult = null;
  if (enemySolvedCount >= 6) {
    nextResult = 'victory';
  } else if (selfSolvedCount >= 6) {
    nextResult = 'defeat';
  }

  state.matchResult = nextResult;
  renderMatchResult();
}

function renderMatchResult() {
  const panel = document.getElementById('match-result-panel');
  const title = document.getElementById('match-result-title');
  const description = document.getElementById('match-result-description');
  const finishButton = document.getElementById('finish-match-btn');
  const battleBanner = document.getElementById('battle-banner');

  if (!state.matchResult) {
    panel.style.display = 'none';
    finishButton.disabled = true;
    battleBanner.classList.remove('result-active');
    return;
  }

  panel.style.display = 'block';
  panel.className = `match-result-panel ${state.matchResult}`;
  finishButton.disabled = false;
  battleBanner.classList.add('result-active');

  if (state.matchResult === 'victory') {
    title.textContent = '🏆 VITÓRIA!';
    description.textContent = 'Você acertou todos os 6 Pokémon do adversário.';
  } else {
    title.textContent = '💥 DERROTA';
    description.textContent = 'O adversário acertou todos os seus 6 Pokémon.';
  }
}

function persistNotes() {
  if (state.persistTimerId) {
    clearTimeout(state.persistTimerId);
    state.persistTimerId = null;
  }

  localStorage.setItem(STORAGE_KEY_GUESS, JSON.stringify({
    enemySlots: state.enemySlots,
    selfSlots: state.selfSlots,
    freeNotes: state.freeNotes
  }));
}

function schedulePersistNotes() {
  if (state.persistTimerId) {
    clearTimeout(state.persistTimerId);
  }

  state.persistTimerId = setTimeout(() => {
    state.persistTimerId = null;
    persistNotes();
  }, NOTES_PERSIST_DEBOUNCE_MS);
}

function getPokemonById(id) {
  if (!id) return null;
  return state.pokemonById.get(String(id)) || null;
}

function hydrateSavedNotes() {
  const raw = localStorage.getItem(STORAGE_KEY_GUESS);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.enemySlots) && parsed.enemySlots.length === 6) {
      state.enemySlots = parsed.enemySlots.map(normalizeEnemySlot);
    }
    if (Array.isArray(parsed.selfSlots) && parsed.selfSlots.length === 6) {
      state.selfSlots = parsed.selfSlots.map(slot => ({
        guessedInfoKeys: normalizeGuessedKeys(Array.isArray(slot.guessedInfoKeys) ? slot.guessedInfoKeys : []),
        pokemonGuessed: Boolean(slot.pokemonGuessed),
        weightGuessMin: slot.weightGuessMin || '',
        weightGuessMax: slot.weightGuessMax || '',
        heightGuessMin: slot.heightGuessMin || '',
        heightGuessMax: slot.heightGuessMax || ''
      }));
    }
    if (typeof parsed.freeNotes === 'string') {
      state.freeNotes = parsed.freeNotes;
    }
  } catch (error) {
    console.error('Falha ao restaurar anotações da partida', error);
  }
}

function normalizeEnemySlot(slot) {
  const legacyFilters = slot?.filters || {};
  const source = slot || {};

  const normalizedType1 = normalizeSelectableValue(source.type1 ?? legacyFilters.type1, TYPE_OPTIONS);
  const normalizedType2 = normalizeSelectableValue(source.type2 ?? legacyFilters.type2, TYPE_OPTIONS);
  const normalizedGeneration = normalizeSelectableValue(source.generation ?? legacyFilters.generation, ['Qualquer', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const legacyColor = source.color ?? legacyFilters.color;
  const normalizedColor = normalizeSelectableValue(normalizeLegacyColorValue(legacyColor), COLOR_OPTIONS);

  return {
    type1: normalizedType1,
    type2: normalizedType2,
    generation: normalizedGeneration,
    color: normalizedColor,
    weightMin: source.weightMin ?? legacyFilters.weightMin ?? '',
    weightMax: source.weightMax ?? legacyFilters.weightMax ?? '',
    heightMin: source.heightMin ?? legacyFilters.heightMin ?? '',
    heightMax: source.heightMax ?? legacyFilters.heightMax ?? '',
    selectedGuessId: source.selectedGuessId ?? '',
    confirmedGuessId: source.confirmedGuessId ?? ''
  };
}

function normalizeLegacyColorValue(value) {
  if (value === null || value === undefined) return 'Qualquer';
  const parsed = String(value).trim();
  if (!parsed) return 'Qualquer';
  return LEGACY_HEX_TO_COLOR_NAME[parsed] || parsed;
}

function normalizeSelectableValue(value, allowedOptions) {
  if (value === null || value === undefined) return 'Qualquer';
  const parsed = String(value).trim();
  if (!parsed) return 'Qualquer';
  return allowedOptions.includes(parsed) ? parsed : 'Qualquer';
}

function normalizeGuessedKeys(keys) {
  const normalized = new Set(keys);
  if (normalized.has('types')) {
    normalized.delete('types');
    normalized.add('type1');
    normalized.add('type2');
  }
  return Array.from(normalized);
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = Number.parseInt(normalized, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
