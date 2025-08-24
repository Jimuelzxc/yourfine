// LocalStorage utilities for prompt management

const PROMPTS_KEY = 'yourfine_prompts';
const API_KEY = 'yourfine_api_key';
const SELECTED_MODEL_KEY = 'yourfine_selected_model';

export const savePrompts = (prompts) => {
  try {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('Error saving prompts to localStorage:', error);
  }
};

export const loadPrompts = () => {
  try {
    const stored = localStorage.getItem(PROMPTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading prompts from localStorage:', error);
    return [];
  }
};

export const saveApiKey = (apiKey) => {
  try {
    localStorage.setItem(API_KEY, apiKey);
  } catch (error) {
    console.error('Error saving API key to localStorage:', error);
  }
};

export const loadApiKey = () => {
  try {
    return localStorage.getItem(API_KEY) || '';
  } catch (error) {
    console.error('Error loading API key from localStorage:', error);
    return '';
  }
};

export const saveSelectedModel = (model) => {
  try {
    localStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(model));
  } catch (error) {
    console.error('Error saving selected model to localStorage:', error);
  }
};

export const loadSelectedModel = () => {
  try {
    const stored = localStorage.getItem(SELECTED_MODEL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading selected model from localStorage:', error);
    return null;
  }
};

export const addPrompt = (originalPrompt, refinedPrompt = null) => {
  const prompts = loadPrompts();
  const newPrompt = {
    id: Date.now().toString(),
    original: originalPrompt,
    refined: refinedPrompt,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
  
  const updatedPrompts = [newPrompt, ...prompts];
  savePrompts(updatedPrompts);
  return updatedPrompts;
};

export const updatePromptRefinement = (promptId, refinedPrompt) => {
  const prompts = loadPrompts();
  const updatedPrompts = prompts.map(prompt => 
    prompt.id === promptId 
      ? { ...prompt, refined: refinedPrompt }
      : prompt
  );
  savePrompts(updatedPrompts);
  return updatedPrompts;
};