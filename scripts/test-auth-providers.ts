import { handlers } from "../src/auth";
import { NextRequest } from "next/server";

async function test() {
  const req = new NextRequest("http://localhost:3001/api/auth/providers");
  const res = await handlers.GET(req);
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Providers response:", JSON.stringify(data, null, 2));
}

test().catch(console.error);
