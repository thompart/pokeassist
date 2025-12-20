/**
 * Game Configuration System
 * 
 * This module provides a centralized configuration system for different Pokemon games/regions.
 * Each game configuration includes:
 * - Map assets (images)
 * - Location mappings (hitmap colors to location names)
 * - Parallax settings
 * - Map dimensions
 * - Background image
 */

export interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  
  // Map assets
  assets: {
    back: string;        // Background layer image path
    objects: string;     // Objects layer image path
    map: string;         // Map detail layer image path
    hitmap: string;      // Color-coded location hitmap image path
    background: string;  // Page background image path
  };
  
  // Map dimensions (in pixels)
  dimensions: {
    width: number;
    height: number;
  };
  
  // Location color mapping (hex color -> location name)
  locationMap: { [key: string]: string };
  
  // Location descriptions (location name -> description)
  locationDescriptions?: { [key: string]: string };
  
  // Parallax multipliers (relative to mouse position)
  parallax: {
    objects: { x: number; y: number };  // Objects layer movement
    map: { x: number; y: number };      // Map layer movement
    background: { x: number; y: number; scale: number }; // Background movement
  };
}

// HeartGold & SoulSilver Configuration (combined)
const HGSS_CONFIG: GameConfig = {
  id: 'heartgold-soulsilver',
  name: 'heartgold-soulsilver',
  displayName: 'Pokemon Heart Gold & Soul Silver',
  
  assets: {
    back: '/HGSS/HGSS_Back.png',
    objects: '/HGSS/HGSS_Objects.png',
    map: '/HGSS/HGSS_Map.png',
    hitmap: '/HGSS/HGSS_Hitmap.png',
    background: '/HGSS/HGSS_JohtoKanto.jpg',
  },
  
  dimensions: {
    width: 376,
    height: 160,
  },
  
  locationMap: {
    '#FF0000': 'Safari Zone Gate',
    '#00FF00': 'Route 48',
    '#0000FF': 'Route 47',
    '#FFFF00': 'Cianwood City',
    '#FF00FF': 'Route 41',
    '#00FFFF': 'Whirl Islands',
    '#FF8000': 'Route 40',
    '#8000FF': 'Battle Frontier',
    '#FF0080': 'Olivine City',
    '#0080FF': 'Lighthouse',
    '#80FF00': 'Route 39',
    '#FF8080': 'Route 38',
    '#80FF80': 'National Park',
    '#8080FF': 'Ecruteak City',
    '#FFFF80': 'Burned Tower',
    '#FF80FF': 'Bell Tower',
    '#80FFFF': 'Route 37',
    '#FF0040': 'Route 35',
    '#4000FF': 'Violet City',
    '#0040FF': 'Sprout Tower',
    '#00FF40': 'Ruins of Alph',
    '#40FF00': 'Goldenrod City',
    '#FF4000': 'Route 34',
    '#00FF80': 'Ilex Forest',
    '#800000': 'Azalea Town',
    '#008000': 'Slowpoke Well',
    '#000080': 'Route 33',
    '#808000': 'Union Cave',
    '#800080': 'Route 32',
    '#008080': 'Route 42',
    '#C00000': 'Mt. Mortar',
    '#00C000': 'Mahogany Town',
    '#0000C0': 'Route 43',
    '#C0C000': 'Lake of Rage',
    '#C000C0': 'Route 44',
    '#00C0C0': 'Blackthorn City',
    '#C08000': 'Ice Path',
    '#8000C0': 'Dark Cave',
    '#C00080': 'Route 45',
    '#0080C0': 'Route 31',
    '#80C000': 'Route 30',
    '#C0C080': 'Cherrygrove City',
    '#C080C0': 'Route 29',
    '#80C0C0': 'Route 46',
    '#FF2000': 'New Bark Town',
    '#20FF00': 'Route 27',
    '#0020FF': 'Tohjo Falls',
    '#FF0020': 'Route 36',
  },
  
  parallax: {
    objects: { x: 1.2, y: 1.2 },
    map: { x: 2, y: 2 },
    background: { x: -3, y: -3, scale: 1.15 },
  },
  
  locationDescriptions: {},
};

// Individual HeartGold Configuration
const HEARTGOLD_CONFIG: GameConfig = {
  ...HGSS_CONFIG,
  id: 'heartgold',
  name: 'heartgold',
  displayName: 'Pokemon HeartGold',
};

// Individual SoulSilver Configuration
const SOULSILVER_CONFIG: GameConfig = {
  ...HGSS_CONFIG,
  id: 'soulsilver',
  name: 'soulsilver',
  displayName: 'Pokemon SoulSilver',
};

