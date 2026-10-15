import { useState, useEffect } from 'react';
import { RoutineItem, Exercise } from '../types/exercise';
import { allExercises } from '../data/exercises';

const ROUTINE_KEY = 'physiobank_active_routine_v1';
const BOOKMARKS_KEY = 'physiobank_bookmarks_v1';
const CUSTOM_EXERCISES_KEY = 'physiobank_custom_exercises_v1';

export function useRoutineStore() {
  const [routine, setRoutine] = useState<RoutineItem[]>(() => {
    try {
      const saved = localStorage.getItem(ROUTINE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
    } catch (e) {
      console.error(e);
    }
  }, [routine]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
    } catch (e) {
      console.error(e);
    }
  }, [customExercises]);

  const addToRoutine = (exerciseId: string, defaultSets = '3 組', defaultReps = '12 次') => {
    setRoutine(prev => {
      if (prev.some(item => item.exerciseId === exerciseId)) {
        return prev;
      }
      return [...prev, {
        exerciseId,
        customSets: defaultSets,
        customReps: defaultReps,
        customHold: '3 秒',
        therapistNotes: '注意控制節奏與維持關節力線'
      }];
    });
  };

  const removeFromRoutine = (exerciseId: string) => {
    setRoutine(prev => prev.filter(item => item.exerciseId !== exerciseId));
  };

  const updateRoutineItem = (exerciseId: string, updates: Partial<RoutineItem>) => {
    setRoutine(prev => prev.map(item => {
      if (item.exerciseId === exerciseId) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const clearRoutine = () => {
    setRoutine([]);
  };

  const toggleBookmark = (exerciseId: string) => {
    setBookmarks(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };
  const reorderRoutine = (startIndex: number, endIndex: number) => {
    setRoutine(prev => {
      if (startIndex < 0 || startIndex >= prev.length || endIndex < 0 || endIndex >= prev.length) {
        return prev;
      }
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const moveRoutineItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    reorderRoutine(index, targetIndex);
  };

  const addCustomExercise = (ex: Exercise) => {
    setCustomExercises(prev => [ex, ...prev]);
  };

  const deleteCustomExercise = (id: string) => {
    setCustomExercises(prev => prev.filter(e => e.id !== id));
  };

  return {
    routine,
    bookmarks,
    customExercises,
    addToRoutine,
    removeFromRoutine,
    updateRoutineItem,
    clearRoutine,
    reorderRoutine,
    moveRoutineItem,
    toggleBookmark,
    addCustomExercise,
    deleteCustomExercise
  };
}

