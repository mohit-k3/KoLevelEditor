
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import { BobbinCellEditor } from './BobbinCellEditor';
import type { BobbinCell, BobbinPairCoordinate, BobbinChain, BobbinPin } from '@/lib/types';
import { createEmptyBobbinCell } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Link2, Link2Off, LinkIcon, KeyRound, Pin } from 'lucide-react';
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

const areCoordsAdjacent = (c1: BobbinPairCoordinate, c2: BobbinPairCoordinate): boolean => {
    const rowDiff = Math.abs(c1.row - c2.row);
    const colDiff = Math.abs(c1.col - c2.col);
    return rowDiff + colDiff === 1;
};

export const BobbinGridEditor: React.FC = () => {
  const { levelData, setLevelData } = useLevelData();
  const { rows, cols, cells, pairs = [], chains = [], pins = [] } = levelData.bobbinArea;
  const { toast } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);

  // Pairing state
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkStartNode, setLinkStartNode] = useState<BobbinPairCoordinate | null>(null);

  // Chaining state
  const [isChainingMode, setIsChainingMode] = useState(false);
  const [activeChainIndex, setActiveChainIndex] = useState<number | null>(null);
  const [chainToLinkKey, setChainToLinkKey] = useState<number | null>(null);

  // Pinning state
  const [isPinningMode, setIsPinningMode] = useState(false);
  const [pinStartNode, setPinStartNode] = useState<BobbinPairCoordinate | null>(null);

  const handleRowsChange = (newRows: number) => {
    setLevelData(draft => {
      const currentRows = draft.bobbinArea.rows;
      if (newRows > currentRows) {
        for (let i = currentRows; i < newRows; i++) {
          draft.bobbinArea.cells.push(Array(draft.bobbinArea.cols).fill(null).map(createEmptyBobbinCell));
        }
      } else if (newRows < currentRows) {
        draft.bobbinArea.cells = draft.bobbinArea.cells.slice(0, newRows);
        // Clean up pairs, chains, pins involving removed rows
        if (draft.bobbinArea.pairs) {
          draft.bobbinArea.pairs = draft.bobbinArea.pairs.filter(p => p.from.row < newRows && p.to.row < newRows);
        }
        if (draft.bobbinArea.chains) {
            draft.bobbinArea.chains = draft.bobbinArea.chains.map(chain => {
                const newPath = chain.path.filter(coord => coord.row < newRows);
                let newKeyLocation = chain.keyLocation;
                if (newKeyLocation && newKeyLocation.row >= newRows) {
                    newKeyLocation = null; // Invalidate key if it was in a removed row
                    delete chain.color;
                }
                return { ...chain, path: newPath, keyLocation: newKeyLocation };
            }).filter(chain => chain.path.length > 0);
        }
        if (draft.bobbinArea.pins) {
          draft.bobbinArea.pins = draft.bobbinArea.pins.filter(p => p.head.row < newRows && p.tail.row < newRows);
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
      // Clean up pairs, chains, pins involving removed columns
      if (draft.bobbinArea.pairs) {
        draft.bobbinArea.pairs = draft.bobbinArea.pairs.filter(p => p.from.col < newCols && p.to.col < newCols);
      }
      if (draft.bobbinArea.chains) {
          draft.bobbinArea.chains = draft.bobbinArea.chains.map(chain => {
              const newPath = chain.path.filter(coord => coord.col < newCols);
              let newKeyLocation = chain.keyLocation;
              if (newKeyLocation && newKeyLocation.col >= newCols) {
                  newKeyLocation = null;
                  delete chain.color;
              }
              return { ...chain, path: newPath, keyLocation: newKeyLocation };
          }).filter(chain => chain.path.length > 0);
        }
       if (draft.bobbinArea.pins) {
          draft.bobbinArea.pins = draft.bobbinArea.pins.filter(p => p.head.col < newCols && p.tail.col < newCols);
       }
      draft.bobbinArea.cols = newCols;
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, newCell: BobbinCell) => {
    setLevelData(draft => {
      const oldCell = draft.bobbinArea.cells[rowIndex][colIndex];
      draft.bobbinArea.cells[rowIndex][colIndex] = newCell;

      if (newCell.type === 'empty') {
        // If cell becomes empty, remove any pairs or chain links involving it
        if (draft.bobbinArea.pairs) {
            draft.bobbinArea.pairs = draft.bobbinArea.pairs.filter(p => !(p.from.row === rowIndex && p.from.col === colIndex) && !(p.to.row === rowIndex && p.to.col === colIndex));
        }
        if(draft.bobbinArea.chains) {
            draft.bobbinArea.chains = draft.bobbinArea.chains.map(chain => ({
                ...chain,
                path: chain.path.filter(coord => !(coord.row === rowIndex && coord.col === colIndex))
            })).filter(chain => chain.path.length > 0);
        }
      }
      
      // If a cell that WAS a chain key is no longer one, or its color changed
      if (oldCell.has === 'chain-key') {
        draft.bobbinArea.chains?.forEach(chain => {
          if (chain.keyLocation?.row === rowIndex && chain.keyLocation?.col === colIndex) {
            if (newCell.has !== 'chain-key') {
              // The key was removed
              chain.keyLocation = null;
              delete chain.color;
            } else if (newCell.accessoryColor !== oldCell.accessoryColor) {
              // The key's color changed
              chain.color = newCell.accessoryColor;
            }
          }
        });
      }
    });
  };

  const cloneRow = (rowIndex: number) => {
    if (rowIndex < 0 || rowIndex >= rows) return;
    setLevelData(draft => {
      const rowToClone = JSON.parse(JSON.stringify(draft.bobbinArea.cells[rowIndex]));
      draft.bobbinArea.cells.splice(rowIndex + 1, 0, rowToClone);
      draft.bobbinArea.rows += 1;
      // Adjust pairs, chains, and pins
      if (draft.bobbinArea.pairs) {
        draft.bobbinArea.pairs.forEach(p => {
          if (p.from.row > rowIndex) p.from.row++;
          if (p.to.row > rowIndex) p.to.row++;
        });
      }
       if (draft.bobbinArea.chains) {
         draft.bobbinArea.chains.forEach(chain => {
            chain.path.forEach(coord => {
                if (coord.row > rowIndex) coord.row++;
            });
            if (chain.keyLocation && chain.keyLocation.row > rowIndex) {
                chain.keyLocation.row++;
            }
         });
      }
      if (draft.bobbinArea.pins) {
        draft.bobbinArea.pins.forEach(p => {
          if (p.head.row > rowIndex) p.head.row++;
          if (p.tail.row > rowIndex) p.tail.row++;
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
      // Adjust pairs
      const newPairs = draft.bobbinArea.pairs?.filter(p => p.from.row !== rowIndex && p.to.row !== rowIndex)
          .map(p => ({
            from: { row: p.from.row > rowIndex ? p.from.row - 1 : p.from.row, col: p.from.col },
            to: { row: p.to.row > rowIndex ? p.to.row - 1 : p.to.row, col: p.to.col },
          })) || [];
      draft.bobbinArea.pairs = newPairs;
      // Adjust chains
      const newChains = draft.bobbinArea.chains?.map(chain => {
            const newPath = chain.path.filter(coord => coord.row !== rowIndex)
                 .map(coord => ({ row: coord.row > rowIndex ? coord.row - 1 : coord.row, col: coord.col }));
            let newKeyLocation = chain.keyLocation;
            if (newKeyLocation) {
                if (newKeyLocation.row === rowIndex) {
                  newKeyLocation = null;
                  delete chain.color;
                }
                else if (newKeyLocation.row > rowIndex) newKeyLocation.row--;
            }
            return { ...chain, path: newPath, keyLocation: newKeyLocation };
        }).filter(chain => chain.path.length > 0) || [];
      draft.bobbinArea.chains = newChains;
      // Adjust pins
      const newPins = draft.bobbinArea.pins?.filter(p => p.head.row !== rowIndex && p.tail.row !== rowIndex)
          .map(p => ({
            head: { row: p.head.row > rowIndex ? p.head.row - 1 : p.head.row, col: p.head.col },
            tail: { row: p.tail.row > rowIndex ? p.tail.row - 1 : p.tail.row, col: p.tail.col },
          })) || [];
      draft.bobbinArea.pins = newPins;
    });
    toast({ title: "Row Deleted", description: `Row ${rowIndex + 1} deleted successfully.` });
  };

  const toggleLinkingMode = () => {
    const willBeOn = !isLinkingMode;
    setIsLinkingMode(willBeOn);
    setLinkStartNode(null); 
    if (willBeOn) {
      setIsChainingMode(false);
      setActiveChainIndex(null);
      setChainToLinkKey(null);
      setIsPinningMode(false);
      setPinStartNode(null);
    }
  };
  
  const toggleChainingMode = () => {
    const willBeOn = !isChainingMode;
    setIsChainingMode(willBeOn);
    setActiveChainIndex(null);
    setChainToLinkKey(null);
    if(willBeOn) {
        setIsLinkingMode(false);
        setLinkStartNode(null);
        setIsPinningMode(false);
        setPinStartNode(null);
    }
  }

  const togglePinningMode = () => {
    const willBeOn = !isPinningMode;
    setIsPinningMode(willBeOn);
    setPinStartNode(null);
    if (willBeOn) {
      setIsLinkingMode(false);
      setLinkStartNode(null);
      setIsChainingMode(false);
      setActiveChainIndex(null);
      setChainToLinkKey(null);
    }
  };

  const isCellLinked = (r: number, c: number): boolean => pairs.some(p => (p.from.row === r && p.from.col === c) || (p.to.row === r && p.to.col === c));
  const findChainIndexForCoord = (r:number, c:number): number => (chains || []).findIndex(chain => chain.path.some(coord => coord.row === r && coord.col === c));
  const isCellInChain = (r: number, c: number): boolean => findChainIndexForCoord(r, c) !== -1;
  const isCellInActiveChain = (r: number, c: number): boolean => {
    if (activeChainIndex === null) return false;
    return chains[activeChainIndex]?.path.some(coord => coord.row === r && coord.col === c) || false;
  };
  const getPinPart = (r: number, c: number): 'head' | 'tail' | null => {
    for (const pin of pins) {
        if (pin.head.row === r && pin.head.col === c) return 'head';
        if (pin.tail.row === r && pin.tail.col === c) return 'tail';
    }
    return null;
  };
  const isCellPinned = (r: number, c: number): boolean => getPinPart(r, c) !== null;


  const handleLinkClick = (rIdx: number, cIdx: number) => {
    if (!isLinkingMode) return;

    const clickedCell = cells[rIdx]?.[cIdx];
    if (!clickedCell || clickedCell.type !== 'bobbin') {
      toast({ title: "Cannot Pair", description: "Only bobbins can be paired.", variant: "destructive" });
      return;
    }
    
    if(isCellInChain(rIdx, cIdx) || isCellPinned(rIdx, cIdx)) {
        toast({ title: "Cannot Pair", description: "This bobbin is already part of a chain or pin.", variant: "destructive" });
        return;
    }

    if (linkStartNode) { 
      if (linkStartNode.row === rIdx && linkStartNode.col === cIdx) {
        setLinkStartNode(null);
        return;
      }
      const newPair = { from: linkStartNode, to: { row: rIdx, col: cIdx } };
      const pairExists = pairs.some(p =>
        (p.from.row === newPair.from.row && p.from.col === newPair.from.col && p.to.row === newPair.to.row && p.to.col === newPair.to.col) ||
        (p.from.row === newPair.to.row && p.from.col === newPair.to.col && p.to.row === newPair.from.row && p.to.col === newPair.from.col)
      );

      if (pairExists) {
        toast({ title: "Already Paired", description: "These bobbins are already paired.", variant: "destructive" });
        setLinkStartNode(null);
        return;
      }
      
      if (isCellLinked(linkStartNode.row, linkStartNode.col) || isCellLinked(rIdx, cIdx)) {
         toast({ title: "Cannot Pair", description: "One of these bobbins is already part of another pair. Unpair it first.", variant: "destructive" });
         setLinkStartNode(null);
         return;
      }

      setLevelData(draft => {
        if (!draft.bobbinArea.pairs) draft.bobbinArea.pairs = [];
        draft.bobbinArea.pairs.push(newPair);
      });
      toast({ title: "Pair Created", description: `Bobbins at (${linkStartNode.row + 1}, ${linkStartNode.col + 1}) and (${rIdx + 1}, ${cIdx + 1}) paired.` });
      setLinkStartNode(null);

    } else { 
       const existingPairIndex = pairs.findIndex(p => (p.from.row === rIdx && p.from.col === cIdx) || (p.to.row === rIdx && p.to.col === cIdx));
      if (existingPairIndex !== -1) {
        setLevelData(draft => { draft.bobbinArea.pairs?.splice(existingPairIndex, 1); });
        toast({ title: "Pair Removed", description: `Pair involving bobbin at (${rIdx + 1}, ${cIdx + 1}) removed.` });
      } else {
        setLinkStartNode({ row: rIdx, col: cIdx });
      }
    }
  };

  const handleChainClick = (rIdx: number, cIdx: number) => {
    if (!isChainingMode) return;

    if (chainToLinkKey !== null) {
        const clickedCell = cells[rIdx]?.[cIdx];
        if (clickedCell?.has !== 'chain-key') {
            toast({ title: "Not a Chain Key", description: "You must select a bobbin with a 'chain-key' accessory.", variant: "destructive" });
            return;
        }
        if (!clickedCell.accessoryColor) {
            toast({ title: "No Accessory Color", description: "The selected chain-key must have an accessory color assigned.", variant: "destructive" });
            return;
        }
        setLevelData(draft => {
            const chain = draft.bobbinArea.chains![chainToLinkKey];
            chain.keyLocation = { row: rIdx, col: cIdx };
            chain.color = clickedCell.accessoryColor;
        });
        toast({ title: "Chain Key Linked", description: `Linked chain to key at (${rIdx + 1}, ${cIdx + 1}).`});
        setChainToLinkKey(null);
        return;
    }

    const clickedCell = cells[rIdx]?.[cIdx];
    if (!clickedCell || clickedCell.type !== 'bobbin') {
        toast({ title: "Cannot Chain", description: "Only bobbins can be chained.", variant: "destructive" });
        return;
    }
     if (isCellLinked(rIdx, cIdx) || isCellPinned(rIdx, cIdx)) {
        toast({ title: "Cannot Chain", description: "This bobbin is already part of a pair or pin.", variant: "destructive" });
        return;
    }

    const clickedCoord = { row: rIdx, col: cIdx };
    const chainIndexOfClicked = findChainIndexForCoord(rIdx, cIdx);

    if (chainIndexOfClicked !== -1) { // Clicked on an existing chain
      setActiveChainIndex(chainIndexOfClicked);
      const chainPath = chains[chainIndexOfClicked].path;
      const lastBobbinInChain = chainPath[chainPath.length - 1];
      if (chainPath.length > 0 && lastBobbinInChain.row === rIdx && lastBobbinInChain.col === cIdx) {
        // Clicked on the last bobbin, so remove it
        setLevelData(draft => {
          const newPath = draft.bobbinArea.chains![chainIndexOfClicked].path.slice(0, -1);
          if (newPath.length === 0) {
            draft.bobbinArea.chains!.splice(chainIndexOfClicked, 1);
            setActiveChainIndex(null);
             toast({ title: "Chain Removed", description: `The chain has been removed.` });
          } else {
            draft.bobbinArea.chains![chainIndexOfClicked].path = newPath;
            toast({ title: "Bobbin Unchained", description: `Removed bobbin from end of chain.` });
          }
        });
      } else {
         toast({ title: "Chain Selected", description: `Selected chain ${chainIndexOfClicked + 1}. Click an adjacent bobbin to extend it or link a key.` });
      }
    } else { // Clicked on an unchained bobbin
        if (activeChainIndex !== null) { // Trying to extend a chain
            const activeChainPath = chains[activeChainIndex].path;
            const lastBobbin = activeChainPath[activeChainPath.length - 1];
            if (areCoordsAdjacent(lastBobbin, clickedCoord)) {
                setLevelData(draft => {
                    draft.bobbinArea.chains![activeChainIndex].path.push(clickedCoord);
                });
                toast({ title: "Bobbin Chained", description: `Added bobbin to chain ${activeChainIndex + 1}.` });
            } else {
                 toast({ title: "Cannot Chain", description: "Bobbin must be adjacent to the end of the selected chain.", variant: "destructive" });
            }
        } else { // Starting a new chain
             setLevelData(draft => {
                if(!draft.bobbinArea.chains) draft.bobbinArea.chains = [];
                const newChain: BobbinChain = { path: [clickedCoord], keyLocation: null };
                draft.bobbinArea.chains.push(newChain);
                setActiveChainIndex(draft.bobbinArea.chains.length - 1);
             });
             toast({ title: "New Chain Started", description: `Started a new chain.` });
        }
    }

  };

  const handlePinClick = (rIdx: number, cIdx: number) => {
    if (!isPinningMode) return;
    const clickedCoord = { row: rIdx, col: cIdx };

    // Prevent pinning a cell that's already in a pair or chain
    if (isCellLinked(rIdx, cIdx) || isCellInChain(rIdx, cIdx)) {
        toast({ title: "Cannot Pin", description: "This cell is already part of a pair or chain.", variant: "destructive" });
        return;
    }
    
    // Check if the clicked cell is part of an existing pin to unpin it
    const existingPinIndex = pins.findIndex(p => 
        (p.head.row === rIdx && p.head.col === cIdx) || 
        (p.tail.row === rIdx && p.tail.col === cIdx)
    );

    if (existingPinIndex !== -1) {
        setLevelData(draft => { draft.bobbinArea.pins?.splice(existingPinIndex, 1); });
        toast({ title: "Pin Removed", description: `Pin at (${rIdx + 1}, ${cIdx + 1}) removed.` });
        if (pinStartNode && pinStartNode.row === rIdx && pinStartNode.col === cIdx) {
            setPinStartNode(null); // Clear start node if we just unpinned it
        }
        return;
    }
    
    if (pinStartNode) { // This is the second click (placing the tail)
      if (pinStartNode.row === rIdx && pinStartNode.col === cIdx) {
        setPinStartNode(null); // Deselect if clicking the same cell again
        return;
      }
      const newPin: BobbinPin = { head: pinStartNode, tail: clickedCoord };
      setLevelData(draft => {
        if (!draft.bobbinArea.pins) draft.bobbinArea.pins = [];
        draft.bobbinArea.pins.push(newPin);
      });
      toast({ title: "Pin Created", description: `Pinned head at (${pinStartNode.row + 1}, ${pinStartNode.col + 1}) to tail at (${rIdx + 1}, ${cIdx + 1}).` });
      setPinStartNode(null); // Reset after creating the pin
    } else { // This is the first click (placing the head)
      setPinStartNode(clickedCoord);
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

  const handleStartLinkToKey = () => {
      if (activeChainIndex === null) return;
      setChainToLinkKey(activeChainIndex);
      setActiveChainIndex(null);
      toast({ title: "Assigning Key", description: "Click on a bobbin with a 'chain-key' to link it."});
  };


  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">Bobbin Grid Editor</h3>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <NumberSpinner id="bobbin-rows" label="Rows" value={rows} onChange={handleRowsChange} min={1} max={20} />
        <NumberSpinner id="bobbin-cols" label="Cols" value={cols} onChange={handleColsChange} min={1} max={20} />
        <Button 
          variant={isLinkingMode ? "secondary" : "outline"} 
          onClick={toggleLinkingMode}
          title={isLinkingMode ? "Disable Pairing Mode (Ctrl+P)" : "Enable Pairing Mode (Ctrl+P)"}
          size="sm"
          className="self-end"
        >
          {isLinkingMode ? <Link2Off className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
          {isLinkingMode ? "Pairing" : "Pair"}
        </Button>
         <Button 
          variant={isChainingMode ? "secondary" : "outline"} 
          onClick={toggleChainingMode}
          title={isChainingMode ? "Disable Chaining Mode" : "Enable Chaining Mode"}
          size="sm"
          className="self-end"
        >
          <LinkIcon className="mr-2 h-4 w-4" />
          {isChainingMode ? "Chaining" : "Chain"}
        </Button>
        <Button 
          variant={isPinningMode ? "secondary" : "outline"} 
          onClick={togglePinningMode}
          title={isPinningMode ? "Disable Pinning Mode" : "Enable Pinning Mode"}
          size="sm"
          className="self-end"
        >
          <Pin className="mr-2 h-4 w-4" />
          {isPinningMode ? "Pinning" : "Pin"}
        </Button>
        {isChainingMode && activeChainIndex !== null && (
            <Button
                variant="outline"
                size="sm"
                onClick={handleStartLinkToKey}
                className="self-end border-blue-500 text-blue-600 hover:bg-blue-50"
            >
                <KeyRound className="mr-2 h-4 w-4" />
                Link Key
            </Button>
        )}
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
              {row.map((cell, cIdx) => {
                const pinPart = getPinPart(rIdx, cIdx);
                return (
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
                      isChainingMode={isChainingMode}
                      onChainClick={handleChainClick}
                      isActuallyInChain={isCellInChain(rIdx, cIdx)}
                      isSelectedChain={isCellInActiveChain(rIdx, cIdx)}
                      isChainAwaitingKeyLink={chainToLinkKey !== null && findChainIndexForCoord(rIdx,cIdx) === chainToLinkKey}
                      isPinningMode={isPinningMode}
                      onPinClick={handlePinClick}
                      isSelectedForPinning={!!pinStartNode && pinStartNode.row === rIdx && pinStartNode.col === cIdx}
                      isActuallyPinned={isCellPinned(rIdx, cIdx)}
                      pinPart={pinPart}
                    />
                );
            })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Keyboard: Arrow keys to move focus. Ctrl+C to clone row, Ctrl+D to delete. Ctrl+P to toggle pairing mode.
        {isLinkingMode && " Pairing mode: Click a bobbin to start. Click a second bobbin to create the pair. Click a paired bobbin to unpair."}
        {isChainingMode && chainToLinkKey === null && " Chaining mode: Click bobbin to start/select chain. Click adjacent bobbin to extend. Click last bobbin in chain to remove it."}
        {isChainingMode && chainToLinkKey !== null && ` Linking Key for Chain ${chainToLinkKey+1}: Click a bobbin with a 'chain-key' accessory.`}
        {isPinningMode && " Pinning mode: Click a cell to place pin head. Click another cell to place tail and create the pin. Click a pinned cell to unpin."}
      </div>
    </div>
  );
};
