/**
 * Prompt Analysis Utility for YourFine
 * 
 * Analyzes prompts to determine quality, effectiveness, and future applicability.
 * Provides intelligent insights to help users optimize their prompt collections.
 */

// Domain stability mapping for future applicability
const DOMAIN_STABILITY = {
  'general': 0.9,           // General prompts remain stable
  'technology': 0.6,        // Tech evolves rapidly
  'programming': 0.7,       // Programming concepts are fairly stable
  'writing': 0.85,          // Writing principles are timeless
  'analysis': 0.8,          // Analysis methods are stable
  'creative': 0.75,         // Creative techniques evolve slowly
  'business': 0.65,         // Business practices change
  'education': 0.8,         // Educational methods are stable
  'research': 0.75,         // Research methods evolve
  'communication': 0.85     // Communication is timeless
};

// Keywords that indicate different prompt domains
const DOMAIN_KEYWORDS = {
  technology: ['api', 'software', 'tech', 'digital', 'app', 'system', 'platform', 'tool', 'framework'],
  programming: ['code', 'function', 'variable', 'debug', 'algorithm', 'programming', 'development', 'script'],
  writing: ['write', 'essay', 'article', 'content', 'copy', 'text', 'document', 'story', 'blog'],
  analysis: ['analyze', 'data', 'research', 'study', 'examine', 'evaluate', 'assess', 'review'],
  creative: ['creative', 'design', 'art', 'brainstorm', 'idea', 'concept', 'innovative', 'imagine'],
  business: ['business', 'strategy', 'market', 'sales', 'customer', 'profit', 'company', 'management'],
  education: ['learn', 'teach', 'explain', 'understand', 'lesson', 'course', 'student', 'tutorial'],
  research: ['research', 'study', 'investigation', 'methodology', 'hypothesis', 'experiment', 'findings'],
  communication: ['communicate', 'message', 'presentation', 'meeting', 'email', 'discussion', 'conversation']
};

// Quality factors and their weights
const QUALITY_WEIGHTS = {
  clarity: 0.25,           // How clear and specific the prompt is
  completeness: 0.20,      // Contains necessary context and details
  specificity: 0.20,       // Specific rather than vague
  actionability: 0.15,     // Clear about desired outcome
  context: 0.10,           // Provides sufficient context
  structure: 0.10          // Well-organized and logical
};

// Trend keywords that may indicate time-sensitive content
const TIME_SENSITIVE_KEYWORDS = [
  'current', 'latest', 'recent', 'today', 'now', 'this year', '2024', '2025',
  'trending', 'popular', 'new', 'updated', 'modern', 'contemporary'
];

// Universal/timeless keywords that indicate long-term value
const TIMELESS_KEYWORDS = [
  'fundamental', 'basic', 'principle', 'concept', 'theory', 'method',
  'strategy', 'approach', 'technique', 'best practice', 'standard'
];

/**
 * Detect the primary domain of a prompt
 * @param {string} text - The prompt text to analyze
 * @returns {string} The detected domain
 */
export const detectPromptDomain = (text) => {
  if (!text) return 'general';
  
  const lowerText = text.toLowerCase();
  const domainScores = {};
  
  // Initialize scores
  Object.keys(DOMAIN_KEYWORDS).forEach(domain => {
    domainScores[domain] = 0;
  });
  
  // Count keyword matches for each domain
  Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (lowerText.match(regex) || []).length;
      domainScores[domain] += matches;
    });
  });
  
  // Find domain with highest score
  const topDomain = Object.entries(domainScores)
    .reduce((a, b) => domainScores[a[0]] > domainScores[b[0]] ? a : b)[0];
  
  return domainScores[topDomain] > 0 ? topDomain : 'general';
};

/**
 * Analyze prompt clarity and specificity
 * @param {string} text - The prompt text
 * @returns {Object} Clarity analysis scores
 */
