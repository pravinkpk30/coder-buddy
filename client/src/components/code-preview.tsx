import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileCode, Copy, Download, Eye } from "lucide-react";
import { GeneratedFile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodePreviewProps {
  file: GeneratedFile | null;
}

export function CodePreview({ file }: CodePreviewProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    if (!file) return;
    
    try {
      await navigator.clipboard.writeText(file.content);
      toast({
        title: "Copied to clipboard",
        description: `${file.filename} content copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async () => {
    if (!file) return;
    
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
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getLanguage = (fileType: string): string => {
    const languageMap: Record<string, string> = {
      html: "html",
      css: "css",
      javascript: "javascript",
      js: "javascript",
      json: "json",
      markdown: "markdown",
      md: "markdown",
      txt: "text",
    };
    return languageMap[fileType] || "text";
  };

  const getFileTypeLabel = (fileType: string): string => {
    const labelMap: Record<string, string> = {
      html: "HTML",
      css: "CSS",
      javascript: "JavaScript",
      js: "JavaScript",
      json: "JSON",
      markdown: "Markdown",
      md: "Markdown",
    };
    return labelMap[fileType] || fileType.toUpperCase();
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const countLines = (content: string) => {
    return content.split('\n').length;
  };

  if (!file) {
    return (
      <Card className="h-full border-0 bg-background flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Eye size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No file selected</p>
            <p className="text-sm">Select a file from the project tree to view its content</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <FileCode className="text-primary" size={20} />
          <span className="font-medium" data-testid="text-filename">
            {file.filename}
          </span>
          <Badge variant="secondary" className="text-xs">
            {getFileTypeLabel(file.fileType)}
          </Badge>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span data-testid="text-lines">{countLines(file.content)} lines</span>
            <span>•</span>
            <span data-testid="text-size">{formatFileSize(file.size)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            data-testid="button-copy-content"
          >
            <Copy className="text-muted-foreground" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadFile}
            data-testid="button-download-file"
          >
            <Download className="text-muted-foreground" size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-0">
            <SyntaxHighlighter
              language={getLanguage(file.fileType)}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                background: "transparent",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
              showLineNumbers={true}
              lineNumberStyle={{
                minWidth: "3em",
                paddingRight: "1em",
                color: "#6B7280",
                borderRight: "1px solid #374151",
                marginRight: "1em",
              }}
            >
              {file.content}
            </SyntaxHighlighter>
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border px-6 py-2 flex items-center justify-between text-sm text-muted-foreground flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span>Generated by {file.nodeType} node</span>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <span>LF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Ready for use</span>
        </div>
      </div>
    </Card>
  );
}
