function createTextBlock(pokemon, index, callbacks = {}) {
	const wrapper = document.createElement('li');
	wrapper.className = 'team-sidebar-team__item';
	wrapper.draggable = true;
	wrapper.dataset.teamIndex = String(index);

	const top = document.createElement('div');
	top.className = 'team-sidebar-team__item-top';

	const info = document.createElement('div');
	info.className = 'team-sidebar-team__item-info';

	const image = document.createElement('img');
	image.className = 'team-sidebar-team__item-image';
	image.src = pokemon.image_src;
	image.alt = pokemon.name;

	const text = document.createElement('div');
	text.className = 'team-sidebar-team__item-text';

	const strong = document.createElement('strong');
	strong.textContent = pokemon.name;

	const removeButton = document.createElement('button');
	removeButton.type = 'button';
	removeButton.className = 'team-sidebar-team__remove';
	removeButton.textContent = 'Remover';
	removeButton.addEventListener('click', () => {
		callbacks.onRemovePokemon?.(index);
	});

	const small = document.createElement('small');
	small.textContent = pokemon.secondary_type
		? `${pokemon.primary_type} · ${pokemon.secondary_type}`
		: pokemon.primary_type;

	wrapper.addEventListener('dragstart', event => {
		event.dataTransfer?.setData('text/plain', String(index));
		event.dataTransfer.effectAllowed = 'move';
		wrapper.classList.add('is-dragging');
	});

	wrapper.addEventListener('dragend', () => {
		wrapper.classList.remove('is-dragging');
	});

	wrapper.addEventListener('dragover', event => {
		event.preventDefault();
		wrapper.classList.add('is-drop-target');
	});

	wrapper.addEventListener('dragleave', () => {
		wrapper.classList.remove('is-drop-target');
	});

	wrapper.addEventListener('drop', event => {
		event.preventDefault();
		wrapper.classList.remove('is-drop-target');
		const fromIndex = Number(event.dataTransfer?.getData('text/plain'));

		if (Number.isNaN(fromIndex) || fromIndex === index) {
			return;
		}

		callbacks.onReorderPokemon?.(fromIndex, index);
	});

	text.append(strong, small);
	info.append(image, text);
	top.append(info, removeButton);
	wrapper.append(top);
	return wrapper;
}

function createEmptySlot(index, callbacks = {}) {
	const wrapper = document.createElement('li');
	wrapper.className = 'team-sidebar-team__item team-sidebar-team__item--empty-slot';
	wrapper.dataset.teamIndex = String(index);

	const plus = document.createElement('span');
	plus.className = 'team-sidebar-team__empty-plus';
	plus.textContent = '+';

	const text = document.createElement('small');
	text.className = 'team-sidebar-team__empty-text';
	text.textContent = 'Espaço vazio';

	wrapper.append(plus, text);

	wrapper.addEventListener('dragover', event => {
		event.preventDefault();
		wrapper.classList.add('is-drop-target');
	});

	wrapper.addEventListener('dragleave', () => {
		wrapper.classList.remove('is-drop-target');
	});

	wrapper.addEventListener('drop', event => {
		event.preventDefault();
		wrapper.classList.remove('is-drop-target');
		const fromIndex = Number(event.dataTransfer?.getData('text/plain'));

		if (Number.isNaN(fromIndex) || fromIndex === index) {
			return;
		}

		callbacks.onReorderPokemon?.(fromIndex, index);
	});

	return wrapper;
}

export function setupTeamSide(container, callbacks = {}) {
	const sidebarAvatar = container.querySelector('#teamSidebarAvatar');
	const sidebarRole = container.querySelector('#teamSidebarRole');
	const sidebarName = container.querySelector('#teamSidebarName');
	const sidebarSubtitle = container.querySelector('#teamSidebarSubtitle');
	const guestNameField = container.querySelector('#teamGuestNameField');
	const guestNameInput = container.querySelector('#teamGuestNameInput');
	const sidebarTeamList = container.querySelector('#teamSidebarTeamList');
	const sidebarStatus = container.querySelector('#teamSidebarStatus');
	const primaryButton = container.querySelector('#teamSidebarPrimaryButton');

	if (!sidebarAvatar || !sidebarRole || !sidebarName || !sidebarTeamList || !primaryButton) {
		throw new Error('Estrutura da lateral da seleção de time está incompleta.');
	}

	guestNameInput?.addEventListener('input', event => {
		callbacks.onGuestNameInput?.(event.target.value);
	});

	primaryButton.addEventListener('click', () => {
		callbacks.onPrimaryAction?.();
	});

	function setContext({
		role,
		avatar,
		avatarAlt,
		name,
		subtitle,
		showGuestNameField,
		guestName,
		primaryButtonLabel,
	}) {
		sidebarRole.textContent = role;
		sidebarAvatar.src = avatar;
		sidebarAvatar.alt = avatarAlt;
		sidebarName.textContent = name;
		sidebarSubtitle.textContent = subtitle;
		guestNameField?.classList.toggle('is-hidden', !showGuestNameField);
		if (guestNameField) {
			guestNameField.hidden = !showGuestNameField;
			guestNameField.setAttribute('aria-hidden', String(!showGuestNameField));
			guestNameField.style.display = showGuestNameField ? 'flex' : 'none';
		}

		if (guestNameInput) {
			guestNameInput.value = guestName ?? '';
		}

		if (!showGuestNameField) {
			guestNameInput?.blur();
		}

		primaryButton.textContent = primaryButtonLabel;
	}

	function setSelectedTeam(selectedPokemons = [], displayName = 'Treinador') {
		sidebarName.textContent = displayName;
		primaryButton.disabled = selectedPokemons.length < 6;

		const slotNodes = Array.from({ length: 6 }, (_, index) => {
			const pokemon = selectedPokemons[index];

			if (pokemon) {
				return createTextBlock(pokemon, index, callbacks);
			}

			return createEmptySlot(index, callbacks);
		});

		sidebarTeamList.replaceChildren(...slotNodes);
	}

	function setStatus(message, type = 'info') {
		sidebarStatus.textContent = message;
		sidebarStatus.className = `team-sidebar-status is-${type}`;
	}

	function clearStatus() {
		sidebarStatus.textContent = '';
		sidebarStatus.className = 'team-sidebar-status is-hidden';
	}

	function getGuestName() {
		return guestNameInput?.value.trim() ?? '';
	}

	function focusGuestName() {
		guestNameInput?.focus();
	}

	return {
		setContext,
		setSelectedTeam,
		setStatus,
		clearStatus,
		getGuestName,
		focusGuestName,
	};
}
