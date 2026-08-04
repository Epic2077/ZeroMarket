# Hooks

All hooks are client-side (`"use client"`) and follow a consistent pattern:

| Pattern                             | Description                                                           |
| ----------------------------------- | --------------------------------------------------------------------- |
| `{ data, loading, error, refresh }` | Async fetch on mount, manual refresh via `refresh()`                  |
| `useCallback` for `load`            | Stable reference, called in `useEffect` on mount and when deps change |
| Error as `string \| null`           | Persian error messages where appropriate                              |

---

## `useListings`

Listings from Supabase `listings` table. Returns raw `ListingRow[]` — convert to frontend `Listing` with `listingRowToListing()`.

```ts
import {
  useListings,
  useListing,
  useSellerListings,
} from "@/hooks/useListings";
```

### `useListings(filter?)`

```ts
const { listings, loading, error, refresh } = useListings({
  status: "AVAILABLE",
});
// listings: ListingRow[]
```

| Param             | Type                                                                        | Default |
| ----------------- | --------------------------------------------------------------------------- | ------- |
| `filter.status`   | `"WAITING" \| "AVAILABLE" \| "NEGOTIABLE" \| "SOLD" \| "RESERVED" \| Array` | all     |
| `filter.brand`    | `string`                                                                    | none    |
| `filter.sellerId` | `string` (UUID)                                                             | none    |
| `filter.search`   | `string` (ilike on brand/model/trim)                                        | none    |

### `useListing(id)`

```ts
const { listing, loading, error, refresh } = useListing("uuid-here");
// listing: ListingRow | null
```

### `useSellerListings(sellerId)`

```ts
const { listings, loading, error, refresh } = useSellerListings("seller-uuid");
```

---

## `useSellers`

Sellers from Supabase `sellers` table with listing aggregates. Returns `SellerSummary[]` (includes `id`).

```ts
import { useSellers, useSeller } from "@/hooks/useSellers";
```

### `useSellers()`

```ts
const { sellers, loading, error, refresh } = useSellers();
// sellers: SellerSummary[]
//   { id, slug, name, nameEn, avatar, city, verified,
//     responseRate, memberSince, activeListings, totalListings,
//     brands, listings }
```

Fetches all sellers + their listing aggregates in one parallel call. Build a lookup map for joining with listings:

```tsx
const { sellers } = useSellers();
const sellersMap = new Map(sellers.map((s) => [s.id, s]));

// In a cell: sellersMap.get(listing.seller_id)?.name
```

### `useSeller(id)`

```ts
const { seller, loading, error, refresh } = useSeller("seller-uuid");
// seller: (SellerRow & { summary: SellerSummary }) | null
```

---

## `useTaxonomyOptions`

Taxonomy options (brands, colors, cities, body types, years) from Supabase `taxonomy` table. **Base hook** — used by `useTaxonomyManager` and `useCarSpecsManager`.

```ts
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
```

### `useTaxonomyOptions()`

```ts
const { taxonomy, values, loading, error, refresh } = useTaxonomyOptions();
```

| Return        | Type                                                                                                            | Description                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `taxonomy`    | `Record<"BRAND" \| "COLOR" \| "CITY" \| "BODY_TYPE" \| "YEAR" \| "TRANSMISSION" \| "FUEL_TYPE", TaxonomyRow[]>` | All taxonomy rows grouped by category        |
| `values(cat)` | `(cat: TaxonomyCategory) => string[]`                                                                           | Flat list of `.value` strings for a category |
| `loading`     | `boolean`                                                                                                       | Initial fetch in progress                    |
| `error`       | `string \| null`                                                                                                | Fetch error                                  |
| `refresh`     | `() => void`                                                                                                    | Re-fetch all taxonomy                        |

```tsx
const { values, loading } = useTaxonomyOptions();

// Get brand dropdown options
const brandOptions = useMemo(() => values("BRAND"), [values]);
// → ["تویوتا", "هیوندای", ...]

const colorOptions = useMemo(() => values("COLOR"), [values]);
// → ["مشکی", "سفید", ...]
```

