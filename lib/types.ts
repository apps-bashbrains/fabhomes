export type PropertyMode = "buy" | "rent" | "commercial";

export type PropertyType =
  | "apartment"
  | "house_villa"
  | "plot"
  | "commercial_office"
  | "shop";

export type FurnishingType =
  | "unfurnished"
  | "semi_furnished"
  | "furnished";

export type Amenity =
  | "lift"
  | "parking"
  | "security"
  | "power_backup"
  | "clubhouse"
  | "gym"
  | "park";

export type PropertyBadge =
  | "verified"
  | "new"
  | "owner"
  | "agent";

export interface Property {
  id: string;
  mode: PropertyMode;
  title: string;
  location: string;
  city: string;
  price: number;
  currency: string;
  bhk: number | null;
  areaSqFt: number | null;
  propertyType: PropertyType;
  floorInfo?: string;
  furnishing: FurnishingType;
  listedBy: "owner" | "agent";
  description: string;
  amenities: Amenity[];
  badges: PropertyBadge[];
  mainImageUrl: string;
  imageUrls: string[];
  createdAt: string | Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}
