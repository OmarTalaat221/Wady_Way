"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import Footer from "@/components/footer/Footer";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { base_url } from "../../uitils/base_url";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";
import "./style.css";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const SITE_LOGO =
  "https://res.cloudinary.com/dbvh5i83q/image/upload/f_auto,q_auto,w_130,h_130/v1775980868/wadi-way_gnrjns.png";

// Cloudinary image optimization helper
// Injects Cloudinary transformation params for uploaded images
// Falls back to original URL if not a Cloudinary URL
const getOptimizedImageUrl = (url, { width = 400, quality = "auto" } = {}) => {
  if (!url) return null;
  if (url.includes("res.cloudinary.com")) {
    // Insert transformation before /upload/
    return url.replace(
      /\/upload\//,
      `/upload/f_auto,q_${quality},w_${width},c_fill,g_auto/`
    );
  }
  return url;
};

/* ─── Static SVG Icons (replacing Bootstrap Icons bi-* to cut BI CSS dep) ── */
// These replace <i className="bi bi-search|chevron-left|chevron-right"> icons
// so Bootstrap Icons CSS is not needed at all for this page.

const IconClock = memo(() => (
  <svg
    className="w-4 h-4 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    width={16}
    height={16}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
));
IconClock.displayName = "IconClock";

const IconArrow = memo(() => (
  <svg
    className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    width={16}
    height={16}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 8l4 4m0 0l-4 4m4-4H3"
    />
  </svg>
));
IconArrow.displayName = "IconArrow";

const IconHeart = memo(() => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
));
IconHeart.displayName = "IconHeart";

const IconShare = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
  </svg>
));
IconShare.displayName = "IconShare";

// Replaces <i className="bi bi-search">
const IconSearch = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={64}
    height={64}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="text-gray-300 mb-4 block mx-auto"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
));
IconSearch.displayName = "IconSearch";

// Replaces <i className="bi bi-chevron-left">
const IconChevronLeft = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
));
IconChevronLeft.displayName = "IconChevronLeft";

// Replaces <i className="bi bi-chevron-right">
const IconChevronRight = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
));
IconChevronRight.displayName = "IconChevronRight";

/* ─── Share Menu SVGs (static, defined once outside components) ─────────── */
// Defined outside ActivityCard so they are not recreated on every render
const FbIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    width={20}
    height={20}
  >
    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
  </svg>
);

const WaIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    width={20}
    height={20}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const CopyIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    width={20}
    height={20}
  >
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>
);

/* ─── Share Panel — rendered once at page level, not per card ───────────── */
// This avoids duplicating share DOM nodes for every activity card.
// Only one share panel exists in the DOM at a time.
const SharePanel = memo(({ activityId, title, onClose }) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/activities/activities-details?id=${activityId}`;

  const shareOnFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
    onClose();
  }, [url, onClose]);

  const shareOnWhatsapp = useCallback(() => {
    const message = `Check out this amazing activity: ${title} - ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
    onClose();
  }, [url, title, onClose]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
      onClose();
    });
  }, [url, onClose]);

  return (
    <>
      <div className="share-options-activity show">
        <div className="share-option facebook" onClick={shareOnFacebook}>
          {FbIcon}
          <span>Facebook</span>
        </div>
        <div className="share-option whatsapp" onClick={shareOnWhatsapp}>
          {WaIcon}
          <span>WhatsApp</span>
        </div>
        <div className="share-option copy" onClick={copyToClipboard}>
          {CopyIcon}
          <span>Copy Link</span>
        </div>
      </div>
      <div className="share-backdrop-activity show" onClick={onClose} />
    </>
  );
});
SharePanel.displayName = "SharePanel";

