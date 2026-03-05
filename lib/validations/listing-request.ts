import { z } from "zod";

export const createListingRequestSchema = z.object({
  mode: z.enum(["BUY", "RENT", "COMMERCIAL"]),
  propertyType: z.enum(["APARTMENT", "HOUSE_VILLA", "PLOT", "COMMERCIAL_OFFICE", "SHOP"]),
  title: z.string().max(300).optional().nullable(),
  locationText: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  price: z.number().int().nonnegative(),
  bhk: z.number().int().positive().optional().nullable(),
  areaSqFt: z.number().int().positive().optional().nullable(),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]).optional().nullable(),
  description: z.string().max(10000).default(""),
});

export type CreateListingRequestInput = z.infer<typeof createListingRequestSchema>;
