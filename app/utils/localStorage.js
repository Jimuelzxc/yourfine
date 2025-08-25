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
    }),
    analysis: null // AI analysis data will be stored here
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
    
    // Only create default session if no sessions exist at all
    if (Object.keys(sessions).length === 0) {
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
    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    const sessions = loadSessions();
    
    // If the stored active session doesn't exist, pick the first available session
    if (activeId && sessions[activeId]) {
      return activeId;
    }
    
    // Return first available session or 'default'
    const sessionIds = Object.keys(sessions);
    return sessionIds.length > 0 ? sessionIds[0] : 'default';
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
  const sessions = loadSessions();
  const sessionIds = Object.keys(sessions);
  
  // Don't allow deletion if it's the only session
  if (sessionIds.length <= 1) {
    console.warn('Cannot delete the only remaining session');
    return false;
  }
  
  delete sessions[sessionId];
  saveSessions(sessions);
  
  // If we deleted the active session, switch to another one
  if (getActiveSessionId() === sessionId) {
    // Find the first remaining session
    const remainingSessionIds = Object.keys(sessions);
    const newActiveId = remainingSessionIds[0] || 'default';
    setActiveSessionId(newActiveId);
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

// Save/bookmark prompt in specific session
export const savePromptToSession = (sessionId, promptId) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    console.error(`Session ${sessionId} not found`);
    return null;
  }
  
  // Find the prompt and toggle its saved status
  const promptIndex = sessions[sessionId].prompts.findIndex(prompt => prompt.id === promptId);
  if (promptIndex === -1) {
    console.error(`Prompt ${promptId} not found in session ${sessionId}`);
    return null;
  }
  
  // Toggle saved status
  sessions[sessionId].prompts[promptIndex].saved = !sessions[sessionId].prompts[promptIndex].saved;
  sessions[sessionId].lastModified = new Date().toISOString();
  
  saveSessions(sessions);
  return sessions[sessionId].prompts;
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

// === SESSION EXPORT/IMPORT FUNCTIONS ===

// === PROMPT ANALYSIS FUNCTIONS ===

/**
 * Update prompt analysis data in a specific session
 * @param {string} sessionId - Session ID
 * @param {string} promptId - Prompt ID
 * @param {Object} analysisData - Analysis data from AI
 * @returns {Array|null} Updated prompts array or null if error
 */
export const updatePromptAnalysis = (sessionId, promptId, analysisData) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    console.error(`Session ${sessionId} not found`);
    return null;
  }
  
  const promptIndex = sessions[sessionId].prompts.findIndex(prompt => prompt.id === promptId);
  if (promptIndex === -1) {
    console.error(`Prompt ${promptId} not found in session ${sessionId}`);
    return null;
  }
  
  // Update the analysis data
  sessions[sessionId].prompts[promptIndex].analysis = {
    ...analysisData,
    analyzedAt: new Date().toISOString()
  };
  
  sessions[sessionId].lastModified = new Date().toISOString();
  saveSessions(sessions);
  
  return sessions[sessionId].prompts;
};

/**
 * Get prompts that need analysis (have no analysis data)
 * @param {string} sessionId - Session ID
 * @returns {Array} Array of prompts without analysis
 */
export const getPromptsNeedingAnalysis = (sessionId) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    return [];
  }
  
  return sessions[sessionId].prompts.filter(prompt => !prompt.analysis);
};

/**
 * Get prompts with analysis results
 * @param {string} sessionId - Session ID 
 * @returns {Array} Array of prompts with analysis data
 */
export const getAnalyzedPrompts = (sessionId) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    return [];
  }
  
  return sessions[sessionId].prompts.filter(prompt => prompt.analysis);
};

/**
 * Get analysis summary for a session
 * @param {string} sessionId - Session ID
 * @returns {Object} Analysis summary statistics
 */
export const getAnalysisSummary = (sessionId) => {
  const sessions = loadSessions();
  
  if (!sessions[sessionId]) {
    return {
      totalPrompts: 0,
      analyzedPrompts: 0,
      pendingAnalysis: 0,
      averageQuality: 0,
      averageApplicability: 0,
      usefulPrompts: 0,
      riskyPrompts: 0
    };
  }
  
  const prompts = sessions[sessionId].prompts;
  const analyzedPrompts = prompts.filter(p => p.analysis);
  
  const totalPrompts = prompts.length;
  const analyzedCount = analyzedPrompts.length;
  const pendingAnalysis = totalPrompts - analyzedCount;
  
  if (analyzedCount === 0) {
    return {
      totalPrompts,
      analyzedPrompts: analyzedCount,
      pendingAnalysis,
      averageQuality: 0,
      averageApplicability: 0,
      usefulPrompts: 0,
      riskyPrompts: 0
    };
  }
  
  const averageQuality = analyzedPrompts.reduce((sum, p) => sum + (p.analysis.qualityScore || 0), 0) / analyzedCount;
  const averageApplicability = analyzedPrompts.reduce((sum, p) => sum + (p.analysis.futureApplicability || 0), 0) / analyzedCount;
  const usefulPrompts = analyzedPrompts.filter(p => 
    (p.analysis.qualityScore || 0) >= 0.7 && 
    (p.analysis.futureApplicability || 0) >= 0.7
  ).length;
  const riskyPrompts = analyzedPrompts.filter(p => 
    (p.analysis.futureApplicability || 0) < 0.4 ||
    (p.analysis.riskFactors && p.analysis.riskFactors.length > 0)
  ).length;
  
  return {
    totalPrompts,
    analyzedPrompts: analyzedCount,
    pendingAnalysis,
    averageQuality: Math.round(averageQuality * 100) / 100,
    averageApplicability: Math.round(averageApplicability * 100) / 100,
    usefulPrompts,
    riskyPrompts
  };
};

// === SESSION EXPORT/IMPORT FUNCTIONS ===

// Export a session to JSON file
export const exportSession = (sessionId) => {
  try {
    const sessions = loadSessions();
    const session = sessions[sessionId];
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Create export data with metadata
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      session: {
        name: session.name,
        prompts: session.prompts,
        createdAt: session.createdAt,
        lastModified: session.lastModified
      }
    };
    
    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_session.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting session:', error);
    return false;
  }
};

// Import a session from JSON file
export const importSession = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data structure
        if (!importData.session || !importData.session.name || !Array.isArray(importData.session.prompts)) {
          throw new Error('Invalid session file format');
        }
        
        const sessions = loadSessions();
        
        // Generate new session ID to avoid conflicts
        const newSessionId = generateSessionId();
        
        // Create imported session
        const importedSession = {
          id: newSessionId,
          name: `${importData.session.name} (Imported)`,
          prompts: importData.session.prompts || [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        
        // Add to sessions
        sessions[newSessionId] = importedSession;
        saveSessions(sessions);
        
        resolve({
          sessionId: newSessionId,
          session: importedSession
        });
      } catch (error) {
        reject(new Error(`Failed to import session: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};