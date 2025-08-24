"use client";

import { useState, useEffect, useRef } from "react";
import { PiGearBold } from "react-icons/pi";
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
  getSessionList, deletePromptFromSession
} from "./utils/localStorage";

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [isRefining, setIsRefining] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsUpdateKey, setSettingsUpdateKey] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState('default');
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
    if (deleteSession(sessionId)) {
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // If we deleted the active session, it would have been switched to default automatically
      const newActiveId = getActiveSessionId();
      setActiveSessionIdState(newActiveId);
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

  const handleSettingsClose = () => {
    setShowSettings(false);
    // Trigger TextArea refresh by updating key
    setSettingsUpdateKey(prev => prev + 1);
  };

  // Display all prompts in reverse order (oldest first, newest at bottom)
  const displayedPrompts = [...prompts].reverse();

  return (
    <div className="h-screen flex flex-col bg-[#282828]">
      {/* Navigation Header */}
      <div className="">
        <div className="wrapper flex justify-between items-center py-[80px] px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[550px]">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-[1.2em] sm:text-[1.5em] z-20 flex items-center">yourfine</h1>
            
            {prompts.length > 0 && (
              <div className="text-[0.8em] sm:text-[0.9em] opacity-70 bg-[#3B3B3B] px-2 sm:px-3 py-1 rounded-full">
                {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
              </div>
            )}
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
        <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-[550px] flex flex-col items-center gap-4 h-full px-4">
          <div className="w-full relative" id="wrapper-cards">
            <div
              ref={cardsContainerRef}
              id="cards"
              className="w-full flex flex-col gap-3 h-[300px] sm:h-[400px] md:h-[400px] overflow-y-scroll pb-2 pt-2 relative"
            >
              {prompts.length === 0 ? (
                // Empty state
                <div className="flex items-center justify-center h-full">
                  <div className="text-center opacity-50">
                    <div className="text-[1em] sm:text-[1.2em] mb-2">No prompts yet</div>
                    <div className="text-[0.8em] sm:text-[0.9em]">Start by typing a prompt below</div>
                  </div>
                </div>
              ) : (
                // Display all prompts (oldest to newest)
                displayedPrompts.map((prompt, index) => {
                  const isLatest = index === displayedPrompts.length - 1; // Last item is newest
                  return (
                    <Card 
                      key={prompt.id} 
                      prompt={prompt} 
                      isLatest={isLatest}
                      onDelete={handleDeletePrompt}
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
    </div>
  );
}
