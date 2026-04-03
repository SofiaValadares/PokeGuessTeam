export function setupSelectionBoard(container) {
	const pokemonListMount = container.querySelector('#teamPokemonListMount');

	if (!pokemonListMount) {
		throw new Error('Estrutura do painel principal de seleção de time está incompleta.');
	}

	return {
		pokemonListMount,
	};
}
