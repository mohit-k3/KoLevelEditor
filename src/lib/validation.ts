
import type { LevelData, ValidationMessage, BobbinColor, FabricBlockData, Difficulty, BobbinPairCoordinate, BobbinChain } from './types';
import { AVAILABLE_COLORS, LIMITED_FABRIC_COLORS } from './constants';

const VALID_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

function isCoordEqual(c1: BobbinPairCoordinate, c2: BobbinPairCoordinate): boolean {
  return c1.row === c2.row && c1.col === c2.col;
}

function areCoordsAdjacent(c1: BobbinPairCoordinate, c2: BobbinPairCoordinate): boolean {
    const rowDiff = Math.abs(c1.row - c2.row);
    const colDiff = Math.abs(c1.col - c2.col);
    return rowDiff + colDiff === 1;
}

const coordLabel = (coord: BobbinPairCoordinate) => `(R${coord.row + 1},C${coord.col + 1})`;

export const validateLevelData = (data: LevelData): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  let idCounter = 0;

  // General level validation
  if (data.level === undefined || data.level < 1) {
     messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Level number must be 1 or greater.` });
  }
  if (!data.difficulty || !VALID_DIFFICULTIES.includes(data.difficulty)) {
    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Level difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.` });
  }


  // Bobbin Area Validations
  const bobbinRows = data.bobbinArea.rows;
  const bobbinCols = data.bobbinArea.cols;

  if (bobbinRows !== data.bobbinArea.cells.length) {
    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Declared rows (${bobbinRows}) do not match actual cell rows (${data.bobbinArea.cells.length}).` });
  }
  data.bobbinArea.cells.forEach((row, rIdx) => {
    if (bobbinCols !== row.length) {
      messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Row ${rIdx + 1} declared columns (${bobbinCols}) do not match actual cells (${row.length}).` });
    }
  });

  const effectiveBobbinColorCounts = new Map<BobbinColor, number>();
  const allBobbinColorsPresent = new Set<BobbinColor>(); 
  const pairedCellCoordinates = new Set<string>(); 
  const lockKeyColorCounts = new Map<BobbinColor, { locks: number; keys: number }>();
  let pinHeadCount = 0;
  let pinTailCount = 0;

  data.bobbinArea.cells.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const cellPos = `(R${rIdx + 1}, C${cIdx + 1})`;

      if (cell.type === 'bobbin') {
        if (cell.has === 'pin-head') pinHeadCount++;
        if (cell.has === 'pin-tail') pinTailCount++;

        if (cell.has === 'lock' || cell.has === 'key' || cell.has === 'chain-key') {
          if (!cell.accessoryColor) {
            messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Cell ${cellPos} with a '${cell.has}' accessory is missing an accessory color.` });
          }
        }

        if (cell.has === 'lock' || cell.has === 'key') {
          if (cell.accessoryColor) {
            const color = cell.accessoryColor;
            const counts = lockKeyColorCounts.get(color) || { locks: 0, keys: 0 };
            if (cell.has === 'lock') counts.locks++;
            if (cell.has === 'key') counts.keys++;
            lockKeyColorCounts.set(color, counts);
          }
        }

        if (!cell.color) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Cell ${cellPos} of type "bobbin" is missing a color.` });
        } else if (!AVAILABLE_COLORS.includes(cell.color)) {
          // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Cell ${cellPos} has an undefined color "${cell.color}".` });
        }
        if (cell.color) {
          allBobbinColorsPresent.add(cell.color);
          effectiveBobbinColorCounts.set(cell.color, (effectiveBobbinColorCounts.get(cell.color) || 0) + 1);
        }
      }
      
      if (cell.has && cell.type !== 'bobbin') {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Cell ${cellPos} of type "${cell.type}" cannot have an accessory.`});
      }
      
      if (cell.type === 'pipe') {
        if (!cell.colors || cell.colors.length < 2) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellPos} must specify at least 2 colors.` });
        } else if (cell.colors.length > 5) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellPos} cannot have more than 5 colors.` });
        }
        cell.colors?.forEach(pipeColor => {
          if (!AVAILABLE_COLORS.includes(pipeColor)) {
           // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Pipe cell ${cellPos} has an undefined color "${pipeColor}".` });
          }
          if (pipeColor) {
            allBobbinColorsPresent.add(pipeColor);
            effectiveBobbinColorCounts.set(pipeColor, (effectiveBobbinColorCounts.get(pipeColor) || 0) + 1);
          }
        });
      }
    });
  });

  // Colored Lock/Key validation
  lockKeyColorCounts.forEach((counts, color) => {
    if (counts.locks !== counts.keys) {
      messages.push({
        id: `val-${idCounter++}`,
        type: 'error',
        message: `Lock/Key Mismatch for color "${color}": Found ${counts.locks} lock(s) and ${counts.keys} key(s). The counts must be equal.`
      });
    }
  });

  // Pin validation
  if (pinHeadCount !== pinTailCount) {
      messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Pin Mismatch: Found ${pinHeadCount} pin head(s) and ${pinTailCount} pin tail(s). The counts must be equal.` });
  }
  

  // Bobbin Pair Validations
  if (data.bobbinArea.pairs) {
    data.bobbinArea.pairs.forEach((pair, pIdx) => {
      const pairLabel = `Pair ${pIdx + 1} [${coordLabel(pair.from)} to ${coordLabel(pair.to)}]`;

      [pair.from, pair.to].forEach(coord => {
        if (coord.row < 0 || coord.row >= bobbinRows || coord.col < 0 || coord.col >= bobbinCols) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pairLabel} has out-of-bounds coordinate ${coordLabel(coord)}.`});
        } else {
          const cell = data.bobbinArea.cells[coord.row]?.[coord.col];
          if (cell?.type !== 'bobbin') { 
             messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pairLabel} involves an un-pairable cell ${coordLabel(coord)} of type "${cell?.type}".`});
          }
        }
      });

      if (isCoordEqual(pair.from, pair.to)) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pairLabel} connects a bobbin to itself.`});
      }

      const fromKey = `${pair.from.row},${pair.from.col}`;
      const toKey = `${pair.to.row},${pair.to.col}`;
      if (pairedCellCoordinates.has(fromKey)) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin at ${coordLabel(pair.from)} is part of multiple pairs.`});
      }
      pairedCellCoordinates.add(fromKey);
      if (pairedCellCoordinates.has(toKey)) {
         messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin at ${coordLabel(pair.to)} is part of multiple pairs.`});
      }
      pairedCellCoordinates.add(toKey);
    });
  }

  // Bobbin Chain Validations
  const chainedCellCoordinates = new Set<string>();
  const usedChainKeyLocations = new Set<string>();
  if (data.bobbinArea.chains) {
    data.bobbinArea.chains.forEach((chain, cIdx) => {
        const chainLabel = `Chain ${cIdx + 1}`;
        
        if(!chain.path || chain.path.length < 1) {
            messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: ${chainLabel} is empty.`});
            return;
        }

        if (!chain.keyLocation || !chain.color) {
            messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${chainLabel} is missing a linked key or key color.`});
        } else {
            const keyLoc = chain.keyLocation;
            const keyLocString = `${keyLoc.row},${keyLoc.col}`;
            const keyCell = data.bobbinArea.cells[keyLoc.row]?.[keyLoc.col];

            if (!keyCell || keyCell.has !== 'chain-key') {
                 messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin at ${coordLabel(keyLoc)} assigned to ${chainLabel} is not a 'chain-key' type.`});
            } else if (keyCell.accessoryColor !== chain.color) {
                 messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${chainLabel}'s stored color ("${chain.color}") does not match its key's color ("${keyCell.accessoryColor}") at ${coordLabel(keyLoc)}.`});
            }
            if (usedChainKeyLocations.has(keyLocString)) {
                messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Chain key at ${coordLabel(keyLoc)} is linked to multiple chains.`});
            }
            usedChainKeyLocations.add(keyLocString);
        }

        chain.path.forEach((coord, bIdx) => {
            const coordKey = `${coord.row},${coord.col}`;
            
            if (coord.row < 0 || coord.row >= bobbinRows || coord.col < 0 || coord.col >= bobbinCols) {
                messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${chainLabel} has an out-of-bounds coordinate ${coordLabel(coord)}.`});
                return;
            }

            const cell = data.bobbinArea.cells[coord.row]?.[coord.col];
            if (!cell) {
                messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Could not find cell data for coordinate ${coordLabel(coord)} in ${chainLabel}. The grid data is inconsistent.`});
                return; 
            }

            if (chainedCellCoordinates.has(coordKey)) {
                messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin ${coordLabel(coord)} is part of multiple chains.`});
            }
            chainedCellCoordinates.add(coordKey);
            if (pairedCellCoordinates.has(coordKey)) {
                messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin ${coordLabel(coord)} cannot be in both a pair and a chain.`});
            }

            if (cell.type !== 'bobbin') {
                 messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin ${coordLabel(coord)} in ${chainLabel} is of an un-chainable type "${cell.type}".`});
            }

            if (bIdx < chain.path.length - 1) {
                const nextCoord = chain.path[bIdx + 1];
                if (!areCoordsAdjacent(coord, nextCoord)) {
                    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${chainLabel} has non-adjacent bobbins between ${coordLabel(coord)} and ${coordLabel(nextCoord)}.`});
                }
            }
        });
    });
  }

  // Bobbin Pin validations
  const pinnedCellCoordinates = new Set<string>();
  const pinHeads = new Map<string, BobbinPairCoordinate>();
  const pinTails = new Map<string, BobbinPairCoordinate>();
  
  if (data.bobbinArea.pins) {
    data.bobbinArea.pins.forEach((pin, pIdx) => {
      const pinLabel = `Pin ${pIdx + 1} [${coordLabel(pin.head)} to ${coordLabel(pin.tail)}]`;
      const headKey = `${pin.head.row},${pin.head.col}`;
      const tailKey = `${pin.tail.row},${pin.tail.col}`;

      if (pinnedCellCoordinates.has(headKey) || pinnedCellCoordinates.has(tailKey)) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pinLabel} involves a bobbin that is already part of another pin.`});
      }
      pinnedCellCoordinates.add(headKey);
      pinnedCellCoordinates.add(tailKey);

      const headCell = data.bobbinArea.cells[pin.head.row]?.[pin.head.col];
      const tailCell = data.bobbinArea.cells[pin.tail.row]?.[pin.tail.col];

      if (headCell?.has !== 'pin-head') {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pinLabel} start location is not a 'pin-head'.`});
      }
       if (tailCell?.has !== 'pin-tail') {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pinLabel} end location is not a 'pin-tail'.`});
      }
    });
  }


  // Fabric Area Validations
  if (data.fabricArea.cols !== data.fabricArea.columns.length) {
    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Declared columns (${data.fabricArea.cols}) do not match actual columns array length (${data.fabricArea.columns.length}).` });
  }

  const totalFabricColorCounts = new Map<BobbinColor, number>();
  data.fabricArea.columns.forEach((column, cIdx) => {
    if (column.length > data.fabricArea.maxFabricHeight) {
      messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Column ${cIdx + 1} actual block count (${column.length}) exceeds max fabric height (${data.fabricArea.maxFabricHeight}).` });
    }
    column.forEach((block: FabricBlockData, bIdx) => { 
      if (!block.color) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Block at (Col ${cIdx + 1}, Stack pos ${bIdx + 1}) is missing a color.` });
      } else if (!LIMITED_FABRIC_COLORS.includes(block.color)) {
       // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Fabric Area: Block at (Col ${cIdx + 1}, Stack pos ${bIdx + 1}) has an undefined color "${block.color}".` });
      }
      if (block.color) { 
        totalFabricColorCounts.set(block.color, (totalFabricColorCounts.get(block.color) || 0) + 1);
      }
    });
  });

  const allFabricColorsUsed = new Set<BobbinColor>();
    data.fabricArea.columns.flat().forEach(block => {
        if (block?.color) allFabricColorsUsed.add(block.color);
    });

  allFabricColorsUsed.forEach(fc => {
    if (!allBobbinColorsPresent.has(fc)) { 
       messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Data Integrity Warning: Fabric uses color "${fc}", but no bobbin (of any type: bobbin, hidden, ice, or pipe) with this color exists in the Bobbin Area.` });
    }
  });

  AVAILABLE_COLORS.forEach(color => {
    const effectiveBobbinCount = effectiveBobbinColorCounts.get(color) || 0;
    const fabricCount = totalFabricColorCounts.get(color) || 0; 
    const expectedFabricCount = effectiveBobbinCount * 3;

    if (fabricCount !== expectedFabricCount) {
      messages.push({ 
        id: `val-${idCounter++}`, 
        type: 'error', 
        message: `Color Balance "${color}": Effective bobbin count (from bobbins and pipes: ${effectiveBobbinCount}) x 3 = ${expectedFabricCount}. Expected ${expectedFabricCount} total fabric blocks, but found ${fabricCount}.` 
      });
    }
  });


  return messages;
};
