import { getPokemonByName, pokemonData } from '../../config/pokemonData.js';
import { AI_TURN_DELAY_MS, chooseAiGuess } from '../../config/aiOpponent.js';
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
	return fetch(filePath, { cache: 'no-store' }).then(response => {
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
	const isAiMatch = Boolean(match?.guest?.isAi);
	let turnTransitionTimeoutId = null;
	let endDialogRedirectTimeoutId = null;
	let aiTurnTimeoutId = null;

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
			render();
		},
	});

	guessBoardController.setGuessOptions(pokemonData.map(pokemon => pokemon.name));

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
		const bottomRow = document.createElement('div');
		bottomRow.className = 'game-opponent-slot__row';

		function createTag(text, isKnown = false) {
			const tag = document.createElement('span');
			tag.className = `game-opponent-slot__tag ${isKnown ? 'is-known' : 'is-unknown'}`;
			tag.textContent = text;
			return tag;
		}

		function createStatLabel(label, value, extraClass = '', isKnown = false) {
			const stat = document.createElement('span');
			stat.className = `game-opponent-slot__label ${isKnown ? 'is-known' : 'is-unknown'}${extraClass ? ` ${extraClass}` : ''}`;
			stat.textContent = `${label}: ${value}`;
			return stat;
		}

		if (!cardState) {
			media.classList.add('is-empty');
			const placeholder = document.createElement('span');
			placeholder.className = 'game-opponent-slot__media-text';
			placeholder.textContent = '???';
			media.appendChild(placeholder);

			topRow.append(createTag('???'), createTag('???'));
			middleRow.append(
				createStatLabel('GEN', '???'),
				createStatLabel('Cor', '???')
			);
			bottomRow.append(
				createStatLabel('ALT', '???'),
				createStatLabel('PES', '???')
			);
			content.append(topRow, middleRow, bottomRow);
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
			mark.className = 'game-opponent-slot__media-text';
			mark.textContent = '???';
			media.appendChild(mark);
		}

		topRow.append(
			createTag(cardState.primaryType ?? '???', Boolean(cardState.primaryType)),
			createTag(cardState.secondaryType ?? '???', Boolean(cardState.secondaryType))
		);
		middleRow.append(
			createStatLabel('GEN', cardState.generation ?? '???', '', Boolean(cardState.generation)),
			createStatLabel('Cor', cardState.color ?? '???', '', Boolean(cardState.color))
		);
		bottomRow.append(
			createStatLabel('ALT', cardState.height ?? '???', '', Boolean(cardState.height)),
			createStatLabel('PES', cardState.weight ?? '???', '', Boolean(cardState.weight))
		);

		content.append(topRow, middleRow, bottomRow);
		slot.append(media, content);
		return slot;
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
				generation: null,
				height: null,
				weight: null,
			};

			currentPlayer.guesses.forEach(record => {
				const guessedPokemon = getPokemonByName(record.guessName);

				if (!guessedPokemon) {
					return;
				}

				if (guessedPokemon.primary_type === opponentPokemon.primary_type) {
					state.primaryType = String(opponentPokemon.primary_type).toUpperCase();
				}

				if (!guessedPokemon.secondary_type && !opponentPokemon.secondary_type) {
					state.secondaryType = 'NENHUM';
				} else if (guessedPokemon.secondary_type && guessedPokemon.secondary_type === opponentPokemon.secondary_type) {
					state.secondaryType = String(opponentPokemon.secondary_type).toUpperCase();
				}

				if (guessedPokemon.color === opponentPokemon.color) {
					state.color = opponentPokemon.color;
				}

				if (guessedPokemon.generation === opponentPokemon.generation) {
					state.generation = String(opponentPokemon.generation).padStart(2, '0');
				}

				if (guessedPokemon.height === opponentPokemon.height) {
					state.height = String(opponentPokemon.height);
				}

				if (guessedPokemon.weight === opponentPokemon.weight) {
					state.weight = String(opponentPokemon.weight);
				}
			});

			if (state.isRevealed) {
				state.primaryType = String(opponentPokemon.primary_type).toUpperCase();
				state.secondaryType = opponentPokemon.secondary_type ? String(opponentPokemon.secondary_type).toUpperCase() : 'NENHUM';
				state.color = opponentPokemon.color;
				state.generation = String(opponentPokemon.generation).padStart(2, '0');
				state.height = String(opponentPokemon.height);
				state.weight = String(opponentPokemon.weight);
			}

			return state;
		});
	}

	function renderOpponentSlots(playerKey) {
		const cards = buildOpponentCardStates(playerKey);
		const hiddenPokemons = match.getOpponent(playerKey).team.filter(
			pokemonName => !match.getPlayer(playerKey).hits.includes(pokemonName)
		);
		const slotNodes = [];

		console.log(`[Guess Debug] Pokémons ocultos para ${match.getPlayer(playerKey).name}:`, hiddenPokemons);
		console.table(hiddenPokemons.map((pokemonName, index) => ({
			slot: index + 1,
			pokemon: pokemonName,
		})));

		for (let index = 0; index < 6; index += 1) {
			slotNodes.push(createOpponentKnowledgeSlot(cards[index] ?? null));
		}

		guessBoardController.setOpponentSlots(slotNodes);
	}

	function getPlayerGuessedNames(playerKey) {
		return new Set(
			match.getPlayer(playerKey).guesses.map(item => String(item.guessName || '').toLowerCase())
		);
	}

	function renderGuessOptions(playerKey) {
		if (isAiMatch && playerKey === 'guest') {
			guessBoardController.setGuessOptions([]);
			return;
		}

		const guessedNames = getPlayerGuessedNames(playerKey);

		guessBoardController.setGuessOptions(
			pokemonData
				.filter(pokemon => !guessedNames.has(pokemon.name.toLowerCase()))
				.map(pokemon => pokemon.name)
		);
	}

	function renderGuessHistory(playerKey) {
		renderOpponentSlots(playerKey);
	}

	function renderPlayerCards() {
		turnControlController.setPlayers(match);
	}

	function render() {
		const isAiTurn = isAiMatch && match.currentTurn === 'guest' && match.status === 'active';
		renderGuessHistory(match.currentTurn);
		renderPlayerCards();
		renderGuessOptions(match.currentTurn);
		guessBoardController.setDisabled(match.status === 'finished' || isAiTurn);

		if (isAiTurn && match.hasShownOpeningModal) {
			scheduleAiTurn();
		}
	}

	function clearPendingTurnTransition() {
		if (turnTransitionTimeoutId) {
			window.clearTimeout(turnTransitionTimeoutId);
			turnTransitionTimeoutId = null;
		}
	}

	function clearPendingAiTurn() {
		if (aiTurnTimeoutId) {
			window.clearTimeout(aiTurnTimeoutId);
			aiTurnTimeoutId = null;
		}
	}

	function clearPendingEndRedirect() {
		if (endDialogRedirectTimeoutId) {
			window.clearTimeout(endDialogRedirectTimeoutId);
			endDialogRedirectTimeoutId = null;
		}
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
		clearPendingAiTurn();
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
			? 'A partida terminou empatada após a rodada extra. Voltando para a Home...'
			: `${match.getPlayer(match.winner).name} venceu a partida. Voltando para a Home...`;

		clearPendingEndRedirect();
		turnControlController.openEndDialog(endMessage);
		endDialogRedirectTimeoutId = window.setTimeout(() => {
			endDialogRedirectTimeoutId = null;
			turnControlController.closeEndDialog();
			matchHandler.clearMatch();
			routeContext.refreshNavigation?.();
			routeContext.navigateTo?.('home');
		}, 3000);
	}

	function scheduleAiTurn() {
		if (!isAiMatch || match.status !== 'active' || match.currentTurn !== 'guest' || aiTurnTimeoutId) {
			return;
		}

		guessBoardController.setFeedback(`${match.guest.name} está pensando...`, 'info');
		aiTurnTimeoutId = window.setTimeout(() => {
			aiTurnTimeoutId = null;
			executeAiTurn();
		}, AI_TURN_DELAY_MS);
	}

	function executeAiTurn() {
		if (!isAiMatch || match.status !== 'active' || match.currentTurn !== 'guest') {
			return;
		}

		const aiGuess = chooseAiGuess({
			guessedNames: Array.from(getPlayerGuessedNames('guest')),
			knownSlots: buildOpponentCardStates('guest'),
		});

		if (!aiGuess) {
			guessBoardController.setFeedback(`${match.guest.name} não encontrou um palpite válido.`, 'error');
			return;
		}

		const result = match.applyGuess('guest', aiGuess, pokemonData);

		if (result.error) {
			guessBoardController.setFeedback(result.error, 'error');
			return;
		}

		clearPendingTurnTransition();
		matchHandler.saveMatch(match);
		guessBoardController.setFeedback(
			result.feedback.isExactMatch
				? `${match.guest.name} acertou ${aiGuess.name}.`
				: `${match.guest.name} chutou ${aiGuess.name} e errou.`,
			result.feedback.isExactMatch ? 'success' : 'info'
		);

		const shouldDelayTurnChange = result.outcome === 'switch-turn' || result.outcome === 'final-response' || result.outcome === 'finished-after-final-response';

		if (shouldDelayTurnChange) {
			guessBoardController.setDisabled(true);
			turnTransitionTimeoutId = window.setTimeout(() => {
				turnTransitionTimeoutId = null;
				guessBoardController.clearGuessInput();
				guessBoardController.clearFeedback();
				render();

				if (match.status === 'finished') {
					finishGame();
				}
			}, 3000);
			return;
		}

		render();

		if (match.status === 'finished') {
			finishGame();
		}
	}

	function handleGuessSubmit(guessValue) {
		if (isAiMatch && match.currentTurn === 'guest') {
			guessBoardController.setFeedback('Aguarde o turno da IA.', 'info');
			return;
		}

		const guessedPokemon = getPokemonByName(guessValue);
		const currentTurn = match.currentTurn;
		const currentPlayer = match.getPlayer(currentTurn);
		const playerGuessedNames = getPlayerGuessedNames(currentTurn);

		if (!guessedPokemon) {
			guessBoardController.setFeedback('Selecione um pokémon válido para continuar.', 'error');
			return;
		}

		if (playerGuessedNames.has(guessedPokemon.name.toLowerCase())) {
			guessBoardController.setFeedback(`${currentPlayer.name} já chutou esse pokémon.`, 'error');
			return;
		}
		const result = match.applyGuess(currentTurn, guessedPokemon, pokemonData);

		if (result.error) {
			guessBoardController.setFeedback(result.error, 'error');
			return;
		}

		clearPendingTurnTransition();
		matchHandler.saveMatch(match);
		const successType = result.feedback.isExactMatch ? 'success' : 'info';
		guessBoardController.setFeedback(
			result.feedback.isExactMatch
				? `${guessedPokemon.name} pertence ao time adversário.`
				: `${guessedPokemon.name} não está no time adversário.`,
			successType
		);

		const shouldDelayTurnChange = result.outcome === 'switch-turn' || result.outcome === 'final-response' || result.outcome === 'finished-after-final-response';

		if (shouldDelayTurnChange) {
			guessBoardController.setDisabled(true);
			turnTransitionTimeoutId = window.setTimeout(() => {
				turnTransitionTimeoutId = null;
				guessBoardController.clearGuessInput();
				guessBoardController.clearFeedback();
				render();

				if (match.status === 'finished') {
					finishGame();
				}
			}, 3000);
			return;
		}

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

	return {
		cleanup() {
			clearPendingAiTurn();
			clearPendingTurnTransition();
			clearPendingEndRedirect();
		},
	};
}
