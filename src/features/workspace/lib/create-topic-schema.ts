import * as z from "zod";

export const createTopicSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  minAverageScore: z.coerce.number().optional(),
});

export type CreateTopicDTO = z.infer<typeof createTopicSchema>;
