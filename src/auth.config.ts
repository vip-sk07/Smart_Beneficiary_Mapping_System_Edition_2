import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            const PUBLIC_PATHS = ["/", "/login", "/register", "/mock-portal", "/offline", "/schemes"];

            // Always allow public paths, schemes browsing, webhooks, and NextAuth API routes
            if (
                PUBLIC_PATHS.includes(pathname) ||
                pathname.startsWith("/api/auth") ||
                pathname.startsWith("/api/schemes") ||
                pathname.startsWith("/api/webhook/") ||
                pathname.startsWith("/api/centers/") ||
                pathname.startsWith("/schemes/")
            ) {
                return true;
            }

            if (!isLoggedIn) {
                return false; // Will redirect to /login
            }

            // Admin routes check
            if (pathname.startsWith("/admin")) {
                const role = (auth.user as { role?: string })?.role;
                if (role !== "ADMIN") {
                    return NextResponse.redirect(new URL("/dashboard", nextUrl));
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role ?? "USER";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    providers: [], // Configured with full providers in auth.ts (Node.js runtime)
} satisfies NextAuthConfig;
