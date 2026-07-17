export interface Topic {
  id: string,
  name: string,
  subjectId: string,
  description: string,
  content: string,
  minAverageScore: number,
  averageScore: number,
  totalScore: number,
  efficientScore: number,
  createdAt: string,
  updatedAt: string,
}
