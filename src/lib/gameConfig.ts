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
  
  // Parallax multipliers (relative to mouse position)
  parallax: {
    objects: { x: number; y: number };  // Objects layer movement
    map: { x: number; y: number };      // Map layer movement
    background: { x: number; y: number; scale: number }; // Background movement
  };
}

// HeartGold & SoulSilver Configuration
const HGSS_CONFIG: GameConfig = {
  id: 'heartgold-soulsilver',
  name: 'heartgold-soulsilver',
  displayName: 'HeartGold & SoulSilver',
  
  assets: {
    back: '/HGSS_Back.png',
    objects: '/HGSS_Objects.png',
    map: '/HGSS_Map.png',
    hitmap: '/HGSS_Hitmap.png',
    background: '/HGSS_JohtoKanto.jpg',
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
};

// Game registry - add new games here
const GAME_REGISTRY: { [key: string]: GameConfig } = {
  'heartgold-soulsilver': HGSS_CONFIG,
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

