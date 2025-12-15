'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAvailableGames } from '@/lib/gameConfig';

export default function Home() {
  const router = useRouter();
  const availableGames = getAvailableGames();
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [selectedGame, setSelectedGame] = useState(availableGames[0]?.value || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create session
      const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
        .insert({
          player1_name: player1,
          player2_name: player2,
          game: selectedGame,
        })
      .select('id')
      .single();

      if (sessionError) {
        alert('Error creating session: ' + sessionError.message);
      return;
    }

      // Auto-create run 1
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .insert({
          session_id: sessionData.id,
          run_number: 1,
          is_active: true,
        })
        .select('id')
        .single();

      if (runError) {
        alert('Error creating run: ' + runError.message);
        return;
      }

      // Redirect to the run page
      router.push(`/session/${sessionData.id}/run/${runData.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-slate-200/50 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            PokeAssist
          </h1>
          <p className="text-slate-600">Create a new Soul Link session</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
              required
            >
              {availableGames.map((game) => (
                <option key={game.value} value={game.value}>
                  {game.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Player 1 Name
            </label>
          <input
            type="text"
              placeholder="Enter player name"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            required
          />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Player 2 Name
            </label>
          <input
            type="text"
              placeholder="Enter player name"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            required
          />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating...' : 'Create Session & Start Run 1'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 text-center">
          Once created, you'll get a shareable link to track your Soul Link pairs!
          </p>
      </div>
    </div>
  );
}