import React, { createContext, useContext, useState, useCallback } from 'react';
import type { TeacherWithDetails } from '../types/teacher';

interface CompareContextType {
  compareList: TeacherWithDetails[];
  addToCompare: (teacher: TeacherWithDetails) => boolean;
  removeFromCompare: (teacherId: string) => void;
  clearCompare: () => void;
  isInCompare: (teacherId: string) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  compareList: [],
  addToCompare: () => false,
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
});

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<TeacherWithDetails[]>([]);

  const addToCompare = useCallback((teacher: TeacherWithDetails) => {
    let added = false;
    setCompareList((prev) => {
      if (prev.length >= 3) return prev;
      if (prev.some((t) => t.profile_id === teacher.profile_id)) return prev;
      added = true;
      return [...prev, teacher];
    });
    return added;
  }, []);

  const removeFromCompare = useCallback((teacherId: string) => {
    setCompareList((prev) => prev.filter((t) => t.profile_id !== teacherId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback(
    (teacherId: string) => compareList.some((t) => t.profile_id === teacherId),
    [compareList],
  );

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
