
"use client";
import React from 'react';
import type { BobbinCell, BobbinColor } from '@/lib/types';
import { AVAILABLE_COLORS, COLOR_MAP } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { NumberSpinner } from '@/components/shared/NumberSpinner';
import { cn } from '@/lib/utils';
import { useLevelData } from '@/contexts/LevelDataContext';
import { EyeOffIcon, SnowflakeIcon, LockIcon, KeyIcon, KeySquare } from 'lucide-react'; 


interface BobbinCellEditorProps {
  cell: BobbinCell;
  onCellChange: (newCell: BobbinCell) => void;
  rowIndex: number;
  colIndex: number;
  isLinkingMode: boolean;
  onLinkClick: (rowIndex: number, colIndex: number) => void;
  isSelectedForLinking: boolean;
  isActuallyLinked: boolean;
  isChainingMode: boolean;
  onChainClick: (rowIndex: number, colIndex: number) => void;
  isActuallyInChain: boolean;
  isSelectedChain: boolean;
  isChainAwaitingKeyLink?: boolean;
}

const cellTypeDisplay: Record<BobbinCell['type'], string> = {
  bobbin: "Bobbin",
  pipe: "Pipe",
  hidden: "Hidden",
  empty: "Empty",
  ice: "Frozen", 
};

const MAX_PIPE_COLORS = 5; 

