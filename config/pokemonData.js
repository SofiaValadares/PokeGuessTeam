import Pokemon from '../models/Pokemon.js';
import { PokemonType } from '../enums/PokemonType.js';
import { PokemonColor } from '../enums/PokemonColor.js';

export const pokemonData = [
  // Geração 1
  new Pokemon({
    name: 'Bulbasaur',
    image_src: './assets/pokemon/0001.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.POISON,
    generation: 1,
    color: PokemonColor.GREEN,
    height: 0.7,
    weight: 6.9
  }),
  new Pokemon({
    name: 'Ivysaur',
    image_src: './assets/pokemon/0002.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.POISON,
    generation: 1,
    color: PokemonColor.GREEN,
    height: 1.0,
    weight: 13.0
  }),
  new Pokemon({
    name: 'Venusaur',
    image_src: './assets/pokemon/0003.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.POISON,
    generation: 1,
    color: PokemonColor.GREEN,
    height: 2.0,
    weight: 100.0
  }),
  new Pokemon({
    name: 'Charmander',
    image_src: './assets/pokemon/0004.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 1,
    color: PokemonColor.RED,
    height: 0.6,
    weight: 8.5
  }),
  new Pokemon({
    name: 'Charmeleon',
    image_src: './assets/pokemon/0005.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 1,
    color: PokemonColor.RED,
    height: 1.1,
    weight: 19.0
  }),
  new Pokemon({
    name: 'Charizard',
    image_src: './assets/pokemon/0006.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FLYING,
    generation: 1,
    color: PokemonColor.RED,
    height: 1.7,
    weight: 90.5
  }),
  new Pokemon({
    name: 'Squirtle',
    image_src: './assets/pokemon/0007.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 1,
    color: PokemonColor.BLUE,
    height: 0.5,
    weight: 9.0
  }),
  new Pokemon({
    name: 'Wartortle',
    image_src: './assets/pokemon/0008.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 1,
    color: PokemonColor.BLUE,
    height: 1.0,
    weight: 22.5
  }),
  new Pokemon({
    name: 'Blastoise',
    image_src: './assets/pokemon/0009.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 1,
    color: PokemonColor.BLUE,
    height: 1.6,
    weight: 85.5
  }),

  // Geração 2
  new Pokemon({
    name: 'Chikorita',
    image_src: './assets/pokemon/0152.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.GREEN,
    height: 0.9,
    weight: 6.4
  }),
  new Pokemon({
    name: 'Bayleef',
    image_src: './assets/pokemon/0153.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.GREEN,
    height: 1.2,
    weight: 15.8
  }),
  new Pokemon({
    name: 'Meganium',
    image_src: './assets/pokemon/0154.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.GREEN,
    height: 1.8,
    weight: 100.5
  }),
  new Pokemon({
    name: 'Cyndaquil',
    image_src: './assets/pokemon/0155.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.RED,
    height: 0.5,
    weight: 7.9
  }),
  new Pokemon({
    name: 'Quilava',
    image_src: './assets/pokemon/0156.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.RED,
    height: 0.9,
    weight: 19.0
  }),
  new Pokemon({
    name: 'Typhlosion',
    image_src: './assets/pokemon/0157.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.RED,
    height: 1.7,
    weight: 79.5
  }),
  new Pokemon({
    name: 'Totodile',
    image_src: './assets/pokemon/0158.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.BLUE,
    height: 0.6,
    weight: 9.5
  }),
  new Pokemon({
    name: 'Croconaw',
    image_src: './assets/pokemon/0159.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.BLUE,
    height: 1.1,
    weight: 25.0
  }),
  new Pokemon({
    name: 'Feraligatr',
    image_src: './assets/pokemon/0160.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 2,
    color: PokemonColor.BLUE,
    height: 2.3,
    weight: 88.8
  }),

  // Geração 3
  new Pokemon({
    name: 'Treecko',
    image_src: './assets/pokemon/0252.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 3,
    color: PokemonColor.GREEN,
    height: 0.5,
    weight: 5.0
  }),
  new Pokemon({
    name: 'Grovyle',
    image_src: './assets/pokemon/0253.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 3,
    color: PokemonColor.GREEN,
    height: 0.9,
    weight: 21.6
  }),
  new Pokemon({
    name: 'Sceptile',
    image_src: './assets/pokemon/0254.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 3,
    color: PokemonColor.GREEN,
    height: 1.7,
    weight: 52.2
  }),
  new Pokemon({
    name: 'Torchic',
    image_src: './assets/pokemon/0255.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 3,
    color: PokemonColor.RED,
    height: 0.4,
    weight: 2.5
  }),
  new Pokemon({
    name: 'Combusken',
    image_src: './assets/pokemon/0256.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FIGHTING,
    generation: 3,
    color: PokemonColor.RED,
    height: 0.9,
    weight: 19.5
  }),
  new Pokemon({
    name: 'Blaziken',
    image_src: './assets/pokemon/0257.png', 
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FIGHTING,
    generation: 3,
    color: PokemonColor.RED,
    height: 1.9,
    weight: 52.0
  }),
  new Pokemon({
    name: 'Mudkip',
    image_src: './assets/pokemon/0258.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 3,
    color: PokemonColor.BLUE,
    height: 0.4,
    weight: 7.6
  }),
  new Pokemon({
    name: 'Marshtomp',
    image_src: './assets/pokemon/0259.png',
    primary_type: PokemonType.WATER,
    secondary_type: PokemonType.GROUND,
    generation: 3,
    color: PokemonColor.BLUE,
    height: 0.7,
    weight: 28.0
  }),
  new Pokemon({
    name: 'Swampert',
    image_src: './assets/pokemon/0260.png',
    primary_type: PokemonType.WATER,
    secondary_type: PokemonType.GROUND,
    generation: 3,
    color: PokemonColor.BLUE,
    height: 1.5,
    weight: 81.9
  }),

  // Geração 4
  new Pokemon({
    name: 'Turtwig',
    image_src: './assets/pokemon/0387.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 4,
    color: PokemonColor.GREEN,
    height: 0.4,
    weight: 10.2
  }),
  new Pokemon({
    name: 'Grotle',
    image_src: './assets/pokemon/0388.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 4,
    color: PokemonColor.GREEN,
    height: 1.1,
    weight: 97.0
  }),
  new Pokemon({
    name: 'Torterra',
    image_src: './assets/pokemon/0389.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.GROUND,
    generation: 4,
    color: PokemonColor.GREEN,
    height: 2.2,
    weight: 310.0
  }),
  new Pokemon({
    name: 'Chimchar',
    image_src: './assets/pokemon/0390.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 4,
    color: PokemonColor.BROWN,
    height: 0.5,
    weight: 6.2
  }),
  new Pokemon({
    name: 'Monferno',
    image_src: './assets/pokemon/0391.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FIGHTING,
    generation: 4,
    color: PokemonColor.BROWN,
    height: 0.9,
    weight: 22.0
  }),
  new Pokemon({
    name: 'Infernape',
    image_src: './assets/pokemon/0392.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FIGHTING,
    generation: 4,
    color: PokemonColor.BROWN,
    height: 1.2,
    weight: 55.0
  }),
  new Pokemon({
    name: 'Piplup',
    image_src: './assets/pokemon/0393.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 4,
    color: PokemonColor.BLUE,
    height: 0.4,
    weight: 5.2
  }),
  new Pokemon({
    name: 'Prinplup',
    image_src: './assets/pokemon/0394.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 4,
    color: PokemonColor.BLUE,
    height: 0.8,
    weight: 23.0
  }),
  new Pokemon({
    name: 'Empoleon',
    image_src: './assets/pokemon/0395.png',
    primary_type: PokemonType.WATER,
    secondary_type: PokemonType.STEEL,
    generation: 4,
    color: PokemonColor.BLUE,
    height: 1.7,
    weight: 84.5
  }),

  // Geração 5
  new Pokemon({
    name: 'Snivy',
    image_src: './assets/pokemon/0495.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.GREEN,
    height: 0.6,
    weight: 8.1
  }),
  new Pokemon({
    name: 'Servine',
    image_src: './assets/pokemon/0496.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.GREEN,
    height: 0.8,
    weight: 16.0
  }),
  new Pokemon({
    name: 'Serperior',
    image_src: './assets/pokemon/0497.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.GREEN,
    height: 3.3,
    weight: 63.0
  }),
  new Pokemon({
    name: 'Tepig',
    image_src: './assets/pokemon/0498.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.RED,
    height: 0.5,
    weight: 9.9
  }),
  new Pokemon({
    name: 'Pignite',
    image_src: './assets/pokemon/0499.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FIGHTING,
    generation: 5,
    color: PokemonColor.RED,
    height: 1.0,
    weight: 55.5
  }),
  new Pokemon({
    name: 'Emboar',
    image_src: './assets/pokemon/0500.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.FIGHTING,
    generation: 5,
    color: PokemonColor.RED,
    height: 1.6,
    weight: 150.0
  }),
  new Pokemon({
    name: 'Oshawott',
    image_src: './assets/pokemon/0501.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.BLUE,
    height: 0.5,
    weight: 5.9
  }),
  new Pokemon({
    name: 'Dewott',
    image_src: './assets/pokemon/0502.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.BLUE,
    height: 0.8,
    weight: 24.5
  }),
  new Pokemon({
    name: 'Samurott',
    image_src: './assets/pokemon/0503.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 5,
    color: PokemonColor.BLUE,
    height: 1.5,
    weight: 94.6
  }),

  // Geração 6
  new Pokemon({
    name: 'Chespin',
    image_src: './assets/pokemon/0650.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 6,
    color: PokemonColor.GREEN,
    height: 0.4,
    weight: 9.0
  }),
  new Pokemon({
    name: 'Quilladin',
    image_src: './assets/pokemon/0651.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 6,
    color: PokemonColor.GREEN,
    height: 0.7,
    weight: 29.0
  }),
  new Pokemon({
    name: 'Chesnaught',
    image_src: './assets/pokemon/0652.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.FIGHTING,
    generation: 6,
    color: PokemonColor.GREEN,
    height: 1.6,
    weight: 90.0
  }),
  new Pokemon({
    name: 'Fennekin',
    image_src: './assets/pokemon/0653.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 6,
    color: PokemonColor.RED,
    height: 0.4,
    weight: 9.4
  }),
  new Pokemon({
    name: 'Braixen',
    image_src: './assets/pokemon/0654.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 6,
    color: PokemonColor.RED,
    height: 1.0,
    weight: 14.5
  }),
  new Pokemon({
    name: 'Delphox',
    image_src: './assets/pokemon/0655.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.PSYCHIC,
    generation: 6,
    color: PokemonColor.RED,
    height: 1.5,
    weight: 39.0
  }),
  new Pokemon({
    name: 'Froakie',
    image_src: './assets/pokemon/0656.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 6,
    color: PokemonColor.BLUE,
    height: 0.3,
    weight: 7.0
  }),
  new Pokemon({
    name: 'Frogadier',
    image_src: './assets/pokemon/0657.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 6,
    color: PokemonColor.BLUE,
    height: 0.6,
    weight: 10.9
  }),
  new Pokemon({
    name: 'Greninja',
    image_src: './assets/pokemon/0658.png',
    primary_type: PokemonType.WATER,
    secondary_type: PokemonType.DARK,
    generation: 6,
    color: PokemonColor.BLUE,
    height: 1.5,
    weight: 40.0
  }),

  // Geração 7
  new Pokemon({
    name: 'Rowlet',
    image_src: './assets/pokemon/0722.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.FLYING,
    generation: 7,
    color: PokemonColor.BROWN,
    height: 0.3,
    weight: 1.5
  }),
  new Pokemon({
    name: 'Dartrix',
    image_src: './assets/pokemon/0723.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.FLYING,
    generation: 7,
    color: PokemonColor.BROWN,
    height: 0.7,
    weight: 16.0
  }),
  new Pokemon({
    name: 'Decidueye',
    image_src: './assets/pokemon/0724.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.GHOST,
    generation: 7,
    color: PokemonColor.BROWN,
    height: 1.6,
    weight: 36.6
  }),
  new Pokemon({
    name: 'Litten',
    image_src: './assets/pokemon/0725.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 7,
    color: PokemonColor.RED,
    height: 0.4,
    weight: 4.3
  }),
  new Pokemon({
    name: 'Torracat',
    image_src: './assets/pokemon/0726.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 7,
    color: PokemonColor.RED,
    height: 0.7,
    weight: 25.0
  }),
  new Pokemon({
    name: 'Incineroar',
    image_src: './assets/pokemon/0727.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.DARK,
    generation: 7,
    color: PokemonColor.RED,
    height: 1.8,
    weight: 83.0
  }),
  new Pokemon({
    name: 'Popplio',
    image_src: './assets/pokemon/0728.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 7,
    color: PokemonColor.BLUE,
    height: 0.4,
    weight: 7.5
  }),
  new Pokemon({
    name: 'Brionne',
    image_src: './assets/pokemon/0729.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 7,
    color: PokemonColor.BLUE,
    height: 0.6,
    weight: 17.5
  }),
  new Pokemon({
    name: 'Primarina',
    image_src: './assets/pokemon/0730.png',
    primary_type: PokemonType.WATER,
    secondary_type: PokemonType.FAIRY,
    generation: 7,
    color: PokemonColor.BLUE,
    height: 1.8,
    weight: 44.0
  }),

  // Geração 8
  new Pokemon({
    name: 'Grookey',
    image_src: './assets/pokemon/0810.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.GREEN,
    height: 0.3,
    weight: 5.0
  }),
  new Pokemon({
    name: 'Thwackey',
    image_src: './assets/pokemon/0811.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.GREEN,
    height: 0.7,
    weight: 14.0
  }),
  new Pokemon({
    name: 'Rillaboom',
    image_src: './assets/pokemon/0812.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.GREEN,
    height: 2.1,
    weight: 90.0
  }),
  new Pokemon({
    name: 'Scorbunny',
    image_src: './assets/pokemon/0813.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.WHITE,
    height: 0.3,
    weight: 4.5
  }),
  new Pokemon({
    name: 'Raboot',
    image_src: './assets/pokemon/0814.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.WHITE,
    height: 0.6,
    weight: 9.0
  }),
  new Pokemon({
    name: 'Cinderace',
    image_src: './assets/pokemon/0815.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.WHITE,
    height: 1.4,
    weight: 33.0
  }),
  new Pokemon({
    name: 'Sobble',
    image_src: './assets/pokemon/0816.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.BLUE,
    height: 0.3,
    weight: 4.0
  }),
  new Pokemon({
    name: 'Drizzile',
    image_src: './assets/pokemon/0817.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.BLUE,
    height: 0.7,
    weight: 11.5
  }),
  new Pokemon({
    name: 'Inteleon',
    image_src: './assets/pokemon/0818.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 8,
    color: PokemonColor.BLUE,
    height: 1.9,
    weight: 45.2
  }),

  // Geração 9
  new Pokemon({
    name: 'Sprigatito',
    image_src: './assets/pokemon/0906.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 9,
    color: PokemonColor.GREEN,
    height: 0.4,
    weight: 4.1
  }),
  new Pokemon({
    name: 'Floragato',
    image_src: './assets/pokemon/0907.png',
    primary_type: PokemonType.GRASS,
    secondary_type: null,
    generation: 9,
    color: PokemonColor.GREEN,
    height: 0.9,
    weight: 12.2
  }),
  new Pokemon({
    name: 'Meowscarada',
    image_src: './assets/pokemon/0908.png',
    primary_type: PokemonType.GRASS,
    secondary_type: PokemonType.DARK,
    generation: 9,
    color: PokemonColor.GREEN,
    height: 1.5,
    weight: 31.2
  }),
  new Pokemon({
    name: 'Fuecoco',
    image_src: './assets/pokemon/0909.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 9,
    color: PokemonColor.RED,
    height: 0.4,
    weight: 9.8
  }),
  new Pokemon({
    name: 'Crocalor',
    image_src: './assets/pokemon/0910.png',
    primary_type: PokemonType.FIRE,
    secondary_type: null,
    generation: 9,
    color: PokemonColor.RED,
    height: 1.0,
    weight: 30.7
  }),
  new Pokemon({
    name: 'Skeledirge',
    image_src: './assets/pokemon/0911.png',
    primary_type: PokemonType.FIRE,
    secondary_type: PokemonType.GHOST,
    generation: 9,
    color: PokemonColor.RED,
    height: 1.6,
    weight: 326.5
  }),
  new Pokemon({
    name: 'Quaxly',
    image_src: './assets/pokemon/0912.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 9,
    color: PokemonColor.BLUE,
    height: 0.5,
    weight: 6.1
  }),
  new Pokemon({
    name: 'Quaxwell',
    image_src: './assets/pokemon/0913.png',
    primary_type: PokemonType.WATER,
    secondary_type: null,
    generation: 9,
    color: PokemonColor.BLUE,
    height: 1.2,
    weight: 21.5
  }),
  new Pokemon({
    name: 'Quaquaval',
    image_src: './assets/pokemon/0914.png',
    primary_type: PokemonType.WATER,
    secondary_type: PokemonType.FIGHTING,
    generation: 9,
    color: PokemonColor.BLUE,
    height: 1.8,
    weight: 61.9
  }),
];

export const pokemonDataMap = new Map(
  pokemonData.map(pokemon => [pokemon.name.toLowerCase(), pokemon])
);

export function getPokemonByName(pokemonName) {
  return pokemonDataMap.get(String(pokemonName).toLowerCase()) ?? null;
}

export function getPokemonByNames(names = []) {
  return names.map(name => getPokemonByName(name)).filter(Boolean);
}

export function getPokemonOptions() {
  return pokemonData.map(pokemon => ({
    name: pokemon.name,
    image_src: pokemon.image_src,
    generation: pokemon.generation,
    primary_type: pokemon.primary_type,
    secondary_type: pokemon.secondary_type,
  }));
}
