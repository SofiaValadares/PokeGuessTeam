import { pokemonData, getPokemonByName } from '../../config/pokemonData.js';
import { getGuestSpriteByPlayerPath } from '../../enums/PlayerSpriteEnum.js';
import MatchHandler from '../../store/MatchHandler.js';
import { setupPokemonList } from '../../components/pokemonList/pokemonList.js';
import { setupSelectionBoard } from './componentes/selectionBoard/selectionBoard.js';
import { setupTeamSide } from './componentes/teamSide/teamSide.js';

const SELECTION_BOARD_COMPONENT_PATH = 'pages/teamSelection/componentes/selectionBoard/selectionBoard.html';
const TEAM_SIDE_COMPONENT_PATH = 'pages/teamSelection/componentes/teamSide/teamSide.html';
const POKEMON_LIST_TEMPLATE_PATH = 'components/pokemonList/pokemonList.html';

function fetchHtml(filePath) {
	return fetch(filePath).then(response => {
		if (!response.ok) {
			throw new Error(`Não foi possível carregar ${filePath}.`);
		}

		return response.text();
	});
}

function htmlToElement(html) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	return Array.from(doc.body.children);
}

function shuffleArray(values) {
	const copy = [...values];
	for (let index = copy.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
	}
	return copy;
}

function isValidGuestName(name) {
	return name.trim().length >= 3;
}

function buildRouteSegments(principalName, guestName) {
	return [String(principalName || '').trim(), String(guestName || '').trim()]
		.filter((segment, index) => index === 0 || segment);
}

function resolveGuestName(...values) {
	return values
		.map(value => String(value || '').trim())
		.find(value => value.length > 0) ?? '';
}

