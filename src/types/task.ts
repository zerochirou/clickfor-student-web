export interface Task {
  id: string;
  name: string;
  topicId: string;
  description: string;
  minAverageScore: number;
  averageScore: number;
  totalScore: number;
  efficientScore: number;
  status: "open" | "closed" | string,
  createdAt: string;
  updatedAt: string;
  dueDate: string;
}
