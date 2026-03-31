import { requirePlayerProfile } from '../config/sectionManager.js';
import { getPlayer } from '../store/manager/playerManager.js';
import { removeOpponent } from '../store/manager/opponentManager.js';
// Removido uso de MatchState e matchStateManager

import { getMatchHistory, saveMatchHistory } from '../store/manager/matchHistoryManager.js';
import { getAllPokemon } from './pokemonData.js';
const TYPE_OPTIONS = ['Qualquer', 'Grass', 'Poison', 'Fire', 'Flying', 'Water', 'Ground', 'Fighting', 'Steel', 'Psychic', 'Dark', 'Ghost', 'Fairy'];
const SECONDARY_TYPE_OPTIONS = ['Qualquer', 'Nenhum', ...TYPE_OPTIONS.filter(option => option !== 'Qualquer')];
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

const state = {
  opponentTeam: [],
  myTrainerName: 'Você',
  opponentTrainerName: 'Adversário',
  selectedEnemySlot: null,
  matchResult: null,
  roundCounter: 0,
  currentTurn: 'my',
  skipMyNextTurn: false,
  skipOpponentNextTurn: false,
  allPokemon: [],
  pokemonById: new Map(),
  enemySlots: Array.from({ length: 6 }, () => ({
    type1: 'Qualquer',
    type1Locked: false,
    type1LastWrong: '',
    type2: 'Qualquer',
    type2Locked: false,
    type2LastWrong: '',
    generation: 'Qualquer',
    generationLocked: false,
    generationLastWrong: '',
    color: 'Qualquer',
    colorLocked: false,
    colorLastWrong: '',
    weightGuess: '',
    weightRangeMin: '',
    weightRangeMax: '',
    weightLocked: false,
    weightLastWrong: '',
    heightGuess: '',
    heightRangeMin: '',
    heightRangeMax: '',
    heightLocked: false,
    heightLastWrong: '',
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
  // freeNotes removido
};



class MatchHistoryTable {
  constructor(tbodyElement) {
    this.tbodyElement = tbodyElement;
    this.entries = [];
  }

  addEntry(entry) {
    this.entries.push(entry);
    this.render();
    this.scrollToBottom();
  }

  removeLastEntry() {
    if (!this.entries.length) return;
    const removed = this.entries.pop();
    this.render();
    return removed;
  }

  render() {
    this.tbodyElement.innerHTML = '';
    this.entries.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.round}</td>
        <td>${escapeHtml(entry.turnLabel)}</td>
        <td>${escapeHtml(entry.action)}</td>
        <td>${escapeHtml(entry.slotLabel)}</td>
        <td>${escapeHtml(entry.resultLabel)}</td>
      `;
      this.tbodyElement.appendChild(row);
    });
  }

  scrollToBottom() {
    const wrapper = this.tbodyElement.closest('.rounds-table-wrapper');
    if (!wrapper) return;
    wrapper.scrollTop = wrapper.scrollHeight;
  }
}

let matchHistoryTable = null;
let matchHistory = getMatchHistory();
let persistNotesTimer = null;

const MATCH_PERSIST_DELAY_MS = 180;

document.addEventListener('DOMContentLoaded', () => {
  if (!requirePlayerProfile()) return;
  const routePlayerName = getRoutePlayerName();
  const routeOpponentName = getRouteOpponentName();
  const player = getPlayer();
  if (!player) {
    globalThis.location.href = 'register.html';
    return;
  }

  if (!routePlayerName || !routeOpponentName) {
    globalThis.location.href = 'index.html';
    return;
  }

  // Não carrega mais MatchState do storage
  // Se quiser validar time completo, implemente aqui usando player.team

  state.allPokemon = getAllPokemon();
  state.pokemonById = new Map(state.allPokemon.map(pokemon => [String(pokemon.id), pokemon]));
  state.opponentTeam = [];
  state.myTrainerName = routePlayerName;
  state.opponentTrainerName = routeOpponentName;
  // Se quiser validar time completo, implemente aqui usando player.team
  // Reconstrói estado do histórico
  matchHistory = getMatchHistory(); // ATUALIZA a variável global
  const rebuiltState = matchHistory.buildMatchState();
  applySavedMatchState(rebuiltState);

  // Preencher tabela de histórico visual com histórico salvo
  if (matchHistoryTable) {
    matchHistoryTable.entries = matchHistory.entries.map(entry => ({ ...entry }));
    matchHistoryTable.render();
    matchHistoryTable.scrollToBottom();
  }

  setupHeader(player);
  setupBanner(player);
  setupGuessActions();
  setupDynamicRequirementPanels();
  setupFinishMatch();

  renderEnemyTeamCards();
  renderSelfTeam(player.team || []);
  evaluateMatchState();

  persistNotes();
});

function getRoutePlayerName() {
  const params = new URLSearchParams(globalThis.location.search);
  return params.get('playerName') || '';
}

function getRouteOpponentName() {
  const params = new URLSearchParams(globalThis.location.search);
  return params.get('opponentName') || '';
}

function applySavedMatchState(savedMatch) {
  if (!savedMatch) return;

  // Copia todos os campos do objeto reconstruído
  Object.assign(state, savedMatch);
}

function hydrateMatchHistory(savedMatch) {
  if (!matchHistoryTable) return;
  // Carrega do MatchHistory salvo no DOOM
  matchHistory = getMatchHistory();
  matchHistoryTable.entries = matchHistory.entries.map(entry => new RoundEntry(
    Number(entry.round || 0),
    entry.turnLabel || '',
    entry.action || '',
    entry.slotLabel || '',
    entry.resultLabel || '',
    entry.snapshot || null
  ));
  matchHistoryTable.render();
  matchHistoryTable.scrollToBottom();
}

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
    const actualPokemon = getActualOpponentPokemon(index);
    // ...existing code...
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
          <select class="enemy-field enemy-type1 ${slot.type1Locked ? 'solved-field' : ''} ${isLastWrongValue(slot, 'type1', slot.type1) ? 'wrong-last-guess' : ''}" data-slot-index="${index}" data-locked="${slot.type1Locked ? '1' : '0'}" ${slot.type1Locked ? 'disabled' : ''}>${renderOptions(TYPE_OPTIONS, slot.type1)}</select>
          <select class="enemy-field enemy-type2 ${slot.type2Locked ? 'solved-field' : ''} ${isLastWrongValue(slot, 'type2', slot.type2) ? 'wrong-last-guess' : ''}" data-slot-index="${index}" data-locked="${slot.type2Locked ? '1' : '0'}" ${slot.type2Locked ? 'disabled' : ''}>${renderOptions(SECONDARY_TYPE_OPTIONS, slot.type2)}</select>
        </div>
        <div class="card-row">
          <span class="row-label">Geração:</span>
          <select class="enemy-field enemy-generation ${slot.generationLocked ? 'solved-field' : ''} ${isLastWrongValue(slot, 'generation', slot.generation) ? 'wrong-last-guess' : ''}" data-slot-index="${index}" data-locked="${slot.generationLocked ? '1' : '0'}" ${slot.generationLocked ? 'disabled' : ''}>${renderOptions(['Qualquer', '1', '2', '3', '4', '5', '6', '7', '8', '9'], slot.generation)}</select>
        </div>
        <div class="card-row">
          <span class="row-label">Cor:</span>
          <select class="enemy-field enemy-color ${slot.colorLocked ? 'solved-field' : ''} ${isLastWrongValue(slot, 'color', slot.color) ? 'wrong-last-guess' : ''}" data-slot-index="${index}" data-locked="${slot.colorLocked ? '1' : '0'}" ${slot.colorLocked ? 'disabled' : ''}>${renderColorOptions(slot.color)}</select>
        </div>
        <div class="card-row value-guess-row">
          <span class="row-label">Peso:</span>
          <input class="enemy-field enemy-value-field enemy-weight-guess ${slot.weightLocked ? 'solved-field' : ''} ${isLastWrongValue(slot, 'weightGuess', slot.weightGuess) ? 'wrong-last-guess' : ''}" data-slot-index="${index}" data-locked="${slot.weightLocked ? '1' : '0'}" type="number" step="0.1" min="0" value="${escapeHtml(slot.weightGuess)}" placeholder="valor" ${slot.weightLocked ? 'disabled' : ''}>
        </div>
        <div class="card-row value-guess-row">
          <span class="row-label">Altura:</span>
          <input class="enemy-field enemy-value-field enemy-height-guess ${slot.heightLocked ? 'solved-field' : ''} ${isLastWrongValue(slot, 'heightGuess', slot.heightGuess) ? 'wrong-last-guess' : ''}" data-slot-index="${index}" data-locked="${slot.heightLocked ? '1' : '0'}" type="number" step="0.1" min="0" value="${escapeHtml(slot.heightGuess)}" placeholder="valor" ${slot.heightLocked ? 'disabled' : ''}>
        </div>
      </div>
    `;

    container.appendChild(card);
  }

  bindEnemyCardEvents();
  updateCandidateGrid();
  updateTurnUI();
}

function bindEnemyCardEvents() {
  document.querySelectorAll('.enemy-square-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      if (!ensureMyTurn('Só é possível selecionar/chutar na sua vez.')) return;
      state.selectedEnemySlot = Number.parseInt(event.currentTarget.dataset.slotIndex, 10);
      renderEnemyTeamCards();
      persistNotes();
    });
  });

  const bindField = (selector, key) => {
    document.querySelectorAll(selector).forEach(field => {
      field.addEventListener('change', (event) => {
        if (!ensureMyTurn('Só é possível ajustar filtros na sua vez.')) return;
        const slotIndex = Number.parseInt(event.currentTarget.dataset.slotIndex, 10);
        const slotData = state.enemySlots[slotIndex];
        if (slotData[`${key}Locked`]) {
          event.currentTarget.value = slotData[key];
          return;
        }
        const value = event.currentTarget.value;
        slotData[key] = value;
        slotData[`${key}Locked`] = true;
        // Atualiza visual: campo verde e desabilitado
        event.currentTarget.classList.add('solved-field');
        event.currentTarget.disabled = true;
        // Registrar ação no histórico
        const snapshot = createRoundSnapshot();
        addRoundHistory('Minha', 'Ajustar filtro', `Slot ${slotIndex + 1}`, labelForField(key) + ': ' + (value || 'vazio'), snapshot);
        persistNotes();
        advanceTurnAfterAction();
      });
    });
  };

  bindField('.enemy-type1', 'type1');
  bindField('.enemy-type2', 'type2');
  bindField('.enemy-generation', 'generation');
  bindField('.enemy-color', 'color');
  bindField('.enemy-weight-guess', 'weightGuess');
  bindField('.enemy-height-guess', 'heightGuess');
}

