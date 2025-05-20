
"use client";
import React from 'react';
import type { BobbinCell, BobbinColor } from '@/lib/types';
import { AVAILABLE_COLORS, COLOR_MAP } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/shared/ColorPicker';
import { cn } from '@/lib/utils';

interface BobbinCellEditorProps {
  cell: BobbinCell;
  onCellChange: (newCell: BobbinCell) => void;
  rowIndex: number;
  colIndex: number;
}

const cellTypeDisplay: Record<BobbinCell['type'], string> = {
  bobbin: "Bobbin",
  pipe: "Pipe",
  hidden: "Hidden",
  empty: "Empty",
};

export const BobbinCellEditor: React.FC<BobbinCellEditorProps> = ({ cell, onCellChange, rowIndex, colIndex }) => {
  const handleTypeChange = (type: BobbinCell['type']) => {
    const newCell: BobbinCell = { type };
    if (type === 'bobbin' || type === 'hidden') {
      newCell.color = cell.color || AVAILABLE_COLORS[0];
    } else if (type === 'pipe') {
      newCell.colors = cell.colors || [AVAILABLE_COLORS[0], AVAILABLE_COLORS[1]];
    }
    onCellChange(newCell);
  };

  const handleColorChange = (color: BobbinColor) => {
    onCellChange({ ...cell, color });
  };

  const handlePipeColorToggle = (color: BobbinColor) => {
    const currentColors = cell.colors || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    onCellChange({ ...cell, colors: newColors });
  };

  const getCellDisplay = () => {
    switch (cell.type) {
      case 'bobbin':
      case 'hidden':
        return (
          <div
            className={cn(
              "w-full h-full rounded-sm flex items-center justify-center",
              cell.type === 'hidden' && 'opacity-50'
            )}
            style={{ backgroundColor: cell.color ? COLOR_MAP[cell.color] : 'transparent' }}
            aria-label={`${cellTypeDisplay[cell.type]} cell, color ${cell.color || 'none'}`}
          >
            {cell.type === 'bobbin' && <SpoolIcon className="w-4 h-4 text-white mix-blend-difference" />}
          </div>
        );
      case 'pipe':
        return (
          <div 
            className="w-full h-full rounded-sm border-2 flex items-center justify-center"
            style={{ 
              borderColor: cell.colors && cell.colors.length > 0 ? COLOR_MAP[cell.colors[0]] : 'hsl(var(--border))',
              // Basic multi-color outline representation
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-12 h-12 p-0 m-0.5 aspect-square focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Edit cell at row ${rowIndex + 1}, column ${colIndex + 1}. Current type: ${cellTypeDisplay[cell.type]}`}
        >
          {getCellDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 space-y-4">
        <h4 className="font-medium leading-none">Edit Cell ({rowIndex+1}, {colIndex+1})</h4>
        <div>
          <Label className="text-sm font-medium">Type</Label>
          <RadioGroup
            value={cell.type}
            onValueChange={(value) => handleTypeChange(value as BobbinCell['type'])}
            className="mt-1 grid grid-cols-2 gap-2"
          >
            {(['bobbin', 'pipe', 'hidden', 'empty'] as BobbinCell['type'][]).map(type => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`type-${type}-${rowIndex}-${colIndex}`} />
                <Label htmlFor={`type-${type}-${rowIndex}-${colIndex}`} className="text-sm">{cellTypeDisplay[type]}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {(cell.type === 'bobbin' || cell.type === 'hidden') && (
          <div>
            <Label htmlFor={`color-${rowIndex}-${colIndex}`} className="text-sm font-medium">Color</Label>
            <ColorPicker
              color={cell.color || AVAILABLE_COLORS[0]}
              onChange={handleColorChange}
              availableColors={AVAILABLE_COLORS}
              className="mt-1"
            />
          </div>
        )}

        {cell.type === 'pipe' && (
          <div>
            <Label className="text-sm font-medium">Pipe Colors (select ≥2)</Label>
            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
              {AVAILABLE_COLORS.map(color => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pipe-color-${color}-${rowIndex}-${colIndex}`}
                    checked={(cell.colors || []).includes(color)}
                    onCheckedChange={() => handlePipeColorToggle(color)}
                  />
                  <Label htmlFor={`pipe-color-${color}-${rowIndex}-${colIndex}`} className="text-sm flex items-center">
                     <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLOR_MAP[color]}}></span>
                    {color}
                  </Label>
                </div>
              ))}
            </div>
            {(!cell.colors || cell.colors.length < 2) && (
                 <p className="text-xs text-destructive mt-1">Pipe must have at least 2 colors.</p>
            )}
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
