
"use client";
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import type { BobbinColor } from '@/lib/types';
import { COLOR_MAP, AVAILABLE_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: BobbinColor;
  onChange: (newColor: BobbinColor) => void;
  availableColors?: BobbinColor[];
  className?: string;
}

// Helper to convert named colors to hex for react-colorful (if needed, though it supports named colors)
// For this simple case, we'll assume direct mapping or use a predefined set for swatch.
const getHexColor = (color: BobbinColor): string => {
  // A very basic mapping for known colors.
  // In a real scenario, you might have a more robust system or use react-colorful's ability to handle standard CSS color names.
  const simpleHexMap: Record<string, string> = {
    Red: '#FF0000',
    Blue: '#0000FF',
    Green: '#008000',
    Yellow: '#FFFF00',
    Purple: '#800080',
  };
  return simpleHexMap[color] || color; // if it's already a hex or unknown, pass it through
};


export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  availableColors = AVAILABLE_COLORS,
  className,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  // For this example, we'll use swatches instead of a full HexColorPicker for simplicity with BobbinColor type
  // If true hex picking is needed, conversion to/from hex would be necessary.

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);


  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal h-9"
        onClick={() => setShowPicker(!showPicker)}
        style={{ backgroundColor: COLOR_MAP[color] || color, color: 'hsl(var(--primary-foreground))' }}
      >
        {color}
      </Button>
      {showPicker && (
        <div className="absolute z-10 mt-1 p-2 bg-popover border rounded-md shadow-lg">
           <div className="grid grid-cols-3 gap-1">
            {availableColors.map((c) => (
              <Button
                key={c}
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: COLOR_MAP[c] || c }}
                onClick={() => {
                  onChange(c);
                  setShowPicker(false);
                }}
                aria-label={`Select color ${c}`}
              >
                {color === c && <CheckIcon className="h-4 w-4 text-primary-foreground" />}
              </Button>
            ))}
          </div>
          {/* If full hex picker is desired:
          <HexColorPicker color={getHexColor(color)} onChange={(hex) => onChange(hex)} />
          You would need a robust way to map hex back to BobbinColor or change BobbinColor to always be hex.
          */}
        </div>
      )}
    </div>
  );
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

