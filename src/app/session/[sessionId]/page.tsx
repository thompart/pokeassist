'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session, Run } from '@/types/database';
import { getGameConfig } from '@/lib/gameConfig';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameDisplayName, setGameDisplayName] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    setLoading(true);
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Load runs
      const { data: runsData, error: runsError } = await supabase
        .from('runs')
        .select('*')
        .eq('session_id', sessionId)
        .order('run_number', { ascending: true });

      if (runsError) throw runsError;

      setSession(sessionData);
      setRuns(runsData || []);
      
      // Get game display name
      if (sessionData?.game) {
        const config = getGameConfig(sessionData.game);
        setGameDisplayName(config?.displayName || sessionData.game);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Error loading session');
    } finally {
      setLoading(false);
    }
  };

  const createNewRun = async () => {
    if (!sessionId) return;

    const nextRunNumber = runs.length + 1;

    // Deactivate all existing runs
    if (runs.length > 0) {
      await supabase
        .from('runs')
        .update({ is_active: false })
        .eq('session_id', sessionId);
    }

    // Create new run
    const { data, error } = await supabase
      .from('runs')
      .insert({
        session_id: sessionId,
        run_number: nextRunNumber,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      alert('Error creating run: ' + error.message);
      return;
    }

    // Navigate to the new run
    router.push(`/session/${sessionId}/run/${data.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
          <p className="text-xl mb-6 text-slate-800">Session not found</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/session/${sessionId}`
      : `/session/${sessionId}`;
  const activeRun = runs.find((r) => r.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {gameDisplayName || session.game}
            </h1>
            <p className="text-slate-600 text-lg">
              {[
                session.player1_name,
                session.player2_name,
                session.player3_name,
                session.player4_name,
              ].filter(Boolean).join(' & ')}
            </p>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Share URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={createNewRun}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transform hover:-translate-y-0.5 transition-all"
          >
            Start New Run (Run {runs.length + 1})
          </button>
        </div>

        {/* Runs List */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Runs</h2>
          {runs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12 text-center">
              <p className="text-slate-500 text-lg">No runs yet. Click "Start New Run" above to begin!</p>
            </div>
          ) : (
            runs.map((run) => (
              <div
                key={run.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 p-6 transition-all hover:shadow-xl ${
                  run.is_active 
                    ? 'border-emerald-400 bg-gradient-to-br from-emerald-50/50 to-teal-50/50' 
                    : 'border-slate-200/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-800">
                        Run {run.run_number}
                      </h3>
                      {run.is_active && (
                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Started {new Date(run.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/session/${sessionId}/run/${run.id}`)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all"
                  >
                    Open Run
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
