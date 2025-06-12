
"use client";
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Draft } from 'immer';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import type { LevelData, ValidationMessage } from '@/lib/types';
import { createDefaultLevelData } from '@/lib/constants';
import { validateLevelData } from '@/lib/validation';

type ActiveEditorArea = 'bobbin' | 'fabric' | null;

type LevelDataContextType = {
  levelData: LevelData;
  setLevelData: (updater: (draft: Draft<LevelData>) => void | LevelData) => void;
  resetLevelData: (newData: LevelData) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  validationMessages: ValidationMessage[];
  setValidationMessages: Dispatch<SetStateAction<ValidationMessage[]>>;
  loadLevelData: (data: LevelData) => void;
  lastInteractedFabricCol: number | null;
  setLastInteractedFabricCol: Dispatch<SetStateAction<number | null>>;
  activeEditorArea: ActiveEditorArea;
  setActiveEditorArea: Dispatch<SetStateAction<ActiveEditorArea>>;
};

const LevelDataContext = createContext<LevelDataContextType | undefined>(undefined);

export const LevelDataProvider = ({ children }: { children: ReactNode }) => {
  const {
    state: levelData,
    setState: setImmerLevelData,
    resetState: resetImmerLevelData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<LevelData>({ initialState: createDefaultLevelData() });

  const [validationMessages, setValidationMessages] = React.useState<ValidationMessage[]>([]);
  const [lastInteractedFabricCol, setLastInteractedFabricCol] = useState<number | null>(null);
  const [activeEditorArea, setActiveEditorArea] = useState<ActiveEditorArea>(null);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          // Allow undo if not focused in an input/textarea that handles its own undo
          if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
            event.preventDefault();
            if (canUndo) undo();
          }
        } else if ((event.key === 'Z' && event.shiftKey) || (event.key === 'y' && !event.shiftKey)) {
           // Allow redo if not focused in an input/textarea
           if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
            event.preventDefault();
            if (canRedo) redo();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);
  
  useEffect(() => {
    setValidationMessages(validateLevelData(levelData));
  }, [levelData]);

  const loadLevelData = (data: LevelData) => {
    resetImmerLevelData(data);
    setLastInteractedFabricCol(null); // Reset interaction state on new level load
    setActiveEditorArea(null);
  };

  return (
    <LevelDataContext.Provider
      value={{
        levelData,
        setLevelData: setImmerLevelData,
        resetLevelData: resetImmerLevelData,
        undo,
        redo,
        canUndo,
        canRedo,
        validationMessages,
        setValidationMessages,
        loadLevelData,
        lastInteractedFabricCol,
        setLastInteractedFabricCol,
        activeEditorArea,
        setActiveEditorArea,
      }}
    >
      {children}
    </LevelDataContext.Provider>
  );
};

export const useLevelData = () => {
  const context = useContext(LevelDataContext);
  if (!context) {
    throw new Error('useLevelData must be used within a LevelDataProvider');
  }
  return context;
};
