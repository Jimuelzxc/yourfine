import { useState, useRef } from 'react';
import { PiCopyBold, PiCheckBold, PiSwapBold, PiBookmarkSimpleBold } from 'react-icons/pi';

function Card({ prompt, isLatest = false, onDelete, onSave }) {
  const [showRefined, setShowRefined] = useState(!!prompt?.refined);
  const [copied, setCopied] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const swipeStartTime = useRef(0);
  const hasSwipeStarted = useRef(false);

  // Handle copy to clipboard
  const handleCopy = async (e) => {
    e.stopPropagation();
    if (isLongPress.current || isDragging) return;

    const textToCopy = showRefined && prompt?.refined ? prompt.refined : prompt?.original || '';
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // Handle swipe gestures
  const handleMouseDown = (e) => {
    isLongPress.current = false;
    hasSwipeStarted.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    swipeStartTime.current = Date.now();
    
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (prompt?.refined && !isDragging) {
        setShowRefined(prev => !prev);
      }
    }, 500); // 500ms for long press
  };

  const handleMouseMove = (e) => {
    if (!dragStart.current.x) return;
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    // Only start horizontal swipe if movement is more horizontal than vertical
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      hasSwipeStarted.current = true;
      setIsDragging(true);
      
      // Clear long press timer when swiping
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Determine swipe direction and set offset
      if (deltaX > 0) {
        // Right swipe (delete)
        setSwipeDirection('right');
        const maxSwipe = 150;
        const clampedOffset = Math.min(deltaX, maxSwipe);
        setSwipeOffset(clampedOffset);
      } else if (deltaX < 0) {
        // Left swipe (save)
        setSwipeDirection('left');
        const maxSwipe = 150;
        const clampedOffset = Math.max(deltaX, -maxSwipe);
        setSwipeOffset(clampedOffset);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (isDragging && hasSwipeStarted.current) {
      const swipeThreshold = 100;
      
      if (swipeDirection === 'right' && swipeOffset > swipeThreshold) {
        // Show delete confirmation
        setShowDeleteConfirm(true);
      } else if (swipeDirection === 'left' && Math.abs(swipeOffset) > swipeThreshold) {
        // Trigger save action immediately
        if (onSave) {
          onSave(prompt.id);
        }
      }
      
      // Reset swipe state
      setSwipeOffset(0);
      setIsDragging(false);
      setSwipeDirection(null);
    }
    
    dragStart.current = { x: 0, y: 0 };
    hasSwipeStarted.current = false;
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    isLongPress.current = false;
    hasSwipeStarted.current = false;
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    swipeStartTime.current = Date.now();
    
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (prompt?.refined && !isDragging) {
        setShowRefined(prev => !prev);
      }
    }, 500);
  };

  const handleTouchMove = (e) => {
    if (!dragStart.current.x) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.current.x;
    const deltaY = touch.clientY - dragStart.current.y;
    
    // Only start horizontal swipe if movement is more horizontal than vertical
    if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault(); // Prevent scrolling
      hasSwipeStarted.current = true;
      setIsDragging(true);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      
      // Determine swipe direction and set offset
      if (deltaX > 0) {
        // Right swipe (delete)
        setSwipeDirection('right');
        const maxSwipe = 150;
        const clampedOffset = Math.min(deltaX, maxSwipe);
        setSwipeOffset(clampedOffset);
      } else if (deltaX < 0) {
        // Left swipe (save)
        setSwipeDirection('left');
        const maxSwipe = 150;
        const clampedOffset = Math.max(deltaX, -maxSwipe);
        setSwipeOffset(clampedOffset);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (isDragging && hasSwipeStarted.current) {
      const swipeThreshold = 100;
      
      if (swipeDirection === 'right' && swipeOffset > swipeThreshold) {
        setShowDeleteConfirm(true);
      } else if (swipeDirection === 'left' && Math.abs(swipeOffset) > swipeThreshold) {
        if (onSave) {
          onSave(prompt.id);
        }
      }
      
      setSwipeOffset(0);
      setIsDragging(false);
      setSwipeDirection(null);
    }
    
    dragStart.current = { x: 0, y: 0 };
    hasSwipeStarted.current = false;
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Reset swipe if mouse leaves
    if (isDragging) {
      setSwipeOffset(0);
      setIsDragging(false);
      setSwipeDirection(null);
      dragStart.current = { x: 0, y: 0 };
      hasSwipeStarted.current = false;
    }
  };

  // Handle deletion
  const handleDelete = () => {
    if (onDelete) {
      onDelete(prompt.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle click (copy if not long press)
  const handleClick = (e) => {
    if (showDeleteConfirm) {
      e.stopPropagation();
      return;
    }
    
    setTimeout(() => {
      if (!isLongPress.current && !isDragging) {
        handleCopy(e);
      }
    }, 0);
  };

  if (!prompt) {
    return (
      <div className="bg-[#3B3B3B] border-2 border-[#424242] w-full rounded-[5px] p-3 sm:p-4 py-6 sm:py-8 opacity-20">
        <div className="text-[0.8em] sm:text-[0.9em] opacity-50">No prompts yet</div>
        <p className="text-[1em] sm:text-[1.1em]">Start by typing a prompt below</p>
      </div>
    );
  }

  const displayText = showRefined && prompt.refined ? prompt.refined : prompt.original;
  const hasRefined = Boolean(prompt.refined);

  return (
    <>
      <div
        className={`w-full rounded-[5px] p-3 sm:p-4 py-4 sm:py-6 cursor-pointer transition-all duration-200 relative group select-none ${isDragging ? '' : ''} ${
          isLatest 
            ? 'bg-[#404040] border-2 border-[#606060] opacity-100 shadow-md latest-prompt' 
            : 'bg-[#3B3B3B] border-2 border-[#424242] opacity-40 hover:opacity-70 hover:border-[#4a4a4a]'
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        title={hasRefined ? "Long press to toggle between original and refined" : "Click to copy"}
      >
        {/* Save background indicator - left swipe */}
        {swipeOffset < 0 && swipeDirection === 'left' && (
          <div 
            className="absolute inset-y-0 right-0 bg-orange-500/60 flex items-center justify-end pr-4 pointer-events-none z-0"
            style={{
              width: `${Math.abs(swipeOffset)}px`,
              opacity: Math.min(Math.abs(swipeOffset) / 30, 1)
            }}
          >
            <div className="flex items-center gap-2 text-white drop-shadow-lg">
              {Math.abs(swipeOffset) > 80 && (
                <span className="text-sm font-bold whitespace-nowrap bg-orange-600/80 px-2 py-1 rounded backdrop-blur-sm">
                  {prompt?.saved ? 'Remove from saved' : 'Save prompt'}
                </span>
              )}
              <PiBookmarkSimpleBold className={`text-xl font-bold ${prompt?.saved ? 'fill-current' : ''}`} />
            </div>
          </div>
        )}

        {/* Delete background indicator - right swipe */}
        {swipeOffset > 0 && swipeDirection === 'right' && (
          <div 
            className="absolute inset-y-0 left-0 bg-red-600/60 flex items-center justify-start pl-4 pointer-events-none z-0"
            style={{
              width: `${swipeOffset}px`,
              opacity: Math.min(swipeOffset / 30, 1)
            }}
          >
            <div className="flex items-center gap-2 text-white drop-shadow-lg">
              {swipeOffset > 80 && (
                <span className="text-sm font-bold whitespace-nowrap bg-red-700/80 px-2 py-1 rounded backdrop-blur-sm">
                  Release to delete
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card content with higher z-index */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <div className={`text-[0.8em] sm:text-[0.9em] ${
                isLatest ? 'opacity-70 text-gray-300' : 'opacity-50 text-gray-400'
              }`}>{prompt.createdAt}</div>
              {isLatest && (
                <span className="bg-blue-500 text-white text-[0.65em] sm:text-[0.7em] px-1.5 sm:px-2 py-0.5 rounded-full font-medium">
                  Latest
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {prompt?.saved && (
                <div className="flex items-center gap-1 text-orange-400 text-[0.75em] sm:text-[0.8em]">
                  <PiBookmarkSimpleBold className="fill-current" />
                  <span className="hidden sm:inline text-orange-300">Saved</span>
                </div>
              )}
              {hasRefined && (
                <div className={`flex items-center gap-1 text-[0.75em] sm:text-[0.8em] ${
                  isLatest ? 'opacity-80 text-gray-300' : 'opacity-70 text-gray-400'
                }`}>
                  <PiSwapBold />
                  <span className="hidden sm:inline">{showRefined ? 'Refined' : 'Original'}</span>
                </div>
              )}
              <div className={`text-[0.75em] sm:text-[0.8em] ${
                isLatest ? 'opacity-80 text-gray-300' : 'opacity-70 text-gray-400'
              }`}>
                {copied ? <PiCheckBold className="text-green-400" /> : <PiCopyBold />}
              </div>
            </div>
          </div>
          
          <p className={`text-[1em] sm:text-[1.1em] leading-relaxed ${
            isLatest ? 'text-white' : 'text-gray-200'
          }`}>
            {displayText}
          </p>
        </div>
        
        {hasRefined && (
          <div className="absolute top-2 right-2 z-20">
            <div className={`w-2 h-2 rounded-full ${
              showRefined 
                ? (isLatest ? 'bg-blue-400 shadow-sm' : 'bg-blue-400') 
                : (isLatest ? 'bg-yellow-400 shadow-sm' : 'bg-yellow-400')
            }`} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-white mb-2">Delete Prompt?</h3>
            <p className="text-gray-300 text-sm mb-6">
              This action cannot be undone. The prompt will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-[#404040] hover:bg-[#4a4a4a] text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Card;
