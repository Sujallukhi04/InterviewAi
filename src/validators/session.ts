import { z } from "zod";

export const createSessionSchema = z.object({
  type: z.enum(["Behavioral", "Technical", "SystemDesign", "HRCultureFit"], {
    errorMap: () => ({ message: "Invalid interview type selected" }),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
