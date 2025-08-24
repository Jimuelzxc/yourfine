import { useState, useRef, useEffect } from 'react';
import { PiCaretDownBold, PiPlusBold, PiTrashBold, PiPencilBold, PiCheckBold, PiXBold } from 'react-icons/pi';

function SessionSelector({ 
  sessions, 
  activeSessionId, 
  onSessionChange, 
  onCreateSession, 
  onRenameSession, 
  onDeleteSession 
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const dropdownRef = useRef(null);
  const editInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setEditingSessionId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSessionSelect = (sessionId) => {
    onSessionChange(sessionId);
    setShowDropdown(false);
  };

  const handleCreateSession = () => {
    onCreateSession();
    setShowDropdown(false);
  };

  const handleStartEdit = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingName(session.name);
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (editingName.trim() && editingName !== activeSession?.name) {
      onRenameSession(editingSessionId, editingName.trim());
    }
    setEditingSessionId(null);
    setEditingName('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingSessionId(null);
    setEditingName('');
  };

  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      onDeleteSession(sessionId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit(e);
    } else if (e.key === 'Escape') {
      handleCancelEdit(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-[#3B3B3B] hover:bg-[#404040] border border-[#424242] hover:border-[#505050] px-3 py-1.5 rounded-[5px] transition-all duration-150 flex items-center gap-2 text-[0.9em] cursor-pointer"
        title="Switch session"
      >
        <span className="truncate max-w-[120px] sm:max-w-[150px]">
          {activeSession?.name || 'Default Session'}
        </span>
        <PiCaretDownBold className={`text-[0.7em] transition-transform duration-200 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 mb-1 bg-[#2a2a2a] border border-[#505050] rounded-[5px] min-w-[200px] max-h-[300px] overflow-y-auto z-50 shadow-2xl">
          {/* Create New Session */}
          <button
            onClick={handleCreateSession}
            className="w-full text-left px-3 py-2 hover:bg-[#404040] transition-colors border-b border-[#404040] flex items-center gap-2 text-[0.9em]"
          >
            <PiPlusBold className="text-[0.8em] text-blue-400" />
            <span className="text-blue-400">Create New Session</span>
          </button>

          {/* Session List */}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`relative group border-b border-[#353535] last:border-b-0 ${
                session.id === activeSessionId ? 'bg-[#404040]' : 'hover:bg-[#353535]'
              }`}
            >
              {editingSessionId === session.id ? (
                // Edit mode
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-[#1a1a1a] border border-[#505050] rounded px-2 py-1 text-[0.8em] text-white outline-none focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-400 hover:text-green-300 text-[0.8em]"
                    title="Save"
                  >
                    <PiCheckBold />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-400 hover:text-red-300 text-[0.8em]"
                    title="Cancel"
                  >
                    <PiXBold />
                  </button>
                </div>
              ) : (
                // Display mode
                <button
                  onClick={() => handleSessionSelect(session.id)}
                  className="w-full text-left px-3 py-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.9em] text-white truncate">
                        {session.name}
                        {session.id === activeSessionId && (
                          <span className="ml-2 text-[0.7em] text-blue-400">●</span>
                        )}
                      </div>
                      <div className="text-[0.7em] opacity-60 text-gray-400">
                        {session.promptCount} prompt{session.promptCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    {/* Session Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartEdit(session, e)}
                        className="text-gray-400 hover:text-white text-[0.8em] p-1"
                        title="Rename"
                      >
                        <PiPencilBold />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="text-gray-400 hover:text-red-400 text-[0.8em] p-1"
                        title="Delete"
                      >
                        <PiTrashBold />
                      </button>
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SessionSelector;