export async function initTeamSelectionPage(pokedexElement, routeContext = {}) {
	const matchHandler = new MatchHandler();
	const playerHandler = routeContext.playerHandler;
	const player = playerHandler.getPlayer();
	let match = matchHandler.getMatch();

	if (!player) {
		routeContext.navigateTo?.('register');
		return null;
	}

	const isPrincipalStep = routeContext.route === 'team-main';
	const [principalNameFromPath = player.name, guestNameFromPath = ''] = routeContext.pathSegments ?? [];
	const headerTitle = pokedexElement.querySelector('.pokedex-header-title');
	const leftScreen = pokedexElement.querySelector('.pokedex-screen-left');
	const rightScreen = pokedexElement.querySelector('.pokedex-screen-right');

	if (!match || (isPrincipalStep && match.phase !== 'team-main') || (!isPrincipalStep && match.phase !== 'team-guest')) {
		if (isPrincipalStep) {
			match = matchHandler.createBaseMatch(player, guestNameFromPath);
		} else {
			routeContext.navigateTo?.('team-main', buildRouteSegments(principalNameFromPath, guestNameFromPath));
			return null;
		}
	}

	if (headerTitle) {
		headerTitle.textContent = isPrincipalStep ? 'POKÉTEAMGUESS · TIME PRINCIPAL' : 'POKÉTEAMGUESS · TIME CONVIDADO';
	}

	leftScreen.className = 'pokedex-screen-left team-page team-page--left';
	rightScreen.className = 'pokedex-screen-right team-page team-page--right';

	const [selectionBoardHtml, teamSideHtml, pokemonListHtml] = await Promise.all([
		fetchHtml(SELECTION_BOARD_COMPONENT_PATH),
		fetchHtml(TEAM_SIDE_COMPONENT_PATH),
		fetchHtml(POKEMON_LIST_TEMPLATE_PATH),
	]);

	leftScreen.innerHTML = selectionBoardHtml;
	rightScreen.innerHTML = teamSideHtml;

	const selectionBoardController = setupSelectionBoard(leftScreen, {
		onRandomTeam: () => {
			selectedNames = shuffleArray(pokemonData.map(pokemon => pokemon.name)).slice(0, 6);
			clearStatus();
			renderSelectedTeam();
		},
	});
	const teamSideController = setupTeamSide(rightScreen, {
		onGuestNameInput: value => {
			guestName = value;
			renderSelectedTeam();
		},
		onRemovePokemon: index => {
			handleRemovePokemon(index);
		},
		onReorderPokemon: (fromIndex, toIndex) => {
			handleReorderPokemon(fromIndex, toIndex);
		},
		onPrimaryAction: () => {
			if (selectedNames.length < 6) {
				teamSideController.setStatus('Selecione 6 pokémon antes de continuar.', 'error');
				return;
			}

			persistStep();
		},
	});

	const { pokemonListMount } = selectionBoardController;
	pokemonListMount.replaceChildren(...htmlToElement(pokemonListHtml));

	let selectedNames = isPrincipalStep ? [...match.principal.team] : [...match.guest.team];
	let guestName = resolveGuestName(guestNameFromPath, match.guest.name);
	const principalName = String(principalNameFromPath || match.principal.name || player.name).trim();
	const guestSprite = getGuestSpriteByPlayerPath(match.principal.avatar || player.avatar);

	match.principal.name = principalName;
	match.guest.name = guestName;
	matchHandler.saveMatch(match);

	teamSideController.setContext({
		role: '',
		avatar: isPrincipalStep ? player.avatar : guestSprite.path,
		avatarAlt: isPrincipalStep ? `Avatar de ${principalName}` : 'Avatar do jogador convidado',
		name: isPrincipalStep ? principalName : (guestName || 'Convidado'),
		subtitle: isPrincipalStep ? 'Escolha 6 pokémon para avançar.' : 'O sprite do convidado é definido automaticamente pelo sprite principal.',
		showGuestNameField: false,
		guestName,
		primaryButtonLabel: isPrincipalStep ? 'Próximo' : 'Iniciar partida',
	});

	const pokemonListController = setupPokemonList(pokemonListMount, {
		pokemons: pokemonData,
		selectedNames,
		onSelect: handleAddPokemon,
	});

	function setStatus(message, type = 'info') {
		teamSideController.setStatus(message, type);
	}

	function clearStatus() {
		teamSideController.clearStatus();
	}

	function syncDraftToMatch() {
		if (isPrincipalStep) {
			match.principal.team = [...selectedNames];
			match.guest.name = resolveGuestName(guestName, match.guest.name, guestNameFromPath);
		} else {
			match.guest.team = [...selectedNames];
			match.guest.name = resolveGuestName(guestName, match.guest.name, guestNameFromPath);
			match.guest.avatar = guestSprite.path;
		}

		matchHandler.saveMatch(match);
	}

	function renderSelectedTeam() {
		const selectedPokemons = selectedNames.map(name => getPokemonByName(name)).filter(Boolean);
		teamSideController.setSelectedTeam(selectedPokemons, isPrincipalStep ? principalName : (guestName || 'Convidado'));
		pokemonListController.setSelectedNames(selectedNames);
		syncDraftToMatch();
	}

	function handleAddPokemon(pokemonName) {
		if (selectedNames.length >= 6 || selectedNames.includes(pokemonName)) {
			return;
		}

		selectedNames = [...selectedNames, pokemonName];
		clearStatus();
		renderSelectedTeam();
	}

	function handleRemovePokemon(index) {
		selectedNames = selectedNames.filter((_, itemIndex) => itemIndex !== index);
		clearStatus();
		renderSelectedTeam();
	}

	function handleReorderPokemon(fromIndex, toIndex) {
		if (
			fromIndex < 0
			|| toIndex < 0
			|| fromIndex >= selectedNames.length
			|| toIndex > selectedNames.length
			|| fromIndex === toIndex
		) {
			return;
		}

		const reorderedNames = [...selectedNames];
		const [movedPokemon] = reorderedNames.splice(fromIndex, 1);
		const normalizedTargetIndex = Math.min(toIndex, reorderedNames.length);
		reorderedNames.splice(normalizedTargetIndex, 0, movedPokemon);
		selectedNames = reorderedNames;
		clearStatus();
		renderSelectedTeam();
	}

	function persistStep() {
		if (isPrincipalStep) {
			guestName = resolveGuestName(guestName, match.guest.name, guestNameFromPath);
			match.setPrincipalTeam(selectedNames);
			match.guest.name = guestName;
			matchHandler.saveMatch(match);
			routeContext.navigateTo?.('team-guest', buildRouteSegments(principalName, guestName));
			return;
		}

		guestName = resolveGuestName(guestName, match.guest.name, guestNameFromPath, routeContext.pathSegments?.[1]);

		if (!isValidGuestName(guestName)) {
			setStatus('Volte para a Home e informe um nome válido para o adversário.', 'error');
			return;
		}

		match.setGuestData({
			name: guestName,
			avatar: guestSprite.path,
			team: selectedNames,
		});
		matchHandler.saveMatch(match);
		routeContext.refreshNavigation?.();
		routeContext.navigateTo?.('game', buildRouteSegments(principalName, guestName));
	}

	renderSelectedTeam();
	return null;
}
