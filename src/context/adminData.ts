import { toFa } from "@/context/carLabels";
import { sellers } from "@/context/sellers";
import type {
  AdminAccount,
  PlatformRole,
  PlatformUser,
} from "@/types/admin";

/* ------------------------------ Role helpers ----------------------------- */

// Ordered progression — the index drives promote/demote.
export const ROLE_ORDER: PlatformRole[] = [
  "buyer",
  "seller",
  "confirmed_seller",
];

export const roleLabel: Record<PlatformRole, string> = {
  buyer: "خریدار",
  seller: "فروشنده",
  confirmed_seller: "فروشنده تأییدشده",
};

export const nextRole = (role: PlatformRole): PlatformRole | null =>
  ROLE_ORDER[ROLE_ORDER.indexOf(role) + 1] ?? null;

export const prevRole = (role: PlatformRole): PlatformRole | null =>
  ROLE_ORDER[ROLE_ORDER.indexOf(role) - 1] ?? null;

/* --------------------------- Derived seller users ------------------------ */

// Every seller (aggregated from listings) becomes a managed platform user, so
// the panels operate on the same underlying catalog the marketplace shows.
const sellerUsers: PlatformUser[] = sellers.map((seller) => {
  const salesVolume = seller.listings.reduce((sum, l) => sum + l.price, 0);
  return {
    id: `usr-${seller.slug}`,
    name: seller.name,
    email: `${seller.slug}@zeromarket.ir`,
    phone: "۰۹۱۲ ۰۰۰ ۰۰۰۰",
    city: seller.city,
    avatar: seller.avatar,
    role: seller.verified ? "confirmed_seller" : "seller",
    status: "active",
    joinedAt: toFa(seller.memberSince),
    analytics: {
      requests: 6 + (seller.totalListings % 9),
      views: 120 + seller.totalListings * 37,
      salesVolume,
      responseRate: seller.responseRate,
      conversion: 30 + (seller.responseRate % 25),
    },
  };
});

/* ------------------------------- Buyer users ----------------------------- */

const buyerUsers: PlatformUser[] = [
  {
    id: "usr-nima-asadi",
    name: "نیما اسدی",
    email: "nima.asadi@example.com",
    phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
    city: "تهران",
    avatar: "نا",
    role: "buyer",
    status: "active",
    joinedAt: "۱۴۰۲",
    analytics: {
      requests:3,
      views: 126,
      salesVolume: 0,
      responseRate: 0,
      conversion: 0,
    },
  },
  {
    id: "usr-sara-mohammadi",
    name: "سارا محمدی",
    email: "sara.mohammadi@example.com",
    phone: "۰۹۳۵ ۱۱۲ ۴۴۵۶",
    city: "اصفهان",
    avatar: "سم",
    role: "buyer",
    status: "active",
    joinedAt: "۱۴۰۳",
    analytics: {
      requests:5,
      views: 212,
      salesVolume: 0,
      responseRate: 0,
      conversion: 0,
    },
  },
  {
    id: "usr-mohammad-karimi",
    name: "محمد کریمی",
    email: "mohammad.karimi@example.com",
    phone: "۰۹۱۹ ۸۷۶ ۵۴۳۲",
    city: "مشهد",
    avatar: "مک",
    role: "buyer",
    status: "suspended",
    joinedAt: "۱۴۰۱",
    analytics: {
      requests:1,
      views: 64,
      salesVolume: 0,
      responseRate: 0,
      conversion: 0,
    },
  },
];

export const initialUsers: PlatformUser[] = [...buyerUsers, ...sellerUsers];

/* --------------------------------- Admins -------------------------------- */

// One of these acts as the signed-in admin in the admin panel (mock auth).
export const CURRENT_ADMIN_ID = "adm-roya";

// The seller whose dashboard is active (mock auth for the seller panel).
export const CURRENT_SELLER_ID = "usr-aria-motors";

export const initialAdmins: AdminAccount[] = [
  {
    id: "adm-roya",
    name: "رؤیا کاظمی",
    email: "roya.kazemi@zeromarket.ir",
    avatar: "رک",
    assignedUserIds: [
      "usr-nima-asadi",
      "usr-aria-motors",
      "usr-bavarian-motors-th",
    ],
  },
  {
    id: "adm-hesam",
    name: "حسام رفیعی",
    email: "hesam.rafiei@zeromarket.ir",
    avatar: "حر",
    assignedUserIds: ["usr-sara-mohammadi", "usr-parsian-auto"],
  },
];
