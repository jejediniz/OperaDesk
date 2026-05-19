import { NextResponse } from "next/server";
const pool = require("../../../src/server/config/database");
const logger = require("../../../src/server/utils/logger");

export const dynamic = "force-dynamic";

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
    logger.error("health_check_db_failed", { error: error?.message });
  }

  const payload = {
    status: dbStatus === "ok" ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || null,
    commit: process.env.GIT_SHA || null,
    db: { status: dbStatus, latencyMs: dbLatencyMs },
    responseTimeMs: Date.now() - startedAt
  };

  return NextResponse.json(payload, {
    status: dbStatus === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" }
  });
}
