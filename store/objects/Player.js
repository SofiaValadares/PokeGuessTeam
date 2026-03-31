// Classe para representar o objeto Player a ser salvo no storage
export default class Player {
  constructor({
    nickname = '',
    avatar = '',
    registeredAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    level = 1,
    experience = 0,
    matchesWon = 0,
    matchesLost = 0,
    matchesPlayed = 0,
    team = [],
    lastTeam = []
  } = {}) {
    this.nickname = nickname;
    this.avatar = avatar;
    this.registeredAt = registeredAt;
    this.updatedAt = updatedAt;
    this.level = level;
    this.experience = experience;
    this.matchesWon = matchesWon;
    this.matchesLost = matchesLost;
    this.matchesPlayed = matchesPlayed;
    this.team = team;
    this.lastTeam = lastTeam;
  }
}
