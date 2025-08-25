import { PiGearBold } from "react-icons/pi";

const Header = ({ onSettingsClick }) => {
  return (
    <div className="">
      <div className="wrapper flex justify-between items-center py-[30px] px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[550px] mx-2 md:mx-4 lg:mx-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-[1.2em] sm:text-[1.5em] z-20 flex items-center">yourfine</h1>
        </div>
        
        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="group relative hover:bg-white/10 p-2 sm:p-3 rounded-[8px] transition-all duration-200 flex items-center justify-center w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] flex-shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
          title="Settings"
        >
          <PiGearBold className="text-[1.1em] sm:text-[1.3em] transition-all duration-200 group-hover:rotate-45 group-hover:scale-110 text-gray-300 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default Header;