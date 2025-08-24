// API utilities for prompt refinement using LLM
import { GoogleGenAI } from "@google/genai";

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Available models configuration
export const AVAILABLE_MODELS = {
  openrouter: {
    name: 'OpenRouter',
    models: [
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', provider: 'openrouter' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'openrouter' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'openrouter' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openrouter' }
    ]
  },
  gemini: {
    name: 'Google Gemini Direct',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', provider: 'gemini' },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini' }
    ]
  }
};

// Get all models in a flat array
export const getAllModels = () => {
  const allModels = [];
  Object.values(AVAILABLE_MODELS).forEach(category => {
    allModels.push(...category.models);
  });
  return allModels;
};

const systemPrompt = `
Refines freewritten text into clear, concise wording for better coding prompts and communication. 

Guidelines:  
- Make it clear, concise, and professional.  
- Keep the original meaning and tone.  
- Do not add new information.  
- Only output the refined version (no summaries, no code, no explanations).  
`;

// OpenRouter API implementation
const refinePromptOpenRouter = async (originalPrompt, apiKey, modelId) => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'YourFine Prompt Refiner'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Please refine this prompt: "${originalPrompt}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenRouter API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
};

// Direct Gemini API implementation
const refinePromptGemini = async (originalPrompt, apiKey, modelId) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Please refine this prompt: "${originalPrompt}"`,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  });

  return response.text?.trim();
};

export const refinePrompt = async (originalPrompt, apiKey, selectedModel) => {
  if (!apiKey || !originalPrompt.trim()) {
    throw new Error('API key and prompt are required');
  }

  if (!selectedModel) {
    throw new Error('Model selection is required');
  }

  try {
    let refinedPrompt;

    if (selectedModel.provider === 'openrouter') {
      refinedPrompt = await refinePromptOpenRouter(originalPrompt, apiKey, selectedModel.id);
    } else if (selectedModel.provider === 'gemini') {
      refinedPrompt = await refinePromptGemini(originalPrompt, apiKey, selectedModel.id);
    } else {
      throw new Error('Unsupported model provider');
    }
    
    if (!refinedPrompt) {
      throw new Error('No refined prompt received from API');
    }

    return refinedPrompt;
  } catch (error) {
    console.error('Error refining prompt:', error);
    throw error;
  }
};

export const validateApiKey = async (apiKey, selectedModel) => {
  if (!apiKey || !selectedModel) return false;
  
  try {
    if (selectedModel.provider === 'openrouter') {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'YourFine API Key Validation'
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 1
        })
      });
      return response.ok || response.status === 429;
    } else if (selectedModel.provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: selectedModel.id,
        contents: 'Test',
        config: { maxOutputTokens: 1 }
      });
      return !!response;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};