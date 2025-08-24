import { useState, useEffect } from 'react';
import { PiXBold, PiCheckBold, PiWarningBold } from 'react-icons/pi';
import { loadApiKey, saveApiKey, loadSelectedModel, saveSelectedModel } from '../utils/localStorage';
import { AVAILABLE_MODELS, getAllModels, validateApiKey } from '../utils/api';

function Settings({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'valid', 'invalid'
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedApiKey = loadApiKey();
      const savedModel = loadSelectedModel();
      setApiKey(savedApiKey);
      
      if (savedModel) {
        setSelectedModel(savedModel);
      } else {
        // Set default model (first OpenRouter model)
        const defaultModel = getAllModels()[0];
        setSelectedModel(defaultModel);
        saveSelectedModel(defaultModel);
      }
    }
  }, [isOpen]);

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    setValidationStatus(null);
    setError('');
    saveApiKey(newApiKey);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    saveSelectedModel(model);
    setValidationStatus(null); // Reset validation when model changes
  };

  const handleValidateApiKey = async () => {
    if (!apiKey.trim() || !selectedModel) return;

    setIsValidating(true);
    setError('');
    
    try {
      const isValid = await validateApiKey(apiKey, selectedModel);
      setValidationStatus(isValid ? 'valid' : 'invalid');
      if (!isValid) {
        setError('Invalid API key or insufficient permissions');
      }
    } catch (error) {
      setValidationStatus('invalid');
      setError(error.message || 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const getApiKeyPlaceholder = () => {
    if (!selectedModel) return 'Select a model first';
    return selectedModel.provider === 'gemini' 
      ? 'AIzaSy...'
      : 'sk-or-v1-...';
  };

  const getApiKeyLink = () => {
    if (!selectedModel) return '#';
    return selectedModel.provider === 'gemini'
      ? 'https://aistudio.google.com/app/apikey'
      : 'https://openrouter.ai/keys';
  };

  const getApiKeyLinkText = () => {
    if (!selectedModel) return 'Select a model';
    return selectedModel.provider === 'gemini'
      ? 'Google AI Studio'
      : 'OpenRouter';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] border border-[#505050] rounded-[10px] w-[500px] max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#505050]">
          <h2 className="text-[1.3em] font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-[1.2em] opacity-70 hover:opacity-100 transition-opacity text-white"
          >
            <PiXBold />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-[1em] font-medium mb-3 text-white">AI Model</label>
            <div className="space-y-2">
              {Object.entries(AVAILABLE_MODELS).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <div className="text-[0.9em] font-medium opacity-80 mb-2 border-b border-[#505050] pb-1 text-gray-300">
                    {category.name}
                  </div>
                  <div className="space-y-1 ml-2">
                    {category.models.map((model) => (
                      <label
                        key={model.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-[#353535] p-2 rounded transition-colors"
                      >
                        <input
                          type="radio"
                          name="model"
                          checked={selectedModel?.id === model.id}
                          onChange={() => handleModelSelect(model)}
                          className="w-4 h-4 text-blue-500 bg-[#404040] border-[#606060] focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-[0.9em] text-white">{model.name}</div>
                          <div className="text-[0.7em] opacity-60 text-gray-400">{model.provider}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-[1em] font-medium mb-3 text-white">
              {selectedModel?.provider === 'gemini' ? 'Google AI API Key' : 'OpenRouter API Key'}
            </label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder={getApiKeyPlaceholder()}
                  className="w-full bg-[#353535] border border-[#606060] rounded-[5px] px-3 py-3 text-[0.9em] outline-none focus:border-[#707070] pr-12 text-white placeholder-gray-400"
                />
                {validationStatus && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {validationStatus === 'valid' ? (
                      <PiCheckBold className="text-green-400 text-[1.2em]" />
                    ) : (
                      <PiWarningBold className="text-red-400 text-[1.2em]" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <div className="text-[0.7em] opacity-70 text-gray-300 flex-1">
                  Get your API key from{' '}
                  <a 
                    href={getApiKeyLink()} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline hover:opacity-100 text-blue-400"
                  >
                    {getApiKeyLinkText()}
                  </a>
                </div>
                
                <button
                  onClick={handleValidateApiKey}
                  disabled={!apiKey.trim() || !selectedModel || isValidating}
                  className="bg-[#505050] hover:bg-[#606060] px-4 py-2 rounded-[5px] text-[0.8em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white whitespace-nowrap flex-shrink-0"
                >
                  {isValidating ? 'Validating...' : 'Test Key'}
                </button>
              </div>

              {error && (
                <div className="text-red-400 text-[0.8em] bg-red-400/10 border border-red-400/20 rounded p-2">
                  {error}
                </div>
              )}
              
              {validationStatus === 'valid' && (
                <div className="text-green-400 text-[0.8em] bg-green-400/10 border border-green-400/20 rounded p-2">
                  API key is valid and working!
                </div>
              )}
            </div>
          </div>

          {/* Usage Info */}
          <div className="bg-[#353535] border border-[#505050] rounded-[5px] p-4">
            <h3 className="text-[0.9em] font-medium mb-2 text-white">Quick Tips</h3>
            <ul className="text-[0.8em] opacity-80 space-y-1 text-gray-300">
              <li>• API keys are stored securely in your browser</li>
              <li>• Different models may have different capabilities and costs</li>
              <li>• Test your API key to ensure it works before refining prompts</li>
              <li>• Gemini models require a Google AI API key</li>
              <li>• OpenRouter provides access to multiple AI models</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-[#505050]">
          <button
            onClick={onClose}
            className="bg-[#505050] hover:bg-[#606060] px-6 py-2 rounded-[5px] transition-colors text-white whitespace-nowrap flex-shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;