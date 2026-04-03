export function setupTeamSelector(container, {
	selectedPokemons = [],
	maxTeamSize = 6,
	onRemove,
	onRandomize,
	onClear,
} = {}) {
	const slotsList = container.querySelector('#teamSelectorSlots');
	const randomButton = container.querySelector('#teamSelectorRandomButton');
	const clearButton = container.querySelector('#teamSelectorClearButton');
	let currentSelectedPokemons = [...selectedPokemons];

	function createEmptySlot(index) {
		const listItem = document.createElement('li');
		listItem.className = 'team-selector-slot team-selector-slot--empty';

		const slotIndex = document.createElement('span');
		slotIndex.className = 'team-selector-slot__index';
		slotIndex.textContent = `Slot ${index + 1}`;

		const slotText = document.createElement('strong');
		slotText.textContent = 'Vazio';

		listItem.append(slotIndex, slotText);
		return listItem;
	}

	function createFilledSlot(pokemon, index) {
		const listItem = document.createElement('li');
		listItem.className = 'team-selector-slot';

		const top = document.createElement('div');
		top.className = 'team-selector-slot__top';

		const slotIndex = document.createElement('span');
		slotIndex.className = 'team-selector-slot__index';
		slotIndex.textContent = `Slot ${index + 1}`;

		const removeButton = document.createElement('button');
		removeButton.type = 'button';
		removeButton.className = 'team-selector-slot__remove';
		removeButton.textContent = '×';
		removeButton.ariaLabel = `Remover ${pokemon.name}`;
		removeButton.addEventListener('click', () => {
			onRemove?.(index);
		});

		top.append(slotIndex, removeButton);

		const content = document.createElement('div');
		content.className = 'team-selector-slot__content';

		const image = document.createElement('img');
		image.src = pokemon.image_src;
		image.alt = pokemon.name;

		const textWrap = document.createElement('div');
		const name = document.createElement('strong');
		name.textContent = pokemon.name;
		const subtitle = document.createElement('small');
		subtitle.textContent = pokemon.secondary_type
			? `${pokemon.primary_type} · ${pokemon.secondary_type}`
			: pokemon.primary_type;

		textWrap.append(name, subtitle);
		content.append(image, textWrap);
		listItem.append(top, content);
		return listItem;
	}

	function render() {
		slotsList.replaceChildren();

		for (let index = 0; index < maxTeamSize; index += 1) {
			const pokemon = currentSelectedPokemons[index];
			slotsList.appendChild(pokemon ? createFilledSlot(pokemon, index) : createEmptySlot(index));
		}
	}

	randomButton.addEventListener('click', () => {
		onRandomize?.();
	});

	clearButton.addEventListener('click', () => {
		onClear?.();
	});

	render();

	return {
		setSelectedPokemons(nextSelectedPokemons) {
			currentSelectedPokemons = [...nextSelectedPokemons];
			render();
		},
	};
}
