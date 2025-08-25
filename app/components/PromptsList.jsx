import { forwardRef } from 'react';
import Card from './Card';

const PromptsList = forwardRef(({ 
  filteredPrompts, 
  searchQuery, 
  showSavedOnly, 
  deletionQueue,
  onDeletePrompt,
  onSavePrompt,
  onQueueForDeletion 
}, ref) => {
  // Check if a prompt is queued for deletion
  const isPromptQueued = (promptId) => {
    return deletionQueue && deletionQueue.has(promptId);
  };

  return (
    <div
      ref={ref}
      id="cards"
      className="w-full flex flex-col gap-3 h-[220px] md:h-[520px] overflow-y-scroll pb-2 pt-2 relative"
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
          const isQueued = isPromptQueued(prompt.id);
          return (
            <Card 
              key={prompt.id} 
              prompt={prompt} 
              isLatest={isLatest}
              isQueued={isQueued}
              onDelete={onDeletePrompt}
              onSave={onSavePrompt}
              onQueueForDeletion={onQueueForDeletion}
            />
          );
        })
      )}
    </div>
  );
});

PromptsList.displayName = 'PromptsList';

export default PromptsList;