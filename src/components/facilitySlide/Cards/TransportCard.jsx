"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
// import { addToast } from "@/store/notificationSlice";
import { useWishlist } from "@/hooks/useWishlist";

function safeParseJSON(input, fallback) {
  try {
    if (!input) return fallback;
    if (typeof input === "object") return input;
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}

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
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [animatedId, setAnimatedId] = useState(null);

  const href = `/transport/transport-details?id=${transport?.id}`;

  const title = transport?.title || "";
  const subtitle = transport?.subtitle || "";
  const duration = transport?.duration || "";
  const location = transport?.location || "";
  const type = transport?.car_type || transport?.transportTypeLabel || "";
  const image =
    (transport?.image || "").trim() || "/assets/img/placeholder.jpg";

  // rating
  const ratingObj = useMemo(() => {
    if (transport?.rating && typeof transport.rating === "object")
      return transport.rating;

    const parsed = parseMaybeMultiJsonObjects(transport?.ratings);
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
  const priceNote =
    transport?.price?.note || transport?.price_note || "PER DAY";
  const ctaText = "Book Now";

  // Favorite & Share handlers
  const handleToggleFavorite = async () => {
    setAnimatedId(transport?.id);
    const result = await toggleWishlist(
      transport?.id,
      "transport",
      transport.is_fav || false
    );
    if (result.success) {
      transport.is_fav = result.is_fav;
    }
    setTimeout(() => setAnimatedId(null), 600);
  };

  const toggleShareModal = () => {
    setShareModalOpen(!shareModalOpen);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
  };

  const shareOnFacebook = () => {
    const url = `${window.location.origin}${href}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
    closeShareModal();
  };

  const shareOnWhatsapp = () => {
    const url = `${window.location.origin}${href}`;
    const message = `Check out this transport: ${title} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    closeShareModal();
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}${href}`;
    navigator.clipboard.writeText(url).then(() => {
      // dispatch(
      //   addToast({
      //     type: "success",
      //     title: "Link Copied!",
      //     message: "Transport link has been copied to clipboard",
      //   })
      // );
      closeShareModal();
    });
  };

  return (
    <div className="!overflow-hidden package-card">
      {/* Image wrap */}
      <div className="package-card-img-wrap">
        <Link href={href} className="card-img block overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="block w-full h-[260px] object-cover"
          />
        </Link>

        {/* Favorite Button - Top Right */}
        <div
          className={`favorite-btn ${transport.is_fav ? "active" : ""} ${
            animatedId === transport?.id ? "animate" : ""
          } ${isLoading(transport?.id) ? "loading" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            if (!isLoading(transport?.id)) {
              handleToggleFavorite();
            }
          }}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Share Button - Bottom Left */}
        <div
          className="share-btn"
          onClick={(e) => {
            e.preventDefault();
            toggleShareModal();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
          </svg>
        </div>

        {/* Share Options Modal */}
        <div className={`share-options ${shareModalOpen ? "show" : ""}`}>
          <div className="share-option facebook" onClick={shareOnFacebook}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
            </svg>
            <span>Facebook</span>
          </div>
          <div className="share-option whatsapp" onClick={shareOnWhatsapp}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>WhatsApp</span>
          </div>
          <div className="share-option copy" onClick={copyToClipboard}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            <span>Copy Link</span>
          </div>
        </div>

        {/* Backdrop */}
        {shareModalOpen && (
          <div className="share-backdrop show" onClick={closeShareModal}></div>
        )}

        {/* Batch */}
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

          {(subtitle || features.length > 0) && (
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
          <Link href={href} className="primary-btn2">
            {ctaText}
            <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