function setupGuessActions() {
  document.getElementById('close-guess-btn').addEventListener('click', () => {
    if (!ensureMyTurn('Só é possível mexer na área de chutes na sua vez.')) return;
    // ...existing code...
    state.selectedEnemySlot = null;
    renderEnemyTeamCards();
    setGuessFeedback('', false);
    persistNotes();
  });

  document.getElementById('enemy-guess-select').addEventListener('change', (event) => {
    if (!ensureMyTurn('Só é possível selecionar chute na sua vez.')) return;
    if (state.selectedEnemySlot === null) return;
    state.enemySlots[state.selectedEnemySlot].selectedGuessId = event.target.value;
    // ...existing code...
    persistNotes();
  });

  document.getElementById('confirm-guess-btn').addEventListener('click', () => {
    // Validação de chute removida conforme solicitado. Apenas registra o chute sem penalidade.
    if (state.selectedEnemySlot === null) {
      setGuessFeedback('Clique no quadrado do slot para tentar chute.', true);
      return;
    }
    const slotData = state.enemySlots[state.selectedEnemySlot];
    if (!slotData.selectedGuessId) {
      setGuessFeedback('Selecione um Pokémon antes de confirmar o chute.', true);
      return;
    }
    const snapshot = createRoundSnapshot();
    const guessedPokemon = getPokemonById(slotData.selectedGuessId);
    slotData.confirmedGuessId = slotData.selectedGuessId;
    setGuessFeedback(`Chute registrado para o Slot ${state.selectedEnemySlot + 1}: ${guessedPokemon?.name || 'esse Pokémon'}.`, false);
    addRoundHistory('Minha', 'Chute Pokémon', `Slot ${state.selectedEnemySlot + 1}`, guessedPokemon?.name || 'Sem nome', snapshot);
    state.selectedEnemySlot = null;
    advanceTurnAfterAction();
    renderEnemyTeamCards();
    evaluateMatchState();
    persistNotes();
  });

}