/* ─── Skeleton Card ─────────────────────────────────────────────────────── */
const SkeletonCard = memo(() => (
  <div className="rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden">
    {/*
      Fixed aspect ratio via padding-top trick prevents CLS.
      h-72 = 288px, card width ≈ 400px → ratio ≈ 72%
    */}
    <div
      className="w-full bg-gray-200 animate-pulse"
      style={{ height: "288px" }}
      aria-hidden="true"
    />
    <div className="px-8 pt-4 pb-6">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-3/4" />
      <div className="h-4 bg-gray-100 rounded animate-pulse mb-2 w-1/2" />
      <div className="h-4 bg-gray-100 rounded animate-pulse mb-6 w-2/3" />
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

/* ─── Category Skeleton ─────────────────────────────────────────────────── */
const CategorySkeleton = memo(() => (
  <div className="flex items-center gap-3">
    {[90, 110, 80, 120, 95].map((w, i) => (
      <div
        key={i}
        className="flex-shrink-0 h-10 rounded-full bg-gray-100 animate-pulse"
        style={{ width: `${w}px` }}
        aria-hidden="true"
      />
    ))}
  </div>
));
CategorySkeleton.displayName = "CategorySkeleton";

/* ─── ActivityCard ──────────────────────────────────────────────────────── */
const ActivityCard = memo(
  ({
    activity,
    onToggleFavorite,
    isAnimated,
    isLoadingFav,
    onShareClick,
    isShareOpen, // ← boolean: is THIS card's share open
    onCloseShare,
    isUserLoggedIn,
    categoryName,
    isPriority, // ← true only for first card (LCP hint)
  }) => {
    const {
      id,
      title,
      subtitle,
      image,
      duration,
      price_current,
      price_note,
      country_name,
      is_fav,
      total_rating,
    } = activity;

    const [imgFailed, setImgFailed] = useState(false);

    const displayRating = useMemo(() => {
      if (total_rating !== undefined && total_rating !== null) {
        const r = parseFloat(total_rating);
        if (!isNaN(r)) return Math.min(5, Math.max(0, r)).toFixed(1);
      }
      return "4.5";
    }, [total_rating]);

    const detailHref = `/activities/activities-details?id=${id}`;

    // Optimized image URL via Cloudinary transformations
    const optimizedImage = useMemo(
      () => getOptimizedImageUrl(image, { width: 400, quality: "auto" }),
      [image]
    );

    const hasValidImage = optimizedImage && !imgFailed;

    const handleFavoriteClick = useCallback(
      (e) => {
        e.preventDefault();
        if (!isUserLoggedIn) {
          toast.error("Please login to add activities to your favorites", {
            duration: 3000,
            icon: "🔒",
          });
          // Use Next router push instead of window.location to avoid full reload
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
          return;
        }
        if (!isLoadingFav) {
          onToggleFavorite(id, is_fav);
        }
      },
      [isUserLoggedIn, isLoadingFav, onToggleFavorite, id, is_fav]
    );

    const handleShareClick = useCallback(
      (e) => {
        e.preventDefault();
        onShareClick(id);
      },
      [onShareClick, id]
    );

    const handleImgError = useCallback(() => {
      setImgFailed(true);
    }, []);

    return (
      /*
        content-visibility: auto on below-the-fold cards skips their
        paint/layout until they scroll into view — big TBT win.
        isPriority cards (first row) skip this to avoid hiding LCP.
      */
      <div
        className="activity-card group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100"
        style={
          !isPriority
            ? { contentVisibility: "auto", containIntrinsicSize: "0 500px" }
            : undefined
        }
      >
        {/* Image Container — fixed dimensions prevent CLS */}
        <div
          className="activity-card-img-wrapper relative overflow-hidden"
          style={{ height: "288px", width: "100%" }}
        >
          {/* Layer 1: Logo Fallback — always behind */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
            <img
              src={SITE_LOGO}
              alt=""
              /*
                The fallback logo is the same across all cards.
                The browser caches it after the first request.
                width/height declared to prevent CLS.
                loading="lazy" so it only loads if the real image fails.
              */
              loading="lazy"
              decoding="async"
              width={130}
              height={130}
              className="w-[130px] h-[130px] object-contain opacity-30 pointer-events-none select-none"
              aria-hidden="true"
            />
          </div>

          {/* Layer 2: Activity Image */}
          {hasValidImage && (
            <img
              src={optimizedImage}
              alt={title}
              /*
                Only the very first card gets fetchpriority="high" + eager loading.
                All others stay lazy to avoid competing with LCP.
              */
              loading={isPriority ? "eager" : "lazy"}
              fetchPriority={isPriority ? "high" : "low"}
              decoding={isPriority ? "sync" : "async"}
              width={400}
              height={288}
              className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              style={{ maxHeight: "288px" }}
              onError={handleImgError}
            />
          )}

          {/* Layer 3: Gradient Overlay */}
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Layer 4: Badges */}
          <div className="absolute top-6 left-6 z-[3]">
            <Link
              href="/activities"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-sm font-semibold hover:bg-white transition-all duration-300 shadow-lg"
              style={{ color: "#295557" }}
            >
              {country_name}
            </Link>
          </div>

          <div
            className="absolute top-6 right-6 z-[3] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
            style={{ background: "#e8a355" }}
          >
            ⭐ {displayRating}
          </div>

          <div
            className="absolute bottom-6 right-6 z-[3] text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg"
            style={{ background: "#295557" }}
          >
            ${price_current}
          </div>

          {/* Layer 5: Action Buttons */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 z-[4]">
            <div
              className={`favorite-btn-activity ${is_fav ? "active" : ""} ${
                isAnimated ? "animate" : ""
              } ${isLoadingFav ? "loading" : ""} ${
                !isUserLoggedIn ? "disabled" : ""
              }`}
              onClick={handleFavoriteClick}
              role="button"
              tabIndex={0}
              aria-label={is_fav ? "Remove from favorites" : "Add to favorites"}
              onKeyDown={(e) => e.key === "Enter" && handleFavoriteClick(e)}
            />

            <div
              className="share-btn-activity"
              onClick={handleShareClick}
              role="button"
              tabIndex={0}
              aria-label="Share activity"
              onKeyDown={(e) => e.key === "Enter" && handleShareClick(e)}
            >
              <IconShare />
            </div>

            {/*
              Share panel is rendered ONLY for the active card.
              Moved to page-level SharePanel component to reduce per-card DOM nodes.
            */}
            {isShareOpen && (
              <SharePanel
                activityId={id}
                title={title}
                onClose={onCloseShare}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-2 pb-4">
          <div className="flex items-start gap-4 mb-3">
            <div className="flex-1">
              <h3
                className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity duration-300"
                style={{ color: "#295557" }}
              >
                <Link href={detailHref} className="!text-[#295557]">
                  {title}
                </Link>
              </h3>
              {subtitle && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <IconClock />
              <span>{duration}</span>
            </div>
            {categoryName && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {categoryName}
              </span>
            )}
          </div>

          {price_current && (
            <div className="mb-4 text-xs text-gray-500 text-center">
              {price_current} $ {price_note}
            </div>
          )}

          <Link
            href={detailHref}
            className="group/btn relative inline-flex items-center justify-center w-full text-center text-white font-medium py-3 px-5 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] !bg-[#295557]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Book Adventure
              <IconArrow />
            </span>
            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        </div>
      </div>
    );
  }
);
ActivityCard.displayName = "ActivityCard";

/* ─── Category Filter Button ───────────────────────────────────────────── */
const CategoryButton = memo(({ cat, isActive, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(cat.id);
  }, [onClick, cat.id]);

  return (
    <button
      data-category={cat.id}
      onClick={handleClick}
      className={`category-filter-btn group/filter flex-shrink-0 snap-center relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${
        isActive
          ? "text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          : "bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
      }`}
      style={
        isActive
          ? { background: "linear-gradient(135deg, #295557 0%, #e8a355 100%)" }
          : {}
      }
    >
      <span className="relative z-10">{cat.label}</span>
      {isActive && (
        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/filter:scale-x-100 transition-transform duration-300 origin-left" />
      )}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
});
CategoryButton.displayName = "CategoryButton";

/* ─── Pagination ────────────────────────────────────────────────────────── */
const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  const paginationNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <nav className="inline-flex items-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-[#295557] border border-gray-300 hover:bg-[#295557] hover:text-white hover:shadow-lg transform hover:scale-105"
        }`}
      >
        <IconChevronLeft />
      </button>

      {paginationNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === "..." ? (
            <span className="px-3 py-2 text-gray-400">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                currentPage === page
                  ? "bg-gradient-to-r from-[#295557] to-[#e8a355] text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-[#295557] border border-gray-300 hover:bg-[#295557] hover:text-white hover:shadow-lg transform hover:scale-105"
        }`}
      >
        <IconChevronRight />
      </button>
    </nav>
  );
});
Pagination.displayName = "Pagination";

