import { PiBookmarkSimpleBold } from "react-icons/pi";

const FilterControls = ({ 
  showSavedOnly, 
  onToggleSavedFilter, 
  savedCount, 
  totalCount 
}) => {
  const displayCount = showSavedOnly ? savedCount : totalCount;
  
  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <button
          onClick={onToggleSavedFilter}
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
        {displayCount} prompt{displayCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default FilterControls;