/**
 * Semantic Search Utility for Prompt Management
 * 
 * Provides semantic search capabilities that go beyond keyword matching:
 * - Text similarity analysis using multiple algorithms
 * - Intent-based search detection
 * - Relevance scoring and ranking
 * - Query preprocessing and normalization
 */

// Common words to exclude from semantic analysis
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'from', 'about', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
]);

// Intent patterns for query classification
const INTENT_PATTERNS = {
  improvement: /\b(better|improve|enhance|optimize|refine|upgrade|fix)\b/i,
  creation: /\b(create|make|build|generate|write|design|develop)\b/i,
  explanation: /\b(explain|describe|what|how|why|tell me about)\b/i,
  comparison: /\b(compare|versus|vs|difference|similar|like)\b/i,
  question: /\b(what|how|why|when|where|who|which)\b/i,
  instruction: /\b(should|must|need to|have to|required)\b/i
};

/**
 * Preprocess text for semantic analysis
 * @param {string} text - Input text to preprocess
 * @returns {Object} Processed text data
 */
export const preprocessText = (text) => {
  if (!text || typeof text !== 'string') return { tokens: [], normalized: '', wordCount: 0 };
  
  // Normalize text: lowercase, remove special characters, preserve spaces
  const normalized = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Tokenize into words
  const words = normalized.split(' ').filter(word => word.length > 1);
  
  // Remove stop words for semantic analysis
  const meaningfulTokens = words.filter(word => !STOP_WORDS.has(word));
  
  return {
    tokens: meaningfulTokens,
    allWords: words,
    normalized,
    wordCount: words.length,
    originalLength: text.length
  };
};

/**
 * Calculate Jaccard similarity between two sets of tokens
 * @param {Array} tokens1 - First set of tokens
 * @param {Array} tokens2 - Second set of tokens
 * @returns {number} Similarity score (0-1)
 */