export const analyzeClarity = (text) => {
  if (!text) return { clarity: 0, specificity: 0, actionability: 0 };
  
  const wordCount = text.split(/\s+/).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  // Clarity indicators
  const hasQuestionWords = /\b(what|how|why|when|where|who|which)\b/i.test(text);
  const hasSpecificTerms = /\b(specific|exact|detailed|particular|precise)\b/i.test(text);
  const hasVagueWords = /\b(something|anything|stuff|things|etc|somehow)\b/i.test(text);
  const hasActionVerbs = /\b(create|generate|write|analyze|explain|describe|list|provide)\b/i.test(text);
  
  // Calculate clarity score (0-1)
  let clarityScore = 0.5; // Base score
  
  if (hasQuestionWords || hasActionVerbs) clarityScore += 0.2;
  if (hasSpecificTerms) clarityScore += 0.2;
  if (hasVagueWords) clarityScore -= 0.3;
  if (wordCount >= 10 && wordCount <= 50) clarityScore += 0.1; // Optimal length
  if (wordCount < 5) clarityScore -= 0.2; // Too short
  if (wordCount > 100) clarityScore -= 0.1; // Too long
  
  // Specificity score
  let specificityScore = 0.5;
  if (hasSpecificTerms) specificityScore += 0.3;
  if (hasVagueWords) specificityScore -= 0.4;
  if (text.includes('for example') || text.includes('such as')) specificityScore += 0.2;
  
  // Actionability score
  let actionabilityScore = 0.3;
  if (hasActionVerbs) actionabilityScore += 0.4;
  if (hasQuestionWords) actionabilityScore += 0.2;
  if (/\b(should|must|need|want|require)\b/i.test(text)) actionabilityScore += 0.1;
  
  return {
    clarity: Math.max(0, Math.min(1, clarityScore)),
    specificity: Math.max(0, Math.min(1, specificityScore)),
    actionability: Math.max(0, Math.min(1, actionabilityScore))
  };
};

/**
 * Analyze prompt completeness and context
 * @param {string} text - The prompt text
 * @returns {Object} Completeness analysis
 */
export const analyzeCompleteness = (text) => {
  if (!text) return { completeness: 0, context: 0, structure: 0 };
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  // Context indicators
  const hasContext = /\b(for|in|when|because|since|given|assuming)\b/i.test(text);
  const hasConstraints = /\b(within|limit|maximum|minimum|only|except|without)\b/i.test(text);
  const hasFormat = /\b(format|style|tone|length|structure)\b/i.test(text);
  const hasAudience = /\b(for beginners|for experts|for children|professional|technical)\b/i.test(text);
  
  // Completeness score
  let completenessScore = 0.4;
  if (wordCount >= 15) completenessScore += 0.2; // Adequate length
  if (hasContext) completenessScore += 0.2;
  if (hasConstraints) completenessScore += 0.1;
  if (hasFormat) completenessScore += 0.1;
  
  // Context score
  let contextScore = 0.3;
  if (hasContext) contextScore += 0.3;
  if (hasAudience) contextScore += 0.2;
  if (hasConstraints) contextScore += 0.2;
  
  // Structure score
  let structureScore = 0.5;
  if (sentences.length > 1) structureScore += 0.2; // Multiple sentences
  if (text.includes(':') || text.includes('-')) structureScore += 0.1; // Lists or structure
  if (sentences.length > 5) structureScore -= 0.1; // Too many sentences
  
  return {
    completeness: Math.max(0, Math.min(1, completenessScore)),
    context: Math.max(0, Math.min(1, contextScore)),
    structure: Math.max(0, Math.min(1, structureScore))
  };
};

/**
 * Calculate future applicability score
 * @param {string} text - The prompt text
 * @param {string} domain - The detected domain
 * @returns {Object} Future applicability analysis
 */
