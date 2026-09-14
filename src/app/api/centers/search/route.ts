import { NextResponse } from "next/server";
import { searchPanIndia, reverseGeocodeLocation } from "@/lib/pan-india-centers";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const hasLat = searchParams.has("lat");
    const hasLng = searchParams.has("lng");
    const userLat = parseFloat(searchParams.get("lat") || "9.3516");
    const userLng = parseFloat(searchParams.get("lng") || "77.9211");

    let cleanQuery = query.trim();

    try {
        let detectedState: string | undefined = undefined;

        // If GPS coordinates provided without specific query, reverse-geocode place name
        if ((cleanQuery.toLowerCase() === "nearby" || cleanQuery === "") && hasLat && hasLng) {
            try {
                const geo = await reverseGeocodeLocation(userLat, userLng);
                cleanQuery = geo.pincode || geo.taluk || geo.district || "Sattur";
                detectedState = geo.state;
            } catch (revErr) {
                console.error("Reverse Geocode Error:", revErr);
            }
        }

        if (!cleanQuery || cleanQuery.toLowerCase() === "nearby") {
            cleanQuery = "Sattur";
        }

        // Search the Master Pan-India Dataset (154,000+ official centers)
        const results = await searchPanIndia(cleanQuery, userLat, userLng, detectedState);

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
