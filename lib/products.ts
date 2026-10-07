import type { Product, ProductCategory } from "./types";

/**
 * Product catalog for the campus store kiosk.
 * Prices are in Philippine Peso (₱). Names, photos, descriptions and
 * tags follow the ui.html reference design.
 */
export const PRODUCTS: Product[] = [
  {
    id: "coffee",
    name: "Brewed Arabica Coffee",
    price: 45,
    description: "Freshly roasted local Mt. Matutum beans",
    image: "/products/coffee.jpg",
    category: "coffee-drinks",
    badge: { label: "★ Bestseller", className: "bg-amber-100 text-amber-800" },
    meta: { label: "Hot", className: "bg-emerald-50 text-emerald-700" },
  },
  {
    id: "sandwich",
    name: "Artisan Club Sandwich",
    price: 50,
    description: "Smoked ham, egg spread & greens",
    image: "/products/sandwich.jpg",
    category: "bakery",
    badge: { label: "Fresh Today", className: "bg-emerald-50 text-emerald-800" },
    meta: { label: "Snack", className: "text-slate-500" },
  },
  {
    id: "soft-drink",
    name: "Sparkling Soft Drink",
    price: 35,
    description: "Zero sugar lemon-lime fizz",
    image: "/products/soft-drink.jpg",
    category: "cold-drinks",
    badge: { label: "Chilled", className: "bg-blue-50 text-blue-700" },
    meta: { label: "330ml", className: "text-slate-500" },
  },
  {
    id: "cookies",
    // Keep the short name so the add-to-cart toast stays exactly
    // "Cookies added", which the e2e acceptance suite checks for.
    name: "Cookies",
    price: 25,
    description: "Chewy double chocolate cookie",
    image: "/products/cookies.jpg",
    category: "snacks",
    badge: { label: "Freshly Baked", className: "bg-amber-50 text-amber-700" },
    meta: { label: "2 pcs", className: "text-slate-500" },
  },
  {
    id: "water",
    name: "Mineral Bottled Water",
    price: 20,
    description: "Natural mountain spring water",
    image: "/products/water.jpg",
    category: "cold-drinks",
    badge: { label: "Purified", className: "bg-cyan-50 text-cyan-800" },
    meta: { label: "500ml", className: "text-slate-500" },
  },
  {
    id: "chocolate",
    name: "Belgian Dark Chocolate",
    price: 25,
    description: "Rich antioxidant cocoa treat",
    image: "/products/chocolate.jpg",
    category: "snacks",
    badge: { label: "70% Cacao", className: "bg-stone-100 text-stone-800" },
    meta: { label: "45g Bar", className: "text-slate-500" },
  },
];

/** Category filter pills, in display order ("all" first). */
export const CATEGORIES: { id: ProductCategory | "all"; emoji: string; label: string }[] = [
  { id: "all", emoji: "✨", label: "All Items" },
  { id: "coffee-drinks", emoji: "☕", label: "Coffee & Warm Drinks" },
  { id: "bakery", emoji: "🥪", label: "Bakery & Sandwiches" },
  { id: "cold-drinks", emoji: "🥤", label: "Cold Refreshments" },
  { id: "snacks", emoji: "🍪", label: "Cookies & Chocolates" },
];