export const analyzeFutureApplicability = (text, domain = null) => {
  if (!text) return { futureApplicability: 0.5, timeIndependence: 0.5, adaptability: 0.5 };
  
  const promptDomain = domain || detectPromptDomain(text);
  const lowerText = text.toLowerCase();
  
  // Base score from domain stability
  let futureScore = DOMAIN_STABILITY[promptDomain] || 0.7;
  
  // Check for time-sensitive content
  const timeSensitiveCount = TIME_SENSITIVE_KEYWORDS.reduce((count, keyword) => {
    return count + (lowerText.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Check for timeless content
  const timelessCount = TIMELESS_KEYWORDS.reduce((count, keyword) => {
    return count + (lowerText.includes(keyword) ? 1 : 0);
  }, 0);
  
  // Adjust score based on time indicators
  futureScore -= (timeSensitiveCount * 0.1);
  futureScore += (timelessCount * 0.1);
  
  // Time independence score
  let timeIndependence = 0.7;
  timeIndependence -= (timeSensitiveCount * 0.15);
  timeIndependence += (timelessCount * 0.15);
  
  // Adaptability score (how easily can this be modified for other uses)
  let adaptability = 0.6;
  const hasVariables = /\[.*?\]|\{.*?\}|<.*?>/.test(text); // Placeholder variables
  const isGeneral = /\b(general|universal|common|standard)\b/i.test(text);
  const isSpecific = /\b(specific|particular|exact|precise)\b/i.test(text);
  
  if (hasVariables) adaptability += 0.2;
  if (isGeneral) adaptability += 0.1;
  if (isSpecific) adaptability -= 0.1;
  
  return {
    futureApplicability: Math.max(0.1, Math.min(1, futureScore)),
    timeIndependence: Math.max(0, Math.min(1, timeIndependence)),
    adaptability: Math.max(0, Math.min(1, adaptability))
  };
};

/**
 * Calculate overall prompt quality score
 * @param {Object} clarityAnalysis - Results from analyzeClarity
 * @param {Object} completenessAnalysis - Results from analyzeCompleteness
 * @returns {number} Overall quality score (0-1)
 */
export const calculateQualityScore = (clarityAnalysis, completenessAnalysis) => {
  const scores = {
    clarity: clarityAnalysis.clarity,
    completeness: completenessAnalysis.completeness,
    specificity: clarityAnalysis.specificity,
    actionability: clarityAnalysis.actionability,
    context: completenessAnalysis.context,
    structure: completenessAnalysis.structure
  };
  
  // Calculate weighted average
  let totalScore = 0;
  Object.entries(QUALITY_WEIGHTS).forEach(([factor, weight]) => {
    totalScore += (scores[factor] || 0) * weight;
  });
  
  return Math.max(0, Math.min(1, totalScore));
};

/**
 * Comprehensive prompt analysis
 * @param {string} text - The prompt text to analyze
 * @param {Object} metadata - Additional metadata (usage count, last used, etc.)
 * @returns {Object} Complete analysis results
 */
export const analyzePrompt = (text, metadata = {}) => {
  if (!text) {
    return {
      qualityScore: 0,
      futureApplicability: 0.5,
      domain: 'general',
      analysis: {
        clarity: { clarity: 0, specificity: 0, actionability: 0 },
        completeness: { completeness: 0, context: 0, structure: 0 },
        futureApplicability: { futureApplicability: 0.5, timeIndependence: 0.5, adaptability: 0.5 }
      },
      recommendations: ['Prompt is empty or invalid'],
      riskFactors: ['No content to analyze'],
      lastAnalyzed: new Date().toISOString()
    };
  }
  
  // Perform individual analyses
  const domain = detectPromptDomain(text);
  const clarityAnalysis = analyzeClarity(text);
  const completenessAnalysis = analyzeCompleteness(text);
  const futureAnalysis = analyzeFutureApplicability(text, domain);
  
  // Calculate overall scores
  const qualityScore = calculateQualityScore(clarityAnalysis, completenessAnalysis);
  const futureApplicability = futureAnalysis.futureApplicability;
  
  // Generate recommendations
  const recommendations = generateRecommendations(
    clarityAnalysis, 
    completenessAnalysis, 
    futureAnalysis, 
    qualityScore
  );
  
  // Identify risk factors
  const riskFactors = identifyRiskFactors(text, futureAnalysis, qualityScore);
  
  return {
    qualityScore,
    futureApplicability,
    domain,
    analysis: {
      clarity: clarityAnalysis,
      completeness: completenessAnalysis,
      futureApplicability: futureAnalysis
    },
    recommendations,
    riskFactors,
    lastAnalyzed: new Date().toISOString(),
    metadata: {
      wordCount: text.split(/\s+/).length,
      charCount: text.length,
      sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      ...metadata
    }
  };
};

/**
 * Generate improvement recommendations
 * @param {Object} clarity - Clarity analysis results
 * @param {Object} completeness - Completeness analysis results
 * @param {Object} future - Future applicability analysis
 * @param {number} qualityScore - Overall quality score
 * @returns {Array} Array of recommendation strings
 */
const generateRecommendations = (clarity, completeness, future, qualityScore) => {
  const recommendations = [];
  
  // Quality-based recommendations
  if (qualityScore < 0.6) {
    recommendations.push('Consider improving overall prompt quality');
  }
  
  // Clarity recommendations
  if (clarity.clarity < 0.6) {
    recommendations.push('Make the prompt more clear and specific');
  }
  if (clarity.specificity < 0.5) {
    recommendations.push('Add more specific details and requirements');
  }
  if (clarity.actionability < 0.5) {
    recommendations.push('Include clear action verbs and desired outcomes');
  }
  
  // Completeness recommendations
  if (completeness.completeness < 0.6) {
    recommendations.push('Provide more complete information and context');
  }
  if (completeness.context < 0.5) {
    recommendations.push('Add relevant context and background information');
  }
  if (completeness.structure < 0.5) {
    recommendations.push('Improve prompt structure and organization');
  }
  
  // Future applicability recommendations
  if (future.futureApplicability < 0.5) {
    recommendations.push('Consider making the prompt more timeless and adaptable');
  }
  if (future.timeIndependence < 0.4) {
    recommendations.push('Remove time-sensitive references for better longevity');
  }
  if (future.adaptability < 0.5) {
    recommendations.push('Make the prompt more adaptable for different contexts');
  }
  
  // Positive reinforcement
  if (qualityScore > 0.8) {
    recommendations.push('Excellent prompt quality - consider saving as a template');
  }
  
  return recommendations.length > 0 ? recommendations : ['Prompt analysis complete - no major issues found'];
};

/**
 * Identify potential risk factors
 * @param {string} text - Original prompt text
 * @param {Object} futureAnalysis - Future applicability analysis
 * @param {number} qualityScore - Quality score
 * @returns {Array} Array of risk factor strings
 */
const identifyRiskFactors = (text, futureAnalysis, qualityScore) => {
  const risks = [];
  const lowerText = text.toLowerCase();
  
  // Quality risks
  if (qualityScore < 0.4) {
    risks.push('Low quality score may lead to poor AI responses');
  }
  
  // Future applicability risks
  if (futureAnalysis.futureApplicability < 0.4) {
    risks.push('High risk of becoming obsolete within 1-2 years');
  }
  
  if (futureAnalysis.timeIndependence < 0.3) {
    risks.push('Contains time-sensitive content that may quickly become outdated');
  }
  
  // Content-specific risks
  if (TIME_SENSITIVE_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    risks.push('Contains time-sensitive keywords that may date the prompt');
  }
  
  if (text.length < 20) {
    risks.push('Prompt may be too brief to generate quality responses');
  }
  
  if (text.length > 500) {
    risks.push('Prompt may be too long and complex for optimal results');
  }
  
  // Technology-specific risks
  if (lowerText.includes('gpt') || lowerText.includes('chatgpt')) {
    risks.push('Contains model-specific references that may become outdated');
  }
  
  return risks;
};

/**
 * Batch analyze multiple prompts
 * @param {Array} prompts - Array of prompt objects with text property
 * @returns {Array} Array of analysis results
 */
export const batchAnalyzePrompts = (prompts) => {
  return prompts.map(prompt => {
    const text = prompt.original || prompt.text || '';
    const metadata = {
      usageCount: prompt.usageCount || 0,
      lastUsed: prompt.lastUsed,
      createdAt: prompt.createdAt
    };
    
    return {
      id: prompt.id,
      analysis: analyzePrompt(text, metadata)
    };
  });
};

export default {
  analyzePrompt,
  batchAnalyzePrompts,
  detectPromptDomain,
  analyzeClarity,
  analyzeCompleteness,
  analyzeFutureApplicability,
  calculateQualityScore
};