function setupDynamicRequirementPanels() {
  const tableBody = document.getElementById('rounds-table-body');
  const passTurnBtn = document.getElementById('pass-turn-btn');
  const undoRoundBtn = document.getElementById('remove-round-btn');

  matchHistoryTable = new MatchHistoryTable(tableBody);
  globalThis.matchHistoryTable = matchHistoryTable; // Torna global para debug

  if (undoRoundBtn) {
    undoRoundBtn.addEventListener('click', () => {
      undoLastRound();
    });
  }

  passTurnBtn.addEventListener('click', () => {
    const snapshot = createRoundSnapshot();
    if (state.currentTurn === 'my') {
      addRoundHistory('Minha', 'Passar turno', '---', 'Encerrar minha rodada', snapshot);
      advanceTurnAfterAction();
      state.selectedEnemySlot = null;
      renderEnemyTeamCards();
      setGuessFeedback('Turno do adversário. Marque acertos dele ou passe o turno.', false);
    } else {
      addRoundHistory('Adversário', 'Passar turno', '---', 'Adversário não acertou nada', snapshot);
      advanceTurnAfterAction();
      setGuessFeedback('Sua vez! Você pode chutar ou anotar na área de chutes.', false);
    }
    updateTurnUI();
  });
}

function addRoundHistory(turnLabel, action, slotLabel, resultLabel, snapshot = null) {
  if (!matchHistoryTable) return;
  state.roundCounter += 1;
  const entry = new RoundEntry(state.roundCounter, turnLabel, action, slotLabel, resultLabel, snapshot);
  matchHistoryTable.addEntry(entry);
  matchHistory.addEntry(entry);
  saveMatchHistory(matchHistory);
  schedulePersistNotes();
}

