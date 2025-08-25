import { useState } from 'react';

export const useUIState = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Handle opening settings
  const openSettings = () => {
    setShowSettings(true);
  };

  // Handle closing settings
  const closeSettings = () => {
    setShowSettings(false);
    // No need to force TextArea remount - it will pick up localStorage changes naturally
  };

  // Handle setting refining state
  const setRefiningState = (refining) => {
    setIsRefining(refining);
  };

  return {
    // State
    showSettings,
    isRefining,
    
    // Actions
    openSettings,
    closeSettings,
    setRefiningState
  };
};