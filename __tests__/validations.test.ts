/**
 * Validation schema tests – no server required.
 * Ensures request bodies are validated correctly for API contracts.
 */
import { createLeadSchema } from "@/lib/validations/lead";
import { createUserQuerySchema } from "@/lib/validations/user-query";
import { createListingRequestSchema } from "@/lib/validations/listing-request";

describe("createLeadSchema", () => {
  const valid = {
    name: "Test User",
    mobile: "9876543210",
    email: "test@example.com",
    message: "Interested",
  };

  it("accepts valid payload", () => {
    expect(createLeadSchema.parse(valid)).toEqual({ ...valid, interestedInSimilar: false });
  });

  it("accepts without email and with propertyId", () => {
    const out = createLeadSchema.parse({
      name: "A",
      mobile: "9876543210",
      propertyId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    });
    expect(out.name).toBe("A");
    expect(out.propertyId).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
  });

  it("rejects short name", () => {
    expect(() => createLeadSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejects invalid mobile", () => {
    expect(() => createLeadSchema.parse({ ...valid, mobile: "123" })).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() => createLeadSchema.parse({ ...valid, email: "not-an-email" })).toThrow();
  });
});

describe("createUserQuerySchema", () => {
  const valid = {
    mobile: "9876543210",
    mode: "BUY",
    city: "Noida",
    message: "Need 2BHK",
  };

  it("accepts valid payload", () => {
    expect(createUserQuerySchema.parse(valid)).toMatchObject(valid);
  });

  it("accepts with budget and bhk", () => {
    const out = createUserQuerySchema.parse({
      ...valid,
      budgetMin: 60_00_000,
      budgetMax: 80_00_000,
      bhk: 2,
    });
    expect(out.budgetMin).toBe(60_00_000);
    expect(out.bhk).toBe(2);
  });

  it("rejects short message", () => {
    expect(() => createUserQuerySchema.parse({ ...valid, message: "" })).toThrow();
  });

  it("rejects invalid mode", () => {
    expect(() => createUserQuerySchema.parse({ ...valid, mode: "INVALID" })).toThrow();
  });
});

describe("createListingRequestSchema", () => {
  const valid = {
    mode: "BUY",
    propertyType: "APARTMENT",
    locationText: "Sector 18",
    city: "Noida",
    price: 75_00_000,
    description: "Spacious",
  };

  it("accepts valid payload", () => {
    expect(createListingRequestSchema.parse(valid)).toMatchObject(valid);
  });

  it("accepts with bhk and furnishing", () => {
    const out = createListingRequestSchema.parse({
      ...valid,
      bhk: 2,
      furnishing: "FURNISHED",
    });
    expect(out.bhk).toBe(2);
    expect(out.furnishing).toBe("FURNISHED");
  });

  it("rejects missing city", () => {
    expect(() =>
      createListingRequestSchema.parse({ ...valid, city: "" })
    ).toThrow();
  });

  it("rejects negative price", () => {
    expect(() =>
      createListingRequestSchema.parse({ ...valid, price: -1 })
    ).toThrow();
  });
});
