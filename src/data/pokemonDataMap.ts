import { PokemonData } from './interfaces/PokemonData';
import * as fs from 'fs';

const pokemonsJson = JSON.parse(
  fs.readFileSync('src/data/jsons/pokemons.json', 'utf8'),
);

function buildPokemonDataMap() {
  console.log('Building pokemon data map...');
  const pokemons: Map<number, PokemonData> = new Map();
  for (const id in pokemonsJson) {
    pokemons.set(parseInt(id, 10), pokemonsJson[id]);
  }
  console.log('Finished building pokemon data map');

  return pokemons as ReadonlyMap<number, PokemonData>;
}

export const pokemonDataMap = buildPokemonDataMap();
