"use client";

import { useEffect, useRef } from "react";
import TextArea from "./components/TextArea";
import Settings from "./components/Settings";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import FilterControls from "./components/FilterControls";
import PromptsList from "./components/PromptsList";
import BatchDeletionBar from "./components/BatchDeletionBar";
import ConfirmationModal from "./components/ConfirmationModal";
import StatusIndicator from "./components/StatusIndicator";

// Custom hooks
import { usePromptManagement } from "./hooks/usePromptManagement";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useBatchDeletion } from "./hooks/useBatchDeletion";
import { useUIState } from "./hooks/useUIState";

export default function Home() {
  // Custom hooks for state management
  const { sessions, activeSessionId, handleSessionChange, handleCreateSession, 
          handleRenameSession, handleDeleteSession, handleExportSession, 
          handleImportSession, updateSessionsList } = useSessionManagement();
  
  const { prompts, searchQuery, showSavedOnly, semanticMode, filteredPrompts, 
          searchResultsCount, semanticResultsCount, savedCount, totalCount, 
          searchSuggestions, handleAddPrompt, handleDeletePrompt, 
          handleSavePrompt, setSearchQuery, clearSearch, toggleSavedFilter,
          toggleSemanticMode, selectSearchSuggestion } = usePromptManagement(activeSessionId);
  
  const { deletionQueue, showBatchConfirm, queueSize, handleQueueForDeletion, 
          handleBatchDelete, executeBatchDeletion, cancelBatchDeletion, 
          clearDeletionQueue } = useBatchDeletion();
  
  const { showSettings, isRefining, openSettings, 
          closeSettings, setRefiningState } = useUIState();
  
  const cardsContainerRef = useRef(null);



  // Auto-scroll to latest prompt (bottom)
  useEffect(() => {
    if (cardsContainerRef.current && prompts.length > 0) {
      cardsContainerRef.current.scrollTop = cardsContainerRef.current.scrollHeight;
    }
  }, [prompts]);

  const handleSubmitPrompt = async (originalPrompt, refinedPrompt = null) => {
    setRefiningState(true);
    
    try {
      const result = await handleAddPrompt(originalPrompt, refinedPrompt);
      if (result.success) {
        // Update session list to reflect new prompt count
        updateSessionsList();
      }
    } catch (error) {
      console.error('Error adding prompt:', error);
    } finally {
      setRefiningState(false);
    }
  };



  // Enhanced prompt handlers that update session list
  const handlePromptDelete = (promptId) => {
    const result = handleDeletePrompt(promptId);
    if (result.success) {
      updateSessionsList();
    }
  };

  const handlePromptSave = (promptId) => {
    const result = handleSavePrompt(promptId);
    if (result.success) {
      updateSessionsList();
    }
  };

  // Enhanced batch deletion handler
  const handleBatchDeletionExecute = () => {
    executeBatchDeletion(handleDeletePrompt);
    updateSessionsList();
  };





  return (
    <div className="h-screen flex flex-col bg-[#282828]">
      {/* Navigation Header */}
      <Header onSettingsClick={openSettings} />
      
      <div className="flex-1">
        <div className=" mx-2 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-[550px] flex flex-col items-center gap-4 h-full px-4">
          <div className="w-full relative" id="wrapper-cards">
            {/* Batch Deletion Queue UI */}
            <BatchDeletionBar 
              queueSize={queueSize}
              onClearQueue={clearDeletionQueue}
              onBatchDelete={handleBatchDelete}
            />
            
            {/* Search Input */}
            {prompts.length > 0 && (
              <SearchBar 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={clearSearch}
                searchResultsCount={searchResultsCount}
                semanticMode={semanticMode}
                onToggleSemanticMode={toggleSemanticMode}
                semanticResultsCount={semanticResultsCount}
                searchSuggestions={searchSuggestions}
                onSelectSuggestion={selectSearchSuggestion}
              />
            )}
            
            {/* Filter Controls */}
            {prompts.length > 0 && (
              <FilterControls 
                showSavedOnly={showSavedOnly}
                onToggleSavedFilter={toggleSavedFilter}
                savedCount={savedCount}
                totalCount={totalCount}
              />
            )}
            
            {/* Prompts List */}
            <PromptsList 
              ref={cardsContainerRef}
              filteredPrompts={filteredPrompts}
              searchQuery={searchQuery}
              showSavedOnly={showSavedOnly}
              deletionQueue={deletionQueue}
              onDeletePrompt={handlePromptDelete}
              onSavePrompt={handlePromptSave}
              onQueueForDeletion={handleQueueForDeletion}
              semanticMode={semanticMode}
            />         
          </div>

          <TextArea 
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
      <StatusIndicator isRefining={isRefining} />
      
      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings}
        onClose={closeSettings}
      />
      
      {/* Batch Deletion Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showBatchConfirm}
        title="Delete Multiple Prompts?"
        message={`You are about to delete ${queueSize} prompt${queueSize !== 1 ? 's' : ''}. This action cannot be undone.`}
        details="Queued prompts will be permanently removed from this session."
        confirmText={`Delete ${queueSize} Prompt${queueSize !== 1 ? 's' : ''}`}
        onConfirm={handleBatchDeletionExecute}
        onCancel={cancelBatchDeletion}
      />
    </div>
  );
}
