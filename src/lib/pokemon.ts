// Pokemon utilities and API integration
// Using PokeAPI v2: https://pokeapi.co/api/v2/

export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  spriteShiny?: string;
}

// Cache for Pokemon list
let pokemonListCache: Pokemon[] | null = null;

/**
 * Fetch all Pokemon (first 1010 Pokemon, covers all generations)
 * Using PokeAPI's paginated endpoint
 */
export async function getAllPokemon(): Promise<Pokemon[]> {
  if (pokemonListCache) {
    return pokemonListCache;
  }

  const pokemonList: Pokemon[] = [];
  const limit = 100; // API limit per request
  let offset = 0;
  let hasMore = true;

  try {
    // Fetch Pokemon list in batches
    while (hasMore && offset < 1010) {
      // Fetch up to 1010 Pokemon (covers all generations)
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Pokemon list: ${response.statusText}`);
      }

      const data = await response.json();
      const results = data.results;

      // Extract Pokemon data from results - use URL to get ID instead of fetching details
      // This is much faster - we can construct sprite URLs from the ID
      const pokemonData = results.map((pokemon: any, index: number) => {
        // Extract ID from URL: https://pokeapi.co/api/v2/pokemon/1/
        const urlParts = pokemon.url.split('/');
        const id = parseInt(urlParts[urlParts.length - 2], 10);

        return {
          id,
          name: pokemon.name,
          sprite: getPokemonSpriteUrl(id), // Use helper function
        } as Pokemon;
      });

      pokemonList.push(...pokemonData);

      offset += limit;
      hasMore = data.next !== null;
    }

    // Sort by ID
    pokemonList.sort((a, b) => a.id - b.id);
    pokemonListCache = pokemonList;

    return pokemonList;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
}

/**
 * Search Pokemon by name (case-insensitive, partial match)
 */
export function searchPokemon(pokemonList: Pokemon[], query: string): Pokemon[] {
  if (!query.trim()) {
    return pokemonList;
  }

  const lowerQuery = query.toLowerCase();
  return pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Format Pokemon name (capitalize first letter, replace hyphens with spaces)
 */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get Pokemon sprite URL - can use local sprites or PokeAPI CDN
 * For now, using PokeAPI CDN URLs
 */
export function getPokemonSpriteUrl(pokemonId: number, variant: 'default' | 'shiny' = 'default'): string {
  // Using PokeAPI CDN
  if (variant === 'shiny') {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

