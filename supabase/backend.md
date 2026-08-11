## 1. Database Topology (What each table does)

| Table Name                     | Core Purpose                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| **`profiles`**                 | The base identity for every user. Automatically created when someone signs up.               |
| **`sellers`**                  | The public "Storefront". Automatically created the first time a user posts a listing.        |
| **`listings`**                 | The actual cars for sale. Linked to the seller's profile.                                    |
| **`listing_private_notes`**    | A hyper-secure vault for private seller memos. Strictly separated from public data.          |
| **`taxonomy_options`**         | The live, public categories (Brands, Cities, Colors) used to build your form dropdowns.      |
| **`taxonomy_change_requests`** | A staging queue where Admins propose category changes for Owners to review.                  |
| **`user_notifications`**       | Personal inbox for _everyone_. Holds buyer alerts, seller leads, and personal admin updates. |
| **`owner_notifications`**      | Shared Staff Inbox. System alerts and moderation tasks visible to all Admins and Owners.     |

---

## 2. Access Control Matrix (Who can do what)

This matrix shows exactly how your PostgreSQL Row Level Security (RLS) policies restrict data.

_(Key: **R** = Read, **C** = Create, **U** = Update, **D** = Delete, **-** = Blocked)_

| Table                          | Anonymous / Guest | Logged-in User    | Seller (Owner of Row) | Admin      | App Owner  |
| ------------------------------ | ----------------- | ----------------- | --------------------- | ---------- | ---------- |
| **`profiles`**                 | R                 | R                 | R, U                  | R, U, D    | R, U, D    |
| **`sellers`**                  | R                 | R                 | R, U                  | R, U       | R, U       |
| **`listings`**                 | R _(Active only)_ | R _(Active only)_ | R, C, U, D            | R, C, U, D | R, C, U, D |
| **`listing_private_notes`**    | -                 | -                 | R, C, U, D            | R, C, U, D | R, C, U, D |
| **`taxonomy_options`**         | R                 | R                 | R                     | R          | R, C, U, D |
| **`taxonomy_change_requests`** | -                 | -                 | -                     | R, C       | R, C, U, D |
| **`user_notifications`**       | -                 | R, U _(Own only)_ | R, U _(Own only)_     | R, C, U    | R, C, U    |
| **`owner_notifications`**      | -                 | -                 | -                     | R, C, U, D | R, C, U, D |

---

## 3. Frontend API Reference (How to fetch/send data)

Here are the exact Supabase TypeScript/JavaScript snippets you will use in your frontend components.

### Users & Sellers

```typescript
// Fetch a public seller storefront (for /sellers/[id] page)
const getSellerStore = async (sellerId: string) => {
  return await supabase.from("sellers").select("*").eq("id", sellerId).single();
};

// Update my own user profile
const updateMyProfile = async (userId: string, newCity: string) => {
  return await supabase
    .from("profiles")
    .update({ city: newCity })
    .eq("id", userId);
};
```

### Listings & Private Notes

```typescript
// Fetch all active cars for the public marketplace feed
const getMarketplaceCars = async () => {
  return await supabase
    .from("listings")
    .select("*")
    .in("status", ["AVAILABLE", "NEGOTIABLE"]);
};

// Create a new listing (Seller or Admin)
const createListing = async (carData: any) => {
  return await supabase.from("listings").insert(carData).select("id").single();
};

// Save a private note (Requires the listing ID generated above)
const savePrivateNote = async (
  listingId: string,
  sellerId: string,
  text: string,
) => {
  return await supabase
    .from("listing_private_notes")
    .insert({ listing_id: listingId, seller_id: sellerId, note: text });
};
```

### Taxonomy (Categories & Dropdowns)