function updateCandidateGrid() {
  const countLabel = document.getElementById('candidates-count');
  // ...existing code...
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
    const actualPokemon = getActualOpponentPokemon(state.selectedEnemySlot);

    if (!passesDiscreteFilter(pokemon.types[0], slot.type1, actualPokemon?.types?.[0] || 'Qualquer')) return false;
    if (!passesDiscreteFilter(pokemon.types[1] || 'Nenhum', slot.type2, actualPokemon?.types?.[1] || 'Nenhum')) return false;
    if (!passesDiscreteFilter(String(pokemon.generation), slot.generation, actualPokemon?.generation)) return false;
    if (!passesDiscreteFilter(pokemon.primaryColor, slot.color, actualPokemon?.primaryColor)) return false;
    if (!passesNumericRangeFilter(pokemon.weight, slot.weightRangeMin, slot.weightRangeMax)) return false;
    if (!passesNumericRangeFilter(pokemon.height, slot.heightRangeMin, slot.heightRangeMax)) return false;

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
      if (!ensureMyTurn('Só é possível selecionar candidato na sua vez.')) return;
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
        </div>
        <div class="card-row range-row">
          <button class="self-info-btn ${guessed.has('height') ? 'guessed' : ''}" data-self-index="${index}" data-self-key="height">Altura: ${pokemon.height}m</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  bindSelfTeamEvents(team);
  updateTurnUI();
}

function bindSelfTeamEvents(team) {
  document.querySelectorAll('.self-slot-sprite').forEach(sprite => {
    sprite.addEventListener('click', (event) => {
      if (!ensureOpponentTurn('Só é possível marcar acertos do adversário na vez dele.')) return;
      const snapshot = createRoundSnapshot();
      const index = Number.parseInt(event.currentTarget.dataset.selfIndex, 10);
      state.selfSlots[index].pokemonGuessed = !state.selfSlots[index].pokemonGuessed;
      addRoundHistory(
        'Adversário',
        state.selfSlots[index].pokemonGuessed ? 'Adversário acertou Pokémon' : 'Desmarcar acerto de Pokémon',
        `Slot ${index + 1}`,
        team[index]?.name || 'Pokémon',
        snapshot
      );
      advanceTurnAfterAction();
      renderSelfTeam(team);
      evaluateMatchState();
      persistNotes();
    });
  });

  document.querySelectorAll('.self-info-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      // Permite registrar revelação de informação em qualquer turno
      const snapshot = createRoundSnapshot();
      const index = Number.parseInt(event.currentTarget.dataset.selfIndex, 10);
      const key = event.currentTarget.dataset.selfKey;
      const guessed = new Set(state.selfSlots[index].guessedInfoKeys || []);
      let actionLabel;
      if (guessed.has(key)) {
        guessed.delete(key);
        actionLabel = 'Desmarcar revelação de informação';
      } else {
        guessed.add(key);
        actionLabel = (state.currentTurn === 'my') ? 'Revelei uma informação' : 'Adversário revelou uma informação';
      }
      state.selfSlots[index].guessedInfoKeys = Array.from(guessed);
      addRoundHistory(
        state.currentTurn === 'my' ? 'Minha' : 'Adversário',
        actionLabel,
        `Slot ${index + 1}`,
        labelForField(key),
        snapshot
      );
      advanceTurnAfterAction();
      renderSelfTeam(team);
      persistNotes();
    });
  });

  document.querySelectorAll('.self-range').forEach(input => {
    input.addEventListener('change', (event) => {
      if (!ensureOpponentTurn('Só é possível registrar ações do adversário na vez dele.')) return;
      const snapshot = createRoundSnapshot();
      const index = Number.parseInt(event.currentTarget.dataset.selfIndex, 10);
      const field = event.currentTarget.dataset.selfField;
      state.selfSlots[index][field] = event.currentTarget.value;
      addRoundHistory('Adversário', 'Registrar faixa de chute', `Slot ${index + 1}`, `${labelForField(field)}: ${event.currentTarget.value || 'vazio'}`, snapshot);
      advanceTurnAfterAction();
      schedulePersistNotes();
    });
  });
}

function createRoundSnapshot() {
  return {
    enemySlots: structuredClone(state.enemySlots),
    selfSlots: structuredClone(state.selfSlots),
    freeNotes: state.freeNotes,
    selectedEnemySlot: state.selectedEnemySlot,
    currentTurn: state.currentTurn,
    roundCounter: state.roundCounter,
    skipMyNextTurn: state.skipMyNextTurn,
    skipOpponentNextTurn: state.skipOpponentNextTurn,
    matchResult: state.matchResult
  };
}

