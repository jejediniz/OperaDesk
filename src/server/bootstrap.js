const { validateEnv } = require("./config/env");
const logger = require("./utils/logger");

let booted = false;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("app.shutdown", { signal });

  try {
    const pool = require("./config/database");
    await pool.end();
  } catch (err) {
    logger.error("app.shutdown_pool", { message: err?.message });
  }

  try {
    const { prisma } = require("../lib/prisma");
    await prisma.$disconnect();
  } catch (err) {
    logger.error("app.shutdown_prisma", { message: err?.message });
  }

  process.exit(0);
}

function bootstrap() {
  if (booted) return;
  booted = true;

  validateEnv();

  logger.info("app.boot", {
    env: process.env.NODE_ENV,
    nodeVersion: process.version,
    pid: process.pid
  });

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    logger.error("unhandled_rejection", {
      message: reason?.message ?? String(reason),
      stack: reason?.stack
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("uncaught_exception", {
      message: error?.message,
      stack: error?.stack
    });
  });
}

bootstrap();

module.exports = { bootstrap };
