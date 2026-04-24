import { NextResponse } from "next/server";
const pool = require("../../../src/server/config/database");

export async function GET() {
  const startedAt = Date.now();
  let dbStatus = "ok";
  let dbLatencyMs = null;

  try {
    const dbStart = Date.now();
    await pool.query("SELECT 1");
    dbLatencyMs = Date.now() - dbStart;
  } catch (error) {
    dbStatus = "error";
  }

  const payload = {
    status: dbStatus === "ok" ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: { status: dbStatus, latencyMs: dbLatencyMs },
    responseTimeMs: Date.now() - startedAt
  };

  return NextResponse.json(payload, {
    status: dbStatus === "ok" ? 200 : 503
  });
}
