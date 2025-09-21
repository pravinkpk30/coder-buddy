import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PromptInput } from "@/components/prompt-input";
import { ProgressIndicator } from "@/components/progress-indicator";
import { FileTree } from "@/components/file-tree";
import { CodePreview } from "@/components/code-preview";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Activity } from "lucide-react";
import { GeneratedFile, Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: files = [] } = useQuery<GeneratedFile[]>({
    queryKey: ["/api/projects", currentProjectId, "files"],
    enabled: !!currentProjectId,
  });

  const handleProjectCreated = (projectId: string) => {
    setCurrentProjectId(projectId);
    setSelectedFile(null);
  };

  const handleFileSelect = (file: GeneratedFile) => {
    setSelectedFile(file);
  };

  const handleDownloadAll = async () => {
    if (!currentProjectId) return;
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/download`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${currentProjectId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download complete",
        description: "Project files downloaded as ZIP",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download project files",
        variant: "destructive",
      });
    }
  };

  const totalFiles = files.length;
  const totalLinesOfCode = files.reduce((sum, file) => 
    sum + file.content.split('\n').length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-primary-foreground" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AI Code Generator</h1>
              <p className="text-sm text-muted-foreground">Agentic Development Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Agents Ready</span>
              </div>
            </div>
            <Activity className="text-muted-foreground" size={20} />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Prompt Input Panel */}
        <div className="w-full lg:w-96 bg-card border-r border-border flex flex-col">
          <PromptInput onProjectCreated={handleProjectCreated} />
          
          {/* Progress Section */}
          {currentProjectId && (
            <ProgressIndicator projectId={currentProjectId} />
          )}

          {/* Generation Stats */}
          <Card className="m-6 mt-auto border-border bg-muted/50">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium mb-4">Session Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-primary" data-testid="stats-files">
                    {totalFiles}
                  </div>
                  <div className="text-xs text-muted-foreground">Files Generated</div>
                </div>
                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-500" data-testid="stats-lines">
                    {totalLinesOfCode}
                  </div>
                  <div className="text-xs text-muted-foreground">Lines of Code</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Tree Panel */}
        <div className="hidden lg:block w-80 bg-card border-r border-border">
          {currentProjectId ? (
            <FileTree
              projectId={currentProjectId}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onDownloadAll={handleDownloadAll}
            />
          ) : (
            <Card className="h-full border-0 bg-card">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Bot size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Ready to Generate</p>
                  <p className="text-sm">Enter a prompt to start creating your application</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Code Preview Panel */}
        <div className="flex-1 bg-background">
          <CodePreview file={selectedFile} />
        </div>
      </div>
    </div>
  );
}
