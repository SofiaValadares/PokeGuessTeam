export default class Player {
    constructor({
        name = '',
        avatar = 'assets/player/001P.png',
        team = [],
        level = 1,
        experience = 0,
        history = [],
    } = {}) {
        this.name = name;
        this.avatar = avatar;
        this.team = team;
        this.level = level;
        this.experience = experience;
        this.history = history;
    }
}