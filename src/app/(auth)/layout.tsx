import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Layout for authentication pages (/login, /register).
 * If the user is already logged in, redirect them to the dashboard
 * so they don't see the login screen while authenticated.
 */
export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Already logged in → go to dashboard
    if (session?.user?.id) {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