function restoreRoundSnapshot(snapshot) {
  if (!snapshot) return;
  state.enemySlots = structuredClone(snapshot.enemySlots || state.enemySlots);
  state.selfSlots = structuredClone(snapshot.selfSlots || state.selfSlots);
  state.freeNotes = snapshot.freeNotes || '';
  state.selectedEnemySlot = snapshot.selectedEnemySlot ?? null;
  state.currentTurn = snapshot.currentTurn || 'my';
  state.roundCounter = snapshot.roundCounter || 0;
  state.skipMyNextTurn = Boolean(snapshot.skipMyNextTurn);
  state.skipOpponentNextTurn = Boolean(snapshot.skipOpponentNextTurn);
  state.matchResult = snapshot.matchResult || null;

  const notesInput = document.getElementById('free-notes');
  if (notesInput) {
    notesInput.value = state.freeNotes;
  }
}

function undoLastRound() {
  if (!matchHistoryTable) return;
  const removed = matchHistoryTable.removeLastEntry();
  matchHistory.removeLastEntry();
  saveMatchHistory(matchHistory);
  if (!removed) {
    setGuessFeedback('Não há rodada para voltar.', true);
    return;
  }
  if (removed.snapshot) {
    restoreRoundSnapshot(removed.snapshot);
  }
  state.roundCounter = matchHistoryTable.entries.length;
  renderEnemyTeamCards();
  const player = getPlayer();
  renderSelfTeam(player?.team ?? []);
  evaluateMatchState();
  updateTurnUI();
  setGuessFeedback('Última rodada desfeita com sucesso.', false);
}

function advanceTurnAfterAction() {
  state.currentTurn = state.currentTurn === 'my' ? 'opponent' : 'my';

  // Debug: log turno e histórico
  console.log('[DEBUG] advanceTurnAfterAction');
  console.log('Novo turno:', state.currentTurn);
  if (globalThis.matchHistoryTable) {
    console.log('Histórico atual:', globalThis.matchHistoryTable.entries?.map(e => ({
      round: e.round,
      turnLabel: e.turnLabel,
      action: e.action,
      slotLabel: e.slotLabel,
      resultLabel: e.resultLabel
    })));
  } else {
    console.log('matchHistoryTable não definido');
  }

  if (state.currentTurn === 'my' && state.skipMyNextTurn) {
    state.skipMyNextTurn = false;
    addRoundHistory('Minha', 'Pular rodada (penalidade)', '---', 'Rodada perdida por chute errado');
    state.currentTurn = 'opponent';
  } else if (state.currentTurn === 'opponent' && state.skipOpponentNextTurn) {
    state.skipOpponentNextTurn = false;
    addRoundHistory('Adversário', 'Pular rodada (penalidade)', '---', 'Rodada perdida por chute errado');
    state.currentTurn = 'my';
  }

  updateTurnUI();
}

function initializeTurnSystem() {
  const modal = document.getElementById('start-turn-modal');
  const myTurnBtn = document.getElementById('start-my-turn-btn');
  const opponentTurnBtn = document.getElementById('start-opponent-turn-btn');

  const applyFirstTurnChoice = (turn) => {
    state.currentTurn = turn;
    if (modal) {
      modal.classList.add('is-hidden');
    }

    if (state.currentTurn === 'my') {
      setGuessFeedback('Sua vez! Você pode chutar ou anotar na área de chutes.', false);
    } else {
      setGuessFeedback('Turno do adversário. Marque acertos dele ou passe o turno.', false);
    }

    updateTurnUI();
  };

  if (!modal || !myTurnBtn || !opponentTurnBtn) {
    const iStart = globalThis.confirm('Quem começa?\nOK = Você começa\nCancelar = Adversário começa');
    applyFirstTurnChoice(iStart ? 'my' : 'opponent');
    return;
  }

  modal.classList.remove('is-hidden');
  setGuessFeedback('Escolha quem começa a partida.', false);

  myTurnBtn.addEventListener('click', () => applyFirstTurnChoice('my'));
  opponentTurnBtn.addEventListener('click', () => applyFirstTurnChoice('opponent'));
}

function ensureMyTurn(message) {
  if (state.currentTurn === 'my') return true;
  setGuessFeedback(message, true);
  return false;
}

function ensureOpponentTurn(message) {
  if (state.currentTurn === 'opponent') return true;
  setGuessFeedback(message, true);
  return false;
}

