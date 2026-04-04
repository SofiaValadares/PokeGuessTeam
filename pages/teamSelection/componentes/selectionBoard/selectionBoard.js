
export function setupSelectionBoard(container, callbacks = {}) {
	const randomTeamButton = container.querySelector('#teamRandomTeamButton');
	const pokemonListMount = container.querySelector('#teamPokemonListMount');

	if (!pokemonListMount || !randomTeamButton) {
		throw new Error('Estrutura do painel principal de seleção de time está incompleta.');
	}

	randomTeamButton.addEventListener('click', () => {
		callbacks.onRandomTeam?.();
	});

	return {
		pokemonListMount,
	};
}
