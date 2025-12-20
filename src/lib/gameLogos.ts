/**
 * Game logo configuration
 */

export interface GameLogo {
  id: string;
  name: string;
  logoPath: string;
  gameId: string; // Maps to gameConfig.id
}

// Available game logos
export const GAME_LOGOS: GameLogo[] = [
  {
    id: 'heartgold',
    name: 'Pokemon HeartGold',
    logoPath: '/logos/120px-HeartGoldEnglish.png',
    gameId: 'heartgold', // Individual game
  },
  {
    id: 'soulsilver',
    name: 'Pokemon SoulSilver',
    logoPath: '/logos/120px-SoulSilverEnglish.png',
    gameId: 'soulsilver', // Individual game
  },
  {
    id: 'heartgold-soulsilver',
    name: 'HeartGold & SoulSilver',
    logoPath: '/logos/104px-HeartGold_SoulSilver_Logo.png',
    gameId: 'heartgold-soulsilver', // Combined for soul link
  },
  {
    id: 'black',
    name: 'Pokemon Black',
    logoPath: '/logos/120px-Pokémon_Black_EN_logo.png',
    gameId: 'black', // Individual game
  },
  {
    id: 'white',
    name: 'Pokemon White',
    logoPath: '/logos/120px-Pokémon_White_EN_logo.png',
    gameId: 'white', // Individual game
  },
  {
    id: 'black-white',
    name: 'Black & White',
    logoPath: '/logos/95px-English_BW_logo.png',
    gameId: 'black-white', // Combined for soul link
  },
  {
    id: 'black-2',
    name: 'Pokemon Black 2',
    logoPath: '/logos/120px-Pokémon_Black_2_logo_EN.png',
    gameId: 'black-2',
  },
  {
    id: 'white-2',
    name: 'Pokemon White 2',
    logoPath: '/logos/120px-Pokémon_White_2_logo_EN.png',
    gameId: 'white-2',
  },
];

/**
 * Get logos for a specific game ID
 */
export function getLogosForGame(gameId: string): GameLogo[] {
  return GAME_LOGOS.filter(logo => logo.gameId === gameId);
}

/**
 * Get all unique game IDs that have logos
 */
export function getAvailableGameIds(): string[] {
  return [...new Set(GAME_LOGOS.map(logo => logo.gameId))];
}

/**
 * Get logo by ID
 */
export function getLogoById(logoId: string): GameLogo | undefined {
  return GAME_LOGOS.find(logo => logo.id === logoId);
}

