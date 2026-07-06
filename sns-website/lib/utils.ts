import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with clsx — standard shadcn/ui pattern. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in Egyptian Pounds. */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("en-EG")} EGP`;
}

/** Generate a URL-safe slug from a string. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
