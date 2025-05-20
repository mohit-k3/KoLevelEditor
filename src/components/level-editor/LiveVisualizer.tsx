
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import type { BobbinCell, FabricBlockData, LevelData } from '@/lib/types';
import { COLOR_MAP } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LiveVisualizerProps {
  editorType: 'bobbin' | 'fabric';
  className?: string;
}

const CELL_SIZE = 32; // px
const SPOOL_WIDTH_RATIO = 0.8;
const SPOOL_END_HEIGHT_RATIO = 0.2;
const PIPE_RADIUS_RATIO = 0.25;
const FABRIC_BLOCK_GAP = 2;

const BobbinVisualizer: React.FC<{data: LevelData['bobbinArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { rows, cols, cells } = data;
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={cn("border rounded-md bg-background shadow-inner", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Bobbin area visualization"
    >
      {cells.map((row, rIdx) => 
        row.map((cell, cIdx) => {
          const x = cIdx * CELL_SIZE;
          const y = rIdx * CELL_SIZE;
          
          // Base for empty/hidden cells
          let cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" />;

          if (cell.type === 'hidden' && cell.color) {
            cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill={COLOR_MAP[cell.color] || cell.color} opacity={0.3} />;
          }

          if (cell.type === 'bobbin' && cell.color) {
            const spoolColor = COLOR_MAP[cell.color] || cell.color;
            cellElement = (
              <g transform={`translate(${x + CELL_SIZE / 2}, ${y + CELL_SIZE / 2})`}>
                <rect 
                  x={-CELL_SIZE * SPOOL_WIDTH_RATIO / 2} 
                  y={-CELL_SIZE / 2 * (1 - SPOOL_END_HEIGHT_RATIO)} 
                  width={CELL_SIZE * SPOOL_WIDTH_RATIO} 
                  height={CELL_SIZE * (1 - SPOOL_END_HEIGHT_RATIO * 2)}
                  fill={spoolColor}
                  rx="2"
                />
                <rect x={-CELL_SIZE / 2} y={-CELL_SIZE / 2} width={CELL_SIZE} height={CELL_SIZE * SPOOL_END_HEIGHT_RATIO} fill={spoolColor} opacity="0.7" rx="1"/>
                <rect x={-CELL_SIZE / 2} y={CELL_SIZE / 2 * (1-SPOOL_END_HEIGHT_RATIO*2)} width={CELL_SIZE} height={CELL_SIZE * SPOOL_END_HEIGHT_RATIO} fill={spoolColor} opacity="0.7" rx="1"/>
              </g>
            );
          }

          if (cell.type === 'pipe' && cell.colors && cell.colors.length > 0) {
            const primaryColor = COLOR_MAP[cell.colors[0]] || cell.colors[0];
            const secondaryColor = cell.colors.length > 1 ? (COLOR_MAP[cell.colors[1]] || cell.colors[1]) : primaryColor;
             cellElement = (
              <g transform={`translate(${x + CELL_SIZE / 2}, ${y + CELL_SIZE / 2})`}>
                 <rect x={-CELL_SIZE/2} y={-CELL_SIZE/2} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" />
                <circle 
                  cx="0" 
                  cy="0" 
                  r={CELL_SIZE * PIPE_RADIUS_RATIO} 
                  fill={primaryColor} 
                  stroke={secondaryColor}
                  strokeWidth="2"
                />
              </g>
            );
          }
          
          return <React.Fragment key={`${rIdx}-${cIdx}`}>{cellElement}</React.Fragment>;
        })
      )}
       {/* Grid lines */}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={width} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
    </svg>
  );
};

const FabricVisualizer: React.FC<{data: LevelData['fabricArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { cols, maxFabricHeight, columns } = data;
  const blockHeight = (CELL_SIZE - FABRIC_BLOCK_GAP);
  const width = cols * CELL_SIZE;
  const height = maxFabricHeight * CELL_SIZE;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={cn("border rounded-md bg-background shadow-inner", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Fabric area visualization"
    >
      {columns.map((column, cIdx) => 
        column.slice(0, maxFabricHeight).map((block, bIdx) => {
          const x = cIdx * CELL_SIZE + FABRIC_BLOCK_GAP / 2;
          // Draw from bottom up
          const y = height - (bIdx + 1) * CELL_SIZE + FABRIC_BLOCK_GAP / 2; 
          const blockColor = COLOR_MAP[block.color] || block.color;

          return (
            <rect
              key={`${cIdx}-${bIdx}`}
              x={x}
              y={y}
              width={CELL_SIZE - FABRIC_BLOCK_GAP}
              height={blockHeight}
              fill={blockColor}
              rx="2"
            />
          );
        })
      )}
      {/* Max height indicator lines */}
      {Array.from({ length: maxFabricHeight }).map((_, i) => (
         <line key={`h-fabric-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={width} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5"/>
      ))}
      {/* Column separator lines */}
       {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-fabric-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
    </svg>
  );
};


export const LiveVisualizer: React.FC<LiveVisualizerProps> = ({ editorType, className }) => {
  const { levelData, validationMessages } = useLevelData();
  const hasErrors = validationMessages.some(msg => msg.type === 'error');

  return (
    <div className={cn("p-4 bg-card rounded-lg shadow space-y-3", className)}>
      <h3 className="text-lg font-semibold text-primary">
        {editorType === 'bobbin' ? 'Bobbin Area Preview' : 'Fabric Area Preview'}
      </h3>
      <div className="flex justify-center items-center overflow-auto">
      {editorType === 'bobbin' ? (
        <BobbinVisualizer data={levelData.bobbinArea} hasErrors={hasErrors} />
      ) : (
        <FabricVisualizer data={levelData.fabricArea} hasErrors={hasErrors} />
      )}
      </div>
    </div>
  );
};
