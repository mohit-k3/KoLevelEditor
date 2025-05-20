import { useState, useCallback } from 'react';
import { produce, type Draft } from 'immer';

interface UndoRedoOptions<T> {
  initialState: T;
  maxHistory?: number;
}

interface UndoRedoState<T> {
  current: T;
  history: T[];
  future: T[];
}

export function useUndoRedo<T>(options: UndoRedoOptions<T>) {
  const { initialState, maxHistory = 50 } = options;

  const [state, setState] = useState<UndoRedoState<T>>({
    current: initialState,
    history: [],
    future: [],
  });

  const updateState = useCallback((updater: (draft: Draft<T>) => void | T) => {
    setState(prevState => {
      const nextCurrent = produce(prevState.current, updater);
      if (Object.is(prevState.current, nextCurrent)) {
        return prevState; // No change, don't update history
      }
      const newHistory = [...prevState.history, prevState.current].slice(-maxHistory);
      return {
        current: nextCurrent,
        history: newHistory,
        future: [], // Clear future on new state change
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.history.length === 0) return prevState;
      const previous = prevState.history[prevState.history.length - 1];
      const newHistory = prevState.history.slice(0, prevState.history.length - 1);
      return {
        current: previous,
        history: newHistory,
        future: [prevState.current, ...prevState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.future.length === 0) return prevState;
      const next = prevState.future[0];
      const newFuture = prevState.future.slice(1);
      return {
        current: next,
        history: [...prevState.history, prevState.current],
        future: newFuture,
      };
    });
  }, []);
  
  const resetState = useCallback((newState: T) => {
    setState({
      current: newState,
      history: [],
      future: [],
    });
  }, []);

  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.current,
    setState: updateState,
    resetState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyCount: state.history.length,
    futureCount: state.future.length,
  };
}
