import Player from '../models/Player.js';
import { MatchsResult } from '../enums/MatchsResult.js';

const PLAYER_STORAGE_KEY = 'poketeamguess:player';

export class PlayerHandler {
	getPlayer() {
		const rawPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);

		if (!rawPlayer) {
			return null;
		}

		try {
			const parsedPlayer = JSON.parse(rawPlayer);

			return new Player(parsedPlayer);
		} catch (error) {
			console.error('Não foi possível recuperar o perfil salvo.', error);
			localStorage.removeItem(PLAYER_STORAGE_KEY);

			return null;
		}
	}

	savePlayer(playerData) {
		const safeExperience = Number(playerData?.experience ?? 0);
		const levelInfo = this.calculateLevelInfo(safeExperience);
		const player = new Player({
			...playerData,
			experience: safeExperience,
			level: levelInfo.level,
			team: playerData?.team ?? [],
			history: playerData?.history ?? [],
		});

		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));

		return player;
	}

	deletePlayer() {
		localStorage.removeItem(PLAYER_STORAGE_KEY);
	}

	hasPlayer() {
		return Boolean(this.getPlayer());
	}

	calculateLevelInfo(experience = 0) {
		let level = 1;
		let xpToNextLevel = 100;
		let remainingExperience = Math.max(0, Number(experience) || 0);

		while (remainingExperience >= xpToNextLevel) {
			remainingExperience -= xpToNextLevel;
			level += 1;
			xpToNextLevel *= 2;
		}

		return {
			level,
			currentLevelXp: remainingExperience,
			nextLevelXp: xpToNextLevel,
			totalExperience: Math.max(0, Number(experience) || 0),
		};
	}

	buildProfileSummary(playerData) {
		const experience = Number(playerData?.experience ?? 0);
		const levelInfo = this.calculateLevelInfo(experience);
		const history = Array.isArray(playerData?.history) ? playerData.history : [];
		const wins = history.filter(entry => entry.result === MatchsResult.WIN).length;
		const draws = history.filter(entry => entry.result === MatchsResult.DRAW).length;
		const losses = history.filter(entry => entry.result === MatchsResult.LOSE || entry.result === MatchsResult.DESISTENCE).length;

		return {
			name: playerData?.name ?? 'Treinador',
			avatar: playerData?.avatar ?? 'assets/player/001P.png',
			level: levelInfo.level,
			experience: levelInfo.totalExperience,
			currentLevelXp: levelInfo.currentLevelXp,
			nextLevelXp: levelInfo.nextLevelXp,
			totalMatches: history.length,
			wins,
			draws,
			losses,
		};
	}

	calculateExperienceGain(result) {
		if (result === MatchsResult.WIN) {
			return 20;
		}

		if (result === MatchsResult.DRAW) {
			return 10;
		}

		return 0;
	}
}

export default PlayerHandler;
