import { useState, useEffect } from 'react';
import { 
  getSessionPrompts, addPromptToSession, deletePromptFromSession, 
  savePromptToSession, getSessionList 
} from '../utils/localStorage';

export const usePromptManagement = (activeSessionId) => {
  const [prompts, setPrompts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

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

  // Filter prompts based on search query and saved status
  const getFilteredPrompts = () => {
    // Display all prompts in reverse order (oldest first, newest at bottom)
    const displayedPrompts = [...prompts].reverse();
    
    // Filter prompts based on search query
    const searchFilteredPrompts = searchQuery.trim() 
      ? displayedPrompts.filter(prompt => {
          const searchTerm = searchQuery.toLowerCase();
          const originalText = prompt.original?.toLowerCase() || '';
          const refinedText = prompt.refined?.toLowerCase() || '';
          return originalText.includes(searchTerm) || refinedText.includes(searchTerm);
        })
      : displayedPrompts;
    
    // Filter prompts based on saved status if filter is active
    const filteredPrompts = showSavedOnly 
      ? searchFilteredPrompts.filter(prompt => prompt.saved)
      : searchFilteredPrompts;

    return {
      filteredPrompts,
      searchResultsCount: searchFilteredPrompts.length,
      savedCount: prompts.filter(prompt => prompt.saved).length,
      totalCount: prompts.length
    };
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Toggle saved filter
  const toggleSavedFilter = () => {
    setShowSavedOnly(!showSavedOnly);
  };

  return {
    // State
    prompts,
    searchQuery,
    showSavedOnly,
    
    // Actions
    handleAddPrompt,
    handleDeletePrompt,
    handleSavePrompt,
    setSearchQuery,
    clearSearch,
    toggleSavedFilter,
    
    // Computed values
    ...getFilteredPrompts()
  };
};