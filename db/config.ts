/**
 * DATABASE CONFIGURATION
 *
 * Handles PostgreSQL connection setup and management.
 * Uses connection pooling for efficient database access.
 * Provides centralized database configuration and error handling.
 */

import { Pool } from "pg";
import dotenv from "dotenv";
import assert from "assert";

// Load environment variables from .env file
dotenv.config();

// Validate that the required environment variable is present
// This prevents runtime errors from missing database configuration
assert(process.env.DATABASE_URL, "❌ Missing environment variable: DATABASE_URL");

/**
 * PostgreSQL connection pool configuration
 * Uses DATABASE_URL for connection
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections in pool
  min: 0,  // Minimum number of connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Connection retry configuration
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

/**
 * Get PostgreSQL connection pool
 *
 * Implements connection pooling for efficient database access.
 * Includes automatic retry logic for connection failures.
 *
 * @returns Promise<Pool> - Database connection pool
 * @throws Error if connection fails after all retries
 */
export const getPool = async (): Promise<Pool> => {
  // Test the connection with retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = await pool.connect();
      console.log("\x1b[32m[DB]\x1b[0m ✅ Connected successfully to PostgreSQL");
      client.release();
      return pool;
    } catch (error: any) {
      const code = error.code || "UNKNOWN";
      const message = error.message || "No error message provided";

      console.error(`\x1b[31m[DB]\x1b[0m  Connection failed [${code}]: ${message}`);

      // Provide helpful error messages for common connection issues
      switch (code) {
        case "ECONNREFUSED":
          console.error("💡 Check if PostgreSQL is running and accessible.");
          break;
        case "ENOTFOUND":
          console.error("💡 Database host not found — verify DATABASE_URL in your .env file.");
          break;
        case "28P01":
          console.error("💡 Authentication failed — verify credentials in DATABASE_URL.");
          break;
        case "ETIMEOUT":
          console.error("💡 Timeout — check network/firewall settings or server availability.");
          break;
        default:
          console.error("💡 Unknown error — inspect DATABASE_URL or network configuration.");
      }

      // Retry connection if attempts remain
      if (attempt < MAX_RETRIES) {
        console.log(`\x1b[33m[DB]\x1b[0m ⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("\x1b[31m[DB]\x1b[0m 🚨 Max retries reached. Unable to connect to PostgreSQL.");
        throw error;
      }
    }
  }

  throw new Error("PostgreSQL connection failed after multiple retries.");
};

/**
 * Close database connection pool gracefully
 *
 * Should be called during application shutdown to clean up resources.
 * Handles errors during pool closure.
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log("\x1b[33m[DB]\x1b[0m 🔒 PostgreSQL connection pool closed gracefully.");
  } catch (err) {
    console.error("\x1b[31m[DB]\x1b[0m ⚠️ Error closing PostgreSQL pool:", err);
  }
};