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
        return [
            "Aadhaar Biometric e-KYC",
            "Post Office Savings DBT Account",
            "PM-KISAN e-KYC Verification",
            "Jeevan Pramaan Life Certificate",
            "Postal Life Insurance"
        ];
    }
    if (lower.includes("taluk") || lower.includes("tahsildar") || lower.includes("revenue") || lower.includes("collector")) {
        return [
            "Income, Caste & Domicile Certificates",
            "Patta / Chitta Land Transfer",
            "Old Age & Disability Pension (NSAP)",
            "Chief Minister Relief Fund",
            "Land Record Biometric Seeding"
        ];
    }
    if (lower.includes("csc") || lower.includes("seva") || lower.includes("kendra") || lower.includes("digital")) {
        return [
            "Aadhaar Biometric Enrollment",
            "Ayushman Bharat PM-JAY Golden Card",
            "PM-Vishwakarma Artisan Registration",
            "e-Shram Universal Account Card",
            "PM-KISAN Biometric e-KYC",
            "National Scholarship Portal (NSP)"
        ];
    }
    return [
        "Aadhaar e-KYC & Biometrics",
        "Digital Seva Welfare Enrollment",
        "DBT Certificate Verification",
        "Ayushman Bharat Card Printing"
    ];
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const hasLat = searchParams.has("lat");
    const hasLng = searchParams.has("lng");
    const userLat = parseFloat(searchParams.get("lat") || "9.4533");
    const userLng = parseFloat(searchParams.get("lng") || "77.7978");

    let cleanQuery = query.trim();
    let detectedPlaceName = cleanQuery || "Current GPS Location";
    let stateName = "India";

    try {
        // 1. If GPS coordinates provided or query is "nearby", perform dynamic reverse geocoding
        if ((cleanQuery.toLowerCase() === "nearby" || cleanQuery === "" || hasLat) && hasLat && hasLng) {
            try {
                const revRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&addressdetails=1`,
                    {
                        headers: {
                            "User-Agent": "SBMS-Welfare-Platform/2.0 (contact@sbms.gov.in)",
                            "Accept-Language": "en-IN,en;q=0.9"
                        }
                    }
                );
                if (revRes.ok) {
                    const revData = await revRes.json();
                    const addr = revData.address || {};
                    const talukOrCity = addr.suburb || addr.town || addr.village || addr.city || addr.county || addr.state_district || "Local Area";
                    stateName = addr.state || "India";
                    detectedPlaceName = `${talukOrCity}${addr.county ? `, ${addr.county}` : ""}`;
                    cleanQuery = talukOrCity;
                }
            } catch (revErr) {
                console.error("Reverse Geocode Error:", revErr);
            }
        }

        if (!cleanQuery || cleanQuery.toLowerCase() === "nearby") {
            cleanQuery = "Virudhunagar";
            detectedPlaceName = "Virudhunagar / Sivakasi";
        }

        // Standardize common aliases
        if (cleanQuery.toLowerCase() === "trichy") cleanQuery = "Tiruchirappalli";

        const searchQueries = [
            `csc ${cleanQuery} ${stateName}`,
            `e seva ${cleanQuery} ${stateName}`,
            `post office ${cleanQuery} ${stateName}`,
            `taluk office ${cleanQuery} ${stateName}`,
            `government office ${cleanQuery} ${stateName}`,
            `${cleanQuery} ${stateName}`
        ];

        const fetchPromises = searchQueries.map(qText =>
            fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qText)}&format=json&addressdetails=1&limit=8`, {
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

        let refLat = userLat;
        let refLng = userLng;

        for (const item of allItems) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

            if (seenCoords.has(coordKey)) continue;
            seenCoords.add(coordKey);

            const rawName = item.name || item.display_name.split(",")[0] || "Government Public Center";
            const placeType = item.type || item.class || "government";
            const dist = calculateDistance(refLat, refLng, lat, lng);

            centers.push({
                id: `osm-${item.place_id}`,
                osmId: String(item.osm_id || item.place_id),
                name: rawName,
                placeType: placeType.replace(/_/g, " ").toUpperCase(),
                address: item.display_name,
                state: item.address?.state || stateName,
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

        // Sort by distance from user's live coordinates
        centers.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

        return NextResponse.json({
            success: true,
            query: detectedPlaceName,
            centerCoords: { lat: refLat, lng: refLng },
            total: centers.length,
            centers: centers.slice(0, 20)
        });
    } catch (err: any) {
        console.error("OSM Search API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
