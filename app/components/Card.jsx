import { useState, useRef } from 'react';
import { PiCopyBold, PiCheckBold, PiSwapBold } from 'react-icons/pi';

function Card({ prompt, isLatest = false }) {
  const [showRefined, setShowRefined] = useState(false);
  const [copied, setCopied] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // Handle copy to clipboard
  const handleCopy = async (e) => {
    e.stopPropagation();
    if (isLongPress.current) return;

    const textToCopy = showRefined && prompt?.refined ? prompt.refined : prompt?.original || '';
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // Handle long press for toggle
  const handleMouseDown = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (prompt?.refined) {
        setShowRefined(prev => !prev);
      }
    }, 500); // 500ms for long press
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Handle click (copy if not long press)
  const handleClick = (e) => {
    setTimeout(() => {
      if (!isLongPress.current) {
        handleCopy(e);
      }
    }, 0);
  };

  if (!prompt) {
    return (
      <div className="bg-[#3B3B3B] border-2 border-[#424242] w-full rounded-[5px] p-4 py-8 opacity-20">
        <div className="text-[0.9em] opacity-50">No prompts yet</div>
        <p className="text-[1.1em]">Start by typing a prompt below</p>
      </div>
    );
  }

  const displayText = showRefined && prompt.refined ? prompt.refined : prompt.original;
  const hasRefined = Boolean(prompt.refined);

  return (
    <div
      className={`bg-[#3B3B3B] border-2 border-[#424242] w-full rounded-[5px] p-4 py-6 cursor-pointer transition-all duration-100 relative group ${
        isLatest ? 'opacity-100 border-[#505050]' : 'opacity-70 hover:opacity-100'
      }`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={hasRefined ? "Long press to toggle between original and refined" : "Click to copy"}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-[0.9em] opacity-50">{prompt.createdAt}</div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasRefined && (
            <div className="flex items-center gap-1 text-[0.8em] opacity-70">
              <PiSwapBold />
              <span>{showRefined ? 'Refined' : 'Original'}</span>
            </div>
          )}
          <div className="text-[0.8em] opacity-70">
            {copied ? <PiCheckBold className="text-green-400" /> : <PiCopyBold />}
          </div>
        </div>
      </div>
      
      <p className="text-[1.1em] leading-relaxed">
        {displayText}
      </p>
      
      {hasRefined && (
        <div className="absolute top-2 right-2">
          <div className={`w-2 h-2 rounded-full ${
            showRefined ? 'bg-blue-400' : 'bg-yellow-400'
          }`} />
        </div>
      )}
    </div>
  );
}

export default Card;
