
"use client";
import React from 'react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const ValidationPanel: React.FC = () => {
  const { validationMessages } = useLevelData();

  if (validationMessages.length === 0) {
    return (
      <div className="p-4 bg-card rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-primary flex items-center">
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" /> Validation Status
        </h3>
        <p className="text-sm text-muted-foreground">No validation issues found. Level looks good!</p>
      </div>
    );
  }

  const errors = validationMessages.filter(msg => msg.type === 'error');
  const warnings = validationMessages.filter(msg => msg.type === 'warning');

  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">Validation Status</h3>
      <ScrollArea className="h-[200px] pr-3">
        {errors.length > 0 && (
          <div className="mb-3">
            <h4 className="text-md font-medium text-destructive flex items-center mb-1">
              <AlertCircle className="mr-2 h-5 w-5" /> Errors ({errors.length})
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {errors.map((msg) => (
                <li key={msg.id} className="text-sm text-destructive">
                  {msg.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        {warnings.length > 0 && (
           <div className="mb-3">
            <h4 className="text-md font-medium text-yellow-600 dark:text-yellow-400 flex items-center mb-1">
              <AlertTriangle className="mr-2 h-5 w-5" /> Warnings ({warnings.length})
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {warnings.map((msg) => (
                <li key={msg.id} className="text-sm text-yellow-700 dark:text-yellow-500">
                  {msg.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
