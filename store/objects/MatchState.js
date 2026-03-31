// Classe para representar o objeto MatchState a ser salvo no storage
export default class MatchState {
  constructor({
    playerCode = '',
    mode = 'active',
    enemySlots = [],
    selfSlots = [],
    historyEntries = [],
    freeNotes = '',
    selectedEnemySlot = null,
    currentTurn = 'my',
    roundCounter = 0,
    skipMyNextTurn = false,
    skipOpponentNextTurn = false,
    matchResult = null,
    opponentData = null,
    updatedAt = new Date().toISOString()
  } = {}) {
    this.playerCode = playerCode;
    this.mode = mode;
    this.enemySlots = enemySlots;
    this.selfSlots = selfSlots;
    this.historyEntries = historyEntries;
    this.freeNotes = freeNotes;
    this.selectedEnemySlot = selectedEnemySlot;
    this.currentTurn = currentTurn;
    this.roundCounter = roundCounter;
    this.skipMyNextTurn = skipMyNextTurn;
    this.skipOpponentNextTurn = skipOpponentNextTurn;
    this.matchResult = matchResult;
    this.opponentData = opponentData;
    this.updatedAt = updatedAt;
  }
}
