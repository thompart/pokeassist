/**
 * Cookie utilities for saving and loading run data
 */

const COOKIE_NAME = 'pokeassist_runs';
const COOKIE_EXPIRY_DAYS = 365;

export interface SavedRun {
  runId: string;
  sessionId: string;
  gameName: string;
  playerNames: string[];
  runNumber: number;
  lastAccessed: string;
}

/**
 * Get all saved runs from cookies
 */
export function getSavedRuns(): SavedRun[] {
  if (typeof document === 'undefined') return [];
  
  const cookies = document.cookie.split(';');
  const runCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  
  if (!runCookie) return [];
  
  try {
    const value = decodeURIComponent(runCookie.split('=')[1]);
    return JSON.parse(value) as SavedRun[];
  } catch (error) {
    console.error('Error parsing saved runs from cookies:', error);
    return [];
  }
}

/**
 * Save a run to cookies
 */
export function saveRun(run: SavedRun): void {
  if (typeof document === 'undefined') return;
  
  const savedRuns = getSavedRuns();
  
  // Remove existing run if it exists (update scenario)
  const filteredRuns = savedRuns.filter(r => r.runId !== run.runId);
  
  // Add the new/updated run
  const updatedRuns = [...filteredRuns, run];
  
  // Limit to 10 most recent runs
  const limitedRuns = updatedRuns
    .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    .slice(0, 10);
  
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(limitedRuns))};expires=${expiryDate.toUTCString()};path=/`;
}

/**
 * Remove a run from cookies
 */
export function removeRun(runId: string): void {
  if (typeof document === 'undefined') return;
  
  const savedRuns = getSavedRuns();
  const filteredRuns = savedRuns.filter(r => r.runId !== runId);
  
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(filteredRuns))};expires=${expiryDate.toUTCString()};path=/`;
}

/**
 * Update last accessed time for a run
 */
export function updateLastAccessed(runId: string): void {
  const savedRuns = getSavedRuns();
  const run = savedRuns.find(r => r.runId === runId);
  
  if (run) {
    run.lastAccessed = new Date().toISOString();
    saveRun(run);
  }
}

/**
 * Check if cookies are enabled/consented
 */
export function hasCookieConsent(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('pokeassist_consent=true');
}

/**
 * Set cookie consent
 */
export function setCookieConsent(consented: boolean): void {
  if (typeof document === 'undefined') return;
  
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  document.cookie = `pokeassist_consent=${consented};expires=${expiryDate.toUTCString()};path=/`;
}

