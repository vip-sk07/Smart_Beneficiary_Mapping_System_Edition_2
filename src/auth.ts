process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    providers: [
        ...authConfig.providers,
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                // Rate limit check - 10 login attempts per IP per 10 minutes
                const clientIP = req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim()
                    || req?.headers?.get("x-real-ip")
                    || "unknown";

                const rateLimitResult = await rateLimit(`login:${clientIP}`, 10, 600);
                if (!rateLimitResult.success) {
                    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
                }

                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const valid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );
                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
});
