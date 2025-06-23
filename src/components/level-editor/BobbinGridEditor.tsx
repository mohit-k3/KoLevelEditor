
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import { BobbinCellEditor } from './BobbinCellEditor';
import type { BobbinCell, BobbinPairCoordinate } from '@/lib/types';
import { createEmptyBobbinCell } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Link2, Link2Off } from 'lucide-react';
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
  const { rows, cols, cells, pairs = [] } = levelData.bobbinArea;
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkStartNode, setLinkStartNode] = useState<BobbinPairCoordinate | null>(null);

  const handleRowsChange = (newRows: number) => {
    setLevelData(draft => {
      const currentRows = draft.bobbinArea.rows;
      if (newRows > currentRows) {
        for (let i = currentRows; i < newRows; i++) {
          draft.bobbinArea.cells.push(Array(draft.bobbinArea.cols).fill(null).map(createEmptyBobbinCell));
        }
      } else if (newRows < currentRows) {
        draft.bobbinArea.cells = draft.bobbinArea.cells.slice(0, newRows);
        // Clean up pairs involving removed rows
        if (draft.bobbinArea.pairs) {
          draft.bobbinArea.pairs = draft.bobbinArea.pairs.filter(
            p => p.from.row < newRows && p.to.row < newRows
          );
        }
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
      // Clean up pairs involving removed columns
      if (draft.bobbinArea.pairs) {
        draft.bobbinArea.pairs = draft.bobbinArea.pairs.filter(
          p => p.from.col < newCols && p.to.col < newCols
        );
      }
      draft.bobbinArea.cols = newCols;
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, newCell: BobbinCell) => {
    setLevelData(draft => {
      draft.bobbinArea.cells[rowIndex][colIndex] = newCell;
      // If cell becomes empty, remove any pairs involving it
      if (newCell.type === 'empty' && draft.bobbinArea.pairs) {
        draft.bobbinArea.pairs = draft.bobbinArea.pairs.filter(
          p => !(p.from.row === rowIndex && p.from.col === colIndex) &&
               !(p.to.row === rowIndex && p.to.col === colIndex)
        );
      }
    });
  };

  const cloneRow = (rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= rows) return;
    setLevelData(draft => {
      const rowToClone = JSON.parse(JSON.stringify(draft.bobbinArea.cells[rowIndex]));
      draft.bobbinArea.cells.splice(rowIndex + 1, 0, rowToClone);
      draft.bobbinArea.rows += 1;
      // Adjust pairs
      if (draft.bobbinArea.pairs) {
        draft.bobbinArea.pairs.forEach(p => {
          if (p.from.row > rowIndex) p.from.row++;
          if (p.to.row > rowIndex) p.to.row++;
        });
      }
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
      // Clean up pairs involving the deleted row and adjust other pairs
      if (draft.bobbinArea.pairs) {
        draft.bobbinArea.pairs = draft.bobbinArea.pairs
          .filter(p => p.from.row !== rowIndex && p.to.row !== rowIndex)
          .map(p => ({
            from: { row: p.from.row > rowIndex ? p.from.row - 1 : p.from.row, col: p.from.col },
            to: { row: p.to.row > rowIndex ? p.to.row - 1 : p.to.row, col: p.to.col },
          }));
      }
    });
    toast({ title: "Row Deleted", description: `Row ${rowIndex + 1} deleted successfully.` });
  };

  const toggleLinkingMode = () => {
    setIsLinkingMode(prev => !prev);
    setLinkStartNode(null); // Reset selection when toggling mode
  };

  const isCellLinked = (r: number, c: number): boolean => {
    return pairs.some(p => 
      (p.from.row === r && p.from.col === c) || (p.to.row === r && p.to.col === c)
    );
  };
  
  const handleLinkClick = (rIdx: number, cIdx: number) => {
    if (!isLinkingMode) return;

    const clickedCell = cells[rIdx]?.[cIdx];
    if (!clickedCell || (clickedCell.type !== 'bobbin' && clickedCell.type !== 'hidden' && clickedCell.type !== 'ice')) {
      toast({ title: "Cannot Link", description: "Only bobbins, hidden bobbins, or frozen bobbins can be linked.", variant: "destructive" });
      return;
    }

    const existingPairIndex = pairs.findIndex(p =>
      (p.from.row === rIdx && p.from.col === cIdx) || (p.to.row === rIdx && p.to.col === cIdx)
    );

    if (linkStartNode) { // This is the second+ click in a chain
      if (linkStartNode.row === rIdx && linkStartNode.col === cIdx) {
        // Clicked the same cell again, deselect it and end the chain
        setLinkStartNode(null);
        return;
      }
      
      const newLinkTarget = { row: rIdx, col: cIdx };
      setLevelData(draft => {
        if (!draft.bobbinArea.pairs) draft.bobbinArea.pairs = [];
        draft.bobbinArea.pairs.push({ from: linkStartNode, to: newLinkTarget });
      });
      toast({ title: "Link Created", description: `Bobbins at (${linkStartNode.row + 1}, ${linkStartNode.col + 1}) and (${rIdx + 1}, ${cIdx + 1}) linked.` });
      // Crucially, set the new start node to the just-clicked cell to allow continuous chaining
      setLinkStartNode(newLinkTarget);

    } else { // This is the first click or a click to unlink
      if (existingPairIndex !== -1) {
        // Clicked on an already paired bobbin, remove all links involving it
        setLevelData(draft => {
          draft.bobbinArea.pairs = draft.bobbinArea.pairs?.filter(p => 
            !(p.from.row === rIdx && p.from.col === cIdx) && 
            !(p.to.row === rIdx && p.to.col === cIdx)
          );
        });
        toast({ title: "Links Removed", description: `All links involving bobbin at (${rIdx + 1}, ${cIdx + 1}) removed.` });
      } else {
        // Start a new chain
        setLinkStartNode({ row: rIdx, col: cIdx });
      }
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gridRef.current || !document.activeElement || !gridRef.current.contains(document.activeElement)) {
        const popoverTrigger = document.activeElement?.closest('[aria-haspopup="dialog"]');
        if(!popoverTrigger || !gridRef.current.contains(popoverTrigger)) {
          if (!(event.ctrlKey || event.metaKey)) return; 
        }
      }
      
      let currentFocusedRow = focusedCell?.row ?? 0;
      let currentFocusedCol = focusedCell?.col ?? 0;

      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'BUTTON' && activeElement.getAttribute('aria-label')?.startsWith('Edit cell')) {
        const match = activeElement.getAttribute('aria-label')?.match(/row (\d+), column (\d+)/);
        if (match) {
          currentFocusedRow = parseInt(match[1], 10) - 1;
          currentFocusedCol = parseInt(match[2], 10) - 1;
        }
      }

      if (gridRef.current && (gridRef.current.contains(document.activeElement) || document.activeElement?.closest('[aria-haspopup="dialog"]'))) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            setFocusedCell(prev => ({ row: Math.max(0, (prev?.row ?? currentFocusedRow) - 1), col: prev?.col ?? currentFocusedCol }));
            break;
          case 'ArrowDown':
            event.preventDefault();
            setFocusedCell(prev => ({ row: Math.min(rows - 1, (prev?.row ?? currentFocusedRow) + 1), col: prev?.col ?? currentFocusedCol }));
            break;
          case 'ArrowLeft':
            event.preventDefault();
            setFocusedCell(prev => ({ row: prev?.row ?? currentFocusedRow, col: Math.max(0, (prev?.col ?? currentFocusedCol) - 1) }));
            break;
          case 'ArrowRight':
            event.preventDefault();
            setFocusedCell(prev => ({ row: prev?.row ?? currentFocusedRow, col: Math.min(cols - 1, (prev?.col ?? currentFocusedCol) + 1) }));
            break;
          case 'c':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              cloneRow(currentFocusedRow);
            }
            break;
          case 'd':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              document.getElementById(`delete-row-${currentFocusedRow}`)?.click();
            }
            break;
          case 'p':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              toggleLinkingMode();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, rows, cols, levelData.bobbinArea.cells, cloneRow, deleteRow, toggleLinkingMode]);

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
        <Button 
          variant={isLinkingMode ? "secondary" : "outline"} 
          onClick={toggleLinkingMode}
          title={isLinkingMode ? "Disable Linking Mode (Ctrl+P)" : "Enable Linking Mode (Ctrl+P)"}
          size="sm"
          className="self-end"
        >
          {isLinkingMode ? <Link2Off className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
          {isLinkingMode ? "Linking Active" : "Link Bobbins"}
        </Button>
      </div>
      <div ref={gridRef} className="overflow-auto">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols + 1}, auto)` }}>
          <div /> 
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={`col-header-${cIdx}`} className="text-xs font-medium text-muted-foreground text-center pb-1 select-none">{cIdx + 1}</div>
          ))}

          {cells.map((row, rIdx) => (
            <React.Fragment key={`row-wrapper-${rIdx}`}>
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
              {row.map((cell, cIdx) => (
                <BobbinCellEditor
                  key={`${rIdx}-${cIdx}`}
                  cell={cell}
                  onCellChange={(newCell) => handleCellChange(rIdx, cIdx, newCell)}
                  rowIndex={rIdx}
                  colIndex={cIdx}
                  isLinkingMode={isLinkingMode}
                  onLinkClick={handleLinkClick}
                  isSelectedForLinking={!!linkStartNode && linkStartNode.row === rIdx && linkStartNode.col === cIdx}
                  isActuallyLinked={isCellLinked(rIdx, cIdx)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Keyboard: Arrow keys to move focus. Ctrl+C to clone row, Ctrl+D to delete. Ctrl+P to toggle linking mode.
        {isLinkingMode && " Linking mode: Click bobbins sequentially to form a chain. Click an empty cell or the last bobbin to stop. Click a linked bobbin to remove its links."}
      </div>
    </div>
  );
};
