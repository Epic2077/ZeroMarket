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
// `/dashboard/manage/products` is intentionally excluded — sellers can edit
// their own listings there (enforced client-side by ProductEditorGuard).
const ADMIN_OR_OWNER_PREFIXES = ["/dashboard/admin", "/dashboard/manage/users"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function normalizeRole(value: unknown): AppRole {
  if (typeof value !== "string") {
    return "USER";
  }

  const role = value.toUpperCase();
  if (role === "OWNER") {
    return "OWNER";
  }
  if (role === "ADMIN") {
    return "ADMIN";
  }

  return "USER";
}

function redirectSuspendedAccount(request: NextRequest) {
  const suspendedUrl = new URL("/suspended", request.url);
  return NextResponse.redirect(suspendedUrl);
}

function isSafeInternalRedirect(path: string | null) {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

function defaultPathForRole(role: AppRole) {
  if (role === "OWNER") {
    return "/dashboard/owner";
  }
  if (role === "ADMIN") {
    return "/dashboard/admin";
  }
  return "/dashboard/user";
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirectTo", returnTo);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

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

  let role: AppRole = "USER";
  let status: AppStatus = "ACTIVE";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle<{
      role: AppRole | string | null;
      status: AppStatus | string | null;
    }>();

  role = normalizeRole(profile?.role);
  status = (
    profile?.status?.toUpperCase() === "SUSPENDED" ? "SUSPENDED" : "ACTIVE"
  ) as AppStatus;

  const isOnSuspendedSafePage = SUSPENDED_SAFE_PAGES.some((route) =>
    matchesPrefix(pathname, route),
  );

  // Redirect suspended users to the suspended page (unless already on a safe page)
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
