import * as z from "zod";

export const createTaskSchema = z.object({
  topicId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  minAverageScore: z.number().optional(),
  dueDate: z.string().optional(),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
