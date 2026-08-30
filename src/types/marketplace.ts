export interface FilterState {
  search: string;
  brand: string;
  bodyType: string;
  city: string;
  fuelType: string;
  priceMin: string;
  priceMax: string;
  verifiedOnly: boolean;
  status: string;
  listingType: string;
  sortBy: string;
  sortDir: "asc" | "desc";
}
