/**
 * Encounters configuration for each game
 * Maps location names to their available encounters
 */

import { getGameConfig } from './gameConfig';

export interface EncountersConfig {
  [locationName: string]: string[];
}

// Black & White encounters
const BW_ENCOUNTERS: EncountersConfig = {
  'Icirrus City': ['Icirrus City', 'test'],
  // Add more locations as needed - for now, default to location name
};

// HeartGold & SoulSilver encounters
const HGSS_ENCOUNTERS: EncountersConfig = {
  // Add encounters as needed - for now, default to location name
};

/**
 * Get encounters for a specific location in a game
 * If no specific encounters are defined, returns the location name as the default encounter
 */
export function getLocationEncounters(gameId: string, locationName: string): string[] {
  const encountersMap = gameId === 'black-white' ? BW_ENCOUNTERS : HGSS_ENCOUNTERS;
  
  if (encountersMap[locationName]) {
    return encountersMap[locationName];
  }
  
  // Default: location name is the encounter
  return [locationName];
}

/**
 * Get all encounters for a game
 */
export function getAllEncounters(gameId: string): string[] {
  const encountersMap = gameId === 'black-white' ? BW_ENCOUNTERS : HGSS_ENCOUNTERS;
  const allEncounters: string[] = [];
  
  // Get all location names from game config
  const config = getGameConfig(gameId);
  
  if (!config) return [];
  
  // Get encounters for each location
  Object.keys(config.locationMap).forEach((color) => {
    const locationName = config.locationMap[color];
    const encounters = getLocationEncounters(gameId, locationName);
    allEncounters.push(...encounters);
  });
  
  // Remove duplicates
  return [...new Set(allEncounters)];
}

