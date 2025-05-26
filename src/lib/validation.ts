
import type { LevelData, ValidationMessage, BobbinColor, FabricBlockData, Difficulty } from './types';
import { AVAILABLE_COLORS, LIMITED_FABRIC_COLORS } from './constants';

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

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
  if (data.bobbinArea.rows !== data.bobbinArea.cells.length) {
    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Declared rows (${data.bobbinArea.rows}) do not match actual cell rows (${data.bobbinArea.cells.length}).` });
  }
  data.bobbinArea.cells.forEach((row, rIdx) => {
    if (data.bobbinArea.cols !== row.length) {
      messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Row ${rIdx + 1} declared columns (${data.bobbinArea.cols}) do not match actual cells (${row.length}).` });
    }
  });

  const allBobbinColors = new Set<BobbinColor>();
  data.bobbinArea.cells.flat().forEach((cell, flatIdx) => {
    const rIdx = Math.floor(flatIdx / data.bobbinArea.cols);
    const cIdx = flatIdx % data.bobbinArea.cols;
    const cellPos = `(R${rIdx + 1}, C${cIdx + 1})`;

    if (cell.type === 'bobbin' || cell.type === 'hidden') {
      if (!cell.color) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Cell ${cellPos} of type "${cell.type}" is missing a color.` });
      } else if (!AVAILABLE_COLORS.includes(cell.color) && !/^#[0-9A-Fa-f]{6}$/.test(cell.color)) {
        // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Cell ${cellPos} has an undefined color "${cell.color}".` });
      }
      if (cell.color && cell.type === 'bobbin') {
        allBobbinColors.add(cell.color);
      }
    }
    if (cell.type === 'pipe') {
      if (!cell.colors || cell.colors.length < 2) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellPos} must specify at least 2 colors.` });
      } else if (cell.colors.length > 5) { // Max 5 colors for a pipe
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellPos} cannot have more than 5 colors.` });
      }
      cell.colors?.forEach(color => {
        if (!AVAILABLE_COLORS.includes(color) && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
         // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Pipe cell ${cellPos} has an undefined color "${color}".` });
        }
      });
    }
  });
  
  // Fabric Area Validations
  if (data.fabricArea.cols !== data.fabricArea.columns.length) {
    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Declared columns (${data.fabricArea.cols}) do not match actual columns array length (${data.fabricArea.columns.length}).` });
  }

  const fabricColorsUsed = new Set<BobbinColor>();
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
        fabricColorsUsed.add(block.color);
      }
    });
  });
  
  // Check if at least one bobbin of each color used in fabric area exists
  fabricColorsUsed.forEach(fc => {
    if (!allBobbinColors.has(fc)) {
       messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Data Integrity: No bobbin of color "${fc}" found in Bobbin Area, but it's used in the Fabric Area.` });
    }
  });

  return messages;
};
