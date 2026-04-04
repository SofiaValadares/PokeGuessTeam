import Player from '../../models/Player.js';
import { PLAYER_SPRITES, getPlayerSpriteByPath } from '../../enums/PlayerSpriteEnum.js';
import PlayerHandler from '../../store/PlayerHandler.js';
import { setupChoseSprite } from './componentes/choseSprite/choseSprite.js';
import { REGISTER_FORM_MODES, setupPlayerForm } from './componentes/playerForm/playerForm.js';

const SPRITE_COMPONENT_PATH = 'pages/register/componentes/choseSprite/choseSprite.html';
const PLAYER_FORM_COMPONENT_PATH = 'pages/register/componentes/playerForm/playerForm.html';

function fetchHtml(filePath) {
	return fetch(filePath).then(response => {
		if (!response.ok) {
			throw new Error(`Não foi possível carregar ${filePath}.`);
		}

		return response.text();
	});
}

function createEmptyDraft() {
	return {
		name: '',
		avatar: PLAYER_SPRITES[0].path,
		team: [],
		experience: 0,
		history: [],
	};
}

function normalizeName(name) {
	return name.trim().replace(/\s+/g, ' ');
}

export async function initRegisterPage(pokedexElement, routeContext = {}) {
	const headerTitle = pokedexElement.querySelector('.pokedex-header-title');
	const leftScreen = pokedexElement.querySelector('.pokedex-screen-left');
	const rightScreen = pokedexElement.querySelector('.pokedex-screen-right');
	const playerHandler = routeContext.playerHandler ?? new PlayerHandler();
	const existingPlayer = playerHandler.getPlayer();

	if (existingPlayer) {
		routeContext.refreshNavigation?.();
		routeContext.navigateTo?.('home');
		return;
	}

	if (headerTitle) {
		headerTitle.textContent = 'POKÉTEAMGUESS · REGISTRO';
	}

	leftScreen.className = 'pokedex-screen-left register-screen-panel register-screen-panel--left';
	rightScreen.className = 'pokedex-screen-right register-screen-panel register-screen-panel--right';

	const [spriteHtml, playerFormHtml] = await Promise.all([
		fetchHtml(SPRITE_COMPONENT_PATH),
		fetchHtml(PLAYER_FORM_COMPONENT_PATH),
	]);

	leftScreen.innerHTML = spriteHtml;
	rightScreen.innerHTML = playerFormHtml;

	let draftPlayer = createEmptyDraft();
	let currentStatus = null;

	const spriteController = setupChoseSprite(leftScreen, {
		selectedSpriteId: getPlayerSpriteByPath(draftPlayer.avatar).id,
		disabled: false,
		onSelect: sprite => {
			draftPlayer.avatar = sprite.path;
		},
	});

	const formController = setupPlayerForm(rightScreen, {
		onCreate: handleCreate,
	});

	function setStatus(message, type) {
		currentStatus = { message, type };
	}

	function render() {
		const selectedSprite = getPlayerSpriteByPath(draftPlayer.avatar);

		spriteController.setSelected(selectedSprite.id);
		spriteController.setDisabled(false);

		formController.setMode(REGISTER_FORM_MODES.CREATE);
		formController.setName(draftPlayer.name ?? '');
		formController.setSummary(playerHandler.buildProfileSummary(draftPlayer));

		if (currentStatus) {
			formController.setStatus(currentStatus.message, currentStatus.type);
		} else {
			formController.clearStatus();
		}
	}

	function validateName(rawName) {
		const name = normalizeName(rawName);

		if (!name) {
			setStatus('Digite um nome para criar o perfil.', 'error');
			render();
			formController.focusName();
			return null;
		}

		if (name.length < 3) {
			setStatus('Use pelo menos 3 caracteres no nome do jogador.', 'error');
			render();
			formController.focusName();
			return null;
		}

		return name;
	}

	function handleCreate(rawName) {
		const name = validateName(rawName);

		if (!name) {
			return;
		}

		const newPlayer = new Player({
			name,
			avatar: draftPlayer.avatar,
			team: [],
			experience: 0,
			history: [],
		});

		playerHandler.savePlayer(newPlayer);
		routeContext.refreshNavigation?.();
		routeContext.navigateTo?.('home');
	}

	render();
	formController.focusName();
}
