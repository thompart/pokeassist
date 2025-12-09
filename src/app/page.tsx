'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [location, setLocation] = useState('');
  const [savedId, setSavedId] = useState(sessionId || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('sessions')
      .insert({ player1_name: player1, player2_name: player2, location })
      .select('id')
      .single();

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    setSavedId(data.id);
    alert(`Saved! Share: /?sessionId=${data.id}`);
  };

  const loadSession = async () => {
    if (sessionId) {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (data) {
        setPlayer1(data.player1_name);
        setPlayer2(data.player2_name);
        setLocation(data.location);
      }
    }
  };

  // Load on mount if sessionId present
  useEffect(() => {
    if (sessionId && !savedId) {
      loadSession();
    }
  }, [sessionId, savedId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Soul Link Session</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Player 1 Name"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Player 2 Name"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Current Location (e.g., Route 31)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Save & Generate URL
          </button>
        </form>
        {savedId && (
          <p className="mt-4 text-sm">
            Session ID: {savedId} | URL: <a href={`/?sessionId=${savedId}`} className="text-blue-500 underline">Open Shared Session</a>
          </p>
        )}
      </div>
    </div>
  );
}