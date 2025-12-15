export interface Session {
  id: string;
  player1_name: string;
  player2_name: string;
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
  location: string;
  pokemon1: string | null;
  pokemon2: string | null;
  created_at: string;
}

export interface RunWithPairs extends Run {
  pairs: Pair[];
}

export interface SessionWithRuns extends Session {
  runs: Run[];
}

