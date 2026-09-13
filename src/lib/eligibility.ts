import { User, Scheme } from "@prisma/client";

export type EligibilityResult = {
    isEligible: boolean;
    isIncomplete: boolean;
    hasMissingDocs: boolean;
    status: "eligible" | "not_eligible" | "docs_pending" | "unknown";
    reason: string;
    missingFields: string[];
    missingDocs: string[];
    matchScore: number;
    criteriaMet: number;
    totalCriteria: number;
};

const ALL_INDIAN_STATES = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
];

export interface DocumentRequirement {
    key: string;
    label: string;
    icon: string;
    needed: boolean;
}

export function getSchemeDocumentRequirements(scheme: {
    documents?: string | null;
    description?: string | null;
    eligibility?: string | null;
    title?: string | null;
}): DocumentRequirement[] {
    const text = `${scheme.documents || ""} ${scheme.description || ""} ${scheme.eligibility || ""} ${scheme.title || ""}`.toLowerCase();

    return [
        {
            key: "aadhaar",
            label: "Aadhaar Card (e-KYC)",
            icon: "🪪",
            needed: text.includes("aadhaar") || text.includes("aadhar") || text.includes("identity proof") || text.includes("id proof") || text.includes("uidai")
        },
        {
            key: "bank_passbook",
            label: "Bank Passbook / Cancelled Cheque",
            icon: "🏦",
            needed: text.includes("bank") || text.includes("passbook") || text.includes("bank account") || text.includes("cheque") || text.includes("ifsc") || text.includes("micr") || text.includes("dbt")
        },
        {
            key: "photo",
            label: "Passport Size Photograph",
            icon: "📸",
            needed: text.includes("photo") || text.includes("photograph") || text.includes("passport size")
        },
        {
            key: "signature",
            label: "Specimen Signature / Thumb Impression",
            icon: "✍️",
            needed: text.includes("signature") || text.includes("specimen signature") || text.includes("thumb impression") || text.includes("declaration form")
        },
        {
            key: "caste_cert",
            label: "Caste / Category Certificate",
            icon: "🏛️",
            needed: text.includes("caste") || text.includes("community certificate") || text.includes("tribe") || text.includes("sc/st") || text.includes("obc") || text.includes("ews certificate") || text.includes("category certificate")
        },
        {
            key: "birth_cert",
            label: "Birth Certificate / Age Proof",
            icon: "👶",
            needed: text.includes("birth certificate") || text.includes("age proof") || text.includes("dob proof") || text.includes("school leaving") || text.includes("matriculation certificate")
        },
        {
            key: "domicile",
            label: "Domicile / Residence Certificate",
            icon: "🏠",
            needed: text.includes("domicile") || text.includes("residence certificate") || text.includes("residential certificate") || text.includes("nativity") || text.includes("proof of residence") || text.includes("residential proof")
        },
        {
            key: "income_cert",
            label: "Income Certificate / Salary Slip",
            icon: "💰",
            needed: text.includes("income certificate") || text.includes("salary slip") || text.includes("income proof") || text.includes("family income certificate") || text.includes("itr")
        },
        {
            key: "ration_card",
            label: "Ration Card (PHH / AAY / BPL)",
            icon: "🍚",
            needed: text.includes("ration card") || text.includes("bpl card") || text.includes("antyodaya") || text.includes("aay card") || text.includes("phh card") || text.includes("smart ration")
        },
        {
            key: "education_cert",
            label: "Educational Marksheet / Degree",
            icon: "🎓",
            needed: text.includes("marksheet") || text.includes("degree") || text.includes("bonafide") || text.includes("education certificate") || text.includes("student id") || text.includes("enrollment certificate") || text.includes("fellowship") || text.includes("ugc") || text.includes("college") || text.includes("university")
        },
        {
            key: "disability_cert",
            label: "Disability Certificate / UDID Card",
            icon: "♿",
            needed: text.includes("disability") || text.includes("medical certificate") || text.includes("udid") || text.includes("handicap") || text.includes("pwd certificate") || text.includes("divyang")
        },
        {
            key: "land_record",
            label: "Land Record / Patta / 7-12",
            icon: "🌾",
            needed: text.includes("land record") || text.includes("patta") || text.includes("khasra") || text.includes("khatauni") || text.includes("7/12") || text.includes("chitta") || text.includes("ror") || text.includes("land possession")
        },
        {
            key: "driving_license",
            label: "Driving License / Vehicle RC",
            icon: "🚗",
            needed: text.includes("driving license") || text.includes("driver license") || text.includes("rc book") || text.includes("vehicle registration")
        },
        {
            key: "death_cert",
            label: "Death Certificate / Legal Heir",
            icon: "📜",
            needed: text.includes("death certificate") || text.includes("legal heir") || text.includes("widow certificate")
        },
        {
            key: "job_card",
            label: "MGNREGA / Shramik Card",
            icon: "👷",
            needed: text.includes("job card") || text.includes("mgnrega") || text.includes("shramik") || text.includes("e-shram") || text.includes("bocw") || text.includes("unorganized worker")
        },
    ];
}

