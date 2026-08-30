import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Centralised ADMIN role guard for all /admin/* pages.
 * This is a React Server Component — runs on every request before
 * any admin page renders. Non-admins are redirected to /dashboard.
 *
 * Individual admin pages do NOT need to duplicate the auth() + redirect check.
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Redirect unauthenticated users to login
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Redirect non-admins to dashboard
    if (session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
