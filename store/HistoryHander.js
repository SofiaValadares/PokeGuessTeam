import History from '../models/History.js';

export default class HistoryHander {
	constructor(playerHandler) {
		this.playerHandler = playerHandler;
	}

	appendHistory(historyData) {
		const player = this.playerHandler.getPlayer();

		if (!player) {
			return null;
		}

		const history = new History(historyData);
		const nextHistory = [history, ...(player.history ?? [])];

		return this.playerHandler.savePlayer({
			...player,
			history: nextHistory,
		});
	}

	removeHistory(index) {
		const player = this.playerHandler.getPlayer();

		if (!player) {
			return null;
		}

		const nextHistory = [...(player.history ?? [])];
		nextHistory.splice(index, 1);

		return this.playerHandler.savePlayer({
			...player,
			history: nextHistory,
		});
	}
}
