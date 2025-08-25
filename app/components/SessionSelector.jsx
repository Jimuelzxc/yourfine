import { useState, useRef, useEffect } from 'react';
import { PiCaretDownBold, PiPlusBold, PiTrashBold, PiPencilBold, PiCheckBold, PiXBold, PiDownloadBold, PiUploadBold, PiFileCsvBold, PiClockBold, PiDotBold } from 'react-icons/pi';

function SessionSelector({ 
  sessions, 
  activeSessionId, 
  onSessionChange, 
  onCreateSession, 
  onRenameSession, 
  onDeleteSession,
  onExportSession,
  onExportSessionCSV,
  onImportSession
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const dropdownRef = useRef(null);
  const editInputRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to get session activity status
  const getSessionStatus = (session) => {
    if (session.id === activeSessionId) return { status: 'active', color: 'text-blue-400', bg: 'bg-blue-400/20' };
    if (session.promptCount === 0) return { status: 'empty', color: 'text-gray-500', bg: 'bg-gray-500/10' };
    
    const lastModified = new Date(session.lastModified || session.createdAt);
    const daysSinceModified = Math.floor((new Date() - lastModified) / (1000 * 60 * 60 * 24));
    
    if (daysSinceModified <= 1) return { status: 'recent', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (daysSinceModified <= 7) return { status: 'active', color: 'text-blue-400', bg: 'bg-blue-400/20' };
    return { status: 'inactive', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
  };

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

  const handleExportSession = (sessionId, e) => {
    e.stopPropagation();
    if (onExportSession) {
      onExportSession(sessionId);
    }
  };

  const handleExportSessionCSV = (sessionId, e) => {
    e.stopPropagation();
    if (onExportSessionCSV) {
      onExportSessionCSV(sessionId);
    }
  };

  const handleImportSession = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImportSession) {
      onImportSession(file);
    }
    // Reset file input
    e.target.value = '';
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
        className="bg-[#3B3B3B] hover:bg-[#404040] border border-[#424242] hover:border-[#505050] px-3 py-2 rounded-[6px] transition-all duration-200 flex items-center gap-3 text-[0.9em] cursor-pointer min-w-[180px] group"
        title="Switch session"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate max-w-[120px] sm:max-w-[140px] font-medium">
            {activeSession?.name || 'Default Session'}
          </span>
        </div>
        
        {/* Dropdown arrow */}
        <div className="flex items-center flex-shrink-0">
          <PiCaretDownBold className={`text-[0.7em] transition-transform duration-200 group-hover:text-white ${
            showDropdown ? 'rotate-180' : ''
          }`} />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute bottom-full left-0 mb-2 bg-[#2a2a2a] border border-[#505050] rounded-[8px] min-w-[280px] max-h-[400px] overflow-hidden z-50 shadow-2xl backdrop-blur-sm">
          {/* Header section */}
          <div className="bg-[#333333] px-4 py-3 border-b border-[#404040]">
            <div className="text-[0.9em] font-medium text-white mb-1">Session Management</div>
            <div className="text-[0.7em] opacity-60 text-gray-400">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} • 
              {sessions.reduce((sum, s) => sum + s.promptCount, 0)} total prompts
            </div>
          </div>
          
          {/* Action buttons section */}
          <div className="p-2 border-b border-[#404040] space-y-1">
            {/* Create New Session */}
            <button
              onClick={handleCreateSession}
              className="w-full text-left px-3 py-2.5 hover:bg-[#404040] transition-colors rounded-[5px] flex items-center gap-3 text-[0.9em] group"
            >
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <PiPlusBold className="text-[0.9em] text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-blue-400 font-medium">Create New Session</div>
                <div className="text-[0.7em] opacity-60 text-gray-400">Start with a fresh session</div>
              </div>
            </button>

            {/* Import Session */}
            <button
              onClick={handleImportSession}
              className="w-full text-left px-3 py-2.5 hover:bg-[#404040] transition-colors rounded-[5px] flex items-center gap-3 text-[0.9em] group"
            >
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <PiUploadBold className="text-[0.9em] text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-green-400 font-medium">Import Session</div>
                <div className="text-[0.7em] opacity-60 text-gray-400">Load from JSON file</div>
              </div>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Session List */}
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#505050] scrollbar-track-[#2a2a2a]">
            {sessions.map((session, index) => {
              const sessionStatus = getSessionStatus(session);
              const relativeTime = formatRelativeTime(session.lastModified || session.createdAt);
              
              return (
                <div
                  key={session.id}
                  className={`relative group transition-all duration-200 ${
                    session.id === activeSessionId 
                      ? 'bg-[#404040] border-l-2 border-blue-400' 
                      : 'hover:bg-[#353535] border-l-2 border-transparent hover:border-[#505050]'
                  } ${index === sessions.length - 1 ? '' : 'border-b border-[#353535]'}`}
                >
                  {editingSessionId === session.id ? (
                    // Edit mode
                    <div className="flex items-center gap-2 px-4 py-3">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-[#1a1a1a] border border-[#505050] rounded-[4px] px-3 py-2 text-[0.9em] text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Session name"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-400 hover:text-green-300 text-[0.9em] p-2 hover:bg-green-400/20 rounded transition-colors"
                        title="Save changes"
                      >
                        <PiCheckBold />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-400 hover:text-red-300 text-[0.9em] p-2 hover:bg-red-400/20 rounded transition-colors"
                        title="Cancel editing"
                      >
                        <PiXBold />
                      </button>
                    </div>
                  ) : (
                    // Display mode
                    <button
                      onClick={() => handleSessionSelect(session.id)}
                      className="w-full text-left px-4 py-3 transition-colors group-hover:bg-[#404040]/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Session name */}
                          <div className="text-[0.95em] text-white truncate font-medium group-hover:text-blue-200 transition-colors">
                            {session.name}
                          </div>
                        </div>
                        
                        {/* Session Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                          <button
                            onClick={(e) => handleExportSession(session.id, e)}
                            className="text-gray-400 hover:text-green-400 text-[0.8em] p-1.5 hover:bg-green-400/20 rounded transition-all"
                            title="Export as JSON"
                          >
                            <PiDownloadBold />
                          </button>
                          <button
                            onClick={(e) => handleExportSessionCSV(session.id, e)}
                            className="text-gray-400 hover:text-blue-400 text-[0.8em] p-1.5 hover:bg-blue-400/20 rounded transition-all"
                            title="Export as CSV"
                          >
                            <PiFileCsvBold />
                          </button>
                          <button
                            onClick={(e) => handleStartEdit(session, e)}
                            className="text-gray-400 hover:text-white text-[0.8em] p-1.5 hover:bg-white/20 rounded transition-all"
                            title="Rename session"
                          >
                            <PiPencilBold />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="text-gray-400 hover:text-red-400 text-[0.8em] p-1.5 hover:bg-red-400/20 rounded transition-all"
                            title="Delete session"
                          >
                            <PiTrashBold />
                          </button>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionSelector;