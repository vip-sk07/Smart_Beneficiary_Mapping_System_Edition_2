import { NextResponse } from "next/server";

// Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
}

function getServicesForOSMType(name: string, type: string): string[] {
    const lower = (name + " " + type).toLowerCase();
    if (lower.includes("post") || lower.includes("mail")) {
        return ["Aadhaar Biometric e-KYC", "Post Office Savings DBT Account", "PM-Kisan e-KYC Verification", "Postal Life Insurance"];
    }
    if (lower.includes("taluk") || lower.includes("tahsildar") || lower.includes("revenue") || lower.includes("collector")) {
        return ["Income & Community Certificates", "Patta / Chitta Land Transfer", "Old Age Pension (OAP)", "Chief Minister Relief Fund"];
    }
    return ["Aadhaar e-KYC", "Digital Seva Welfare Enrollment", "DBT Certificate Verification", "National Scholarship Submission"];
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "Virudhunagar";
    const userLat = parseFloat(searchParams.get("lat") || "9.4533");
    const userLng = parseFloat(searchParams.get("lng") || "77.7978");

    // Standardize query aliases
    let cleanQuery = query.trim();
    if (cleanQuery.toLowerCase() === "trichy") cleanQuery = "Tiruchirappalli";

    const searchQueries = [
        `post office ${cleanQuery} Tamil Nadu India`,
        `taluk office ${cleanQuery} Tamil Nadu India`,
        `collectorate ${cleanQuery} Tamil Nadu India`,
        `government office ${cleanQuery} Tamil Nadu India`,
        `${cleanQuery} Tamil Nadu India`
    ];

    try {
        const fetchPromises = searchQueries.map(qText =>
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qText)}&format=json&addressdetails=1&limit=6`, {
                headers: {
                    "User-Agent": "SBMS-Welfare-Platform/2.0 (contact@sbms.gov.in)",
                    "Accept-Language": "en-IN,en;q=0.9"
                }
            })
                .then(r => (r.ok ? r.json() : []))
                .catch(() => [])
        );

        const resultsArrays = await Promise.all(fetchPromises);
        const allItems = resultsArrays.flat();

        const seenCoords = new Set<string>();
        const centers: any[] = [];

        // Reference center coordinates (first item found)
        let refLat = userLat;
        let refLng = userLng;

        for (const item of allItems) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

            if (seenCoords.has(coordKey)) continue;
            seenCoords.add(coordKey);

            if (centers.length === 0) {
                refLat = lat;
                refLng = lng;
            }

            const rawName = item.name || item.display_name.split(",")[0] || "Government Public Center";
            const placeType = item.type || item.class || "government";
            const dist = calculateDistance(refLat, refLng, lat, lng);

            centers.push({
                id: `osm-${item.place_id}`,
                osmId: String(item.osm_id || item.place_id),
                name: rawName,
                placeType: placeType.replace(/_/g, " ").toUpperCase(),
                address: item.display_name,
                state: item.address?.state || "Tamil Nadu",
                district: item.address?.county || item.address?.state_district || item.address?.city || cleanQuery,
                pincode: item.address?.postcode || "620001",
                phone: "+91 1800-3000-3468",
                timing: "9:30 AM – 6:00 PM (Mon-Sat)",
                services: getServicesForOSMType(rawName, placeType),
                lat,
                lng,
                distanceKm: dist,
            });
        }

        // Sort by distance from queried location
        centers.sort((a, b) => a.distanceKm - b.distanceKm);

        return NextResponse.json({
            success: true,
            query: cleanQuery,
            centerCoords: { lat: refLat, lng: refLng },
            total: centers.length,
            centers: centers.slice(0, 15)
        });
    } catch (err: any) {
        console.error("OSM Search API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
