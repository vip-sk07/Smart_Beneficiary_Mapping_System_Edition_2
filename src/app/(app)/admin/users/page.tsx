import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "Manage Users – Admin" };

export default async function AdminUsersPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/dashboard");

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true, name: true, email: true, role: true, state: true,
            occupation: true, createdAt: true,
            _count: { select: { applications: true, grievances: true } },
        },
    });

    return (
        <div style={{ maxWidth: 1100 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 className="page-title">Manage Users</h1>
                <p className="page-subtitle">{users.length} registered users</p>
            </div>

            <UsersTable users={users} />
        </div>
    );
}
