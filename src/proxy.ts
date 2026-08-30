import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type AppRole = "USER" | "ADMIN" | "OWNER";
type AppStatus = "ACTIVE" | "SUSPENDED";

const AUTH_PAGES = ["/auth/login", "/auth/signup"];
const AUTH_REQUIRED_PREFIXES = [
  "/dashboard",
  "/user-profile",
  "/market/listings",
];
const SUSPENDED_SAFE_PAGES = [
  "/suspended",
  "/auth",
  "/api",
  "/_next",
  "/favicon.ico",
];
const OWNER_ONLY_PREFIXES = ["/dashboard/owner"];
const ADMIN_OR_OWNER_PREFIXES = ["/dashboard/admin", "/dashboard/manage/users"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalizeRole(value: unknown): AppRole {
  if (typeof value !== "string") return "USER";
  const role = value.toUpperCase();
  if (role === "OWNER") return "OWNER";
  if (role === "ADMIN") return "ADMIN";
  return "USER";
}

function redirectSuspendedAccount(request: NextRequest) {
  return NextResponse.redirect(new URL("/suspended", request.url));
}

function isSafeInternalRedirect(path: string | null) {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

function defaultPathForRole(role: AppRole) {
  if (role === "OWNER") return "/dashboard/owner";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/user";
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirectTo", returnTo);
  return NextResponse.redirect(loginUrl);
}

// Renamed to middleware for standard Next.js execution (or proxy if using Next 16 proxy convention)
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Fallback Guard Check: Prevents crashing if env vars are missing on Vercel
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isAuthPage = AUTH_PAGES.some((route) => matchesPrefix(pathname, route));
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((route) =>
    matchesPrefix(pathname, route),
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (requiresAuth && !user) {
    return redirectToLogin(request);
  }

  if (!user) {
    return response;
  }

  // Fetch profile role/status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle<{
      role: AppRole | string | null;
      status: AppStatus | string | null;
    }>();

  const role = normalizeRole(profile?.role);
  const status: AppStatus =
    profile?.status?.toUpperCase() === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";

  const isOnSuspendedSafePage = SUSPENDED_SAFE_PAGES.some((route) =>
    matchesPrefix(pathname, route),
  );

  if (status === "SUSPENDED" && !isOnSuspendedSafePage) {
    return redirectSuspendedAccount(request);
  }

  if (isAuthPage) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const target =
      isSafeInternalRedirect(redirectTo) &&
      !AUTH_PAGES.some((route) => matchesPrefix(redirectTo!, route))
        ? redirectTo!
        : defaultPathForRole(role);

    return NextResponse.redirect(new URL(target, request.url));
  }

  if (role !== "OWNER") {
    const isOwnerOnlyRoute = OWNER_ONLY_PREFIXES.some((route) =>
      matchesPrefix(pathname, route),
    );

    if (isOwnerOnlyRoute) {
      return NextResponse.redirect(
        new URL(defaultPathForRole(role), request.url),
      );
    }
  }

  if (role !== "OWNER" && role !== "ADMIN") {
    const isAdminOrOwnerRoute = ADMIN_OR_OWNER_PREFIXES.some((route) =>
      matchesPrefix(pathname, route),
    );

    if (isAdminOrOwnerRoute) {
      return NextResponse.redirect(
        new URL(defaultPathForRole(role), request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf)$).*)",
  ],
};
