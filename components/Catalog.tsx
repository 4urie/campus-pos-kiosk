"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import ProductCard from "./ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import type { Product, ProductCategory } from "@/lib/types";

type CategoryFilter = ProductCategory | "all";

interface CatalogProps {
  getQuantity: (productId: string) => number;
  onAdd: (product: Product) => void;
}

/**
 * Catalog browser: search bar, category filter pills and the
 * scrollable product grid, following the ui.html reference layout.
 */
export default function Catalog({ getQuantity, onAdd }: CatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const navRef = useRef<HTMLElement>(null);
  const [navScroll, setNavScroll] = useState({ canLeft: false, canRight: false });

  // Track whether the category row can scroll so the edge fades and
  // chevron buttons only appear when there is more content to reach.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () =>
      setNavScroll({
        canLeft: el.scrollLeft > 1,
        canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Re-measure once webfonts finish loading; they change pill widths.
    document.fonts?.ready.then(update).catch(() => {});
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollCategories = (direction: -1 | 1) => {
    navRef.current?.scrollBy({ left: direction * 220, behavior: "smooth" });
  };

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const inCategory = category === "all" || product.category === category;
      const matchesQuery =
        query === "" ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return inCategory && matchesQuery;
    });
  }, [search, category]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Search and header banner */}
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
            Choose your items
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-brand-800">
              Touch to Add
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Fast ordering for quick grab-and-go campus snacks & drinks
          </p>
        </div>
        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search snacks, coffee..."
            aria-label="Search products"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Category filter tabs — one horizontal row; long names wrap inside
          a capped pill instead of stretching it, and the row scrolls
          (with edge fades + chevrons) when the screen is too narrow. */}
      <div className="relative flex-none">
        <nav
          ref={navRef}
          aria-label="Product Categories"
          className="no-scrollbar flex items-stretch gap-2 overflow-x-auto pb-2 pt-1"
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                aria-pressed={active}
                className={`touch-ripple inline-flex min-h-12 max-w-40 flex-none items-center gap-2 rounded-xl border px-3 py-2 text-sm leading-tight transition ${
                  active
                    ? "border-brand-700 bg-brand-700 font-semibold text-white shadow-sm ring-2 ring-brand-700/25"
                    : "border-slate-200 bg-white font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {cat.emoji}
                </span>
                <span className="text-balance">{cat.label}</span>
                {cat.id === "all" && (
                  <span
                    className={`flex-none rounded-full px-2 py-0.5 text-xs font-bold leading-none ${
                      active ? "bg-brand-900/40 text-emerald-100" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {PRODUCTS.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Edge fades + scroll chevrons, only while scrolling is possible */}
        {navScroll.canLeft && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-100 to-transparent"
          />
        )}
        {navScroll.canRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-100 to-transparent"
          />
        )}
        {navScroll.canLeft && (
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            aria-label="Scroll categories left"
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {navScroll.canRight && (
          <button
            type="button"
            onClick={() => scrollCategories(1)}
            aria-label="Scroll categories right"
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Scrollable products grid */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-4 pt-1 pr-1">
        {visibleProducts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-12 text-center text-sm font-medium text-slate-500">
            No items match “{search.trim()}”. Try another search or category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getQuantity(product.id)}
                onAdd={onAdd}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
