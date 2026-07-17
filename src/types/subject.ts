export interface Subject {
  id: string;
  userId: string;
  name: string;
  teacher: string | null;
  description: string | null;
  imageKey: string | null;
  minAverageScore: number;
  averageScore: number;
  totalScore: number;
  efficientScore: number;
  createdAt: string;
  updatedAt: string;
  content?: string;
}
