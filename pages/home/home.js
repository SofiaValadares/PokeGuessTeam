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

function getMatchPhaseLabel(match) {
	if (!match) {
		return 'Sem partida';
	}

	if (match.phase === 'team-main') {
		return 'Montando time principal';
	}

	if (match.phase === 'team-guest') {
		return 'Montando time convidado';
	}

	if (match.phase === 'active') {
		return match.status === 'finished' ? 'Partida encerrada' : 'Partida em andamento';
	}

	return 'Partida local';
}

function getMatchDescription(match) {
	if (!match) {
		return 'Nenhuma partida local foi iniciada.';
	}

	if (match.phase === 'team-main') {
		return 'O time do jogador principal ainda está sendo montado.';
	}

	if (match.phase === 'team-guest') {
		return 'Falta definir o nome e o time do jogador convidado.';
	}

	if (match.phase === 'active') {
		return `Partida entre ${match.principal.name} e ${match.guest.name}.`;
	}

	return 'Há uma partida local salva no navegador.';
}

function buildMatchRouteSegments(match, fallbackPlayerName = '', fallbackGuestName = '') {
	if (!match) {
		return [];
	}

	return [
		String(match.principal?.name || fallbackPlayerName || '').trim(),
		String(match.guest?.name || fallbackGuestName || '').trim(),
	];
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
			const createdMatch = matchHandler.createBaseMatch(player, guestName);
			routeContext.refreshNavigation?.();
			routeContext.navigateTo?.('team-main', [player.name, guestName]);
		},
		onContinueMatch: () => {
			const currentMatch = matchHandler.getMatch();

			if (!currentMatch) {
				return;
			}

			const routeSegments = buildMatchRouteSegments(currentMatch, player.name, currentMatch?.guest?.name);

			if (currentMatch.phase === 'team-main' || currentMatch.phase === 'team-guest') {
				routeContext.navigateTo?.(currentMatch.phase, routeSegments);
				return;
			}

			routeContext.navigateTo?.('game', routeSegments);
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

	const currentMatch = matchHandler.getMatch();
	const hasContinuableMatch = Boolean(currentMatch && currentMatch.status !== 'finished');
	controlSideController.setContinuableMatch(hasContinuableMatch ? {
		buttonLabel: currentMatch.phase === 'active' ? 'Continuar partida' : 'Continuar seleção',
		phaseLabel: getMatchPhaseLabel(currentMatch),
		description: getMatchDescription(currentMatch),
		scoreText: `${currentMatch.principal.hits.length} x ${currentMatch.guest.hits.length}`,
		turnText: currentMatch.phase === 'active' && currentMatch.currentTurn
			? `Vez de ${currentMatch.getPlayer(currentMatch.currentTurn).name}`
			: 'Aguardando continuação',
	} : null);

	renderHistory();
}