export const calculateJaccardSimilarity = (tokens1, tokens2) => {
  if (!tokens1.length || !tokens2.length) return 0;
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Calculate cosine similarity between two text vectors
 * @param {Array} tokens1 - First set of tokens
 * @param {Array} tokens2 - Second set of tokens
 * @returns {number} Similarity score (0-1)
 */
export const calculateCosineSimilarity = (tokens1, tokens2) => {
  if (!tokens1.length || !tokens2.length) return 0;
  
  // Create vocabulary from both token sets
  const vocabulary = [...new Set([...tokens1, ...tokens2])];
  
  // Create frequency vectors
  const vector1 = vocabulary.map(word => tokens1.filter(token => token === word).length);
  const vector2 = vocabulary.map(word => tokens2.filter(token => token === word).length);
  
  // Calculate dot product
  const dotProduct = vector1.reduce((sum, val, i) => sum + (val * vector2[i]), 0);
  
  // Calculate magnitudes
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + (val * val), 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + (val * val), 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Calculate semantic similarity using fuzzy string matching
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
export const calculateFuzzySimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Detect search intent from query
 * @param {string} query - Search query
 * @returns {Object} Intent analysis
 */
export const detectSearchIntent = (query) => {
  const detectedIntents = [];
  const confidence = {};
  
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    const matches = query.match(pattern);
    if (matches) {
      detectedIntents.push(intent);
      confidence[intent] = matches.length / preprocessText(query).wordCount;
    }
  }
  
  const primaryIntent = detectedIntents.length > 0 
    ? detectedIntents.reduce((a, b) => confidence[a] > confidence[b] ? a : b)
    : 'general';
  
  return {
    primary: primaryIntent,
    all: detectedIntents,
    confidence,
    isQuestion: /\?/.test(query) || INTENT_PATTERNS.question.test(query)
  };
};

/**
 * Calculate comprehensive semantic similarity score
 * @param {string} query - Search query
 * @param {string} text - Text to compare against
 * @param {Object} options - Scoring options
 * @returns {Object} Similarity analysis
 */
export const calculateSemanticSimilarity = (query, text, options = {}) => {
  const {
    jaccardWeight = 0.3,
    cosineWeight = 0.4,
    fuzzyWeight = 0.3,
    intentBonus = 0.1
  } = options;
  
  const queryData = preprocessText(query);
  const textData = preprocessText(text);
  
  // Calculate different similarity metrics
  const jaccardScore = calculateJaccardSimilarity(queryData.tokens, textData.tokens);
  const cosineScore = calculateCosineSimilarity(queryData.tokens, textData.tokens);
  const fuzzyScore = calculateFuzzySimilarity(queryData.normalized, textData.normalized);
  
  // Calculate weighted composite score
  const baseScore = (jaccardScore * jaccardWeight) + 
                   (cosineScore * cosineWeight) + 
                   (fuzzyScore * fuzzyWeight);
  
  // Intent matching bonus
  const queryIntent = detectSearchIntent(query);
  const textIntent = detectSearchIntent(text);
  const intentMatch = queryIntent.all.some(intent => textIntent.all.includes(intent));
  const intentBonusScore = intentMatch ? intentBonus : 0;
  
  const finalScore = Math.min(baseScore + intentBonusScore, 1);
  
  return {
    score: finalScore,
    breakdown: {
      jaccard: jaccardScore,
      cosine: cosineScore,
      fuzzy: fuzzyScore,
      intentBonus: intentBonusScore
    },
    intent: queryIntent,
    confidence: finalScore > 0.3 ? 'high' : finalScore > 0.15 ? 'medium' : 'low'
  };
};

/**
 * Search prompts using semantic similarity
 * @param {string} query - Search query
 * @param {Array} prompts - Array of prompt objects
 * @param {Object} options - Search options
 * @returns {Array} Ranked search results
 */
export const semanticSearch = (query, prompts, options = {}) => {
  const {
    threshold = 0.1,
    maxResults = 50,
    includeKeywordMatch = true,
    sortBy = 'relevance' // 'relevance' or 'similarity'
  } = options;
  
  if (!query.trim() || !prompts.length) return [];
  
  const results = [];
  
  prompts.forEach(prompt => {
    // Search in both original and refined text
    const originalSimilarity = calculateSemanticSimilarity(query, prompt.original || '');
    const refinedSimilarity = prompt.refined 
      ? calculateSemanticSimilarity(query, prompt.refined) 
      : null;
    
    // Take the best match between original and refined
    const bestMatch = refinedSimilarity && refinedSimilarity.score > originalSimilarity.score 
      ? { ...refinedSimilarity, matchedField: 'refined' }
      : { ...originalSimilarity, matchedField: 'original' };
    
    // Include keyword matching boost if enabled
    if (includeKeywordMatch) {
      const queryLower = query.toLowerCase();
      const originalKeywordMatch = prompt.original?.toLowerCase().includes(queryLower);
      const refinedKeywordMatch = prompt.refined?.toLowerCase().includes(queryLower);
      
      if (originalKeywordMatch || refinedKeywordMatch) {
        bestMatch.score = Math.min(bestMatch.score + 0.2, 1);
        bestMatch.hasKeywordMatch = true;
      }
    }
    
    // Only include results above threshold
    if (bestMatch.score >= threshold) {
      results.push({
        prompt,
        similarity: bestMatch,
        relevanceScore: bestMatch.score
      });
    }
  });
  
  // Sort results
  const sortedResults = results.sort((a, b) => {
    if (sortBy === 'similarity') {
      return b.similarity.score - a.similarity.score;
    }
    // Default: sort by relevance (considers recency and similarity)
    const scoreA = a.relevanceScore + (new Date(a.prompt.timestamp) / 1e15); // tiny recency boost
    const scoreB = b.relevanceScore + (new Date(b.prompt.timestamp) / 1e15);
    return scoreB - scoreA;
  });
  
  return sortedResults.slice(0, maxResults);
};

/**
 * Get search suggestions based on query and existing prompts
 * @param {string} query - Partial query
 * @param {Array} prompts - Array of prompt objects
 * @param {number} limit - Maximum suggestions
 * @returns {Array} Search suggestions
 */
export const getSearchSuggestions = (query, prompts, limit = 5) => {
  if (!query.trim() || query.length < 2) return [];
  
  const suggestions = new Set();
  const queryLower = query.toLowerCase();
  
  prompts.forEach(prompt => {
    // Extract meaningful phrases from prompts
    const text = `${prompt.original} ${prompt.refined || ''}`;
    const words = preprocessText(text).allWords;
    
    // Find words that start with query
    words.forEach(word => {
      if (word.startsWith(queryLower) && word.length > query.length) {
        suggestions.add(word);
      }
    });
    
    // Find phrases containing the query
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes(queryLower) && sentence.length < 100) {
        const cleaned = sentence.replace(/[^\w\s]/g, '').trim();
        if (cleaned.length > query.length) {
          suggestions.add(cleaned);
        }
      }
    });
  });
  
  return Array.from(suggestions)
    .slice(0, limit)
    .sort((a, b) => a.length - b.length); // Prefer shorter suggestions
};

export default {
  preprocessText,
  calculateSemanticSimilarity,
  semanticSearch,
  detectSearchIntent,
  getSearchSuggestions
};