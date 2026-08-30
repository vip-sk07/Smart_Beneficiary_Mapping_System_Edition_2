import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { FileText } from "lucide-react";
import type { ApplicationWithScheme } from "@/types";
import { ApplicationsAnimate } from "@/components/ui/PageAnimations";
import UpdateStatusButton from "@/components/applications/UpdateStatusButton";

export const metadata = { title: "My Applications" };

export default async function ApplicationsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        include: { scheme: { include: { category: true } } },
        orderBy: { submittedAt: "desc" },
    }) as ApplicationWithScheme[];

    return (
        <ApplicationsAnimate>
        <div style={{ maxWidth: 960 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 className="page-title">My Applications</h1>
                <p className="page-subtitle">
                    {applications.length} total application{applications.length !== 1 ? "s" : ""}
                </p>
            </div>

            {applications.length === 0 ? (
                <div
                    className="card"
                    style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}
                >
                    <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No applications yet</p>
                    <p style={{ fontSize: 14, marginTop: 6 }}>
                        Browse schemes and apply for the ones you are eligible for.
                    </p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>Scheme</th>
                                <th>Applied On</th>
                                <th>Status</th>
                                <th>External ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                                            {app.scheme.title}
                                        </div>
                                         <div style={{ fontSize: 13, color: "#6b7280" }}>
                                            {app.scheme.category.name}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 13, color: "#6b7280" }}>
                                            {new Intl.DateTimeFormat("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }).format(new Date(app.submittedAt))}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge status={app.status} />
                                    </td>
                                    <td>
                                        <span style={{ fontSize: 13, color: "#6b7280" }}>
                                            {app.externalApplicationId ?? "—"}
                                        </span>
                                    </td>
                                    <td>
                                       <UpdateStatusButton application={app} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </ApplicationsAnimate>
    );
}
