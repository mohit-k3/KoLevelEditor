
"use client";
import React from 'react';
import type { FabricBlockData, BobbinColor } from '@/lib/types';
import { COLOR_MAP, createFabricBlock, LIMITED_FABRIC_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PopoverClose } from '@radix-ui/react-popover';


interface FabricBlockPopoverProps {
  blockData: FabricBlockData | null | undefined; // Allow undefined for truly empty slots
  colIndex: number; 
  rowIndexInVisualizer: number; 
  onBlockChange: (newBlockData: FabricBlockData | null) => void;
}

export const FabricBlockPopover: React.FC<FabricBlockPopoverProps> = ({
  blockData,
  colIndex,
  rowIndexInVisualizer,
  onBlockChange,
}) => {
  const handleColorSelect = (color: BobbinColor) => {
    onBlockChange(createFabricBlock(color));
  };

  const handleRemoveBlock = () => {
    onBlockChange(null);
  };

  const currentBlockExists = blockData !== null && blockData !== undefined;

  return (
    <div className="space-y-3 p-1">
      <h4 className="font-medium text-sm leading-none">
        Edit Block (C{colIndex + 1}, R{rowIndexInVisualizer + 1})
      </h4>
      <div>
        <Label className="text-xs font-medium">Color</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {LIMITED_FABRIC_COLORS.map((color) => (
            <PopoverClose asChild key={color}>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full relative"
                style={{ backgroundColor: COLOR_MAP[color] || color }}
                onClick={() => handleColorSelect(color)}
                aria-label={`Select color ${color}`}
              >
                {currentBlockExists && blockData?.color === color && (
                  <Check className="h-4 w-4 text-white mix-blend-difference" />
                )}
              </Button>
            </PopoverClose>
          ))}
        </div>
      </div>
      {currentBlockExists && (
        <div>
          <PopoverClose asChild>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleRemoveBlock}
            >
              <Trash2 className="mr-2 h-3 w-3" /> Remove Block
            </Button>
          </PopoverClose>
        </div>
      )}
    </div>
  );
};
