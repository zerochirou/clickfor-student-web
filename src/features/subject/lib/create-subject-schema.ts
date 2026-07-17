import { imageFileType } from "@/lib/image-file-type";
import * as z from "zod"

export const createSubjectSchema = z.object({
  name: z.string(),
  teacher: z.string().optional(),
  description: z.string().optional(),
  minAverageScore: z.number().optional(),
  image: imageFileType.optional(),
});

export type CreateSubjectDTO = z.infer<typeof createSubjectSchema>;