export function formatPrice(price: number, currency: string = "INR"): string {
  if (currency === "INR") {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPropertyType(type: string): string {
  const map: Record<string, string> = {
    apartment: "Apartment",
    house_villa: "House/Villa",
    plot: "Plot",
    commercial_office: "Commercial Office",
    shop: "Shop",
  };
  return map[type] ?? type;
}

export function formatFurnishing(furnishing: string): string {
  const map: Record<string, string> = {
    unfurnished: "Unfurnished",
    semi_furnished: "Semi-Furnished",
    furnished: "Furnished",
  };
  return map[furnishing] ?? furnishing;
}
