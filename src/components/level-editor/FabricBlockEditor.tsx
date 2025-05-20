
"use client";
import React from 'react';
import type { FabricBlockData, BobbinColor } from '@/lib/types';
import { LIMITED_FABRIC_COLORS, COLOR_MAP } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FabricBlockEditorProps {
  block: FabricBlockData;
  onBlockChange: (newBlock: FabricBlockData) => void;
  onDelete: () => void;
  isLastBlock: boolean; // To prevent deleting the last block in a column
  blockIndex: number;
  columnIndex: number;
}

export const FabricBlockEditor: React.FC<FabricBlockEditorProps> = ({
  block,
  onBlockChange,
  onDelete,
  isLastBlock,
  blockIndex,
  columnIndex
}) => {
  const handleColorChange = (color: BobbinColor) => {
    onBlockChange({ ...block, color });
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-background hover:shadow-md transition-shadow">
      <div 
        className="w-6 h-6 rounded-sm flex-shrink-0"
        style={{ backgroundColor: COLOR_MAP[block.color] || block.color }}
        aria-label={`Fabric block color ${block.color}`}
      />
      <Select value={block.color} onValueChange={handleColorChange}>
        <SelectTrigger className="w-[120px] h-8 text-xs" aria-label={`Fabric block color for column ${columnIndex + 1} block ${blockIndex + 1}`}>
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          {LIMITED_FABRIC_COLORS.map(color => (
            <SelectItem key={color} value={color} className="text-xs">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLOR_MAP[color]}}></span>
                {color}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={isLastBlock && blockIndex === 0} // Disable if it's the very first block of a column
        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
        aria-label={`Delete fabric block column ${columnIndex + 1} block ${blockIndex + 1}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
