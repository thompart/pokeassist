/**
 * Utility functions for finding location splash images
 */

/**
 * Normalize location name to match file naming conventions
 * Converts location names to match the file naming patterns in the splash folders
 */
function normalizeLocationName(locationName: string): string {
  // Remove special characters and normalize
  return locationName
    .replace(/\//g, '_')
    .replace(/'/g, '')
    .replace(/ /g, '_')
    .replace(/é/g, 'e')
    .replace(/É/g, 'E');
}

/**
 * Find splash image for a location
 * Tries anime folder first, then falls back to game folder
 */
export function getLocationSplashImage(gameId: string, locationName: string): string | null {
  if (gameId !== 'black-white') {
    // HGSS doesn't have splash images yet
    return null;
  }

  const normalized = normalizeLocationName(locationName);
  
  // Common anime image patterns
  const animePatterns = [
    `${normalized}_anime.png`,
    `${normalized}_anime_inside.png`,
    `${normalized}_anime_past.png`,
    `Unova_${normalized}_anime.png`,
    `${normalized}_PG.png`,
    `250px-${normalized}_anime.png`,
    `220px-${normalized}_anime.png`,
    `300px-${normalized}.png`,
    `350px-${normalized}_anime.png`,
  ];
  
  // Common game image patterns
  const gamePatterns = [
    `${normalized}_BW.png`,
    `${normalized}_B2W2.png`,
    `${normalized}_B2.png`,
    `Unova_${normalized}_BW.png`,
    `Unova_${normalized}_B2W2.png`,
    `Unova_${normalized}_Summer_BW.png`,
    `Unova_${normalized}_Summer_B2W2.png`,
    `Unova_${normalized}_Winter_BW.png`,
    `Unova_${normalized}_Spring_B2W2.png`,
    `${normalized}_Summer_B2W2.png`,
    `${normalized}_Winter_BWB2W2.png`,
    `${normalized}_Spring_B2W2.png`,
    `${normalized}_exterior_Summer_B2W2.png`,
    `${normalized}_1F_B2W2.png`,
    `${normalized}_3F_BWB2W2.png`,
    `${normalized}_B7F_Volcarona_Room_BWB2W2.png`,
    `${normalized}_B2F_BW.png`,
    `${normalized}_cutscene_BW.png`,
    `180px-${normalized}_Summer_B2W2.png`,
    `200px-${normalized}_3F_BWB2W2.png`,
    `200px-${normalized}_Crater_Forest_Summer_BW.png`,
    `201px-${normalized}_B2F_BW.png`,
    `226px-${normalized}_B7F_Volcarona_Room_BWB2W2.png`,
    `256px-${normalized}_B2W2.png`,
    `256px-${normalized}_1F_B2W2.png`,
    `256px-${normalized}_BW.png`,
    `290px-${normalized}_Summer_B2W2.png`,
    `290px-${normalized}_Winter_B2W2.png`,
    `290px-${normalized}_Spring_B2W2.png`,
    `290px-${normalized}_exterior_Summer_B2W2.png`,
    `290px-${normalized}_1F_B2W2.png`,
    `300px-${normalized}_Summer_BW.png`,
    `300px-${normalized}_Summer_B2W2.png`,
    `300px-${normalized}_Winter_BW.png`,
    `300px-${normalized}_Spring_B2W2.png`,
    `${normalized}_Winter_BWB2W2.png`,
    `${normalized}.png`,
  ];

  // Try anime folder first
  for (const pattern of animePatterns) {
    const path = `/BW/splashes/anime/${pattern}`;
    // In a real implementation, we'd check if the file exists
    // For now, we'll return the first pattern that matches common naming
    // The actual file existence will be handled by the browser (404 if not found)
    if (pattern.includes(normalized) || pattern.includes(locationName.replace(/ /g, '_'))) {
      return path;
    }
  }

  // Fallback to game folder
  for (const pattern of gamePatterns) {
    const path = `/BW/splashes/game/${pattern}`;
    if (pattern.includes(normalized) || pattern.includes(locationName.replace(/ /g, '_'))) {
      return path;
    }
  }

  // Return null if no match found
  return null;
}

/**
 * Get a more specific splash image path based on known file names
 * This is a mapping of location names to their actual file names
 */
export function getLocationSplashImagePath(gameId: string, locationName: string): string | null {
  // Use BW splashes for black-white, black, and white (they share the same assets)
  if (gameId !== 'black-white' && gameId !== 'black' && gameId !== 'white') {
    return null;
  }

  // Map of location names to their actual splash image file names
  // Anime folder first, then game folder fallback
  const splashMap: { [key: string]: { anime?: string; game?: string } } = {
    'Anville Town': { anime: 'Anville_Town_anime.png', game: '300px-Anville_Town_Summer_B2W2.png' },
    'Celestial Tower': { game: 'Celestial_Tower_Winter_BWB2W2.png' },
    'Dragonspiral Tower': { anime: '250px-Dragonspiral_Tower_anime.png', game: '200px-Dragonspiral_Tower_3F_BWB2W2.png' },
    'Moor of Icirrus': { game: '290px-Moor_of_Icirrus_Summer_B2W2.png' },
    'Twist Mountain': { game: 'Twist_Mountain_BW.png' },
    'Mistralton Cave': { game: '256px-Mistralton_Cave_1F_B2W2.png' },
    'Chargestone Cave': { game: '290px-Chargestone_Cave_exterior_Summer_B2W2.png' },
    'Cold Storage': { game: '290px-Cold_Storage_BW.png' },
    'Relic Castle': { anime: '250px-Relic_Castle_anime.png', game: '226px-Relic_Castle_B7F_Volcarona_Room_BWB2W2.png' },
    "Challenger's Cave": { game: '201px-Challengers_Cave_B2F_BW.png' },
    'Entralink': { game: '256px-Entralink_B2W2.png' },
    'Lostlorn Forest': { game: '180px-Lostlorn_Forest_Summer_B2W2.png' },
    'Poké Transfer Lab': { game: 'Poké_Transfer_Lab_BW.png' },
    'Abundant Shrine': { game: '290px-Abundant_Shrine_Summer_B2W2.png' },
    'Giant Chasm': { game: '200px-Giant_Chasm_Crater_Forest_Summer_BW.png' },
    'Undella Bay': { anime: '250px-Undella_Bay_anime.png', game: '290px-Undella_Bay_Winter_B2W2.png' },
    'Wellspring Cave': { anime: '250px-Wellspring_Cave_anime.png', game: '290px-Wellspring_Cave_1F_B2W2.png' },
    'Pinwheel Forest': { anime: '250px-Pinwheel_Forest_anime_inside.png', game: '290px-Pinwheel_Forest_Spring_B2W2.png' },
    'Dreamyard': { anime: '220px-Dreamyard_anime.png', game: '290px-Dreamyard_Ruins_Summer_B2W2.png' },
    'P2 Laboratory': { anime: '250px-P2_Laboratory_anime.png' },
    'Liberty Garden': { game: '290px-Liberty_Garden_Summer_BWB2W2.png' },
    'Victory Road': { game: '300px-Original_Victory_Road_B2W2.png' },
    'Pokémon League': { anime: '220px-Unova_Pokémon_League_PG.png', game: 'Pokémon_League_cutscene_BW.png' },
    'Opelucid City': { anime: '250px-Opelucid_City_anime.png' },
    'Icirrus City': { anime: '250px-Icirrus_City_anime.png' },
    'Mistralton City': { anime: '250px-Mistralton_City_anime.png' },
    'Driftveil City': { anime: '250px-Driftveil_City_anime.png' },
    'Nimbasa City': { anime: '250px-Nimbasa_City_anime.png' },
    'Black City/White Forest': { game: '300px-Black_City_and_White_Forest.png' },
    'Undella Town': { anime: '250px-Undella_Town_anime.png' },
    'Lacunosa Town': { game: '300px-Lacunosa_Town_Summer_B2W2.png' },
    'Castelia City': { anime: '300px-Castelia_City.png' },
    'Nacrene City': { anime: '250px-Nacrene_City_anime.png' },
    'Striaton City': { anime: '250px-Striaton_City_anime.png' },
    'Accumula Town': { anime: '350px-Accumula_Town_anime.png' },
    'Nuvema Town': { anime: '250px-Nuvema_Town_anime.png' },
    'Route 18': { game: '300px-Unova_Route_18_Summer_BW.png' },
    'Route 17': { game: '300px-Unova_Route_17_Winter_BW.png' },
    'Route 1': { anime: '220px-Unova_Route_1_anime.png' },
    'Route 2': { anime: '250px-Unova_Route_2_anime.png' },
    'Route 3': { anime: '250px-Unova_Route_3_anime.png' },
    'Skyarrow Bridge': { anime: '250px-Skyarrow_Bridge_past_anime.png' },
    'Route 4': { game: '256px-Unova_Route_4_B2.png' },
    'Desert Resort': { anime: '250px-Desert_Resort_PG.png' },
    'Route 5': { anime: '250px-Unova_Route_5_anime.png' },
    'Driftveil Drawbridge': { anime: '250px-Driftveil_Drawbridge_anime.png' },
    'Route 6': { anime: '250px-Unova_Route_6_anime.png' },
    'Route 7': { game: '300px-Unova_Route_7_Spring_B2W2.png' },
    'Route 8': { game: '300px-Unova_Route_8_Spring_B2W2.png' },
    'Tubeline Bridge': { game: '256px-Tubeline_Bridge_BW.png' },
    'Route 9': { game: '300px-Unova_Route_9_Summer_B2W2.png' },
    'Route 10': { game: '300px-Unova_Route_10_Summer_BW.png' },
    'Route 11': { game: '300px-Unova_Route_11_Summer_B2W2.png' },
    'Village Bridge': { game: '290px-Village_Bridge_Summer_B2W2.png' },
    'Route 12': { game: '300px-Unova_Route_12_Summer_B2W2.png' },
    'Route 13': { game: '300px-Unova_Route_13_Summer_B2W2.png' },
    'Route 14': { game: '300px-Unova_Route_14_Summer_B2W2.png' },
    'Route 15': { game: '300px-Unova_Route_15_Summer_B2W2.png' },
    'Marvelous Bridge': { game: '290px-Marvelous_Bridge_Summer_B2W2.png' },
    'Route 16': { game: '300px-Unova_Route_16_Summer_B2W2.png' },
  };

  const location = splashMap[locationName];
  if (!location) {
    return null;
  }

  // Try anime first, then game
  if (location.anime) {
    return `/BW/splashes/anime/${location.anime}`;
  }
  if (location.game) {
    return `/BW/splashes/game/${location.game}`;
  }

  return null;
}

