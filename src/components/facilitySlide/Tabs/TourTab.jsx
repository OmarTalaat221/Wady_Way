import React, { useMemo } from "react";
import { TourCard } from "../Cards/TourCard";

const safeSplit = (s) =>
  String(s || "")
    .split("-")
    .map((x) => x.trim())
    .filter(Boolean);

const formatMoney = (currency, amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "";
  return `${currency || ""}${n.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

export default function TourTab({ items = [] }) {
  const normalized = useMemo(() => {
    return items.map((item) => {
      const currency = item?.price_currency || "$";
      const cities = safeSplit(item?.route).map((label) => ({
        label,
        href: "/package",
      }));

      return {
        id: item?.id,
        image: (item?.image || item?.background_image || "").trim(),
        duration: item?.duration || "",
        badgeLocations: [
          { label: item?.country_name || "Country", href: "/package" },
          {
            label: item?.category
              ? String(item.category).replaceAll("_", " ")
              : "Tour",
            href: "/package",
          },
        ],
        title: item?.title || "",
        cities,
        price: formatMoney(currency, item?.price_current),
        cta_button_text: item?.cta_button_text || "Book A Trip",
        oldPrice: item?.price_original
          ? formatMoney(currency, item?.price_original)
          : null,
        detailsHref: `/package/package-details/${item?.id}`,
        is_fav: item?.is_fav || false,
      };
    });
  }, [items]);

  if (!normalized.length) return null; // أو حط Skeleton/Empty state لو عندك

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {normalized.map((item) => (
        <TourCard key={item.id} item={item} />
      ))}
    </div>
  );
}
