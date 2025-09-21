import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb, History, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PromptInputProps {
  onProjectCreated: (projectId: string) => void;
}

export function PromptInput({ onProjectCreated }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; prompt: string }) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: (project) => {
      toast({
        title: "Project created successfully!",
        description: "Generation process has started.",
      });
      onProjectCreated(project.id);
      setPrompt("");
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the application you want to create.",
        variant: "destructive",
      });
      return;
    }

    const projectName = prompt.length > 50 
      ? prompt.substring(0, 47) + "..." 
      : prompt;

    createProjectMutation.mutate({
      name: projectName,
      prompt: prompt.trim(),
    });
  };

  const examplePrompts = [
    "Create a simple calculator with basic arithmetic operations",
    "Build a todo application with add, edit, and delete functionality",
    "Make a weather dashboard with current conditions and forecast",
    "Design a contact book with search and filtering features"
  ];

  const handleExampleClick = () => {
    const randomExample = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    setPrompt(randomExample);
  };

  return (
    <Card className="border-0 bg-card">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
          <h2 className="text-lg font-semibold flex items-center">
            <Sparkles className="text-primary mr-2" size={20} />
            Create Application
          </h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your application
            </label>
            <Textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none bg-input border-border focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Create a simple calculator with basic arithmetic operations, or Build a todo application with add, edit, and delete functionality..."
              data-testid="input-prompt"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExampleClick}
              data-testid="button-examples"
            >
              <Lightbulb className="mr-2" size={16} />
              Examples
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              data-testid="button-history"
            >
              <History className="mr-2" size={16} />
              History
            </Button>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleGenerate}
            disabled={createProjectMutation.isPending}
            data-testid="button-generate"
          >
            {createProjectMutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={16} />
                Generate Application
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