// Black & White Configuration (combined)
const BW_CONFIG: GameConfig = {
  id: 'black-white',
  name: 'black-white',
  displayName: 'Pokemon Black & White',
  
  assets: {
    back: '/BW/BW_Back.png',
    objects: '/BW/BW_Shadow.png',
    map: '/BW/BW_Map.png',
    hitmap: '/BW/BW_Hitmap.png',
    background: '/BW/BW_Fullscreen.jpg',
  },
  
  dimensions: {
    width: 256,
    height: 168,
  },
  
  locationMap: {
    '#FF0000': 'Anville Town',
    '#00FF00': 'Celestial Tower',
    '#0000FF': 'Dragonspiral Tower',
    '#FFFF00': 'Moor of Icirrus',
    '#FF00FF': 'Twist Mountain',
    '#00FFFF': 'Mistralton Cave',
    '#FF8000': 'Chargestone Cave',
    '#8000FF': 'Cold Storage',
    '#FF0080': 'Relic Castle',
    '#0080FF': "Challenger's Cave",
    '#80FF00': 'Entralink',
    '#FF8080': 'Lostlorn Forest',
    '#80FF80': 'Poké Transfer Lab',
    '#8080FF': 'Abundant Shrine',
    '#FFFF80': 'Giant Chasm',
    '#FF80FF': 'Undella Bay',
    '#80FFFF': 'Wellspring Cave',
    '#4000FF': 'Dreamyard',
    '#0040FF': 'P2 Laboratory',
    '#00FF40': 'Liberty Garden',
    '#40FF00': 'Victory Road',
    '#FF4000': 'Pokémon League',
    '#FF4080': 'Opelucid City',
    '#800000': 'Icirrus City',
    '#008000': 'Mistralton City',
    '#000080': 'Driftveil City',
    '#808000': 'Nimbasa City',
    '#800080': 'Black City/White Forest',
    '#008080': 'Undella Town',
    '#C00000': 'Lacunosa Town',
    '#00C000': 'Castelia City',
    '#0000C0': 'Nacrene City',
    '#C0C000': 'Striaton City',
    '#C000C0': 'Accumula Town',
    '#00C0C0': 'Nuvema Town',
    '#C08000': 'Route 18',
    '#8000C0': 'Route 17',
    '#C00080': 'Route 1',
    '#0080C0': 'Route 2',
    '#80C000': 'Route 3',
    '#C0C080': 'Skyarrow Bridge',
    '#C080C0': 'Route 4',
    '#80C0C0': 'Desert Resort',
    '#FF2000': 'Route 5',
    '#FF6000': 'Tubeline Bridge',
    '#20FF00': 'Driftveil Drawbridge',
    '#0020FF': 'Route 6',
    '#FF0020': 'Route 7',
    '#2000FF': 'Route 8',
    '#A00000': 'Route 9',
    '#00A000': 'Route 10',
    '#0000A0': 'Route 11',
    '#A0A000': 'Village Bridge',
    '#A000A0': 'Route 12',
    '#00A0A0': 'Route 13',
    '#A06000': 'Route 14',
    '#6000A0': 'Route 15',
    '#A00060': 'Marvelous Bridge',
    '#0060A0': 'Route 16',
    '#FF3000': 'Pinwheel Forest',
  },
  
  parallax: {
    objects: { x: 1.5, y: 1.5 },
    map: { x: 3, y: 3 },
    background: { x: -3, y: -3, scale: 1.15 },
  },
  
  locationDescriptions: {
    'Anville Town': 'A city with a rail yard where trains park for an overhaul.',
    'Celestial Tower': 'A tall tower with a large bell whose tones are said to purify the spirit',
    'Dragonspiral Tower': 'The oldest tower in the Unova Region. No one knows its history.',
    'Moor of Icirrus': 'They say water collecting in hollows on the flat land created the moor.',
    'Twist Mountain': 'It has a reputation as a mine littered with valuable ore.',
    'Mistralton Cave': 'A forgotten cave sealed with hints of a legend\'s presence.',
    'Chargestone Cave': 'A cave where electrically charged stones float.',
    'Cold Storage': '(no official map description found)',
    'Relic Castle': 'Ancient ruins with a glorious history, buried in the sand as time went by.',
    "Challenger's Cave": 'Trainers seeking further strength enter the cavern despite the risks.',
    'Entralink': 'In the middle of the Unova region, it is a place of mysterious power.',
    'Lostlorn Forest': 'It was once known as a place where people got lost for no reason.',
    'Poké Transfer Lab': 'A facility to study Pokémon from faraway regions.',
    'Abundant Shrine': 'People once lived in this village, and it still feels the same as it did then.',
    'Giant Chasm': 'Legend says that if you approach this big chasm, disasters surely follow.',
    'Undella Bay': 'A world-famous sea of shining waves.',
    'Wellspring Cave': 'The underwater pool grew from rainwater soaking into the ground.',
    'Pinwheel Forest': 'You can go through hollows of fallen trees, too.',
    'Dreamyard': 'A plant site used as a playground for children and Pokémon.',
    'P2 Laboratory': 'Team Plasma\'s secret lab is located on a quiet little island.',
    'Liberty Garden': 'An island symbol of hope for a world where humans and Pokémon live free.',
    'Victory Road': 'These steep slopes are the last obstacle before the Pokémon League!',
    'Pokémon League': 'Only Trainers who win at all the Pokémon Gyms may challenge it.',
    'Opelucid City': 'A convenient city of rapid change, showing no traces of the past.',
    'Icirrus City': 'In winter, the city is covered with snow as far as the eye can see.',
    'Mistralton City': 'Vegetables are grown by the runway and transported by cargo plane.',
    'Driftveil City': 'A port town distributing many goods, and a gateway to the Unova region.',
    'Nimbasa City': 'A bustling city of entertainment, with many theme parks.',
    'Black City/White Forest': 'A modern city of ongoing development that draws people to it.',
    'Undella Town': 'A summer retreat with a beach full of people who enjoy summer vacations.',
    'Lacunosa Town': 'A town where all honor old customs, living as methodically as clockwork.',
    'Castelia City': 'A big city with skyscrapers piercing the clouds.',
    'Nacrene City': 'A city established in restored storehouses built 100 years ago.',
    'Striaton City': 'Entry stairs built in memory of a former home in a snowier climate.',
    'Accumula Town': 'This town offers great views due to its many hills.',
    'Nuvema Town': 'A rural town whose sea breezes give the sense of something coming.',
    'Route 18': 'Some researchers believe it was once contiguous with Desert Resort.',
    'Route 17': 'The fast current here makes it difficult to surf.',
    'Route 1': 'A small road by the shore, where you can enjoy the seascape in peace.',
    'Route 2': 'A pastoral road where novice Trainers challenge one another.',
    'Route 3': 'A long winding road with lots of ponds and tall grass.',
    'Skyarrow Bridge': 'The biggest, longest bridge in Unova has four supporting towers.',
    'Route 4': 'A sandstorm delayed the road construction to connect two cities.',
    'Desert Resort': 'It is a popular place for tourists, but too harsh to be a resort.',
    'Route 5': 'A busy road where performers gather.',
    'Driftveil Drawbridge': 'A drawbridge raises and lowers, depending on the ship schedules.',
    'Route 6': 'A road with many trees for nature lovers.',
    'Route 7': 'Raised walkways help you avoid the tall grass.',
    'Route 8': 'It rains a lot here, and the marshy swamp holds many Pokémon.',
    'Tubeline Bridge': 'A sturdy steel bridge that won\'t budge an inch when trains cross it.',
    'Route 9': 'This paved road attracts those who love bikes.',
    'Route 10': 'A road leading to the Badge Check Gates, chock full of showoffs.',
    'Route 11': 'Limpid streams carved beautiful scenery on this road.',
    'Village Bridge': 'An old bridge that settlers of the Unova region built and now live on.',
    'Route 12': 'A place of fun, where it\'s enjoyable just walking over its gentle hills.',
    'Route 13': 'This seaside route is famous for sandbars that cross the ocean.',
    'Route 14': 'A road covered with mist from the waterfalls.',
    'Route 15': 'A road whose sharp cliffs may scare some people off.',
    'Marvelous Bridge': 'The most advanced bridge in Unova, designed to soften any impact.',
    'Route 16': 'Many who visit Nimbasa City drop by to take a break.',
  },
};