function updateTurnUI() {
  const statusEl = document.getElementById('turn-status');
  const passBtn = document.getElementById('pass-turn-btn');
  const myTurn = state.currentTurn === 'my';

  if (statusEl) {
    statusEl.textContent = myTurn
      ? 'Vez atual: Sua rodada (chutes e anotações de chute liberadas)'
      : 'Vez atual: Rodada do adversário (marque acertos dele ou passe turno)';
  }

  if (passBtn) {
    passBtn.textContent = myTurn ? 'Passar Minha Vez' : 'Passar Turno do Adversário';
  }

  document.querySelectorAll('.enemy-square-btn, .enemy-field, #enemy-guess-select, #confirm-guess-btn, #close-guess-btn, .candidate-card')
    .forEach(el => {
      if (!el) return;
      if ('disabled' in el) {
        const locked = el.dataset?.locked === '1';
        el.disabled = !myTurn || locked;
      }
    });

  document.querySelectorAll('.self-info-btn, .self-range')
    .forEach(el => {
      if (!el) return;
      if ('disabled' in el) {
        el.disabled = myTurn;
      }
    });
}

function labelForField(fieldKey) {
  const labels = {
    type1: 'Tipo primário',
    type2: 'Tipo secundário',
    generation: 'Geração',
    color: 'Cor',
    weight: 'Peso',
    weightGuess: 'Peso',
    weightGuessMin: 'Peso mín chutado',
    weightGuessMax: 'Peso máx chutado',
    height: 'Altura',
    heightGuess: 'Altura',
    heightGuessMin: 'Altura mín chutada',
    heightGuessMax: 'Altura máx chutada'
  };
  return labels[fieldKey] || fieldKey;
}

function getActualOpponentPokemon(slotIndex) {
  if (slotIndex === null || slotIndex === undefined) return null;
  return state.opponentTeam[slotIndex] || null;
}

function getEnemyDiscreteValidation(guessedValue, actualValue) {
  if (!guessedValue || guessedValue === 'Qualquer' || actualValue === undefined || actualValue === null) {
    return { label: '', tone: 'neutral' };
  }

  const normalizedActual = String(actualValue || 'Qualquer');
  const isCorrect = String(guessedValue) === normalizedActual;
  return {
    label: isCorrect ? 'certo' : 'errado',
    tone: isCorrect ? 'correct' : 'wrong'
  };
}

function getEnemyNumericValidation(guessedValue, actualValue) {
  if (guessedValue === '' || guessedValue === null || guessedValue === undefined || actualValue === undefined || actualValue === null) {
    return { label: '', tone: 'neutral' };
  }

  const parsedGuess = Number.parseFloat(guessedValue);
  if (Number.isNaN(parsedGuess)) {
    return { label: '', tone: 'neutral' };
  }

  if (Number(actualValue) > parsedGuess) {
    return { label: 'maior', tone: 'higher' };
  }

  if (Number(actualValue) < parsedGuess) {
    return { label: 'menor', tone: 'lower' };
  }

  return { label: 'igual', tone: 'correct' };
}

function passesDiscreteFilter(candidateValue, guessedValue, actualValue) {
  if (!guessedValue || guessedValue === 'Qualquer' || actualValue === undefined || actualValue === null) {
    return true;
  }

  const normalizedCandidate = String(candidateValue || 'Qualquer');
  const normalizedGuess = String(guessedValue);
  const normalizedActual = String(actualValue || 'Qualquer');

  if (normalizedGuess === normalizedActual) {
    return normalizedCandidate === normalizedGuess;
  }

  return normalizedCandidate !== normalizedGuess;
}

function passesNumericRangeFilter(candidateValue, rangeMin, rangeMax) {
  const numericCandidate = Number(candidateValue);
  const parsedRangeMin = Number.parseFloat(rangeMin);
  const parsedRangeMax = Number.parseFloat(rangeMax);

  if (!Number.isNaN(parsedRangeMin) && !Number.isNaN(parsedRangeMax) && parsedRangeMin === parsedRangeMax) {
    return numericCandidate === parsedRangeMin;
  }

  if (!Number.isNaN(parsedRangeMin) && numericCandidate <= parsedRangeMin) return false;
  if (!Number.isNaN(parsedRangeMax) && numericCandidate >= parsedRangeMax) return false;

  return true;
}

function renderNumericHintBadge(direction, value, unit) {
  const hasValue = value !== '' && value !== null && value !== undefined;
  const symbol = direction === 'up' ? '↑' : '↓';
  const label = hasValue ? `${value}${unit}` : '---';
  return `<span class="numeric-hint-badge ${direction}">${symbol} ${escapeHtml(label)}</span>`;
}

function renderValidationBadge(label, tone = 'neutral') {
  if (!label) return '';
  return `<span class="filter-validation-badge ${tone}">${escapeHtml(label)}</span>`;
}

