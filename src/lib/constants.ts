
import type {
  BobbinCell,
  FabricBlockData,
  LevelData,
  BobbinColor,
  Difficulty,
  BobbinPair,
  BobbinChain,
} from "./types";

export const DEFAULT_LEVEL_NUMBER = 1;
export const DEFAULT_DIFFICULTY: Difficulty = "Medium";
export const DEFAULT_BOBBIN_ROWS = 5;
export const DEFAULT_BOBBIN_COLS = 5;
export const DEFAULT_FABRIC_COLS = 4;
export const DEFAULT_MAX_FABRIC_HEIGHT = 8;

export const AVAILABLE_COLORS: BobbinColor[] = [
  "LightPink",
  "Pink",
  "DarkPink",
  "LightBrown",
  "Brown",
  "Orange",
  "Yellow",
  "LightYellow",
  "Teal",
  "DarkTeal",
  "YellowGreen",
  "Green",
  "DarkGreen",
  "DarkBlue",
  "Blue",
  "Lavender",
  "Violet",
  "Purple",
  "White",
  "Grey",
  "Black",
  "DarkRed",
  "Red",
  "LightRed",
];
export const LIMITED_FABRIC_COLORS: BobbinColor[] = [...AVAILABLE_COLORS];

export const createEmptyBobbinCell = (): BobbinCell => ({ type: "empty" });

export const createFabricBlock = (
  color?: BobbinColor,
  hidden: boolean = false
): FabricBlockData => ({
  color: color || LIMITED_FABRIC_COLORS[0],
  hidden,
});

export const createDefaultLevelData = (): LevelData => ({
  level: DEFAULT_LEVEL_NUMBER,
  difficulty: DEFAULT_DIFFICULTY,
  bobbinArea: {
    rows: DEFAULT_BOBBIN_ROWS,
    cols: DEFAULT_BOBBIN_COLS,
    cells: Array(DEFAULT_BOBBIN_ROWS)
      .fill(null)
      .map(() =>
        Array(DEFAULT_BOBBIN_COLS).fill(null).map(createEmptyBobbinCell)
      ),
    pairs: [], 
    chains: [],
    pins: [],
  },
  fabricArea: {
    cols: DEFAULT_FABRIC_COLS,
    maxFabricHeight: DEFAULT_MAX_FABRIC_HEIGHT,
    columns: Array(DEFAULT_FABRIC_COLS)
      .fill(null)
      .map(() => []),
  },
});

export const EXAMPLE_LEVEL_DATA: LevelData = {
  level: 1,
  difficulty: "Easy",
  bobbinArea: {
    rows: 7,
    cols: 7,
    cells: [
      [
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
      ],
      [
        { type: "bobbin", color: "Blue", has: "key", accessoryColor: "Blue" },
        { type: "bobbin", color: "Red"},
        { type: "empty" },
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Red", hidden: true },
        { type: "bobbin", color: "Green" },
      ],
      [
        { type: "empty" },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "empty" },
        { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "pipe", colors: ["Red", "Blue", "Green"] },
        { type: "bobbin", color: "Blue", has: "lock", accessoryColor: "Blue" },
        { type: "bobbin", color: "Green", hidden: true },
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "pipe", colors: ["Red", "Blue", "Green"] },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red", hidden: true },
      ],
      [
        { type: "pipe", colors: ["Red", "Blue", "Green"] },
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "empty" },
        { type: "bobbin", color: "Blue" },
      ],
      [
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "empty" },
        { type: "bobbin", color: "Blue" },
        { type: "bobbin", color: "Green" },
        { type: "bobbin", color: "Red" },
        { type: "bobbin", color: "Blue", has: "chain-key", hidden: true, accessoryColor: 'Purple' },
      ],
    ],
    pairs: [
      { from: { row: 0, col: 1 }, to: { row: 3, col: 4 } },
    ],
    chains: [
      {
        path: [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
        keyLocation: { row: 6, col: 6},
        color: 'Purple',
      }
    ],
    pins: [],
  },
  fabricArea: {
    cols: 4,
    maxFabricHeight: 8,
    columns: [
      [
        { color: "Red", hidden: false },
        { color: "Green" },
        { color: "Red" },
        { color: "Red" },
        { color: "Blue", hidden: true },
        { color: "Green" },
        { color: "Red" },
        { color: "Blue" },
      ].slice(0, 8),
      [
        { color: "Blue" },
        { color: "Green" },
        { color: "Red", hidden: false },
      ].slice(0, 8),
      [
        { color: "Green" },
        { color: "Red" },
        { color: "Red" },
        { color: "Green" },
        { color: "Red", hidden: true },
        { color: "Blue" },
      ].slice(0, 8),
      [],
    ].map((col) =>
      col
        .filter((block) => block !== null)
        .map((b) => ({
          ...b,
          hidden: b.hidden === undefined ? false : b.hidden,
        }))
    ),
  },
};


export const COLOR_MAP: Record<string, string> = {
  LightPink: "hsl(var(--knitout-light-pink))",
  Pink: "hsl(var(--knitout-pink))",
  DarkPink: "hsl(var(--knitout-dark-pink))",
  LightBrown: "hsl(var(--knitout-light-brown))",
  Brown: "hsl(var(--knitout-brown))",
  Orange: "hsl(var(--knitout-orange))",
  Yellow: "hsl(var(--knitout-yellow))",
  LightYellow: "hsl(var(--knitout-light-yellow))",
  Teal: "hsl(var(--knitout-teal))",
  DarkTeal: "hsl(var(--knitout-dark-teal))",
  YellowGreen: "hsl(var(--knitout-yellow-green))",
  Green: "hsl(var(--knitout-green))",
  DarkGreen: "hsl(var(--knitout-dark-green))",
  DarkBlue: "hsl(var(--knitout-dark-blue))",
  Blue: "hsl(var(--knitout-blue))",
  Lavender: "hsl(var(--knitout-lavender))",
  Violet: "hsl(var(--knitout-violet))",
  Purple: "hsl(var(--knitout-purple))",
  White: "hsl(var(--knitout-white))",
  Grey: "hsl(var(--knitout-grey))",
  Black: "hsl(var(--knitout-black))",
  DarkRed: "hsl(var(--knitout-dark-red))",
  Red: "hsl(var(--knitout-red))",
  LightRed: "hsl(var(--knitout-light-red))",
};

export const LINKING_LINE_COLOR = "hsl(var(--primary))"; 
export const CHAIN_LINE_COLOR = "hsl(var(--accent))";
export const CHAIN_KEY_LINK_COLOR = "hsl(var(--knitout-teal))";
export const PIN_LINE_COLOR = "hsl(var(--knitout-grey))";
