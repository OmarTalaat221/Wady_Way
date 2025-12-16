"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import SelectComponent from "@/uitils/SelectComponent";
import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  // Next.js router hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [trips, setTrips] = useState([]);
  const [animatedId, setAnimatedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // ADD THIS

  // ✅ Flag to prevent URL sync loop
  const isUpdatingURL = useRef(false);

  // ✅ Available countries from API
  const [availableCountries, setAvailableCountries] = useState([]);

  // ✅ Initialize filters from URL params - matching API params
  const [activityFilter, setActivityFilter] = useState(() => {
    return searchParams.get("activity") || "";
  });

  // ✅ country_id (integer)
  const [countryId, setCountryId] = useState(() => {
    const countryIdParam = searchParams.get("country_id");
    return countryIdParam ? parseInt(countryIdParam) : 0;
  });

  // ✅ days (integer - exact days)
  const [daysFilter, setDaysFilter] = useState(() => {
    const daysParam = searchParams.get("days");
    return daysParam ? parseInt(daysParam) : 0;
  });

  // ✅ price_min and price_max
  const [priceMin, setPriceMin] = useState(() => {
    const priceMinParam = searchParams.get("price_min");
    return priceMinParam ? parseFloat(priceMinParam) : "";
  });

  const [priceMax, setPriceMax] = useState(() => {
    const priceMaxParam = searchParams.get("price_max");
    return priceMaxParam ? parseFloat(priceMaxParam) : "";
  });

  // Pagination states - Initialize from URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam) : 1;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get("limit");
    return limitParam ? parseInt(limitParam) : 10;
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Create ref for share modals
  const shareModalRefs = useRef({});

  // ✅ Activity/Category options
  const activityCategories = [
    "Beaches",
    "City Tours",
    "Cruises",
    "Hiking",
    "Historical",
    "Museum Tours",
    "Adventure",
  ];

  // ✅ Duration options (days as integer)
  const durationOptions = [
    { days: 1, label: "1 Day Tour" },
    { days: 2, label: "2 Days Tour" },
    { days: 3, label: "3 Days Tour" },
    { days: 4, label: "4 Days Tour" },
    { days: 5, label: "5 Days Tour" },
    { days: 6, label: "6 Days Tour" },
    { days: 7, label: "7 Days Tour" },
    { days: 8, label: "8 Days Tour" },
    { days: 9, label: "9 Days Tour" },
    { days: 10, label: "10+ Days Tour" },
  ];

  // ✅ Price range options
  const priceRanges = [
    { id: "under500", label: "Under $500", min: 0, max: 500 },
    { id: "500to1000", label: "$500 - $1,000", min: 500, max: 1000 },
    { id: "1000to2000", label: "$1,000 - $2,000", min: 1000, max: 2000 },
    { id: "2000to5000", label: "$2,000 - $5,000", min: 2000, max: 5000 },
    { id: "over5000", label: "$5,000+", min: 5000, max: 100000 },
  ];

  // ✅ Function to update URL without page reload
  const updateURLParams = useCallback(
    (options = {}) => {
      const {
        page = currentPage,
        limit = itemsPerPage,
        activity = activityFilter,
        country_id = countryId,
        days = daysFilter,
        price_min = priceMin,
        price_max = priceMax,
      } = options;

      const params = new URLSearchParams();

      if (page && page !== 1) {
        params.set("page", page.toString());
      }

      if (limit && limit !== 10) {
        params.set("limit", limit.toString());
      }

      if (activity && activity !== "") {
        params.set("activity", activity);
      }

      // ✅ country_id as integer
      if (country_id && country_id !== 0) {
        params.set("country_id", country_id.toString());
      }

      // ✅ days as integer
      if (days && days !== 0) {
        params.set("days", days.toString());
      }

      // ✅ price_min
      if (price_min !== "" && price_min !== null && price_min >= 0) {
        params.set("price_min", price_min.toString());
      }

      // ✅ price_max
      if (price_max !== "" && price_max !== null && price_max > 0) {
        params.set("price_max", price_max.toString());
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
    [
      pathname,
      currentPage,
      itemsPerPage,
      activityFilter,
      countryId,
      daysFilter,
      priceMin,
      priceMax,
    ]
  );

  // Handle click outside to close share modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareModalOpen !== null) {
        const modalRef = shareModalRefs.current[shareModalOpen];
        if (modalRef && !modalRef.contains(event.target)) {
          const shareBtn = event.target.closest(".share-btn");
          if (!shareBtn) {
            setShareModalOpen(null);
          }
        }
      }
    };

    if (shareModalOpen !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [shareModalOpen]);

  // ✅ Sync state with URL params (for browser back/forward)
  useEffect(() => {
    if (isUpdatingURL.current) return;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const activityParam = searchParams.get("activity");
    const countryIdParam = searchParams.get("country_id");
    const daysParam = searchParams.get("days");
    const priceMinParam = searchParams.get("price_min");
    const priceMaxParam = searchParams.get("price_max");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 10;
    const newActivity = activityParam || "";
    const newCountryId = countryIdParam ? parseInt(countryIdParam) : 0;
    const newDays = daysParam ? parseInt(daysParam) : 0;
    const newPriceMin = priceMinParam ? parseFloat(priceMinParam) : "";
    const newPriceMax = priceMaxParam ? parseFloat(priceMaxParam) : "";

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== itemsPerPage) setItemsPerPage(newLimit);
    if (newActivity !== activityFilter) setActivityFilter(newActivity);
    if (newCountryId !== countryId) setCountryId(newCountryId);
    if (newDays !== daysFilter) setDaysFilter(newDays);
    if (newPriceMin !== priceMin) setPriceMin(newPriceMin);
    if (newPriceMax !== priceMax) setPriceMax(newPriceMax);
  }, [searchParams]);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.id || userData.user_id;
        if (id) {
          setUserId(id);
          setIsUserLoggedIn(true); // ADD THIS
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsUserLoggedIn(false); // ADD THIS
      }
    } else {
      setIsUserLoggedIn(false); // ADD THIS
    }
  }, []);

  // ✅ Fetch countries from API
  const fetchCountries = useCallback(async () => {
    try {
      const response = await axios.get(
        `${base_url}/user/countries/select_countries.php`
      );

      if (response?.data?.status === "success") {
        setAvailableCountries(response.data.message || []);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }, []);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // ✅ Fetch tours from API with filters in GET params
  const fetchTours = useCallback(async () => {
    // if (!userId) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();

      // Only add user_id if user is logged in - ADD THIS CHECK
      if (userId) {
        params.set("user_id", userId);
      }

      params.set("page", currentPage.toString());
      params.set("limit", itemsPerPage.toString());

      if (activityFilter && activityFilter !== "") {
        params.set("activity", activityFilter);
      }

      if (countryId && countryId !== 0) {
        params.set("country_id", countryId.toString());
      }

      if (daysFilter && daysFilter !== 0) {
        params.set("days", daysFilter.toString());
      }

      if (priceMin !== "" && priceMin !== null && priceMin >= 0) {
        params.set("price_min", priceMin.toString());
      }

      if (priceMax !== "" && priceMax !== null && priceMax > 0) {
        params.set("price_max", priceMax.toString());
      }

      const apiUrl = `${base_url}/user/tours/select_tours.php?${params.toString()}`;
      console.log("Fetching Tours:", apiUrl);

      const response = await axios.get(apiUrl);

      if (response?.data?.status === "success") {
        const data = response.data;

        setTotalPages(parseInt(data.total_pages) || 1);
        setTotalItems(parseInt(data.total_items) || 0);

        const transformedTrips = data.message.map((tour) => ({
          id: tour.id,
          title: tour.title,
          country: tour.country_name,
          country_id: parseInt(tour.country_id),
          images:
            tour.gallery && tour.gallery.length > 0
              ? tour.gallery
              : [tour.image],
          duration: tour.duration,
          mainLocations: tour.route
            ? tour.route
                .split("-")
                .slice(0, 2)
                .map((loc) => loc.trim())
            : [],
          additionalLocations: tour.route
            ? tour.route.split("-").map((loc) => loc.trim())
            : [],
          activities: tour.category ? tour.category : "",
          price: parseFloat(tour.price_current),
          oldPrice: tour.price_original
            ? parseFloat(tour.price_original)
            : null,
          link: `/package/package-details/${tour.id}`,
          image: tour?.image,
          is_fav: tour?.is_fav || false,
        }));

        setTrips(transformedTrips);
      } else {
        setTrips([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      setTrips([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    currentPage,
    itemsPerPage,
    activityFilter,
    countryId,
    daysFilter,
    priceMin,
    priceMax,
  ]);

  // ✅ Fetch tours when filters change
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

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

  // ✅ Handle activity filter change
  const handleActivityFilterChange = useCallback(
    (activity) => {
      const newActivity = activity === activityFilter ? "" : activity;
      setActivityFilter(newActivity);
      setCurrentPage(1);
      updateURLParams({ page: 1, activity: newActivity });
    },
    [activityFilter, updateURLParams]
  );

  // ✅ Handle country filter change (using country_id as integer)
  const handleCountryFilterChange = useCallback(
    (countryIdValue) => {
      const newCountryId = countryIdValue === countryId ? 0 : countryIdValue;
      setCountryId(newCountryId);
      setCurrentPage(1);
      updateURLParams({ page: 1, country_id: newCountryId });
    },
    [countryId, updateURLParams]
  );

  // ✅ Handle days filter change (integer)
  const handleDaysFilterChange = useCallback(
    (days) => {
      const newDays = days === daysFilter ? 0 : days;
      setDaysFilter(newDays);
      setCurrentPage(1);
      updateURLParams({ page: 1, days: newDays });
    },
    [daysFilter, updateURLParams]
  );

  // ✅ Handle price range change
  const handlePriceRangeChange = useCallback(
    (range) => {
      if (priceMin === range.min && priceMax === range.max) {
        // Toggle off
        setPriceMin("");
        setPriceMax("");
        setCurrentPage(1);
        updateURLParams({
          page: 1,
          price_min: "",
          price_max: "",
        });
      } else {
        // Select new range
        setPriceMin(range.min);
        setPriceMax(range.max);
        setCurrentPage(1);
        updateURLParams({
          page: 1,
          price_min: range.min,
          price_max: range.max,
        });
      }
    },
    [priceMin, priceMax, updateURLParams]
  );

  // ✅ Clear all filters
  const clearAllFilters = useCallback(() => {
    setActivityFilter("");
    setCountryId(0);
    setDaysFilter(0);
    setPriceMin("");
    setPriceMax("");
    setCurrentPage(1);

    isUpdatingURL.current = true;
    window.history.replaceState(null, "", pathname);
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [pathname]);

  // ✅ Get country name by ID
  const getCountryNameById = (id) => {
    const country = availableCountries.find(
      (c) => parseInt(c.country_id) === id
    );
    return country ? country.country_name : "";
  };

  // Check if any filters are active
  const hasActiveFilters =
    activityFilter !== "" ||
    countryId !== 0 ||
    daysFilter !== 0 ||
    priceMin !== "" ||
    priceMax !== "";

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

  // Toggle favorite with API
  const handleToggleFavorite = async (tourId, currentStatus) => {
    setAnimatedId(tourId);

    const result = await toggleWishlist(tourId, "tour", currentStatus);

    if (result.success) {
      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === tourId ? { ...trip, is_fav: result.is_fav } : trip
        )
      );
    }

    setTimeout(() => {
      setAnimatedId(null);
    }, 600);
  };

  const toggleShareModal = (id) => {
    setShareModalOpen(shareModalOpen === id ? null : id);
  };

  const closeShareModal = () => {
    setShareModalOpen(null);
  };

  const shareOnFacebook = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
    closeShareModal();
  };

  const shareOnWhatsapp = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    const message = `Check out this amazing tour: ${tour.title} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    closeShareModal();
  };

  const copyToClipboard = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    navigator.clipboard.writeText(url).then(() => {
      closeShareModal();
    });
  };

  // Calculate showing range
  const startItem = trips.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      <Breadcrumb pagename="Package Grid" pagetitle="Package Grid" />

      <div className="package-grid-with-sidebar-section pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-lg-8">
              <div className="package-inner-title-section mb-10">
                <div className="d-flex flex-column gap-2">
                  <p className="mb-0">
                    Showing {startItem}–{endItem} of {totalItems} results
                  </p>
                  <small className="text-muted">
                    Page {currentPage} of {totalPages}
                  </small>
                </div>
                <div className="selector-and-grid">
                  <ul className="grid-view">
                    <li className="grid active">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 14 14"
                      >
                        <mask
                          id="mask0_1631_19"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x={0}
                          y={0}
                          width={14}
                          height={14}
                        >
                          <rect width={14} height={14} fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_1631_19)">
                          <path d="M5.47853 6.08726H0.608726C0.272536 6.08726 0 5.81472 0 5.47853V0.608726C0 0.272536 0.272536 0 0.608726 0H5.47853C5.81472 0 6.08726 0.272536 6.08726 0.608726V5.47853C6.08726 5.81472 5.81472 6.08726 5.47853 6.08726Z" />
                          <path d="M13.3911 6.08726H8.52132C8.18513 6.08726 7.9126 5.81472 7.9126 5.47853V0.608726C7.9126 0.272536 8.18513 0 8.52132 0H13.3911C13.7273 0 13.9999 0.272536 13.9999 0.608726V5.47853C13.9999 5.81472 13.7273 6.08726 13.3911 6.08726Z" />
                          <path d="M5.47853 14.0013H0.608726C0.272536 14.0013 0 13.7288 0 13.3926V8.52279C0 8.1866 0.272536 7.91406 0.608726 7.91406H5.47853C5.81472 7.91406 6.08726 8.1866 6.08726 8.52279V13.3926C6.08726 13.7288 5.81472 14.0013 5.47853 14.0013Z" />
                          <path d="M13.3916 14.0013H8.52181C8.18562 14.0013 7.91309 13.7288 7.91309 13.3926V8.52279C7.91309 8.1866 8.18562 7.91406 8.52181 7.91406H13.3916C13.7278 7.91406 14.0003 8.1866 14.0003 8.52279V13.3926C14.0003 13.7288 13.7278 14.0013 13.3916 14.0013Z" />
                        </g>
                      </svg>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="list-grid-product-wrap mb-[70px]">
                {loading ? (
                  <div className="loading-spinner text-center py-5">
                    <div
                      className="spinner-border text-[#295557]"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading tours...</p>
                  </div>
                ) : (
                  <div className="row gy-4">
                    {trips.length > 0 ? (
                      trips.map((tour) => (
                        <div className="col-md-6 item" key={tour.id}>
                          <div className="package-card">
                            <div className="package-card-img-wrap">
                              <Link
                                href={`/package/package-details/${tour?.id}`}
                                className="card-img"
                              >
                                <img
                                  src={tour?.image}
                                  alt={tour?.title}
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/400x300?text=Tour+Image";
                                  }}
                                />
                              </Link>

                              <div
                                className={`favorite-btn ${
                                  tour.is_fav ? "active" : ""
                                } ${animatedId === tour.id ? "animate" : ""} ${
                                  isLoading(tour.id) ? "loading" : ""
                                } ${
                                  !isUserLoggedIn ? "disabled" : "" // ADD THIS
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLoading(tour.id)) {
                                    handleToggleFavorite(tour.id, tour.is_fav);
                                  }
                                }}
                                title={
                                  !isUserLoggedIn
                                    ? "Login to add to favorites"
                                    : "Add to favorites"
                                } // ADD THIS
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </div>

                              {/* Share Button */}
                              <div
                                className="share-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleShareModal(tour.id);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                                </svg>
                              </div>

                              {/* Share Options Modal */}
                              <div
                                ref={(el) =>
                                  (shareModalRefs.current[tour.id] = el)
                                }
                                className={`share-options ${
                                  shareModalOpen === tour.id ? "show" : ""
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  className="share-option facebook"
                                  onClick={() => shareOnFacebook(tour)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                                  </svg>
                                  <span>Facebook</span>
                                </div>
                                <div
                                  className="share-option whatsapp"
                                  onClick={() => shareOnWhatsapp(tour)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                  </svg>
                                  <span>WhatsApp</span>
                                </div>

                                <div
                                  className="share-option copy"
                                  onClick={() => copyToClipboard(tour)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                  </svg>
                                  <span>Copy Link</span>
                                </div>
                              </div>

                              <div className="batch">
                                <span className="date">{tour?.duration}</span>
                                <div className="location">
                                  <ul className="location-list">
                                    {tour?.mainLocations?.map(
                                      (mainLocat, index) => (
                                        <li key={index}>
                                          <Link href="/package">
                                            {mainLocat}
                                          </Link>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="package-card-content">
                              <div className="card-content-top">
                                <h5
                                  style={{
                                    height: "60px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <Link
                                    href={`/package/package-details/${tour?.id}`}
                                  >
                                    {tour?.title}
                                  </Link>
                                </h5>
                                <div className="location-area">
                                  <ul className="location-list scrollTextAni">
                                    {tour?.additionalLocations?.map(
                                      (additLocat, index) => (
                                        <li key={index}>
                                          <Link href="/package">
                                            {additLocat}
                                          </Link>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                              <div className="card-content-bottom">
                                <div className="price-area">
                                  <h6>Starting From:</h6>
                                  <span>
                                    ${tour?.price}{" "}
                                    {tour?.oldPrice &&
                                      tour?.oldPrice > tour?.price && (
                                        <del>${tour?.oldPrice}</del>
                                      )}
                                  </span>
                                  <p>TAXES INCL/PERS</p>
                                </div>
                                <Link
                                  href={`/package/package-details/${tour?.id}`}
                                  className="primary-btn2"
                                >
                                  Book a Trip
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-5">
                        <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                        <h4>No tours found matching your criteria</h4>
                        <p className="text-muted mb-4">
                          Try adjusting your filters or clear all filters
                        </p>
                        {hasActiveFilters && (
                          <button
                            className="btn btn-primary"
                            onClick={clearAllFilters}
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && trips.length > 0 && totalPages > 1 && (
                <div className="row">
                  <div className="col-lg-12">
                    <nav className="inner-pagination-area">
                      <ul className="pagination-list">
                        {/* Previous Button */}
                        <li>
                          <a
                            href="#"
                            className={`shop-pagi-btn ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                handlePageChange(currentPage - 1);
                              }
                            }}
                          >
                            <i className="bi bi-chevron-left" />
                          </a>
                        </li>

                        {/* Page Numbers */}
                        {getPaginationNumbers().map((page, index) => (
                          <li key={index}>
                            {page === "..." ? (
                              <span className="pagination-dots">
                                <i className="bi bi-three-dots" />
                              </span>
                            ) : (
                              <a
                                href="#"
                                className={currentPage === page ? "active" : ""}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                              >
                                {page}
                              </a>
                            )}
                          </li>
                        ))}

                        {/* Next Button */}
                        <li>
                          <a
                            href="#"
                            className={`shop-pagi-btn ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) {
                                handlePageChange(currentPage + 1);
                              }
                            }}
                          >
                            <i className="bi bi-chevron-right" />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Sidebar with Filters */}
            <div className="col-lg-4">
              <div className="sidebar-area">
                {/* ✅ Price Range Filter (price_min, price_max) */}
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Price Range</h5>
                  <ul className="category-list">
                    {priceRanges.map((range) => {
                      const isSelected =
                        priceMin === range.min && priceMax === range.max;
                      return (
                        <li
                          key={range.id}
                          className={isSelected ? "selected_filter" : ""}
                          style={{ cursor: "pointer" }}
                        >
                          <a onClick={() => handlePriceRangeChange(range)}>
                            {range.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* ✅ Destination/Country Filter (country_id as integer) */}
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Destination</h5>
                  <ul className="category-list two">
                    {availableCountries.length > 0 ? (
                      availableCountries.map((country) => {
                        const countryIdInt = parseInt(country.country_id);
                        return (
                          <li
                            key={country.country_id}
                            className={
                              countryId === countryIdInt
                                ? "selected_filter"
                                : ""
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <a
                              onClick={() =>
                                handleCountryFilterChange(countryIdInt)
                              }
                            >
                              {country.country_name}
                            </a>
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-muted">Loading countries...</li>
                    )}
                  </ul>
                </div>

                {/* ✅ Duration Filter (days as integer) */}
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Durations</h5>
                  <ul className="category-list">
                    {durationOptions.map((duration) => (
                      <li
                        key={duration.days}
                        className={
                          daysFilter === duration.days ? "selected_filter" : ""
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <a
                          onClick={() => handleDaysFilterChange(duration.days)}
                        >
                          {duration.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Newslatter /> */}
      <Footer />
    </>
  );
};

export default Page;
