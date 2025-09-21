import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { GenerationProgress } from "@shared/schema";

interface ProgressIndicatorProps {
  projectId: string;
}

export function ProgressIndicator({ projectId }: ProgressIndicatorProps) {
  const { data: progress = [] } = useQuery<GenerationProgress[]>({
    queryKey: ["/api/projects", projectId, "progress"],
    refetchInterval: 1000, // Refetch every second during generation
  });

  const nodeOrder = ["planner", "architect", "coder"];
  const nodeLabels = {
    planner: "Planner Node",
    architect: "Architect Node", 
    coder: "Coder Node"
  };

  const getProgressForNode = (nodeType: string) => {
    return progress.find(p => p.nodeType === nodeType);
  };

  const getStatusIcon = (nodeProgress: GenerationProgress | undefined) => {
    if (!nodeProgress) {
      return <Clock className="text-muted-foreground" size={16} />;
    }
    
    switch (nodeProgress.status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "in_progress":
        return <Loader2 className="text-primary animate-spin" size={16} />;
      case "failed":
        return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">!</span>
        </div>;
      default:
        return <Clock className="text-muted-foreground" size={16} />;
    }
  };

  const getStatusText = (nodeProgress: GenerationProgress | undefined) => {
    if (!nodeProgress) return "Pending";
    
    switch (nodeProgress.status) {
      case "completed":
        return "Complete";
      case "in_progress":
        return "In Progress";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (nodeProgress: GenerationProgress | undefined) => {
    if (!nodeProgress) return "text-muted-foreground";
    
    switch (nodeProgress.status) {
      case "completed":
        return "text-green-500";
      case "in_progress":
        return "text-primary";
      case "failed":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const totalProgress = Math.min(100, Math.round(
    progress.reduce((sum, p) => sum + p.progress, 0) / Math.max(nodeOrder.length, 1)
  ));

  if (progress.length === 0) {
    return null;
  }

  return (
    <Card className="border-t border-border bg-card">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium mb-4">Generation Progress</h3>
        <div className="space-y-4">
          <div className="space-y-3" data-testid="progress-nodes">
            {nodeOrder.map((nodeType) => {
              const nodeProgress = getProgressForNode(nodeType);
              return (
                <div 
                  key={nodeType}
                  className="flex items-center justify-between text-sm"
                  data-testid={`progress-node-${nodeType}`}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
                      {getStatusIcon(nodeProgress)}
                    </div>
                    <span>{nodeLabels[nodeType as keyof typeof nodeLabels]}</span>
                  </div>
                  <span className={getStatusColor(nodeProgress)}>
                    {getStatusText(nodeProgress)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Overall Progress</span>
              <span data-testid="text-overall-progress">{totalProgress}%</span>
            </div>
            <Progress 
              value={totalProgress} 
              className="w-full h-2"
              data-testid="progress-overall"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
