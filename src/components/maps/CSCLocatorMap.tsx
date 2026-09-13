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
    osmId: string;
}

export default function CSCLocatorMap() {
    const [searchQuery, setSearchQuery] = useState("");
    const [centers, setCenters] = useState<RealGovCenter[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<RealGovCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLocationName, setCurrentLocationName] = useState("Virudhunagar / Sivakasi");

    // Fetch real OSM centers via our backend API route
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
                    toast.success(`📍 Found ${data.centers.length} authentic government centers in ${data.query || queryText}!`);
                } else {
                    toast.error(`No authentic centers found for "${queryText}".`);
                }
            } else {
                toast.error("Failed to query OpenStreetMap GIS API.");
            }
        } catch (err) {
            console.error("Fetch Centers Error:", err);
            toast.error("Network error connecting to OpenStreetMap.");
        } finally {
            setLoading(false);
        }
    };

    // Initial Load: Attempt Live User Geolocation First, Fallback to Registered Citizen Profile
    useEffect(() => {
        let isCancelled = false;

        const initLocation = async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        if (!isCancelled) {
                            const { latitude, longitude } = pos.coords;
                            searchCenters("", latitude, longitude);
                        }
                    },
                    async () => {
                        // If browser GPS is denied/prompted, fetch citizen's registered profile district/state
                        try {
                            const res = await fetch("/api/profile");
                            if (res.ok) {
                                const data = await res.json();
                                const district = data.user?.address || data.user?.state || "Tamil Nadu";
                                if (!isCancelled) searchCenters(district);
                                return;
                            }
                        } catch {}
                        if (!isCancelled) searchCenters("Chennai");
                    },
                    { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
                );
            } else {
                searchCenters("Chennai");
            }
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
                toast.success("GPS Locked! Finding nearest government offices...", { id: "gps" });
                searchCenters("", latitude, longitude);
            },
            (err) => {
                console.error("GPS Error:", err);
                toast.error("Could not retrieve GPS coordinates. Please enter your City or Taluk in search.", { id: "gps" });
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
                            Authentic Government & e-Seva Centers
                        </h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                            100% Real-Time GIS Mapping directly queried from OpenStreetMap (OSM) Public Registry.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "16px 20px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
                        <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="text"
                            placeholder="Enter any City or Taluk (e.g. Trichy, Sivakasi, Madurai, Chennai, Sattur, 626005)..."
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
                        <span>{loading ? "Searching OSM..." : "Find Real Centers"}</span>
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
            </div>

            {/* Results Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
                    <Loader2 size={32} color="#002147" className="animate-spin" style={{ margin: "0 auto 12px" }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2e5a" }}>Querying OpenStreetMap GIS Database...</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Retrieving real-time government and postal facilities for {currentLocationName}.</div>
                </div>
            ) : centers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0" }}>
                    <MapPin size={32} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2e5a" }}>No authentic centers found for this query.</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Try searching for a town name like &quot;Trichy&quot;, &quot;Sivakasi&quot;, or &quot;Madurai&quot;.</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
                    {/* Left: Real Centers List */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                                {centers.length} Authentic OpenStreetMap Places in {currentLocationName}
                            </div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 99 }}>
                                <Sparkles size={12} /> 100% Live OSM GIS Data
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
                                                <Building2 size={12} color="#0284c7" /> Type: {center.placeType}
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
                                        <ShieldCheck size={14} /> AUTHENTIC OPENSTREETMAP PUBLIC FACILITY
                                    </div>
                                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2e5a", margin: "0 0 4px" }}>
                                        {selectedCenter.name}
                                    </h2>
                                    <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                                        OSM Node ID: <strong>{selectedCenter.osmId}</strong> · District: {selectedCenter.district} ({selectedCenter.state})
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
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.lat},${selectedCenter.lng}`}
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
                                            href={`https://www.openstreetmap.org/node/${selectedCenter.osmId}#map=17/${selectedCenter.lat}/${selectedCenter.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
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
                                            <ExternalLink size={14} color="#0284c7" /> Open on OSM
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
