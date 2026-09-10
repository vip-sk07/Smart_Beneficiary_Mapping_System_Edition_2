/**
 * DigiLocker National Gateway Integration Service
 * Standards: OAuth 2.0 / MeriPehchaan (National SSO) / XML-DSig
 */

export interface DigiLockerIssuedDoc {
    id: string;
    docType: "aadhaar" | "income_cert" | "caste_cert" | "domicile" | "ration_card" | "education_cert";
    name: string;
    issuer: string;
    issuerCode: string;
    issuedDate: string;
    certificateNumber: string;
    digitalSignature: string;
    validUntil: string | null;
    xmlPayload: {
        beneficiaryName: string;
        fatherOrHusbandName?: string;
        dob?: string;
        annualIncome?: number;
        community?: string;
        address?: string;
        district?: string;
        state?: string;
    };
}

// Pre-seeded authentic digital certificate templates issued to verified citizen
export const MOCK_ISSUED_DIGILOCKER_DOCS: DigiLockerIssuedDoc[] = [
    {
        id: "dl-aadhaar-01",
        docType: "aadhaar",
        name: "Aadhaar Card (e-KYC Verified)",
        issuer: "Unique Identification Authority of India (UIDAI)",
        issuerCode: "UIDAI-GOI-001",
        issuedDate: "12/03/2023",
        certificateNumber: "UIDAI-eKYC-9514714655",
        digitalSignature: "SHA256-RSA:UIDAI-SUB-CA-2023-VERIFIED",
        validUntil: null,
        xmlPayload: {
            beneficiaryName: "Karan Raj T",
            dob: "2006-07-23",
            address: "Near Mepco Nagar, Sivakasi, Tamil Nadu – 626005",
            district: "Virudhunagar",
            state: "Tamil Nadu",
        },
    },
    {
        id: "dl-income-02",
        docType: "income_cert",
        name: "Income Certificate (e-Seva TN Revenue)",
        issuer: "Department of Revenue Administration, Govt of Tamil Nadu",
        issuerCode: "TN-REV-SIVAKASI-2026",
        issuedDate: "14/01/2026",
        certificateNumber: "TN-7202601140987",
        digitalSignature: "SHA256-RSA:TNeGA-REVENUE-TAHSILDAR-SIG",
        validUntil: "2027-01-14",
        xmlPayload: {
            beneficiaryName: "Karan Raj T",
            annualIncome: 72000,
            district: "Virudhunagar",
            state: "Tamil Nadu",
        },
    },
    {
        id: "dl-caste-03",
        docType: "caste_cert",
        name: "Community Certificate (OBC / BC / MBC)",
        issuer: "Revenue Taluk Office, Sivakasi",
        issuerCode: "TN-COMM-8819",
        issuedDate: "05/08/2022",
        certificateNumber: "TN-COMM-2022-881921",
        digitalSignature: "SHA256-RSA:TNeGA-COMMUNITY-OFFICER-SIG",
        validUntil: null,
        xmlPayload: {
            beneficiaryName: "Karan Raj T",
            community: "OBC",
            district: "Virudhunagar",
            state: "Tamil Nadu",
        },
    },
    {
        id: "dl-domicile-04",
        docType: "domicile",
        name: "Nativity / Domicile Certificate",
        issuer: "Tahsildar Office, Virudhunagar District",
        issuerCode: "TN-NAT-626005",
        issuedDate: "20/09/2023",
        certificateNumber: "TN-NAT-2023-441209",
        digitalSignature: "SHA256-RSA:TNeGA-NATIVITY-GOVT-SIG",
        validUntil: null,
        xmlPayload: {
            beneficiaryName: "Karan Raj T",
            district: "Virudhunagar",
            state: "Tamil Nadu",
        },
    },
    {
        id: "dl-ration-05",
        docType: "ration_card",
        name: "Smart Family Ration Card (PDS)",
        issuer: "Civil Supplies & Consumer Protection Dept, Tamil Nadu",
        issuerCode: "TN-PDS-SMARTCARD",
        issuedDate: "10/02/2021",
        certificateNumber: "33/W/0987123",
        digitalSignature: "SHA256-RSA:TNPDS-DIRECTORATE-SIG",
        validUntil: null,
        xmlPayload: {
            beneficiaryName: "Karan Raj T",
            district: "Virudhunagar",
            state: "Tamil Nadu",
        },
    },
    {
        id: "dl-edu-06",
        docType: "education_cert",
        name: "Higher Secondary Marksheet / Bonafide",
        issuer: "Directorate of Government Examinations, Tamil Nadu",
        issuerCode: "TN-DGE-HSC",
        issuedDate: "22/05/2024",
        certificateNumber: "TN-HSC-2024-554109",
        digitalSignature: "SHA256-RSA:TNDGE-EXAM-BOARD-SIG",
        validUntil: null,
        xmlPayload: {
            beneficiaryName: "Karan Raj T",
            dob: "2006-07-23",
            district: "Virudhunagar",
            state: "Tamil Nadu",
        },
    },
];
