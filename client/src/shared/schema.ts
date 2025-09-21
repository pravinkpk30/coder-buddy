export type NodeType = "planner" | "architect" | "coder";
export type StatusType = "pending" | "in_progress" | "completed" | "failed";

export interface Project {
  id: string;
  name: string;
  prompt: string;
  created_at: string;
}

export interface GenerationProgress {
  nodeType: NodeType;
  status: StatusType;
  progress: number; // 0-100
}

export interface GeneratedFile {
  id: string;
  projectId: string;
  filename: string;
  fileType: string;
  size: number;
  content: string;
  nodeType: NodeType;
}
