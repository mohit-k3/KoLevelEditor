
export type BobbinColor = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple' | 'Orange' | 'Pink' | 'Brown' | 'Teal' | 'White' | 'DarkGreen' | 'Gray' | 'Black' | 'Magenta';
export const FABRIC_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green'];
// Updated to match AVAILABLE_COLORS from constants.ts if they should be the same
export const BOBBIN_AREA_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Teal', 'White', 'DarkGreen', 'Gray', 'Black', 'Magenta'];

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface BobbinPairCoordinate {
  row: number;
  col: number;
}

export interface BobbinPair {
  from: BobbinPairCoordinate;
  to: BobbinPairCoordinate;
}

export interface BobbinCell {
  type: "bobbin" | "pipe" | "hidden" | "empty";
  color?: BobbinColor; // For "bobbin", "hidden"
  colors?: BobbinColor[]; // For "pipe"
}

export interface FabricBlockData {
  color: BobbinColor;
  hidden?: boolean;
}

export interface LevelData {
  level: number;
  difficulty: Difficulty;
  bobbinArea: {
    rows: number;
    cols: number;
    cells: BobbinCell[][];
    pairs?: BobbinPair[]; // Added for bobbin pairing
  };
  fabricArea: {
    cols: number;
    maxFabricHeight: number;
    columns: FabricBlockData[][]; // Each column array contains only actual blocks, sparse
  };
}

export interface ValidationMessage {
  id: string;
  type: 'error' | 'warning';
  message: string;
}