---

## `useTaxonomyManager`

Full CRUD manager for taxonomy (brands, models, colors, cities, etc.). Wrap the entire taxonomy admin page. Owner/admins can add/remove/rename; regular users submit change requests.

```ts
import { useTaxonomyManager } from "@/hooks/useTaxonomyManager";
```

### `useTaxonomyManager()`

```ts
const {
  taxonomy,
  values,
  loading,
  error,
  refresh,
  active,
  setActive, // current category tab
  draft,
  setDraft, // new option text input
  saving, // true during add/remove/rename
  expandedBrands,
  setExpandedBrands,
  modelsByBrand,
  modelsLoading,
  modelDrafts,
  setModelDrafts,
  canEdit,
  isOwner,
  isAdmin,
  handleAdd, // add option to active category
  handleRemove, // remove option
  handleRename, // rename option
  handleAddModel, // add model under a brand
  loadModels, // fetch models grouped by brand
  toggleBrand, // expand/collapse brand accordion
} = useTaxonomyManager();
```

---

## `useCarSpecsManager`

Car specifications manager (engine, transmission, fuel type, body type per brand/model/year). Owner page for managing car specs.

```ts
import { useCarSpecsManager } from "@/hooks/useCarSpecsManager";
```

### `useCarSpecsManager()`

```ts
const {
  grouped, // BrandSpecGroup[] — brand → model → specs
  brandOptions,
  yearOptions,
  modelOptions,
  modelsLoading,
  transmissionOptions,
  fuelTypeOptions,
  bodyTypeOptions,
  loading,
  error,
  refresh,
  canEdit,
  isOwner,
  isAdmin,
  saving,
  expandedBrands,
  toggleBrand,
  // Form state
  editingSpec,
  setEditingSpec,
  formBrand,
  setFormBrand,
  formModel,
  setFormModel,
  formYear,
  setFormYear,
  formEngine,
  setFormEngine,
  formTransmission,
  setFormTransmission,
  formFuelType,
  setFormFuelType,
  formBodyType,
  setFormBodyType,
  // Actions
  handleSaveSpec, // upsert spec
  handleDeleteSpec, // delete spec by id
  resetForm, // clear form state
} = useCarSpecsManager();
```

---

## `useAdminUsers`

Paginated admin user list from `/api/admin/users`.

```ts
import { useAdminUsers } from "@/hooks/useAdminUsers";
```

### `useAdminUsers(initialPage?, pageSize?)`

```ts
const {
  users,
  total,
  page,
  limit,
  loading,
  error,
  goToPage,
  setPageSize,
  refresh,
} = useAdminUsers(1, 10);
```

| Return           | Type                     | Description            |
| ---------------- | ------------------------ | ---------------------- |
| `users`          | `AdminUserRow[]`         | Current page of users  |
| `total`          | `number`                 | Total user count       |
| `page`           | `number`                 | Current page (1-based) |
| `limit`          | `number`                 | Page size              |
| `goToPage(n)`    | `(page: number) => void` | Navigate to page       |
| `setPageSize(n)` | `(size: number) => void` | Change page size       |
| `refresh`        | `() => void`             | Re-fetch current page  |

---

## Common patterns

### Joining seller data with listings

```tsx
import { useListings } from "@/hooks/useListings";
import { useSellers } from "@/hooks/useSellers";
import { listingRowToListing } from "@/lib/supabase/listings";

function MyTable() {
  const { listings: rows, loading } = useListings();
  const { sellers } = useSellers();
  const sellersMap = new Map(sellers.map((s) => [s.id, s]));

  const data = rows.map(listingRowToListing);

  return data.map((listing) => (
    <div key={listing.id}>
      {sellersMap.get(listing.seller_id ?? "")?.name ?? listing.sellerName}
    </div>
  ));
}
```

### Error + loading states

```tsx
if (loading) return <Spinner />;
if (error) return <ErrorBanner message={error} onRetry={refresh} />;
```
