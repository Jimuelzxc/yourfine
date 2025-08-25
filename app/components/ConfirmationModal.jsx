const ConfirmationModal = ({ 
  isOpen,
  title,
  message,
  details,
  confirmText,
  confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white font-medium",
  cancelText = "Cancel",
  onConfirm,
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-4">{message}</p>
        {details && (
          <div className="text-[0.8em] text-gray-400 mb-6">
            {details}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#404040] hover:bg-[#4a4a4a] text-white rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;