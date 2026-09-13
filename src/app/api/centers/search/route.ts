import { NextResponse } from "next/server";
import { searchPanIndia } from "@/lib/pan-india-centers";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const hasLat = searchParams.has("lat");
    const hasLng = searchParams.has("lng");
    const userLat = parseFloat(searchParams.get("lat") || "9.3516");
    const userLng = parseFloat(searchParams.get("lng") || "77.9211");

    let cleanQuery = query.trim();

    try {
        // If GPS coordinates provided without specific query, reverse-geocode place name
        if ((cleanQuery.toLowerCase() === "nearby" || cleanQuery === "") && hasLat && hasLng) {
            try {
                const revRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&addressdetails=1`,
                    {
                        headers: {
                            "User-Agent": "SBMS-National-Platform/2.0 (contact@sbms.gov.in)",
                            "Accept-Language": "en-IN,en;q=0.9"
                        }
                    }
                );
                if (revRes.ok) {
                    const revData = await revRes.json();
                    const addr = revData.address || {};
                    cleanQuery = addr.suburb || addr.town || addr.village || addr.city || addr.county || addr.state_district || "Sattur";
                }
            } catch (revErr) {
                console.error("Reverse Geocode Error:", revErr);
            }
        }

        if (!cleanQuery || cleanQuery.toLowerCase() === "nearby") {
            cleanQuery = "Sattur";
        }

        // Search the Master Pan-India Dataset (154,000+ official centers)
        const results = await searchPanIndia(cleanQuery, userLat, userLng);

        return NextResponse.json({
            success: true,
            query: results.queryLabel,
            centerCoords: results.centerCoords,
            total: results.centers.length,
            centers: results.centers
        });
    } catch (err: any) {
        console.error("Pan-India Centers Search Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
