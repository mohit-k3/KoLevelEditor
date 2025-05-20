export type BobbinColor = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple' | string; // Allow custom string for flexibility
export const FABRIC_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green'];
export const BOBBIN_AREA_COLORS: BobbinColor[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

export interface BobbinCell {
  type: "bobbin" | "pipe" | "hidden" | "empty";
  color?: BobbinColor; // For "bobbin", "hidden"
  colors?: BobbinColor[]; // For "pipe"
}

export interface FabricBlockData {
  color: BobbinColor;
}

export interface LevelData {
  level: number;
  bobbinArea: {
    rows: number;
    cols: number;
    cells: BobbinCell[][];
  };
  fabricArea: {
    cols: number;
    maxFabricHeight: number;
    columns: FabricBlockData[][];
  };
}

export interface ValidationMessage {
  id: string;
  type: 'error' | 'warning';
  message: string;
}
