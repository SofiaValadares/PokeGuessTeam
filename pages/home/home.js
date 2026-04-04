import PlayerHandler from '../../store/PlayerHandler.js';
import HistoryHander from '../../store/HistoryHander.js';
import MatchHandler from '../../store/MatchHandler.js';
import { setupHistoryPanel } from './componentes/historyPanel/historyPanel.js';
import { setupControlSide } from './componentes/controlSide/controlSide.js';

const HISTORY_PANEL_COMPONENT_PATH = 'pages/home/componentes/historyPanel/historyPanel.html';
const CONTROL_SIDE_COMPONENT_PATH = 'pages/home/componentes/controlSide/controlSide.html';

function fetchHtml(filePath) {
	return fetch(filePath).then(response => {
		if (!response.ok) {
			throw new Error(`Não foi possível carregar ${filePath}.`);
		}

		return response.text();
	});
}

function countHistoryByResult(history, expectedResult) {
	return history.filter(item => String(item.result || '').toLowerCase() === expectedResult).length;
}

function getResultLabel(result) {
	const labels = {
		victory: 'Vitória',
		defeat: 'Derrota',
		draw: 'Empate',
		desistence: 'Desistência',
	};

	return labels[String(result || '').toLowerCase()] ?? '—';
}

export async function initHomePage(pokedexElement, routeContext = {}) {
	const headerTitle = pokedexElement.querySelector('.pokedex-header-title');
	const leftScreen = pokedexElement.querySelector('.pokedex-screen-left');
	const rightScreen = pokedexElement.querySelector('.pokedex-screen-right');
	const playerHandler = routeContext.playerHandler ?? new PlayerHandler();
	const historyHandler = new HistoryHander(playerHandler);
	const matchHandler = new MatchHandler();
	const player = playerHandler.getPlayer();

	if (!player) {
		routeContext.navigateTo?.('register');
		return;
	}

	if (headerTitle) {
		headerTitle.textContent = 'POKÉTEAMGUESS · HOME';
	}

	leftScreen.className = 'pokedex-screen-left home-screen';
	rightScreen.className = 'pokedex-screen-right home-screen';

	const [historyPanelHtml, controlSideHtml] = await Promise.all([
		fetchHtml(HISTORY_PANEL_COMPONENT_PATH),
		fetchHtml(CONTROL_SIDE_COMPONENT_PATH),
	]);

	leftScreen.innerHTML = historyPanelHtml;
	rightScreen.innerHTML = controlSideHtml;

	const summary = playerHandler.buildProfileSummary(player);
	const history = Array.isArray(player.history) ? [...player.history] : [];

	const historyPanelController = setupHistoryPanel(leftScreen, {
		onDelete: historyIndex => {
			historyHandler.removeHistory(historyIndex);
			routeContext.refresh?.();
		},
	});

	const controlSideController = setupControlSide(rightScreen, {
		onDeleteProfile: () => {
			playerHandler.deletePlayer();
			matchHandler.clearMatch();
			routeContext.refreshNavigation?.();
			routeContext.navigateTo?.('register');
		},
		onStartMatch: guestName => {
			matchHandler.clearMatch();
			matchHandler.createBaseMatch(player, guestName);
			routeContext.refreshNavigation?.();
			routeContext.navigateTo?.('team-main', [player.name, guestName]);
		},
	});

	controlSideController.setProfileSummary({
		...summary,
		wins: summary.wins ?? countHistoryByResult(history, 'victory'),
		draws: summary.draws ?? countHistoryByResult(history, 'draw'),
		losses: summary.losses ?? 0,
	});

	function renderHistory() {
		const latestPlayer = playerHandler.getPlayer();
		const latestHistory = Array.isArray(latestPlayer?.history) ? latestPlayer.history : [];

		historyPanelController.renderHistory(latestHistory.map(entry => ({
			...entry,
			resultLabel: getResultLabel(entry.result),
		})));
	}

	renderHistory();
}