export function checkSchemeEligibility(user: any, scheme: any): EligibilityResult {
    const textLower = `${scheme.title || ""} ${scheme.description || ""} ${scheme.eligibility || ""}`.toLowerCase();

    // 1. Calculate Age
    let age: number | null = null;
    if (user?.dob) {
        const today = new Date();
        const birthDate = new Date(user.dob);
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    }

    let isEligible = true;
    let isIncomplete = false;
    const reasonTexts: string[] = [];
    const missingFields: string[] = [];
    const missingDocs: string[] = [];
    let criteriaMet = 0;
    let totalCriteria = 0;

    // Check if user has basic profile filled out
    const hasBasicProfile = Boolean(user?.dob || user?.gender || user?.state || user?.income !== null || user?.occupation);

    if (!hasBasicProfile) {
        return {
            isEligible: false,
            isIncomplete: true,
            hasMissingDocs: false,
            status: "unknown",
            reason: "Complete your profile (Age, State, Gender, Income) to determine eligibility.",
            missingFields: ["Date of Birth", "State", "Gender", "Income"],
            missingDocs: [],
            matchScore: 0,
            criteriaMet: 0,
            totalCriteria: 4
        };
    }

    // 2. State Specificity Check
    const isCentral = textLower.includes("level:** central") || textLower.includes("jurisdiction level: central") || textLower.includes("central sector scheme");
    let detectedState: string | null = null;

    if (!isCentral) {
        for (const st of ALL_INDIAN_STATES) {
            const stLower = st.toLowerCase();
            if (
                scheme.title.toLowerCase().includes(stLower) ||
                textLower.includes(`state:** ${stLower}`) ||
                textLower.includes(`beneficiary state:** ${stLower}`) ||
                textLower.includes(`residents of ${stLower}`) ||
                textLower.includes(`domicile of ${stLower}`) ||
                textLower.includes(`government of ${stLower}`)
            ) {
                detectedState = st;
                break;
            }
        }
    }

    if (detectedState) {
        totalCriteria++;
        if (!user.state) {
            isIncomplete = true;
            missingFields.push("State of Residence");
        } else if (user.state.toLowerCase() !== detectedState.toLowerCase()) {
            isEligible = false;
            reasonTexts.push(`Exclusively for residents of ${detectedState} (Your state: ${user.state})`);
        } else {
            criteriaMet++;
        }
    }

    // 3. Gender Requirement Check
    const isWomenOnly = textLower.includes("women only") ||
        textLower.includes("for female") ||
        textLower.includes("for women") ||
        textLower.includes("for girls") ||
        textLower.includes("mahila") ||
        textLower.includes("widow") ||
        textLower.includes("maternity benefit") ||
        textLower.includes("kanya");

    if (isWomenOnly) {
        totalCriteria++;
        if (!user.gender) {
            isIncomplete = true;
            missingFields.push("Gender");
        } else if (user.gender === "MALE") {
            isEligible = false;
            reasonTexts.push("Exclusively for female / women beneficiaries");
        } else {
            criteriaMet++;
        }
    }

    // 4. Disability / Divyangjan Requirement
    const isDisabilityScheme = textLower.includes("divyang") ||
        textLower.includes("disability") ||
        textLower.includes("differently abled") ||
        textLower.includes("pwd");

    if (isDisabilityScheme) {
        totalCriteria++;
        const hasDisabilityDoc = user.documents?.some((d: any) => d.type === "disability_cert");
        if (!hasDisabilityDoc) {
            isEligible = false;
            reasonTexts.push("Requires Disability / Divyangjan Certificate");
        } else {
            criteriaMet++;
        }
    }

    // 5. Farmer / Agricultural Requirement
    const isFarmerScheme = (textLower.includes("farmer") || textLower.includes("kisan") || textLower.includes("agricultural land") || textLower.includes("cultivator")) &&
        !textLower.includes("general public");

    if (isFarmerScheme) {
        totalCriteria++;
        if (user.occupation && !user.occupation.toLowerCase().includes("farm") && !user.occupation.toLowerCase().includes("agri") && !user.occupation.toLowerCase().includes("kisan")) {
            isEligible = false;
            reasonTexts.push("Exclusively for farmers and agricultural cultivators");
        } else if (!user.occupation) {
            isIncomplete = true;
            missingFields.push("Occupation (Farmer verification required)");
        } else {
            criteriaMet++;
        }
    }

    // 6. Income Threshold Check
    const incomeLimitMatch = textLower.match(/income (?:less than|below|up to|not exceeding|limit of)?\s*(?:rs\.?|₹)?\s*([0-9,]+)/i);
    if (incomeLimitMatch) {
        const parsedLimit = parseInt(incomeLimitMatch[1].replace(/,/g, ""), 10);
        if (parsedLimit && parsedLimit > 1000 && parsedLimit < 50000000) {
            totalCriteria++;
            if (user.income === null || user.income === undefined) {
                isIncomplete = true;
                missingFields.push("Annual Income");
            } else if (user.income > parsedLimit) {
                isEligible = false;
                reasonTexts.push(`Annual income ₹${user.income.toLocaleString("en-IN")} exceeds threshold of ₹${parsedLimit.toLocaleString("en-IN")}`);
            } else {
                criteriaMet++;
            }
        }
    }

    // 7. Full 15 Document Vault Checks
    const userDocs = user?.documents || [];
    const checkDoc = (docKey: string) => userDocs.some((d: any) => d.type === docKey);

    const docRequirements = getSchemeDocumentRequirements(scheme).filter(d => d.needed);

    for (const d of docRequirements) {
        totalCriteria++;
        if (!checkDoc(d.key)) {
            missingDocs.push(d.label);
        } else {
            criteriaMet++;
        }
    }

    // Compute Result
    const hasMissingDocs = missingDocs.length > 0;

    if (!isEligible) {
        const matchScore = totalCriteria > 0 ? Math.round((criteriaMet / totalCriteria) * 100) : 0;
        return {
            isEligible: false,
            isIncomplete: false,
            hasMissingDocs,
            status: "not_eligible",
            reason: reasonTexts.join(" • ") || "Criteria not met based on current profile.",
            missingFields,
            missingDocs,
            matchScore,
            criteriaMet,
            totalCriteria
        };
    }

    if (isIncomplete) {
        const matchScore = totalCriteria > 0 ? Math.round((criteriaMet / totalCriteria) * 100) : 40;
        return {
            isEligible: false,
            isIncomplete: true,
            hasMissingDocs,
            status: "unknown",
            reason: `Additional profile details required: ${missingFields.join(", ")}`,
            missingFields,
            missingDocs,
            matchScore,
            criteriaMet,
            totalCriteria
        };
    }

    if (hasMissingDocs) {
        const matchScore = totalCriteria > 0 ? Math.round((criteriaMet / totalCriteria) * 100) : 70;
        return {
            isEligible: true,
            isIncomplete: false,
            hasMissingDocs: true,
            status: "docs_pending",
            reason: `Demographic criteria matched, but missing ${missingDocs.length} required vault document(s): ${missingDocs.join(", ")}`,
            missingFields: [],
            missingDocs,
            matchScore,
            criteriaMet,
            totalCriteria
        };
    }

    // Fully eligible with all documents verified in vault
    const matchScore = totalCriteria > 0 ? Math.round((criteriaMet / totalCriteria) * 100) : 100;
    return {
        isEligible: true,
        isIncomplete: false,
        hasMissingDocs: false,
        status: "eligible",
        reason: "All demographic criteria and required vault documents are verified ✓",
        missingFields: [],
        missingDocs: [],
        matchScore,
        criteriaMet,
        totalCriteria
    };
}
