import { getPokemonByName, pokemonData } from '../../config/pokemonData.js';
import { MatchsResult } from '../../enums/MatchsResult.js';
import HistoryHander from '../../store/HistoryHander.js';
import MatchHandler from '../../store/MatchHandler.js';
import PlayerHandler from '../../store/PlayerHandler.js';
import { setupGuessBoard } from './componentes/guessBoard/guessBoard.js';
import { setupTurnControl } from './componentes/turnControl/turnControl.js';

const GUESS_BOARD_COMPONENT_PATH = 'pages/game/componentes/guessBoard/guessBoard.html';
const TURN_CONTROL_COMPONENT_PATH = 'pages/game/componentes/turnControl/turnControl.html';

function buildRouteSegments(match) {
	if (!match) {
		return [];
	}

	return [match.principal?.name || '', match.guest?.name || ''];
}

function fetchHtml(filePath) {
	return fetch(filePath).then(response => {
		if (!response.ok) {
			throw new Error(`Não foi possível carregar ${filePath}.`);
		}

		return response.text();
	});
}

export async function initGamePage(pokedexElement, routeContext = {}) {
	const headerTitle = pokedexElement.querySelector('.pokedex-header-title');
	const leftScreen = pokedexElement.querySelector('.pokedex-screen-left');
	const rightScreen = pokedexElement.querySelector('.pokedex-screen-right');
	const playerHandler = routeContext.playerHandler ?? new PlayerHandler();
	const matchHandler = new MatchHandler();
	const historyHandler = new HistoryHander(playerHandler);
	const player = playerHandler.getPlayer();
	const match = matchHandler.getMatch();

	if (!player) {
		routeContext.navigateTo?.('register');
		return;
	}

	if (!match) {
		routeContext.navigateTo?.('home');
		return null;
	}

	if (match.phase === 'team-main' || match.phase === 'team-guest') {
		routeContext.navigateTo?.(match.phase, buildRouteSegments(match));
		return null;
	}

	if (headerTitle) {
		headerTitle.textContent = 'POKÉTEAMGUESS · PARTIDA';
	}

	leftScreen.className = 'pokedex-screen-left game-screen';
	rightScreen.className = 'pokedex-screen-right game-screen';

	const [guessBoardHtml, turnControlHtml] = await Promise.all([
		fetchHtml(GUESS_BOARD_COMPONENT_PATH),
		fetchHtml(TURN_CONTROL_COMPONENT_PATH),
	]);

	leftScreen.innerHTML = guessBoardHtml;
	rightScreen.innerHTML = turnControlHtml;

	const guessBoardController = setupGuessBoard(leftScreen, {
		onSubmitGuess: handleGuessSubmit,
	});

	const turnControlController = setupTurnControl(rightScreen, {
		onGoHome: () => {
			matchHandler.saveMatch(match);
			routeContext.refreshNavigation?.();
			routeContext.navigateTo?.('home');
		},
		onAskSurrender: () => {
			turnControlController.openSurrenderDialog();
		},
		onCancelSurrender: () => {
			turnControlController.closeSurrenderDialog();
		},
		onConfirmSurrender: () => {
			turnControlController.closeSurrenderDialog();
			match.finishBySurrender(match.currentTurn);
			matchHandler.saveMatch(match);
			render();
			finishGame(true, match.currentTurn);
		},
		onCloseStart: () => {
			turnControlController.closeStartDialog();
		},
		onCloseEnd: () => {
			turnControlController.closeEndDialog();
			matchHandler.clearMatch();
			routeContext.refreshNavigation?.();
			routeContext.navigateTo?.('home');
		},
	});

	guessBoardController.setGuessOptions(pokemonData.map(pokemon => pokemon.name));

	function createTextItem(text, empty = false) {
		const listItem = document.createElement('li');
		listItem.textContent = text;
		listItem.classList.toggle('is-empty', empty);
		return listItem;
	}

	function createOpponentKnowledgeSlot(cardState) {
		const slot = document.createElement('li');
		slot.className = 'game-opponent-slot';

		const media = document.createElement('div');
		media.className = 'game-opponent-slot__media';

		const content = document.createElement('div');
		content.className = 'game-opponent-slot__content';
		const topRow = document.createElement('div');
		topRow.className = 'game-opponent-slot__top';
		const middleRow = document.createElement('div');
		middleRow.className = 'game-opponent-slot__row';
		const colorRow = document.createElement('div');
		colorRow.className = 'game-opponent-slot__row';
		const heightRow = document.createElement('div');
		heightRow.className = 'game-opponent-slot__row';
		const weightRow = document.createElement('div');
		weightRow.className = 'game-opponent-slot__row';

		function createTag(text, muted = false) {
			const tag = document.createElement('span');
			tag.className = `game-opponent-slot__tag${muted ? ' is-muted' : ''}`;
			tag.textContent = text;
			return tag;
		}

		function createStatLabel(label, value) {
			const stat = document.createElement('span');
			stat.className = 'game-opponent-slot__label';
			stat.textContent = `${label}: ${value}`;
			return stat;
		}

		function createCounter(direction, value) {
			const counter = document.createElement('span');
			counter.className = 'game-opponent-slot__counter';
			counter.textContent = `${direction} ${String(value).padStart(2, '0')}`;
			return counter;
		}

		if (!cardState) {
			media.classList.add('is-empty');
			const placeholder = document.createElement('span');
			placeholder.textContent = '?';
			media.appendChild(placeholder);

			topRow.append(createTag('NENHUM', true), createTag('NENHUM', true));
			middleRow.append(createStatLabel('GEN', '?'), createCounter('↓', 0), createCounter('↑', 0));
			colorRow.append(createStatLabel('Cor', '?'));
			heightRow.append(createStatLabel('Altura', '?'), createCounter('↓', 0), createCounter('↑', 0));
			weightRow.append(createStatLabel('Peso', '?'), createCounter('↓', 0), createCounter('↑', 0));
			content.append(topRow, middleRow, colorRow, heightRow, weightRow);
			slot.append(media, content);
			return slot;
		}

		if (cardState.isRevealed && cardState.imageSrc) {
			const image = document.createElement('img');
			image.src = cardState.imageSrc;
			image.alt = 'Pokémon confirmado';
			media.appendChild(image);
			slot.classList.add('is-revealed');
		} else {
			media.classList.add('is-empty');
			const mark = document.createElement('span');
			mark.textContent = '?';
			media.appendChild(mark);
		}

		topRow.append(
			createTag(cardState.primaryType ?? 'NENHUM', !cardState.primaryType),
			createTag(cardState.secondaryType ?? 'NENHUM', !cardState.secondaryType)
		);
		middleRow.append(
			createStatLabel('GEN', cardState.generation.equal > 0 ? String(cardState.generation.equal).padStart(2, '0') : '?'),
			createCounter('↓', cardState.generation.lower),
			createCounter('↑', cardState.generation.higher)
		);
		colorRow.append(createStatLabel('Cor', cardState.color ?? '?'));
		heightRow.append(
			createStatLabel('Altura', cardState.height.equal > 0 ? String(cardState.height.equal).padStart(2, '0') : '?'),
			createCounter('↓', cardState.height.lower),
			createCounter('↑', cardState.height.higher)
		);
		weightRow.append(
			createStatLabel('Peso', cardState.weight.equal > 0 ? String(cardState.weight.equal).padStart(2, '0') : '?'),
			createCounter('↓', cardState.weight.lower),
			createCounter('↑', cardState.weight.higher)
		);

		content.append(topRow, middleRow, colorRow, heightRow, weightRow);
		slot.append(media, content);
		return slot;
	}

	function createComparisonBucket() {
		return { lower: 0, equal: 0, higher: 0 };
	}

	function applyComparison(bucket, guessValue, targetValue) {
		if (targetValue < guessValue) {
			bucket.lower += 1;
			return;
		}

		if (targetValue > guessValue) {
			bucket.higher += 1;
			return;
		}

		bucket.equal += 1;
	}

	function buildOpponentCardStates(playerKey) {
		const currentPlayer = match.getPlayer(playerKey);
		const opponentTeam = match.getOpponent(playerKey).team
			.map(name => getPokemonByName(name))
			.filter(Boolean);

		return opponentTeam.map(opponentPokemon => {
			const state = {
				imageSrc: opponentPokemon.image_src,
				isRevealed: currentPlayer.hits.includes(opponentPokemon.name),
				primaryType: null,
				secondaryType: null,
				color: null,
				generation: createComparisonBucket(),
				height: createComparisonBucket(),
				weight: createComparisonBucket(),
			};

			currentPlayer.guesses.forEach(record => {
				const guessedPokemon = getPokemonByName(record.guessName);

				if (!guessedPokemon) {
					return;
				}

				if (guessedPokemon.primary_type === opponentPokemon.primary_type) {
					state.primaryType = String(opponentPokemon.primary_type).toUpperCase();
				}

				if (guessedPokemon.secondary_type && guessedPokemon.secondary_type === opponentPokemon.secondary_type) {
					state.secondaryType = String(opponentPokemon.secondary_type).toUpperCase();
				}

				if (guessedPokemon.color === opponentPokemon.color) {
					state.color = opponentPokemon.color;
				}

				applyComparison(state.generation, guessedPokemon.generation, opponentPokemon.generation);
				applyComparison(state.height, guessedPokemon.height, opponentPokemon.height);
				applyComparison(state.weight, guessedPokemon.weight, opponentPokemon.weight);
			});

			if (state.isRevealed) {
				state.primaryType = String(opponentPokemon.primary_type).toUpperCase();
				state.secondaryType = opponentPokemon.secondary_type ? String(opponentPokemon.secondary_type).toUpperCase() : 'NENHUM';
				state.color = opponentPokemon.color;
			}

			return state;
		});
	}

	function renderOpponentSlots(playerKey) {
		const cards = buildOpponentCardStates(playerKey);
		const slotNodes = [];

		for (let index = 0; index < 6; index += 1) {
			slotNodes.push(createOpponentKnowledgeSlot(cards[index] ?? null));
		}

		guessBoardController.setOpponentSlots(slotNodes);
	}

	function getGuessedNames() {
		return new Set([
			...match.principal.guesses.map(item => item.guessName.toLowerCase()),
			...match.guest.guesses.map(item => item.guessName.toLowerCase()),
		]);
	}

	function renderGuessOptions() {
		guessBoardController.setGuessOptions(pokemonData.map(pokemon => pokemon.name));
	}

	function renderGuessHistory(playerKey) {
		const currentPlayer = match.getPlayer(playerKey);
		guessBoardController.setTurnInfo({
			title: `Vez de ${currentPlayer.name}`,
			subtitle: `Os 6 cards acima representam o time adversário de ${currentPlayer.name} com as pistas acumuladas até agora.`,
			currentTurn: currentPlayer.name,
			roundLabel: match.finalResponseFor
				? `Rodada extra de ${match.getPlayer(match.finalResponseFor).name}`
				: 'Partida em andamento',
			guessedCountText: `${getGuessedNames().size} ${getGuessedNames().size === 1 ? 'palpite único' : 'palpites únicos'}`,
		});
		renderOpponentSlots(playerKey);
	}

	function renderPlayerCards() {
		turnControlController.setPlayers(match);
	}

	function renderTurnInfo() {
		const currentPlayer = match.getPlayer(match.currentTurn);
		guessBoardController.setTurnInfo({
			title: `Vez de ${currentPlayer.name}`,
			subtitle: `Os 6 cards acima representam o time adversário de ${currentPlayer.name} com as pistas acumuladas até agora.`,
			currentTurn: currentPlayer.name,
			roundLabel: match.finalResponseFor
				? `Rodada extra de ${match.getPlayer(match.finalResponseFor).name}`
				: 'Partida em andamento',
			guessedCountText: `${getGuessedNames().size} ${getGuessedNames().size === 1 ? 'palpite único' : 'palpites únicos'}`,
		});
	}

	function render() {
		renderTurnInfo();
		renderGuessHistory(match.currentTurn);
		renderPlayerCards();
		renderGuessOptions();
		guessBoardController.setDisabled(match.status === 'finished');
	}

	function resolvePrincipalResult(isSurrender = false, surrenderPlayer = null) {
		if (match.winner === 'draw') {
			return MatchsResult.DRAW;
		}

		if (isSurrender && surrenderPlayer === 'principal') {
			return MatchsResult.DESISTENCE;
		}

		if (match.winner === 'principal') {
			return MatchsResult.WIN;
		}

		return MatchsResult.LOSE;
	}

	function finishGame(isSurrender = false, surrenderPlayer = null) {
		const principalResult = resolvePrincipalResult(isSurrender, surrenderPlayer);
		const experienceGain = playerHandler.calculateExperienceGain(principalResult);
		const updatedPlayer = historyHandler.appendHistory({
			oponenteName: match.guest.name,
			result: principalResult,
			playerPoints: match.principal.hits.length,
			oponentePoints: match.guest.hits.length,
		});

		playerHandler.savePlayer({
			...updatedPlayer,
			experience: Number(updatedPlayer?.experience ?? 0) + experienceGain,
		});

		const endMessage = match.winner === 'draw'
			? 'A partida terminou empatada após a rodada extra.'
			: `${match.getPlayer(match.winner).name} venceu a partida.`;

		turnControlController.openEndDialog(endMessage);
	}

	function handleGuessSubmit(guessValue) {
		const guessedPokemon = getPokemonByName(guessValue);
		const guessedNames = getGuessedNames();

		if (!guessedPokemon) {
			guessBoardController.setFeedback('Selecione um pokémon válido para continuar.', 'error');
			return;
		}

		if (guessedNames.has(guessedPokemon.name.toLowerCase())) {
			guessBoardController.setFeedback('Esse pokémon já foi chutado na partida.', 'error');
			return;
		}

		const currentTurn = match.currentTurn;
		const result = match.applyGuess(currentTurn, guessedPokemon, pokemonData);

		if (result.error) {
			guessBoardController.setFeedback(result.error, 'error');
			return;
		}

		matchHandler.saveMatch(match);
		const successType = result.feedback.isExactMatch ? 'success' : 'info';
		guessBoardController.setFeedback(result.feedback.isExactMatch ? `${guessedPokemon.name} pertence ao time adversário.` : `${guessedPokemon.name} não está no time adversário.`, successType);
		guessBoardController.clearGuessInput();
		render();

		if (match.status === 'finished') {
			finishGame();
		}
	}

	render();

	if (!match.hasShownOpeningModal) {
		match.markOpeningModalAsShown();
		matchHandler.saveMatch(match);
		turnControlController.openStartDialog(`${match.getPlayer(match.startingPlayer).name} começa a partida.`);
	} else {
		guessBoardController.clearFeedback();
	}

	return null;
}
