// API utilities for prompt refinement using LLM
import { GoogleGenAI } from "@google/genai";

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Available models configuration
export const AVAILABLE_MODELS = {
  openrouter: {
    name: 'OpenRouter',
    models: [
         { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2(free)', provider: 'openrouter' },
      { id: 'z-ai/glm-4.5-air:free', name: 'Z.AI: GLM 4.5 Air (free)', provider: 'openrouter' },
    { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek: DeepSeek V3 0324 (free)', provider: 'openrouter' },
      { id: 'qwen/qwen3-30b-a3b:free', name: 'Qwen: Qwen3 30B A3B (free)', provider: 'openrouter' },
     
    ]
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
    
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

// System prompt for AI-powered prompt analysis
const analysisSystemPrompt = `
You are an expert prompt analyst. Analyze the given prompt and provide insights about its quality, effectiveness, and future applicability.

Analyze the prompt based on these criteria:
1. Quality (clarity, specificity, completeness)
2. Future Applicability (will this remain useful over time?)
3. Domain Classification (technology, writing, analysis, etc.)
4. Recommendations for improvement
5. Risk factors (potential obsolescence, vagueness, etc.)

Provide your analysis in JSON format:
{
  "qualityScore": 0.85,
  "futureApplicability": 0.9,
  "domain": "programming",
  "strengths": ["Clear objectives", "Specific requirements"],
  "weaknesses": ["Could use more context"],
  "recommendations": ["Add examples", "Specify output format"],
  "riskFactors": ["Technology-specific terms may become outdated"],
  "timelineAssessment": "Likely to remain relevant for 3-5 years",
  "usefulnessRating": "high"
}

Be objective and provide actionable insights.
`;

// OpenRouter API implementation for prompt analysis
const analyzePromptOpenRouter = async (promptText, apiKey, modelId) => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'YourFine Prompt Analyzer'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: analysisSystemPrompt
        },
        {
          role: 'user',
          content: `Please analyze this prompt for quality, future applicability, and usefulness: "${promptText}"`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenRouter API request failed: ${response.status}`);
  }

  const data = await response.json();
  const analysisText = data.choices?.[0]?.message?.content?.trim();
  
  if (!analysisText) {
    throw new Error('No analysis received from API');
  }
  
  try {
    // Extract JSON from response (sometimes wrapped in markdown)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON format in response');
  } catch (parseError) {
    console.warn('Failed to parse AI analysis JSON:', parseError);
    // Return a fallback structure
    return {
      qualityScore: 0.5,
      futureApplicability: 0.5,
      domain: 'general',
      strengths: [],
      weaknesses: ['Unable to parse AI analysis'],
      recommendations: ['Manual review recommended'],
      riskFactors: ['Analysis parsing failed'],
      timelineAssessment: 'Unknown',
      usefulnessRating: 'medium',
      rawResponse: analysisText
    };
  }
};

// Direct Gemini API implementation for prompt analysis
const analyzePromptGemini = async (promptText, apiKey, modelId) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents: `Please analyze this prompt for quality, future applicability, and usefulness: "${promptText}"`,
    config: {
      systemInstruction: analysisSystemPrompt,
      temperature: 0.3,
      maxOutputTokens: 1500
    }
  });

  const analysisText = response.text?.trim();
  
  if (!analysisText) {
    throw new Error('No analysis received from Gemini API');
  }
  
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON format in response');
  } catch (parseError) {
    console.warn('Failed to parse Gemini analysis JSON:', parseError);
    return {
      qualityScore: 0.5,
      futureApplicability: 0.5,
      domain: 'general',
      strengths: [],
      weaknesses: ['Unable to parse AI analysis'],
      recommendations: ['Manual review recommended'],
      riskFactors: ['Analysis parsing failed'],
      timelineAssessment: 'Unknown',
      usefulnessRating: 'medium',
      rawResponse: analysisText
    };
  }
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

// OpenRouter API implementation for prompt refinement
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

/**
 * Refine a prompt using AI
 * @param {string} originalPrompt - The original prompt to refine
 * @param {string} apiKey - API key for the selected provider
 * @param {Object} selectedModel - The selected AI model
 * @returns {Promise<string>} Refined prompt text
 */
export const refinePrompt = async (originalPrompt, apiKey, selectedModel) => {
  if (!apiKey || !originalPrompt.trim()) {
    throw new Error('API key and prompt text are required');
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
      throw new Error('No refined prompt received from AI');
    }

    return refinedPrompt;
  } catch (error) {
    console.error('Error refining prompt:', error);
    throw error;
  }
};

/**
 * Analyze a prompt using AI to determine quality, future applicability, and usefulness
 * @param {string} promptText - The prompt text to analyze
 * @param {string} apiKey - API key for the selected provider
 * @param {Object} selectedModel - The selected AI model
 * @returns {Promise<Object>} Analysis results from AI
 */
export const analyzePromptWithAI = async (promptText, apiKey, selectedModel) => {
  if (!apiKey || !promptText.trim()) {
    throw new Error('API key and prompt text are required');
  }

  if (!selectedModel) {
    throw new Error('Model selection is required');
  }

  try {
    let analysisResult;

    if (selectedModel.provider === 'openrouter') {
      analysisResult = await analyzePromptOpenRouter(promptText, apiKey, selectedModel.id);
    } else if (selectedModel.provider === 'gemini') {
      analysisResult = await analyzePromptGemini(promptText, apiKey, selectedModel.id);
    } else {
      throw new Error('Unsupported model provider');
    }
    
    if (!analysisResult) {
      throw new Error('No analysis result received from AI');
    }

    // Validate and normalize the response
    return {
      qualityScore: Math.max(0, Math.min(1, analysisResult.qualityScore || 0.5)),
      futureApplicability: Math.max(0, Math.min(1, analysisResult.futureApplicability || 0.5)),
      domain: analysisResult.domain || 'general',
      strengths: Array.isArray(analysisResult.strengths) ? analysisResult.strengths : [],
      weaknesses: Array.isArray(analysisResult.weaknesses) ? analysisResult.weaknesses : [],
      recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [],
      riskFactors: Array.isArray(analysisResult.riskFactors) ? analysisResult.riskFactors : [],
      timelineAssessment: analysisResult.timelineAssessment || 'Unknown',
      usefulnessRating: analysisResult.usefulnessRating || 'medium',
      analyzedAt: new Date().toISOString(),
      model: selectedModel.name || selectedModel.id
    };
  } catch (error) {
    console.error('Error analyzing prompt with AI:', error);
    throw error;
  }
};

/**
 * Batch analyze multiple prompts with AI
 * @param {Array} prompts - Array of prompt texts
 * @param {string} apiKey - API key
 * @param {Object} selectedModel - Selected AI model
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of analysis results
 */
export const batchAnalyzePromptsWithAI = async (prompts, apiKey, selectedModel, onProgress = null) => {
  const results = [];
  const total = prompts.length;
  
  for (let i = 0; i < prompts.length; i++) {
    try {
      const analysis = await analyzePromptWithAI(prompts[i], apiKey, selectedModel);
      results.push({ success: true, analysis, index: i });
      
      if (onProgress) {
        onProgress(i + 1, total, null);
      }
      
      // Add delay to avoid rate limiting
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error analyzing prompt ${i}:`, error);
      results.push({ success: false, error: error.message, index: i });
      
      if (onProgress) {
        onProgress(i + 1, total, error.message);
      }
    }
  }
  
  return results;
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