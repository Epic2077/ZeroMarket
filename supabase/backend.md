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
  return await supabase
    .from("taxonomy_change_requests")
    .insert({
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