export const BobbinCellEditor: React.FC<BobbinCellEditorProps> = ({ 
  cell, 
  onCellChange, 
  rowIndex, 
  colIndex,
  isLinkingMode,
  onLinkClick,
  isSelectedForLinking,
  isActuallyLinked,
  isChainingMode,
  onChainClick,
  isActuallyInChain,
  isSelectedChain,
  isChainAwaitingKeyLink
}) => {
  const { setActiveEditorArea } = useLevelData();

  const handleTypeChange = (newType: BobbinCell['type']) => {
    const newCellData: BobbinCell = { type: newType, has: cell.has };
    if (newType === 'bobbin' || newType === 'hidden' || newType === 'ice') { 
      newCellData.color = cell.color || AVAILABLE_COLORS[0];
    } else if (newType === 'pipe') {
      if (cell.type === 'pipe' && cell.colors && cell.colors.length >= 2) {
        newCellData.colors = cell.colors.slice(0, MAX_PIPE_COLORS); 
      } else {
        newCellData.colors = [AVAILABLE_COLORS[0], AVAILABLE_COLORS[1]];
      }
      delete newCellData.has; // Pipes cannot have lock/key
    } else {
       delete newCellData.has; // Empty cannot have lock/key
    }
    onCellChange(newCellData);
  };

  const handleColorChange = (color: BobbinColor) => {
    onCellChange({ ...cell, color });
  };
  
  const handleHasChange = (newHas: 'lock' | 'key' | 'chain-key' | 'none') => {
    const newCell = {...cell};
    if (newHas === 'none') {
      delete newCell.has;
    } else {
      newCell.has = newHas;
    }
    onCellChange(newCell);
  }

  const actualNumPipeColors = (cell.type === 'pipe' && cell.colors && cell.colors.length >= 2) 
    ? cell.colors.length 
    : 2;

  const handleNumPipeColorsChange = (newNum: number) => {
    const newCount = Math.max(2, Math.min(newNum, MAX_PIPE_COLORS));
    const currentColors = (cell.type === 'pipe' && cell.colors) ? cell.colors : [];
    const updatedColors: BobbinColor[] = Array(newCount).fill(null).map((_, i) => {
      return currentColors[i] || AVAILABLE_COLORS[i % AVAILABLE_COLORS.length];
    });
    onCellChange({ ...cell, type: 'pipe', colors: updatedColors });
  };

  const handleIndividualPipeColorChange = (index: number, newColor: BobbinColor) => {
    if (cell.type === 'pipe' && cell.colors) {
      const newColors = [...cell.colors];
      newColors[index] = newColor;
      onCellChange({ ...cell, type: 'pipe', colors: newColors });
    }
  };

  const getCellDisplay = () => {
    const iconClass = "w-4 h-4 text-white mix-blend-difference";
    const accessoryIconClass = "absolute top-0.5 right-0.5 w-3 h-3 text-black/70 bg-white/50 rounded-full p-0.5"

    const accessory = cell.has === 'lock' ? <LockIcon className={accessoryIconClass} />
                    : cell.has === 'key' ? <KeyIcon className={accessoryIconClass} />
                    : cell.has === 'chain-key' ? <KeySquare className={accessoryIconClass} />
                    : null;

    switch (cell.type) {
      case 'bobbin':
      case 'hidden':
        return (
          <div
            className={cn(
              "w-full h-full rounded-sm flex items-center justify-center relative",
              cell.type === 'hidden' && 'opacity-50'
            )}
            style={{ backgroundColor: cell.color ? COLOR_MAP[cell.color] : 'transparent' }}
            aria-label={`${cellTypeDisplay[cell.type]} cell, color ${cell.color || 'none'}`}
          >
            {cell.type === 'bobbin' && <SpoolIcon className={iconClass} />}
            {cell.type === 'hidden' && <EyeOffIcon className={iconClass} />}
            {accessory}
          </div>
        );
      case 'ice': 
        return (
          <div
            className="w-full h-full rounded-sm flex items-center justify-center relative"
            style={{ backgroundColor: cell.color ? COLOR_MAP[cell.color] : 'transparent' }}
            aria-label={`${cellTypeDisplay[cell.type]} cell, color ${cell.color || 'none'}`}
          >
            <SnowflakeIcon className={iconClass} />
            {accessory}
          </div>
        );
      case 'pipe':
        return (
          <div 
            className="w-full h-full rounded-sm border-2 flex items-center justify-center"
            style={{ 
              borderColor: cell.colors && cell.colors.length > 0 ? COLOR_MAP[cell.colors[0]] : 'hsl(var(--border))',
              boxShadow: cell.colors && cell.colors.length > 1 ? `0 0 0 2px ${COLOR_MAP[cell.colors[1]]} inset` : 'none'
            }}
            aria-label={`Pipe cell, colors ${cell.colors?.join(', ') || 'none'}`}
          >
             <svg viewBox="0 0 10 10" className="w-4 h-4"><circle cx="5" cy="5" r="2" fill="currentColor" /></svg>
          </div>
        );
      case 'empty':
      default:
        return <div className="w-full h-full bg-muted rounded-sm" aria-label="Empty cell"></div>;
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLinkingMode) {
      event.preventDefault(); 
      onLinkClick(rowIndex, colIndex);
    } else if (isChainingMode) {
      event.preventDefault();
      onChainClick(rowIndex, colIndex);
    } else {
      setActiveEditorArea('bobbin'); 
    }
  };
  
  const canHaveAccessory = cell.type === 'bobbin' || cell.type === 'hidden' || cell.type === 'ice';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-12 h-12 p-0 m-0.5 aspect-square focus:ring-2 focus:ring-ring focus:ring-offset-2 relative",
            (isLinkingMode || isChainingMode) && "cursor-crosshair hover:bg-accent/20",
            isSelectedForLinking && "ring-2 ring-accent ring-offset-background shadow-lg",
            isActuallyLinked && !isSelectedForLinking && "border-primary/50 border-2",
            isActuallyInChain && !isSelectedChain && "border-accent/50 border-2",
            isSelectedChain && "ring-2 ring-accent ring-offset-background shadow-lg",
            isChainAwaitingKeyLink && "ring-2 ring-blue-500 ring-offset-background shadow-lg"
          )}
          aria-label={`Edit cell at row ${rowIndex + 1}, column ${colIndex + 1}. Current type: ${cellTypeDisplay[cell.type]}${isLinkingMode ? '. Linking mode active.' : ''}${isActuallyLinked ? ' Linked.' : ''}`}
          onClick={handleButtonClick}
        >
          {getCellDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 space-y-4">
        <h4 className="font-medium leading-none">Edit Cell ({rowIndex+1}, {colIndex+1})</h4>
        <div>
          <Label className="text-sm font-medium">Type</Label>
          <RadioGroup
            value={cell.type}
            onValueChange={(value) => handleTypeChange(value as BobbinCell['type'])}
            className="mt-1 grid grid-cols-2 gap-2"
          >
            {(['bobbin', 'pipe', 'hidden', 'empty', 'ice'] as BobbinCell['type'][]).map(type => ( 
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`type-${type}-${rowIndex}-${colIndex}`} />
                <Label htmlFor={`type-${type}-${rowIndex}-${colIndex}`} className="text-sm">{cellTypeDisplay[type]}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {canHaveAccessory && (
          <div>
            <Label className="text-sm font-medium">Accessory</Label>
             <RadioGroup
              value={cell.has || 'none'}
              onValueChange={(value) => handleHasChange(value as 'lock' | 'key' | 'chain-key' | 'none')}
              className="mt-1 grid grid-cols-3 gap-2"
            >
              {(['none', 'lock', 'key', 'chain-key'] as const).map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <RadioGroupItem value={item} id={`has-${item}-${rowIndex}-${colIndex}`} />
                  <Label htmlFor={`has-${item}-${rowIndex}-${colIndex}`} className="text-sm capitalize">{item.replace('-', ' ')}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {(cell.type === 'bobbin' || cell.type === 'hidden' || cell.type === 'ice') && ( 
          <div>
            <Label htmlFor={`color-${rowIndex}-${colIndex}`} className="text-sm font-medium">Color</Label>
            <ColorPicker
              id={`color-${rowIndex}-${colIndex}`}
              color={cell.color || AVAILABLE_COLORS[0]}
              onChange={handleColorChange}
              availableColors={AVAILABLE_COLORS}
              className="mt-1"
            />
          </div>
        )}
        
        {cell.type === 'pipe' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`num-pipe-colors-${rowIndex}-${colIndex}`} className="text-sm font-medium">
                Number of Colors (2-{MAX_PIPE_COLORS})
              </Label>
              <NumberSpinner
                id={`num-pipe-colors-${rowIndex}-${colIndex}`}
                label="" 
                value={actualNumPipeColors}
                onChange={handleNumPipeColorsChange}
                min={2}
                max={MAX_PIPE_COLORS}
                className="mt-1 w-full"
              />
            </div>
            {(!cell.colors || cell.colors.length < 2) && (
                 <p className="text-xs text-destructive">Pipe must have at least 2 colors.</p>
            )}
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <Label className="text-sm font-medium">Pipe Colors</Label>
              {cell.colors && Array.from({ length: actualNumPipeColors }).map((_, i) => (
                <div key={`pipe-color-picker-${i}`} className="space-y-1">
                  <Label htmlFor={`pipe-color-${i}-${rowIndex}-${colIndex}`} className="text-xs">
                    Color {i + 1}
                  </Label>
                  <ColorPicker
                    id={`pipe-color-${i}-${rowIndex}-${colIndex}`}
                    color={cell.colors?.[i] || AVAILABLE_COLORS[0]}
                    onChange={(newColor) => handleIndividualPipeColorChange(i, newColor)}
                    availableColors={AVAILABLE_COLORS}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

function SpoolIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h16" />
      <path d="M4 16h16" />
      <ellipse cx="12" cy="12" rx="8" ry="4" />
      <path d="M8 7.5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H10c-1.1 0-2-.9-2-2V7.5Z" />
    </svg>
  );
}
