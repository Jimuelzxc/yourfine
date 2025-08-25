const StatusIndicator = ({ isRefining }) => {
  if (!isRefining) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-[#3B3B3B] border border-[#424242] rounded-[5px] px-3 sm:px-4 py-2 flex items-center gap-2 max-w-xs sm:max-w-none mx-auto sm:mx-0">
      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full flex-shrink-0"></div>
      <span className="text-[0.8em] sm:text-[0.9em] truncate">Refining prompt...</span>
    </div>
  );
};

export default StatusIndicator;