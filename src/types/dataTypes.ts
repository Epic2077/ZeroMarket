export interface Listing {
  id: string;
  // Supabase `listings.seller_id`; also used as `ownerId` in mock/admin contexts.
  seller_id?: string;
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
  // Seller display fields — populated from mock data or joined seller lookups.
  sellerName: string;
  sellerVerified: boolean;
  sellerResponseRate: number;
  sellerMemberSince: string;
  sellerActiveListings: number;
  sellerAvatar: string | null;
  price: number;
  priceUnit: string;
  status: "active" | "pending" | "sold" | "negotiable" | "reserved";
  listedDate: string;
  factoryOptions: string[];
  marketAvgBuy: number;
  marketAvgSell: number;
  priceVsMarket: number;
  trend7d: number;
  /** Admin / seller-only internal note, not shown on the public listing. */
  sellerNotes?: string;
  /** Whether this is a sell listing or a buy request. */
  listingType: "SELL" | "BUY";
}

// ── Market insights (car_market_insights table) ─────────────────────

/** Raw row from the `car_market_insights` table. */
export interface CarMarketInsight {
  id: string;
  brand: string;
  model: string;
  year: string; // text in DB
  totalActiveListings: number;
  avgListedPrice: number;
  avgPrice7dAgo: number;
  avgPrice30dAgo: number;
  avgSoldPrice: number;
  avgDaysToSell: number;
  lastUpdated: string;
}

/** Computed display fields derived from a CarMarketInsight + listing price. */
export interface MarketDisplayFields {
  marketAvgBuy: number;
  marketAvgSell: number;
  priceVsMarket: number; // positive = above market, negative = below
  trend7d: number; // recent trend percentage
}
