"use client";

import { useState, useEffect, useRef } from "react";
import { PiGearBold, PiBookmarkSimpleBold, PiMagnifyingGlassBold, PiXBold } from "react-icons/pi";
import Image from "next/image";
import TextArea from "./components/TextArea";
import Card from "./components/Card";
import Settings from "./components/Settings";
import SessionSelector from "./components/SessionSelector";
import { 
  // Legacy functions for backward compatibility
  loadPrompts, addPrompt, updatePromptRefinement,
  // New session functions
  loadSessions, getActiveSessionId, setActiveSessionId, getActiveSession,
  createSession, renameSession, deleteSession, addPromptToSession,
  getSessionPrompts, updateSessionPromptRefinement, migratePromptsToSessions,
  getSessionList, deletePromptFromSession, savePromptToSession,
  // Export/Import functions
  exportSession, importSession
} from "./utils/localStorage";

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [isRefining, setIsRefining] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsUpdateKey, setSettingsUpdateKey] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState('default');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletionQueue, setDeletionQueue] = useState(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const cardsContainerRef = useRef(null);

  // Initialize sessions and migrate old data if needed
  useEffect(() => {
    // Run migration first
    migratePromptsToSessions();
    
    // Load sessions and set active session
    const sessionList = getSessionList();
    setSessions(sessionList);
    
    const currentActiveId = getActiveSessionId();
    setActiveSessionIdState(currentActiveId);
    
    // Load prompts for active session
    const activeSessionPrompts = getSessionPrompts(currentActiveId);
    setPrompts(activeSessionPrompts);
  }, []);

  // Update prompts when active session changes
  useEffect(() => {
    const activeSessionPrompts = getSessionPrompts(activeSessionId);
    setPrompts(activeSessionPrompts);
  }, [activeSessionId]);

  // Auto-scroll to latest prompt (bottom)
  useEffect(() => {
    if (cardsContainerRef.current && prompts.length > 0) {
      cardsContainerRef.current.scrollTop = cardsContainerRef.current.scrollHeight;
    }
  }, [prompts]);

  const handleSubmitPrompt = async (originalPrompt, refinedPrompt = null) => {
    setIsRefining(true);
    
    try {
      // Add prompt to active session
      const updatedPrompts = addPromptToSession(activeSessionId, originalPrompt, refinedPrompt);
      setPrompts(updatedPrompts);
      
      // Update session list to reflect new prompt count
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
    } catch (error) {
      console.error('Error adding prompt:', error);
    } finally {
      setIsRefining(false);
    }
  };

  // Session management handlers
  const handleSessionChange = (sessionId) => {
    setActiveSessionIdState(sessionId);
    setActiveSessionId(sessionId);
  };

  const handleCreateSession = () => {
    const newSession = createSession();
    const updatedSessionList = getSessionList();
    setSessions(updatedSessionList);
    
    // Switch to the new session
    handleSessionChange(newSession.id);
  };

  const handleRenameSession = (sessionId, newName) => {
    renameSession(sessionId, newName);
    const updatedSessionList = getSessionList();
    setSessions(updatedSessionList);
  };

  const handleDeleteSession = (sessionId) => {
    // Check if this is the last session
    if (sessions.length <= 1) {
      // Create a new session before deleting the last one
      const newSession = createSession();
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // Switch to the new session
      handleSessionChange(newSession.id);
    }
    
    if (deleteSession(sessionId)) {
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // If we deleted the active session, switch to the new active one
      const newActiveId = getActiveSessionId();
      setActiveSessionIdState(newActiveId);
    }
  };

  const handleExportSession = (sessionId) => {
    const success = exportSession(sessionId);
    if (success) {
      console.log('Session exported successfully');
    } else {
      alert('Failed to export session. Please try again.');
    }
  };

  const handleImportSession = async (file) => {
    try {
      const result = await importSession(file);
      
      // Update sessions list
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // Switch to the imported session
      handleSessionChange(result.sessionId);
      
      alert(`Session "${result.session.name}" imported successfully with ${result.session.prompts.length} prompts!`);
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };

  // Handle prompt deletion
  const handleDeletePrompt = (promptId) => {
    const updatedPrompts = deletePromptFromSession(activeSessionId, promptId);
    if (updatedPrompts !== null) {
      setPrompts(updatedPrompts);
      
      // Update session list to reflect new prompt count
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
    }
  };

  // Handle prompt save/bookmark
  const handleSavePrompt = (promptId) => {
    const updatedPrompts = savePromptToSession(activeSessionId, promptId);
    if (updatedPrompts !== null) {
      setPrompts(updatedPrompts);
      
      // Update session list to reflect changes
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
    }
  };

  // Handle queuing prompts for batch deletion
  const handleQueueForDeletion = (promptId) => {
    setDeletionQueue(prev => {
      const newQueue = new Set(prev);
      if (newQueue.has(promptId)) {
        newQueue.delete(promptId);
      } else {
        newQueue.add(promptId);
      }
      return newQueue;
    });
  };

  // Handle batch deletion confirmation
  const handleBatchDelete = () => {
    if (deletionQueue.size > 0) {
      setShowBatchConfirm(true);
    }
  };

  // Execute batch deletion
  const executeBatchDeletion = () => {
    deletionQueue.forEach(promptId => {
      deletePromptFromSession(activeSessionId, promptId);
    });
    
    // Refresh prompts after batch deletion
    const updatedPrompts = getSessionPrompts(activeSessionId);
    setPrompts(updatedPrompts);
    
    // Update session list to reflect new prompt count
    const updatedSessionList = getSessionList();
    setSessions(updatedSessionList);
    
    // Clear queue and close confirmation
    setDeletionQueue(new Set());
    setShowBatchConfirm(false);
  };

  // Cancel batch deletion
  const cancelBatchDeletion = () => {
    setShowBatchConfirm(false);
  };

  // Clear deletion queue
  const clearDeletionQueue = () => {
    setDeletionQueue(new Set());
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    // Trigger TextArea refresh by updating key
    setSettingsUpdateKey(prev => prev + 1);
  };

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
    
  // Count saved prompts in current session
  const savedCount = prompts.filter(prompt => prompt.saved).length;
  
  // Count search results
  const searchResultsCount = searchFilteredPrompts.length;

  return (
    <div className="h-screen flex flex-col bg-[#282828]">
      {/* Navigation Header */}
      <div className="">
        <div className="wrapper flex justify-between items-center py-[30px] px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[550px] mx-2 md:mx-4 lg:mx-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-[1.2em] sm:text-[1.5em] z-20 flex items-center">yourfine</h1>
          </div>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="group relative hover:bg-white/10 p-2 sm:p-3 rounded-[8px] transition-all duration-200 flex items-center justify-center w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] flex-shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
            title="Settings"
          >
            <PiGearBold className="text-[1.1em] sm:text-[1.3em] transition-all duration-200 group-hover:rotate-45 group-hover:scale-110 text-gray-300 group-hover:text-white" />
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <div className=" mx-2 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-[550px] flex flex-col items-center gap-4 h-full px-4">
          <div className="w-full relative" id="wrapper-cards">
            {/* Batch Deletion Queue UI */}
            {deletionQueue.size > 0 && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-400/30 rounded-[8px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-red-400 text-[0.9em] font-medium">
                    {deletionQueue.size} prompt{deletionQueue.size !== 1 ? 's' : ''} queued for deletion
                  </div>
                  <div className="text-[0.8em] text-gray-400">
                    Hold Ctrl/Cmd + swipe to add more
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearDeletionQueue}
                    className="px-3 py-1.5 text-[0.8em] text-gray-400 hover:text-white bg-transparent hover:bg-white/10 rounded transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="px-3 py-1.5 text-[0.8em] text-white bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
                  >
                    Delete All
                  </button>
                </div>
              </div>
            )}
            
            {/* Search Input */}
            {prompts.length > 0 && (
              <div className="mb-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PiMagnifyingGlassBold className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prompts..."
                    className="w-full pl-10 pr-10 py-2 bg-[#3B3B3B] border border-[#424242] rounded-[8px] text-white placeholder-gray-400 focus:outline-none focus:border-[#606060] focus:ring-1 focus:ring-[#606060] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      <PiXBold className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Search Results Count */}
                {searchQuery && (
                  <div className="mt-2 text-[0.8em] text-gray-400">
                    {searchResultsCount} result{searchResultsCount !== 1 ? 's' : ''} found
                    {searchResultsCount > 0 && ` for "${searchQuery}"`}
                  </div>
                )}
              </div>
            )}
            
            {/* Saves Filter Toggle */}
            {prompts.length > 0 && (
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowSavedOnly(!showSavedOnly)}
                    className={`group relative hover:bg-white/10 p-2 rounded-[8px] transition-all duration-200 flex items-center justify-center w-[40px] h-[40px] flex-shrink-0 hover:scale-105 active:scale-95 cursor-pointer ${
                      showSavedOnly 
                        ? 'bg-orange-500/20 text-orange-400' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={showSavedOnly ? 'Show all prompts' : 'Show saved prompts only'}
                  >
                    <PiBookmarkSimpleBold className={`text-[1.1em] transition-all duration-200 group-hover:scale-110 ${
                      showSavedOnly ? 'fill-current' : ''
                    }`} />
                  </button>
                </div>
                
                <div className="text-[0.8em] sm:text-[0.9em] opacity-70 px-1 py-1">
                  {showSavedOnly ? savedCount : prompts.length} prompt{(showSavedOnly ? savedCount : prompts.length) !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            
            <div
              ref={cardsContainerRef}
              id="cards"
              className="w-full flex flex-col gap-3  h-[340px]  md:h-[520px] overflow-y-scroll pb-2 pt-2 relative"
            >
              {filteredPrompts.length === 0 ? (
                // Empty state
                <div className="flex items-center justify-center h-full">
                  <div className="text-center opacity-50">
                    {searchQuery ? (
                      <>
                        <div className="text-[1em] sm:text-[1.2em] mb-2">No results found</div>
                        <div className="text-[0.8em] sm:text-[0.9em]">Try different search terms or clear the search</div>
                      </>
                    ) : showSavedOnly ? (
                      <>
                        <div className="text-[1em] sm:text-[1.2em] mb-2">No saved prompts yet</div>
                        <div className="text-[0.8em] sm:text-[0.9em]">Swipe left on prompts to save them</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[1em] sm:text-[1.2em] mb-2">No prompts yet</div>
                        <div className="text-[0.8em] sm:text-[0.9em]">Start by typing a prompt below</div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Display filtered prompts (oldest to newest)
                filteredPrompts.map((prompt, index) => {
                  const isLatest = !showSavedOnly && index === filteredPrompts.length - 1; // Only show latest badge when not filtering
                  const isQueued = deletionQueue.has(prompt.id);
                  return (
                    <Card 
                      key={prompt.id} 
                      prompt={prompt} 
                      isLatest={isLatest}
                      isQueued={isQueued}
                      onDelete={handleDeletePrompt}
                      onSave={handleSavePrompt}
                      onQueueForDeletion={handleQueueForDeletion}
                    />
                  );
                })
              )}
            </div>
         
          </div>

          <TextArea 
            key={settingsUpdateKey}
            onSubmitPrompt={handleSubmitPrompt}
            isRefining={isRefining}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSessionChange={handleSessionChange}
            onCreateSession={handleCreateSession}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            onExportSession={handleExportSession}
            onImportSession={handleImportSession}
          />
        </div>
      </div>
      
      {/* Status indicator */}
      {isRefining && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-[#3B3B3B] border border-[#424242] rounded-[5px] px-3 sm:px-4 py-2 flex items-center gap-2 max-w-xs sm:max-w-none mx-auto sm:mx-0">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full flex-shrink-0"></div>
          <span className="text-[0.8em] sm:text-[0.9em] truncate">Refining prompt...</span>
        </div>
      )}
      
      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings}
        onClose={handleSettingsClose}
      />
      
      {/* Batch Deletion Confirmation Modal */}
      {showBatchConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-white mb-2">Delete Multiple Prompts?</h3>
            <p className="text-gray-300 text-sm mb-4">
              You are about to delete <span className="font-medium text-red-400">{deletionQueue.size}</span> prompt{deletionQueue.size !== 1 ? 's' : ''}. This action cannot be undone.
            </p>
            <div className="text-[0.8em] text-gray-400 mb-6">
              Queued prompts will be permanently removed from this session.
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelBatchDeletion}
                className="px-4 py-2 bg-[#404040] hover:bg-[#4a4a4a] text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeBatchDeletion}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
              >
                Delete {deletionQueue.size} Prompt{deletionQueue.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
