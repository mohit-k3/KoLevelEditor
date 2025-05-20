
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import { BobbinCellEditor } from './BobbinCellEditor';
import type { BobbinCell } from '@/lib/types';
import { createEmptyBobbinCell } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
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

export const BobbinGridEditor: React.FC = () => {
  const { levelData, setLevelData } = useLevelData();
  const { rows, cols, cells } = levelData.bobbinArea;
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

  const handleRowsChange = (newRows: number) => {
    setLevelData(draft => {
      const currentRows = draft.bobbinArea.rows;
      if (newRows > currentRows) {
        for (let i = currentRows; i < newRows; i++) {
          draft.bobbinArea.cells.push(Array(draft.bobbinArea.cols).fill(null).map(createEmptyBobbinCell));
        }
      } else if (newRows < currentRows) {
        draft.bobbinArea.cells = draft.bobbinArea.cells.slice(0, newRows);
      }
      draft.bobbinArea.rows = newRows;
    });
  };

  const handleColsChange = (newCols: number) => {
    setLevelData(draft => {
      draft.bobbinArea.cells.forEach(row => {
        const currentColLength = row.length;
        if (newCols > currentColLength) {
          for (let i = currentColLength; i < newCols; i++) {
            row.push(createEmptyBobbinCell());
          }
        } else if (newCols < currentColLength) {
          row.splice(newCols);
        }
      });
      draft.bobbinArea.cols = newCols;
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, newCell: BobbinCell) => {
    setLevelData(draft => {
      draft.bobbinArea.cells[rowIndex][colIndex] = newCell;
    });
  };

  const cloneRow = (rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= rows) return;
    setLevelData(draft => {
      const rowToClone = JSON.parse(JSON.stringify(draft.bobbinArea.cells[rowIndex]));
      draft.bobbinArea.cells.splice(rowIndex + 1, 0, rowToClone);
      draft.bobbinArea.rows += 1;
    });
    toast({ title: "Row Cloned", description: `Row ${rowIndex + 1} cloned successfully.` });
  };

  const deleteRow = (rowIndex: number) => {
    if (rows <= 1) {
      toast({ title: "Cannot Delete", description: "Must have at least one row.", variant: "destructive" });
      return;
    }
    if (rowIndex < 0 || rowIndex >= rows) return;
    setLevelData(draft => {
      draft.bobbinArea.cells.splice(rowIndex, 1);
      draft.bobbinArea.rows -= 1;
    });
    toast({ title: "Row Deleted", description: `Row ${rowIndex + 1} deleted successfully.` });
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gridRef.current || !document.activeElement || !gridRef.current.contains(document.activeElement)) {
         // Only handle if focus is within the grid or on a popover trigger from the grid
        const popoverTrigger = document.activeElement.closest('[aria-haspopup="dialog"]');
        if(!popoverTrigger || !gridRef.current.contains(popoverTrigger)) {
          return;
        }
      }
      
      if (focusedCell === null && !event.target?.toString().includes('PopoverTrigger')) return;

      let currentFocusedRow = focusedCell?.row ?? 0;
      let currentFocusedCol = focusedCell?.col ?? 0;

      // If focus is on a popover trigger, derive current row/col from it
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'BUTTON' && activeElement.getAttribute('aria-label')?.startsWith('Edit cell')) {
        const match = activeElement.getAttribute('aria-label')?.match(/row (\d+), column (\d+)/);
        if (match) {
          currentFocusedRow = parseInt(match[1], 10) - 1;
          currentFocusedCol = parseInt(match[2], 10) - 1;
        }
      }


      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setFocusedCell({ row: Math.max(0, currentFocusedRow - 1), col: currentFocusedCol });
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedCell({ row: Math.min(rows - 1, currentFocusedRow + 1), col: currentFocusedCol });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedCell({ row: currentFocusedRow, col: Math.max(0, currentFocusedCol - 1) });
          break;
        case 'ArrowRight':
          event.preventDefault();
          setFocusedCell({ row: currentFocusedRow, col: Math.min(cols - 1, currentFocusedCol + 1) });
          break;
        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) { // Or just allow 'c' without modifier if preferred
            event.preventDefault();
            cloneRow(currentFocusedRow);
          }
          break;
        case 'd':
        case 'D':
           if (event.ctrlKey || event.metaKey) { // Or just allow 'd' without modifier
            event.preventDefault();
            // Open alert dialog for delete confirmation
            const deleteButton = document.getElementById(`delete-row-${currentFocusedRow}`);
            if (deleteButton) {
              deleteButton.click();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, rows, cols, cloneRow, deleteRow]);

  useEffect(() => {
    if (focusedCell) {
      const cellButton = gridRef.current?.querySelector(`[aria-label^="Edit cell at row ${focusedCell.row + 1}, column ${focusedCell.col + 1}"]`) as HTMLElement;
      cellButton?.focus();
    }
  }, [focusedCell]);


  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">Bobbin Grid Editor</h3>
      <div className="flex gap-4 mb-4 items-end">
        <NumberSpinner id="bobbin-rows" label="Rows" value={rows} onChange={handleRowsChange} min={1} max={20} />
        <NumberSpinner id="bobbin-cols" label="Cols" value={cols} onChange={handleColsChange} min={1} max={20} />
      </div>
      <div ref={gridRef} className="overflow-auto">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols + 1}, auto)` }}>
          {/* Header for row actions */}
          <div /> 
          {/* Column numbers */}
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={`col-header-${cIdx}`} className="text-xs font-medium text-muted-foreground text-center pb-1 select-none">{cIdx + 1}</div>
          ))}

          {cells.map((row, rIdx) => (
            <React.Fragment key={`row-wrapper-${rIdx}`}>
              {/* Row number and actions */}
              <div className="flex flex-col items-center justify-center pr-1 select-none">
                <span className="text-xs font-medium text-muted-foreground mb-1">{rIdx + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => cloneRow(rIdx)} title={`Clone Row ${rIdx + 1} (Ctrl+C)`}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" title={`Delete Row ${rIdx + 1} (Ctrl+D)`} id={`delete-row-${rIdx}`}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Row {rIdx + 1}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to delete this row?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteRow(rIdx)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {/* Cells */}
              {row.map((cell, cIdx) => (
                <BobbinCellEditor
                  key={`${rIdx}-${cIdx}`}
                  cell={cell}
                  onCellChange={(newCell) => handleCellChange(rIdx, cIdx, newCell)}
                  rowIndex={rIdx}
                  colIndex={cIdx}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Keyboard: Arrow keys to move focus. Ctrl+C to clone row, Ctrl+D to delete row.
      </div>
    </div>
  );
};
