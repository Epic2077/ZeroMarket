export interface Listing {
  id: string;
  // Managed-platform owner (`usr-<slug>`); attached when seeding the
  // ListingsProvider so panels can group a seller's products.
  ownerId?: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  color: string;
  colorHex: string;
  engine: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  city: string;
  deliveryDays: number;
  sellerName: string;
  sellerVerified: boolean;
  sellerResponseRate: number;
  sellerMemberSince: string;
  sellerActiveListings: number;
  sellerAvatar: string;
  price: number;
  priceUnit: string;
  status: "active" | "pending" | "sold" | "negotiable" | "reserved";
  listedDate: string;
  factoryOptions: string[];
  marketAvgBuy: number;
  marketAvgSell: number;
  priceVsMarket: number;
  trend7d: number;
}
