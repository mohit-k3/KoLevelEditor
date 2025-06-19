
import type { LevelData, ValidationMessage, BobbinColor, FabricBlockData, Difficulty, BobbinPairCoordinate } from './types';
import { AVAILABLE_COLORS, LIMITED_FABRIC_COLORS } from './constants';

const VALID_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

function isCoordEqual(c1: BobbinPairCoordinate, c2: BobbinPairCoordinate): boolean {
  return c1.row === c2.row && c1.col === c2.col;
}

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

  data.bobbinArea.cells.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const cellPos = `(R${rIdx + 1}, C${cIdx + 1})`;

      if (cell.type === 'bobbin' || cell.type === 'hidden' || cell.type === 'ice') {
        if (!cell.color) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Cell ${cellPos} of type "${cell.type}" is missing a color.` });
        } else if (!AVAILABLE_COLORS.includes(cell.color) && !/^#[0-9A-Fa-f]{6}$/.test(cell.color)) {
          // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Cell ${cellPos} has an undefined color "${cell.color}".` });
        }
        if (cell.color) {
          allBobbinColorsPresent.add(cell.color);
          effectiveBobbinColorCounts.set(cell.color, (effectiveBobbinColorCounts.get(cell.color) || 0) + 1);
        }
      }
      if (cell.type === 'pipe') {
        if (!cell.colors || cell.colors.length < 2) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellPos} must specify at least 2 colors.` });
        } else if (cell.colors.length > 5) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellPos} cannot have more than 5 colors.` });
        }
        cell.colors?.forEach(pipeColor => {
          if (!AVAILABLE_COLORS.includes(pipeColor) && !/^#[0-9A-Fa-f]{6}$/.test(pipeColor)) {
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
  

  // Bobbin Pair Validations
  if (data.bobbinArea.pairs) {
    data.bobbinArea.pairs.forEach((pair, pIdx) => {
      const pairLabel = `Pair ${pIdx + 1} [(${pair.from.row + 1},${pair.from.col + 1}) to (${pair.to.row + 1},${pair.to.col + 1})]`;

      [pair.from, pair.to].forEach(coord => {
        if (coord.row < 0 || coord.row >= bobbinRows || coord.col < 0 || coord.col >= bobbinCols) {
          messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pairLabel} has out-of-bounds coordinate (R${coord.row + 1},C${coord.col + 1}).`});
        } else {
          const cell = data.bobbinArea.cells[coord.row]?.[coord.col];
          if (cell?.type !== 'bobbin' && cell?.type !== 'hidden') { 
             messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: ${pairLabel} involves a non-bobbin/hidden cell (R${coord.row+1},C${coord.col+1}) of type "${cell?.type}". Only bobbins or hidden bobbins should be paired.`});
          }
        }
      });

      if (isCoordEqual(pair.from, pair.to)) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: ${pairLabel} connects a bobbin to itself.`});
      }

      const fromKey = `${pair.from.row},${pair.from.col}`;
      const toKey = `${pair.to.row},${pair.to.col}`;
      if (pairedCellCoordinates.has(fromKey)) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin at (R${pair.from.row+1},C${pair.from.col+1}) is part of multiple pairs.`});
      }
      pairedCellCoordinates.add(fromKey);
      if (pairedCellCoordinates.has(toKey)) {
         messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Bobbin at (R${pair.to.row+1},C${pair.to.col+1}) is part of multiple pairs.`});
      }
      pairedCellCoordinates.add(toKey);
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
      } else if (!LIMITED_FABRIC_COLORS.includes(block.color) && !/^#[0-9A-Fa-f]{6}$/.test(block.color)) {
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
        message: `Color Balance "${color}": Effective bobbin count (from bobbins, hidden, ice, and pipes: ${effectiveBobbinCount}) x 3 = ${expectedFabricCount}. Expected ${expectedFabricCount} total fabric blocks, but found ${fabricCount}.` 
      });
    }
  });


  return messages;
};
