export function createPokedexComponent(containerId, onReady) {
    fetch('components/pokedex/pokedex.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível carregar a estrutura da Pokédex.');
            }

            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const pokedex = doc.querySelector('.pokedex');
            const container = document.getElementById(containerId);
            if (container && pokedex) {
                container.replaceChildren(pokedex);
                if (typeof onReady === 'function') {
                    onReady(pokedex);
                }
            }
        })
        .catch(error => {
            const container = document.getElementById(containerId);

            if (container) {
                const message = document.createElement('p');
                message.className = 'app-error';
                message.textContent = 'Erro ao carregar a interface inicial.';
                container.replaceChildren(message);
            }

            console.error(error);
        });
}
