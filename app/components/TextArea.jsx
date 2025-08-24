import { useState, useRef, useEffect } from 'react';
import { PiStarFourFill, PiArrowUpBold, PiCaretDownBold } from "react-icons/pi";
import { loadApiKey, loadSelectedModel } from '../utils/localStorage';
import { refinePrompt } from '../utils/api';

function TextArea({ onSubmitPrompt, isRefining = false }) {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedApiKey = loadApiKey();
    const savedModel = loadSelectedModel();
    setApiKey(savedApiKey);
    setSelectedModel(savedModel);
  }, []);

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

  const getModelDisplayText = () => {
    if (!selectedModel) return 'No model selected';
    
    const providerName = selectedModel.provider === 'gemini' ? 'Google AI' : 'OpenRouter';
    return {
      provider: providerName,
      model: selectedModel.name
    };
  };

  const modelDisplay = getModelDisplayText();
  const hasApiKey = apiKey.trim().length > 0;

  return (
    <div className="w-full bg-[#3B3B3B] border-2 border-[#3f3f3f] flex flex-col p-4 rounded-[5px] relative">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-[5px] text-red-400 text-[0.9em]">
          {error}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your prompt here.. (Enter to submit, Shift+Ctrl+Enter to refine)"
        className="min-h-[120px] max-h-[300px] border-none stroke-none outline-none text-[1.5em] bg-transparent resize-none"
        disabled={isRefining}
      />
      
      <div className="flex flex-row justify-between items-center mt-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Model Display */}
          <div className="bg-[#303030] flex flex-row gap-2 items-center px-4 py-2 rounded-[5px] text-[0.9em] max-w-[300px]">
            <div className="text-left min-w-0">
              <div className="text-[0.8em] opacity-70 truncate">
                {modelDisplay.provider}
              </div>
              <div className="text-[0.9em] truncate">{modelDisplay.model}</div>
            </div>
            <PiCaretDownBold className="opacity-50 flex-shrink-0" />
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-1 text-[0.8em] opacity-70 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${
              hasApiKey ? 'bg-green-400' : 'bg-yellow-400'
            }`} title={hasApiKey ? 'API key configured' : 'API key not set'} />
            <span className="whitespace-nowrap">{hasApiKey ? 'Ready' : 'Setup needed'}</span>
          </div>
        </div>
        
        <div className="flex flex-row gap-1 flex-shrink-0">
          <button
            onClick={() => handleSubmit(true)}
            disabled={!prompt.trim() || isRefining}
            className="bg-[#303030] p-2.5 rounded-[5px] hover:bg-white transition-all duration-150 cursor-pointer hover:text-[#282828] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#303030] disabled:hover:text-white flex items-center justify-center w-[44px] h-[44px]"
            title="Refine with AI (Shift+Ctrl+Enter)"
          >
            <PiStarFourFill className={`text-[1.3em] ${isRefining ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => handleSubmit(false)}
            disabled={!prompt.trim() || isRefining}
            className="bg-[#303030] p-2.5 rounded-[5px] hover:bg-white transition-all duration-150 cursor-pointer hover:text-[#282828] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#303030] disabled:hover:text-white flex items-center justify-center w-[44px] h-[44px]"
            title="Submit prompt (Enter)"
          >
            <PiArrowUpBold className="text-[1.3em]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextArea;
