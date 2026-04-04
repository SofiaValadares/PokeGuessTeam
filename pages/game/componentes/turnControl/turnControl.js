function createTextItem(text, empty = false) {
	const listItem = document.createElement('li');
	listItem.textContent = text;
	listItem.classList.toggle('is-empty', empty);
	return listItem;
}

export function setupTurnControl(container, callbacks = {}) {
	const primaryPlayerBadge = container.querySelector('#gamePrimaryPlayerBadge');
	const primaryPlayerAvatar = container.querySelector('#gamePrimaryPlayerAvatar');
	const principalScore = container.querySelector('#gamePrincipalScore');
	const primaryHitsTitle = container.querySelector('#gamePrimaryHitsTitle');
	const primaryHits = container.querySelector('#gamePrimaryHits');
	const primaryPlayerCard = container.querySelector('#gamePrimaryPlayerCard');
	const guestPlayerBadge = container.querySelector('#gameGuestPlayerBadge');
	const guestPlayerAvatar = container.querySelector('#gameGuestPlayerAvatar');
	const guestScore = container.querySelector('#gameGuestScore');
	const guestHitsTitle = container.querySelector('#gameGuestHitsTitle');
	const guestHits = container.querySelector('#gameGuestHits');
	const guestPlayerCard = container.querySelector('#gameGuestPlayerCard');
	const goHomeButton = container.querySelector('#gameGoHomeButton');
	const surrenderButton = container.querySelector('#gameSurrenderButton');
	const startDialog = container.querySelector('#gameStartDialog');
	const startDialogMessage = container.querySelector('#gameStartDialogMessage');
	const startDialogButton = container.querySelector('#gameStartDialogButton');
	const surrenderDialog = container.querySelector('#gameSurrenderDialog');
	const surrenderCancelButton = container.querySelector('#gameSurrenderCancelButton');
	const surrenderConfirmButton = container.querySelector('#gameSurrenderConfirmButton');
	const endDialog = container.querySelector('#gameEndDialog');
	const endDialogMessage = container.querySelector('#gameEndDialogMessage');
	const endDialogButton = container.querySelector('#gameEndDialogButton');

	if (!primaryPlayerBadge || !guestPlayerBadge || !goHomeButton || !surrenderButton) {
		throw new Error('Estrutura do painel de controle da partida está incompleta.');
	}

	goHomeButton.addEventListener('click', () => callbacks.onGoHome?.());
	surrenderButton.addEventListener('click', () => callbacks.onAskSurrender?.());
	startDialogButton?.addEventListener('click', () => callbacks.onCloseStart?.());
	endDialogButton?.addEventListener('click', () => callbacks.onCloseEnd?.());
	surrenderCancelButton?.addEventListener('click', () => callbacks.onCancelSurrender?.());
	surrenderConfirmButton?.addEventListener('click', () => callbacks.onConfirmSurrender?.());

	function setPlayers(match) {
		primaryPlayerBadge.textContent = match.principal.name;
		primaryPlayerAvatar.src = match.principal.avatar;
		primaryPlayerAvatar.alt = `Avatar de ${match.principal.name}`;
		principalScore.textContent = String(match.principal.hits.length);
		if (primaryHitsTitle) {
			primaryHitsTitle.textContent = match.principal.name;
		}
		guestPlayerBadge.textContent = match.guest.name;
		guestPlayerAvatar.src = match.guest.avatar;
		guestPlayerAvatar.alt = `Avatar de ${match.guest.name}`;
		guestScore.textContent = String(match.guest.hits.length);
		if (guestHitsTitle) {
			guestHitsTitle.textContent = match.guest.name;
		}
		primaryPlayerCard.classList.toggle('game-player-card--active', match.currentTurn === 'principal');
		guestPlayerCard.classList.toggle('game-player-card--active', match.currentTurn === 'guest');
		primaryHits.replaceChildren(...(match.principal.hits.length > 0
			? match.principal.hits.map(name => createTextItem(name))
			: [createTextItem('Nenhum acerto ainda.', true)]));
		guestHits.replaceChildren(...(match.guest.hits.length > 0
			? match.guest.hits.map(name => createTextItem(name))
			: [createTextItem('Nenhum acerto ainda.', true)]));
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
