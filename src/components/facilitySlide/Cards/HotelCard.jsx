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

// بعض الحقول عندك بتبقى "{...},{...}" مش Array JSON
function parseMaybeMultiJsonObjects(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();
  if (!s) return null;

  // لو جاي كـ JSON object عادي
  if (s.startsWith("{") && s.endsWith("}")) {
    // لو فيه "},{" يبقى كذا object جنب بعض
    if (s.includes("},{")) {
      try {
        return JSON.parse(`[${s}]`);
      } catch {
        return null;
      }
    }
    return safeParseJSON(s, null);
  }

  // لو جاي Array JSON
  if (s.startsWith("[") && s.endsWith("]")) return safeParseJSON(s, null);

  return null;
}

function splitCampImages(str) {
  if (!str || typeof str !== "string") return [];
  return str
    .split("//CAMP//")
    .map((x) => x.trim())
    .filter(Boolean);
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

function buildDetailsHref(hotel) {
  // لو عندك route مختلفة حسب category
  const cat = String(hotel?.category || "").toLowerCase();
  if (hotel?.href) return hotel.href;

  if (cat === "hotel") return "/hotel/hotel-details";
  if (cat === "car") return "/transport/transport-details";
  if (cat === "activity") return "/activity/acti  vity-details";
  if (cat === "trip_package") return "/package/package-details";
  return "/hotel/hotel-details";
}

export default function HotelCard({ hotel }) {
  const href = `/hotel-suits/hotel-details?hotel=${hotel?.id}`;

  // Images: image ممكن يكون واحد أو //CAMP//
  const images = useMemo(() => {
    const fromImage = splitCampImages(hotel?.image);
    const fromBg = splitCampImages(hotel?.background_image);
    return [...fromImage, ...fromBg].filter(Boolean);
  }, [hotel?.image, hotel?.background_image]);

  const image = images[0] || "/assets/img/placeholder.jpg";

  // Rating: ratings string أو rating object
  const ratingObj = useMemo(() => {
    // مثال: ratings: "{\"platform\":\"Google Reviews\"...}"
    const direct = safeParseJSON(hotel?.ratings, null);
    if (direct) return direct;

    // مثال: amenities: "{...},{...}" (نفس الفكرة ممكن تحصل في ratings في بعض الداتا)
    const multi = parseMaybeMultiJsonObjects(hotel?.ratings);
    if (Array.isArray(multi) && multi.length) return multi[0];

    // fallback لو في future عندك rating جاهز
    if (hotel?.rating && typeof hotel.rating === "object") return hotel.rating;

    return null;
  }, [hotel?.ratings, hotel?.rating]);

  const stars = ratingObj
    ? starsFromScore(ratingObj.score, ratingObj.maxScore)
    : 5;

  const title = hotel?.title || "";
  const duration = hotel?.duration || "";
  const route = hotel?.route || "";
  const subtitle = hotel?.subtitle || "";
  const country = hotel?.country_name || "";
  const category = hotel?.category || "";

  const priceNow =
    hotel?.price_currency && hotel?.price_current
      ? `${hotel.price_currency}${hotel.price_current}`
      : hotel?.price_current;

  const priceWas =
    hotel?.price_currency && hotel?.price_original
      ? `${hotel.price_currency}${hotel.price_original}`
      : hotel?.price_original;

  const priceNote = hotel?.price_note || "";
  const ctaText = "Book Now";

  // شيل الـ \n والمسافات الغريبة
  const location = String(hotel?.location || "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="package-card">
      {/* Image Wrap */}
      <div className="package-card-img-wrap">
        <Link href={href} className="card-img block overflow-hidden rounded-xl">
          {/* توحيد ارتفاع الصور لكل الكروت */}
          <img
            src={image}
            alt={title}
            className="block w-full h-[260px] object-cover"
            loading="lazy"
          />
        </Link>

        {/* Batch (زي TourCard) */}
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
              {!!country && (
                <li>
                  <Link href="/">{country}</Link>
                </li>
              )}
              {!!category && (
                <li>
                  <Link href="/">{category}</Link>
                </li>
              )}
              {!country && !category && !!route && (
                <li>
                  <Link href={href}>{route}</Link>
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

          {(route || location || subtitle) && (
            <div className="location-area">
              <ul className="location-list scrollTextAni">
                {!!route && (
                  <li>
                    <Link href={href}>{route}</Link>
                  </li>
                )}
                {!!location && (
                  <li>
                    <Link href={href}>{location}</Link>
                  </li>
                )}
                {!!subtitle && (
                  <li>
                    <Link href={href}>{subtitle}</Link>
                  </li>
                )}
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
          <div className="price-area">
            <h6>Starting From:</h6>
            <span>
              {priceNow} {!!priceWas && <del>{priceWas}</del>}
            </span>
            <p>{priceNote || "TAXES INCL"}</p>
          </div>

          <Link href={href} className="primary-btn2">
            {ctaText}
            <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
