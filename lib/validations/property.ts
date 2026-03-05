import { z } from "zod";

const modeEnum = z.enum(["BUY", "RENT", "COMMERCIAL"]);
const propertyTypeEnum = z.enum(["APARTMENT", "HOUSE_VILLA", "PLOT", "COMMERCIAL_OFFICE", "SHOP"]);
const furnishingEnum = z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]);
const listedByEnum = z.enum(["OWNER", "AGENT"]);
const statusEnum = z.enum(["DRAFT", "PENDING_REVIEW", "VERIFIED", "REJECTED", "ARCHIVED"]);

const propertyBaseSchema = z.object({
  mode: modeEnum,
  propertyType: propertyTypeEnum,
  title: z.string().min(1).max(300),
  description: z.string().max(10000).default(""),
  locationText: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional().nullable(),
  price: z.number().int().nonnegative(),
  currency: z.string().max(10).default("INR"),
  bhk: z.number().int().positive().optional().nullable(),
  areaSqFt: z.number().int().positive().optional().nullable(),
  floorInfo: z.string().max(100).optional().nullable(),
  furnishing: furnishingEnum,
  listedBy: listedByEnum,
  listingContactName: z.string().max(200).optional().nullable(),
  listingContactPhone: z.string().max(20).optional().nullable(),
  listingContactEmail: z.string().email().max(200).optional().nullable(),
  status: statusEnum.default("DRAFT"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  amenityIds: z.array(z.string().uuid()).optional().default([]),
});

export const createPropertySchema = propertyBaseSchema.refine(
  (data) => {
    if (["PLOT", "SHOP"].includes(data.propertyType)) return true;
    return data.bhk != null || data.areaSqFt != null;
  },
  { message: "BHK or area required for this property type", path: ["bhk"] }
);

export const updatePropertySchema = propertyBaseSchema.partial();

export const propertyStatusSchema = z.object({
  status: statusEnum,
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
