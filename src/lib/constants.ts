import type { BobbinCell, FabricBlockData, LevelData, BobbinColor } from './types';

export const DEFAULT_LEVEL_NUMBER = 1;
export const DEFAULT_BOBBIN_ROWS = 5;
export const DEFAULT_BOBBIN_COLS = 5;
export const DEFAULT_FABRIC_COLS = 4;
export const DEFAULT_MAX_FABRIC_HEIGHT = 8;

export const AVAILABLE_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];
export const LIMITED_FABRIC_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

export const createEmptyBobbinCell = (): BobbinCell => ({ type: 'empty' });
export const createEmptyFabricBlock = (): FabricBlockData => ({ color: LIMITED_FABRIC_COLORS[0] });

export const createDefaultLevelData = (): LevelData => ({
  level: DEFAULT_LEVEL_NUMBER,
  bobbinArea: {
    rows: DEFAULT_BOBBIN_ROWS,
    cols: DEFAULT_BOBBIN_COLS,
    cells: Array(DEFAULT_BOBBIN_ROWS)
      .fill(null)
      .map(() => Array(DEFAULT_BOBBIN_COLS).fill(null).map(createEmptyBobbinCell)),
  },
  fabricArea: {
    cols: DEFAULT_FABRIC_COLS,
    maxFabricHeight: DEFAULT_MAX_FABRIC_HEIGHT,
    columns: Array(DEFAULT_FABRIC_COLS)
      .fill(null)
      .map(() => [createEmptyFabricBlock()]), // Start with one block per column
  },
});

export const EXAMPLE_LEVEL_DATA: LevelData = {
  level: 1,
  bobbinArea: {
    rows: 7,
    cols: 7,
    cells: [
      [
        { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" },
      ],
      [
        { type: "bobbin", color: "Blue" }, { type: "empty" }, { type: "empty" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "hidden", color: "Red" }, { type: "bobbin", color: "Green" },
      ],
      [
        { type: "empty" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "empty" }, { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "pipe", colors: ["Red", "Blue", "Green"] }, { type: "bobbin", color: "Blue" }, { type: "hidden", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "pipe", colors: ["Red", "Blue", "Green"] }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "hidden", color: "Red" },
      ],
      [
        { type: "pipe", colors: ["Red", "Blue", "Green"] }, { type: "bobbin", color: "Red" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "empty" }, { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "empty" }, { type: "bobbin", color: "Blue" }, { type: "bobbin", color: "Green" }, { type: "bobbin", color: "Red" }, { type: "hidden", color: "Blue" },
      ],
    ],
  },
  fabricArea: {
    cols: 4,
    maxFabricHeight: 8,
    columns: [
      [ { color: "Red" }, { color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }, ],
      [ { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Red" }, ],
      [ { color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Green" }, ],
      [ { color: "Red" }, { color: "Blue" }, { color: "Red" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Red" }, ],
    ],
  },
};

export const COLOR_MAP: Record<BobbinColor, string> = {
  Red: 'hsl(var(--knitout-red))',
  Blue: 'hsl(var(--knitout-blue))',
  Green: 'hsl(var(--knitout-green))',
  Yellow: 'hsl(var(--knitout-yellow))',
  Purple: 'hsl(var(--knitout-purple))',
};
