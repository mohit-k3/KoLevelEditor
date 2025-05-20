import type { LevelData, ValidationMessage, BobbinColor } from './types';
import { AVAILABLE_COLORS } from './constants';

export const validateLevelData = (data: LevelData): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  let idCounter = 0;

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
  data.bobbinArea.cells.flat().forEach((cell, cellIdx) => {
    if (cell.type === 'bobbin' || cell.type === 'hidden') {
      if (!cell.color) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Cell ${cellIdx + 1} of type "${cell.type}" is missing a color.` });
      } else if (!AVAILABLE_COLORS.includes(cell.color) && !/^#[0-9A-Fa-f]{6}$/.test(cell.color)) {
         // Allow hex colors, otherwise check against predefined list
        // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Cell ${cellIdx + 1} has an undefined color "${cell.color}".` });
      }
      if (cell.color && cell.type === 'bobbin') {
        allBobbinColors.add(cell.color);
      }
    }
    if (cell.type === 'pipe') {
      if (!cell.colors || cell.colors.length < 2) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Bobbin Area: Pipe cell ${cellIdx + 1} must specify at least 2 colors.` });
      }
      cell.colors?.forEach(color => {
        if (!AVAILABLE_COLORS.includes(color) && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
         // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Bobbin Area: Pipe cell ${cellIdx + 1} has an undefined color "${color}".` });
        }
      });
    }
  });
  
  // Check if at least one bobbin of each color used in fabric area exists
  const fabricColorsUsed = new Set<BobbinColor>();
  data.fabricArea.columns.flat().forEach(block => fabricColorsUsed.add(block.color));

  fabricColorsUsed.forEach(fc => {
    if (!allBobbinColors.has(fc)) {
       messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Validation: No bobbin of color "${fc}" found, but it's used in the fabric area.` });
    }
  })


  // Fabric Area Validations
  if (data.fabricArea.cols !== data.fabricArea.columns.length) {
    messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Declared columns (${data.fabricArea.cols}) do not match actual columns (${data.fabricArea.columns.length}).` });
  }
  data.fabricArea.columns.forEach((column, cIdx) => {
    if (column.length > data.fabricArea.maxFabricHeight) {
      messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Column ${cIdx + 1} height (${column.length}) exceeds max fabric height (${data.fabricArea.maxFabricHeight}).` });
    }
    column.forEach((block, bIdx) => {
      if (!block.color) {
        messages.push({ id: `val-${idCounter++}`, type: 'error', message: `Fabric Area: Block ${bIdx + 1} in column ${cIdx + 1} is missing a color.` });
      } else if (!AVAILABLE_COLORS.includes(block.color) && !/^#[0-9A-Fa-f]{6}$/.test(block.color)) {
       // messages.push({ id: `val-${idCounter++}`, type: 'warning', message: `Fabric Area: Block ${bIdx + 1} in column ${cIdx + 1} has an undefined color "${block.color}".` });
      }
    });
  });

  return messages;
};
