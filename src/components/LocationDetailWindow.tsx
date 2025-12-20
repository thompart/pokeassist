'use client';
import { useState, useEffect, useRef } from 'react';
import { getLocationSplashImagePath } from '@/lib/splashImages';
import { supabase } from '@/lib/supabase';
import PokemonSelector from './PokemonSelector';
import { getLocationEncounters } from '@/lib/encounters';
import type { Pair } from '@/types/database';
import { Plus } from 'lucide-react';

interface LocationDetailWindowProps {
  locationName: string;
  description: string | null;
  gameId: string;
  runId: string;
  sessionId: string;
  playerNames: string[];
  playerCount: number;
  darkMode: boolean;
  pairs: Pair[];
  onClose: () => void;
  onAddPair: (encounter: string, pokemon: string[]) => void;
}

export default function LocationDetailWindow({
  locationName,
  description,
  gameId,
  runId,
  sessionId,
  playerNames,
  playerCount,
  darkMode,
  pairs,
  onClose,
  onAddPair,
}: LocationDetailWindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [notes, setNotes] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [showAddPairModal, setShowAddPairModal] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<string | null>(null);
  const [pairFormData, setPairFormData] = useState<string[]>(Array(playerCount).fill(''));
  const windowRef = useRef<HTMLDivElement>(null);

  const splashImage = getLocationSplashImagePath(gameId, locationName);

  // Load notes
  useEffect(() => {
    loadNotes();
  }, [runId, locationName]);

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from('location_notes')
        .select('notes')
        .eq('run_id', runId)
        .eq('location', locationName)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine
        console.error('Error loading notes:', error);
      } else if (data) {
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('location_notes')
        .upsert({
          run_id: runId,
          location: locationName,
          notes: notes,
        }, {
          onConflict: 'run_id,location',
        });

      if (error) {
        console.error('Error saving notes:', error);
        alert('Error saving notes: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleAddPairClick = (encounter: string) => {
    setSelectedEncounter(encounter);
    setPairFormData(Array(playerCount).fill(''));
    setShowAddPairModal(true);
  };

  const handlePairSubmit = () => {
    if (selectedEncounter && pairFormData.every(p => p.trim() !== '')) {
      onAddPair(selectedEncounter, pairFormData);
      setShowAddPairModal(false);
      setSelectedEncounter(null);
      setPairFormData(Array(playerCount).fill(''));
    }
  };

  // Get encounters for this location
  const encounters = getLocationEncounters(gameId, locationName);
  
  // Check which encounters already have pairs
  const encountersWithPairs = new Set(pairs.map(pair => pair.location));
  
  // Filter out encounters that already have pairs
  const availableEncounters = encounters.filter(encounter => !encountersWithPairs.has(encounter));

  return (
    <>
      <div
        ref={windowRef}
        className={`fixed z-50 backdrop-blur-md rounded-xl shadow-2xl border overflow-hidden ${
          darkMode
            ? 'bg-black/90 border-white/20'
            : 'bg-white/95 border-slate-300/50'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '400px',
          height: '430px',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        {/* Background splash image */}
        {/* To adjust blur: change 'blur(8px)' value (higher = more blur) */}
        {/* To adjust transparency: change 'opacity-30' class (0.10 = 10%, 0.50 = 50%, etc.) */}
        {splashImage && (
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: `url(${splashImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(4px)',
            }}
          />
        )}

        {/* Content */}
        <div className={`relative z-10 h-full flex flex-col ${darkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Lato, sans-serif' }}>
          {/* Header - draggable */}
          <div
            onMouseDown={handleMouseDown}
            className={`px-6 py-4 border-b cursor-grab active:cursor-grabbing flex items-center justify-between ${
              darkMode
                ? 'border-white/20 bg-black/50'
                : 'border-slate-300/50 bg-slate-100'
            }`}
          >
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Perandory, serif' }}>{locationName}</h2>
              {description && (
                <p className={`text-sm italic ${darkMode ? 'text-white/70' : 'text-slate-600'}`} style={{ fontFamily: "'Pokemon DP Pro', monospace" }}>{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`ml-4 text-2xl font-bold transition-colors ${
                darkMode
                  ? 'text-white/70 hover:text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              ×
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Encounters section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Perandory, serif' }}>Encounters:</h3>
              <div className="space-y-2">
                {encounters.map((encounter, index) => {
                  const hasPair = encountersWithPairs.has(encounter);
                  const isAvailable = availableEncounters.includes(encounter);
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between rounded-lg px-4 py-2 ${
                        darkMode
                          ? hasPair ? 'bg-white/5' : 'bg-white/10'
                          : hasPair ? 'bg-slate-100' : 'bg-slate-50'
                      }`}
                      style={{ fontFamily: "'Pokemon DP Pro', monospace" }}
                    >
                      <span className={hasPair ? 'opacity-50' : ''}>{encounter}</span>
                      {hasPair ? (
                        <span className={`text-xs ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>Added</span>
                      ) : (
                        <button
                          onClick={() => handleAddPairClick(encounter)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? 'bg-white/20 text-white hover:bg-white/30'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                          title="Add Encounter"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Perandory, serif' }}>Notes:</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Add notes about this location..."
                className={`w-full h-32 border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 transition-colors ${
                  darkMode
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loadingNotes || savingNotes}
                style={{ fontFamily: 'Lato, sans-serif' }}
              />
              {savingNotes && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-slate-500'}`} style={{ fontFamily: 'Lato, sans-serif' }}>Saving...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Encounter Modal */}
      {showAddPairModal && selectedEncounter && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className={`backdrop-blur-md rounded-xl shadow-2xl border p-6 w-full max-w-md ${
            darkMode
              ? 'bg-black/90 border-white/20'
              : 'bg-white/95 border-slate-300/50'
          }`} style={{ fontFamily: 'Lato, sans-serif' }}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Add Encounter - {selectedEncounter}
            </h3>
            <div className="space-y-4">
              {playerNames.map((playerName, index) => (
                <div key={index}>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white/90' : 'text-slate-700'}`}>
                    {playerName}'s Pokemon
                  </label>
                  <PokemonSelector
                    value={pairFormData[index] || ''}
                    onChange={(value) => {
                      const newData = [...pairFormData];
                      newData[index] = value;
                      setPairFormData(newData);
                    }}
                    placeholder="Select Pokemon"
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={handlePairSubmit}
                  disabled={!pairFormData.every(p => p.trim() !== '')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    darkMode
                      ? 'bg-white/20 text-white hover:bg-white/30 disabled:bg-gray-600 disabled:cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  Add Encounter
                </button>
                <button
                  onClick={() => {
                    setShowAddPairModal(false);
                    setSelectedEncounter(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    darkMode
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

