// scripts/seed-admin.ts — creates the first root administrator account.
// Run once against a fresh database: npm run seed:admin
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — check your .env file.");

  const name = process.env.SEED_ADMIN_NAME || "SNS Admin";
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env before running this script."
    );
  }

  await mongoose.connect(uri);

  const cleanEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    console.log(`Admin already exists for ${cleanEmail} — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  // Safe check: does ANY admin exist?
  const anyAdmin = await User.findOne({ role: "admin" });
  if (anyAdmin) {
    console.log(
      `⚠️ WARNING: An admin account already exists (${anyAdmin.email}). Creating an additional admin account...`
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email: cleanEmail,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log(`✅ Root admin created: ${cleanEmail}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
