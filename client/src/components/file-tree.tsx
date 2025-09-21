import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderTree, RefreshCw, Download, File, FileCode, FileText } from "lucide-react";
import { GeneratedFile } from "@shared/schema";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  projectId: string;
  selectedFile: GeneratedFile | null;
  onFileSelect: (file: GeneratedFile) => void;
  onDownloadAll: () => void;
}

export function FileTree({ projectId, selectedFile, onFileSelect, onDownloadAll }: FileTreeProps) {
  const { data: files = [], isLoading, refetch } = useQuery<GeneratedFile[]>({
    queryKey: ["/api/projects", projectId, "files"],
    refetchInterval: 2000, // Refresh every 2 seconds during generation
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "html":
        return <FileCode className="text-orange-500" size={16} />;
      case "css":
        return <FileCode className="text-blue-400" size={16} />;
      case "javascript":
      case "js":
        return <FileCode className="text-yellow-400" size={16} />;
      case "json":
        return <FileCode className="text-purple-400" size={16} />;
      case "markdown":
      case "md":
        return <FileText className="text-green-400" size={16} />;
      default:
        return <File className="text-gray-400" size={16} />;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadFile = async (file: GeneratedFile) => {
    try {
      const response = await fetch(`/api/files/${file.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (isLoading && files.length === 0) {
    return (
      <Card className="h-full border-0 bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading files...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 bg-card flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <FolderTree className="text-primary mr-2" size={20} />
            Project Files
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh-files"
            >
              <RefreshCw className={cn("text-muted-foreground", isLoading && "animate-spin")} size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadAll}
              disabled={files.length === 0}
              data-testid="button-download-all"
            >
              <Download className="text-muted-foreground" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {files.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FolderTree size={48} className="mx-auto mb-4 opacity-50" />
                <p>No files generated yet</p>
                <p className="text-sm">Files will appear here as they are generated</p>
              </div>
            ) : (
              <div className="space-y-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "group flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                      selectedFile?.id === file.id && "bg-primary/15 border-l-2 border-primary"
                    )}
                    onClick={() => onFileSelect(file)}
                    data-testid={`file-item-${file.filename}`}
                  >
                    <div className="mr-3">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {file.filename}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file);
                        }}
                        data-testid={`button-download-${file.filename}`}
                      >
                        <Download size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {files.length > 0 && (
        <div className="p-4 border-t border-border flex-shrink-0">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={onDownloadAll}
            data-testid="button-download-zip"
          >
            <Download className="mr-2" size={16} />
            Download as ZIP
          </Button>
        </div>
      )}
    </Card>
  );
}
