export interface Session {
  id: string;
  player1_name: string;
  player2_name: string;
  player3_name?: string | null;
  player4_name?: string | null;
  player_count: number;
  challenge_type: 'nuzlocke' | 'soul-link';
  game: string;
  created_at: string;
}

export interface Run {
  id: string;
  session_id: string;
  run_number: number;
  is_active: boolean;
  created_at: string;
}

export interface Pair {
  id: string;
  run_id: string;
  player1_name: string;
  player2_name: string;
  player3_name?: string | null;
  player4_name?: string | null;
  location: string;
  pokemon1: string | null; // Legacy - kept for backward compatibility
  pokemon2: string | null; // Legacy - kept for backward compatibility
  pokemon?: string[] | null; // New format: array of Pokemon names
  created_at: string;
}

export interface RunWithPairs extends Run {
  pairs: Pair[];
}

export interface SessionWithRuns extends Session {
  runs: Run[];
}

export interface LocationNote {
  id: string;
  run_id: string;
  location: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

