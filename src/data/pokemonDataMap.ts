import { PokemonData } from './interfaces/PokemonData';
import * as fs from 'fs';

const pokemonsJson = JSON.parse(
  fs.readFileSync('src/data/jsons/pokemons.json', 'utf8'),
);

function buildPokemonDataMap() {
  console.log('Building pokemon data map...');
  const pokemons: Map<string, PokemonData> = new Map();
  for (const id in pokemonsJson) {
    pokemons.set(id, pokemonsJson[id]);
  }
  console.log('Finished building pokemon data map');

  return pokemons as ReadonlyMap<string, PokemonData>;
}

export const pokemonDataMap = buildPokemonDataMap();
