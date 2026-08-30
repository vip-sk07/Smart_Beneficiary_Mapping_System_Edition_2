"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Navigation, Search, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";

// Mock verified Common Service Centers across India
const MOCK_CSCS = [
    {
        id: "csc-1",
        name: "Mepco CSC & Digital Seva Kendra",
        vleName: "Rajesh Kumar (VLE-8841)",
        address: "Near Bus Stand, Mepco Nagar, Sivakasi – 626005",
        state: "Tamil Nadu",
        district: "Virudhunagar",
        pincode: "626005",
        phone: "+91 98421 54321",
        timing: "9:00 AM – 7:00 PM (Mon-Sat)",
        services: ["Aadhaar e-KYC", "PM-Kisan Registration", "Income/Caste Certificate", "Ayushman Card Print"],
        lat: 9.4533,
        lng: 77.7978,
        distanceKm: 0.8,
    },
    {
        id: "csc-2",
        name: "Sivakasi Town e-Seva Maiyam",
        vleName: "M. Selvam (VLE-1029)",
        address: "14/A, Gandhi Road, Opp. Taluk Office, Sivakasi",
        state: "Tamil Nadu",
        district: "Virudhunagar",
        pincode: "626123",
        phone: "+91 94432 10987",
        timing: "9:30 AM – 6:00 PM",
        services: ["Scholarship Form Submission", "Mudra Loan Assistance", "Voter ID Services"],
        lat: 9.4550,
        lng: 77.8000,
        distanceKm: 2.1,
    },
    {
        id: "csc-3",
        name: "Virudhunagar District e-Governance Center",
        vleName: "K. Meenakshi (VLE-5521)",
        address: "Collectorate Complex, Virudhunagar Main Road",
        state: "Tamil Nadu",
        district: "Virudhunagar",
        pincode: "626002",
        phone: "+91 97890 12345",
        timing: "10:00 AM – 5:30 PM",
        services: ["Grievance Redressal", "PMAY Housing Verification", "Disability Welfare Cards"],
        lat: 9.5872,
        lng: 77.9579,
        distanceKm: 18.4,
    },
    {
        id: "csc-4",
        name: "Madurai Central Common Service Center",
        vleName: "S. Venkatesh (VLE-9081)",
        address: "Near Periyar Bus Stand, West Veli Street, Madurai",
        state: "Tamil Nadu",
        district: "Madurai",
        pincode: "625001",
        phone: "+91 98940 56789",
        timing: "9:00 AM – 8:00 PM",
        services: ["All Central & State Schemes", "DBT Bank Linking", "DigiLocker Assistance"],
        lat: 9.9252,
        lng: 78.1198,
        distanceKm: 65.0,
    }
];

export default function CSCLocatorMap() {
    const [searchPin, setSearchPin] = useState("");
    const [centers, setCenters] = useState(MOCK_CSCS);
    const [selectedCenter, setSelectedCenter] = useState(MOCK_CSCS[0]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchPin.trim()) {
            setCenters(MOCK_CSCS);
            return;
        }
        const filtered = MOCK_CSCS.filter(c =>
            c.pincode.includes(searchPin) ||
            c.district.toLowerCase().includes(searchPin.toLowerCase()) ||
            c.name.toLowerCase().includes(searchPin.toLowerCase())
        );
        setCenters(filtered);
        if (filtered.length > 0) setSelectedCenter(filtered[0]);
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0, 33, 71, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MapPin size={20} color="#002147" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                        Find Nearest CSC & e-Seva Kendra
                    </h1>
                </div>
                <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                    Locate verified Village Level Entrepreneurs (VLEs) and Common Service Centers for in-person scheme application assistance.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 24, maxWidth: 600 }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter PIN Code (e.g. 626005) or District name…"
                        value={searchPin}
                        onChange={(e) => setSearchPin(e.target.value)}
                        style={{ paddingLeft: 36, height: 42, fontSize: 13.5 }}
                    />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "0 20px", height: 42, background: "#0f2e5a", color: "white" }}>
                    Search Centers
                </button>
            </form>

            {/* 2-Column Grid: List on Left, Map & Detail Card on Right */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
                {/* Center List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                        {centers.length} Centers Found Nearby
                    </div>

                    {centers.map(center => {
                        const isSelected = selectedCenter.id === center.id;
                        return (
                            <div
                                key={center.id}
                                onClick={() => setSelectedCenter(center)}
                                style={{
                                    background: isSelected ? "#eff6ff" : "white",
                                    border: `1.5px solid ${isSelected ? "#3b82f6" : "#e2e8f0"}`,
                                    borderRadius: 12,
                                    padding: "16px 18px",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "0 1px 3px rgba(0,0,0,0.04)"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                    <h3 style={{ fontSize: 14.5, fontWeight: 800, color: isSelected ? "#1d4ed8" : "#0f172a" }}>
                                        {center.name}
                                    </h3>
                                    <span style={{ fontSize: 11, fontWeight: 700, background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 99 }}>
                                        ~{center.distanceKm} km away
                                    </span>
                                </div>
                                <p style={{ fontSize: 12.5, color: "#475569", marginBottom: 8, lineHeight: 1.4 }}>
                                    {center.address}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#64748b" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Phone size={12} /> {center.phone}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Clock size={12} /> {center.timing}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected Center Interactive Preview Box */}
                <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <ShieldCheck size={20} color="#16a34a" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase" }}>
                            Verified Government Common Service Center
                        </span>
                    </div>

                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2e5a", marginBottom: 4 }}>
                        {selectedCenter.name}
                    </h2>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                        Operator: <strong>{selectedCenter.vleName}</strong> · District: {selectedCenter.district} ({selectedCenter.state})
                    </p>

                    {/* OpenStreetMap Embed Visual Container */}
                    <div style={{
                        height: 200,
                        borderRadius: 10,
                        overflow: "hidden",
                        marginBottom: 18,
                        border: "1px solid #cbd5e1",
                        position: "relative"
                    }}>
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCenter.lng - 0.01}%2C${selectedCenter.lat - 0.01}%2C${selectedCenter.lng + 0.01}%2C${selectedCenter.lat + 0.01}&layer=mapnik&marker=${selectedCenter.lat}%2C${selectedCenter.lng}`}
                            style={{ border: 0 }}
                        />
                    </div>

                    {/* Services Offered List */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                            Services Available at this Center:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {selectedCenter.services.map((svc, i) => (
                                <span
                                    key={i}
                                    style={{
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        background: "#f1f5f9",
                                        color: "#0f2e5a",
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #e2e8f0"
                                    }}
                                >
                                    ✓ {svc}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 10 }}>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.lat},${selectedCenter.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                flex: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "10px 16px",
                                borderRadius: 8,
                                background: "#0f2e5a",
                                color: "white",
                                fontSize: 13,
                                fontWeight: 700,
                                textDecoration: "none"
                            }}
                        >
                            <Navigation size={14} /> Get Turn-by-Turn Directions
                        </a>
                        <a
                            href={`tel:${selectedCenter.phone}`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "10px 16px",
                                borderRadius: 8,
                                background: "#f8fafc",
                                color: "#0f2e5a",
                                border: "1px solid #cbd5e1",
                                fontSize: 13,
                                fontWeight: 700,
                                textDecoration: "none"
                            }}
                        >
                            <Phone size={14} /> Call VLE
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
