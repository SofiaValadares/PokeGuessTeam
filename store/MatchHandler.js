import MatchState from '../models/MatchState.js';

const MATCH_STORAGE_KEY = 'poketeamguess:match';

export default class MatchHandler {
	getMatch() {
		const rawMatch = localStorage.getItem(MATCH_STORAGE_KEY);

		if (!rawMatch) {
			return null;
		}

		try {
			return new MatchState(JSON.parse(rawMatch));
		} catch (error) {
			console.error('Não foi possível recuperar a partida salva.', error);
			localStorage.removeItem(MATCH_STORAGE_KEY);
			return null;
		}
	}

	saveMatch(matchState) {
		const serializableMatch = matchState instanceof MatchState ? matchState : new MatchState(matchState);
		localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(serializableMatch));
		return serializableMatch;
	}

	clearMatch() {
		localStorage.removeItem(MATCH_STORAGE_KEY);
	}

	hasActiveMatch() {
		const match = this.getMatch();
		return Boolean(match && match.phase !== 'setup' && match.status !== 'finished');
	}

	createBaseMatch(principalPlayer, guestName = '') {
		const match = new MatchState({
			phase: 'team-main',
			status: 'setup',
			principal: {
				name: principalPlayer.name,
				avatar: principalPlayer.avatar,
				team: [],
				hits: [],
				guesses: [],
				skipTurns: 0,
			},
			guest: {
				name: String(guestName).trim(),
				avatar: '',
				team: [],
				hits: [],
				guesses: [],
				skipTurns: 0,
			},
			currentTurn: null,
			startingPlayer: null,
			finalResponseFor: null,
			lastCompletingPlayer: null,
			winner: null,
			announcements: [],
			startedAt: null,
			finishedAt: null,
			hasShownOpeningModal: false,
		});

		return this.saveMatch(match);
	}
}
