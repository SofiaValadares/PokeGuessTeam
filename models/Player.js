export default class Player {
    constructor({
        name,
        avatar,
        team, // array de pokemons
        level,
        experience,
    }) {
        this.name = name;
        this.avatar = avatar;
        this.team = team;
    }
}