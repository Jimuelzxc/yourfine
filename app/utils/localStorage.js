// LocalStorage utilities for prompt management

const PROMPTS_KEY = 'yourfine_prompts';
const API_KEY = 'yourfine_api_key';
const SELECTED_MODEL_KEY = 'yourfine_selected_model';
const SESSIONS_KEY = 'yourfine_sessions';
const ACTIVE_SESSION_KEY = 'yourfine_active_session';
const MIGRATION_KEY = 'yourfine_migrated_to_sessions';

export const savePrompts = (prompts) => {
  try {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('Error saving prompts to localStorage:', error);
  }
};

export const loadPrompts = () => {
  try {
    const stored = localStorage.getItem(PROMPTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading prompts from localStorage:', error);
    return [];
  }
};

export const saveApiKey = (apiKey) => {
  try {
    localStorage.setItem(API_KEY, apiKey);
  } catch (error) {
    console.error('Error saving API key to localStorage:', error);
  }
};

export const loadApiKey = () => {
  try {
    return localStorage.getItem(API_KEY) || '';
  } catch (error) {
    console.error('Error loading API key from localStorage:', error);
    return '';
  }
};

export const saveSelectedModel = (model) => {
  try {
    localStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(model));
  } catch (error) {
    console.error('Error saving selected model to localStorage:', error);
  }
};

export const loadSelectedModel = () => {
  try {
    const stored = localStorage.getItem(SELECTED_MODEL_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading selected model from localStorage:', error);
    return null;
  }
};

export const addPrompt = (originalPrompt, refinedPrompt = null) => {
  const prompts = loadPrompts();
  const newPrompt = {
    id: Date.now().toString(),
    original: originalPrompt,
    refined: refinedPrompt,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
  
  const updatedPrompts = [newPrompt, ...prompts];
  savePrompts(updatedPrompts);
  return updatedPrompts;
};

export const updatePromptRefinement = (promptId, refinedPrompt) => {
  const prompts = loadPrompts();
  const updatedPrompts = prompts.map(prompt => 
    prompt.id === promptId 
      ? { ...prompt, refined: refinedPrompt }
      : prompt
  );
  savePrompts(updatedPrompts);
  return updatedPrompts;
};

// === SESSION MANAGEMENT FUNCTIONS ===

// Generate unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new session
export const createSession = (name = 'New Session') => {
  const sessions = loadSessions();
  const newSession = {
    id: generateSessionId(),
    name,
    prompts: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  sessions[newSession.id] = newSession;
  saveSessions(sessions);
  return newSession;
};

// Load all sessions
export const loadSessions = () => {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    const sessions = stored ? JSON.parse(stored) : {};
    
    // Ensure default session exists
    if (!sessions.default) {
      sessions.default = {
        id: 'default',
        name: 'Default Session',
        prompts: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
    }
    
    return sessions;
  } catch (error) {
    console.error('Error loading sessions from localStorage:', error);
    return {
      default: {
        id: 'default',
        name: 'Default Session',
        prompts: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }
};

// Save all sessions
export const saveSessions = (sessions) => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error);
  }
};

// Get active session ID
export const getActiveSessionId = () => {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || 'default';
  } catch (error) {
    console.error('Error loading active session ID:', error);
    return 'default';
  }
};

// Set active session ID
export const setActiveSessionId = (sessionId) => {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  } catch (error) {
    console.error('Error saving active session ID:', error);
  }
};

// Get active session
export const getActiveSession = () => {
  const sessions = loadSessions();
  const activeSessionId = getActiveSessionId();
  return sessions[activeSessionId] || sessions.default;
};

// Delete a session
export const deleteSession = (sessionId) => {
  if (sessionId === 'default') {
    console.warn('Cannot delete default session');
    return false;
  }
  
  const sessions = loadSessions();
  delete sessions[sessionId];
  saveSessions(sessions);
  
  // If we deleted the active session, switch to default
  if (getActiveSessionId() === sessionId) {
    setActiveSessionId('default');
  }
  
  return true;
};

// Rename a session
export const renameSession = (sessionId, newName) => {
  const sessions = loadSessions();
  if (sessions[sessionId]) {
    sessions[sessionId].name = newName;
    sessions[sessionId].lastModified = new Date().toISOString();
    saveSessions(sessions);
    return true;
  }
  return false;
};

// Add prompt to specific session
export const addPromptToSession = (sessionId, originalPrompt, refinedPrompt = null) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    console.error(`Session ${sessionId} not found`);
    return null;
  }
  
  const newPrompt = {
    id: Date.now().toString(),
    original: originalPrompt,
    refined: refinedPrompt,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
  
  sessions[sessionId].prompts = [newPrompt, ...sessions[sessionId].prompts];
  sessions[sessionId].lastModified = new Date().toISOString();
  saveSessions(sessions);
  
  return sessions[sessionId].prompts;
};

// Get prompts for a specific session
export const getSessionPrompts = (sessionId) => {
  const sessions = loadSessions();
  return sessions[sessionId]?.prompts || [];
};

// Update prompt refinement in specific session
export const updateSessionPromptRefinement = (sessionId, promptId, refinedPrompt) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    console.error(`Session ${sessionId} not found`);
    return null;
  }
  
  sessions[sessionId].prompts = sessions[sessionId].prompts.map(prompt => 
    prompt.id === promptId 
      ? { ...prompt, refined: refinedPrompt }
      : prompt
  );
  
  sessions[sessionId].lastModified = new Date().toISOString();
  saveSessions(sessions);
  
  return sessions[sessionId].prompts;
};

// Migration function to convert old prompts to sessions
export const migratePromptsToSessions = () => {
  try {
    // Check if migration has already been done
    const migrated = localStorage.getItem(MIGRATION_KEY);
    if (migrated) {
      return;
    }
    
    // Load existing prompts
    const existingPrompts = loadPrompts();
    
    if (existingPrompts.length > 0) {
      const sessions = loadSessions();
      
      // Move existing prompts to default session
      sessions.default.prompts = existingPrompts;
      sessions.default.lastModified = new Date().toISOString();
      
      saveSessions(sessions);
      console.log(`Migrated ${existingPrompts.length} prompts to default session`);
    }
    
    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch (error) {
    console.error('Error during prompt migration:', error);
  }
};

// Delete prompt from specific session
export const deletePromptFromSession = (sessionId, promptId) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    console.error(`Session ${sessionId} not found`);
    return null;
  }
  
  const initialLength = sessions[sessionId].prompts.length;
  sessions[sessionId].prompts = sessions[sessionId].prompts.filter(prompt => 
    prompt.id !== promptId
  );
  
  // Check if prompt was actually deleted
  if (sessions[sessionId].prompts.length < initialLength) {
    sessions[sessionId].lastModified = new Date().toISOString();
    saveSessions(sessions);
    return sessions[sessionId].prompts;
  }
  
  return null; // Prompt not found
};

// Get all session names and IDs for UI
export const getSessionList = () => {
  const sessions = loadSessions();
  return Object.values(sessions).map(session => ({
    id: session.id,
    name: session.name,
    promptCount: session.prompts.length,
    lastModified: session.lastModified
  })).sort((a, b) => {
    // Default session first, then by last modified
    if (a.id === 'default') return -1;
    if (b.id === 'default') return 1;
    return new Date(b.lastModified) - new Date(a.lastModified);
  });
};