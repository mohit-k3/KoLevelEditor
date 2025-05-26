
export type BobbinColor = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple' | string; // Allow custom string for flexibility
export const FABRIC_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green'];
export const BOBBIN_AREA_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

export type Difficulty = 'easy' | 'medium' | 'hard';

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