function updateEnemyNumericRange(slotIndex, key, rawValue) {
  const parsedValue = Number.parseFloat(rawValue);
  if (Number.isNaN(parsedValue)) return;

  const slot = state.enemySlots[slotIndex];
  const actualPokemon = getActualOpponentPokemon(slotIndex);
  const actualNumericValue = key === 'weightGuess' ? actualPokemon?.weight : actualPokemon?.height;
  const validation = getEnemyNumericValidation(rawValue, actualNumericValue);

  const minKey = key === 'weightGuess' ? 'weightRangeMin' : 'heightRangeMin';
  const maxKey = key === 'weightGuess' ? 'weightRangeMax' : 'heightRangeMax';
  const lockKey = key === 'weightGuess' ? 'weightLocked' : 'heightLocked';

  const currentMin = Number.parseFloat(slot[minKey]);
  const currentMax = Number.parseFloat(slot[maxKey]);

  if (validation.label === 'maior') {
    if (Number.isNaN(currentMin) || parsedValue > currentMin) {
      slot[minKey] = String(parsedValue);
    }
    return;
  }

  if (validation.label === 'menor') {
    if (Number.isNaN(currentMax) || parsedValue < currentMax) {
      slot[maxKey] = String(parsedValue);
    }
    return;
  }

  if (validation.label === 'igual') {
    slot[minKey] = String(parsedValue);
    slot[maxKey] = String(parsedValue);
    slot[lockKey] = true;
  }
}

function updateEnemyDiscreteLock(slotIndex, key, guessedValue) {
  const slot = state.enemySlots[slotIndex];
  const actualPokemon = getActualOpponentPokemon(slotIndex);

  const actualValueByKey = {
    type1: actualPokemon?.types?.[0] || 'Qualquer',
    type2: actualPokemon?.types?.[1] || 'Nenhum',
    generation: actualPokemon?.generation,
    color: actualPokemon?.primaryColor
  };

  const validation = getEnemyDiscreteValidation(guessedValue, actualValueByKey[key]);
  if (validation.label !== 'certo') return false;

  if (key === 'type1') slot.type1Locked = true;
  if (key === 'type2') slot.type2Locked = true;
  if (key === 'generation') slot.generationLocked = true;
  if (key === 'color') slot.colorLocked = true;
  return true;
}

function isEnemyFieldLocked(slotData, key) {
  const lockMap = {
    type1: slotData.type1Locked,
    type2: slotData.type2Locked,
    generation: slotData.generationLocked,
    color: slotData.colorLocked,
    weightGuess: slotData.weightLocked,
    heightGuess: slotData.heightLocked
  };
  return Boolean(lockMap[key]);
}

function getLastWrongKey(fieldKey) {
  const map = {
    type1: 'type1LastWrong',
    type2: 'type2LastWrong',
    generation: 'generationLastWrong',
    color: 'colorLastWrong',
    weightGuess: 'weightLastWrong',
    heightGuess: 'heightLastWrong'
  };
  return map[fieldKey] || '';
}

function isLastWrongValue(slotData, fieldKey, value) {
  const wrongKey = getLastWrongKey(fieldKey);
  if (!wrongKey) return false;
  const storedValue = slotData[wrongKey];
  if (!storedValue) return false;
  return String(storedValue) === String(value ?? '');
}

function clearLastWrongIfChanged(slotData, fieldKey, value) {
  const wrongKey = getLastWrongKey(fieldKey);
  if (!wrongKey) return;
  const storedValue = slotData[wrongKey];
  if (!storedValue) return;
  if (String(storedValue) !== String(value ?? '')) {
    slotData[wrongKey] = '';
  }
}

function markEnemyLastWrong(slotIndex, fieldKey, isWrong, value) {
  const slotData = state.enemySlots[slotIndex];
  const wrongKey = getLastWrongKey(fieldKey);
  if (!wrongKey) return;
  slotData[wrongKey] = isWrong ? String(value ?? '') : '';
}

function describeEnemyFilterAttempt(slotIndex, key, rawValue) {
  const trimmedValue = String(rawValue ?? '').trim();
  if (!trimmedValue || trimmedValue === 'Qualquer') {
    return 'Limpo';
  }

  const actualPokemon = getActualOpponentPokemon(slotIndex);

  if (key === 'weightGuess') {
    const validation = getEnemyNumericValidation(trimmedValue, actualPokemon?.weight);
    return `${trimmedValue}kg → ${validation.label}`;
  }

  if (key === 'heightGuess') {
    const validation = getEnemyNumericValidation(trimmedValue, actualPokemon?.height);
    return `${trimmedValue}m → ${validation.label}`;
  }

  const actualValueByKey = {
    type1: actualPokemon?.types?.[0] || 'Qualquer',
    type2: actualPokemon?.types?.[1] || 'Nenhum',
    generation: actualPokemon?.generation,
    color: actualPokemon?.primaryColor
  };

  const validation = getEnemyDiscreteValidation(trimmedValue, actualValueByKey[key]);
  return `${trimmedValue} → ${validation.label}`;
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
  if (type === 'Nenhum') return '<span class="type-tag neutral">Nenhum</span>';
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
    const status = document.getElementById('notes-status');
    status.textContent = 'Anotações salvas nesta sessão!';
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
    removeMatchState();
    removeOpponent();
    globalThis.location.href = 'index.html';
  });

  giveUpButton.addEventListener('click', () => {
    const confirmed = globalThis.confirm('Tem certeza que deseja desistir da partida?');
    if (!confirmed) return;
    removeMatchState();
    removeOpponent();
    globalThis.location.href = 'index.html';
  });
}

