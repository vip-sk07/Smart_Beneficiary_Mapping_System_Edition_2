import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/mock-portal", "/offline", "/schemes"];
const API_AUTH_PREFIX = "/api/auth";
const API_SCHEMES_PREFIX = "/api/schemes";
const ADMIN_PREFIX = "/admin";

export default auth(function middleware(req: NextRequest & { auth: unknown }) {
    const pathname = req.nextUrl.pathname;
    const session = (req as NextRequest & { auth: { user?: { role?: string } } | null }).auth;

    // Always allow public paths, schemes browsing, webhooks, and NextAuth API routes
    if (
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith(API_AUTH_PREFIX) ||
        pathname.startsWith(API_SCHEMES_PREFIX) ||
        pathname.startsWith("/api/webhook/") ||
        pathname.startsWith("/schemes/")
    ) {
        return NextResponse.next();
    }

    // Not authenticated → redirect to login
    if (!session) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes → redirect non-admins to dashboard
    if (pathname.startsWith(ADMIN_PREFIX)) {
        if (session.user?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
