import { CompanyMemberRole } from "./enums";

export const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/api/v1/auth",
  "/api/v1/auth/auroraAuth",
  "/api/health",
  "/api/v1/auth/callback",
  "/auth/auroraAuth",
];

export const PRIVATE_ROUTES = ["/console"];

export const ADMIN_ROUTES = ["/admin"];

export const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.includes(pathname);
};

export const isPrivateRoute = (pathname: string) => {
  return PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
};

export const isAdminRoute = (pathname: string) => {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
};

export const isMagicLink = (pathname: string) => {
  return pathname === "/access/callback";
};

export const isBypassRoute = (pathname: string) => {
  return pathname.startsWith("/api/v1/access/register");
};

export const ROUTE_ROLE_REQUIREMENTS: {
  path: string;
  role?: CompanyMemberRole;
}[] = [
  { path: "/dashboard" },
  { path: "/admin", role: CompanyMemberRole.ADMIN },
];
