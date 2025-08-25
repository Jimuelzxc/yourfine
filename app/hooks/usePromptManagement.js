import { useState, useEffect, useMemo } from 'react';
import { 
  getSessionPrompts, addPromptToSession, deletePromptFromSession, 
  savePromptToSession, getSessionList 
} from '../utils/localStorage';
import { semanticSearch, getSearchSuggestions } from '../utils/semanticSearch';

export const usePromptManagement = (activeSessionId) => {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [semanticMode, setSemanticMode] = useState(false);
  const [semanticThreshold, setSemanticThreshold] = useState(0.15);

  // Load prompts when active session changes
  useEffect(() => {
    const activeSessionPrompts = getSessionPrompts(activeSessionId);
    setPrompts(activeSessionPrompts);
  }, [activeSessionId]);

  // Handle adding a new prompt
  const handleAddPrompt = async (originalPrompt, refinedPrompt = null) => {
    try {
      const updatedPrompts = addPromptToSession(activeSessionId, originalPrompt, refinedPrompt);
      setPrompts(updatedPrompts);
      return { success: true, prompts: updatedPrompts };
    } catch (error) {
      console.error('Error adding prompt:', error);
      return { success: false, error: error.message };
    }
  };

  // Handle deleting a prompt
  const handleDeletePrompt = (promptId) => {
    const updatedPrompts = deletePromptFromSession(activeSessionId, promptId);
    if (updatedPrompts !== null) {
      setPrompts(updatedPrompts);
      return { success: true, prompts: updatedPrompts };
    }
    return { success: false };
  };

  // Handle saving/bookmarking a prompt
  const handleSavePrompt = (promptId) => {
    const updatedPrompts = savePromptToSession(activeSessionId, promptId);
    if (updatedPrompts !== null) {
      setPrompts(updatedPrompts);
      return { success: true, prompts: updatedPrompts };
    }
    return { success: false };
  };

  // Memoized search suggestions for performance
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    return getSearchSuggestions(searchQuery, prompts, 5);
  }, [searchQuery, prompts]);
  
  // Enhanced filtering with semantic search support
  const getFilteredPrompts = () => {
    // Display all prompts in reverse order (oldest first, newest at bottom)
    const displayedPrompts = [...prompts].reverse();
    
    let searchFilteredPrompts = displayedPrompts;
    let semanticResults = [];
    let semanticResultsCount = 0;
    
    if (searchQuery.trim()) {
      if (semanticMode) {
        // Semantic search mode
        const semanticSearchResults = semanticSearch(searchQuery, displayedPrompts, {
          threshold: semanticThreshold,
          maxResults: 100,
          includeKeywordMatch: true,
          sortBy: 'relevance'
        });
        
        // Extract prompts from semantic results and preserve similarity data
        searchFilteredPrompts = semanticSearchResults.map(result => ({
          ...result.prompt,
          _semanticScore: result.similarity.score,
          _semanticConfidence: result.similarity.confidence,
          _matchedField: result.similarity.matchedField,
          _hasKeywordMatch: result.similarity.hasKeywordMatch,
          _intentMatch: result.similarity.intent
        }));
        
        semanticResults = semanticSearchResults;
        semanticResultsCount = semanticSearchResults.length;
        
        // Also get keyword matches for comparison
        const keywordMatches = displayedPrompts.filter(prompt => {
          const searchTerm = searchQuery.toLowerCase();
          const originalText = prompt.original?.toLowerCase() || '';
          const refinedText = prompt.refined?.toLowerCase() || '';
          return originalText.includes(searchTerm) || refinedText.includes(searchTerm);
        });
        
        // Update search results count to include keyword matches not found by semantic search
        const totalKeywordCount = keywordMatches.length;
        
      } else {
        // Traditional keyword search mode
        searchFilteredPrompts = displayedPrompts.filter(prompt => {
          const searchTerm = searchQuery.toLowerCase();
          const originalText = prompt.original?.toLowerCase() || '';
          const refinedText = prompt.refined?.toLowerCase() || '';
          return originalText.includes(searchTerm) || refinedText.includes(searchTerm);
        });
      }
    }
    
    // Apply saved filter
    const filteredPrompts = showSavedOnly 
      ? searchFilteredPrompts.filter(prompt => prompt.saved)
      : searchFilteredPrompts;

    // Calculate all counts
    const searchResultsCount = searchQuery.trim() 
      ? (semanticMode ? 
          // For semantic mode, count all keyword matches for comparison
          displayedPrompts.filter(prompt => {
            const searchTerm = searchQuery.toLowerCase();
            const originalText = prompt.original?.toLowerCase() || '';
            const refinedText = prompt.refined?.toLowerCase() || '';
            return originalText.includes(searchTerm) || refinedText.includes(searchTerm);
          }).length
          : searchFilteredPrompts.length)
      : displayedPrompts.length;
    
    return {
      filteredPrompts,
      searchResultsCount,
      semanticResultsCount,
      semanticResults,
      savedCount: prompts.filter(prompt => prompt.saved).length,
      totalCount: prompts.length
    };
  };

  // Clear search query and reset semantic mode if needed
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Toggle saved filter
  const toggleSavedFilter = () => {
    setShowSavedOnly(!showSavedOnly);
  };

  // Toggle semantic search mode
  const toggleSemanticMode = () => {
    setSemanticMode(!semanticMode);
  };
  
  // Update semantic search threshold
  const updateSemanticThreshold = (threshold) => {
    setSemanticThreshold(Math.max(0, Math.min(1, threshold)));
  };
  
  // Handle search suggestion selection
  const selectSearchSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
  };

  return {
    // State
    prompts,
    searchQuery,
    showSavedOnly,
    semanticMode,
    semanticThreshold,
    
    // Actions
    handleAddPrompt,
    handleDeletePrompt,
    handleSavePrompt,
    setSearchQuery,
    clearSearch,
    toggleSavedFilter,
    toggleSemanticMode,
    updateSemanticThreshold,
    selectSearchSuggestion,
    
    // Computed values
    searchSuggestions,
    ...getFilteredPrompts()
  };
};