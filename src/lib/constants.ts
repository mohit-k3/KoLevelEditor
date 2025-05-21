
import type { BobbinCell, FabricBlockData, LevelData, BobbinColor } from './types';

export const DEFAULT_LEVEL_NUMBER = 1;
export const DEFAULT_BOBBIN_ROWS = 5;
export const DEFAULT_BOBBIN_COLS = 5;
export const DEFAULT_FABRIC_COLS = 4;
export const DEFAULT_MAX_FABRIC_HEIGHT = 8;

export const AVAILABLE_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Cyan'];
export const LIMITED_FABRIC_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Cyan'];

export const createEmptyBobbinCell = (): BobbinCell => ({ type: 'empty' });
// Creates an actual fabric block object
export const createFabricBlock = (color?: BobbinColor): FabricBlockData => ({ color: color || LIMITED_FABRIC_COLORS[0] });

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
      .map(() => []), // Initialize with empty arrays for sparse columns
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
    // Fabric columns are now sparse, blocks listed bottom-up
    columns: [
      [{ color: "Red" }, { color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Blue" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }].slice(0,8), // Example: All 8 blocks
      [{ color: "Blue" }, { color: "Green" }, { color: "Red" }].slice(0,8), // Example: 3 blocks
      [{ color: "Green" }, { color: "Red" }, { color: "Red" }, { color: "Green" }, { color: "Red" }, { color: "Blue" }].slice(0,8), // Example: 6 blocks
      [], // Example: Empty column
    ].map(col => col.filter(block => block !== null)), // Ensure no nulls from slicing if example was shorter
  },
};


export const COLOR_MAP: Record<BobbinColor, string> = {
  Red: 'hsl(var(--knitout-red))',
  Blue: 'hsl(var(--knitout-blue))',
  Green: 'hsl(var(--knitout-green))',
  Yellow: 'hsl(var(--knitout-yellow))',
  Purple: 'hsl(var(--knitout-purple))',
  Orange: 'hsl(var(--knitout-orange))',
  Pink: 'hsl(var(--knitout-pink))',
  Brown: 'hsl(var(--knitout-brown))',
  Cyan: 'hsl(var(--knitout-cyan))',
};
