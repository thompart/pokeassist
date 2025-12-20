'use client';
import { useState, useEffect } from 'react';

const MENU_SPLASH_IMAGES = [
  '/menu_splash/219eeb8544197c329bbb54c2eb454974.jpg',
  '/menu_splash/385bfca1e43c1ec493b3e05702c1a68a.jpg',
  '/menu_splash/669a6747a76a364c1a7c383bc257df39.jpg',
  '/menu_splash/a1d592117390aaf55a27585fcaaf156f.jpg',
  '/menu_splash/cafe133ab8dec674fca25565155f6e0b.jpg',
  '/menu_splash/pokemon-universe-dive-into-the-immersive-world-of-pokemon-hr57tc4danm5mn6w.jpg',
];

const IMAGE_DISPLAY_DURATION = 20000; // 20 seconds per image
const FADE_DURATION = 2000; // 2 seconds for fade transition

interface MenuBackgroundProps {
  darkMode?: boolean;
}

export default function MenuBackground({ darkMode = true }: MenuBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
  // Adjust opacity based on dark mode
  const backgroundOpacity = darkMode ? 0.3 : 0.15;

  useEffect(() => {
    // Preload all images for smoother transitions
    MENU_SPLASH_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const interval = setInterval(() => {
      // Start crossfade transition
      setIsFading(true);
      
      // After fade completes, update to next image and reset fade state
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MENU_SPLASH_IMAGES.length);
        setIsFading(false);
      }, FADE_DURATION);
    }, IMAGE_DISPLAY_DURATION);

    return () => clearInterval(interval);
  }, []);

  const nextImageIndex = (currentIndex + 1) % MENU_SPLASH_IMAGES.length;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Current image - fades out when transitioning */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${MENU_SPLASH_IMAGES[currentIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          opacity: isFading ? 0 : backgroundOpacity,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      />
      
      {/* Next image - fades in when transitioning */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${MENU_SPLASH_IMAGES[nextImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          opacity: isFading ? backgroundOpacity : 0,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
        }}
      />
      
      {/* Dark overlay for dark mode */}
      {darkMode && (
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity duration-300"
          style={{
            opacity: isFading ? 1 : 1,
          }}
        />
      )}
    </div>
  );
}

