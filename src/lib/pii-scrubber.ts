/**
 * PII (Personally Identifiable Information) Scrubber
 * Automatically detects and masks sensitive Indian government IDs and data
 * before they are logged or stored in OCR databases.
 */

const PII_REGEX = [
    // Aadhaar Number (12 digits, optional spaces/hyphens) e.g., 1234-5678-9012 or 1234 5678 9012
    {
        name: "Aadhaar",
        regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
        mask: (match: string) => match.replace(/\d/g, (d, i, str) => (i < str.length - 4 ? "X" : d)),
    },
    // PAN Card (5 letters, 4 digits, 1 letter) e.g., ABCDE1234F
    {
        name: "PAN",
        regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi,
        mask: (match: string) => "XXXXX" + match.substring(5, 9) + "X",
    },
    // Indian Phone Number (+91 or just 10 digits)
    {
        name: "Phone",
        regex: /\b(?:\+91[ -]?)?[6789]\d{9}\b/g,
        mask: (match: string) => {
            const num = match.replace(/[^0-9]/g, "");
            const last4 = num.slice(-4);
            return match.includes("+91") ? `+91-XXXXXX${last4}` : `XXXXXX${last4}`;
        },
    },
    // Basic email masking (leaves domain intact)
    {
        name: "Email",
        regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
        mask: (match: string) => {
            const [local, domain] = match.split("@");
            if (local.length <= 2) return `XX@${domain}`;
            return `${local[0]}***${local[local.length - 1]}@${domain}`;
        }
    }
];

export function scrubPII(text: string): string {
    if (!text) return text;
    let scrubbedText = text;

    for (const rule of PII_REGEX) {
        scrubbedText = scrubbedText.replace(rule.regex, rule.mask);
    }

    return scrubbedText;
}
