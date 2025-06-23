
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import type { BobbinCell, FabricBlockData, LevelData, BobbinColor, BobbinPair } from '@/lib/types';
import { COLOR_MAP, LIMITED_FABRIC_COLORS, createFabricBlock, LINKING_LINE_COLOR, CHAIN_LINE_COLOR, CHAIN_KEY_LINK_COLOR, PIN_LINE_COLOR } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FabricBlockPopover } from './FabricBlockPopover';
import { SnowflakeIcon, LockIcon, KeyIcon, KeySquare, Pin, Target } from 'lucide-react';


interface LiveVisualizerProps {
  editorType: 'bobbin' | 'fabric';
  className?: string;
}

const CELL_SIZE = 32; 
const SPOOL_WIDTH_RATIO = 0.8;
const SPOOL_END_HEIGHT_RATIO = 0.2;
const FABRIC_BLOCK_GAP = 2; 
const FABRIC_EMPTY_SLOT_COLOR = "hsl(var(--muted) / 0.5)"; 

const BobbinVisualizer: React.FC<{data: LevelData['bobbinArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { rows, cols, cells, pairs = [], chains = [], pins = [] } = data;
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={cn("border rounded-md bg-background shadow-inner overflow-visible", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Bobbin area visualization"
    >
      {/* Grid Lines */}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={width} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={height} stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}

      {/* Cells */}
      {cells.map((row, rIdx) => 
        row.map((cell, cIdx) => {
          const x = cIdx * CELL_SIZE;
          const y = rIdx * CELL_SIZE;
          
          let cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" />;

          const accessoryIcon = cell.has === 'lock' 
              ? <LockIcon x={x + CELL_SIZE - 12} y={y + 4} width="10" height="10" color="hsl(var(--foreground))" strokeWidth="3" />
              : cell.has === 'key' 
              ? <KeyIcon x={x + CELL_SIZE - 12} y={y + 4} width="10" height="10" color="hsl(var(--foreground))" strokeWidth="3" transform={`rotate(-45 ${x + CELL_SIZE - 7} ${y + 9})`} />
              : cell.has === 'chain-key'
              ? <KeySquare x={x + CELL_SIZE - 12} y={y + 4} width="10" height="10" color="hsl(var(--foreground))" strokeWidth="3" />
              : cell.has === 'pin-head'
              ? <Pin x={x + CELL_SIZE - 12} y={y + 4} width="10" height="10" color="hsl(var(--foreground))" strokeWidth="3" />
              : cell.has === 'pin-tail'
              ? <Target x={x + CELL_SIZE - 12} y={y + 4} width="10" height="10" color="hsl(var(--foreground))" strokeWidth="3" />
              : null;
          
          if (cell.type === 'bobbin') {
            const bobbinColor = COLOR_MAP[cell.color || ''] || 'transparent';
            const spool = (
              <>
                <rect 
                  x={-CELL_SIZE * SPOOL_WIDTH_RATIO / 2} 
                  y={-CELL_SIZE / 2 * (1 - SPOOL_END_HEIGHT_RATIO)} 
                  width={CELL_SIZE * SPOOL_WIDTH_RATIO} 
                  height={CELL_SIZE * (1 - SPOOL_END_HEIGHT_RATIO * 2)}
                  fill={bobbinColor}
                  rx="2"
                />
                <rect x={-CELL_SIZE / 2} y={-CELL_SIZE / 2} width={CELL_SIZE} height={CELL_SIZE * SPOOL_END_HEIGHT_RATIO} fill={bobbinColor} opacity="0.7" rx="1"/>
                <rect x={-CELL_SIZE / 2} y={CELL_SIZE / 2 * (1-SPOOL_END_HEIGHT_RATIO*2)} width={CELL_SIZE} height={CELL_SIZE * SPOOL_END_HEIGHT_RATIO} fill={bobbinColor} opacity="0.7" rx="1"/>
              </>
            );
            const iceBlock = (
              <rect 
                  x={0} 
                  y={0} 
                  width={CELL_SIZE} 
                  height={CELL_SIZE} 
                  fill={bobbinColor} 
                  rx="2"
                />
            );
            const iceIcon = (
               <SnowflakeIcon 
                  x={CELL_SIZE / 2 - 8}
                  y={CELL_SIZE / 2 - 8}
                  width="16" 
                  height="16" 
                  color="hsl(var(--primary-foreground))"
                  opacity="0.75"
                />
            );

            cellElement = (
              <g transform={`translate(${x}, ${y})`} opacity={cell.hidden ? 0.3 : 1}>
                {cell.ice ? iceBlock : <g transform={`translate(${CELL_SIZE / 2}, ${CELL_SIZE / 2})`}>{spool}</g>}
                {cell.hidden && (
                  <rect 
                    x="0.5" 
                    y="0.5" 
                    width={CELL_SIZE - 1} 
                    height={CELL_SIZE - 1} 
                    fill="none"
                    stroke={bobbinColor} 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3"
                    rx="2"
                  />
                )}
                {cell.ice && iceIcon}
                <g transform={`translate(${-x}, ${-y})`}>{accessoryIcon}</g>
              </g>
            );
          }


          if (cell.type === 'pipe' && cell.colors && cell.colors.length >= 1) { 
            const numColors = cell.colors.length;
            const stripeWidth = CELL_SIZE / numColors;
            cellElement = (
              <g>
                {cell.colors.map((pipeColor, i) => (
                  <rect
                    key={`pipe-stripe-${rIdx}-${cIdx}-${i}`}
                    x={x + i * stripeWidth}
                    y={y}
                    width={stripeWidth}
                    height={CELL_SIZE}
                    fill={COLOR_MAP[pipeColor] || pipeColor}
                  />
                ))}
                <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill="none" stroke="hsl(var(--border) / 0.5)" strokeWidth="0.5"/>
              </g>
            );
          } else if (cell.type === 'pipe') { 
             cellElement = <rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill="hsl(var(--muted))" stroke="hsl(var(--destructive))" strokeWidth="1" />;
          }
          
          return <React.Fragment key={`bobbin-${rIdx}-${cIdx}`}>{cellElement}</React.Fragment>;
        })
      )}
       {/* Chain Path Lines */}
       {chains.map((chain, cIdx) => 
        chain.path.map((coord, bIdx) => {
          if (bIdx === chain.path.length - 1) return null; // No line from the last bobbin
          const nextCoord = chain.path[bIdx+1];
          const fromX = coord.col * CELL_SIZE + CELL_SIZE / 2;
          const fromY = coord.row * CELL_SIZE + CELL_SIZE / 2;
          const toX = nextCoord.col * CELL_SIZE + CELL_SIZE / 2;
          const toY = nextCoord.row * CELL_SIZE + CELL_SIZE / 2;
           return (
            <line
                key={`chain-line-${cIdx}-${bIdx}`}
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={CHAIN_LINE_COLOR}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.6"
                className="pointer-events-none" 
            />
           );
        })
       )}
       {/* Chain Key Link Lines */}
       {chains.map((chain, cIdx) => {
        if (!chain.keyLocation || chain.path.length === 0) return null;
        const firstBobbinInPath = chain.path[0];
        const fromX = firstBobbinInPath.col * CELL_SIZE + CELL_SIZE / 2;
        const fromY = firstBobbinInPath.row * CELL_SIZE + CELL_SIZE / 2;
        const toX = chain.keyLocation.col * CELL_SIZE + CELL_SIZE / 2;
        const toY = chain.keyLocation.row * CELL_SIZE + CELL_SIZE / 2;
         return (
          <line
            key={`chain-key-link-${cIdx}`}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={CHAIN_KEY_LINK_COLOR}
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.8"
            className="pointer-events-none"
          />
        );
      })}
      {/* Pin Lines */}
       {pins.map((pin, pIdx) => {
        const fromX = pin.head.col * CELL_SIZE + CELL_SIZE / 2;
        const fromY = pin.head.row * CELL_SIZE + CELL_SIZE / 2;
        const toX = pin.tail.col * CELL_SIZE + CELL_SIZE / 2;
        const toY = pin.tail.row * CELL_SIZE + CELL_SIZE / 2;
        return (
          <line
            key={`pin-line-${pIdx}`}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={PIN_LINE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none" 
          />
        );
      })}
       {/* Linking Lines */}
       {pairs.map((pair, pIdx) => {
        const fromX = pair.from.col * CELL_SIZE + CELL_SIZE / 2;
        const fromY = pair.from.row * CELL_SIZE + CELL_SIZE / 2;
        const toX = pair.to.col * CELL_SIZE + CELL_SIZE / 2;
        const toY = pair.to.row * CELL_SIZE + CELL_SIZE / 2;
        return (
          <line
            key={`pair-line-${pIdx}`}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={LINKING_LINE_COLOR}
            strokeWidth="2"
            strokeDasharray="4 2"
            strokeLinecap="round"
            className="pointer-events-none" 
          />
        );
      })}
    </svg>
  );
};

const FabricVisualizer: React.FC<{data: LevelData['fabricArea'], hasErrors: boolean}> = ({ data, hasErrors }) => {
  const { setLevelData, setLastInteractedFabricCol, setActiveEditorArea } = useLevelData();
  const { cols, maxFabricHeight, columns } = data;
  
  const blockDisplayHeight = CELL_SIZE - FABRIC_BLOCK_GAP;
  const svgWidth = cols * CELL_SIZE;
  const svgHeight = maxFabricHeight * CELL_SIZE;

  const handleTriggerClick = (colIndex: number) => {
    setLastInteractedFabricCol(colIndex);
    setActiveEditorArea('fabric');
  };

  return (
    <svg 
      width={svgWidth} 
      height={svgHeight} 
      viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
      className={cn("border rounded-md bg-background shadow-inner", hasErrors && "outline outline-2 outline-offset-2 outline-destructive")}
      aria-label="Fabric area visualization (interactive)"
    >
      {Array.from({ length: cols }).map((_, cIdx) => 
        Array.from({ length: maxFabricHeight }).map((_, bIdxInVis) => { 
          const currentColumnSparse = columns[cIdx] || []; 
          const dataIndexFromBottom = bIdxInVis; // Correctly maps visual top (0) to data bottom (0)
          const currentBlock = currentColumnSparse[dataIndexFromBottom];


          const x = cIdx * CELL_SIZE + FABRIC_BLOCK_GAP / 2;
          const y = (maxFabricHeight - 1 - bIdxInVis) * CELL_SIZE + FABRIC_BLOCK_GAP / 2; 

          const fillColor = currentBlock ? (COLOR_MAP[currentBlock.color] || currentBlock.color) : FABRIC_EMPTY_SLOT_COLOR;
          const strokeColor = currentBlock ? (COLOR_MAP[currentBlock.color] || currentBlock.color) : "hsl(var(--border))";
          const blockOpacity = currentBlock?.hidden ? 0.5 : 1;

          return (
            <Popover key={`fabric-popover-${cIdx}-${bIdxInVis}`}>
              <PopoverTrigger asChild onClick={() => handleTriggerClick(cIdx)}>
                <rect
                  x={x}
                  y={y}
                  width={CELL_SIZE - FABRIC_BLOCK_GAP}
                  height={blockDisplayHeight}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={currentBlock ? 1 : 0.5}
                  opacity={blockOpacity} 
                  rx="2"
                  style={{ cursor: 'pointer' }}
                  className={cn(
                    "hover:stroke-primary hover:stroke-2",
                    currentBlock?.hidden && "stroke-dashed stroke-1"
                  )}
                  strokeDasharray={currentBlock?.hidden ? "3 3" : undefined}
                  aria-label={
                    currentBlock 
                      ? `Fabric block color ${currentBlock.color}${currentBlock.hidden ? ' (hidden)' : ''}, column ${cIdx + 1}, visual row ${bIdxInVis + 1}. Click to edit.` 
                      : `Empty fabric slot, column ${cIdx + 1}, visual row ${bIdxInVis + 1}. Click to add/edit block.`
                  }
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <FabricBlockPopover
                  blockData={currentBlock || null} 
                  colIndex={cIdx}
                  rowIndexInVisualizer={bIdxInVis} 
                  onBlockChange={(newBlockState: FabricBlockData | null) => {
                    setLevelData(draft => {
                        const originalColumn = draft.fabricArea.columns[cIdx] || [];
                        const newColumn = [...originalColumn];
                        
                        if(newBlockState) {
                           newColumn[dataIndexFromBottom] = newBlockState;
                        } else {
                           delete newColumn[dataIndexFromBottom];
                        }
                        
                        // Filter out empty slots to maintain a sparse array, but keep order
                        draft.fabricArea.columns[cIdx] = newColumn.filter(Boolean);
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          );
        })
      )}
      {Array.from({ length: maxFabricHeight +1 }).map((_, i) => (
         <line key={`h-fabric-line-${i}`} x1="0" y1={i * CELL_SIZE} x2={svgWidth} y2={i * CELL_SIZE} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray={i === maxFabricHeight ? "none" : "2 2"} opacity="0.5"/>
      ))}
       {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v-fabric-line-${i}`} x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={svgHeight} stroke="hsl(var(--border))" strokeWidth="0.5" />
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
         {editorType === 'fabric' && <span className="text-sm font-normal text-muted-foreground"> (Click to edit)</span>}
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