// Individual Black Configuration
const BLACK_CONFIG: GameConfig = {
  ...BW_CONFIG,
  id: 'black',
  name: 'black',
  displayName: 'Pokemon Black',
};

// Individual White Configuration
const WHITE_CONFIG: GameConfig = {
  ...BW_CONFIG,
  id: 'white',
  name: 'white',
  displayName: 'Pokemon White',
};

// Black 2 Configuration (uses same assets as BW for now)
const BLACK2_CONFIG: GameConfig = {
  ...BW_CONFIG,
  id: 'black-2',
  name: 'black-2',
  displayName: 'Pokemon Black 2',
};

// White 2 Configuration (uses same assets as BW for now)
const WHITE2_CONFIG: GameConfig = {
  ...BW_CONFIG,
  id: 'white-2',
  name: 'white-2',
  displayName: 'Pokemon White 2',
};

// Game registry - add new games here
const GAME_REGISTRY: { [key: string]: GameConfig } = {
  'heartgold-soulsilver': HGSS_CONFIG,
  'heartgold': HEARTGOLD_CONFIG,
  'soulsilver': SOULSILVER_CONFIG,
  'black-white': BW_CONFIG,
  'black': BLACK_CONFIG,
  'white': WHITE_CONFIG,
  'black-2': BLACK2_CONFIG,
  'white-2': WHITE2_CONFIG,
};

/**
 * Get game configuration by game ID
 */
export function getGameConfig(gameId: string): GameConfig | null {
  return GAME_REGISTRY[gameId] || null;
}

/**
 * Get all available game configurations
 */
export function getAllGameConfigs(): GameConfig[] {
  return Object.values(GAME_REGISTRY);
}

/**
 * Get game configuration for available games list (for dropdowns)
 */
export function getAvailableGames() {
  return getAllGameConfigs().map(config => ({
    value: config.id,
    label: config.displayName,
  }));
}

/**
 * Validate that a game ID exists
 */
export function isValidGameId(gameId: string): boolean {
  return gameId in GAME_REGISTRY;
}
