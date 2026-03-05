import { z } from "zod";

export const createUserQuerySchema = z.object({
  name: z.string().max(200).optional().nullable(),
  mobile: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal("")),
  mode: z.enum(["BUY", "RENT", "COMMERCIAL"]),
  city: z.string().min(1).max(100),
  locationText: z.string().max(500).optional().nullable(),
  propertyType: z.enum(["APARTMENT", "HOUSE_VILLA", "PLOT", "COMMERCIAL_OFFICE", "SHOP"]).optional().nullable(),
  budgetMin: z.number().int().nonnegative().optional().nullable(),
  budgetMax: z.number().int().nonnegative().optional().nullable(),
  bhk: z.number().int().positive().optional().nullable(),
  message: z.string().min(1).max(5000),
});

export type CreateUserQueryInput = z.infer<typeof createUserQuerySchema>;
