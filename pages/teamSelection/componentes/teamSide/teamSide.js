function createTextBlock(pokemon, index, onRemove) {
	const wrapper = document.createElement('li');
	wrapper.className = 'team-sidebar-team__item';

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
		onRemove?.(index);
	});

	const small = document.createElement('small');
	small.textContent = pokemon.secondary_type
		? `${pokemon.primary_type} · ${pokemon.secondary_type}`
		: pokemon.primary_type;

	text.append(strong, small);
	info.append(image, text);
	top.append(info, removeButton);
	wrapper.append(top);
	return wrapper;
}

export function setupTeamSide(container, callbacks = {}) {
	const sidebarAvatar = container.querySelector('#teamSidebarAvatar');
	const sidebarRole = container.querySelector('#teamSidebarRole');
	const sidebarName = container.querySelector('#teamSidebarName');
	const sidebarSubtitle = container.querySelector('#teamSidebarSubtitle');
	const guestNameField = container.querySelector('#teamGuestNameField');
	const guestNameInput = container.querySelector('#teamGuestNameInput');
	const sidebarCount = container.querySelector('#teamSidebarCount');
	const sidebarTeamList = container.querySelector('#teamSidebarTeamList');
	const sidebarStatus = container.querySelector('#teamSidebarStatus');
	const primaryButton = container.querySelector('#teamSidebarPrimaryButton');
	const backButton = container.querySelector('#teamSidebarBackButton');

	if (!sidebarAvatar || !sidebarRole || !sidebarName || !sidebarTeamList || !primaryButton || !backButton) {
		throw new Error('Estrutura da lateral da seleção de time está incompleta.');
	}

	guestNameInput?.addEventListener('input', event => {
		callbacks.onGuestNameInput?.(event.target.value);
	});

	primaryButton.addEventListener('click', () => {
		callbacks.onPrimaryAction?.();
	});

	backButton.addEventListener('click', () => {
		callbacks.onBack?.();
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
		backButtonLabel,
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
		backButton.textContent = backButtonLabel;
	}

	function setSelectedTeam(selectedPokemons = [], displayName = 'Treinador') {
		sidebarCount.textContent = `${selectedPokemons.length} / 6`;
		sidebarName.textContent = displayName;
		sidebarTeamList.replaceChildren(...(selectedPokemons.length > 0
			? selectedPokemons.map((pokemon, index) => createTextBlock(pokemon, index, callbacks.onRemovePokemon))
			: [createEmptyState()]
		));
	}

	function createEmptyState() {
		const wrapper = document.createElement('li');
		wrapper.className = 'team-sidebar-team__item is-empty';
		const strong = document.createElement('strong');
		strong.textContent = 'Nenhum pokémon selecionado';
		const small = document.createElement('small');
		small.textContent = 'Adicione 6 pokémon para continuar.';
		wrapper.append(strong, small);
		return wrapper;
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
