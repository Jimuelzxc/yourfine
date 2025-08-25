import { PiMagnifyingGlassBold, PiXBold, PiBrainBold, PiTextTBold, PiLightbulbBold } from "react-icons/pi";
import { detectSearchIntent } from "../utils/semanticSearch";

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch, 
  searchResultsCount, 
  showResultsCount = true,
  semanticMode = false,
  onToggleSemanticMode,
  semanticResultsCount = 0
}) => {
  // Detect search intent for better UX feedback
  const searchIntent = searchQuery ? detectSearchIntent(searchQuery) : null;
  
  return (
    <div className="mb-3">
      {/* Search Intent Indicator */}
      {searchIntent && searchIntent.primary !== 'general' && (
        <div className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/50 rounded-[4px] text-[0.7em] text-purple-300 mb-2 w-fit">
          <PiLightbulbBold className="h-3 w-3" />
          <span className="capitalize">{searchIntent.primary}</span>
          {searchIntent.isQuestion && <span className="ml-1">?</span>}
        </div>
      )}
      
      {/* Search Input with Toggle Button */}
      <div className="flex items-center gap-2">
        {/* Search Mode Toggle Button */}
        <button
          onClick={onToggleSemanticMode}
          className={`flex items-center gap-2 px-3 h-10 rounded-[6px] text-[0.8em] transition-all duration-200 whitespace-nowrap ${
            semanticMode 
              ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300' 
              : 'bg-[#3B3B3B] border border-[#424242] text-gray-400 hover:text-white hover:border-[#606060]'
          }`}
          title={semanticMode ? 'Switch to keyword search' : 'Switch to semantic search'}
        >
          {semanticMode ? <PiBrainBold className="h-3 w-3" /> : <PiTextTBold className="h-3 w-3" />}
          <span className="hidden sm:inline">{semanticMode ? 'Semantic' : 'Keyword'}</span>
        </button>
        
        {/* Search Input Container */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PiMagnifyingGlassBold className={`h-4 w-4 transition-colors ${
              semanticMode ? 'text-blue-400' : 'text-gray-400'
            }`} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={semanticMode 
              ? "Search by meaning and intent (e.g., 'improve writing', 'explain concepts')..." 
              : "Search prompts by keywords..."
            }
            className={`w-full pl-10 pr-10 py-2 bg-[#3B3B3B] border rounded-[8px] text-white placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${
              semanticMode 
                ? 'border-blue-500/50 focus:border-blue-400 focus:ring-blue-400/30'
                : 'border-[#424242] focus:border-[#606060] focus:ring-[#606060]/30'
            }`}
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <PiXBold className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Search Results Count with Mode Indicator */}
      {showResultsCount && searchQuery && (
        <div className="mt-2 flex items-center justify-between text-[0.8em]">
          <div className="text-gray-400">
            {semanticMode ? (
              <>
                <span className="text-blue-300">{semanticResultsCount}</span> semantic result{semanticResultsCount !== 1 ? 's' : ''}
                {searchResultsCount > semanticResultsCount && (
                  <span className="ml-2 text-gray-500">
                    (+{searchResultsCount - semanticResultsCount} keyword match{(searchResultsCount - semanticResultsCount) !== 1 ? 'es' : ''})
                  </span>
                )}
              </>
            ) : (
              <>
                {searchResultsCount} result{searchResultsCount !== 1 ? 's' : ''} found
                {searchResultsCount > 0 && ` for "${searchQuery}"`}
              </>
            )}
          </div>
          
          {/* Search Quality Indicator for Semantic Mode */}
          {semanticMode && searchQuery && semanticResultsCount > 0 && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                semanticResultsCount >= 5 ? 'bg-green-400' :
                semanticResultsCount >= 2 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-[0.7em] text-gray-500">
                {semanticResultsCount >= 5 ? 'Rich' : semanticResultsCount >= 2 ? 'Good' : 'Limited'} results
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;