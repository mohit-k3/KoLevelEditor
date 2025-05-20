
"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLevelData } from '@/contexts/LevelDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Download, PlusSquare, Moon, Sun, Undo, Redo } from 'lucide-react';
import type { LevelData } from '@/lib/types';
import { createDefaultLevelData } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const HeaderToolbar: React.FC = () => {
  const { levelData, setLevelData, undo, redo, canUndo, canRedo, resetLevelData } = useLevelData();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(e.target.value, 10);
    setLevelData(draft => {
      draft.level = isNaN(newLevel) ? 1 : newLevel;
    });
  };

  const handleNew = () => {
    resetLevelData(createDefaultLevelData());
    toast({ title: "New Level", description: "Empty level created." });
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(levelData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `level_${levelData.level}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: `level_${levelData.level}.json is downloading.` });
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-md p-3">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary whitespace-nowrap">Knit It Editor</h1>
          <Input
            type="number"
            value={levelData.level}
            onChange={handleLevelChange}
            className="w-20 h-9 text-sm"
            aria-label="Level Number"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm"><PlusSquare className="mr-1 h-4 w-4" /> New</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Level?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will discard any unsaved changes to the current level. Are you sure you want to create a new level?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleNew}>Create New</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button variant="outline" size="sm" onClick={handleDownload}><Download className="mr-1 h-4 w-4" /> Download JSON</Button>
          
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo">
            <Redo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};
