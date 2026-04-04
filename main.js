import { createPokedexComponent } from './components/pokedex/pokedex.js';
import { initSectionManager } from './config/sectionManager.js';

window.addEventListener('DOMContentLoaded', () => {
    createPokedexComponent('app', async pokedexElement => {
        await initSectionManager(pokedexElement);
    });
});
