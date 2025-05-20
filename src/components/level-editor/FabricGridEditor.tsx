
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import { FabricBlockEditor } from './FabricBlockEditor';
import type { FabricBlockData } from '@/lib/types';
import { createEmptyFabricBlock } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export const FabricGridEditor: React.FC = () => {
  const { levelData, setLevelData } = useLevelData();
  const { cols, maxFabricHeight, columns } = levelData.fabricArea;
  const { toast } = useToast();

  const handleColsChange = (newCols: number) => {
    setLevelData(draft => {
      const currentCols = draft.fabricArea.cols;
      if (newCols > currentCols) {
        for (let i = currentCols; i < newCols; i++) {
          draft.fabricArea.columns.push([createEmptyFabricBlock()]); // New columns start with one block
        }
      } else if (newCols < currentCols) {
        draft.fabricArea.columns = draft.fabricArea.columns.slice(0, newCols);
      }
      draft.fabricArea.cols = newCols;
    });
  };

  const handleMaxHeightChange = (newMaxHeight: number) => {
    setLevelData(draft => {
      draft.fabricArea.maxFabricHeight = newMaxHeight;
      // Optionally, trim columns that exceed the new max height
      draft.fabricArea.columns.forEach(column => {
        if (column.length > newMaxHeight) {
          column.splice(newMaxHeight);
        }
      });
    });
  };

  const handleBlockChange = (colIndex: number, blockIndex: number, newBlock: FabricBlockData) => {
    setLevelData(draft => {
      draft.fabricArea.columns[colIndex][blockIndex] = newBlock;
    });
  };

  const addBlock = (colIndex: number) => {
    setLevelData(draft => {
      if (draft.fabricArea.columns[colIndex].length < draft.fabricArea.maxFabricHeight) {
        draft.fabricArea.columns[colIndex].push(createEmptyFabricBlock());
      } else {
        toast({ title: "Max Height Reached", description: `Column ${colIndex+1} cannot exceed ${draft.fabricArea.maxFabricHeight} blocks.`, variant: "destructive" });
      }
    });
  };

  const deleteBlock = (colIndex: number, blockIndex: number) => {
    setLevelData(draft => {
      if (draft.fabricArea.columns[colIndex].length > 1) {
        draft.fabricArea.columns[colIndex].splice(blockIndex, 1);
      } else {
         toast({ title: "Cannot Delete", description: `Column ${colIndex+1} must have at least one block.`, variant: "destructive" });
      }
    });
  };
  
  const deleteColumn = (colIndex: number) => {
    if (cols <= 1) {
      toast({ title: "Cannot Delete", description: "Must have at least one column.", variant: "destructive" });
      return;
    }
    setLevelData(draft => {
      draft.fabricArea.columns.splice(colIndex, 1);
      draft.fabricArea.cols -=1;
    });
    toast({ title: "Column Deleted", description: `Column ${colIndex + 1} deleted successfully.` });
  };


  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">Fabric Grid Editor</h3>
      <div className="flex gap-4 mb-4 items-end">
        <NumberSpinner id="fabric-cols" label="Columns" value={cols} onChange={handleColsChange} min={1} max={20} /> {/* Increased max for demonstration, adjust as needed */}
        <NumberSpinner id="fabric-max-height" label="Max Height" value={maxFabricHeight} onChange={handleMaxHeightChange} min={1} max={20} />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 pb-4">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1 p-2 border rounded-md bg-muted/50 min-w-[240px]">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-foreground">Column {colIndex + 1}</h4>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" title={`Delete Column ${colIndex + 1}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Column {colIndex + 1}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to delete this entire column and all its blocks?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteColumn(colIndex)} className="bg-destructive hover:bg-destructive/90">Delete Column</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
              <div className="max-h-[400px] overflow-y-auto space-y-1 pr-1 custom-scrollbar"> {/* Added custom-scrollbar class if needed */}
                {column.map((block, blockIndex) => (
                  <FabricBlockEditor
                    key={blockIndex}
                    block={block}
                    onBlockChange={(newBlock) => handleBlockChange(colIndex, blockIndex, newBlock)}
                    onDelete={() => deleteBlock(colIndex, blockIndex)}
                    isLastBlock={column.length === 1}
                    blockIndex={blockIndex}
                    columnIndex={colIndex}
                  />
                ))}
              </div>
              {column.length < maxFabricHeight && (
                <Button variant="outline" size="sm" onClick={() => addBlock(colIndex)} className="mt-2 text-sm">
                  <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Block
                </Button>
              )}
               {column.length >= maxFabricHeight && (
                <p className="mt-2 text-xs text-muted-foreground text-center">Max height reached</p>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};
