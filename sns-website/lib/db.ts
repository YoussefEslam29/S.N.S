/** MongoDB connection singleton — caches connection across hot reloads in development. */
import { Resolver } from "node:dns";
import mongoose from "mongoose";

// Prevent "Cannot overwrite model" error during Next.js hot reload
let cached = (global as typeof globalThis & { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose;

if (!cached) {
  cached = (global as typeof globalThis & { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose = {
    conn: null,
    promise: null,
  };
}

function resolveSrvPromise(hostname: string): Promise<any[]> {
  const resolver = new Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4"]);
  return new Promise((resolve, reject) => {
    resolver.resolveSrv(hostname, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses);
    });
  });
}

function resolveTxtPromise(hostname: string): Promise<string[][]> {
  const resolver = new Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4"]);
  return new Promise((resolve, reject) => {
    resolver.resolveTxt(hostname, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });
}

/** Resolves mongodb+srv:// connection string to a standard mongodb:// URI to bypass local ISP DNS resolution blocks. */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  const match = uri.match(/^mongodb\+srv:\/\/([^/]+)(.*)$/);
  if (!match) {
    throw new Error("Invalid MongoDB SRV URI format");
  }

  const credentialsAndHost = match[1];
  const rest = match[2] || "/";

  let credentials = "";
  let host = credentialsAndHost;

  const atIndex = credentialsAndHost.indexOf("@");
  if (atIndex !== -1) {
    credentials = credentialsAndHost.substring(0, atIndex + 1);
    host = credentialsAndHost.substring(atIndex + 1);
  }

  const questionIndex = rest.indexOf("?");
  let path = "/";
  let queryParams = "";
  if (questionIndex !== -1) {
    path = rest.substring(0, questionIndex);
    queryParams = rest.substring(questionIndex + 1);
  } else {
    path = rest;
  }

  const [srvAddresses, txtRecords] = await Promise.all([
    resolveSrvPromise(`_mongodb._tcp.${host}`),
    resolveTxtPromise(host).catch(() => [] as string[][]),
  ]);

  if (!srvAddresses || srvAddresses.length === 0) {
    throw new Error("No SRV records found for " + host);
  }

  const hostsList = srvAddresses
    .map((addr) => `${addr.name}:${addr.port}`)
    .join(",");

  const txtOptionsList: string[] = [];
  if (txtRecords && txtRecords.length > 0) {
    for (const record of txtRecords) {
      if (Array.isArray(record)) {
        txtOptionsList.push(...record);
      }
    }
  }

  const optionsMap = new Map<string, string>();
  
  txtOptionsList.forEach((opt) => {
    const parts = opt.split("=");
    if (parts.length === 2) optionsMap.set(parts[0], parts[1]);
  });

  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    params.forEach((val, key) => {
      optionsMap.set(key, val);
    });
  }

  optionsMap.set("ssl", "true");

  const finalQuery = Array.from(optionsMap.entries())
    .map(([key, val]) => `${key}=${val}`)
    .join("&");

  return `mongodb://${credentials}${hostsList}${path}?${finalQuery}`;
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
    cached!.promise = (async () => {
      try {
        const resolvedUri = await resolveMongoUri(MONGODB_URI);
        return await mongoose.connect(resolvedUri, {
          bufferCommands: false,
        });
      } catch (error) {
        cached!.promise = null; // Clear cached promise on failure
        throw error;
      }
    })();
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null; // Clear cached promise on failure
    throw error;
  }
  
  return cached!.conn;
}
