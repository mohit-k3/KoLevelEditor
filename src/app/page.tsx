
import { HeaderToolbar } from '@/components/level-editor/HeaderToolbar';
import { BobbinGridEditor } from '@/components/level-editor/BobbinGridEditor';
import { FabricGridEditor } from '@/components/level-editor/FabricGridEditor';
import { LiveVisualizer } from '@/components/level-editor/LiveVisualizer';
import { ValidationPanel } from '@/components/level-editor/ValidationPanel';
import { JsonPreview } from '@/components/level-editor/JsonPreview';
import { ColorBalanceSummary } from '@/components/level-editor/ColorBalanceSummary';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LevelEditorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeaderToolbar />
      <main className="flex-grow container mx-auto py-6 px-4">
        <Tabs defaultValue="grid-editors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="grid-editors">Grid Editors</TabsTrigger>
            <TabsTrigger value="validation-preview">Validation & Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="grid-editors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1: Bobbin Editor and Visualizer */}
              <div className="space-y-6">
                <BobbinGridEditor />
                <LiveVisualizer editorType="bobbin" />
              </div>

              {/* Column 2: Fabric Editor and Visualizer */}
              <div className="space-y-6">
                <FabricGridEditor />
                <LiveVisualizer editorType="fabric" />
              </div>
            </div>
            <div className="mt-6">
              <ColorBalanceSummary />
            </div>
          </TabsContent>

          <TabsContent value="validation-preview">
            <div className="space-y-6">
              <ValidationPanel />
              <Separator />
              <JsonPreview />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Knit It Level Editor &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
