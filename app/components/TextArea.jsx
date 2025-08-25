import { useState, useRef, useEffect } from 'react';
import { PiStarFourFill, PiArrowUpBold } from "react-icons/pi";
import { loadApiKey, loadSelectedModel } from '../utils/localStorage';
import { refinePrompt } from '../utils/api';
import SessionSelector from './SessionSelector';

function TextArea({ 
  onSubmitPrompt, 
  isRefining = false,
  sessions,
  activeSessionId,
  onSessionChange,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  onExportSession,
  onImportSession
}) {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLocalRefining, setIsLocalRefining] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    const savedApiKey = loadApiKey();
    const savedModel = loadSelectedModel();
    setApiKey(savedApiKey);
    
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Listen for settings updates via custom event
  useEffect(() => {
    const handleSettingsUpdate = () => {
      const savedApiKey = loadApiKey();
      const savedModel = loadSelectedModel();
      setApiKey(savedApiKey);
      
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    };

    // Listen for custom settings update event
    window.addEventListener('yourfine-settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('yourfine-settings-updated', handleSettingsUpdate);
    };
  }, []);

  // Auto-dismiss errors after 7 seconds
  useEffect(() => {
    if (error) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      
      // Set new timeout to clear error after 7 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
      }, 7000);
    }
    
    // Cleanup timeout on component unmount or when error changes
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const handleSubmit = async (shouldRefine = false) => {
    if (!prompt.trim()) return;

    setError('');

    if (shouldRefine) {
      if (!apiKey.trim()) {
        setError('Please configure your API key in Settings');
        return;
      }

      if (!selectedModel) {
        setError('Please select a model in Settings');
        return;
      }
      
      // Set local loading state immediately
      setIsLocalRefining(true);
    }

    try {
      let refinedPrompt = null;
      
      if (shouldRefine) {
        refinedPrompt = await refinePrompt(prompt, apiKey, selectedModel);
      }

      onSubmitPrompt(prompt, refinedPrompt);
      setPrompt('');
      setError('');
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      setError(error.message || 'Failed to process prompt');
    } finally {
      // Clear local loading state
      if (shouldRefine) {
        setIsLocalRefining(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(false);
    } else if (e.key === 'Enter' && e.shiftKey && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(true);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const hasApiKey = apiKey.trim().length > 0;

  return (
    <div className="w-full bg-[#3B3B3B] border-2 border-[#3f3f3f] flex flex-col p-3 sm:p-4 rounded-[5px] relative">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 sm:p-3 bg-red-400/10 border border-red-400/20 rounded-[5px] text-red-400 text-[0.8em] sm:text-[0.9em] flex justify-between items-start gap-2 sm:gap-3">
          <div className="flex-1">
            {error}
          </div>
          <button
            onClick={() => {
              setError('');
              if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
              }
            }}
            className="text-red-400/70 hover:text-red-400 transition-colors text-[1.1em] leading-none flex-shrink-0"
            title="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your prompt here.. (Enter to submit, Shift+Ctrl+Enter to refine)"
        className="min-h-[100px] sm:min-h-[120px] max-h-[200px] sm:max-h-[300px] border-none stroke-none outline-none text-[1.2em] sm:text-[1.5em] bg-transparent resize-none"
        disabled={isRefining}
      />
      
      <div className="flex flex-row justify-between items-center gap-2 mt-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Session Selector */}
          <SessionSelector
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionChange={onSessionChange}
            onCreateSession={onCreateSession}
            onRenameSession={onRenameSession}
            onDeleteSession={onDeleteSession}
            onExportSession={onExportSession}
            onImportSession={onImportSession}
          />
          
          {/* Status Indicators */}
          <div className="flex items-center gap-1 text-[0.7em] sm:text-[0.8em] opacity-70 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${
              hasApiKey ? 'bg-green-400' : 'bg-yellow-400'
            }`} title={
              hasApiKey ? 'API key configured' : 'API key not set'
            } />
            <span className="whitespace-nowrap hidden sm:inline">
              {hasApiKey ? 'Ready' : 'Setup needed'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-row gap-1 flex-shrink-0">
          <button
            onClick={() => handleSubmit(true)}
            disabled={!prompt.trim() || isRefining || isLocalRefining}
            className={`bg-[#303030] p-2 sm:p-2.5 rounded-[5px] transition-all duration-150 cursor-pointer flex items-center justify-center w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] ${
              isRefining || isLocalRefining
                ? 'opacity-70 cursor-not-allowed bg-[#404040]' 
                : 'hover:bg-white hover:text-[#282828] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#303030] disabled:hover:text-white'
            }`}
            title={
              isLocalRefining || isRefining ? "Refining prompt..." :
              "Refine with AI (Shift+Ctrl+Enter)"
            }
          >
            <PiStarFourFill className={`text-[1.1em] sm:text-[1.3em] transition-transform duration-150 ${
              isLocalRefining || isRefining ? 'animate-spin text-blue-400' : ''
            }`} />
          </button>
          
          <button
            onClick={() => handleSubmit(false)}
            disabled={!prompt.trim() || isRefining || isLocalRefining}
            className="bg-[#303030] p-2 sm:p-2.5 rounded-[5px] hover:bg-white transition-all duration-150 cursor-pointer hover:text-[#282828] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#303030] disabled:hover:text-white flex items-center justify-center w-[40px] h-[40px] sm:w-[44px] sm:h-[44px]"
            title={isLocalRefining || isRefining ? "Please wait, refining in progress..." : "Submit prompt (Enter)"}
          >
            <PiArrowUpBold className="text-[1.1em] sm:text-[1.3em]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextArea;
