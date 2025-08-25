import { useState, useEffect, useRef } from 'react';

// Available ambient sounds for concentration
export const AMBIENT_SOUNDS = {
  none: {
    id: 'none',
    name: 'None',
    description: 'No background sound',
    url: null,
    icon: '🔇'
  },
  rain: {
    id: 'rain',
    name: 'Rain',
    description: 'Gentle rainfall sounds',
    url: '/sounds/rain.mp3', // Replace with your sound file
    icon: '🌧️'
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Birds and nature sounds',
    url: '/sounds/forest.mp3', // Replace with your sound file
    icon: '🌲'
  },
  waves: {
    id: 'waves',
    name: 'Ocean Waves',
    description: 'Calming ocean waves',
    url: '/sounds/waves.mp3', // Replace with your sound file
    icon: '🌊'
  },
  whitenoise: {
    id: 'whitenoise',
    name: 'White Noise',
    description: 'Consistent white noise',
    url: '/sounds/whitenoise.mp3', // Replace with your sound file
    icon: '📻'
  },
  cafe: {
    id: 'cafe',
    name: 'Coffee Shop',
    description: 'Ambient cafe sounds',
    url: '/sounds/cafe.mp3', // Replace with your sound file
    icon: '☕'
  }
};

const STORAGE_KEYS = {
  selectedSound: 'yourfine_ambient_sound',
  volume: 'yourfine_ambient_volume',
  isEnabled: 'yourfine_ambient_enabled'
};

export const useAmbientSounds = () => {
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS.none);
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const savedSoundId = localStorage.getItem(STORAGE_KEYS.selectedSound);
      const savedVolume = localStorage.getItem(STORAGE_KEYS.volume);
      const savedEnabled = localStorage.getItem(STORAGE_KEYS.isEnabled);

      if (savedSoundId && AMBIENT_SOUNDS[savedSoundId]) {
        setSelectedSound(AMBIENT_SOUNDS[savedSoundId]);
      }
      
      if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
      }
      
      if (savedEnabled !== null) {
        setIsEnabled(savedEnabled === 'true');
      }
    } catch (error) {
      console.error('Error loading ambient sound preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (soundId, vol, enabled) => {
    try {
      localStorage.setItem(STORAGE_KEYS.selectedSound, soundId);
      localStorage.setItem(STORAGE_KEYS.volume, vol.toString());
      localStorage.setItem(STORAGE_KEYS.isEnabled, enabled.toString());
    } catch (error) {
      console.error('Error saving ambient sound preferences:', error);
    }
  };

  // Fade audio in/out for smooth transitions
  const fadeAudio = (targetVolume, duration = 500) => {
    if (!audioRef.current) return;
    
    const startVolume = audioRef.current.volume;
    const volumeChange = targetVolume - startVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    const stepChange = volumeChange / steps;
    
    let currentStep = 0;
    
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const newVolume = startVolume + (stepChange * currentStep);
      
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
      }
      
      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        
        if (targetVolume === 0 && audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    }, stepDuration);
  };

  // Play selected ambient sound
  const playSound = async (sound) => {
    if (!sound || sound.id === 'none' || !sound.url) {
      stopSound();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create new audio instance
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = 0; // Start with volume 0 for fade-in
      
      audioRef.current = audio;

      // Handle audio events
      audio.addEventListener('canplay', () => {
        setIsLoading(false);
        audio.play()
          .then(() => {
            setIsPlaying(true);
            fadeAudio(volume, 1000); // Fade in over 1 second
          })
          .catch((err) => {
            console.error('Error playing ambient sound:', err);
            setError('Failed to play sound. Please check your internet connection.');
            setIsLoading(false);
          });
      });

      audio.addEventListener('error', () => {
        setError('Failed to load ambient sound. Please try another option.');
        setIsLoading(false);
      });

      // Load the audio
      audio.load();
      
    } catch (error) {
      console.error('Error setting up ambient sound:', error);
      setError('Failed to initialize audio. Please try again.');
      setIsLoading(false);
    }
  };

  // Stop ambient sound
  const stopSound = () => {
    if (audioRef.current) {
      fadeAudio(0, 500); // Fade out over 0.5 seconds
    } else {
      setIsPlaying(false);
    }
  };

  // Handle sound selection
  const handleSoundSelect = (sound) => {
    setSelectedSound(sound);
    savePreferences(sound.id, volume, isEnabled);
    
    if (isEnabled && sound.id !== 'none') {
      playSound(sound);
    } else {
      stopSound();
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    savePreferences(selectedSound.id, newVolume, isEnabled);
    
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle ambient sounds on/off
  const toggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    savePreferences(selectedSound.id, volume, newEnabled);
    
    if (newEnabled && selectedSound.id !== 'none') {
      playSound(selectedSound);
    } else {
      stopSound();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Auto-play when component mounts if enabled
  useEffect(() => {
    if (isEnabled && selectedSound.id !== 'none') {
      playSound(selectedSound);
    }
  }, []); // Empty dependency array for mount only

  return {
    // State
    selectedSound,
    volume,
    isPlaying,
    isEnabled,
    isLoading,
    error,
    availableSounds: Object.values(AMBIENT_SOUNDS),
    
    // Actions
    handleSoundSelect,
    handleVolumeChange,
    toggleEnabled,
    playSound: () => playSound(selectedSound),
    stopSound
  };
};