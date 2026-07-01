import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Target job role must be at least 2 characters"),
  experience: z.enum(["Entry", "Mid", "Senior"], {
    errorMap: () => ({ message: "Please select your experience level" }),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
