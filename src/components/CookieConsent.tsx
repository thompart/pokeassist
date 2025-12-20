'use client';
import { useState, useEffect } from 'react';
import { hasCookieConsent, setCookieConsent } from '@/lib/cookies';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!hasCookieConsent()) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent(true);
    setShowConsent(false);
  };

  const handleDecline = () => {
    setCookieConsent(false);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/20 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-white text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
            We use cookies to save your game progress locally. This allows you to quickly continue your runs.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 bg-white/10 text-white/80 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

