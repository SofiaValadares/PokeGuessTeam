export function setupControlSide(container, callbacks = {}) {
	const avatar = container.querySelector('#homePlayerAvatar');
	const nameElement = container.querySelector('#homePlayerName');
	const levelElement = container.querySelector('#homePlayerLevel');
	const xpChip = container.querySelector('#homePlayerXpChip');
	const matchesChip = container.querySelector('#homePlayerMatchesChip');
	const currentXp = container.querySelector('#homeCurrentXp');
	const nextXp = container.querySelector('#homeNextXp');
	const progressBar = container.querySelector('#homeSummaryProgressBar');
	const progressText = container.querySelector('#homeSummaryProgressText');
	const wins = container.querySelector('#homeWins');
	const draws = container.querySelector('#homeDraws');
	const losses = container.querySelector('#homeLosses');
	const deleteProfileButton = container.querySelector('#homeEditProfileButton');
	const startMatchButton = container.querySelector('#homeStartMatchButton');
	const continueMatchButton = container.querySelector('#homeContinueMatchButton');
	const currentMatchCard = container.querySelector('#homeCurrentMatchCard');
	const currentMatchButton = container.querySelector('#homeCurrentMatchButton');
	const currentMatchDescription = container.querySelector('#homeCurrentMatchDescription');
	const currentMatchScore = container.querySelector('#homeCurrentMatchScore');
	const currentMatchTurn = container.querySelector('#homeCurrentMatchTurn');
	const deleteProfileDialog = container.querySelector('#homeDeleteProfileDialog');
	const deleteProfileCancelButton = container.querySelector('#homeDeleteProfileCancelButton');
	const deleteProfileConfirmButton = container.querySelector('#homeDeleteProfileConfirmButton');
	const startMatchDialog = container.querySelector('#homeStartMatchDialog');
	const guestNameInput = container.querySelector('#homeGuestNameInput');
	const startMatchError = container.querySelector('#homeStartMatchError');
	const startMatchCancelButton = container.querySelector('#homeStartMatchCancelButton');
	const startMatchConfirmButton = container.querySelector('#homeStartMatchConfirmButton');

	if (!avatar || !nameElement || !deleteProfileButton || !startMatchButton || !continueMatchButton) {
		throw new Error('Estrutura do painel lateral da Home está incompleta.');
	}

	function openDialog(dialog) {
		if (typeof dialog?.showModal === 'function') {
			dialog.showModal();
			return;
		}

		dialog?.setAttribute('open', 'open');
	}

	function closeDialog(dialog) {
		dialog?.close?.();
		dialog?.removeAttribute('open');
	}

	function setStartMatchError(message = '') {
		if (!startMatchError) {
			return;
		}

		startMatchError.textContent = message;
		startMatchError.classList.toggle('is-hidden', !message);
	}

	deleteProfileButton.addEventListener('click', () => {
		openDialog(deleteProfileDialog);
	});

	deleteProfileCancelButton?.addEventListener('click', () => {
		closeDialog(deleteProfileDialog);
	});

	deleteProfileConfirmButton?.addEventListener('click', () => {
		closeDialog(deleteProfileDialog);
		callbacks.onDeleteProfile?.();
	});

	startMatchButton.addEventListener('click', () => {
		guestNameInput.value = '';
		setStartMatchError('');
		openDialog(startMatchDialog);
		window.setTimeout(() => guestNameInput?.focus(), 0);
	});

	startMatchCancelButton?.addEventListener('click', () => {
		closeDialog(startMatchDialog);
		setStartMatchError('');
	});

	startMatchConfirmButton?.addEventListener('click', () => {
		const guestName = guestNameInput?.value.trim() ?? '';

		if (guestName.length < 3) {
			setStartMatchError('Digite pelo menos 3 caracteres para o nome do adversário.');
			guestNameInput?.focus();
			return;
		}

		setStartMatchError('');
		closeDialog(startMatchDialog);
		callbacks.onStartMatch?.(guestName);
	});

	guestNameInput?.addEventListener('input', () => {
		if ((guestNameInput.value || '').trim().length >= 3) {
			setStartMatchError('');
		}
	});

	continueMatchButton.addEventListener('click', () => {
		callbacks.onContinueMatch?.();
	});

	currentMatchButton?.addEventListener('click', () => {
		callbacks.onContinueMatch?.();
	});

	function setProfileSummary(summary) {
		avatar.src = summary.avatar;
		avatar.alt = `Avatar de ${summary.name}`;
		nameElement.textContent = summary.name;
		levelElement.textContent = `Nível ${summary.level}`;

		if (xpChip) {
			xpChip.textContent = `${summary.experience} XP`;
		}

		if (matchesChip) {
			matchesChip.textContent = `${summary.totalMatches} partidas`;
		}

		if (currentXp) {
			currentXp.textContent = `${summary.currentLevelXp} XP`;
		}

		if (nextXp) {
			nextXp.textContent = `${summary.nextLevelXp} XP`;
		}

		const progressPercent = summary.nextLevelXp > 0
			? Math.min((summary.currentLevelXp / summary.nextLevelXp) * 100, 100)
			: 0;

		if (progressBar) {
			progressBar.style.width = `${progressPercent}%`;
		}

		if (progressText) {
			progressText.textContent = `${summary.currentLevelXp} / ${summary.nextLevelXp} XP no nível atual`;
		}

		if (wins) {
			wins.textContent = String(summary.wins ?? 0);
		}

		if (draws) {
			draws.textContent = String(summary.draws ?? 0);
		}

		if (losses) {
			losses.textContent = String(summary.losses ?? 0);
		}
	}

	function setContinuableMatch(matchSummary = null) {
		const hasMatch = Boolean(matchSummary);
		continueMatchButton.classList.toggle('is-hidden', !hasMatch);
		currentMatchCard.classList.toggle('is-hidden', !hasMatch);

		if (!hasMatch) {
			return;
		}

		continueMatchButton.textContent = matchSummary.buttonLabel;
		if (currentMatchButton) {
			currentMatchButton.textContent = matchSummary.buttonLabel;
		}
		currentMatchDescription.textContent = matchSummary.description;
		currentMatchScore.textContent = matchSummary.scoreText;
		currentMatchTurn.textContent = matchSummary.turnText;
	}

	return {
		setProfileSummary,
		setContinuableMatch,
	};
}
