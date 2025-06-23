
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
  color?: BobbinColor;
}

export interface BobbinPin {
  head: BobbinPairCoordinate;
  tail: BobbinPairCoordinate;
}

export interface BobbinCell {
  type: "bobbin" | "pipe" | "empty";
  color?: BobbinColor; // For "bobbin"
  colors?: BobbinColor[]; // For "pipe"
  has?: 'lock' | 'key' | 'chain-key' | 'pin-head' | 'pin-tail';
  accessoryColor?: BobbinColor; // For "lock", "key", and "chain-key"
  hidden?: boolean; // For "bobbin"
  ice?: boolean; // For "bobbin"
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
    pins?: BobbinPin[];
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