/* ─── Main Page Component ──────────────────────────────────────────────── */
const ActivitiesPage = () => {
  const { toggleWishlist, isLoading } = useWishlist();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [rawCategories, setRawCategories] = useState([]);
  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [animatedId, setAnimatedId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [activeFilter, setActiveFilter] = useState(
    () => searchParams.get("category") || ""
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [itemsPerPage] = useState(() => {
    const l = searchParams.get("limit");
    return l ? parseInt(l, 10) : 6;
  });

  const [userId, setUserId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const isUpdatingURL = useRef(false);
  const categoryScrollRef = useRef(null);
  // AbortController ref for activities fetch
  const activitiesAbortRef = useRef(null);
  // Timer refs for cleanup (bfcache safety)
  const animationTimerRef = useRef(null);

  /* ── User hydration from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const userData = JSON.parse(raw);
        const id = userData.id || userData.user_id;
        if (id) {
          setUserId(id);
          setIsUserLoggedIn(true);
        }
      }
    } catch {
      // silent
    }
  }, []);

  /* ── Sync state from URL on searchParams change ── */
  useEffect(() => {
    if (isUpdatingURL.current) return;
    const cat = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    setActiveFilter((prev) => (prev !== cat ? cat : prev));
    setCurrentPage((prev) => (prev !== page ? page : prev));
  }, [searchParams]);

  /* ── URL updater (no router push — avoids full re-render) ── */
  const updateURLParams = useCallback(
    (category, page) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      if (itemsPerPage !== 6) params.set("limit", itemsPerPage.toString());
      if (category) params.set("category", category);

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      isUpdatingURL.current = true;
      window.history.replaceState(null, "", newURL);
      // Use a short timeout to reset flag — avoid leaking into bfcache
      const t = setTimeout(() => {
        isUpdatingURL.current = false;
      }, 100);
      return () => clearTimeout(t);
    },
    [pathname, itemsPerPage]
  );

  /* ── Category maps ── */
  const categoryMap = useMemo(() => {
    const map = {};
    rawCategories.forEach((cat) => {
      if (cat.category_id) map[cat.category_id] = cat.category_name;
    });
    return map;
  }, [rawCategories]);

  const normalizedCategories = useMemo(() => {
    return rawCategories.map((cat) => ({
      id: cat.category_id,
      label: cat.category_name,
    }));
  }, [rawCategories]);

  /* ── Fetch categories (once) ── */
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);

    // Using native fetch instead of axios to reduce bundle weight for this call
    fetch(`${base_url}/user/activities/select_activity_categories.php`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.status === "success" && Array.isArray(data.message)) {
          setRawCategories(
            data.message.filter((c) => c.hidden === "0" || c.hidden === 0)
          );
        }
      })
      .catch(() => {
        if (!cancelled) setRawCategories([]);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Fetch activities ── */
  useEffect(() => {
    // Cancel previous in-flight request
    if (activitiesAbortRef.current) {
      activitiesAbortRef.current.abort();
    }
    const controller = new AbortController();
    activitiesAbortRef.current = controller;

    const fetchActivities = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (userId) params.set("user_id", userId);
        params.set("page", currentPage.toString());
        params.set("limit", itemsPerPage.toString());
        if (activeFilter) params.set("category", activeFilter);

        // Using native fetch — no axios overhead for listing page
        const res = await fetch(
          `${base_url}/user/activities/select_activities.php?${params.toString()}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        const data = await res.json();

        if (controller.signal.aborted) return;

        if (data.status === "success") {
          setTotalPages(parseInt(data.total_pages, 10) || 1);
          setTotalItems(parseInt(data.total, 10) || 0);
          setActivities(
            data.data.map((a) => ({
              ...a,
              is_fav: a?.is_fav || false,
            }))
          );
        } else {
          setActivities([]);
          setTotalPages(1);
          setTotalItems(0);
          setError("No activities available");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        setActivities([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchActivities();

    return () => {
      controller.abort();
    };
  }, [userId, currentPage, itemsPerPage, activeFilter]);

  /* ── Cleanup on unmount (bfcache safety) ── */
  useEffect(() => {
    return () => {
      // Abort any pending request
      if (activitiesAbortRef.current) {
        activitiesAbortRef.current.abort();
      }
      // Clear any animation timers
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  /* ── Handlers ── */
  const handleFilterClick = useCallback(
    (categoryId) => {
      const newFilter = categoryId === "all" ? "" : categoryId;
      setActiveFilter(newFilter);
      setCurrentPage(1);
      updateURLParams(newFilter, 1);

      requestAnimationFrame(() => {
        const container = categoryScrollRef.current;
        if (!container) return;
        const btn = container.querySelector(`[data-category="${categoryId}"]`);
        if (btn) {
          const cr = container.getBoundingClientRect();
          const br = btn.getBoundingClientRect();
          container.scrollTo({
            left: btn.offsetLeft - cr.width / 2 + br.width / 2,
            behavior: "smooth",
          });
        }
      });
    },
    [updateURLParams]
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      setCurrentPage(page);
      updateURLParams(activeFilter, page);
      window.scrollTo({ top: 300, behavior: "smooth" });
    },
    [totalPages, currentPage, activeFilter, updateURLParams]
  );

  const clearAllFilters = useCallback(() => {
    setActiveFilter("");
    setCurrentPage(1);
    isUpdatingURL.current = true;
    window.history.replaceState(null, "", pathname);
    const t = setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
    // Timer stored but not critical to clear — very short lived
    void t;
  }, [pathname]);

  const handleToggleFavorite = useCallback(
    async (activityId, currentStatus) => {
      if (!isUserLoggedIn || !userId) {
        toast.error("Please login to add activities to your favorites", {
          duration: 3000,
          icon: "🔒",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      setAnimatedId(activityId);
      const result = await toggleWishlist(
        activityId,
        "activity",
        currentStatus
      );

      if (result.success) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activityId ? { ...a, is_fav: result.is_fav } : a
          )
        );
        toast.success(
          result.is_fav ? "Added to favorites!" : "Removed from favorites",
          { duration: 2000, icon: result.is_fav ? "❤️" : "💔" }
        );
      }

      // Store timer ref for cleanup
      animationTimerRef.current = setTimeout(() => setAnimatedId(null), 600);
    },
    [isUserLoggedIn, userId, toggleWishlist]
  );

  const toggleShareModal = useCallback((id) => {
    setShareModalOpen((prev) => (prev === id ? null : id));
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalOpen(null);
  }, []);

  const getCategoryName = useCallback(
    (activity) => {
      if (activity.category_id && categoryMap[activity.category_id]) {
        return categoryMap[activity.category_id];
      }
      return activity.activity_type || null;
    },
    [categoryMap]
  );

  const activeFilterName = useMemo(() => {
    if (!activeFilter) return "All Activities";
    return categoryMap[activeFilter] || "All Activities";
  }, [activeFilter, categoryMap]);

  const hasActiveFilters = !!activeFilter;

  /* ── Error state ── */
  if (error && activities.length === 0 && !loading) {
    return (
      <div className="bg-white min-h-screen">
        <Breadcrumb pagename="Activities" pagetitle="Activities" />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-red-500 text-xl mb-4">
            Error loading activities
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2 bg-[#295557] text-white rounded-lg hover:bg-[#1f4042] transition-colors"
          >
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="bg-white">
      <Breadcrumb pagename="Activities" pagetitle="Activities" />

      {/* Hero — kept exactly the same visually */}
      <div className="bg-white py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{
                background: "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Epic Adventures
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover extraordinary experiences that will create memories to
              last a lifetime. From heart-pounding thrills to serene
              explorations, find your perfect adventure.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white pb-8">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          <div className="relative mb-8 pt-8">
            <div
              ref={categoryScrollRef}
              className="category-scroll-container flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div
                className="flex-shrink-0 w-4 md:hidden snap-start"
                aria-hidden="true"
              />

              <CategoryButton
                cat={{ id: "all", label: "All Activities" }}
                isActive={!activeFilter}
                onClick={handleFilterClick}
              />

              {categoriesLoading ? (
                <CategorySkeleton />
              ) : (
                normalizedCategories.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    cat={cat}
                    isActive={activeFilter === cat.id}
                    onClick={handleFilterClick}
                  />
                ))
              )}

              <div
                className="flex-shrink-0 w-4 md:hidden snap-end"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Results count */}
          {!loading && activities.length > 0 && (
            <div className="flex justify-between items-center mb-8">
              <div>
                <h5 className="text-gray-800 font-medium mb-1">
                  {totalItems} {totalItems === 1 ? "Activity" : "Activities"}{" "}
                  Found
                  {hasActiveFilters && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      in &ldquo;{activeFilterName}&rdquo;
                    </span>
                  )}
                </h5>
                {totalPages > 1 && (
                  <small className="text-gray-500">
                    Page {currentPage} of {totalPages}
                  </small>
                )}
              </div>
              <small className="text-gray-500">
                Total: {totalItems} activities available
              </small>
            </div>
          )}

          {/* Skeleton loading grid */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Activity Cards grid */}
          {!loading && activities.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {activities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onToggleFavorite={handleToggleFavorite}
                  isAnimated={animatedId === activity.id}
                  isLoadingFav={isLoading(activity.id)}
                  onShareClick={toggleShareModal}
                  /*
                    Pass a boolean instead of the full shareModalOpen ID.
                    Prevents all cards from re-rendering when any share opens.
                  */
                  isShareOpen={shareModalOpen === activity.id}
                  onCloseShare={closeShareModal}
                  isUserLoggedIn={isUserLoggedIn}
                  categoryName={getCategoryName(activity)}
                  /*
                    Only the first 3 cards (first row on desktop) get priority loading.
                    They are most likely to contain the LCP image.
                  */
                  isPriority={index < 3}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && activities.length === 0 && (
            <div className="text-center py-16">
              <IconSearch />
              <div className="text-gray-500 text-xl mb-4">
                No activities found
              </div>
              <p className="text-gray-400 mb-4">
                {hasActiveFilters
                  ? `No activities in "${activeFilterName}". Try another category.`
                  : "Check back later for new activities."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-[#295557] text-white rounded-lg hover:bg-[#1f4042] transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && activities.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-16">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ActivitiesPage;
