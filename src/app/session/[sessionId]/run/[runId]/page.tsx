'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session, Run, Pair } from '@/types/database';
import PokemonSelector from '@/components/PokemonSelector';
import { getGameConfig, type GameConfig } from '@/lib/gameConfig';

// Helper to convert RGB to hex
function rgbToHex(r: number, g: number, b: number, a?: number): string {
  // If pixel is transparent or nearly transparent, return empty string
  if (a !== undefined && a < 128) {
    return '';
  }
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

export default function RunPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const runId = params.runId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'add-pair' | 'box' | null>(null);
  const [showAddPairModal, setShowAddPairModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [boxPosition, setBoxPosition] = useState({ x: 24, y: 80 });
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [boxDragOffset, setBoxDragOffset] = useState({ x: 0, y: 0 });
  const [pairFormData, setPairFormData] = useState({
    location: '',
    pokemon1: '',
    pokemon2: '',
  });
  const [editingPair, setEditingPair] = useState<Pair | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const hitmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hitmapImageRef = useRef<HTMLImageElement | null>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapBackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapObjectsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapMapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (sessionId && runId) {
      loadData();
    }
  }, [sessionId, runId]);

  // Load hitmap and map images into canvases
  useEffect(() => {
    if (!gameConfig) return;
    
    console.log('Loading images...');
    
    const { assets, dimensions } = gameConfig;
    
    // Load hitmap
    const hitmapImg = new Image();
    hitmapImg.crossOrigin = 'anonymous';
    hitmapImg.src = assets.hitmap;
    
    // Load map layers
    const backImg = new Image();
    backImg.crossOrigin = 'anonymous';
    backImg.src = assets.back;
    
    const objectsImg = new Image();
    objectsImg.crossOrigin = 'anonymous';
    objectsImg.src = assets.objects;
    
    const mapImg = new Image();
    mapImg.crossOrigin = 'anonymous';
    mapImg.src = assets.map;
    
    let loadedCount = 0;
    const totalImages = 4;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        console.log('All images loaded');
        
        // Create canvases for map layers
        const backCanvas = document.createElement('canvas');
        backCanvas.width = dimensions.width;
        backCanvas.height = dimensions.height;
        const backCtx = backCanvas.getContext('2d');
        if (backCtx) {
          backCtx.drawImage(backImg, 0, 0);
          mapBackCanvasRef.current = backCanvas;
        }
        
        const objectsCanvas = document.createElement('canvas');
        objectsCanvas.width = dimensions.width;
        objectsCanvas.height = dimensions.height;
        const objectsCtx = objectsCanvas.getContext('2d');
        if (objectsCtx) {
          objectsCtx.drawImage(objectsImg, 0, 0);
          mapObjectsCanvasRef.current = objectsCanvas;
        }
        
        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = dimensions.width;
        mapCanvas.height = dimensions.height;
        const mapCtx = mapCanvas.getContext('2d');
        if (mapCtx) {
          mapCtx.drawImage(mapImg, 0, 0);
          mapMapCanvasRef.current = mapCanvas;
        }
        
        // Create hitmap canvas
        const hitmapCanvas = document.createElement('canvas');
        hitmapCanvas.width = dimensions.width;
        hitmapCanvas.height = dimensions.height;
        const hitmapCtx = hitmapCanvas.getContext('2d');
        if (hitmapCtx) {
          hitmapCtx.drawImage(hitmapImg, 0, 0);
          hitmapCanvasRef.current = hitmapCanvas;
        }
        
        // Create highlight canvas
        const highlightCanvas = document.createElement('canvas');
        highlightCanvas.width = dimensions.width;
        highlightCanvas.height = dimensions.height;
        highlightCanvasRef.current = highlightCanvas;
        
        setHoveredLocation(null);
      }
    };
    
    hitmapImg.onload = checkAllLoaded;
    hitmapImg.onerror = () => console.error('Failed to load hitmap');
    backImg.onload = checkAllLoaded;
    backImg.onerror = () => console.error('Failed to load back layer');
    objectsImg.onload = checkAllLoaded;
    objectsImg.onerror = () => console.error('Failed to load objects layer');
    mapImg.onload = checkAllLoaded;
    mapImg.onerror = () => console.error('Failed to load map layer');
  }, [gameConfig]);

  // Update highlight overlay when hovered location changes
  useEffect(() => {
    if (!highlightCanvasRef.current || !gameConfig) {
      return;
    }
    
    const { dimensions } = gameConfig;
    
    // Always clear first - this ensures no stale highlights remain
    const ctx = highlightCanvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // If no location is hovered, we're done (already cleared above)
    if (!hoveredColor || !hitmapCanvasRef.current) {
      return;
    }

    if (!mapBackCanvasRef.current || !mapObjectsCanvasRef.current || !mapMapCanvasRef.current) {
      return;
    }

    const highlightCtx = highlightCanvasRef.current.getContext('2d');
    const hitmapCtx = hitmapCanvasRef.current.getContext('2d');
    const backCtx = mapBackCanvasRef.current.getContext('2d');
    const objectsCtx = mapObjectsCanvasRef.current.getContext('2d');
    const mapCtx = mapMapCanvasRef.current.getContext('2d');
    
    if (!highlightCtx || !hitmapCtx || !backCtx || !objectsCtx || !mapCtx) return;

    // Get all pixels from hitmap and map layers
    const hitmapData = hitmapCtx.getImageData(0, 0, dimensions.width, dimensions.height);
    const backData = backCtx.getImageData(0, 0, dimensions.width, dimensions.height);
    const objectsData = objectsCtx.getImageData(0, 0, dimensions.width, dimensions.height);
    const mapData = mapCtx.getImageData(0, 0, dimensions.width, dimensions.height);
    const hitmapPixels = hitmapData.data;

    // Create new image data for highlight
    const highlightData = highlightCtx.createImageData(dimensions.width, dimensions.height);

    // Convert hex color to RGB
    const hex = hoveredColor.replace('#', '');
    const targetR = parseInt(hex.substring(0, 2), 16);
    const targetG = parseInt(hex.substring(2, 4), 16);
    const targetB = parseInt(hex.substring(4, 6), 16);

    // ============================================
    // CUSTOMIZE HIGHLIGHT EFFECT HERE
    // ============================================
    const hueShift = 0; // Degrees to shift hue (0-360)
    const saturationBoost = 2.5; // Multiply saturation (1.0 = no change, 2.0 = double)
    const brightnessBoost = 1.0; // Multiply brightness (1.0 = no change, 2.0 = double)
    const overlayOpacity = 255; // 0-255, higher = more opaque overlay

    // Process each pixel
    for (let i = 0; i < hitmapPixels.length; i += 4) {
      // Check hitmap to see if this pixel belongs to the hovered location
      const hitR = hitmapPixels[i];
      const hitG = hitmapPixels[i + 1];
      const hitB = hitmapPixels[i + 2];
      const hitA = hitmapPixels[i + 3];

      // Check if hitmap pixel matches the hovered location color
      // Note: Background is now black (#000000), so check for non-black
      const isMatch = hitA >= 128 && 
                      !(hitR === 0 && hitG === 0 && hitB === 0) && // Not black
                      Math.abs(hitR - targetR) <= 2 && 
                      Math.abs(hitG - targetG) <= 2 && 
                      Math.abs(hitB - targetB) <= 2;

      if (isMatch) {
        // Sample from the actual map layers (composited together)
        // Combine back, objects, and map layers
        const backR = backData.data[i];
        const backG = backData.data[i + 1];
        const backB = backData.data[i + 2];
        const backA = backData.data[i + 3];
        
        const objR = objectsData.data[i];
        const objG = objectsData.data[i + 1];
        const objB = objectsData.data[i + 2];
        const objA = objectsData.data[i + 3];
        
        const mapR = mapData.data[i];
        const mapG = mapData.data[i + 1];
        const mapB = mapData.data[i + 2];
        const mapA = mapData.data[i + 3];
        
        // Composite layers: back first, then objects, then map (alpha blending)
        let r = backR, g = backG, b = backB;
        
        // Blend objects layer
        if (objA > 0) {
          const objAlpha = objA / 255;
          r = r * (1 - objAlpha) + objR * objAlpha;
          g = g * (1 - objAlpha) + objG * objAlpha;
          b = b * (1 - objAlpha) + objB * objAlpha;
        }
        
        // Blend map layer
        if (mapA > 0) {
          const mapAlpha = mapA / 255;
          r = r * (1 - mapAlpha) + mapR * mapAlpha;
          g = g * (1 - mapAlpha) + mapG * mapAlpha;
          b = b * (1 - mapAlpha) + mapB * mapAlpha;
        }

        // Convert RGB to HSL for hue shifting
        const rgbNorm = [r / 255, g / 255, b / 255];
        const max = Math.max(...rgbNorm);
        const min = Math.min(...rgbNorm);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === rgbNorm[0]) {
            h = ((rgbNorm[1] - rgbNorm[2]) / d + (rgbNorm[1] < rgbNorm[2] ? 6 : 0)) / 6;
          } else if (max === rgbNorm[1]) {
            h = ((rgbNorm[2] - rgbNorm[0]) / d + 2) / 6;
          } else {
            h = ((rgbNorm[0] - rgbNorm[1]) / d + 4) / 6;
          }
        }
        
        // Apply hue shift, saturation boost, and brightness boost
        h = ((h * 360 + hueShift) % 360) / 360;
        s = Math.min(1, s * saturationBoost);
        const newL = Math.min(1, l * brightnessBoost);
        
        // Convert HSL back to RGB
        let newR, newG, newB;
        if (s === 0) {
          newR = newG = newB = newL;
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
          const p = 2 * newL - q;
          newR = hue2rgb(p, q, h + 1/3);
          newG = hue2rgb(p, q, h);
          newB = hue2rgb(p, q, h - 1/3);
        }
        
        highlightData.data[i] = Math.round(newR * 255);
        highlightData.data[i + 1] = Math.round(newG * 255);
        highlightData.data[i + 2] = Math.round(newB * 255);
        highlightData.data[i + 3] = overlayOpacity;
      } else {
        // Transparent for non-matching pixels
        highlightData.data[i] = 0;
        highlightData.data[i + 1] = 0;
        highlightData.data[i + 2] = 0;
        highlightData.data[i + 3] = 0;
      }
    }

    // Draw the highlight
    highlightCtx.putImageData(highlightData, 0, 0);
  }, [hoveredColor, hoveredLocation, gameConfig]); // Re-run when either changes

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('[data-parallax-container]');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate offset from center (normalized to -1 to 1) for parallax
      const offsetX = (e.clientX - centerX) / (rect.width / 2);
      const offsetY = (e.clientY - centerY) / (rect.height / 2);
      setMousePosition({ x: offsetX, y: offsetY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mouse tracking for location detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!hitmapCanvasRef.current) {
        return;
      }
      // Find the aspect ratio container - this is the correct coordinate space
      const aspectRatioContainer = document.querySelector('[data-aspect-container]') as HTMLElement;
      if (!aspectRatioContainer || !hitmapCanvasRef.current) {
        return;
      }

      // Use the container's bounding rect instead of the image's
      // This ensures we're always working with the correct coordinate space
      const containerRect = aspectRatioContainer.getBoundingClientRect();
      
      // Calculate mouse position relative to the container
      const relativeX = e.clientX - containerRect.left;
      const relativeY = e.clientY - containerRect.top;
      
      // Check if mouse is within container bounds
      if (relativeX < 0 || relativeX >= containerRect.width || relativeY < 0 || relativeY >= containerRect.height) {
        // Always clear when outside bounds
        setHoveredLocation(null);
        setHoveredColor(null);
        return;
      }

      // Calculate pixel position in source image
      if (!gameConfig) return;
      const imgNaturalWidth = gameConfig.dimensions.width;
      const imgNaturalHeight = gameConfig.dimensions.height;
      
      // Calculate how the image is scaled (object-contain)
      // The image fits within the container while maintaining aspect ratio
      const imgAspect = imgNaturalWidth / imgNaturalHeight;
      const containerAspect = containerRect.width / containerRect.height;
      
      let scale: number;
      let offsetX = 0;
      let offsetY = 0;
      
      if (imgAspect > containerAspect) {
        // Image is wider than container - container width determines scale, image is centered vertically
        scale = imgNaturalWidth / containerRect.width;
        const scaledHeight = imgNaturalHeight / scale;
        offsetY = (containerRect.height - scaledHeight) / 2;
      } else {
        // Image is taller than container - container height determines scale, image is centered horizontally
        scale = imgNaturalHeight / containerRect.height;
        const scaledWidth = imgNaturalWidth / scale;
        offsetX = (containerRect.width - scaledWidth) / 2;
      }
      
      // Adjust for centering (subtract the offset where the image starts within the container)
      const adjustedX = relativeX - offsetX;
      const adjustedY = relativeY - offsetY;
      
      // Convert to pixel coordinates
      const pixelX = Math.floor(adjustedX * scale);
      const pixelY = Math.floor(adjustedY * scale);
      
      // Clamp to image bounds
      if (!gameConfig) return;
      const clampedX = Math.max(0, Math.min(gameConfig.dimensions.width - 1, pixelX));
      const clampedY = Math.max(0, Math.min(gameConfig.dimensions.height - 1, pixelY));
      
      // Sample pixel from hitmap
      const ctx = hitmapCanvasRef.current.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        console.log('Could not get canvas context');
        return;
      }

      try {
        const imageData = ctx.getImageData(clampedX, clampedY, 1, 1);
        const [r, g, b, a] = imageData.data;
        
        // Check if pixel is transparent or black (background)
        const isBlack = r === 0 && g === 0 && b === 0;
        if (a < 128 || isBlack) {
          // Always clear if we detect background/transparent
          setHoveredLocation(null);
          setHoveredColor(null);
          return;
        }
        
        const hex = rgbToHex(r, g, b, a);
        
        // Check if this color maps to a location
        if (!gameConfig) return;
        const locationName = gameConfig.locationMap[hex];
        if (locationName) {
          setHoveredLocation(locationName);
          setHoveredColor(hex);
          setTooltipPosition({ x: e.clientX, y: e.clientY - 30 });
        } else {
          // Not a mapped location - always clear
          setHoveredLocation(null);
          setHoveredColor(null);
          // Debug logging
          if (Math.random() < 0.05) {
            console.log('Unmapped color:', hex, 'RGB:', r, g, b, 'Alpha:', a, 'Pixel:', clampedX, clampedY);
          }
        }
      } catch (error) {
        console.error('Error reading pixel:', error);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameConfig]); // Re-run when game config changes

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showSettings && !target.closest('[data-settings-menu]')) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [showSettings]);

  // Handle click on location
  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Map clicked! Hovered location:', hoveredLocation);
    if (hoveredLocation) {
      setPairFormData({
        location: hoveredLocation,
        pokemon1: '',
        pokemon2: '',
      });
      setEditingPair(null);
      setShowAddPairModal(true);
      setActiveTab('add-pair');
      // Position modal near click, but keep it on screen
      const modalX = Math.max(20, Math.min(e.clientX - 150, window.innerWidth - 400));
      const modalY = Math.max(80, Math.min(e.clientY - 100, window.innerHeight - 400));
      setModalPosition({ x: modalX, y: modalY });
    } else {
      console.log('No location hovered when clicked');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Load run
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (runError) throw runError;

      // Load pairs
      const { data: pairsData, error: pairsError } = await supabase
        .from('pairs')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

      if (pairsError) throw pairsError;

      setSession(sessionData);
      setRun(runData);
      setPairs(pairsData || []);
      
      // Load game configuration
      const config = getGameConfig(sessionData.game);
      if (!config) {
        throw new Error(`Game configuration not found for: ${sessionData.game}`);
      }
      setGameConfig(config);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading run data');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (showAddPairModal) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleBoxMouseDown = (e: React.MouseEvent) => {
    setIsDraggingBox(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setBoxDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && showAddPairModal) {
      setModalPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
    if (isDraggingBox) {
      setBoxPosition({
        x: e.clientX - boxDragOffset.x,
        y: e.clientY - boxDragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingBox(false);
  };

  useEffect(() => {
    if (isDragging || isDraggingBox) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, isDraggingBox, boxDragOffset]);

  const createPair = async () => {
    if (!pairFormData.location) {
      alert('Location is required');
      return;
    }

    const { data, error } = await supabase.from('pairs').insert({
      run_id: runId,
      player1_name: session!.player1_name,
      player2_name: session!.player2_name,
      location: pairFormData.location,
      pokemon1: pairFormData.pokemon1 || null,
      pokemon2: pairFormData.pokemon2 || null,
    }).select().single();

    if (error) {
      alert('Error creating pair: ' + error.message);
      return;
    }

    // Optimistically update the state without reloading
    if (data) {
      setPairs([...pairs, data]);
    }

    setPairFormData({ location: '', pokemon1: '', pokemon2: '' });
    setShowAddPairModal(false);
    setActiveTab(null);
  };

  const updatePair = async () => {
    if (!editingPair || !pairFormData.location) {
      alert('Location is required');
      return;
    }

    const { data, error } = await supabase
      .from('pairs')
      .update({
        location: pairFormData.location,
        pokemon1: pairFormData.pokemon1 || null,
        pokemon2: pairFormData.pokemon2 || null,
      })
      .eq('id', editingPair.id)
      .select()
      .single();

    if (error) {
      alert('Error updating pair: ' + error.message);
      return;
    }

    // Optimistically update the state without reloading
    if (data) {
      setPairs(pairs.map(pair => pair.id === editingPair.id ? data : pair));
    }

    setEditingPair(null);
    setPairFormData({ location: '', pokemon1: '', pokemon2: '' });
    setShowAddPairModal(false);
    setActiveTab(null);
  };

  const deletePair = async (pairId: string) => {
    if (!confirm('Are you sure you want to delete this pair?')) return;

    const { error } = await supabase.from('pairs').delete().eq('id', pairId);

    if (error) {
      alert('Error deleting pair: ' + error.message);
      return;
    }

    // Optimistically update the state without reloading
    setPairs(pairs.filter(pair => pair.id !== pairId));
  };

  const openEditPair = (pair: Pair) => {
    setEditingPair(pair);
    setPairFormData({
      location: pair.location,
      pokemon1: pair.pokemon1 || '',
      pokemon2: pair.pokemon2 || '',
    });
    setShowAddPairModal(true);
    setActiveTab('add-pair');
  };

  const handleTabClick = (tab: 'add-pair' | 'box') => {
    setActiveTab(tab);
    if (tab === 'add-pair') {
      setShowAddPairModal(true);
      setEditingPair(null);
      setPairFormData({ location: '', pokemon1: '', pokemon2: '' });
    } else {
      setShowAddPairModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !run) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <p className="text-xl mb-6 text-white">Run not found</p>
          <button
            onClick={() => router.push('/')}
            className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-white/30 transform hover:-translate-y-0.5 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">Loading game configuration...</div>
      </div>
    );
  }

  const mapAspectRatio = gameConfig.dimensions.width / gameConfig.dimensions.height;

  // Parallax offsets
  const backOffset = { x: 0, y: 0 }; // No movement (this is the map back layer)
  const objectsOffset = parallaxEnabled
    ? {
        x: mousePosition.x * gameConfig.parallax.objects.x,
        y: mousePosition.y * gameConfig.parallax.objects.y,
      }
    : { x: 0, y: 0 };
  const mapOffset = parallaxEnabled
    ? {
        x: mousePosition.x * gameConfig.parallax.map.x,
        y: mousePosition.y * gameConfig.parallax.map.y,
      }
    : { x: 0, y: 0 };
  // Background image reverse parallax
  const backgroundOffset = parallaxEnabled
    ? {
        x: mousePosition.x * gameConfig.parallax.background.x,
        y: mousePosition.y * gameConfig.parallax.background.y,
      }
    : { x: 0, y: 0 };
  const backgroundScale = parallaxEnabled ? gameConfig.parallax.background.scale : 1.1;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Blur and Reverse Parallax */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${gameConfig.assets.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          transform: `translate3d(${backgroundOffset.x}px, ${backgroundOffset.y}px, 0) scale(${backgroundScale})`,
          transformOrigin: 'center center',
          transition: parallaxEnabled ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        }}
      />
      {/* Dark overlay for depth */}
      <div className="fixed inset-0 z-0 bg-black/30" />
      {/* Top Bar with Tabs */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-3">
            <button
              onClick={() => handleTabClick('add-pair')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'add-pair'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Add Pair
            </button>
            <button
              onClick={() => handleTabClick('box')}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'box'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              Box ({pairs.length})
            </button>
          </div>
          <div className="text-white/90 font-medium">
            {session.player1_name} & {session.player2_name} - Run {run.run_number}
          </div>
          <div className="relative" data-settings-menu>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className="bg-white/10 text-white/80 hover:bg-white/20 px-4 py-2 rounded-xl font-semibold transition-all"
            >
              Settings
            </button>
            {showSettings && (
              <div 
                className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 min-w-[200px] z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-white font-semibold mb-3">Settings</h3>
                <label className="flex items-center gap-3 text-white/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parallaxEnabled}
                    onChange={(e) => setParallaxEnabled(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Enable Parallax</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parallax Map Container */}
      <div className="relative h-screen flex items-center justify-center pt-12 pb-4 z-10">
        <div
          data-parallax-container
          className="relative w-full h-full flex items-center justify-center"
          style={{
            maxWidth: '100vw',
            maxHeight: 'calc(100vh - 48px)',
          }}
        >
          <div
            data-aspect-container
            className="relative w-full"
            style={{
              aspectRatio: `${mapAspectRatio}`,
              maxWidth: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Click overlay for location detection */}
            <div
              className="absolute inset-0 z-10"
              onClick={handleMapClick}
              style={{ 
                cursor: hoveredLocation ? 'crosshair' : 'default',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={() => console.log('Mouse entered map area')}
            />
            {/* Back Layer - No movement */}
            <div
              className="absolute inset-0 pixel-art-container"
              style={{
                transform: `translate3d(${backOffset.x}px, ${backOffset.y}px, 0)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <img
                src={gameConfig.assets.back}
                alt="Background"
                width={gameConfig.dimensions.width}
                height={gameConfig.dimensions.height}
                className="w-full h-full object-contain pixel-art"
                draggable={false}
              />
            </div>

             {/* Objects Layer - Parallax movement */}
             <div
               className="absolute inset-0 pixel-art-container"
               style={{
                 transform: `translate3d(${objectsOffset.x}px, ${objectsOffset.y}px, 0)`,
                 transition: parallaxEnabled ? 'transform 0.1s ease-out' : 'none',
               }}
             >
              <img
                src={gameConfig.assets.objects}
                alt="Objects"
                width={gameConfig.dimensions.width}
                height={gameConfig.dimensions.height}
                className="w-full h-full object-contain pixel-art"
                draggable={false}
              />
            </div>

            {/* Map Layer - Parallax movement */}
            <div
              className="absolute inset-0 pixel-art-container"
              style={{
                transform: `translate3d(${mapOffset.x}px, ${mapOffset.y}px, 0)`,
                transition: parallaxEnabled ? 'transform 0.1s ease-out' : 'none',
              }}
            >
              <img
                src={gameConfig.assets.map}
                alt="Map"
                width={gameConfig.dimensions.width}
                height={gameConfig.dimensions.height}
                className="w-full h-full object-contain pixel-art"
                draggable={false}
              />
            </div>

            {/* Highlight Overlay Layer - Shows hovered area (aligned with map layer, with parallax) */}
            {hoveredColor && (
              <div
                className="absolute inset-0 pixel-art-container"
                style={{
                  transform: `translate3d(${mapOffset.x}px, ${mapOffset.y}px, 0)`,
                  transition: parallaxEnabled ? 'transform 0.1s ease-out' : 'none',
                  mixBlendMode: 'screen',
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
              >
                <canvas
                  ref={highlightCanvasRef}
                  width={gameConfig.dimensions.width}
                  height={gameConfig.dimensions.height}
                  className="w-full h-full object-contain pixel-art"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Tooltip */}
      {hoveredLocation && (
        <div
          className="fixed z-40 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-semibold pointer-events-none shadow-2xl border border-white/20"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {hoveredLocation}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
        </div>
      )}

      {/* Add Pair Modal */}
      {showAddPairModal && activeTab === 'add-pair' && (
        <div
          className="absolute z-50 bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-96"
          style={{
            left: `${modalPosition.x}px`,
            top: `${modalPosition.y}px`,
          }}
        >
          <div
            className="bg-black/50 text-white p-4 rounded-t-2xl cursor-move flex justify-between items-center border-b border-white/20"
            onMouseDown={handleMouseDown}
          >
            <span className="font-bold text-lg">
              {editingPair ? 'Edit Pair' : 'Add New Pair'}
            </span>
            <button
              onClick={() => {
                setShowAddPairModal(false);
                setActiveTab(null);
                setEditingPair(null);
                setPairFormData({ location: '', pokemon1: '', pokemon2: '' });
              }}
              className="text-white hover:text-white/80 text-2xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
            >
              ×
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Route 31"
                value={pairFormData.location}
                onChange={(e) =>
                  setPairFormData({ ...pairFormData, location: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all outline-none text-white placeholder:text-white/50"
                required
              />
            </div>
             <div>
               <PokemonSelector
                 value={pairFormData.pokemon1}
                 onChange={(pokemonName) =>
                   setPairFormData({ ...pairFormData, pokemon1: pokemonName })
                 }
                 placeholder="Search Pokemon..."
                 label={`${session.player1_name}'s Pokemon`}
               />
             </div>
             <div>
               <PokemonSelector
                 value={pairFormData.pokemon2}
                 onChange={(pokemonName) =>
                   setPairFormData({ ...pairFormData, pokemon2: pokemonName })
                 }
                 placeholder="Search Pokemon..."
                 label={`${session.player2_name}'s Pokemon`}
               />
             </div>
            <div className="flex gap-3">
              <button
                onClick={editingPair ? updatePair : createPair}
                className="flex-1 bg-white/20 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:bg-white/30 transform hover:-translate-y-0.5 transition-all"
              >
                {editingPair ? 'Update' : 'Add Pair'}
              </button>
              <button
                onClick={() => {
                  setShowAddPairModal(false);
                  setActiveTab(null);
                  setEditingPair(null);
                  setPairFormData({ location: '', pokemon1: '', pokemon2: '' });
                }}
                className="flex-1 bg-white/10 text-white/80 px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Box Tab */}
      {activeTab === 'box' && (
        <div 
          className="absolute z-50 bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-[420px] max-h-[80vh] overflow-hidden flex flex-col"
          style={{
            left: `${boxPosition.x}px`,
            top: `${boxPosition.y}px`,
          }}
        >
          <div 
            className="bg-black/50 text-white p-4 rounded-t-2xl cursor-move flex justify-between items-center border-b border-white/20"
            onMouseDown={handleBoxMouseDown}
          >
            <span className="font-bold text-lg">Box</span>
            <button
              onClick={() => {
                setActiveTab(null);
              }}
              className="text-white hover:text-white/80 text-2xl leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto p-5">
            {pairs.length === 0 ? (
              <p className="text-white/50 text-center py-8">No pairs yet</p>
            ) : (
              <div className="space-y-3">
                {pairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-start justify-between hover:bg-white/15 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-white mb-1">{pair.location}</p>
                      <p className="text-sm text-white/80 mb-2">
                        {pair.pokemon1 || '?'} & {pair.pokemon2 || '?'}
                      </p>
                      <p className="text-xs text-white/50">
                        {new Date(pair.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openEditPair(pair)}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePair(pair.id)}
                        className="bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

