'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedRuns, hasCookieConsent, updateLastAccessed, saveRun } from '@/lib/cookies';
import { GAME_LOGOS, type GameLogo } from '@/lib/gameLogos';
import CookieConsent from '@/components/CookieConsent';
import MenuBackground from '@/components/MenuBackground';
import { supabase } from '@/lib/supabase';
import { getGameConfig } from '@/lib/gameConfig';
import { Play, Plus, FolderOpen, Gamepad2, Users, Sliders, ArrowLeft, Sun, Moon, Joystick, Shuffle, X, TrendingUp, Copy, Sparkles, ToggleLeft } from 'lucide-react';

type View = 'home' | 'new-game' | 'load-game';

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('home');
  const [savedRuns, setSavedRuns] = useState(getSavedRuns());
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setSavedRuns(getSavedRuns());
  }, [currentView]);

  const handleContinue = () => {
    const mostRecentRun = savedRuns.sort(
      (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    )[0];
    
    if (mostRecentRun) {
      updateLastAccessed(mostRecentRun.runId);
      router.push(`/session/${mostRecentRun.sessionId}/run/${mostRecentRun.runId}`);
    }
  };

  const handleNewGame = () => {
    setCurrentView('new-game');
  };

  const handleLoadGame = () => {
    setCurrentView('load-game');
  };

  const canContinue = savedRuns.length > 0 && hasCookieConsent();
  const canLoadGame = savedRuns.length > 0 && hasCookieConsent();

  return (
    <>
      <div className={`min-h-screen flex items-center justify-center relative transition-all duration-500 ${darkMode ? '' : 'bg-slate-50'}`}>
        <MenuBackground darkMode={darkMode} />
        {/* Dark Mode Toggle - Top Right */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`fixed top-6 right-6 z-50 p-3 backdrop-blur-md border rounded-lg transition-all duration-200 ${
            darkMode
              ? 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
              : 'bg-white/60 hover:bg-white/80 border-white/40 text-slate-700 hover:text-slate-900'
          }`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        {currentView === 'home' && (
          <div className="text-center animate-fade-in relative z-10 max-w-2xl mx-auto px-8 py-12">
            <div className={`${darkMode ? 'bg-black/80 border-white/20' : 'bg-white/90 border-white/20'} backdrop-blur-md rounded-2xl shadow-2xl border p-12`}>
              <h1 className={`text-7xl font-bold mb-16 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Perandory, serif' }}>
                PokeAssist
              </h1>
              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className={`flex items-center justify-center gap-2 w-full max-w-sm mx-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    canContinue
                      ? darkMode
                        ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/40 hover:shadow-lg'
                        : 'bg-white/60 backdrop-blur-md text-slate-900 border border-white/40 hover:bg-white/80 hover:border-white/60 hover:shadow-lg'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Play size={20} />
                  Continue
                </button>
                <button
                  onClick={handleNewGame}
                  className={`flex items-center justify-center gap-2 w-full max-w-sm mx-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    darkMode
                      ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/40 hover:shadow-lg'
                      : 'bg-white/60 backdrop-blur-md text-slate-900 border border-white/40 hover:bg-white/80 hover:border-white/60 hover:shadow-lg'
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Plus size={20} />
                  New Game
                </button>
                <button
                  onClick={handleLoadGame}
                  disabled={!canLoadGame}
                  className={`flex items-center justify-center gap-2 w-full max-w-sm mx-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    canLoadGame
                      ? darkMode
                        ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/40 hover:shadow-lg'
                        : 'bg-white/60 backdrop-blur-md text-slate-900 border border-white/40 hover:bg-white/80 hover:border-white/60 hover:shadow-lg'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <FolderOpen size={20} />
                  Load Game
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'new-game' && (
          <div className="relative z-10">
            <NewGameFlow onBack={() => setCurrentView('home')} darkMode={darkMode} />
          </div>
        )}

        {currentView === 'load-game' && (
          <div className="relative z-10">
            <LoadGameView 
            savedRuns={savedRuns}
            onBack={() => setCurrentView('home')}
            onSelect={(run) => {
              updateLastAccessed(run.runId);
              router.push(`/session/${run.sessionId}/run/${run.runId}`);
            }}
            darkMode={darkMode}
          />
          </div>
        )}
      </div>
      <CookieConsent />
    </>
  );
}

// New Game Flow - Single Page
function NewGameFlow({ onBack, darkMode }: { onBack: () => void; darkMode: boolean }) {
  const router = useRouter();
  const [gameType, setGameType] = useState<'nuzlocke' | 'soul-link' | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [customizations, setCustomizations] = useState<{ [key: string]: boolean }>({
    randomizer: false,
    noPotions: false,
    levelCap: false,
    dupesClause: true,
    shinyClause: false,
    setMode: false,
  });

  // Filter logos based on game type
  const availableLogos = gameType === 'nuzlocke'
    ? GAME_LOGOS.filter(logo => 
        // For nuzlocke, only show individual games (not combined)
        logo.id !== 'heartgold-soulsilver' && logo.id !== 'black-white'
      )
    : GAME_LOGOS; // For soul link, show all logos

  // Initialize player names when player count changes
  useEffect(() => {
    if (playerCount && gameType === 'soul-link') {
      setPlayerNames(Array(playerCount).fill(''));
    }
  }, [playerCount, gameType]);

  const handleCreateSession = async () => {
    if (!selectedGame) {
      alert('Please select a game');
      return;
    }

    // For soul link, require player names
    if (gameType === 'soul-link' && playerNames.some(name => !name.trim())) {
      alert('Please enter all player names');
      return;
    }

    try {
      const sessionData: any = {
        game: selectedGame,
        player_count: gameType === 'nuzlocke' ? 1 : playerNames.length,
        challenge_type: gameType,
      };

      // Add player names dynamically (only for soul link)
      if (gameType === 'soul-link') {
        playerNames.forEach((name, index) => {
          sessionData[`player${index + 1}_name`] = name;
        });
      } else {
        sessionData.player1_name = '';
      }

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select('id')
        .single();

      if (sessionError) {
        alert('Error creating session: ' + sessionError.message);
        return;
      }

      // Create run
      const { data: run, error: runError } = await supabase
        .from('runs')
        .insert({
          session_id: session.id,
          run_number: 1,
          is_active: true,
        })
        .select('id')
        .single();

      if (runError) {
        alert('Error creating run: ' + runError.message);
        return;
      }

      // Save to cookies if consent is given
      if (hasCookieConsent()) {
        const config = getGameConfig(selectedGame);
        saveRun({
          runId: run.id,
          sessionId: session.id,
          gameName: config?.displayName || selectedGame,
          playerNames: gameType === 'nuzlocke' ? [] : playerNames,
          runNumber: 1,
          lastAccessed: new Date().toISOString(),
        });
      }

      router.push(`/session/${session.id}/run/${run.id}`);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  const canCreate = gameType === 'nuzlocke' 
    ? selectedGame !== null
    : selectedGame !== null && playerCount !== null && playerNames.every(name => name.trim() !== '');

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 animate-fade-in relative">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-lg transition-all duration-200 mb-6 ${
          darkMode
            ? 'bg-black/60 hover:bg-black/70 border-white/20 text-white'
            : 'bg-white/60 hover:bg-white/80 border-white/40 text-slate-700 hover:text-slate-900'
        }`}
        style={{ fontFamily: 'Lato, sans-serif' }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="space-y-8">
        {/* Game Type Selection */}
        <div className="text-center mb-12">
          <div className={`${darkMode ? 'bg-black/80 border-white/20' : 'bg-white/90 border-white/20'} backdrop-blur-md rounded-2xl shadow-2xl border p-8 mb-8`}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <Joystick size={32} className={darkMode ? 'text-white' : 'text-slate-700'} />
              <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Perandory, serif' }}>
                Select Game Type
              </h2>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setGameType('nuzlocke');
                  setPlayerCount(1);
                  setSelectedGame(null);
                }}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                  gameType === 'nuzlocke'
                    ? darkMode
                      ? 'bg-white/30 backdrop-blur-md text-white border-2 border-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-md text-slate-900 border-2 border-slate-900 shadow-lg'
                    : darkMode
                      ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/40'
                      : 'bg-white/60 backdrop-blur-md text-slate-700 border border-white/40 hover:bg-white/80 hover:border-white/60'
                }`}
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                <Gamepad2 size={18} />
                Nuzlocke
              </button>
              <button
                onClick={() => {
                  setGameType('soul-link');
                  setPlayerCount(null);
                  setSelectedGame(null);
                }}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200 ${
                  gameType === 'soul-link'
                    ? darkMode
                      ? 'bg-white/30 backdrop-blur-md text-white border-2 border-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-md text-slate-900 border-2 border-slate-900 shadow-lg'
                    : darkMode
                      ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/40'
                      : 'bg-white/60 backdrop-blur-md text-slate-700 border border-white/40 hover:bg-white/80 hover:border-white/60'
                }`}
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                <Users size={18} />
                Soul Link
              </button>
            </div>
          </div>
        </div>

        {/* Game Selection & Details - Show when game type is selected */}
        {gameType && (
          <div className="space-y-6 animate-slide-down">
            {/* Select Game */}
            <div className="mb-8">
              <div className={`${darkMode ? 'bg-black/80 border-white/20' : 'bg-white/90 border-white/20'} backdrop-blur-md rounded-2xl shadow-2xl border p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <Gamepad2 size={24} className={darkMode ? 'text-white' : 'text-slate-700'} />
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Perandory, serif' }}>
                    Select Game
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableLogos.map((logo) => {
                    const isSelected = selectedGame === logo.gameId;
                    return (
                      <button
                        key={logo.id}
                        onClick={() => setSelectedGame(logo.gameId)}
                        className={`relative p-4 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? darkMode
                              ? 'bg-white/30 backdrop-blur-md border-2 border-white shadow-lg'
                              : 'bg-white/80 backdrop-blur-md border-2 border-slate-900 shadow-lg'
                            : darkMode
                              ? 'bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/40'
                              : 'bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 hover:border-white/60'
                        }`}
                      >
                        <img
                          src={logo.logoPath}
                          alt={logo.name}
                          className={`w-full h-auto transition-all duration-200 ${
                            isSelected 
                              ? 'grayscale-0 opacity-100' 
                              : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Player Count & Names - Only for Soul Link */}
            {gameType === 'soul-link' && (
              <div className="space-y-6 animate-slide-down mb-8">
                <div className={`${darkMode ? 'bg-black/80 border-white/20' : 'bg-white/90 border-white/20'} backdrop-blur-md rounded-2xl shadow-2xl border p-8`}>
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Perandory, serif' }}>
                    Players
                  </h3>
                  <div className="flex gap-3 mb-6">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setPlayerCount(count)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-base transition-all duration-200 ${
                          playerCount === count
                            ? darkMode
                              ? 'bg-white/30 backdrop-blur-md text-white border-2 border-white shadow-lg'
                              : 'bg-white/80 backdrop-blur-md text-slate-900 border-2 border-slate-900 shadow-lg'
                            : darkMode
                              ? 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 hover:border-white/40'
                              : 'bg-white/60 backdrop-blur-md text-slate-700 border border-white/40 hover:bg-white/80 hover:border-white/60'
                        }`}
                        style={{ fontFamily: 'Lato, sans-serif' }}
                      >
                        <Users size={16} />
                        {count}
                      </button>
                    ))}
                  </div>

                  {playerCount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-down">
                      {playerNames.map((name, index) => (
                        <div key={index}>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/80' : 'text-slate-600'}`} style={{ fontFamily: 'Lato, sans-serif' }}>
                            Player {index + 1} Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const newNames = [...playerNames];
                              newNames[index] = e.target.value;
                              setPlayerNames(newNames);
                            }}
                            placeholder={`Enter player ${index + 1} name`}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all outline-none backdrop-blur-sm ${
                              darkMode
                                ? 'border-white/30 bg-white/10 text-white placeholder:text-white/50 focus:ring-white focus:border-white'
                                : 'border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:ring-slate-900 focus:border-slate-900'
                            }`}
                            style={{ fontFamily: 'Lato, sans-serif' }}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customizations */}
            {gameType && (
              <div className="animate-slide-down mb-8">
                <div className={`${darkMode ? 'bg-black/80 border-white/20' : 'bg-white/90 border-white/20'} backdrop-blur-md rounded-2xl shadow-2xl border p-8`}>
                  <div className="flex items-center gap-3 mb-6">
                    <Sliders size={24} className={darkMode ? 'text-white' : 'text-slate-700'} />
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Perandory, serif' }}>
                      Customizations
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(customizations).map(([key, value]) => {
                      // Map customization keys to icons
                      const iconMap: { [key: string]: React.ReactNode } = {
                        randomizer: <Shuffle size={18} />,
                        noPotions: <X size={18} />,
                        levelCap: <TrendingUp size={18} />,
                        dupesClause: <Copy size={18} />,
                        shinyClause: <Sparkles size={18} />,
                        setMode: <ToggleLeft size={18} />,
                      };
                      const icon = iconMap[key] || <Sliders size={18} />;
                      
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-3 p-4 backdrop-blur-md border rounded-xl cursor-pointer transition-all duration-200 ${
                            darkMode
                              ? 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40'
                              : 'bg-white/60 border-white/40 hover:bg-white/80 hover:border-white/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setCustomizations({ ...customizations, [key]: e.target.checked })}
                            className={`w-4 h-4 rounded focus:ring-2 ${
                              darkMode
                                ? 'border-white/40 text-white focus:ring-white'
                                : 'border-slate-300 text-slate-900 focus:ring-slate-900'
                            }`}
                          />
                          <div className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                            {icon}
                            <span className="font-semibold text-sm capitalize" style={{ fontFamily: 'Lato, sans-serif' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Create Button */}
            {canCreate && (
              <div className="text-center animate-slide-down mt-8">
                <button
                  onClick={handleCreateSession}
                  className={`flex items-center justify-center gap-2 mx-auto px-8 py-4 backdrop-blur-md border-2 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                    darkMode
                      ? 'bg-white/30 text-white border-white hover:bg-white/40'
                      : 'bg-white/80 text-slate-900 border-slate-900 hover:bg-white'
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Play size={20} />
                  Start Game
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Load Game View Component
function LoadGameView({
  savedRuns,
  onBack,
  onSelect,
  darkMode
}: {
  savedRuns: ReturnType<typeof getSavedRuns>;
  onBack: () => void;
  onSelect: (run: ReturnType<typeof getSavedRuns>[0]) => void;
  darkMode: boolean;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in px-6 relative">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-lg transition-all duration-200 mb-6 ${
          darkMode
            ? 'bg-black/60 hover:bg-black/70 border-white/20 text-white'
            : 'bg-white/60 hover:bg-white/80 border-white/40 text-slate-700 hover:text-slate-900'
        }`}
        style={{ fontFamily: 'Lato, sans-serif' }}
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <div className={`${darkMode ? 'bg-black/80 border-white/20' : 'bg-white/90 border-white/20'} backdrop-blur-md rounded-2xl shadow-2xl border p-12`}>
        <h2 className={`text-5xl font-bold mb-12 text-center ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Perandory, serif' }}>
          Load Game
        </h2>
        {savedRuns.length === 0 ? (
          <div className="text-center py-12">
            <p className={darkMode ? 'text-white/60' : 'text-slate-500'} style={{ fontFamily: 'Lato, sans-serif' }}>
              No saved games found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedRuns.map((run) => (
              <button
                key={run.runId}
                onClick={() => onSelect(run)}
                className={`w-full p-5 backdrop-blur-md border rounded-xl text-left transition-all duration-200 hover:shadow-lg ${
                  darkMode
                    ? 'bg-white/20 border-white/30 hover:bg-white/30 hover:border-white/40'
                    : 'bg-white/60 border-white/40 hover:bg-white/80 hover:border-white/60'
                }`}
              >
                <div className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Lato, sans-serif' }}>
                  {run.gameName} - Run {run.runNumber}
                </div>
                <div className={`text-sm mt-1 ${darkMode ? 'text-white/80' : 'text-slate-600'}`} style={{ fontFamily: 'Lato, sans-serif' }}>
                  {run.playerNames.length > 0 ? run.playerNames.join(' & ') : 'Nuzlocke'}
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-slate-400'}`} style={{ fontFamily: 'Lato, sans-serif' }}>
                  Last accessed: {new Date(run.lastAccessed).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
