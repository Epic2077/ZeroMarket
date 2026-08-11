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

// TODO: Migrate to Supabase sellers via useSellers() hook.
const sellerUsers: PlatformUser[] = [];

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
