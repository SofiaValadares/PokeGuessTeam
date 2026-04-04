export default class History {
    constructor({
        oponenteName = '',
        result = '',
        playerPoints = 0,
        oponentePoints = 0,
        playedAt = new Date().toISOString(),
    } = {}) {
        this.oponenteName = oponenteName;
        this.result = result;
        this.playerPoints = playerPoints;
        this.oponentePoints = oponentePoints;
        this.playedAt = playedAt;
    }
}