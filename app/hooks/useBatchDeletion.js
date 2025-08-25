import { useState } from 'react';

export const useBatchDeletion = () => {
  const [deletionQueue, setDeletionQueue] = useState(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  // Handle queuing prompts for batch deletion
  const handleQueueForDeletion = (promptId) => {
    setDeletionQueue(prev => {
      const newQueue = new Set(prev);
      if (newQueue.has(promptId)) {
        newQueue.delete(promptId);
      } else {
        newQueue.add(promptId);
      }
      return newQueue;
    });
  };

  // Handle batch deletion confirmation dialog
  const handleBatchDelete = () => {
    if (deletionQueue.size > 0) {
      setShowBatchConfirm(true);
    }
  };

  // Execute batch deletion
  const executeBatchDeletion = (deleteFunction) => {
    if (typeof deleteFunction === 'function') {
      deletionQueue.forEach(promptId => {
        deleteFunction(promptId);
      });
    }
    
    // Clear queue and close confirmation
    setDeletionQueue(new Set());
    setShowBatchConfirm(false);
  };

  // Cancel batch deletion
  const cancelBatchDeletion = () => {
    setShowBatchConfirm(false);
  };

  // Clear deletion queue
  const clearDeletionQueue = () => {
    setDeletionQueue(new Set());
  };

  // Check if a prompt is queued for deletion
  const isPromptQueued = (promptId) => {
    return deletionQueue.has(promptId);
  };

  return {
    // State
    deletionQueue,
    showBatchConfirm,
    
    // Actions
    handleQueueForDeletion,
    handleBatchDelete,
    executeBatchDeletion,
    cancelBatchDeletion,
    clearDeletionQueue,
    
    // Computed values
    queueSize: deletionQueue.size,
    hasQueuedItems: deletionQueue.size > 0,
    isPromptQueued
  };
};