
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
  | "LightRed"
  | "Magenta"; // Added Magenta from previous step

export const FABRIC_COLORS: BobbinColor[] = ["Red", "Blue", "Green"];

export const BOBBIN_AREA_COLORS: BobbinColor[] = [
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
  "Magenta",
];

export type Difficulty = "Easy" | "Medium" | "Hard" | "VeryHard";

export interface BobbinPairCoordinate {
  row: number;
  col: number;
}

export interface BobbinPair {
  from: BobbinPairCoordinate;
  to: BobbinPairCoordinate;
}

export interface BobbinCell {
  type: "bobbin" | "pipe" | "hidden" | "empty" | "ice"; // Added 'ice'
  color?: BobbinColor; // For "bobbin", "hidden", "ice"
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
    pairs?: BobbinPair[];
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
