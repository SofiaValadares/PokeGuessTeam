export function setupPokemonList(container, {
	pokemons = [],
	selectedNames = [],
	onSelect,
} = {}) {
	const searchInput = container.querySelector('#pokemonSearchInput');
	const generationFilter = container.querySelector('#pokemonGenerationFilter');
	const listGrid = container.querySelector('#pokemonListGrid');
	const emptyState = container.querySelector('#pokemonListEmptyState');

	let currentSelectedNames = [...selectedNames];
	let searchTerm = '';
	let generationValue = 'all';

	const uniqueGenerations = [...new Set(pokemons.map(pokemon => pokemon.generation))].sort((a, b) => a - b);
	uniqueGenerations.forEach(generation => {
		const option = document.createElement('option');
		option.value = String(generation);
		option.textContent = `Geração ${generation}`;
		generationFilter.appendChild(option);
	});

	function createPokemonCard(pokemon) {
		const listItem = document.createElement('li');
		listItem.className = 'pokemon-list-item';

		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'pokemon-card-button';
		button.disabled = currentSelectedNames.includes(pokemon.name);
		button.classList.toggle('is-disabled', button.disabled);

		const image = document.createElement('img');
		image.src = pokemon.image_src;
		image.alt = pokemon.name;

		const name = document.createElement('strong');
		name.textContent = pokemon.name;

		const generation = document.createElement('small');
		generation.textContent = `Geração ${pokemon.generation}`;

		const types = document.createElement('span');
		types.textContent = pokemon.secondary_type
			? `${pokemon.primary_type} · ${pokemon.secondary_type}`
			: pokemon.primary_type;

		button.append(image, name, generation, types);
		button.addEventListener('click', () => {
			if (button.disabled) {
				return;
			}

			onSelect?.(pokemon.name);
		});

		listItem.appendChild(button);
		return listItem;
	}

	function filterPokemons() {
		return pokemons.filter(pokemon => {
			const matchesName = pokemon.name.toLowerCase().includes(searchTerm);
			const matchesGeneration = generationValue === 'all' || String(pokemon.generation) === generationValue;
			return matchesName && matchesGeneration;
		});
	}

	function render() {
		listGrid.replaceChildren();
		const filteredPokemons = filterPokemons();

		filteredPokemons.forEach(pokemon => {
			listGrid.appendChild(createPokemonCard(pokemon));
		});

		emptyState.classList.toggle('is-hidden', filteredPokemons.length > 0);
	}

	searchInput.addEventListener('input', event => {
		searchTerm = event.target.value.trim().toLowerCase();
		render();
	});

	generationFilter.addEventListener('change', event => {
		generationValue = event.target.value;
		render();
	});

	render();

	return {
		setSelectedNames(nextSelectedNames) {
			currentSelectedNames = [...nextSelectedNames];
			render();
		},
	};
}
