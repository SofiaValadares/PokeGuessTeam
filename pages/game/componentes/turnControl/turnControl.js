import { getPokemonByName } from '../../../../config/pokemonData.js';

function createPlaceholderHitSlot() {
	const listItem = document.createElement('li');
	listItem.className = 'game-hit-slot is-empty';

	const placeholder = document.createElement('span');
	placeholder.textContent = '???';
	listItem.appendChild(placeholder);

	return listItem;
}

function createHitSlot(pokemonName = null) {
	if (!pokemonName) {
		return createPlaceholderHitSlot();
	}

	const pokemon = getPokemonByName(pokemonName);

	if (!pokemon) {
		return createPlaceholderHitSlot();
	}

	const listItem = document.createElement('li');
	listItem.className = 'game-hit-slot';

	const image = document.createElement('img');
	image.src = pokemon.image_src;
	image.alt = pokemon.name;
	image.title = pokemon.name;

	listItem.appendChild(image);
	return listItem;
}

export function setupTurnControl(container, callbacks = {}) {
	const primaryPlayerBadge = container.querySelector('#gamePrimaryPlayerBadge');
	const primaryPlayerAvatar = container.querySelector('#gamePrimaryPlayerAvatar');
	const principalScore = container.querySelector('#gamePrincipalScore');
	const primaryPlayerCard = container.querySelector('#gamePrimaryPlayerCard');
	const guestPlayerBadge = container.querySelector('#gameGuestPlayerBadge');
	const guestPlayerAvatar = container.querySelector('#gameGuestPlayerAvatar');
	const guestScore = container.querySelector('#gameGuestScore');
	const guestPlayerCard = container.querySelector('#gameGuestPlayerCard');
	const opponentHitsTitle = container.querySelector('#gameOpponentHitsTitle');
	const opponentHits = container.querySelector('#gameOpponentHits');
	const surrenderButton = container.querySelector('#gameSurrenderButton');
	const startDialog = container.querySelector('#gameStartDialog');
	const startDialogMessage = container.querySelector('#gameStartDialogMessage');
	const startDialogButton = container.querySelector('#gameStartDialogButton');
	const surrenderDialog = container.querySelector('#gameSurrenderDialog');
	const surrenderCancelButton = container.querySelector('#gameSurrenderCancelButton');
	const surrenderConfirmButton = container.querySelector('#gameSurrenderConfirmButton');
	const endDialog = container.querySelector('#gameEndDialog');
	const endDialogMessage = container.querySelector('#gameEndDialogMessage');

	if (!primaryPlayerBadge || !guestPlayerBadge || !surrenderButton) {
		throw new Error('Estrutura do painel de controle da partida está incompleta.');
	}

	surrenderButton.addEventListener('click', () => callbacks.onAskSurrender?.());
	startDialogButton?.addEventListener('click', () => callbacks.onCloseStart?.());
	surrenderCancelButton?.addEventListener('click', () => callbacks.onCancelSurrender?.());
	surrenderConfirmButton?.addEventListener('click', () => callbacks.onConfirmSurrender?.());

	function setPlayers(match) {
		const currentPlayerKey = match.currentTurn;
		const opponentPlayer = match.getOpponent(currentPlayerKey);
		const hitSlots = [];
		const maxSlots = Math.max(opponentPlayer.team.length, 6);

		primaryPlayerBadge.textContent = match.principal.name;
		primaryPlayerAvatar.src = match.principal.avatar;
		primaryPlayerAvatar.alt = `Avatar de ${match.principal.name}`;
		principalScore.textContent = String(match.principal.hits.length);
		guestPlayerBadge.textContent = match.guest.name;
		guestPlayerAvatar.src = match.guest.avatar;
		guestPlayerAvatar.alt = `Avatar de ${match.guest.name}`;
		guestScore.textContent = String(match.guest.hits.length);
		primaryPlayerCard.classList.toggle('game-player-card--active', match.currentTurn === 'principal');
		guestPlayerCard.classList.toggle('game-player-card--active', match.currentTurn === 'guest');

		if (opponentHitsTitle) {
			opponentHitsTitle.textContent = opponentPlayer.name;
		}

		for (let index = 0; index < maxSlots; index += 1) {
			hitSlots.push(createHitSlot(opponentPlayer.hits[index] ?? null));
		}

		opponentHits?.replaceChildren(...hitSlots);
	}

	function openStartDialog(message) {
		startDialogMessage.textContent = message;
		if (typeof startDialog.showModal === 'function') {
			startDialog.showModal();
			return;
		}
		startDialog.setAttribute('open', 'open');
	}

	function closeStartDialog() {
		startDialog.close?.();
		startDialog.removeAttribute('open');
	}

	function openSurrenderDialog() {
		if (typeof surrenderDialog.showModal === 'function') {
			surrenderDialog.showModal();
			return;
		}
		surrenderDialog.setAttribute('open', 'open');
	}

	function closeSurrenderDialog() {
		surrenderDialog.close?.();
		surrenderDialog.removeAttribute('open');
	}

	function openEndDialog(message) {
		endDialogMessage.textContent = message;
		if (typeof endDialog.showModal === 'function') {
			endDialog.showModal();
			return;
		}
		endDialog.setAttribute('open', 'open');
	}

	function closeEndDialog() {
		endDialog.close?.();
		endDialog.removeAttribute('open');
	}

	return {
		setPlayers,
		openStartDialog,
		closeStartDialog,
		openSurrenderDialog,
		closeSurrenderDialog,
		openEndDialog,
		closeEndDialog,
	};
}
