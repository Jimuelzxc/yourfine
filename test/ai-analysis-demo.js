/**
 * AI Prompt Analysis Feature Test
 * 
 * This file demonstrates how to use the AI analysis features implemented in YourFine.
 * 
 * Features Implemented:
 * 1. AI-powered prompt quality analysis
 * 2. Future applicability assessment  
 * 3. Visual indicators for prompt usefulness
 * 4. Batch analysis capabilities
 * 5. Analysis dashboard with statistics
 */

import { analyzePromptWithAI, batchAnalyzePromptsWithAI } from '../app/utils/api.js';
import { 
  updatePromptAnalysis,
  getPromptsNeedingAnalysis,
  getAnalysisSummary
} from '../app/utils/localStorage.js';

/**
 * Example usage of AI prompt analysis
 */
export async function testPromptAnalysis() {
  // Example API configuration (user needs to provide real keys)
  const apiKey = 'your-api-key-here';
  const selectedModel = {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini'
  };

  // Example prompts for testing
  const testPrompts = [
    {
      id: '1',
      original: 'Write a function to sort an array',
      refined: 'Write a JavaScript function that sorts an array of numbers in ascending order using an efficient algorithm. Include error handling for invalid inputs.',
      timestamp: new Date().toISOString()
    },
    {
      id: '2', 
      original: 'Make it better',
      refined: null,
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      original: 'Create a comprehensive guide for implementing secure user authentication in a modern web application using JWT tokens, including best practices for password hashing, session management, and protection against common security vulnerabilities.',
      refined: null,
      timestamp: new Date().toISOString()
    }
  ];

  console.log('🧠 AI Prompt Analysis Test\n');
  
  try {
    // Test individual prompt analysis
    console.log('📊 Analyzing individual prompt...');
    const prompt = testPrompts[0];
    const textToAnalyze = prompt.refined || prompt.original;
    
    const analysisResult = await analyzePromptWithAI(textToAnalyze, apiKey, selectedModel);
    
    console.log('Analysis Result:', {
      qualityScore: `${(analysisResult.qualityScore * 100).toFixed(0)}%`,
      futureApplicability: `${(analysisResult.futureApplicability * 100).toFixed(0)}%`,
      domain: analysisResult.domain,
      usefulnessRating: analysisResult.usefulnessRating,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      recommendations: analysisResult.recommendations,
      riskFactors: analysisResult.riskFactors
    });

    // Test batch analysis
    console.log('\n📦 Testing batch analysis...');
    const promptTexts = testPrompts.map(p => p.refined || p.original);
    
    const batchResults = await batchAnalyzePromptsWithAI(
      promptTexts,
      apiKey,
      selectedModel,
      (current, total, error) => {
        console.log(`Progress: ${current}/${total}${error ? ` (Error: ${error})` : ''}`);
      }
    );
    
    console.log('\nBatch Analysis Results:');
    batchResults.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ Prompt ${index + 1}: Quality ${(result.analysis.qualityScore * 100).toFixed(0)}%, Applicability ${(result.analysis.futureApplicability * 100).toFixed(0)}%`);
      } else {
        console.log(`❌ Prompt ${index + 1}: Failed - ${result.error}`);
      }
    });

    return { success: true, results: { individual: analysisResult, batch: batchResults } };
    
  } catch (error) {
    console.error('❌ Analysis test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Example of analysis indicators that will be shown in the UI
 */
export function getAnalysisIndicators(prompt) {
  if (!prompt.analysis) {
    return {
      status: 'pending',
      message: 'Click to analyze with AI',
      color: 'gray'
    };
  }

  const { qualityScore, futureApplicability, usefulnessRating, riskFactors } = prompt.analysis;
  
  // Determine overall status
  if (qualityScore >= 0.7 && futureApplicability >= 0.7) {
    return {
      status: 'excellent',
      message: 'High quality & future-proof',
      color: 'green',
      icons: ['⭐', '🔮']
    };
  } else if (qualityScore >= 0.5 && futureApplicability >= 0.5) {
    return {
      status: 'good',
      message: 'Good quality with room for improvement',
      color: 'yellow',
      icons: ['💡']
    };
  } else if (riskFactors.length > 0 || futureApplicability < 0.4) {
    return {
      status: 'risky',
      message: 'May become outdated or has quality issues',
      color: 'red',
      icons: ['⚠️', '⏰']
    };
  } else {
    return {
      status: 'needs-improvement',
      message: 'Could benefit from refinement',
      color: 'orange',
      icons: ['🔧']
    };
  }
}

/**
 * Usage Instructions for Users
 */
export const USAGE_INSTRUCTIONS = `
# AI Prompt Analysis Feature

## Setup
1. Configure your API key in Settings (OpenRouter or Google Gemini)
2. Select an AI model 
3. Navigate to any session with prompts

## Features

### Individual Analysis
- Hover over any prompt card to see analysis indicators
- Quality score (⭐): How clear and well-structured the prompt is
- Future applicability (⏰): How likely the prompt remains useful over time
- Domain classification: Technology, writing, analysis, etc.
- Risk warnings (⚠️): Potential obsolescence or issues

### Batch Analysis  
- Click "AI Analysis Dashboard" to expand the panel
- Use "Analyze X Prompts" button to analyze all unanalyzed prompts
- Progress indicator shows real-time analysis status
- Results are saved automatically

### Dashboard Statistics
- Total prompts in session
- Number analyzed vs pending
- Average quality and applicability scores
- Count of high-quality and risky prompts

### Visual Indicators
Cards show color-coded indicators:
- 🟢 Green: High quality & future-proof
- 🟡 Yellow: Good with room for improvement  
- 🟠 Orange: Needs refinement
- 🔴 Red: Quality issues or may become outdated

## Benefits
- Identify your most valuable prompts
- Spot prompts that may need updates
- Focus improvement efforts efficiently
- Build a high-quality prompt library over time
`;

export default {
  testPromptAnalysis,
  getAnalysisIndicators,
  USAGE_INSTRUCTIONS
};