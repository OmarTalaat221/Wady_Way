"use client";
import React, { useMemo } from "react";
import TransportCard from "../Cards/TransportCard";
// import TransportCard from "../cards/TransportCard";

function safeJsonParse(str, fallback = null) {
  try {
    if (!str) return fallback;
    return typeof str === "string" ? JSON.parse(str) : str;
  } catch {
    return fallback;
  }
}

function parseRatings(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  if (typeof raw === "string") {
    const s = raw.trim();
    // لو جاية كـ JSON array بالفعل
    const asArray = safeJsonParse(s, null);
    if (Array.isArray(asArray)) return asArray;

    // لو جاية كـ "obj,obj" => نخليها "[obj,obj]"
    const wrapped = safeJsonParse(`[${s}]`, null);
    return Array.isArray(wrapped) ? wrapped : [];
  }

  return [];
}

function formatMoney(currency, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return `${currency || ""}${n.toFixed(2)}`;
}

function pickBestRating(ratingsArr) {
  // نختار أول منصة أو أعلى normalized score
  // normalized = score/maxScore
  if (!ratingsArr?.length) return null;

  let best = null;
  let bestNorm = -1;

  for (const r of ratingsArr) {
    const score = Number(r?.score);
    const max = Number(r?.maxScore);
    if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) continue;
    const norm = score / max;
    if (norm > bestNorm) {
      bestNorm = norm;
      best = r;
    }
  }

  return best || ratingsArr[0];
}

function splitFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) return features.filter(Boolean);
  if (typeof features === "string") {
    return features
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

function mapItemToTransport(item) {
  const ratingsArr = parseRatings(item?.ratings);
  const bestRating = pickBestRating(ratingsArr);

  return {
    id: item?.id,
    href: item?.cta_button_url || "/transport/transport-details",
    title: item?.title,
    subtitle: item?.subtitle,
    image:
      (item?.image || item?.background_image || "").trim?.() || item?.image,
    distanceOrMeta: item?.duration, // عندك duration "1 DAY"
    location: item?.location,
    transportTypeLabel: item?.car_type || item?.category, // Sedan / car
    features: splitFeatures(item?.features),

    price: {
      now: item?.price_current,
      was: item.price_original,
      note: item?.price_note, // PER DAY
    },

    rating: bestRating
      ? {
          platform: bestRating.platform,
          score: bestRating.score,
          maxScore: bestRating.maxScore,
          logo: bestRating.logo,
        }
      : null,

    is_fav: item?.is_fav || false,

    ctaText: item?.cta_button_text || "View Details",
    colClass: item?.colClass || "col-lg-4 col-md-6",
  };
}

export default function TransportTab({ items = [] }) {
  const mapped = useMemo(() => items.map(mapItemToTransport), [items]);

  return (
    <div className="row g-4">
      {mapped.map((t) => (
        <div key={t.id ?? t.title} className={t.colClass}>
          <TransportCard transport={t} />
        </div>
      ))}
    </div>
  );
}
