import { PiMagnifyingGlassBold, PiXBold } from "react-icons/pi";

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch, 
  searchResultsCount, 
  showResultsCount = true 
}) => {
  return (
    <div className="mb-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <PiMagnifyingGlassBold className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prompts..."
          className="w-full pl-10 pr-10 py-2 bg-[#3B3B3B] border border-[#424242] rounded-[8px] text-white placeholder-gray-400 focus:outline-none focus:border-[#606060] focus:ring-1 focus:ring-[#606060] transition-colors"
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
      
      {/* Search Results Count */}
      {showResultsCount && searchQuery && (
        <div className="mt-2 text-[0.8em] text-gray-400">
          {searchResultsCount} result{searchResultsCount !== 1 ? 's' : ''} found
          {searchResultsCount > 0 && ` for "${searchQuery}"`}
        </div>
      )}
    </div>
  );
};

export default SearchBar;