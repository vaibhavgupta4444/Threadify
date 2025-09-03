import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
  });