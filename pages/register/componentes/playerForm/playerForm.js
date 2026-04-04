export const REGISTER_FORM_MODES = {
	CREATE: 'create',
};

export function setupPlayerForm(container, callbacks = {}) {
	const form = container.querySelector('#registerPlayerForm');
	const nameInput = container.querySelector('#registerPlayerName');
	const statusElement = container.querySelector('#registerFormStatus');
	const createButton = container.querySelector('#registerCreateButton');

	let currentMode = REGISTER_FORM_MODES.CREATE;

	if (!form || !nameInput || !statusElement) {
		throw new Error('Estrutura do formulário de registro está incompleta.');
	}

	function triggerCreate() {
		callbacks.onCreate?.(getName());
	}

	form.addEventListener('submit', event => {
		event.preventDefault();
		triggerCreate();
	});

	createButton?.addEventListener('click', event => {
		event.preventDefault();
		triggerCreate();
	});

	function getName() {
		return nameInput.value.trim();
	}

	function setMode(mode) {
		currentMode = mode;
		nameInput.disabled = mode !== REGISTER_FORM_MODES.CREATE;
	}

	function setName(name) {
		nameInput.value = name ?? '';
	}

	function focusName() {
		nameInput.focus();
		nameInput.select();
	}

	function setStatus(message, type = 'info') {
		statusElement.textContent = message;
		statusElement.classList.remove('is-hidden', 'is-success', 'is-error', 'is-info');
		statusElement.classList.add(`is-${type}`);
	}

	function clearStatus() {
		statusElement.textContent = '';
		statusElement.classList.add('is-hidden');
		statusElement.classList.remove('is-success', 'is-error', 'is-info');
	}

	function setSummary() {}

	return {
		setMode,
		setName,
		getName,
		focusName,
		setStatus,
		clearStatus,
		setSummary,
	};
}
