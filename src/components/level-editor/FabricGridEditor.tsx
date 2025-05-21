
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import type { FabricBlockData } from '@/lib/types'; // FabricBlockData is still needed for type consistency

export const FabricGridEditor: React.FC = () => {
  const { levelData, setLevelData } = useLevelData();
  const { cols, maxFabricHeight } = levelData.fabricArea;

  const handleColsChange = (newCols: number) => {
    setLevelData(draft => {
      const currentCols = draft.fabricArea.cols;
      if (newCols > currentCols) {
        for (let i = currentCols; i < newCols; i++) {
          draft.fabricArea.columns.push([]); // Add new empty columns (sparse arrays)
        }
      } else if (newCols < currentCols) {
        draft.fabricArea.columns = draft.fabricArea.columns.slice(0, newCols);
      }
      draft.fabricArea.cols = newCols;
    });
  };

  const handleMaxHeightChange = (newMaxHeight: number) => {
    setLevelData(draft => {
      draft.fabricArea.columns.forEach(column => {
        // If new max height is smaller, remove blocks that are now too high.
        // Blocks are stored bottom-up, so if column.length > newMaxHeight, slice it.
        if (column.length > newMaxHeight) {
          column.splice(newMaxHeight); // Keep only the bottom `newMaxHeight` blocks
        }
      });
      draft.fabricArea.maxFabricHeight = newMaxHeight;
    });
  };

  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">Fabric Dimensions</h3>
      <div className="flex gap-4 mb-4 items-end">
        <NumberSpinner id="fabric-cols" label="Columns" value={cols} onChange={handleColsChange} min={1} max={20} />
        <NumberSpinner id="fabric-max-height" label="Max Height" value={maxFabricHeight} onChange={handleMaxHeightChange} min={1} max={200} />
      </div>
      <p className="text-sm text-muted-foreground">
        Adjust the number of columns and the maximum height for the fabric area.
        Click on the blocks in the "Fabric Area Preview" below to add, change, or remove colors.
      </p>
    </div>
  );
};
