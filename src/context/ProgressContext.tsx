import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Task, 
  ProgressUpdate, 
  DelayRecord, 
  SitePhoto, 
  ProductivityMetric
} from '../types.ts';
import {
  MOCK_SOTS,
  MOCK_PROGRESS_UPDATES,
  MOCK_DELAY_RECORDS,
  MOCK_SITE_PHOTOS,
  MOCK_PRODUCTIVITY
} from '../mockData.ts';

interface ProgressContextType {
  tasks: Task[];
  progressUpdates: ProgressUpdate[];
  delays: DelayRecord[];
  photos: SitePhoto[];
  productivityMetrics: ProductivityMetric[];
  updateTaskProgress: (taskId: string, actualQty: number) => void;
  addProgressUpdate: (update: ProgressUpdate) => void;
  addDelay: (delay: DelayRecord) => void;
  addPhoto: (photo: SitePhoto) => void;
  approveOrRejectUpdate: (updateId: string, status: 'Approved' | 'Rejected') => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_SOTS.flatMap(sot => sot.tasks));
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>(MOCK_PROGRESS_UPDATES);
  const [delays, setDelays] = useState<DelayRecord[]>(MOCK_DELAY_RECORDS);
  const [photos, setPhotos] = useState<SitePhoto[]>(MOCK_SITE_PHOTOS);
  const [productivityMetrics] = useState<ProductivityMetric[]>(MOCK_PRODUCTIVITY);

  const updateTaskProgress = (taskId: string, actualQty: number) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const plannedQty = task.plannedQty || 100;
        const progressPercentage = Math.min(100, Math.round((actualQty / plannedQty) * 100));
        const totalRemainingQty = Math.max(0, plannedQty - actualQty);
        const status = progressPercentage === 100 ? 'Completed' : progressPercentage > 0 ? 'In Progress' : 'Pending';
        
        return { 
          ...task, 
          actualQty, 
          progressPercentage, 
          totalRemainingQty,
          status 
        } as Task;
      }
      return task;
    }));
  };

  const addProgressUpdate = (update: ProgressUpdate) => {
    const updateWithId = {
      ...update,
      id: update.id || `up-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      unit: update.unit || 'm3',
      recordedBy: update.recordedBy || update.reportedBy || 'Site System'
    };
    setProgressUpdates(prev => [updateWithId, ...prev]);
    if (update.status === 'Approved') {
      updateTaskProgress(update.taskId, update.actualQty);
    }
  };

  const addDelay = (delay: DelayRecord) => {
    setDelays(prev => [delay, ...prev]);
  };

  const addPhoto = (photo: SitePhoto) => {
    setPhotos(prev => [photo, ...prev]);
  };

  const approveOrRejectUpdate = (updateId: string, status: 'Approved' | 'Rejected') => {
    const update = progressUpdates.find(u => u.id === updateId);
    if (update) {
      setProgressUpdates(prev => prev.map(u => 
        u.id === updateId ? { ...u, status } : u
      ));
      if (status === 'Approved') {
        updateTaskProgress(update.taskId, update.actualQty);
      }
    }
  };

  return (
    <ProgressContext.Provider value={{
      tasks,
      progressUpdates,
      delays,
      photos,
      productivityMetrics,
      updateTaskProgress,
      addProgressUpdate,
      addDelay,
      addPhoto,
      approveOrRejectUpdate
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
