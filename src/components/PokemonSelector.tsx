'use client';

import { useState, useEffect, useRef } from 'react';
import { getAllPokemon, searchPokemon, formatPokemonName, getPokemonSpriteUrl, type Pokemon } from '@/lib/pokemon';

interface PokemonSelectorProps {
  value: string;
  onChange: (pokemonName: string) => void;
  placeholder?: string;
  label?: string;
}

export default function PokemonSelector({
  value,
  onChange,
  placeholder = 'Search Pokemon...',
  label,
}: PokemonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Pokemon list on mount
  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);
        const allPokemon = await getAllPokemon();
        setPokemonList(allPokemon);
        setFilteredPokemon(allPokemon);
      } catch (error) {
        console.error('Failed to load Pokemon:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, []);

  // Update selected Pokemon when value changes
  useEffect(() => {
    if (value && pokemonList.length > 0) {
      const pokemon = pokemonList.find(
        (p) => p.name.toLowerCase() === value.toLowerCase()
      );
      setSelectedPokemon(pokemon || null);
    } else {
      setSelectedPokemon(null);
    }
  }, [value, pokemonList]);

  // Filter Pokemon based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchPokemon(pokemonList, searchQuery);
      setFilteredPokemon(filtered.slice(0, 100)); // Limit to 100 results for performance
    } else {
      setFilteredPokemon(pokemonList.slice(0, 50)); // Show first 50 when no search
    }
  }, [searchQuery, pokemonList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    onChange(pokemon.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSelectedPokemon(null);
    onChange('');
    setSearchQuery('');
    setIsOpen(false);
  };

  const displayValue = selectedPokemon
    ? formatPokemonName(selectedPokemon.name)
    : searchQuery || '';

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-semibold text-white/90 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="flex items-center gap-2">
          {selectedPokemon && (
            <img
              src={getPokemonSpriteUrl(selectedPokemon.id)}
              alt={selectedPokemon.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback if sprite fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all outline-none text-white placeholder:text-white/50"
          />
          {selectedPokemon && (
            <button
              onClick={handleClear}
              className="text-white/50 hover:text-white/80 transition-colors"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-white/50">Loading Pokemon...</div>
            ) : filteredPokemon.length === 0 ? (
              <div className="p-4 text-center text-white/50">
                No Pokemon found
              </div>
            ) : (
              <div className="py-2">
                {filteredPokemon.map((pokemon) => (
                  <button
                    key={pokemon.id}
                    onClick={() => handleSelect(pokemon)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-left"
                    type="button"
                  >
                    <img
                      src={getPokemonSpriteUrl(pokemon.id)}
                      alt={pokemon.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {formatPokemonName(pokemon.name)}
                      </div>
                      <div className="text-xs text-white/50">#{pokemon.id}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

