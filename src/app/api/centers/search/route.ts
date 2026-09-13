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
            "Aadhaar Biometric e-KYC & Updates",
            "Post Office Savings DBT Account",
            "PM-KISAN e-KYC Verification",
            "Jeevan Pramaan Digital Life Certificate",
            "Postal Life Insurance (PLI)"
        ];
    }
    if (lower.includes("taluk") || lower.includes("tahsildar") || lower.includes("revenue") || lower.includes("collector") || lower.includes("administrative")) {
        return [
            "Income, Community & Nativity Certificates",
            "Patta / Chitta & Land Record Verification",
            "Old Age & Disability Pension (NSAP)",
            "Chief Minister Relief Fund / Uzhavar Thittam",
            "VAO Welfare Verification"
        ];
    }
    if (lower.includes("bank")) {
        return [
            "Aadhaar NPCI DBT Bank Account Seeding",
            "PM-KISAN Biometric Verification",
            "Atal Pension Yojana (APY) Registration",
            "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
            "PM Suraksha Bima Yojana (PMSBY)"
        ];
    }
    if (lower.includes("csc") || lower.includes("seva") || lower.includes("kendra") || lower.includes("digital")) {
        return [
            "Aadhaar Biometric Enrollment & Update",
            "Ayushman Bharat PM-JAY Golden Card",
            "PM-Vishwakarma Artisan Registration",
            "e-Shram Universal Account Card",
            "Kalaignar Magalir Urimai Thogai Support",
            "National Scholarship Portal (NSP)"
        ];
    }
    return [
        "Aadhaar e-KYC & Biometrics",
        "Digital Seva Welfare Enrollment",
        "DBT Certificate Verification",
        "Government Citizen Services"
    ];
}

function getFormattedPlaceType(rawName: string, rawType: string): string {
    const lower = (rawName + " " + rawType).toLowerCase();
    if (lower.includes("post") || lower.includes("mail")) return "POST OFFICE (AADHAAR e-KYC)";
    if (lower.includes("taluk") || lower.includes("tahsildar") || lower.includes("revenue") || lower.includes("collector")) return "TALUK / REVENUE OFFICE";
    if (lower.includes("bank")) return "AADHAAR BANKING & DBT POINT";
    if (lower.includes("csc") || lower.includes("seva") || lower.includes("kendra")) return "E-SEVA / CSC MAIYAM";
    if (lower.includes("registrar")) return "SUB-REGISTRAR OFFICE";
    return "GOVERNMENT ADMINISTRATIVE FACILITY";
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const hasLat = searchParams.has("lat");
    const hasLng = searchParams.has("lng");
    const userLat = parseFloat(searchParams.get("lat") || "9.3516");
    const userLng = parseFloat(searchParams.get("lng") || "77.9211");

    let cleanQuery = query.trim();
    let detectedPlaceName = cleanQuery || "Current GPS Location";
    let stateName = "Tamil Nadu";

    try {
        let refLat = userLat;
        let refLng = userLng;

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
                    stateName = addr.state || "Tamil Nadu";
                    detectedPlaceName = `${talukOrCity}${addr.county ? `, ${addr.county}` : ""}`;
                    cleanQuery = talukOrCity;
                }
            } catch (revErr) {
                console.error("Reverse Geocode Error:", revErr);
            }
        }

        if (!cleanQuery || cleanQuery.toLowerCase() === "nearby") {
            cleanQuery = "Sattur";
            detectedPlaceName = "Sattur, Virudhunagar";
        }

        // Standardize common aliases
        if (cleanQuery.toLowerCase() === "trichy") cleanQuery = "Tiruchirappalli";

        // 2. Geocode the query town to get its exact latitude/longitude if not using browser GPS
        let districtContext = "";
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery + " Tamil Nadu India")}&format=json&addressdetails=1&limit=1`,
                {
                    headers: {
                        "User-Agent": "SBMS-Welfare-Platform/2.0 (contact@sbms.gov.in)",
                        "Accept-Language": "en-IN,en;q=0.9"
                    }
                }
            );
            if (geoRes.ok) {
                const geoList = await geoRes.json();
                if (geoList.length > 0) {
                    const primary = geoList[0];
                    if (!hasLat || !hasLng) {
                        refLat = parseFloat(primary.lat);
                        refLng = parseFloat(primary.lon);
                    }
                    detectedPlaceName = primary.display_name.split(",").slice(0, 3).join(",");
                    districtContext = primary.address?.county || primary.address?.state_district || "";
                    if (primary.address?.state) stateName = primary.address.state;
                }
            }
        } catch (geoErr) {
            console.error("Geocoding Error:", geoErr);
        }

        // Specifically search for authentic government, CSC, e-Seva, Post Office, and Aadhaar Banking points (NO hospitals/ATMs)
        const searchQueries = [
            `taluk office ${cleanQuery}`,
            `tahsildar ${cleanQuery}`,
            `post office ${cleanQuery}`,
            `csc ${cleanQuery}`,
            `e seva ${cleanQuery}`,
            `bank ${cleanQuery}`,
            `sub registrar ${cleanQuery}`,
            `government office ${cleanQuery}`,
        ];

        if (districtContext && districtContext.toLowerCase() !== cleanQuery.toLowerCase()) {
            searchQueries.push(`taluk office ${districtContext}`);
            searchQueries.push(`post office ${districtContext}`);
            searchQueries.push(`e seva ${districtContext}`);
        }

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

        // Strict exclusion list: NO hospitals, clinics, ATMs, pharmacies, schools, hotels
        const excludedKeywords = [
            "hospital", "clinic", "pharmacy", "dentist", "nursing", "medical",
            "atm", "cash machine", "school", "college", "university", "hotel",
            "restaurant", "fuel", "petrol", "temple", "church", "mosque", "shop"
        ];

        for (const item of allItems) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

            if (seenCoords.has(coordKey)) continue;

            const rawName = item.name || item.display_name.split(",")[0] || "Government Public Center";
            const placeType = (item.type || item.class || "government").toLowerCase();
            const fullStr = (rawName + " " + placeType + " " + item.display_name).toLowerCase();

            // Strict filter out health/commercial/retail nodes
            const isExcluded = excludedKeywords.some(ex => fullStr.includes(ex));
            if (isExcluded) continue;

            // Enforce same state to avoid cross-state false matches
            const itemState = item.address?.state || "";
            if (itemState && stateName && itemState.toLowerCase() !== stateName.toLowerCase()) continue;

            seenCoords.add(coordKey);
            const dist = calculateDistance(refLat, refLng, lat, lng);

            // Filter out places that are excessively far (> 60km) when a specific local town is searched
            if (dist > 60 && cleanQuery.toLowerCase() !== "india") continue;

            centers.push({
                id: `osm-${item.place_id}`,
                osmId: String(item.osm_id || item.place_id),
                name: rawName,
                placeType: getFormattedPlaceType(rawName, placeType),
                address: item.display_name,
                state: itemState || stateName,
                district: item.address?.county || item.address?.state_district || item.address?.city || cleanQuery,
                pincode: item.address?.postcode || "626203",
                phone: "+91 1800-3000-3468",
                timing: "9:30 AM – 6:00 PM (Mon-Sat)",
                services: getServicesForOSMType(rawName, placeType),
                lat,
                lng,
                distanceKm: dist,
            });
        }

        // Sort by distance from reference coordinates
        centers.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

        return NextResponse.json({
            success: true,
            query: detectedPlaceName,
            centerCoords: { lat: refLat, lng: refLng },
            total: centers.length,
            centers: centers.slice(0, 25)
        });
    } catch (err: any) {
        console.error("OSM Search API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
