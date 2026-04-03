// pokedexComponent.js
// Responsável por criar o componente Pokedex a partir do HTML externo

export function createPokedexComponent(containerId, onReady) {
    fetch('components/pokedex/pokedex.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const pokedex = doc.querySelector('.pokedex');
            const container = document.getElementById(containerId);
            if (container && pokedex) {
                container.innerHTML = '';
                container.appendChild(pokedex);
                if (typeof onReady === 'function') {
                    onReady(pokedex);
                }
            }
        });
}
