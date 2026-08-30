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

export function checkSchemeEligibility(user: any, scheme: any): EligibilityResult {
    const textLower = `${scheme.title || ""} ${scheme.description || ""} ${scheme.eligibility || ""}`.toLowerCase();
    const docTextLower = (scheme.documents || "").toLowerCase();

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
            // Check if state is in title, or in explicit state tag/nodal description
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

    // 7. Document Vault Checks
    const userDocs = user?.documents || [];
    const checkDoc = (docKey: string) => userDocs.some((d: any) => d.type === docKey);

    const docRules = [
        { label: "Aadhaar Card", key: "aadhaar", req: docTextLower.includes("aadhaar") || docTextLower.includes("aadhar") },
        { label: "Income Certificate", key: "income_cert", req: docTextLower.includes("income") || docTextLower.includes("salary") },
        { label: "Domicile Certificate", key: "domicile", req: docTextLower.includes("domicile") || docTextLower.includes("residence") || docTextLower.includes("residential") },
        { label: "Caste Certificate", key: "caste_cert", req: docTextLower.includes("caste") || docTextLower.includes("category certificate") },
        { label: "Disability Certificate", key: "disability_cert", req: docTextLower.includes("disability") },
    ];

    for (const d of docRules) {
        if (d.req) {
            totalCriteria++;
            if (!checkDoc(d.key)) {
                missingDocs.push(d.label);
            } else {
                criteriaMet++;
            }
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
            reason: `Profile matches, but missing required vault documents: ${missingDocs.join(", ")}`,
            missingFields: [],
            missingDocs,
            matchScore,
            criteriaMet,
            totalCriteria
        };
    }

    // Fully eligible with documents in place
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