function evaluateMatchState() {
  const enemySolvedCount = state.enemySlots.filter(slot => Boolean(slot.confirmedGuessId)).length;
  const selfSolvedCount = state.selfSlots.filter(slot => Boolean(slot.pokemonGuessed)).length;

  updateBattleScoreboard(enemySolvedCount, selfSolvedCount);

  let nextResult = null;
  if (enemySolvedCount >= 6) {
    nextResult = 'victory';
  } else if (selfSolvedCount >= 6) {
    nextResult = 'defeat';
  }

  state.matchResult = nextResult;
  renderMatchResult();
}

function updateBattleScoreboard(myHits, opponentHits) {
  const myHitsEl = document.getElementById('score-my-hits');
  const opponentHitsEl = document.getElementById('score-opponent-hits');
  if (myHitsEl) {
    myHitsEl.textContent = `${state.myTrainerName}: ${myHits}`;
  }
  if (opponentHitsEl) {
    opponentHitsEl.textContent = `${state.opponentTrainerName}: ${opponentHits}`;
  }
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
  // Persistência de MatchState removida
  // (mantido para compatibilidade de chamadas)
}

function schedulePersistNotes() {
  clearTimeout(persistNotesTimer);
  persistNotesTimer = setTimeout(() => {
    persistNotes();
  }, MATCH_PERSIST_DELAY_MS);
}

function getPokemonById(id) {
  if (!id) return null;
  return state.pokemonById.get(String(id)) || null;
}

function normalizeEnemySlot(slot) {
  const legacyFilters = slot?.filters || {};
  const source = slot || {};

  const normalizedType1 = normalizeSelectableValue(source.type1 ?? legacyFilters.type1, TYPE_OPTIONS);
  const normalizedType2 = normalizeSelectableValue(source.type2 ?? legacyFilters.type2, SECONDARY_TYPE_OPTIONS);
  const normalizedGeneration = normalizeSelectableValue(source.generation ?? legacyFilters.generation, ['Qualquer', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  const legacyColor = source.color ?? legacyFilters.color;
  const normalizedColor = normalizeSelectableValue(normalizeLegacyColorValue(legacyColor), COLOR_OPTIONS);

  return {
    type1: normalizedType1,
    type1Locked: Boolean(source.type1Locked ?? legacyFilters.type1Locked),
    type1LastWrong: source.type1LastWrong ?? legacyFilters.type1LastWrong ?? '',
    type2: normalizedType2,
    type2Locked: Boolean(source.type2Locked ?? legacyFilters.type2Locked),
    type2LastWrong: source.type2LastWrong ?? legacyFilters.type2LastWrong ?? '',
    generation: normalizedGeneration,
    generationLocked: Boolean(source.generationLocked ?? legacyFilters.generationLocked),
    generationLastWrong: source.generationLastWrong ?? legacyFilters.generationLastWrong ?? '',
    color: normalizedColor,
    colorLocked: Boolean(source.colorLocked ?? legacyFilters.colorLocked),
    colorLastWrong: source.colorLastWrong ?? legacyFilters.colorLastWrong ?? '',
    weightGuess: source.weightGuess ?? source.weightMin ?? legacyFilters.weightGuess ?? legacyFilters.weightMin ?? '',
    weightRangeMin: source.weightRangeMin ?? legacyFilters.weightRangeMin ?? '',
    weightRangeMax: source.weightRangeMax ?? legacyFilters.weightRangeMax ?? '',
    weightLocked: Boolean(source.weightLocked ?? legacyFilters.weightLocked),
    weightLastWrong: source.weightLastWrong ?? legacyFilters.weightLastWrong ?? '',
    heightGuess: source.heightGuess ?? source.heightMin ?? legacyFilters.heightGuess ?? legacyFilters.heightMin ?? '',
    heightRangeMin: source.heightRangeMin ?? legacyFilters.heightRangeMin ?? '',
    heightRangeMax: source.heightRangeMax ?? legacyFilters.heightRangeMax ?? '',
    heightLocked: Boolean(source.heightLocked ?? legacyFilters.heightLocked),
    heightLastWrong: source.heightLastWrong ?? legacyFilters.heightLastWrong ?? '',
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
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
