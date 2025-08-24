"use client";

import { useState, useEffect, useRef } from "react";
import { PiGearBold } from "react-icons/pi";
import Image from "next/image";
import TextArea from "./components/TextArea";
import Card from "./components/Card";
import Settings from "./components/Settings";
import { loadPrompts, addPrompt, updatePromptRefinement } from "./utils/localStorage";

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [isRefining, setIsRefining] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsUpdateKey, setSettingsUpdateKey] = useState(0);
  const cardsContainerRef = useRef(null);

  // Load prompts from localStorage on component mount
  useEffect(() => {
    const savedPrompts = loadPrompts();
    setPrompts(savedPrompts);
  }, []);

  // Auto-scroll to latest prompt (bottom)
  useEffect(() => {
    if (cardsContainerRef.current && prompts.length > 0) {
      cardsContainerRef.current.scrollTop = cardsContainerRef.current.scrollHeight;
    }
  }, [prompts]);

  const handleSubmitPrompt = async (originalPrompt, refinedPrompt = null) => {
    setIsRefining(true);
    
    try {
      // Add prompt immediately (with or without refinement)
      const updatedPrompts = addPrompt(originalPrompt, refinedPrompt);
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error adding prompt:', error);
    } finally {
      setIsRefining(false);
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
        <div className="wrapper flex justify-between items-center py-[80px] px-[550px]">
          <div className="flex items-center gap-4">
            <h1 className="text-[1.5em] z-20">yourfine</h1>
            {prompts.length > 0 && (
              <div className="text-[0.9em] opacity-70 bg-[#3B3B3B] px-3 py-1 rounded-full">
                {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="bg-[#3B3B3B] hover:bg-[#4B4B4B] border border-[#424242] p-3 rounded-[5px] transition-all duration-150 flex items-center justify-center w-[52px] h-[52px] flex-shrink-0"
            title="Settings"
          >
            <PiGearBold className="text-[1.2em]" />
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="mx-[550px] flex flex-col items-center gap-4 h-full px-4">
          <div className="w-full relative" id="wrapper-cards">
            <div
              ref={cardsContainerRef}
              id="cards"
              className="w-full flex flex-col gap-3 h-[500px] overflow-y-scroll pb-2 pt-2 relative"
            >
              {prompts.length === 0 ? (
                // Empty state
                <div className="flex items-center justify-center h-full">
                  <div className="text-center opacity-50">
                    <div className="text-[1.2em] mb-2">No prompts yet</div>
                    <div className="text-[0.9em]">Start by typing a prompt below</div>
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
                    />
                  );
                })
              )}
            </div>
            <div id="shadowing-top"></div>
            <div id="shadowing-bottom"></div>
          </div>

          <TextArea 
            key={settingsUpdateKey}
            onSubmitPrompt={handleSubmitPrompt}
            isRefining={isRefining}
          />
        </div>
      </div>
      
      {/* Status indicator */}
      {isRefining && (
        <div className="fixed bottom-4 right-4 bg-[#3B3B3B] border border-[#424242] rounded-[5px] px-4 py-2 flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="text-[0.9em]">Refining prompt...</span>
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
