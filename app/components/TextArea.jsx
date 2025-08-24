import { PiStarFourFill, PiArrowUpBold, PiCaretDownBold } from "react-icons/pi";
function TextArea() {
  return (
    <div className="h-[200px] w-full bg-[#3B3B3B] border-2 border-[#3f3f3f] flex flex-col p-4 rounded-[5px]">
      <textarea
      
        name=""
        id=""
        placeholder="Write your prompt here.."
        className="flex-1 border-none stroke-none outline-none text-[1.5em]"
      ></textarea>
      <div className="flex flex-row justify-between">
        <div className="bg-[#303030] flex flex-row gap-2 items-center px-5 rounded-[5px] text-[0.9em]">
          <div>Gemini</div>
          <PiCaretDownBold />
        </div>
        <div className="flex flex-row gap-1">
          <button className="bg-[#303030] p-2.5 rounded-[5px] hover:bg-white transition-all duration-150 cursor-pointer hover:text-[#282828]">
            <PiStarFourFill className="text-[1.3em] scale-90" />
          </button>
          <button className="bg-[#303030] p-2.5 rounded-[5px] hover:bg-white transition-all duration-150 cursor-pointer hover:text-[#282828]">
            <PiArrowUpBold className="text-[1.3em] scale-105" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextArea;
