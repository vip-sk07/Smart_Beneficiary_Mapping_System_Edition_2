import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import { DashboardAnimate } from "@/components/ui/PageAnimations";
import HouseholdWelfareValueCard from "@/components/welfare/HouseholdWelfareValueCard";
import LifeEventTriggersCard from "@/components/welfare/LifeEventTriggersCard";
import {
    FileText,
    CheckCircle2,
    Clock,
    Search,
    AlertCircle,
    Megaphone,
    ArrowRight,
    BookOpen,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    ChevronRight,
    Star,
    AlertTriangle,
} from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");
    // Admins have no business on the user dashboard — send them to admin panel
    if (session.user.role === "ADMIN") redirect("/admin/stats");

    const userId = session.user.id;

    const [
        schemeCount,
        applicationCounts,
        grievanceCounts,
        announcements,
        expiringDocuments,
        user,
    ] = await Promise.all([
        prisma.scheme.count({ where: { isActive: true } }),
        prisma.application.groupBy({
            by: ["status"],
            where: { userId },
            _count: true,
        }),
        prisma.grievance.groupBy({
            by: ["status"],
            where: { userId },
            _count: true,
        }),
        (prisma as any).announcement.findMany({
            where: { isActive: true },
            orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
            include: { scheme: { select: { id: true, title: true } } },
            take: 4,
        }),
        prisma.document.findMany({
            where: {
                userId,
                expiresAt: {
                    lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    gte: new Date(), // Not expired yet
                },
            },
            select: {
                id: true,
                name: true,
                type: true,
                expiresAt: true,
            },
            orderBy: { expiresAt: "asc" },
            take: 3,
        }),
        (prisma as any).user.findUnique({
            where: { id: userId },
        }),
    ]);

    // RAG: Zero-Click AI Recommendation Engine
    let recommendedSchemes: any[] = [];
    if (user) {
        try {
            const { embedText } = require("@/lib/embeddings");
            const { searchSimilarSchemes } = require("@/lib/rag");
            
            // Construct a rich natural language profile for the embedding engine
            const profileParts = [
                user.age ? `${user.age} year old` : "",
                user.gender ? user.gender.toLowerCase() : "",
                user.occupation ? `working as ${user.occupation}` : "",
                user.state ? `from ${user.state}` : "",
                user.annualIncome ? `with annual income of ₹${user.annualIncome}` : "",
                user.caste ? `belonging to ${user.caste} category` : "",
            ].filter(Boolean);
            
            const profileQuery = profileParts.length > 0 
                ? `I am a ${profileParts.join(" ")}. I need government schemes, scholarships, or financial benefits.` 
                : "Government schemes and benefits.";
                
            const queryVector = await embedText(profileQuery);
            const matches = await searchSimilarSchemes(queryVector, 3);
            
            // Map matches into recommendations with a percentage score
            recommendedSchemes = matches.map((m: any) => ({
                id: m.id,
                title: m.title,
                description: m.description,
                category: m.category,
                matchScore: Math.round(m.similarity * 100)
            }));
        } catch (error) {
            console.error("Dashboard RAG recommendation failed:", error);
        }
    }

    const appByStatus = Object.fromEntries(
        applicationCounts.map((a) => [a.status, a._count])
    );
    const totalApps = applicationCounts.reduce((s, a) => s + a._count, 0);
    const openGrievances = grievanceCounts
        .filter((g) => g.status === "OPEN" || g.status === "IN_PROGRESS")
        .reduce((s, g) => s + g._count, 0);

    const firstName = session.user.name?.split(" ")[0] ?? "there";

    const quickActions = [
        {
            href: "/schemes",
            icon: <Search size={20} />,
            label: "Browse All Schemes",
            sub: `${schemeCount} schemes available`,
            color: "#4338ca",
            bg: "rgba(99,102,241,0.1)",
            gradient: "linear-gradient(135deg, #4338ca, #6366f1)",
        },
        {
            href: "/ai-finder",
            icon: <Sparkles size={20} />,
            label: "AI Finder",
            sub: "Describe your situation, AI finds schemes",
            color: "#c026d3",
            bg: "rgba(192,38,211,0.1)",
            gradient: "linear-gradient(135deg, #c026d3, #f472b6)",
            isNew: true,
        },
        {
            href: "/eligibility",
            icon: <ShieldCheck size={20} />,
            label: "Eligibility Check",
            sub: "See what schemes you qualify for",
            color: "#0891b2",
            bg: "rgba(8,145,178,0.1)",
            gradient: "linear-gradient(135deg, #0891b2, #22d3ee)",
        },
        {
            href: "/grievances",
            icon: <AlertCircle size={20} />,
            label: "Submit Grievance",
            sub: openGrievances > 0 ? `${openGrievances} open grievance(s)` : "Report an issue",
            color: "#ea580c",
            bg: "rgba(234,88,12,0.1)",
            gradient: "linear-gradient(135deg, #ea580c, #fb923c)",
        },
        {
            href: "/applications",
            icon: <FileText size={20} />,
            label: "Track Applications",
            sub: `${totalApps} total application(s)`,
            color: "#7c3aed",
            bg: "rgba(124,58,237,0.1)",
            gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
        },
    ];

    return (
        <DashboardAnimate>
            <div style={{ maxWidth: 1200 }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName} 👋
                            </h1>
                            <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 400 }}>
                                Your personalized beneficiary portal — discover, apply, and track government welfare schemes.
                            </p>
                        </div>
                    </div>

                    {/* Subtle welcome pill */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 99, padding: "5px 14px", marginTop: 8 }}>
                        <TrendingUp size={13} color="#4338ca" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca" }}>{schemeCount} active government schemes available for you</span>
                    </div>
                </div>

                {/* Smart Household Financial Welfare Value Card */}
                <HouseholdWelfareValueCard />

                {/* Stat Cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: 16,
                    marginBottom: 32,
                }}>
                    <StatCard title="Available Schemes" value={schemeCount} icon={<BookOpen size={22} />} color="#4338ca" bg="rgba(99,102,241,0.1)" index={0} />
                    <StatCard title="My Applications" value={totalApps} icon={<FileText size={22} />} color="#7c3aed" bg="rgba(124,58,237,0.1)" index={1} />
                    <StatCard title="Approved" value={appByStatus["APPROVED"] ?? 0} icon={<CheckCircle2 size={22} />} color="#16a34a" bg="rgba(22,163,74,0.1)" index={2} />
                    <StatCard title="Pending Review" value={(appByStatus["PENDING"] ?? 0) + (appByStatus["UNDER_REVIEW"] ?? 0)} icon={<Clock size={22} />} color="#ea580c" bg="rgba(234,88,12,0.1)" index={3} />
                </div>

                {/* Proactive Life-Event Triggers */}
                <LifeEventTriggersCard />

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
                    {/* Quick Actions */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>Quick Actions</h2>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Shortcuts to key features</span>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}>
                            {quickActions.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 10, padding: "16px", borderRadius: 16, background: "white", border: "1.5px solid #e8edf5", cursor: "pointer", transition: "all 0.18s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                                    className="group"
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            {item.icon}
                                        </div>
                                        {(item as any).isNew && (
                                            <span style={{ fontSize: 9, fontWeight: 800, background: "linear-gradient(135deg, #f472b6, #c084fc)", color: "white", padding: "2px 7px", borderRadius: 99, letterSpacing: "0.06em" }}>NEW</span>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{item.label}</div>
                                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4, fontWeight: 400 }}>{item.sub}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: item.color }}>
                                        Open <ChevronRight size={13} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    {recommendedSchemes.length > 0 && (
                        <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(192,38,211,0.2)", background: "white", marginBottom: 24 }}>
                            <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(to right, rgba(192,38,211,0.02), rgba(244,114,182,0.02))" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #c026d3, #f472b6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Sparkles size={17} color="white" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                                            AI Top Picks
                                            <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(192,38,211,0.1)", color: "#c026d3", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.05em" }}>LIVE</span>
                                        </h2>
                                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Based on your profile</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {recommendedSchemes.map((scheme: any, i: number) => (
                                    <Link key={scheme.id} href={`/schemes/${scheme.id}`} style={{
                                        textDecoration: "none",
                                        padding: "16px 20px",
                                        borderBottom: i < recommendedSchemes.length - 1 ? "1px solid #f1f5f9" : "none",
                                        display: "block",
                                        transition: "background 0.2s",
                                    }} className="hover:bg-slate-50">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{scheme.title}</span>
                                                </div>
                                                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
                                                    {scheme.description}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                                                <div style={{
                                                    display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 99,
                                                    background: scheme.matchScore > 80 ? "#f0fdf4" : "#f8fafc",
                                                    color: scheme.matchScore > 80 ? "#16a34a" : "#64748b",
                                                    border: scheme.matchScore > 80 ? "1px solid #bbf7d0" : "1px solid #e2e8f0"
                                                }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700 }}>{scheme.matchScore}% Match</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Document Alerts */}
                    {expiringDocuments.length > 0 && (
                        <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #fed7aa", background: "#fffbeb" }}>
                            <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(234,88,12,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <AlertTriangle size={17} color="#ea580c" />
                                    </div>
                                    <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Document Alerts</h2>
                                </div>
                                <Link href="/documents" style={{ fontSize: 12, fontWeight: 700, color: "#ea580c", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                                    View all <ArrowRight size={12} />
                                </Link>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {expiringDocuments.map((doc: any, i: number) => {
                                    const daysUntil = Math.ceil((new Date(doc.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div key={doc.id} style={{
                                            padding: "16px 20px",
                                            borderBottom: i < expiringDocuments.length - 1 ? "1px solid #fed7aa" : "none",
                                            background: "#fffbeb",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5, background: daysUntil <= 7 ? "#dc2626" : "#f59e0b" }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{doc.name}</div>
                                                    <div style={{ fontSize: 12, color: daysUntil <= 7 ? "#dc2626" : "#b45309", fontWeight: 600, marginTop: 2 }}>
                                                        {daysUntil <= 0 ? "Expired!" : `Expires in ${daysUntil} days`}
                                                    </div>
                                                </div>
                                                <Link href="/documents" style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", textDecoration: "none" }}>
                                                    Renew
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Announcements */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(251,191,36,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Megaphone size={17} color="#f59e0b" />
                                </div>
                                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Announcements</h2>
                            </div>
                            <Link href="/announcements" style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>

                        {announcements.length === 0 ? (
                            <div style={{ padding: 40, textAlign: "center" }}>
                                <Star size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                                <p style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>No announcements yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {announcements.map((a: any, i: number) => (
                                    <div key={a.id} style={{
                                        padding: "16px 20px",
                                        borderBottom: i < announcements.length - 1 ? "1px solid #f1f5f9" : "none",
                                        transition: "background 0.15s ease",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                            {/* Left color dot */}
                                            <div style={{
                                                width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                                                background: a.pinned ? "#6366f1" :
                                                    a.category === "deadline" ? "#ef4444" :
                                                        a.category === "new_scheme" ? "#22c55e" :
                                                            "#f59e0b",
                                                boxShadow: a.pinned ? "0 0 0 3px rgba(99,102,241,0.2)" : "none"
                                            }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {/* Tags row */}
                                                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                                                    {a.pinned && (
                                                        <span style={{ fontSize: 9, fontWeight: 800, background: "#eef2ff", color: "#4338ca", padding: "2px 7px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pinned</span>
                                                    )}
                                                    {a.category && (
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.04em",
                                                            background: a.category === "deadline" ? "#fef2f2" : a.category === "new_scheme" ? "#f0fdf4" : "#fff7ed",
                                                            color: a.category === "deadline" ? "#dc2626" : a.category === "new_scheme" ? "#16a34a" : "#ea580c",
                                                        }}>{a.category.replace("_", " ")}</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 4 }}>{a.title}</div>
                                                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{a.content}</div>
                                                {a.schemeId && (
                                                    <Link href={`/schemes/${a.schemeId}`} style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: "#4338ca", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                                        View Scheme <ArrowRight size={11} />
                                                    </Link>
                                                )}
                                            </div>
                                            <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, fontWeight: 500 }}>
                                                {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(a.createdAt))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ padding: "12px 20px", background: "#fafbff", borderTop: "1px solid #f1f5f9" }}>
                                    <Link href="/announcements" style={{ fontSize: 13, fontWeight: 700, color: "#4338ca", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                        View all announcements <ArrowRight size={13} />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardAnimate>
    );
}
