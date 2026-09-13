import { handlers } from "../src/auth";
import { NextRequest } from "next/server";

async function testSignIn() {
  const req = new NextRequest("http://localhost:3001/api/auth/signin/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "callbackUrl=%2Fdashboard",
  });
  const res = await handlers.POST(req);
  console.log("SignIn POST Status:", res.status);
  console.log("SignIn Headers:", Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log("SignIn Body/Redirect:", text);
}

testSignIn().catch(console.error);
