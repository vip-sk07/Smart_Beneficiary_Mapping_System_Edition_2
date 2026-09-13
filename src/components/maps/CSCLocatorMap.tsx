"use client";

import { useEffect, useState } from "react";
import {
    MapPin,
    Phone,
    Clock,
    Navigation,
    Search,
    CheckCircle2,
    ShieldCheck,
    Building2,
    Compass,
    Loader2,
    Sparkles,
    Landmark,
    ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export interface RealGovCenter {
    id: string;
    name: string;
    agency?: string;
    placeType: string;
    address: string;
    state: string;
    district: string;
    pincode: string;
    phone: string;
    timing: string;
    services: string[];
    lat: number;
    lng: number;
    distanceKm?: number;
    osmId?: string;
}

export default function CSCLocatorMap() {
    const [searchQuery, setSearchQuery] = useState("");
    const [centers, setCenters] = useState<RealGovCenter[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<RealGovCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLocationName, setCurrentLocationName] = useState("Sattur, Virudhunagar");

    // Fetch verified government centers via our backend API route
    const searchCenters = async (queryText: string, userLat?: number, userLng?: number) => {
        setLoading(true);
        try {
            let url = `/api/centers/search?q=${encodeURIComponent(queryText)}`;
            if (userLat && userLng) {
                url += `&lat=${userLat}&lng=${userLng}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.centers?.length > 0) {
                    setCenters(data.centers);
                    setSelectedCenter(data.centers[0]);
                    setCurrentLocationName(data.query || queryText);
                    toast.success(`📍 Found ${data.centers.length} verified government centers in ${data.query || queryText}!`);
                } else {
                    toast.error(`No centers found for "${queryText}". Try a Pincode or Taluk name.`);
                }
            } else {
                toast.error("Failed to query government directory.");
            }
        } catch (err) {
            console.error("Fetch Centers Error:", err);
            toast.error("Network error connecting to directory.");
        } finally {
            setLoading(false);
        }
    };

    // Initial Load: Default to Sattur / Virudhunagar or Profile District
    useEffect(() => {
        let isCancelled = false;

        const initLocation = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    const district = data.user?.address || data.user?.state || "Sattur";
                    if (!isCancelled) searchCenters(district);
                    return;
                }
            } catch {}
            if (!isCancelled) searchCenters("Sattur");
        };

        initLocation();
        return () => { isCancelled = true; };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) {
            handleNearMe();
            return;
        }
        searchCenters(q);
    };

    // Live GPS Location
    const handleNearMe = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        toast.loading("Detecting your live GPS coordinates...", { id: "gps" });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                toast.success("GPS Locked! Finding nearest government centers...", { id: "gps" });
                searchCenters("", latitude, longitude);
            },
            (err) => {
                console.error("GPS Error:", err);
                toast.error("Could not retrieve GPS coordinates. Please enter your Pincode or Taluk in search.", { id: "gps" });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0, 33, 71, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Landmark size={20} color="#002147" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                            Authentic Government & CSC e-Seva Centers
                        </h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                            Pan-India Master Directory: 154,000+ Official E-Governance & Biometric e-KYC Service Points.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "16px 20px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
                        <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="text"
                            placeholder="Enter any 6-digit Pincode, Taluk, or City (e.g. 626203, Sattur, Sivakasi, Jaipur, Varanasi, Pune)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px 10px 40px",
                                borderRadius: 8,
                                border: "1.5px solid #cbd5e1",
                                fontSize: 13.5,
                                outline: "none",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 20px",
                            borderRadius: 8,
                            background: "#002147",
                            color: "white",
                            fontSize: 13.5,
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        <span>{loading ? "Searching Directory..." : "Find Verified Centers"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleNearMe}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 16px",
                            borderRadius: 8,
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: 13.5,
                            fontWeight: 700,
                            border: "1.5px solid #bfdbfe",
                            cursor: "pointer",
                        }}
                    >
                        <Compass size={15} />
                        <span>Live GPS Near Me</span>
                    </button>
                </form>

                {/* Quick Multi-State & Taluk Selectors */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>Quick Select Hubs:</span>
                    {[
                        { label: "Sattur (626203)", q: "Sattur" },
                        { label: "Sivakasi (626123)", q: "Sivakasi" },
                        { label: "Virudhunagar", q: "Virudhunagar" },
                        { label: "Madurai", q: "Madurai" },
                        { label: "Chennai", q: "Chennai" },
                        { label: "Jaipur (RJ)", q: "Jaipur" },
                        { label: "Varanasi (UP)", q: "Varanasi" },
                        { label: "Pune (MH)", q: "Pune" },
                        { label: "Bengaluru (KA)", q: "Bengaluru" },
                    ].map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                                setSearchQuery(item.q);
                                searchCenters(item.q);
                            }}
                            style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                background: currentLocationName.toLowerCase().includes(item.q.toLowerCase()) || searchQuery === item.q ? "#002147" : "#f1f5f9",
                                color: currentLocationName.toLowerCase().includes(item.q.toLowerCase()) || searchQuery === item.q ? "white" : "#334155",
                                fontSize: 12,
                                fontWeight: 600,
                                border: "1px solid #cbd5e1",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            📍 {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
                    <Loader2 size={32} color="#002147" className="animate-spin" style={{ margin: "0 auto 12px" }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2e5a" }}>Searching Master Pan-India Directory...</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Querying 154,000+ verified government service points for {currentLocationName}.</div>
                </div>
            ) : centers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
                    <MapPin size={32} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2e5a" }}>No government centers found for this query.</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Try entering your 6-digit Pincode (e.g. 626203) or Taluk name.</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
                    {/* Left: Real Centers List */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                                {centers.length} Official Government Centers in {currentLocationName}
                            </div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 99 }}>
                                <Sparkles size={12} /> 100% Verified Pan-India Data
                            </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 600, overflowY: "auto", paddingRight: 4 }}>
                            {centers.map(center => {
                                const isSelected = selectedCenter?.id === center.id;
                                return (
                                    <div
                                        key={center.id}
                                        onClick={() => setSelectedCenter(center)}
                                        style={{
                                            padding: "16px",
                                            borderRadius: 12,
                                            border: isSelected ? "2px solid #002147" : "1.5px solid #e2e8f0",
                                            background: isSelected ? "#f8fafc" : "white",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease",
                                            boxShadow: isSelected ? "0 4px 12px rgba(0, 33, 71, 0.08)" : "none",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                                            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f2e5a", margin: 0, lineHeight: 1.3 }}>
                                                {center.name}
                                            </h3>
                                            {center.distanceKm !== undefined && (
                                                <span style={{ fontSize: 11.5, fontWeight: 700, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>
                                                    ~{center.distanceKm} km away
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, lineHeight: 1.4 }}>
                                            {center.address}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 11.5, color: "#475569" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                <Building2 size={12} color="#0284c7" /> {center.placeType}
                                            </span>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                <Clock size={12} color="#f59e0b" /> {center.timing}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Map & Center Inspection Panel */}
                    {selectedCenter && (
                        <div>
                            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                                <div style={{ padding: "18px 20px", borderBottom: "1.5px solid #f1f5f9" }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
                                        <ShieldCheck size={14} /> {selectedCenter.agency || "VERIFIED GOVERNMENT FACILITY"}
                                    </div>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2e5a", margin: "0 0 4px" }}>
                                        {selectedCenter.name}
                                    </h2>
                                    <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                                        Pincode: <strong>{selectedCenter.pincode}</strong> · District: {selectedCenter.district} ({selectedCenter.state})
                                    </p>
                                </div>

                                {/* Live OpenStreetMap Tile Embed Centered Exactly on Selected Place */}
                                <div style={{ height: 260, width: "100%", position: "relative", background: "#e2e8f0" }}>
                                    <iframe
                                        key={selectedCenter.id}
                                        title="OpenStreetMap"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCenter.lng - 0.015}%2C${selectedCenter.lat - 0.015}%2C${selectedCenter.lng + 0.015}%2C${selectedCenter.lat + 0.015}&layer=mapnik&marker=${selectedCenter.lat}%2C${selectedCenter.lng}`}
                                        style={{ border: 0 }}
                                    />
                                </div>

                                {/* Services & Live Navigation */}
                                <div style={{ padding: "18px 20px" }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f2e5a", marginBottom: 10 }}>
                                        Official Public Services Offered:
                                    </div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                                        {selectedCenter.services.map((srv, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    fontSize: 11.5,
                                                    fontWeight: 600,
                                                    background: "#f1f5f9",
                                                    color: "#334155",
                                                    padding: "4px 10px",
                                                    borderRadius: 6,
                                                    border: "1px solid #e2e8f0",
                                                }}
                                            >
                                                <CheckCircle2 size={12} color="#16a34a" /> {srv}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCenter.name + " " + selectedCenter.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                                padding: "10px 14px",
                                                borderRadius: 8,
                                                background: "#002147",
                                                color: "white",
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                textDecoration: "none",
                                            }}
                                        >
                                            <Navigation size={14} /> Get Turn-by-Turn GPS
                                        </a>

                                        <a
                                            href={`tel:${selectedCenter.phone || "18002666868"}`}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                                padding: "10px 14px",
                                                borderRadius: 8,
                                                background: "#f8fafc",
                                                color: "#0f2e5a",
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                textDecoration: "none",
                                                border: "1.5px solid #cbd5e1",
                                            }}
                                        >
                                            <Phone size={14} color="#0284c7" /> Call Helpline
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
