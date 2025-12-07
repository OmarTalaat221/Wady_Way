"use client";
import React, { useMemo } from "react";
import Link from "next/link";

function safeParseJSON(input, fallback) {
  try {
    if (!input) return fallback;
    if (typeof input === "object") return input;
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

// handles: "{...},{...}"  -> returns array
function parseMaybeMultiJsonObjects(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();
  if (!s) return null;

  if (s.startsWith("{") && s.endsWith("}")) {
    if (s.includes("},{")) {
      try {
        return JSON.parse(`[${s}]`);
      } catch {
        return null;
      }
    }
    return safeParseJSON(s, null);
  }

  if (s.startsWith("[") && s.endsWith("]")) return safeParseJSON(s, null);
  return null;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function starsFromScore(score, maxScore) {
  const s = Number(score);
  const m = Number(maxScore);
  if (!Number.isFinite(s) || !Number.isFinite(m) || m <= 0) return 5;
  return clamp(Math.round((s / m) * 5), 1, 5);
}

function renderStars(stars = 5) {
  const n = clamp(Number(stars) || 0, 0, 5);
  return Array.from({ length: 5 }).map((_, i) => (
    <li key={i}>
      <i className={`bi ${i < n ? "bi-star-fill" : "bi-star"}`} />
    </li>
  ));
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

export default function TransportCard({ transport }) {
  console.log(transport);

  const href = `/transport/transport-details?id=${transport?.id}"`;

  const title = transport?.title || "";
  const subtitle = transport?.subtitle || "";
  const duration = transport?.duration || ""; // "1 DAY"
  const location = transport?.location || "";
  const type = transport?.car_type || transport?.transportTypeLabel || ""; // Sedan/Compact...
  const image =
    (transport?.image || "").trim() || "/assets/img/placeholder.jpg";

  // rating from "ratings" (string) OR "rating" (object)
  const ratingObj = useMemo(() => {
    if (transport?.rating && typeof transport.rating === "object")
      return transport.rating;

    const parsed = parseMaybeMultiJsonObjects(transport?.ratings);
    // لو array خد أول واحدة (أو غيرها حسب preference)
    if (Array.isArray(parsed) && parsed.length) return parsed[0];
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  }, [transport?.ratings, transport?.rating]);

  const stars = ratingObj
    ? starsFromScore(ratingObj.score, ratingObj.maxScore)
    : 5;

  const features = useMemo(
    () => splitFeatures(transport?.features).slice(0, 3),
    [transport?.features]
  );

  const priceNow = transport?.price?.now;

  const priceWas = transport?.price?.was;
  console.log(priceNow, priceWas);

  const priceNote =
    transport?.price?.note || transport?.price_note || "PER DAY";
  const ctaText = "Book Now";
  const ctaHref = href;

  return (
    <div className="package-card">
      {/* Image wrap (TourCard style) */}
      <div className="package-card-img-wrap">
        <Link href={href} className="card-img block overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="block w-full h-[260px] object-cover"
          />
        </Link>

        {/* Batch (duration + location/type) */}
        <div className="batch">
          {!!duration && <span className="date">{duration}</span>}

          <div className="location">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 18 18"
            >
              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
            </svg>

            <ul className="location-list">
              {!!type && (
                <li>
                  <Link href={href}>{type}</Link>
                </li>
              )}
              {!!location && (
                <li>
                  <Link href={href}>{location}</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="package-card-content">
        <div className="card-content-top">
          <h5>
            <Link href={href}>{title}</Link>
          </h5>

          {(subtitle || features.length) && (
            <div className="location-area">
              <ul className="location-list scrollTextAni">
                {!!subtitle && (
                  <li>
                    <Link href={href}>{subtitle}</Link>
                  </li>
                )}
                {features.map((f) => (
                  <li key={f}>
                    <Link href={href}>{f}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <ul className="m-0 flex list-none gap-1 p-0">
              {renderStars(stars)}
            </ul>
            {ratingObj ? (
              <span className="text-xs text-muted">
                ({ratingObj.platform}: {ratingObj.score}/{ratingObj.maxScore})
              </span>
            ) : (
              <span className="text-xs text-muted">(No reviews)</span>
            )}
          </div>
        </div>

        <div className="card-content-bottom">
          {/* Price */}
          <div className="price-area">
            <h6>Starting From:</h6>
            <span>
              {priceNow} {!!priceWas && <del>{priceWas}</del>}
            </span>
            <p>{priceNote}</p>
          </div>

          {/* CTA */}
          <Link href={ctaHref} className="primary-btn2">
            {ctaText}
            <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
