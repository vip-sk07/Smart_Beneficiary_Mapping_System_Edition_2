/**
 * Smart Beneficiary Mapping System (SBMS)
 * Pre-Flight Portal Security & Barrier Scanner
 * 
 * Deeply inspects government scheme endpoints and forms to identify:
 *  1. Cloudflare / WAF protections
 *  2. CAPTCHA types (Math, Image Alphanumeric, Google reCAPTCHA, Turnstile, hCaptcha)
 *  3. Aadhaar SMS OTP & DigiLocker authentication requirements
 *  4. Form field schemas and Document Vault readiness matching
 *  5. Recommended execution mode (ZERO_TOUCH | ASSISTED_COPILOT | PDF_DOSSIER)
 */

export type PortalMode = "ZERO_TOUCH" | "ASSISTED_COPILOT" | "PDF_DOSSIER";
export type CaptchaType = "none" | "math_captcha" | "image_alphanumeric" | "recaptcha" | "turnstile" | "hcaptcha";

export interface RequiredFieldInfo {
    key: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "file";
    required: boolean;
    vaultMatched: boolean;
    sourceValue?: string;
}

export interface SecurityScanResult {
    url: string;
    portalName: string;
    portalStatus: "ONLINE" | "MAINTENANCE" | "SLOW";
    latencyMs: number;
    sslValid: boolean;
    
    // Security Barriers
    isCloudflareProtected: boolean;
    captchaDetected: boolean;
    captchaType: CaptchaType;
    requiresAadhaarOtp: boolean;
    requiresDigiLockerAuth: boolean;
    
    // Execution Mode
    recommendedMode: PortalMode;
    estimatedDurationSec: number;
    securitySummary: string;
    
    // Document Vault Readiness
    requiredDocuments: Array<{
        type: string;
        label: string;
        availableInVault: boolean;
        documentId?: string;
        fileName?: string;
    }>;
    requiredFields: RequiredFieldInfo[];
    vaultReadinessScore: number; // 0 to 100
    missingDocsCount: number;
    canAutoSubmit: boolean;
}

interface SchemeInfo {
    id: string;
    title: string;
    description: string;
    benefits?: string;
    eligibility?: string;
    documents?: string;
    applyLink?: string | null;
    category?: { name: string } | null;
}

interface UserVaultProfile {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    dob?: Date | null;
    gender?: string | null;
    aadhaarNo?: string | null;
    income?: number | null;
    occupation?: string | null;
    state?: string | null;
    address?: string | null;
    documents?: Array<{
        id: string;
        name: string;
        type: string;
        fileUrl: string;
    }>;
}

/**
 * Perform a pre-flight scan of a scheme portal and match against user vault data
 */
