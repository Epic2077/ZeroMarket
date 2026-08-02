import { toFa } from "@/context/carLabels";
import { sellers } from "@/context/sellers";
import type {
  AdminAccount,
  PlatformRole,
  PlatformUser,
  ProfileRole,
} from "@/types/admin";

/* ------------------------------ Role helpers ----------------------------- */

export const roleLabel: Record<ProfileRole, string> = {
  USER: "کاربر",
  ADMIN: "مدیر",
  OWNER: "مالک",
};

export const ROLE_ORDER: ProfileRole[] = ["USER", "ADMIN", "OWNER"];

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
    avatarPath: null,
    role: seller.verified ? "OWNER" : "USER",
    verified: seller.verified,
    status: "ACTIVE",
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
    avatarPath: null,
    role: "USER",
    verified: false,
    status: "ACTIVE",
    joinedAt: "۱۴۰۲",
    analytics: {
      requests: 3,
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
    avatarPath: null,
    role: "USER",
    verified: false,
    status: "ACTIVE",
    joinedAt: "۱۴۰۳",
    analytics: {
      requests: 5,
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
    avatarPath: null,
    role: "USER",
    verified: false,
    status: "SUSPENDED",
    joinedAt: "۱۴۰۱",
    analytics: {
      requests: 1,
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
