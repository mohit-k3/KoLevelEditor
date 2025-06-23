
"use client";
import React, { useMemo } from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { AVAILABLE_COLORS, COLOR_MAP } from '@/lib/constants';
import type { BobbinColor, LevelData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorCounts {
  effectiveBobbins: number;
  totalFabricBlocks: number;
  expectedFabric: number;
}

const calculateColorCounts = (levelData: LevelData): Map<BobbinColor, ColorCounts> => {
  const counts = new Map<BobbinColor, ColorCounts>();

  AVAILABLE_COLORS.forEach(color => {
    counts.set(color, { effectiveBobbins: 0, totalFabricBlocks: 0, expectedFabric: 0 });
  });

  // Calculate effective bobbin counts
  levelData.bobbinArea.cells.forEach(row => {
    row.forEach(cell => {
      if (cell.type === 'bobbin') {
        if (cell.color) {
          const currentColor = counts.get(cell.color);
          if (currentColor) {
            currentColor.effectiveBobbins++;
          }
        }
      } else if (cell.type === 'pipe' && cell.colors) {
        cell.colors.forEach(pipeColor => {
          const currentColor = counts.get(pipeColor);
          if (currentColor) {
            currentColor.effectiveBobbins++;
          }
        });
      }
    });
  });

  // Calculate total fabric blocks counts (including hidden)
  levelData.fabricArea.columns.forEach(column => {
    column.forEach(block => {
      if (block.color) { // Count all blocks with a color, regardless of hidden status
        const currentColor = counts.get(block.color);
        if (currentColor) {
          currentColor.totalFabricBlocks++;
        }
      }
    });
  });

  // Calculate expected fabric counts
  AVAILABLE_COLORS.forEach(color => {
    const currentColor = counts.get(color);
    if (currentColor) {
      currentColor.expectedFabric = currentColor.effectiveBobbins * 3;
    }
  });

  return counts;
};

export const ColorBalanceSummary: React.FC = () => {
  const { levelData } = useLevelData();

  const colorBalanceData = useMemo(() => calculateColorCounts(levelData), [levelData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Color Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead className="text-center">Bobbins (Effective)</TableHead>
                <TableHead className="text-center">Fabric (Total)</TableHead>
                <TableHead className="text-center">Fabric (Expected)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AVAILABLE_COLORS.map(color => {
                const data = colorBalanceData.get(color);
                if (!data) return null;

                const isBalanced = data.totalFabricBlocks === data.expectedFabric;

                return (
                  <TableRow key={color}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-block w-4 h-4 rounded-sm border" 
                          style={{ backgroundColor: COLOR_MAP[color] ?? color }}
                          aria-hidden="true"
                        />
                        {color}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{data.effectiveBobbins}</TableCell>
                    <TableCell className={cn(
                      "text-center font-medium",
                      isBalanced ? "text-green-600 dark:text-green-400" : "text-destructive"
                    )}>
                      {data.totalFabricBlocks}
                    </TableCell>
                    <TableCell className="text-center">{data.expectedFabric}</TableCell>
                    <TableCell className="text-center">
                      {isBalanced ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 inline-block" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive inline-block" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
