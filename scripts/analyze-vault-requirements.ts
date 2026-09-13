import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("🔍 Starting Comprehensive Document & Eligibility Analysis across 4,724 Schemes...\n");

    const schemes = await prisma.scheme.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            benefits: true,
            eligibility: true,
            documents: true,
            category: { select: { name: true } },
        },
    });

    const total = schemes.length;
    console.log(`📊 Loaded ${total} schemes from database.\n`);

    // Document Category Patterns
    const docPatterns: Record<string, { label: string; regex: RegExp; count: number; sampleSchemes: string[] }> = {
        aadhaar: {
            label: "Aadhaar Card / UIDAI Proof",
            regex: /\b(aadhaar|aadhar|uidai|unique identification)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        photo: {
            label: "Passport Size Photograph",
            regex: /\b(photograph|photo|passport size photo|passport size photograph|recent photo|applicant photo)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        signature: {
            label: "Signature / Thumb Impression Specimen",
            regex: /\b(signature|specimen signature|thumb impression|scanned signature|digital signature)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        income_cert: {
            label: "Income Certificate / Salary Slip / ITR",
            regex: /\b(income certificate|income proof|salary slip|annual income certificate|income declaration|itr|form 16|tahsildar income)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        bank_passbook: {
            label: "Bank Account Passbook / Cancelled Cheque / Mandate",
            regex: /\b(bank passbook|bank account|cancelled cheque|bank statement|account details|ifsc|bank details|bank branch)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        caste_cert: {
            label: "Caste / Community / Tribe / EWS Certificate",
            regex: /\b(caste certificate|community certificate|tribe certificate|sc\/st certificate|obc certificate|ews certificate|social category certificate)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        domicile: {
            label: "Domicile / Residence / Nativity Certificate",
            regex: /\b(domicile certificate|residence certificate|residential certificate|nativity certificate|proof of residence|prc|resident certificate)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        ration_card: {
            label: "Ration Card / BPL Card / Antyodaya Card",
            regex: /\b(ration card|bpl card|antyodaya card|aay card|phh card|food security card|nfsa card)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        land_record: {
            label: "Land Ownership Records (Patta / Chitta / 7-12 / Khasra / RoR)",
            regex: /\b(land document|land record|patta|chitta|7\/12|7-12|khasra|khatoni|ror|land possession|record of rights|jamabandi|land revenue receipt|land tax)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        education_cert: {
            label: "Educational Marksheet / Degree / Bonafide Certificate",
            regex: /\b(marksheet|degree certificate|bonafide certificate|admission receipt|college id|school id|transfer certificate|fee receipt|diploma certificate|10th marksheet|12th marksheet|passing certificate)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        age_proof: {
            label: "Birth Certificate / Age Proof",
            regex: /\b(birth certificate|age proof|proof of age|date of birth certificate|dob certificate|school leaving certificate)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        disability_cert: {
            label: "Disability Certificate / UDID Card (PwD)",
            regex: /\b(disability certificate|udid|pwd certificate|handicapped certificate|medical board certificate|disability percentage|blindness certificate)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        death_cert: {
            label: "Death Certificate / Legal Heir Certificate (Widow/Survivor)",
            regex: /\b(death certificate|husband death certificate|legal heir certificate|survivor certificate|waris certificate)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        driving_license: {
            label: "Driving License / Vehicle Registration (RC)",
            regex: /\b(driving license|driver license|vehicle registration|rc book|permit)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        job_card: {
            label: "MGNREGA Job Card / Labor / Worker Registration Card",
            regex: /\b(job card|mgnrega|labor card|labour card|shramik card|e-shram|worker registration)\b/i,
            count: 0,
            sampleSchemes: [],
        },
        self_declaration: {
            label: "Self Declaration / Affidavit / Undertaking",
            regex: /\b(affidavit|self declaration|undertaking|declaration form|notarized affidavit)\b/i,
            count: 0,
            sampleSchemes: [],
        },
    };

    // Analyze each scheme
    for (const s of schemes) {
        const fullDocText = `${s.documents || ""} ${s.eligibility || ""} ${s.description || ""}`.toLowerCase();

        for (const [key, config] of Object.entries(docPatterns)) {
            if (config.regex.test(fullDocText)) {
                config.count++;
                if (config.sampleSchemes.length < 3) {
                    config.sampleSchemes.push(s.title);
                }
            }
        }
    }

    console.log("==========================================================================");
    console.log("🏆 EMPIRICAL DOCUMENT DEMAND ANALYSIS (4,724 SCHEMES IN SBMS DATABASE)");
    console.log("==========================================================================\n");

    const sortedDocs = Object.entries(docPatterns).sort((a, b) => b[1].count - a[1].count);

    for (const [key, data] of sortedDocs) {
        const pct = ((data.count / total) * 100).toFixed(1);
        console.log(`📌 [${key.toUpperCase()}] ${data.label}`);
        console.log(`   Demand: ${data.count} / ${total} schemes (${pct}%)`);
        console.log(`   Sample Schemes:`);
        data.sampleSchemes.forEach(title => console.log(`     • ${title}`));
        console.log("");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
