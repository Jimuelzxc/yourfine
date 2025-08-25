import { useState } from 'react';

export const useUIState = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsUpdateKey, setSettingsUpdateKey] = useState(0);
  const [isRefining, setIsRefining] = useState(false);

  // Handle opening settings
  const openSettings = () => {
    setShowSettings(true);
  };

  // Handle closing settings
  const closeSettings = () => {
    setShowSettings(false);
    // Trigger TextArea refresh by updating key
    setSettingsUpdateKey(prev => prev + 1);
  };

  // Handle setting refining state
  const setRefiningState = (refining) => {
    setIsRefining(refining);
  };

  return {
    // State
    showSettings,
    settingsUpdateKey,
    isRefining,
    
    // Actions
    openSettings,
    closeSettings,
    setRefiningState
  };
};