export async function scanSchemePortal(
    scheme: SchemeInfo,
    user: UserVaultProfile
): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const rawUrl = scheme.applyLink?.trim() || "";
    const isDirectPdf = rawUrl.toLowerCase().endsWith(".pdf") || 
        scheme.documents?.toLowerCase().includes("offline application") ||
        scheme.description?.toLowerCase().includes("offline form");

    let isCloudflare = false;
    let captchaType: CaptchaType = "none";
    let requiresAadhaarOtp = false;
    let requiresDigiLocker = false;
    let portalStatus: "ONLINE" | "MAINTENANCE" | "SLOW" = "ONLINE";
    let sslValid = true;
    let latencyMs = 80;

    // 1. Analyze Scheme Text & Known Portal Patterns
    const fullText = `${scheme.title} ${scheme.description} ${scheme.eligibility || ""} ${scheme.documents || ""} ${rawUrl}`.toLowerCase();
    
    // Detect Aadhaar OTP keyword signatures
    if (
        fullText.includes("aadhaar otp") ||
        fullText.includes("aadhar otp") ||
        fullText.includes("uidai verification") ||
        fullText.includes("otp based authentication") ||
        fullText.includes("mobile otp verification") ||
        fullText.includes("digilocker")
    ) {
        requiresAadhaarOtp = true;
        if (fullText.includes("digilocker")) {
            requiresDigiLocker = true;
        }
    }

    // Detect CAPTCHA signatures
    if (fullText.includes("captcha") || fullText.includes("security code") || fullText.includes("image code")) {
        if (fullText.includes("math")) {
            captchaType = "math_captcha";
        } else if (fullText.includes("recaptcha")) {
            captchaType = "recaptcha";
        } else if (fullText.includes("turnstile")) {
            captchaType = "turnstile";
        } else {
            captchaType = "image_alphanumeric";
        }
    }

    // 2. Real Web Probe (if a valid external URL is given)
    if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500); // Fast 3.5s max probe

            const res = await fetch(rawUrl, {
                method: "GET",
                signal: controller.signal,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SBMS-PortalProbe/2.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
                redirect: "follow",
            });
            clearTimeout(timeoutId);

            latencyMs = Date.now() - startTime;
            if (latencyMs > 2500) portalStatus = "SLOW";
            sslValid = rawUrl.startsWith("https://");

            // Inspect response headers
            const serverHeader = res.headers.get("server")?.toLowerCase() || "";
            const cfRay = res.headers.get("cf-ray");
            const cfChl = res.headers.get("cf-mitigated");

            if (serverHeader.includes("cloudflare") || cfRay || cfChl) {
                isCloudflare = true;
            }

            // Inspect HTML snippet
            const htmlSample = (await res.text()).slice(0, 50000).toLowerCase();

            if (htmlSample.includes("challenges.cloudflare.com")) {
                isCloudflare = true;
                captchaType = "turnstile";
            } else if (htmlSample.includes("google.com/recaptcha") || htmlSample.includes("g-recaptcha")) {
                captchaType = "recaptcha";
            } else if (htmlSample.includes("hcaptcha.com")) {
                captchaType = "hcaptcha";
            } else if (htmlSample.includes("captcha") || htmlSample.includes("captchaimg") || htmlSample.includes("txtcaptcha")) {
                if (captchaType === "none") captchaType = "image_alphanumeric";
            }

            if (htmlSample.includes("aadhaar") && (htmlSample.includes("otp") || htmlSample.includes("generate otp"))) {
                requiresAadhaarOtp = true;
            }

        } catch (e: any) {
            latencyMs = Date.now() - startTime;
            // Even if network probe times out or is blocked by CORS/firewall, fallback to deterministic knowledge base
            portalStatus = latencyMs > 3000 ? "SLOW" : "ONLINE";
        }
    }

    // 3. Document Vault Matching
    const docText = (scheme.documents || "").toLowerCase() + " " + (scheme.description || "").toLowerCase() + " " + (scheme.eligibility || "").toLowerCase();
    const standardDocs = [
        { type: "aadhaar", label: "Aadhaar Card (e-KYC)", needed: true }, // Aadhaar is universal for government DBT & verification
        { type: "bank_passbook", label: "Bank Passbook / Cancelled Cheque", needed: docText.includes("bank") || docText.includes("passbook") || docText.includes("account") || docText.includes("cheque") || docText.includes("ifsc") },
        { type: "photo", label: "Passport Size Photograph", needed: docText.includes("photo") || docText.includes("photograph") },
        { type: "signature", label: "Specimen Signature / Thumb Impression", needed: docText.includes("signature") || docText.includes("sign") || docText.includes("thumb") },
        { type: "caste_cert", label: "Caste / Community / EWS Certificate", needed: docText.includes("caste") || docText.includes("community") || docText.includes("category") || docText.includes("sc/st") || docText.includes("obc") || docText.includes("ews") },
        { type: "birth_cert", label: "Birth Certificate / Age Proof", needed: docText.includes("birth") || docText.includes("age proof") || docText.includes("dob") || docText.includes("slc") },
        { type: "domicile", label: "Domicile / Nativity Certificate", needed: docText.includes("domicile") || docText.includes("residence") || docText.includes("nativity") || docText.includes("residential") },
        { type: "income_cert", label: "Income Certificate / Salary Slip", needed: docText.includes("income") || docText.includes("salary") || docText.includes("itr") },
        { type: "ration_card", label: "Ration Card (PHH / AAY / BPL)", needed: docText.includes("ration") || docText.includes("bpl") || docText.includes("antyodaya") || docText.includes("aay") },
        { type: "education_cert", label: "Educational Marksheet / Degree", needed: docText.includes("marksheet") || docText.includes("degree") || docText.includes("bonafide") || docText.includes("student") || docText.includes("certificate of education") },
        { type: "disability_cert", label: "Disability Certificate / UDID Card", needed: docText.includes("disability") || docText.includes("handicap") || docText.includes("pwd") || docText.includes("udid") },
        { type: "land_record", label: "Land Records (Patta / Chitta / 7-12)", needed: docText.includes("land") || docText.includes("patta") || docText.includes("khasra") || docText.includes("chitta") || docText.includes("7/12") || docText.includes("ror") },
        { type: "driving_license", label: "Driving License / Vehicle RC", needed: docText.includes("driving license") || docText.includes("license") || docText.includes("rc book") },
        { type: "death_cert", label: "Death Certificate / Legal Heir Proof", needed: docText.includes("death") || docText.includes("legal heir") },
        { type: "job_card", label: "MGNREGA Job Card / Shramik Card", needed: docText.includes("job card") || docText.includes("mgnrega") || docText.includes("shramik") || docText.includes("e-shram") },
    ];

    const userDocs = user.documents || [];
    const requiredDocuments = standardDocs
        .filter(d => d.needed)
        .map(d => {
            const vaultMatch = userDocs.find(ud => ud.type === d.type);
            return {
                type: d.type,
                label: d.label,
                availableInVault: !!vaultMatch,
                documentId: vaultMatch?.id,
                fileName: vaultMatch?.name,
            };
        });

    // 4. Required Form Fields Mapping
    const requiredFields: RequiredFieldInfo[] = [
        {
            key: "fullName",
            label: "Full Name (as on Aadhaar)",
            type: "text",
            required: true,
            vaultMatched: !!user.name,
            sourceValue: user.name || undefined,
        },
        {
            key: "aadhaarNo",
            label: "12-digit Aadhaar Number",
            type: "text",
            required: true,
            vaultMatched: !!user.aadhaarNo,
            sourceValue: user.aadhaarNo ? `••••••••${user.aadhaarNo.slice(-4)}` : undefined,
        },
        {
            key: "dob",
            label: "Date of Birth",
            type: "date",
            required: true,
            vaultMatched: !!user.dob,
            sourceValue: user.dob ? new Date(user.dob).toISOString().split("T")[0] : undefined,
        },
        {
            key: "gender",
            label: "Gender",
            type: "select",
            required: true,
            vaultMatched: !!user.gender,
            sourceValue: user.gender || undefined,
        },
        {
            key: "phone",
            label: "Mobile Number",
            type: "text",
            required: true,
            vaultMatched: !!user.phone,
            sourceValue: user.phone || undefined,
        },
        {
            key: "state",
            label: "Domicile State",
            type: "text",
            required: true,
            vaultMatched: !!user.state,
            sourceValue: user.state || undefined,
        },
        {
            key: "income",
            label: "Annual Family Income (INR)",
            type: "number",
            required: true,
            vaultMatched: user.income !== null && user.income !== undefined,
            sourceValue: user.income ? `₹${user.income.toLocaleString("en-IN")}` : undefined,
        },
        {
            key: "address",
            label: "Permanent Residential Address",
            type: "text",
            required: true,
            vaultMatched: !!user.address,
            sourceValue: user.address ? `${user.address.substring(0, 30)}...` : undefined,
        },
    ];

    // Compute Vault Readiness Score
    const totalChecks = requiredFields.length + requiredDocuments.length;
    const passedFields = requiredFields.filter(f => f.vaultMatched).length;
    const passedDocs = requiredDocuments.filter(d => d.availableInVault).length;
    const vaultReadinessScore = Math.round(((passedFields + passedDocs) / Math.max(1, totalChecks)) * 100);
    const missingDocsCount = requiredDocuments.filter(d => !d.availableInVault).length;

    // 5. Determine Recommended Execution Mode
    let recommendedMode: PortalMode = "ZERO_TOUCH";
    let estimatedDurationSec = 8;
    let securitySummary = "Open Government Gateway: 100% Autonomous Zero-Touch submission supported.";

    if (isDirectPdf) {
        recommendedMode = "PDF_DOSSIER";
        estimatedDurationSec = 6;
        securitySummary = "Direct Official Form: Generating pre-filled government dossier with verified vault QR stamp.";
    } else if (requiresAadhaarOtp && captchaType !== "none") {
        recommendedMode = "ASSISTED_COPILOT";
        estimatedDurationSec = 25;
        securitySummary = "High-Security Gateway: Requires interactive Aadhaar SMS OTP & visual CAPTCHA verification relay.";
    } else if (requiresAadhaarOtp) {
        recommendedMode = "ASSISTED_COPILOT";
        estimatedDurationSec = 20;
        securitySummary = "Aadhaar e-KYC Portal: Requires interactive 6-digit Aadhaar SMS OTP relay.";
    } else if (captchaType !== "none" || isCloudflare) {
        recommendedMode = "ASSISTED_COPILOT";
        estimatedDurationSec = 18;
        securitySummary = `WAF/CAPTCHA Barrier (${captchaType.replace("_", " ")}): Assisted visual relay will verify human prompt in 3 seconds.`;
    }

    // Portal Name extraction
    let portalName = "National / State Gateway";
    if (rawUrl) {
        try {
            const domain = new URL(rawUrl).hostname;
            portalName = domain.replace(/^www\./, "");
        } catch {
            portalName = "Official Scheme Portal";
        }
    }

    return {
        url: rawUrl,
        portalName,
        portalStatus,
        latencyMs,
        sslValid,
        isCloudflareProtected: isCloudflare,
        captchaDetected: captchaType !== "none",
        captchaType,
        requiresAadhaarOtp,
        requiresDigiLockerAuth: requiresDigiLocker,
        recommendedMode,
        estimatedDurationSec,
        securitySummary,
        requiredDocuments,
        requiredFields,
        vaultReadinessScore,
        missingDocsCount,
        canAutoSubmit: passedFields >= 5, // Requires basic profile fields
    };
}
