
export type BobbinColor =
  | "LightPink"
  | "Pink"
  | "DarkPink"
  | "LightBrown"
  | "Brown"
  | "Orange"
  | "Yellow"
  | "LightYellow"
  | "Teal"
  | "DarkTeal"
  | "YellowGreen"
  | "Green"
  | "DarkGreen"
  | "DarkBlue"
  | "Blue"
  | "Lavender"
  | "Violet"
  | "Purple"
  | "White"
  | "Grey"
  | "Black"
  | "DarkRed"
  | "Red"
  | "LightRed";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface BobbinPairCoordinate {
  row: number;
  col: number;
}

export interface BobbinPair {
  from: BobbinPairCoordinate;
  to: BobbinPairCoordinate;
}

export interface BobbinChain {
  path: BobbinPairCoordinate[];
  keyLocation: BobbinPairCoordinate | null;
}

export interface BobbinCell {
  type: "bobbin" | "pipe" | "hidden" | "empty" | "ice";
  color?: BobbinColor; // For "bobbin", "hidden", "ice"
  colors?: BobbinColor[]; // For "pipe"
  has?: 'lock' | 'key' | 'chain-key';
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
    pairs?: BobbinPair[];
    chains?: BobbinChain[];
  };
  fabricArea: {
    cols: number;
    maxFabricHeight: number;
    columns: FabricBlockData[][];
  };
}

export interface ValidationMessage {
  id: string;
  type: "error" | "warning";
  message: string;
}
