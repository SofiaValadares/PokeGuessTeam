export function setupGuessBoard(container, callbacks = {}) {
	const guessTitle = container.querySelector('#gameGuessTitle');
	const guessSubtitle = container.querySelector('#gameGuessSubtitle');
	const currentTurnLabel = container.querySelector('#gameCurrentTurnLabel');
	const roundStatus = container.querySelector('#gameRoundStatus');
	const guessedCount = container.querySelector('#gameGuessedCount');
	const opponentSlots = container.querySelector('#gameOpponentSlots');
	const guessForm = container.querySelector('#gameGuessForm');
	const guessSearch = container.querySelector('#gameGuessSearch');
	const guessOptions = container.querySelector('#gameGuessOptions');
	const guessButton = container.querySelector('#gameGuessButton');
	const feedbackStatus = container.querySelector('#gameGuessFeedbackStatus');

	if (!guessTitle || !guessForm || !guessSearch || !guessOptions || !opponentSlots) {
		throw new Error('Estrutura do painel de adivinhação está incompleta.');
	}

	function syncPlaceholder() {
		const placeholderText = guessSearch.dataset.placeholder || guessSearch.getAttribute('placeholder') || '';
		guessSearch.placeholder = placeholderText;
	}

	guessSearch.value = '';
	syncPlaceholder();

	guessSearch.addEventListener('input', () => {
		clearFeedback();
	});

	guessForm.addEventListener('submit', event => {
		event.preventDefault();
		callbacks.onSubmitGuess?.(guessSearch.value.trim());
	});

	function setTurnInfo({ title, subtitle, currentTurn, roundLabel, guessedCountText }) {
		guessTitle.textContent = title;
		guessSubtitle.textContent = subtitle;
		currentTurnLabel.textContent = currentTurn;
		roundStatus.textContent = roundLabel;
		guessedCount.textContent = guessedCountText;
	}

	function setGuessOptions(options = []) {
		guessOptions.replaceChildren(...options.map(name => {
			const option = document.createElement('option');
			option.value = name;
			return option;
		}));
	}

	function setOpponentSlots(slots = []) {
		opponentSlots.replaceChildren(...slots);
	}

	function setFeedback(message, type = 'info') {
		feedbackStatus.textContent = message;
		feedbackStatus.className = `game-feedback-status is-${type}`;
	}

	function clearFeedback() {
		feedbackStatus.textContent = '';
		feedbackStatus.className = 'game-feedback-status is-hidden';
	}

	function setDisabled(disabled) {
		guessButton.disabled = disabled;
		guessSearch.disabled = disabled;
	}

	function clearGuessInput() {
		guessSearch.value = '';
		syncPlaceholder();
	}

	return {
		setTurnInfo,
		setGuessOptions,
		setOpponentSlots,
		setFeedback,
		clearFeedback,
		setDisabled,
		clearGuessInput,
	};
}
