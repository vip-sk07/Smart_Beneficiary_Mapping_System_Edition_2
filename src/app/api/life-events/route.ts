import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        let userAge = 22;
        let userGender = "MALE";
        let userState = "All";

        if (session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                include: { familyMembers: true }
            });
            if (user?.dob) {
                const diff = Date.now() - new Date(user.dob).getTime();
                userAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
            }
            if (user?.gender) userGender = user.gender;
            if (user?.state) userState = user.state;
        }

        // Define Life Stages
        const milestones = [];

        // Milestone 1: Higher Education & Youth Scholarships (18-25)
        if (userAge >= 17 && userAge <= 28) {
            milestones.push({
                stage: "🎓 Higher Education & Career Launch",
                tag: "Current Life Stage (Age 18-28)",
                color: "#1e40af",
                bg: "#eff6ff",
                border: "#bfdbfe",
                description: "Critical transition period for Post-Matric Scholarships, Skill India certifications, and MSME Youth Startup loans.",
                schemes: [
                    { title: "Post Matric Scholarship for Higher Education", benefit: "Up to ₹25,000/yr tuition reimbursement", link: "/schemes" },
                    { title: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)", benefit: "Free industry skill certification + stipend", link: "/schemes" },
                    { title: "Prime Minister's Research Fellowship (PMRF)", benefit: "Direct monthly doctoral research fellowship", link: "/schemes" },
                ]
            });
        }

        // Milestone 2: Livelihood & Business Growth (21-59)
        if (userAge >= 21 && userAge <= 59) {
            milestones.push({
                stage: "💼 Livelihood & Enterprise Creation",
                tag: "Working Age Welfare",
                color: "#047857",
                bg: "#f0fdf4",
                border: "#bbf7d0",
                description: "Subsidized working capital loans, technology support, and crop/health protection.",
                schemes: [
                    { title: "Pradhan Mantri MUDRA Yojana (Shishu & Kishore)", benefit: "Collateral-free business loans up to ₹10 Lakhs", link: "/schemes" },
                    { title: "Stand-Up India Scheme", benefit: "Bank loans from ₹10 Lakhs to ₹1 Crore for SC/ST/Women", link: "/schemes" },
                    { title: "PM Surya Ghar: Muft Bijli Yojana", benefit: "Up to ₹78,000 subsidy for rooftop solar installation", link: "/schemes" },
                ]
            });
        }

        // Milestone 3: Girl Child & Women Empowerment (If Female or Family Girl Child)
        if (userGender === "FEMALE" || userAge <= 25) {
            milestones.push({
                stage: "👧 Girl Child & Women Advancement",
                tag: "Gender Security & Welfare",
                color: "#db2777",
                bg: "#fdf2f8",
                border: "#fbcfe8",
                description: "Long-term savings, marriage aid, and maternal health protection.",
                schemes: [
                    { title: "Sukanya Samriddhi Yojana (SSY)", benefit: "High-interest 8.2% government-backed tax-free corpus", link: "/schemes" },
                    { title: "Pradhan Mantri Matru Vandana Yojana", benefit: "₹5,000 direct maternity cash benefit", link: "/schemes" },
                ]
            });
        }

        // Milestone 4: Senior Citizen Dignity (60+)
        if (userAge >= 55) {
            milestones.push({
                stage: "🧓 Senior Citizen Dignity & Social Security",
                tag: "Retirement & Health Stage (60+)",
                color: "#d97706",
                bg: "#fffbeb",
                border: "#fde68a",
                description: "Monthly old age pensions, free geriatric healthcare, and guaranteed pension interest.",
                schemes: [
                    { title: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)", benefit: "Monthly direct pension to bank account", link: "/schemes" },
                    { title: "Ayushman Bharat Senior Citizen (70+) Free Cover", benefit: "₹5,00,000 annual cashless hospitalization", link: "/schemes" },
                ]
            });
        }

        return NextResponse.json({
            userAge,
            userGender,
            userState,
            milestones
        });
    } catch (e) {
        console.error("[GET /api/life-events]", e);
        return NextResponse.json({ error: "Failed to load life-event triggers" }, { status: 500 });
    }
}