```typescript
// Fetch colors to populate a dropdown menu
const getColors = async () => {
  return await supabase
    .from("taxonomy_options")
    .select("value, metadata")
    .eq("category", "COLOR");
};

// ADMIN: Request a new category option
const requestNewCity = async (adminId: string, cityName: string) => {
  return await supabase.from("taxonomy_change_requests").insert({
    category: "CITY",
    action: "ADD",
    value: cityName,
    requested_by: adminId,
  });
};

// OWNER: Approve a taxonomy request (Database triggers handle the rest instantly!)
const approveRequest = async (requestId: string) => {
  return await supabase
    .from("taxonomy_change_requests")
    .update({ status: "APPROVED" })
    .eq("id", requestId);
};
```

### Notifications

```typescript
// Fetch my personal unread notifications (Buyer, Seller, or Admin)
const getMyNotifications = async () => {
  return await supabase
    .from("user_notifications")
    .select("*")
    .eq("is_unread", true);
};

// Mark personal notification as read
const markRead = async (notifId: string) => {
  return await supabase
    .from("user_notifications")
    .update({ is_unread: false })
    .eq("id", notifId);
};

// ADMIN/OWNER: Fetch the shared staff task inbox
const getStaffInbox = async () => {
  return await supabase
    .from("owner_notifications")
    .select("*")
    .eq("is_resolved", false);
};
```

<!-- How to use the analytics table from supabase -->

```typescript
import { supabase } from "./client";

export async function getListingWithAnalytics(listingId: string) {
  // 1. Get the specific car listing
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  // 2. Get the market averages for this specific Brand + Model + Year
  const { data: marketData } = await supabase
    .from("car_market_insights")
    .select("*")
    .eq("brand", listing.brand)
    .eq("model", listing.model)
    .eq("year", listing.year)
    .single();

  // 3. Calculate the Deal Rating!
  let dealRating = "FAIR PRICE";
  let priceDifference = 0;

  if (marketData && marketData.avg_listed_price > 0) {
    priceDifference = listing.price - marketData.avg_listed_price;

    // If it is 5% cheaper than the average, it's a GREAT deal
    if (listing.price <= marketData.avg_listed_price * 0.95) {
      dealRating = "GREAT DEAL";
    }
    // If it is 5% more expensive, it's PRICEY
    else if (listing.price >= marketData.avg_listed_price * 1.05) {
      dealRating = "PRICEY";
    }
  }

  return {
    ...listing,
    analytics: {
      dealRating,
      priceDifference, // Positive means overpriced, negative means underpriced
      marketAverage: marketData?.avg_listed_price || 0,
      activeCompetitors: marketData?.total_active_listings || 1,
      priceTrend30d: marketData
        ? marketData.avg_listed_price - marketData.avg_price_30d_ago
        : 0,
    },
  };
}
```

<!-- Seller table update -->

Name Format Type Description
id

uuid
string
full_name

text
string
verified

boolean
boolean
answer_rate

double precision
number
city

text
string
banner_path

text
string
avatar_path

text
string
created_at

timestamp with time zone
string
updated_at

timestamp with time zone
string
active_listings_count

integer
number
total_sold_count

integer
number
seller_score

integer
number

```typescript
import { supabase } from "./client";

export async function getTopShowcaseSellers() {
  const { data: topSellers, error } = await supabase
    .from("sellers")
    .select(
      "id, full_name, avatar_path, city, verified, answer_rate, active_listings_count",
    )
    .order("seller_score", { ascending: false }) // Sort by highest score first
    .limit(4); // Only grab the top 4!

  if (error) throw error;
  return topSellers;
}
```

to get for each seller

```typescript
import { supabase } from "./client";

// Fetch analytics for a specific seller
export async function getMySellerInsights(sellerId: string) {
  const { data: seller, error } = await supabase
    .from("sellers")
    .select(
      `
      id,
      full_name,
      verified,
      answer_rate,
      active_listings_count,
      total_sold_count,
      seller_score
    `,
    )
    .eq("id", sellerId) // Target the specific user
    .single(); // Return an object, not an array

  if (error) {
    console.error("Error fetching seller insights:", error);
    throw error;
  }

  return seller;
}
```
