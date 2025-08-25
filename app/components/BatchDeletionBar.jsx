const BatchDeletionBar = ({ 
  queueSize, 
  onClearQueue, 
  onBatchDelete 
}) => {
  if (queueSize === 0) return null;

  return (
    <div className="mb-3 p-3 bg-red-500/10 border border-red-400/30 rounded-[8px] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-red-400 text-[0.9em] font-medium">
          {queueSize} prompt{queueSize !== 1 ? 's' : ''} queued for deletion
        </div>
        <div className="text-[0.8em] text-gray-400">
          Hold Ctrl/Cmd + swipe to add more
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClearQueue}
          className="px-3 py-1.5 text-[0.8em] text-gray-400 hover:text-white bg-transparent hover:bg-white/10 rounded transition-colors"
        >
          Clear
        </button>
        <button
          onClick={onBatchDelete}
          className="px-3 py-1.5 text-[0.8em] text-white bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
        >
          Delete All
        </button>
      </div>
    </div>
  );
};

export default BatchDeletionBar;