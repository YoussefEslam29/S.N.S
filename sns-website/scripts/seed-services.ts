import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import mongoose from "mongoose";
import { Service } from "../models/Service";

const servicesToSeed = [
  {
    name: {
      en: "Premium Wash",
      ar: "غسيل بريميوم",
    },
    description: {
      en: "Full inside-out wash with high-quality foam, chemical wiping, and engine bay cleaning.",
      ar: "غسيل كامل من الداخل والخارج مع رغوة عالية الجودة، ومسح كيميائي، وتنظيف المحرك.",
    },
    category: "wash",
    pricing: {
      sedan: 250,
      suv: 350,
      truck: 450,
    },
    duration: 60,
    isActive: true,
    order: 1,
    installmentsAllowed: false,
    maxInstallments: 1,
  },
  {
    name: {
      en: "Interior Detailing",
      ar: "تفصيل داخلي",
    },
    description: {
      en: "Deep steam cleaning of seats, carpets, dashboard, leather conditioning, and odor removal.",
      ar: "تنظيف عميق بالبخار للمقاعد، السجاد، لوحة القيادة، ترطيب الجلد وإزالة الروائح.",
    },
    category: "detailing",
    pricing: {
      sedan: 1200,
      suv: 1600,
      truck: 2000,
    },
    duration: 180,
    isActive: true,
    order: 2,
    installmentsAllowed: false,
    maxInstallments: 1,
  },
  {
    name: {
      en: "3-Year Ceramic Coating",
      ar: "طلاء سيراميك 3 سنوات",
    },
    description: {
      en: "Ultra-glossy 9H nano ceramic coating for maximum scratch resistance and hydrophobic protection.",
      ar: "طلاء نانو سيراميك 9H فائق اللمعان لأقصى مقاومة للخدش وحماية طاردة للمياه.",
    },
    category: "ceramic-coating",
    pricing: {
      sedan: 6000,
      suv: 8000,
      truck: 10000,
    },
    duration: 360,
    isActive: true,
    order: 3,
    installmentsAllowed: false,
    maxInstallments: 1,
  },
  {
    name: {
      en: "Full PPF Wrap",
      ar: "تغليف PPF كامل",
    },
    description: {
      en: "Premium self-healing paint protection film wrap for ultimate stone chip and scratch protection. Installment plans available.",
      ar: "تغليف كامل بفيلم حماية الطلاء المعالج ذاتياً لحماية قصوى من حصى الطرق والخدوش. تتوفر خطط تقسيط.",
    },
    category: "ppf",
    pricing: {
      sedan: 35000,
      suv: 45000,
      truck: 55000,
    },
    duration: 1440,
    isActive: true,
    order: 4,
    installmentsAllowed: true,
    maxInstallments: 3,
  },
  {
    name: {
      en: "Premium Window Tinting",
      ar: "تظليل نوافذ بريميوم",
    },
    description: {
      en: "High heat rejection nano-ceramic window film for UV protection and privacy.",
      ar: "فيلم نانو سيراميك لتظليل النوافذ مع عزل حراري عالٍ وحماية من الأشعة فوق البنفسجية والخصوصية.",
    },
    category: "tinting",
    pricing: {
      sedan: 1500,
      suv: 2000,
      truck: 2500,
    },
    duration: 120,
    isActive: true,
    order: 5,
    installmentsAllowed: false,
    maxInstallments: 1,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set!");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    console.log("Clearing existing services...");
    await Service.deleteMany({});

    console.log("Seeding services...");
    await Service.insertMany(servicesToSeed);
    console.log("Seeding completed successfully!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

main();
