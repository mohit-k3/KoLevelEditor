
"use client";
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLevelData } from '@/contexts/LevelDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Download, PlusSquare, Moon, Sun, Undo, Redo, Upload } from 'lucide-react';
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
  const { levelData, setLevelData, undo, redo, canUndo, canRedo, resetLevelData, loadLevelData } = useLevelData();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    try {
      const jsonString = JSON.stringify(levelData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `level_${levelData.level || 'untitled'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Download Started", description: `${a.download} is downloading.` });
    } catch (error) {
      console.error("Error preparing download:", error);
      toast({ title: "Download Error", description: "Could not prepare the file for download.", variant: "destructive" });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const importedData = JSON.parse(text) as LevelData;
        
        // Basic validation for top-level structure (more thorough validation happens in context)
        if (typeof importedData.level !== 'number' || !importedData.bobbinArea || !importedData.fabricArea) {
            throw new Error("Invalid JSON structure for level data.");
        }
        
        loadLevelData(importedData);
        toast({ title: "Import Successful", description: `Level ${importedData.level} loaded from ${file.name}.` });
      } catch (error) {
        console.error("Error importing JSON:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during import.";
        toast({
          title: "Import Failed",
          description: `Could not import ${file.name}. ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        // Reset file input to allow importing the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: `Could not read the file ${file.name}.`,
        variant: "destructive",
      });
       if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
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
            min="1"
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
          
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="mr-1 h-4 w-4" /> Import JSON
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
            aria-label="Import JSON file"
          />

          <Button variant="outline" size="sm" onClick={handleDownload}><Download className="mr-1 h-4 w-4" /> Download JSON</Button>
          
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo (Ctrl+Z)">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo (Ctrl+Y/Ctrl+Shift+Z)">
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
