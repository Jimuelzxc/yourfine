import { useState, useEffect } from 'react';
import { 
  loadSessions, getActiveSessionId, setActiveSessionId, createSession, 
  renameSession, deleteSession, getSessionList, exportSession, 
  importSession, migratePromptsToSessions 
} from '../utils/localStorage';

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState('default');

  // Initialize sessions and migrate old data if needed
  useEffect(() => {
    // Run migration first
    migratePromptsToSessions();
    
    // Load sessions and set active session
    const sessionList = getSessionList();
    setSessions(sessionList);
    
    const currentActiveId = getActiveSessionId();
    setActiveSessionIdState(currentActiveId);
  }, []);

  // Handle session change
  const handleSessionChange = (sessionId) => {
    setActiveSessionIdState(sessionId);
    setActiveSessionId(sessionId);
  };

  // Handle creating a new session
  const handleCreateSession = () => {
    const newSession = createSession();
    const updatedSessionList = getSessionList();
    setSessions(updatedSessionList);
    
    // Switch to the new session
    handleSessionChange(newSession.id);
    return newSession;
  };

  // Handle renaming a session
  const handleRenameSession = (sessionId, newName) => {
    renameSession(sessionId, newName);
    const updatedSessionList = getSessionList();
    setSessions(updatedSessionList);
  };

  // Handle deleting a session
  const handleDeleteSession = (sessionId) => {
    // Check if this is the last session
    if (sessions.length <= 1) {
      // Create a new session before deleting the last one
      const newSession = createSession();
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // Switch to the new session
      handleSessionChange(newSession.id);
    }
    
    if (deleteSession(sessionId)) {
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // If we deleted the active session, switch to the new active one
      const newActiveId = getActiveSessionId();
      setActiveSessionIdState(newActiveId);
    }
  };

  // Handle exporting a session
  const handleExportSession = (sessionId) => {
    const success = exportSession(sessionId);
    if (success) {
      console.log('Session exported successfully');
      return { success: true };
    } else {
      const errorMessage = 'Failed to export session. Please try again.';
      alert(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle importing a session
  const handleImportSession = async (file) => {
    try {
      const result = await importSession(file);
      
      // Update sessions list
      const updatedSessionList = getSessionList();
      setSessions(updatedSessionList);
      
      // Switch to the imported session
      handleSessionChange(result.sessionId);
      
      const successMessage = `Session "${result.session.name}" imported successfully with ${result.session.prompts.length} prompts!`;
      alert(successMessage);
      return { success: true, result, message: successMessage };
    } catch (error) {
      const errorMessage = `Import failed: ${error.message}`;
      alert(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update sessions list (useful after prompt operations)
  const updateSessionsList = () => {
    const updatedSessionList = getSessionList();
    setSessions(updatedSessionList);
  };

  return {
    // State
    sessions,
    activeSessionId,
    
    // Actions
    handleSessionChange,
    handleCreateSession,
    handleRenameSession,
    handleDeleteSession,
    handleExportSession,
    handleImportSession,
    updateSessionsList
  };
};