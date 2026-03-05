import { z } from "zod";

export const createLeadSchema = z.object({
  propertyId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Name is required").max(200),
  mobile: z.string().min(10, "Valid mobile required").max(15),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
  interestedInSimilar: z.boolean().optional().default(false),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
