import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
    Shield,
    Sparkles,
    FileText,
    Users,
    ArrowRight,
    CheckCircle2,
    Search,
    MapPin,
    Building2,
    GraduationCap,
    HeartPulse,
    Briefcase,
    Home,
    Coins,
    UserCheck,
    Lock,
    ExternalLink,
    HelpCircle,
    ChevronRight,
    Layers,
    BadgeCheck
} from "lucide-react";
import {
    AnimatedHeroSection,
    AnimatedFeatureCard,
    AnimatedSection,
    AnimatedStat
} from "@/components/landing/LandingAnimations";

export default async function LandingPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    const categories = [
        {
            icon: <Coins size={22} color="#16a34a" />,
            name: "Agriculture, Rural & Farming",
            count: "1,100+ Schemes",
            href: "/schemes?search=agriculture",
            bg: "#f0fdf4",
            border: "#bbf7d0"
        },
        {
            icon: <GraduationCap size={22} color="#2563eb" />,
            name: "Education, Scholarships & Learning",
            count: "850+ Schemes",
            href: "/schemes?search=scholarship",
            bg: "#eff6ff",
            border: "#bfdbfe"
        },
        {
            icon: <HeartPulse size={22} color="#dc2626" />,
            name: "Health, Medical & Wellness",
            count: "620+ Schemes",
            href: "/schemes?search=health",
            bg: "#fef2f2",
            border: "#fecaca"
        },
        {
            icon: <Briefcase size={22} color="#7c3aed" />,
            name: "Business, MSME & Entrepreneurship",
            count: "490+ Schemes",
            href: "/schemes?search=business",
            bg: "#f5f3ff",
            border: "#ddd6fe"
        },
        {
            icon: <UserCheck size={22} color="#db2777" />,
            name: "Women & Child Development",
            count: "380+ Schemes",
            href: "/schemes?search=women",
            bg: "#fdf2f8",
            border: "#fbcfe8"
        },
        {
            icon: <Coins size={22} color="#ca8a04" />,
            name: "Banking, Financial Services & Insurance",
            count: "320+ Schemes",
            href: "/schemes?search=insurance",
            bg: "#fefce8",
            border: "#fef08a"
        },
        {
            icon: <Home size={22} color="#0891b2" />,
            name: "Housing, Shelter & Urban Affairs",
            count: "210+ Schemes",
            href: "/schemes?search=housing",
            bg: "#ecfeff",
            border: "#a5f3fc"
        },
        {
            icon: <Users size={22} color="#475569" />,
            name: "Social Justice & Empowerment",
            count: "450+ Schemes",
            href: "/schemes?search=welfare",
            bg: "#f8fafc",
            border: "#e2e8f0"
        }
    ];

    const popularStates = [
        "Maharashtra",
        "Uttar Pradesh",
        "Tamil Nadu",
        "Karnataka",
        "Delhi",
        "Gujarat",
        "Rajasthan",
        "Bihar",
        "Kerala",
        "Assam",
        "Punjab",
        "Himachal Pradesh",
        "West Bengal",
        "Madhya Pradesh",
        "Telangana"
    ];

    const stats = [
        { value: "4,700+", label: "Active Government Schemes" },
        { value: "36", label: "States & Union Territories" },
        { value: "100%", label: "Direct Official Ministry Portals" },
        { value: "0 ₹", label: "Free for Every Citizen" },
    ];

    return (
        <div style={{ fontFamily: "Sora, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
            
            {/* 1. Indian Tricolor Top Stripe */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #FF9933 33.3%, #FFFFFF 33.3% 66.6%, #138808 66.6%)" }} />

            {/* 2. National Accessibility & Header Bar */}
            <div style={{
                background: "#f1f5f9",
                borderBottom: "1px solid #e2e8f0",
                padding: "6px 32px",
                fontSize: 11.5,
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    <span style={{ color: "#FF9933" }}>🇮🇳</span>
                    <span>GOVERNMENT OF INDIA</span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span>NATIONAL CITIZEN WELFARE SERVICES DIRECTORY</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Link href="/schemes" style={{ color: "#1e40af", textDecoration: "none", fontWeight: 600 }}>
                        Browse 4,700+ Schemes
                    </Link>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span>English / हिन्दी / मराठी</span>
                </div>
            </div>

            {/* 3. Official Main Navigation Bar */}
            <nav style={{
                background: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                padding: "14px 32px",
                position: "sticky",
                top: 0,
                zIndex: 50,
                boxShadow: "0 2px 8px rgba(0, 33, 71, 0.04)"
            }}>
                <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    
                    {/* Logo & Title */}
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                        <div style={{
                            width: 42,
                            height: 42,
                            background: "linear-gradient(135deg, #002147, #0f4c81)",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0, 33, 71, 0.2)",
                        }}>
                            <Shield size={22} color="white" />
                        </div>
                        <div>
                            <div style={{ color: "#002147", fontWeight: 800, fontSize: 17, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                                Smart Beneficiary Mapping
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>
                                National AI Welfare Platform (SBMS)
                            </div>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="hidden md:flex">
                        <Link href="/schemes" style={{ color: "#334155", textDecoration: "none", fontSize: 14, fontWeight: 600 }} className="hover:text-blue-700">
                            Explore Schemes
                        </Link>
                        <Link href="/schemes" style={{ color: "#334155", textDecoration: "none", fontSize: 14, fontWeight: 600 }} className="hover:text-blue-700">
                            Categories
                        </Link>
                        <Link href="/schemes" style={{ color: "#334155", textDecoration: "none", fontSize: 14, fontWeight: 600 }} className="hover:text-blue-700">
                            States / UTs
                        </Link>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Link
                            href="/login"
                            style={{
                                color: "#002147",
                                textDecoration: "none",
                                fontSize: 13.5,
                                fontWeight: 700,
                                padding: "8px 16px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                background: "#ffffff",
                                transition: "all 0.15s",
                            }}
                            className="hover:bg-slate-50"
                        >
                            Citizen Login
                        </Link>
                        <Link
                            href="/register"
                            style={{
                                background: "#002147",
                                color: "white",
                                textDecoration: "none",
                                fontSize: 13.5,
                                fontWeight: 700,
                                padding: "8px 18px",
                                borderRadius: 6,
                                boxShadow: "0 2px 6px rgba(0, 33, 71, 0.15)",
                                transition: "all 0.15s",
                            }}
                            className="hover:bg-blue-950"
                        >
                            Register (Free)
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 4. Classical myScheme Hero Section */}
            <AnimatedHeroSection>
                {/* Government Pill Badge */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 99,
                    padding: "6px 16px",
                    marginBottom: 20,
                }}>
                    <Sparkles size={14} color="#1d4ed8" />
                    <span style={{ color: "#1d4ed8", fontSize: 12.5, fontWeight: 700 }}>
                        Official Indian Welfare Services • 4,700+ Schemes Indexed
                    </span>
                </div>

                {/* Hero Title */}
                <h1 style={{
                    fontSize: "clamp(32px, 4.5vw, 54px)",
                    fontWeight: 800,
                    color: "#002147",
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
                    maxWidth: 860,
                    margin: "0 auto 16px",
                }}>
                    Find Government Schemes{" "}
                    <span style={{ color: "#FF9933" }}>You Deserve</span>
                </h1>

                {/* Subtitle */}
                <p style={{
                    fontSize: "16.5px",
                    color: "#475569",
                    maxWidth: 680,
                    margin: "0 auto 36px",
                    lineHeight: 1.6,
                    fontWeight: 400
                }}>
                    Discover, check eligibility, and apply directly for <strong>4,700+</strong> Central and State Government welfare programs across all 36 States & Union Territories.
                </p>

                {/* Classical Interactive Search Box */}
                <div style={{
                    maxWidth: 720,
                    margin: "0 auto 28px",
                    background: "#ffffff",
                    borderRadius: 12,
                    padding: "8px",
                    boxShadow: "0 8px 24px rgba(0, 33, 71, 0.08)",
                    border: "2px solid #002147",
                }}>
                    <form action="/schemes" method="GET" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 300px", padding: "6px 12px" }}>
                            <Search size={20} color="#64748b" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by scheme name, keyword (e.g. Kisan, Scholarship, Loan, Housing)..."
                                style={{
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    fontSize: 14.5,
                                    color: "#0f172a",
                                    background: "transparent",
                                    fontFamily: "inherit"
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                background: "#002147",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "background 0.15s"
                            }}
                            className="hover:bg-blue-950"
                        >
                            Search Schemes <ArrowRight size={15} />
                        </button>
                    </form>
                </div>

                {/* Popular Keywords / Tags */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", fontSize: 12.5, color: "#64748b" }}>
                    <span style={{ fontWeight: 600 }}>Popular Searches:</span>
                    {[
                        { label: "🌾 Farmers (PM-Kisan)", q: "kisan" },
                        { label: "🎓 Scholarships", q: "scholarship" },
                        { label: "👩 Women Entrepreneurship", q: "women" },
                        { label: "🏠 Housing & Awas", q: "housing" },
                        { label: "🏥 Health & Ayushman", q: "health" },
                    ].map((tag) => (
                        <Link
                            key={tag.q}
                            href={`/schemes?search=${tag.q}`}
                            style={{
                                background: "#ffffff",
                                color: "#002147",
                                border: "1px solid #cbd5e1",
                                padding: "4px 10px",
                                borderRadius: 6,
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: 12,
                                transition: "all 0.15s"
                            }}
                            className="hover:border-blue-700 hover:bg-blue-50"
                        >
                            {tag.label}
                        </Link>
                    ))}
                </div>
            </AnimatedHeroSection>

            {/* 5. Citizen Impact & Stats Banner */}
            <section style={{ maxWidth: 1240, margin: "-20px auto 48px", padding: "0 24px", position: "relative", zIndex: 10 }}>
                <div style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "24px 32px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 20,
                    boxShadow: "0 4px 16px rgba(0, 33, 71, 0.05)",
                    textAlign: "center"
                }}>
                    {stats.map((s) => (
                        <AnimatedStat key={s.label} value={s.value} label={s.label} />
                    ))}
                </div>
            </section>

            {/* 6. "How It Works" - 3 Simple Steps for Citizens */}
            <section style={{ maxWidth: 1240, margin: "0 auto 60px", padding: "0 24px" }}>
                <AnimatedSection>
                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                            Simple & Transparent Process
                        </div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#002147", letterSpacing: "-0.02em", margin: 0 }}>
                            How SBMS Helps You Find Schemes in 3 Steps
                        </h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                        
                        {/* Step 1 */}
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                1
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002147", marginBottom: 8 }}>
                                Enter Your Details
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                                Provide simple demographic information such as age, gender, state of residence, and occupation in under 2 minutes.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#f0fdf4", color: "#16a34a", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                2
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002147", marginBottom: 8 }}>
                                Instant AI Match
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                                Our local AI matches your profile against all 4,700+ government rules to show schemes you are 100% eligible for.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#fff7ed", color: "#ea580c", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                3
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002147", marginBottom: 8 }}>
                                Apply on Official Portal
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                                Get direct links to genuine Central and State Ministry application portals with step-by-step instructions.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>
            </section>

            {/* 7. Explore by Popular Categories Grid */}
            <section style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "60px 24px" }}>
                <div style={{ maxWidth: 1240, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                                Find by Sector
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#002147", letterSpacing: "-0.02em", margin: 0 }}>
                                Schemes by Category
                            </h2>
                        </div>
                        <Link
                            href="/schemes"
                            style={{
                                color: "#002147",
                                fontSize: 13.5,
                                fontWeight: 700,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                            }}
                            className="hover:text-blue-700"
                        >
                            View All Categories <ChevronRight size={15} />
                        </Link>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
                        {categories.map((cat, idx) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 10,
                                    padding: "18px 20px",
                                    textDecoration: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    transition: "all 0.15s ease",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                                }}
                                className="hover:border-blue-500 hover:shadow-md"
                            >
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 8,
                                    background: cat.bg,
                                    border: `1px solid ${cat.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}>
                                    {cat.icon}
                                </div>
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#002147", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {cat.name}
                                    </h3>
                                    <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
                                        {cat.count}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. Browse by State / UT */}
            <section style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 24px" }}>
                <AnimatedSection>
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                            State-Specific Welfare
                        </div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#002147", letterSpacing: "-0.02em", margin: 0 }}>
                            Explore Schemes by State / Union Territory
                        </h2>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                        {popularStates.map((stateName) => (
                            <Link
                                key={stateName}
                                href={`/schemes?state=${encodeURIComponent(stateName)}`}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    color: "#002147",
                                    padding: "8px 16px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: "all 0.15s ease",
                                }}
                                className="hover:border-blue-700 hover:bg-blue-50"
                            >
                                <MapPin size={13} color="#64748b" /> {stateName}
                            </Link>
                        ))}
                        <Link
                            href="/schemes"
                            style={{
                                background: "#002147",
                                color: "white",
                                padding: "8px 18px",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 700,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            All 36 States & UTs →
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* 9. Citizen Guarantees & Trust */}
            <section style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", padding: "60px 24px" }}>
                <div style={{ maxWidth: 1240, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 40 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                            Citizen Privacy & Trust
                        </div>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#002147", letterSpacing: "-0.02em", margin: 0 }}>
                            Why Citizens Across India Trust SBMS
                        </h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                        <div style={{ padding: "24px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <ExternalLink size={18} />
                            </div>
                            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#002147", marginBottom: 6 }}>
                                Zero Middleman Redirection
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                                Every single scheme links straight to authentic Ministry websites (.gov.in / .nic.in). No agents, no middlemen, and no fees.
                            </p>
                        </div>

                        <div style={{ padding: "24px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ecfdf5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <Lock size={18} />
                            </div>
                            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#002147", marginBottom: 6 }}>
                                100% Local AI & Privacy
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                                Aadhaar numbers and PII are masked using automated regex scrubbers. No private data is ever shared with third-party cloud AI vendors.
                            </p>
                        </div>

                        <div style={{ padding: "24px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fdf2f8", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                <BadgeCheck size={18} />
                            </div>
                            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#002147", marginBottom: 6 }}>
                                Secure Document Vault
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                                Upload income, caste, and domicile certificates once to auto-attach them to applications, complete with expiry notifications.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. Official Government Portal Footer */}
            <footer style={{ background: "#002147", color: "white", padding: "50px 24px 30px", borderTop: "4px solid #FF9933" }}>
                <div style={{ maxWidth: 1240, margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, marginBottom: 40 }}>
                        
                        {/* Column 1: Identity */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <Shield size={22} color="#FF9933" />
                                <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>Smart Beneficiary Mapping</span>
                            </div>
                            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                                National AI Welfare Portal designed to empower every Indian citizen with fast, transparent, and direct access to government schemes.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#93c5fd" }}>Quick Navigation</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                                <Link href="/schemes" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }} className="hover:text-white">
                                    Browse All 4,700+ Schemes
                                </Link>
                                <Link href="/login" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }} className="hover:text-white">
                                    Check Eligibility
                                </Link>
                                <Link href="/register" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }} className="hover:text-white">
                                    Citizen Registration
                                </Link>
                            </div>
                        </div>

                        {/* Column 3: Schemes by Target */}
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#93c5fd" }}>Target Beneficiaries</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                                <Link href="/schemes?search=farmer" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                                    Farmers & Agriculture
                                </Link>
                                <Link href="/schemes?search=student" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                                    Students & Youth
                                </Link>
                                <Link href="/schemes?search=women" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                                    Women Empowerment
                                </Link>
                                <Link href="/schemes?search=senior" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
                                    Senior Citizens & Pensions
                                </Link>
                            </div>
                        </div>

                        {/* Column 4: Helpdesk */}
                        <div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#93c5fd" }}>National Portal Support</h4>
                            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                                Available 24/7 with local multilingual AI assistance.
                            </p>
                            <div style={{ marginTop: 10, fontSize: 12, color: "#93c5fd", fontWeight: 600 }}>
                                🇮🇳 Proudly built for the citizens of India
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                        © 2026 Smart Beneficiary Mapping System (SBMS) • Government Welfare Discovery Portal • All data synchronized with official government registries.
                    </div>
                </div>
            </footer>
        </div>
    );
}
