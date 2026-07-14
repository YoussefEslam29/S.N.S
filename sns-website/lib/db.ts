/** MongoDB connection singleton — caches connection across hot reloads in development. */
import dns from "node:dns";
// Force Google DNS — local ISP DNS often can't resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";


// Prevent "Cannot overwrite model" error during Next.js hot reload
let cached = (global as typeof globalThis & { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose;

if (!cached) {
  cached = (global as typeof globalThis & { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose = {
    conn: null,
    promise: null,
  };
}

/** Connect to MongoDB — returns cached connection if available. */
export async function connectDB() {
  if (cached!.conn) return cached!.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

