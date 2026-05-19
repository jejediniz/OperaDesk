process.env.NODE_ENV = "test";
delete process.env.REDIS_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-super-long-key-for-unit-tests-only";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_USER = process.env.DB_USER || "operadesk";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "operadesk";
process.env.DB_NAME = process.env.DB_NAME || "operadesk";
