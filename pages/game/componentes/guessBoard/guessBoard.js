import { getPokemonByName } from '../../../../config/pokemonData.js';

export function setupGuessBoard(container, callbacks = {}) {
	const opponentSlots = container.querySelector('#gameOpponentSlots');
	const guessForm = container.querySelector('#gameGuessForm');
	const guessSearch = container.querySelector('#gameGuessSearch');
	const guessOptionsList = container.querySelector('#gameGuessOptionsList');
	const guessButton = container.querySelector('#gameGuessButton');
	const feedbackStatus = container.querySelector('#gameGuessFeedbackStatus');
	let availableOptions = [];

	if (!guessForm || !guessSearch || !guessOptionsList || !opponentSlots) {
		throw new Error('Estrutura do painel de adivinhação está incompleta.');
	}

	function normalizeValue(value) {
		return String(value || '').trim().toLowerCase();
	}

	function syncPlaceholder() {
		const placeholderText = guessSearch.dataset.placeholder || guessSearch.getAttribute('placeholder') || '';
		guessSearch.placeholder = placeholderText;
	}

	function hideOptions() {
		guessOptionsList.replaceChildren();
		guessOptionsList.classList.add('is-hidden');
	}

	function showOptions() {
		guessOptionsList.classList.remove('is-hidden');
	}

	function renderOptions(searchTerm = guessSearch.value) {
		const normalizedSearch = normalizeValue(searchTerm);
		const filteredOptions = availableOptions
			.filter(option => option.name.toLowerCase().includes(normalizedSearch));

		if (filteredOptions.length === 0) {
			hideOptions();
			return;
		}

		guessOptionsList.replaceChildren(...filteredOptions.map(option => {
			const item = document.createElement('li');
			item.className = 'game-guess-option';

			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'game-guess-option__button';
			button.setAttribute('role', 'option');
			button.setAttribute('aria-label', option.name);
			button.addEventListener('mousedown', event => {
				event.preventDefault();
				guessSearch.value = option.name;
				hideOptions();
				guessSearch.focus();
			});

			const image = document.createElement('img');
			image.src = option.image_src;
			image.alt = option.name;

			const text = document.createElement('span');
			text.textContent = option.name;

			button.append(image, text);
			item.appendChild(button);
			return item;
		}));

		showOptions();
	}

	guessSearch.value = '';
	syncPlaceholder();

	guessForm.addEventListener('submit', event => {
		event.preventDefault();
		hideOptions();
		callbacks.onSubmitGuess?.(guessSearch.value.trim());
	});

	guessSearch.addEventListener('focus', () => {
		if (!guessSearch.disabled) {
			renderOptions();
		}
	});

	guessSearch.addEventListener('input', () => {
		renderOptions();
	});

	guessSearch.addEventListener('keydown', event => {
		if (event.key === 'Escape') {
			hideOptions();
		}
	});

	container.addEventListener('focusout', event => {
		const nextTarget = event.relatedTarget;
		if (!nextTarget || !guessForm.contains(nextTarget)) {
			hideOptions();
		}
	});

	function setGuessOptions(options = []) {
		availableOptions = options
			.map(option => typeof option === 'string' ? getPokemonByName(option) : option)
			.filter(Boolean);

		if (document.activeElement === guessSearch && !guessSearch.disabled) {
			renderOptions();
			return;
		}

		hideOptions();
	}

	function setOpponentSlots(slots = []) {
		opponentSlots.replaceChildren(...slots);
	}

	function setFeedback(message, type = 'info') {
		if (!feedbackStatus) {
			return;
		}

		feedbackStatus.textContent = message;
		feedbackStatus.className = `game-feedback-status is-${type}`;
	}

	function clearFeedback() {
		if (!feedbackStatus) {
			return;
		}

		feedbackStatus.textContent = '';
		feedbackStatus.className = 'game-feedback-status is-hidden';
	}

	function setDisabled(disabled) {
		guessButton.disabled = disabled;
		guessSearch.disabled = disabled;
		if (disabled) {
			hideOptions();
		}
	}

	function clearGuessInput() {
		guessSearch.value = '';
		syncPlaceholder();
		hideOptions();
	}

	return {
		setGuessOptions,
		setOpponentSlots,
		setFeedback,
		clearFeedback,
		setDisabled,
		clearGuessInput,
	};
}
