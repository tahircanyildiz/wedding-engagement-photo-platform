import { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const audioRef = useRef(null);

  // Auto-play on mount (with user interaction requirement handled)
  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          // Try to autoplay with low volume
          audioRef.current.volume = 0.3;
          await audioRef.current.play();
          setIsPlaying(true);
          setAutoplayAttempted(true);
        } catch (error) {
          // Autoplay blocked - will retry on first user interaction
          console.log('Autoplay blocked - will retry on user interaction');
          setIsPlaying(false);
          setAutoplayAttempted(true);
        }
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(playAudio, 500);
    return () => clearTimeout(timer);
  }, []);

  // Retry playing on any user interaction
  useEffect(() => {
    const handleUserInteraction = async (event) => {
      // Don't auto-play if user clicked on the control buttons
      if (event.target.closest('.music-control-button')) {
        return;
      }

      if (!isPlaying && autoplayAttempted && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          // Remove listeners after successful play
          document.removeEventListener('click', handleUserInteraction);
          document.removeEventListener('touchstart', handleUserInteraction);
          document.removeEventListener('keydown', handleUserInteraction);
        } catch (error) {
          // Still blocked, keep trying
        }
      }
    };

    if (autoplayAttempted && !isPlaying) {
      // Listen for any user interaction
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);

      return () => {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
    }
  }, [isPlaying, autoplayAttempted]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Playback error:', error);
        }
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        {/* You'll need to add your music file to public folder */}
        {/* For now using a placeholder - replace with actual music file */}
        <source src="/background-music.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating music control button */}
      <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="music-control-button bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all rounded-full p-3 group"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? (
            <svg
              className="w-5 h-5 text-romantic-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-romantic-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;
