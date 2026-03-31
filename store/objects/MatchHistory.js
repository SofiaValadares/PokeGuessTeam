// Classe para representar o histórico de ações da partida
export default class MatchHistory {
  constructor(entries = []) {
    this.entries = entries;
  }

  // Reconstrói o estado do jogo (MatchState) a partir do histórico
  buildMatchState(initialState = {}) {
    const state = {
      enemySlots: Array.from({ length: 6 }, () => ({
        type1: 'Qualquer', type2: 'Qualquer', generation: 'Qualquer', color: 'Qualquer',
        weightGuess: '', heightGuess: '', type1Locked: false, type2Locked: false, generationLocked: false, colorLocked: false,
        weightLocked: false, heightLocked: false, selectedGuessId: '', confirmedGuessId: ''
      })),
      selfSlots: Array.from({ length: 6 }, () => ({
        guessedInfoKeys: [], pokemonGuessed: false, weightGuessMin: '', weightGuessMax: '', heightGuessMin: '', heightGuessMax: ''
      })),
      freeNotes: '',
      selectedEnemySlot: null,
      currentTurn: 'my',
      roundCounter: 0,
      skipMyNextTurn: false,
      skipOpponentNextTurn: false,
      matchResult: null,
      ...initialState
    };
    for (const entry of this.entries) {
      if (entry.snapshot) {
        Object.assign(state, JSON.parse(JSON.stringify(entry.snapshot)));
      }
    }
    return state;
  }

  addEntry(entry) {
    this.entries.push(entry);
  }

  removeLastEntry() {
    return this.entries.pop();
  }

  clear() {
    this.entries = [];
  }

  toJSON() {
    return this.entries.map(entry => ({ ...entry }));
  }

  static fromJSON(json) {
    return new MatchHistory(Array.isArray(json) ? json : []);
  }
}
