
"use client";
import React, { useEffect, useState } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { useLevelData } from '@/contexts/LevelDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Skeleton } from '@/components/ui/skeleton';

export const JsonPreview: React.FC = () => {
  const { levelData } = useLevelData();
  const { theme } = useTheme();
  const [editorContent, setEditorContent] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    try {
      setEditorContent(JSON.stringify(levelData, null, 2));
    } catch (error) {
      console.error("Error stringifying levelData for JSON preview:", error);
      setEditorContent("Error generating JSON preview.");
    }
  }, [levelData]);
  
  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [] // You can add JSON schemas for validation if needed
    });
  };


  if (!isClient) {
    return (
      <div className="p-4 bg-card rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-primary">JSON Preview</h3>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-primary">JSON Preview</h3>
      <div className="border rounded-md overflow-hidden">
        <Editor
          height="300px"
          language="json"
          value={editorContent}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            wordWrap: 'on',
          }}
          beforeMount={handleEditorWillMount}
        />
      </div>
    </div>
  );
};
