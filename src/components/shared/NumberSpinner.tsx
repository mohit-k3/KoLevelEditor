
"use client";
import type { ChangeEvent } from 'react';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberSpinnerProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const NumberSpinner: React.FC<NumberSpinnerProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let numValue = parseInt(e.target.value, 10);
    if (isNaN(numValue)) numValue = min;
    if (numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    onChange(numValue);
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        type="number"
        id={id}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-24 h-9 text-center"
      />
    </div>
  );
};
