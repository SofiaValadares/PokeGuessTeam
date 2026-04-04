function createPlayerState(playerData = {}) {
	return {
		name: playerData.name ?? '',
		avatar: playerData.avatar ?? '',
		isAi: Boolean(playerData.isAi),
		team: Array.isArray(playerData.team) ? [...playerData.team] : [],
		hits: Array.isArray(playerData.hits) ? [...playerData.hits] : [],
		guesses: Array.isArray(playerData.guesses) ? [...playerData.guesses] : [],
		skipTurns: Number(playerData.skipTurns ?? 0),
	};
}

export default class MatchState {
	constructor(matchData = {}) {
		this.id = matchData.id ?? crypto.randomUUID();
		this.phase = matchData.phase ?? 'setup';
		this.status = matchData.status ?? 'setup';
		this.principal = createPlayerState(matchData.principal);
		this.guest = createPlayerState(matchData.guest);
		this.currentTurn = matchData.currentTurn ?? null;
		this.startingPlayer = matchData.startingPlayer ?? null;
		this.finalResponseFor = matchData.finalResponseFor ?? null;
		this.lastCompletingPlayer = matchData.lastCompletingPlayer ?? null;
		this.winner = matchData.winner ?? null;
		this.announcements = Array.isArray(matchData.announcements) ? [...matchData.announcements] : [];
		this.startedAt = matchData.startedAt ?? null;
		this.finishedAt = matchData.finishedAt ?? null;
		this.hasShownOpeningModal = Boolean(matchData.hasShownOpeningModal);
	}

	getPlayer(playerKey) {
		return this[playerKey];
	}

	getOpponentKey(playerKey) {
		return playerKey === 'principal' ? 'guest' : 'principal';
	}

	getOpponent(playerKey) {
		return this[this.getOpponentKey(playerKey)];
	}

	setPrincipalTeam(teamNames) {
		this.principal.team = [...teamNames];
		this.phase = 'team-guest';
		this.status = 'setup';
	}

	setGuestData({ name, avatar, team, isAi = false }) {
		this.guest.name = name;
		this.guest.avatar = avatar;
		this.guest.isAi = Boolean(isAi);
		this.guest.team = [...team];
		this.phase = 'active';
		this.status = 'active';
		this.startingPlayer = Math.random() > 0.5 ? 'principal' : 'guest';
		this.currentTurn = this.startingPlayer;
		this.startedAt = new Date().toISOString();
		this.addAnnouncement(`Quem começa é ${this.getPlayer(this.startingPlayer).name}.`);
	}

	addAnnouncement(message) {
		this.announcements.unshift({
			id: crypto.randomUUID(),
			message,
			createdAt: new Date().toISOString(),
		});
		this.announcements = this.announcements.slice(0, 10);
	}

	hasPlayerCompleted(playerKey) {
		const opponentTeam = this.getOpponent(playerKey).team;
		return this.getPlayer(playerKey).hits.length >= opponentTeam.length && opponentTeam.length > 0;
	}

	markOpeningModalAsShown() {
		this.hasShownOpeningModal = true;
	}

	buildGuessFeedback(playerKey, guessedPokemon, opponentTeamPokemons) {
		const exactTargets = opponentTeamPokemons.filter(pokemon => pokemon.name.toLowerCase() === guessedPokemon.name.toLowerCase());

		return {
			id: crypto.randomUUID(),
			playerKey,
			guessName: guessedPokemon.name,
			isExactMatch: exactTargets.length > 0,
			matchedPokemonNames: exactTargets.map(pokemon => pokemon.name),
			createdAt: new Date().toISOString(),
		};
	}

	advanceTurn() {
		let nextPlayerKey = this.getOpponentKey(this.currentTurn);
		const skippedPlayers = [];

		for (let attempts = 0; attempts < 2; attempts += 1) {
			const nextPlayer = this.getPlayer(nextPlayerKey);

			if (nextPlayer.skipTurns > 0) {
				nextPlayer.skipTurns -= 1;
				skippedPlayers.push(nextPlayerKey);
				nextPlayerKey = this.getOpponentKey(nextPlayerKey);
				continue;
			}

			break;
		}

		this.currentTurn = nextPlayerKey;

		skippedPlayers.forEach(playerKey => {
			this.addAnnouncement(`${this.getPlayer(playerKey).name} perdeu a vez por causa de um palpite errado.`);
		});
	}

	applyGuess(playerKey, guessedPokemon, allPokemons) {
		if (this.status !== 'active') {
			return { error: 'A partida não está ativa.' };
		}

		if (this.currentTurn !== playerKey) {
			return { error: 'Não é a vez deste jogador.' };
		}

		const currentPlayer = this.getPlayer(playerKey);
		const opponentPlayer = this.getOpponent(playerKey);
		const opponentTeamPokemons = opponentPlayer.team
			.map(teamMember => allPokemons.find(pokemon => pokemon.name === teamMember))
			.filter(Boolean);

		const feedback = this.buildGuessFeedback(playerKey, guessedPokemon, opponentTeamPokemons);
		currentPlayer.guesses.unshift(feedback);

		if (feedback.isExactMatch) {
			feedback.matchedPokemonNames.forEach(pokemonName => {
				if (!currentPlayer.hits.includes(pokemonName)) {
					currentPlayer.hits.push(pokemonName);
				}
			});
			this.addAnnouncement(`${currentPlayer.name} acertou ${feedback.matchedPokemonNames.join(', ')} e joga novamente.`);

			if (this.finalResponseFor === playerKey) {
				if (this.hasPlayerCompleted(playerKey)) {
					this.status = 'finished';
					this.winner = 'draw';
					this.finishedAt = new Date().toISOString();
					this.addAnnouncement('A partida terminou empatada.');
					return { feedback, outcome: 'draw' };
				}

				return { feedback, outcome: 'keep-turn' };
			}

			if (this.hasPlayerCompleted(playerKey)) {
				this.finalResponseFor = this.getOpponentKey(playerKey);
				this.lastCompletingPlayer = playerKey;
				this.currentTurn = this.finalResponseFor;
				this.addAnnouncement(`${opponentPlayer.name} ganhou uma rodada extra para tentar o empate.`);
				return { feedback, outcome: 'final-response' };
			}

			return { feedback, outcome: 'keep-turn' };
		}

		if (this.finalResponseFor === playerKey) {
			this.status = 'finished';
			this.winner = this.lastCompletingPlayer;
			this.finishedAt = new Date().toISOString();
			this.addAnnouncement(`${currentPlayer.name} errou na rodada extra.`);
			return { feedback, outcome: 'finished-after-final-response' };
		}

		currentPlayer.skipTurns += 1;
		this.addAnnouncement(`${currentPlayer.name} errou o palpite ${guessedPokemon.name}.`);
		this.advanceTurn();

		return { feedback, outcome: 'switch-turn' };
	}

	finishBySurrender(playerKey) {
		this.status = 'finished';
		this.finishedAt = new Date().toISOString();
		this.winner = this.getOpponentKey(playerKey);
		this.addAnnouncement(`${this.getPlayer(playerKey).name} desistiu da partida.`);
	}
}