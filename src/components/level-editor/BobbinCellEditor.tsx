
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
import { SnowflakeIcon, LockIcon, KeyIcon, KeySquare, Pin, Target, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'; 
import { Checkbox } from '../ui/checkbox';


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
  isPinningMode: boolean;
  onPinClick: (rowIndex: number, colIndex: number) => void;
  isPinHead: boolean;
  isPinTail: boolean;
  isSelectedForPinning: boolean;
  isCurtainingMode: boolean;
  onCurtainClick: (rowIndex: number, colIndex: number) => void;
  isActuallyInCurtain: boolean;
  isSelectedForCurtaining: boolean;
}

const cellTypeDisplay: Record<BobbinCell['type'], string> = {
  bobbin: "Bobbin",
  pipe: "Pipe",
  empty: "Empty",
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
  isChainAwaitingKeyLink,
  isPinningMode,
  onPinClick,
  isPinHead,
  isPinTail,
  isSelectedForPinning,
  isCurtainingMode,
  onCurtainClick,
  isActuallyInCurtain,
  isSelectedForCurtaining,
}) => {
  const { setActiveEditorArea } = useLevelData();

  const handleTypeChange = (newType: BobbinCell['type']) => {
    const newCellData: BobbinCell = { type: newType };
    if (newType === 'bobbin') {
      newCellData.color = cell.color || AVAILABLE_COLORS[0];
      if (cell.type === 'bobbin') { // Preserve properties if old type was also bobbin
        newCellData.hidden = cell.hidden;
        newCellData.ice = cell.ice;
        newCellData.has = cell.has;
        newCellData.accessoryColor = cell.accessoryColor;
      }
    } else if (newType === 'pipe') {
      if (cell.type === 'pipe' && cell.colors && cell.colors.length >= 2) {
        newCellData.colors = cell.colors.slice(0, MAX_PIPE_COLORS); 
        newCellData.face = cell.face;
      } else {
        newCellData.colors = [AVAILABLE_COLORS[0], AVAILABLE_COLORS[1]];
        newCellData.face = 'up';
      }
    }
    // For 'empty', we just want { type: 'empty' }
    onCellChange(newCellData);
  };

  const handleColorChange = (color: BobbinColor) => {
    onCellChange({ ...cell, color });
  };
  
  const handleHasChange = (newHas: 'lock' | 'key' | 'chain-key' | 'none') => {
    const newCell: BobbinCell = {...cell};
    if (newHas === 'none') {
      delete newCell.has;
      delete newCell.accessoryColor;
    } else {
      newCell.has = newHas;
      if (newHas === 'lock' || newHas === 'key' || newHas === 'chain-key') {
        if (!newCell.accessoryColor) {
          newCell.accessoryColor = AVAILABLE_COLORS[0];
        }
      } else {
        delete newCell.accessoryColor;
      }
    }
    onCellChange(newCell);
  };

  const handleAccessoryColorChange = (color: BobbinColor) => {
    onCellChange({ ...cell, accessoryColor: color });
  };

  const handleHiddenChange = (checked: boolean) => {
    const newCell: BobbinCell = { ...cell };
    if (checked) {
      newCell.hidden = true;
    } else {
      delete newCell.hidden;
    }
    onCellChange(newCell);
  };

  const handleIceChange = (checked: boolean) => {
    const newCell: BobbinCell = { ...cell };
    if (checked) {
      newCell.ice = true;
    } else {
      delete newCell.ice;
    }
    onCellChange(newCell);
  };

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

  const handleFaceChange = (newFace: 'up' | 'down' | 'left' | 'right') => {
    onCellChange({ ...cell, face: newFace });
  };

  const getCellDisplay = () => {
    const iconClass = "w-4 h-4 text-white mix-blend-difference";

    const accessory = (() => {
      if (!cell.has) return null;
    
      const getAccessoryColor = () => {
        if ((cell.has === 'lock' || cell.has === 'key' || cell.has === 'chain-key') && cell.accessoryColor) {
          return COLOR_MAP[cell.accessoryColor];
        }
        return 'black';
      };
      
      const accessoryIconClass = "absolute top-0.5 right-0.5 w-3 h-3 bg-white/50 rounded-full p-0.5";
    
      switch (cell.has) {
        case 'lock':
          return <LockIcon className={accessoryIconClass} color={getAccessoryColor()} />;
        case 'key':
          return <KeyIcon className={accessoryIconClass} color={getAccessoryColor()} />;
        case 'chain-key':
          return <KeySquare className={accessoryIconClass} color={getAccessoryColor()} />;
        // Pin icons are now rendered directly on the grid in the visualizer and editor grid
        default:
          return null;
      }
    })();

    switch (cell.type) {
      case 'bobbin':
        return (
          <div
            className={cn(
              "w-full h-full rounded-sm flex items-center justify-center relative",
              cell.hidden && 'opacity-50'
            )}
            style={{ backgroundColor: cell.color ? COLOR_MAP[cell.color] : 'transparent' }}
            aria-label={`Bobbin cell, color ${cell.color || 'none'}`}
          >
            {cell.ice ? <SnowflakeIcon className={iconClass} /> : <SpoolIcon className={iconClass} />}
            {accessory}
          </div>
        );
      case 'pipe':
        return (
          <div 
            className="w-full h-full rounded-sm border-2 flex items-center justify-center relative"
            style={{ 
              borderColor: cell.colors && cell.colors.length > 0 ? COLOR_MAP[cell.colors[0]] : 'hsl(var(--border))',
              boxShadow: cell.colors && cell.colors.length > 1 ? `0 0 0 2px ${COLOR_MAP[cell.colors[1]]} inset` : 'none'
            }}
            aria-label={`Pipe cell, colors ${cell.colors?.join(', ') || 'none'}`}
          >
             <svg viewBox="0 0 10 10" className="w-4 h-4"><circle cx="5" cy="5" r="2" fill="currentColor" /></svg>
              {cell.face && (
                <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                    {cell.face === 'up' && <ArrowUp className="w-5 h-5" />}
                    {cell.face === 'down' && <ArrowDown className="w-5 h-5" />}
                    {cell.face === 'left' && <ArrowLeft className="w-5 h-5" />}
                    {cell.face === 'right' && <ArrowRight className="w-5 h-5" />}
                </div>
              )}
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
    } else if (isPinningMode) {
      event.preventDefault();
      onPinClick(rowIndex, colIndex);
    } else if (isCurtainingMode) {
      event.preventDefault();
      onCurtainClick(rowIndex, colIndex);
    } else {
      setActiveEditorArea('bobbin'); 
    }
  };
  
  const isBobbinType = cell.type === 'bobbin';
  const isPinned = cell.has === 'pin-head' || cell.has === 'pin-tail';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-12 h-12 p-0 m-0.5 aspect-square focus:ring-2 focus:ring-ring focus:ring-offset-2 relative",
            (isLinkingMode || isChainingMode || isPinningMode || isCurtainingMode) && "cursor-crosshair hover:bg-accent/20",
            isSelectedForLinking && "ring-2 ring-accent ring-offset-background shadow-lg",
            isActuallyLinked && !isSelectedForLinking && "border-primary/50 border-2",
            isActuallyInChain && !isSelectedChain && "border-accent/50 border-2",
            isSelectedChain && "ring-2 ring-accent ring-offset-background shadow-lg",
            isChainAwaitingKeyLink && "ring-2 ring-blue-500 ring-offset-background shadow-lg",
            isSelectedForPinning && "ring-2 ring-pin-accent ring-offset-background shadow-lg",
            isPinned && !isSelectedForPinning && "border-pin-accent/50 border-2",
            isSelectedForCurtaining && "ring-2 ring-blue-500 ring-offset-background shadow-lg",
            isActuallyInCurtain && !isSelectedForCurtaining && "bg-curtain/20",
          )}
          aria-label={`Edit cell at row ${rowIndex + 1}, column ${colIndex + 1}. Current type: ${cellTypeDisplay[cell.type]}`}
          onClick={handleButtonClick}
        >
          {getCellDisplay()}
          {cell.has === 'pin-head' && <Pin className="absolute w-6 h-6 text-pin-accent pointer-events-none" style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}} />}
          {cell.has === 'pin-tail' && <Target className="absolute w-6 h-6 text-pin-accent pointer-events-none" style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 space-y-4">
        <h4 className="font-medium leading-none">Edit Cell ({rowIndex+1}, {colIndex+1})</h4>
        <div>
          <Label className="text-sm font-medium">Type</Label>
          <RadioGroup
            value={cell.type}
            onValueChange={(value) => handleTypeChange(value as BobbinCell['type'])}
            className="mt-1 grid grid-cols-3 gap-2"
          >
            {(['bobbin', 'pipe', 'empty'] as BobbinCell['type'][]).map(type => ( 
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`type-${type}-${rowIndex}-${colIndex}`} />
                <Label htmlFor={`type-${type}-${rowIndex}-${colIndex}`} className="text-sm">{cellTypeDisplay[type]}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {isBobbinType && (
          <>
             <div>
              <Label className="text-sm font-medium">Properties</Label>
              <div className="mt-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`hidden-check-${rowIndex}-${colIndex}`}
                    checked={!!cell.hidden}
                    onCheckedChange={handleHiddenChange}
                  />
                  <Label htmlFor={`hidden-check-${rowIndex}-${colIndex}`} className="text-sm font-normal">Hidden</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`ice-check-${rowIndex}-${colIndex}`}
                    checked={!!cell.ice}
                    onCheckedChange={handleIceChange}
                  />
                  <Label htmlFor={`ice-check-${rowIndex}-${colIndex}`} className="text-sm font-normal">Frozen (Ice)</Label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Accessory</Label>
               {isPinned ? (
                <p className="text-sm text-muted-foreground mt-1">
                  This bobbin is a part of a Pin. Remove the pin from the grid to add other accessories.
                </p>
              ) : (
                <RadioGroup
                  value={cell.has || 'none'}
                  onValueChange={(value) => handleHasChange(value as any)}
                  className="mt-1 grid grid-cols-3 gap-2"
                >
                  {(['none', 'lock', 'key', 'chain-key'] as const).map(item => (
                    <div key={item} className="flex items-center space-x-2">
                      <RadioGroupItem value={item} id={`has-${item}-${rowIndex}-${colIndex}`} />
                      <Label htmlFor={`has-${item}-${rowIndex}-${colIndex}`} className="text-sm capitalize">{item.replace('-', ' ')}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
            
            {(cell.has === 'lock' || cell.has === 'key' || cell.has === 'chain-key') && !isPinned && (
              <div>
                <Label htmlFor={`accessory-color-${rowIndex}-${colIndex}`} className="text-sm font-medium">
                  Accessory Color
                </Label>
                <ColorPicker
                  id={`accessory-color-${rowIndex}-${colIndex}`}
                  color={cell.accessoryColor || AVAILABLE_COLORS[0]}
                  onChange={handleAccessoryColorChange}
                  availableColors={AVAILABLE_COLORS}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor={`color-${rowIndex}-${colIndex}`} className="text-sm font-medium">Bobbin Color</Label>
              <ColorPicker
                id={`color-${rowIndex}-${colIndex}`}
                color={cell.color || AVAILABLE_COLORS[0]}
                onChange={handleColorChange}
                availableColors={AVAILABLE_COLORS}
                className="mt-1"
              />
            </div>
          </>
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

            <div>
              <Label className="text-sm font-medium">Face Direction</Label>
              <RadioGroup
                value={cell.face || ''}
                onValueChange={(value) => handleFaceChange(value as any)}
                className="mt-1 grid grid-cols-4 gap-1"
              >
                {(['up', 'down', 'left', 'right'] as const).map(dir => (
                  <Label key={dir} htmlFor={`face-${dir}-${rowIndex}-${colIndex}`} className="p-2 border rounded-md flex justify-center items-center cursor-pointer has-[:checked]:bg-accent has-[:checked]:text-accent-foreground data-[state=unchecked]:hover:bg-accent/50">
                    <RadioGroupItem value={dir} id={`face-${dir}-${rowIndex}-${colIndex}`} className="sr-only" />
                    {dir === 'up' && <ArrowUp className="w-4 h-4" />}
                    {dir === 'down' && <ArrowDown className="w-4 h-4" />}
                    {dir === 'left' && <ArrowLeft className="w-4 h-4" />}
                    {dir === 'right' && <ArrowRight className="w-4 h-4" />}
                  </Label>
                ))}
              </RadioGroup>
            </div>
            
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
