
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import type { FabricBlockData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const FabricGridEditor: React.FC = () => {
  const { levelData, setLevelData, lastInteractedFabricCol, activeEditorArea } = useLevelData();
  const { cols, maxFabricHeight } = levelData.fabricArea;
  const [copiedFabricColumnData, setCopiedFabricColumnData] = useState<FabricBlockData[] | null>(null);
  const { toast } = useToast();

  const handleColsChange = (newCols: number) => {
    setLevelData(draft => {
      const currentCols = draft.fabricArea.cols;
      if (newCols > currentCols) {
        for (let i = currentCols; i < newCols; i++) {
          draft.fabricArea.columns.push([]); 
        }
      } else if (newCols < currentCols) {
        draft.fabricArea.columns = draft.fabricArea.columns.slice(0, newCols);
      }
      draft.fabricArea.cols = newCols;
    });
  };

  const handleMaxHeightChange = (newMaxHeight: number) => {
    setLevelData(draft => {
      draft.fabricArea.columns.forEach((column, cIdx) => {
        if (column.length > newMaxHeight) {
          // Keep only the bottom `newMaxHeight` blocks.
          // Since blocks are stored bottom-up, if column length is 5 and newMaxHeight is 3,
          // we want to keep indices 0, 1, 2 of the existing sparse array.
          draft.fabricArea.columns[cIdx] = column.slice(0, newMaxHeight);
        }
      });
      draft.fabricArea.maxFabricHeight = newMaxHeight;
    });
  };

  const handleCopyColumn = useCallback(() => {
    if (activeEditorArea !== 'fabric') return;

    const colIdxToCopy = lastInteractedFabricCol;
    if (colIdxToCopy === null || colIdxToCopy < 0 || colIdxToCopy >= levelData.fabricArea.cols) {
      toast({ title: "Copy Error", description: "No valid fabric column selected to copy. Click on a column in the preview first.", variant: "destructive" });
      return;
    }
    setCopiedFabricColumnData(JSON.parse(JSON.stringify(levelData.fabricArea.columns[colIdxToCopy])));
    toast({ title: "Fabric Column Copied", description: `Column ${colIdxToCopy + 1} data copied to clipboard.` });
  }, [activeEditorArea, lastInteractedFabricCol, levelData.fabricArea.cols, levelData.fabricArea.columns, toast]);

  const handlePasteColumn = useCallback(() => {
    if (activeEditorArea !== 'fabric') return;

    const colIdxToPasteTo = lastInteractedFabricCol;
    if (colIdxToPasteTo === null || colIdxToPasteTo < 0 || colIdxToPasteTo >= levelData.fabricArea.cols) {
      toast({ title: "Paste Error", description: "No valid fabric column selected to paste into. Click on a column in the preview first.", variant: "destructive" });
      return;
    }
    if (!copiedFabricColumnData) {
      toast({ title: "Paste Error", description: "Nothing to paste. Copy a fabric column first (Ctrl+C).", variant: "destructive" });
      return;
    }

    setLevelData(draft => {
      // Ensure the pasted column respects the current maxFabricHeight
      draft.fabricArea.columns[colIdxToPasteTo] = JSON.parse(JSON.stringify(copiedFabricColumnData)).slice(0, draft.fabricArea.maxFabricHeight);
    });
    toast({ title: "Fabric Column Pasted", description: `Pasted data into column ${colIdxToPasteTo + 1}.` });
  }, [activeEditorArea, lastInteractedFabricCol, copiedFabricColumnData, setLevelData, levelData.fabricArea.cols, toast]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeEditorArea !== 'fabric') {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'c') {
          // Prevent browser's default copy only if we are handling it.
          // Check if focus is NOT in an input/textarea to avoid overriding text copy.
          if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
            event.preventDefault();
            handleCopyColumn();
          }
        } else if (event.key.toLowerCase() === 'v') {
          if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
            event.preventDefault();
            handlePasteColumn();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEditorArea, handleCopyColumn, handlePasteColumn]);


  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">Fabric Dimensions</h3>
      <div className="flex gap-4 mb-4 items-end">
        <NumberSpinner id="fabric-cols" label="Columns" value={cols} onChange={handleColsChange} min={1} max={20} />
        <NumberSpinner id="fabric-max-height" label="Max Height" value={maxFabricHeight} onChange={handleMaxHeightChange} min={1} max={200} />
      </div>
      <p className="text-sm text-muted-foreground">
        Adjust dimensions here. Edit blocks directly in the "Fabric Area Preview".
        Use Ctrl+C to copy the last clicked column, Ctrl+V to paste into the last clicked column.
      </p>
    </div>
  );
};
