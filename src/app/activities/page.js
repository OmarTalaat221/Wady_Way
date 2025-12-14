"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { base_url } from "../../uitils/base_url";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/hooks/useWishlist";
import "./style.css";

const ActivityCard = ({
  activity,
  onToggleFavorite,
  isAnimated,
  isLoadingFav,
  onShareClick,
  shareModalOpen,
  onCloseShare,
}) => {
  const dispatch = useDispatch();
  const shareModalRef = useRef(null);

  const {
    id,
    title,
    subtitle,
    image,
    duration,
    price_current,
    price_currency,
    price_note,
    activity_type,
    country_name,
    ratings,
    features,
    is_fav,
  } = activity;

  // Calculate average rating
  const averageRating =
    ratings && ratings.length > 0
      ? (
          ratings.reduce((sum, rating) => sum + rating.score, 0) /
          ratings.length
        ).toFixed(1)
      : "4.5";

  const shareOnFacebook = () => {
    const url = `${window.location.origin}/activities/activities-details?id=${id}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
    onCloseShare();
  };

  const shareOnWhatsapp = () => {
    const url = `${window.location.origin}/activities/activities-details?id=${id}`;
    const message = `Check out this amazing activity: ${title} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    onCloseShare();
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/activities/activities-details?id=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      onCloseShare();
    });
  };

  return (
    <div className="activity-card group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100">
      {/* Image Container */}
      <div className="activity-card-img-wrapper relative overflow-hidden h-72">
        <img
          src={image}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={title}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x300/295557/ffffff?text=Activity+Image";
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Country Badge */}
        <div className="absolute top-6 left-6">
          <Link
            href="/activities"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-sm font-semibold hover:bg-white transition-all duration-300 shadow-lg"
            style={{ color: "#295557" }}
          >
            {country_name}
          </Link>
        </div>

        {/* Rating Badge */}
        <div
          className="absolute top-6 right-6 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          style={{ background: "#e8a355" }}
        >
          ⭐{" "}
          {averageRating >= 5
            ? 5?.toFixed(1)
            : averageRating <= 0
            ? 0?.toFixed(1)
            : averageRating}
        </div>

        {/* Price Badge */}
        <div
          className="absolute bottom-6 right-6 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg"
          style={{ background: "#295557" }}
        >
          {price_currency}
          {price_current}
        </div>

        {/* Bottom Left Action Buttons */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 z-10">
          {/* Favorite Button */}
          <div
            className={`favorite-btn-activity ${is_fav ? "active" : ""} ${
              isAnimated ? "animate" : ""
            } ${isLoadingFav ? "loading" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              if (!isLoadingFav) {
                onToggleFavorite(id, is_fav);
              }
            }}
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Share Button */}
          <div
            className="share-btn-activity"
            onClick={(e) => {
              e.preventDefault();
              onShareClick(id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
          </div>

          {/* Share Options Modal */}
          <div
            ref={shareModalRef}
            className={`share-options-activity ${
              shareModalOpen === id ? "show" : ""
            }`}
          >
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

          {/* Backdrop for closing modal when clicking outside */}
          {shareModalOpen === id && (
            <div
              className="share-backdrop-activity show"
              onClick={onCloseShare}
            ></div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pt-2 pb-4">
        {/* Activity Icon & Title */}
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-1">
            <h3
              className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity duration-300"
              style={{ color: "#295557" }}
            >
              <Link
                href={`/activities/activities-details?id=${id}`}
                className="!text-[#295557]"
              >
                {title}
              </Link>
            </h3>
            {subtitle && (
              <p className="text-gray-600 text-sm mb-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Activity Details */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {activity_type}
            </span>
          </div>
        </div>

        {/* Price Note */}
        {price_current && (
          <div className="mb-4 text-xs text-gray-500 text-center">
            {price_current} {price_currency} {price_note}
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={`/activities/activities-details?id=${id}`}
          className="group/btn relative inline-flex items-center justify-center w-full text-center text-white font-medium py-3 px-5 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] !bg-[#295557]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Book Adventure
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>

          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />

          {/* Subtle glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full animate-pulse" />
        </Link>
      </div>
    </div>
  );
};

const ActivitiesPage = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  // Next.js router hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [animatedId, setAnimatedId] = useState(null);

  // ✅ Flag to prevent URL sync loop
  const isUpdatingURL = useRef(false);

  // ✅ Ref for category scroll container
  const categoryScrollRef = useRef(null);

  // ✅ Available categories (populated from API or static)
  const [availableCategories, setAvailableCategories] = useState([
    "All Activities",
    "Adventure",
    "Water Sports",
    "Mountain",
    "Cultural",
    "Scuba Diving",
  ]);

  // ✅ Initialize from URL params
  const [activeFilter, setActiveFilter] = useState(() => {
    return searchParams.get("category_type") || "";
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam) : 1;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get("limit");
    return limitParam ? parseInt(limitParam) : 6;
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ✅ Function to update URL without page reload
  const updateURLParams = useCallback(
    (options = {}) => {
      const {
        page = currentPage,
        limit = itemsPerPage,
        category_type = activeFilter,
      } = options;

      const params = new URLSearchParams();

      if (page && page !== 1) {
        params.set("page", page.toString());
      }

      if (limit && limit !== 6) {
        params.set("limit", limit.toString());
      }

      // ✅ Category type filter
      if (
        category_type &&
        category_type !== "" &&
        category_type !== "All Activities"
      ) {
        params.set("category_type", category_type);
      }

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      isUpdatingURL.current = true;
      window.history.replaceState(null, "", newURL);

      setTimeout(() => {
        isUpdatingURL.current = false;
      }, 100);
    },
    [pathname, currentPage, itemsPerPage, activeFilter]
  );

  // ✅ Sync state with URL params (for browser back/forward)
  useEffect(() => {
    if (isUpdatingURL.current) return;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const categoryParam = searchParams.get("category_type");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 6;
    const newCategory = categoryParam || "";

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== itemsPerPage) setItemsPerPage(newLimit);
    if (newCategory !== activeFilter) setActiveFilter(newCategory);
  }, [searchParams]);

  // Get user ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id || userData.user_id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // ✅ Fetch activities with filters in API GET params
  const fetchActivities = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("user_id", userId);
      params.set("page", currentPage.toString());
      params.set("limit", itemsPerPage.toString());

      // ✅ Add category_type filter
      if (
        activeFilter &&
        activeFilter !== "" &&
        activeFilter !== "All Activities"
      ) {
        params.set("category_type", activeFilter);
      }

      const apiUrl = `${base_url}/user/activities/select_activities.php?${params.toString()}`;
      console.log("Fetching Activities:", apiUrl);

      const response = await axios.get(apiUrl);

      if (response.data.status === "success") {
        const data = response.data;

        setTotalPages(parseInt(data.total_pages) || 1);
        setTotalItems(parseInt(data.total) || 0);

        const activitiesWithFav = data.data.map((activity) => ({
          ...activity,
          is_fav: activity?.is_fav || false,
        }));

        setActivities(activitiesWithFav);
        setError(null);
      } else {
        setActivities([]);
        setTotalPages(1);
        setTotalItems(0);
        setError("No activities available");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err.message);
      setActivities([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage, itemsPerPage, activeFilter]);

  // ✅ Fetch available categories on mount
  const fetchCategories = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `${base_url}/user/activities/select_activities.php?user_id=${userId}&page=1&limit=1000`
      );

      if (response.data.status === "success") {
        const allActivities = response.data.data;

        // Extract unique activity types/categories
        const categoriesSet = new Set();
        allActivities.forEach((activity) => {
          if (activity.activity_type) {
            categoriesSet.add(activity.activity_type);
          }
          // if (activity.category) {
          //   categoriesSet.add(activity.category);
          // }
        });

        const categories = [
          "All Activities",
          ...Array.from(categoriesSet).sort(),
        ];
        setAvailableCategories(categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, [userId]);

  // Fetch categories on mount
  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId, fetchCategories]);

  // ✅ Fetch activities when filters change
  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId, fetchActivities]);

  // ✅ Handle filter click - NO page reload
  const handleFilterClick = useCallback(
    (filter) => {
      const newFilter = filter === "All Activities" ? "" : filter;
      setActiveFilter(newFilter);
      setCurrentPage(1);
      updateURLParams({
        page: 1,
        category_type: newFilter,
      });

      // ✅ Scroll to the selected category button
      scrollToActiveCategory(filter);
    },
    [updateURLParams]
  );

  // ✅ Scroll to active category in snap scroll container
  const scrollToActiveCategory = (filter) => {
    if (categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const activeButton = container.querySelector(
        `[data-category="${filter}"]`
      );

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        const scrollLeft =
          activeButton.offsetLeft -
          containerRect.width / 2 +
          buttonRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  };

  // ✅ Handle page change
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
        updateURLParams({ page });
        window.scrollTo({ top: 300, behavior: "smooth" });
      }
    },
    [totalPages, currentPage, updateURLParams]
  );

  // ✅ Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilter("");
    setCurrentPage(1);

    isUpdatingURL.current = true;
    window.history.replaceState(null, "", pathname);
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [pathname]);

  // Toggle favorite
  const handleToggleFavorite = async (activityId, currentStatus) => {
    setAnimatedId(activityId);

    const result = await toggleWishlist(activityId, "activity", currentStatus);

    if (result.success) {
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === activityId
            ? { ...activity, is_fav: result.is_fav }
            : activity
        )
      );
    }

    setTimeout(() => {
      setAnimatedId(null);
    }, 600);
  };

  // Share Modal Functions
  const toggleShareModal = (id) => {
    setShareModalOpen(shareModalOpen === id ? null : id);
  };

  const closeShareModal = () => {
    setShareModalOpen(null);
  };

  // Check if any filters are active
  const hasActiveFilters =
    activeFilter && activeFilter !== "" && activeFilter !== "All Activities";

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // ✅ Handle horizontal scroll with mouse wheel
  // const handleWheelScroll = (e) => {
  //   if (categoryScrollRef.current) {
  //     e.preventDefault();
  //     categoryScrollRef.current.scrollLeft += e.deltaY;
  //   }
  // };

  if (error && activities.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <Breadcrumb pagename="Activities" pagetitle="Activities" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              Error loading activities
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchActivities()}
              className="mt-4 px-6 py-2 bg-[#295557] text-white rounded-lg hover:bg-[#1f4042] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Breadcrumb pagename="Activities" pagetitle="Activities" />

      {/* Hero Section */}
      <div className="bg-white py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{
                background: `linear-gradient(135deg, #295557 0%, #e8a355 100%)`,
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

      {/* Activities Grid */}
      <div className="bg-white pb-8">
        <div className="container mx-auto px-4">
          <div className="relative mb-8">
            {/* <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden" /> */}

            {/* <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" /> */}

            {/* ✅ Snap Scroll Container */}
            <div
              ref={categoryScrollRef}
              className="category-scroll-container flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
              // onWheel={handleWheelScroll}
            >
              {/* Spacer for centering on mobile */}
              <div className="flex-shrink-0 w-4 md:hidden snap-start" />

              {availableCategories.map((filter) => {
                const isActive =
                  (filter === "All Activities" &&
                    (!activeFilter || activeFilter === "")) ||
                  filter === activeFilter;

                return (
                  <button
                    key={filter}
                    data-category={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`category-filter-btn group/filter flex-shrink-0 snap-center relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 overflow-hidden whitespace-nowrap ${
                      isActive
                        ? "text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
                    }`}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
                          }
                        : {}
                    }
                  >
                    <span className="relative z-10">{filter}</span>

                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/filter:scale-x-100 transition-transform duration-300 origin-left" />
                        <div className="absolute inset-0 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover/filter:translate-x-full" />
                      </>
                    )}

                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
                    )}
                  </button>
                );
              })}

              {/* Spacer for centering on mobile */}
              <div className="flex-shrink-0 w-4 md:hidden snap-end" />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col gap-2 justify-center items-center h-64">
              <div
                style={{
                  borderBottom: "2px solid #295557",
                }}
                className="animate-spin rounded-full h-12 w-12"
              ></div>
              Loading Activities
            </div>
          )}

          {/* Results info */}
          {!loading && activities.length > 0 && (
            <div className="flex justify-between items-center mb-8">
              <div>
                <h5 className="text-gray-800 font-medium mb-1">
                  {totalItems} {totalItems === 1 ? "Activity" : "Activities"}{" "}
                  Found
                </h5>
                {totalPages > 1 && (
                  <small className="text-gray-500">
                    Page {currentPage} of {totalPages}
                  </small>
                )}
              </div>
              <div>
                <small className="text-gray-500">
                  Total: {totalItems} activities available
                </small>
              </div>
            </div>
          )}

          {/* Activities Grid */}
          {!loading && activities.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {activities?.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onToggleFavorite={handleToggleFavorite}
                  isAnimated={animatedId === activity.id}
                  isLoadingFav={isLoading(activity.id)}
                  onShareClick={toggleShareModal}
                  shareModalOpen={shareModalOpen}
                  onCloseShare={closeShareModal}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-16">
                <i className="bi bi-search text-6xl text-gray-300 mb-4 block"></i>
                <div className="text-gray-500 text-xl mb-4">
                  No activities found
                </div>
                <p className="text-gray-400 mb-4">
                  {hasActiveFilters
                    ? "Try selecting a different category or clear the filter."
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
            )
          )}

          {/* Pagination */}
          {!loading && activities.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-16">
              <nav className="inline-flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#295557] border border-gray-300 hover:bg-[#295557] hover:text-white hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {/* Page Numbers */}
                {getPaginationNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page)}
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

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#295557] border border-gray-300 hover:bg-[#295557] hover:text-white hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* <Newslatter /> */}
      <Footer />
    </div>
  );
};

export default ActivitiesPage;
