// Classe para representar o objeto Opponent a ser salvo no storage
export default class Opponent {
  constructor({ nickname = '' } = {}) {
    this.nickname = nickname;
  }
}
