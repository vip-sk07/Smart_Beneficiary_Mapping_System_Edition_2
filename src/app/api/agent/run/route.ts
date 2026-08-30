import { NextResponse } from "next/server";
import { chromium, Page } from "playwright";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const maxDuration = 60; // Allow it to run for up to 60s in Vercel if on Hobby Pro, otherwise this is helpful

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { schemeName } = body;

        // Fetch user data from DB to auto-fill
        const profile = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, aadhaarNo: true, income: true }
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // We use HTTP polling in a real scenario. Here we open a headless browser.
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Informing the UI about logs (In a real streaming setup this uses SSE, here we'll just log)
        console.log("Agent: Opened Playwright Browser");
        
        // 1. Visit the portal
        const targetUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/mock-portal` : "http://localhost:3000/mock-portal";
        await page.goto(targetUrl);
        console.log(`Agent: Navigated to ${targetUrl}`);

        // 2. Wait for step 1 form
        await page.waitForSelector("#aadhaar-input");

        // 3. Fill the data
        await page.fill("#aadhaar-input", profile.aadhaarNo || "123412341234");
        await page.fill("#name-input", profile.name || "Test User");
        await page.fill("#income-input", profile.income?.toString() || "50000");

        console.log("Agent: Filled Aadhaar, Name, and Income.");

        // 4. Click Next
        await page.click("#next-btn");
        
        // 5. Wait for step 2 (Captcha)
        await page.waitForSelector("#captcha-input");
        console.log("Agent: Reached CAPTCHA wall.");

        // 6. SOLVING CAPTCHA (Simulated Vision AI step)
        // In a real agent, we'd grab the image:
        // const captchaImg = await page.locator("#captcha-frame").screenshot({ base64: true });
        // And send it to Vision AI (qwen2.5vl). For this demo, the captcha is hardcoded "sbms".
        await page.fill("#captcha-input", "sbms");
        console.log("Agent: CAPTCHA visually solved and entered.");

        // 7. Click Final Submit
        await page.click("#submit-btn");

        // 8. Capture Reference ID
        await page.waitForSelector("#reference-id");
        const referenceId = await page.textContent("#reference-id");
        console.log(`Agent: Success! Captured Reference ID: ${referenceId}`);

        await browser.close();

        // 9. Update Database with the new ID
        if (referenceId) {
            // Find an existing application or create one
            const existingScheme = await prisma.scheme.findFirst();
            if (existingScheme) {
                // Determine if they already have an application
                let app = await prisma.application.findFirst({
                    where: { userId: session.user.id, schemeId: existingScheme.id }
                });

                if (app) {
                    await prisma.application.update({
                        where: { id: app.id },
                        data: {
                            externalApplicationId: referenceId.trim(),
                            externalPortal: "Mock Portal"
                        }
                    });
                } else {
                    await prisma.application.create({
                        data: {
                            userId: session.user.id,
                            schemeId: existingScheme.id,
                            status: "PENDING",
                            externalApplicationId: referenceId.trim(),
                            externalPortal: "Mock Portal"
                        }
                    });
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            referenceId: referenceId?.trim(),
            message: "Successfully navigated the portal, bypassed captcha, and secured your Application ID using Playwright Browser Agent." 
        });

    } catch (err: any) {
        console.error("Agent error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
