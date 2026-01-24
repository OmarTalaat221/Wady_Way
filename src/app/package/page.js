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
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";
import { Select } from "antd"; // ✅ Import Ant Design Select

const ACTIVITY_CATEGORIES = [
  "Beaches",
  "City Tours",
  "Cruises",
  "Hiking",
  "Historical",
  "Museum Tours",
  "Adventure",
];

const DURATION_OPTIONS = [
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

const PRICE_RANGES = [
  { id: "under500", label: "Under $500", min: 0, max: 500 },
  { id: "500to1000", label: "$500 - $1,000", min: 500, max: 1000 },
  { id: "1000to2000", label: "$1,000 - $2,000", min: 1000, max: 2000 },
  { id: "2000to5000", label: "$2,000 - $5,000", min: 2000, max: 5000 },
  { id: "over5000", label: "$5,000+", min: 5000, max: 1000000 },
];

// ✅ Sort options
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "discount", label: "Best Deals" },
];

// Helper functions
const parseCommaSeparatedInts = (param) => {
  if (!param) return [];
  return param
    .split(",")
    .map((v) => parseInt(v.trim()))
    .filter((v) => !isNaN(v));
};

const parseCommaSeparatedStrings = (param) => {
  if (!param) return [];
  return param
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "");
};

const parseCommaSeparatedFloats = (param) => {
  if (!param) return [];
  return param
    .split(",")
    .map((v) => parseFloat(v.trim()))
    .filter((v) => !isNaN(v));
};

const reconstructPriceRanges = (minParam, maxParam) => {
  if (!minParam || !maxParam) return [];
  const mins = parseCommaSeparatedFloats(minParam);
  const maxs = parseCommaSeparatedFloats(maxParam);
  const selectedIds = [];
  for (let i = 0; i < Math.min(mins.length, maxs.length); i++) {
    const range = PRICE_RANGES.find(
      (r) => r.min === mins[i] && r.max === maxs[i]
    );
    if (range) selectedIds.push(range.id);
  }
  return selectedIds;
};

const buildQueryString = (params) => {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      parts.push(`${encodeURIComponent(key)}=${value}`);
    }
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
};

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [trips, setTrips] = useState([]);
  const [animatedId, setAnimatedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          return userData.id || userData.user_id || null;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return null;
  });
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const id = userData.id || userData.user_id;
          return !!id;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return false;
  });

  // ✅ Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isUpdatingURL = useRef(false);
  const [availableCountries, setAvailableCountries] = useState([]);

  const [activityFilters, setActivityFilters] = useState(() => {
    return parseCommaSeparatedStrings(searchParams.get("activity"));
  });

  const [countryIds, setCountryIds] = useState(() => {
    return parseCommaSeparatedInts(searchParams.get("country_id"));
  });

  const [daysFilters, setDaysFilters] = useState(() => {
    return parseCommaSeparatedInts(searchParams.get("days"));
  });

  const [selectedPriceRanges, setSelectedPriceRanges] = useState(() => {
    return reconstructPriceRanges(
      searchParams.get("price_min"),
      searchParams.get("price_max")
    );
  });

  // ✅ Sort state
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get("sort") || "";
  });

  const { priceMinArray, priceMaxArray } = useMemo(() => {
    const selectedRanges = selectedPriceRanges
      .map((id) => PRICE_RANGES.find((r) => r.id === id))
      .filter((r) => r !== undefined)
      .sort((a, b) => a.min - b.min);

    return {
      priceMinArray: selectedRanges.map((r) => r.min),
      priceMaxArray: selectedRanges.map((r) => r.max),
    };
  }, [selectedPriceRanges]);

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

  const shareModalRefs = useRef({});

  // ✅ Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  const updateURLParams = useCallback(
    (options = {}) => {
      const {
        page = currentPage,
        limit = itemsPerPage,
        activities = activityFilters,
        country_ids = countryIds,
        days = daysFilters,
        price_ranges = selectedPriceRanges,
        sort = sortBy,
      } = options;

      const params = {};

      if (page && page !== 1) {
        params.page = page.toString();
      }

      if (limit && limit !== 10) {
        params.limit = limit.toString();
      }

      if (activities.length > 0) {
        params.activity = activities.join(",");
      }

      if (country_ids.length > 0) {
        params.country_id = country_ids.join(",");
      }

      if (days.length > 0) {
        params.days = days.join(",");
      }

      if (price_ranges.length > 0) {
        const selectedRanges = price_ranges
          .map((id) => PRICE_RANGES.find((r) => r.id === id))
          .filter((r) => r !== undefined)
          .sort((a, b) => a.min - b.min);

        const mins = selectedRanges.map((r) => r.min);
        const maxs = selectedRanges.map((r) => r.max);

        if (mins.length > 0) {
          params.price_min = mins.join(",");
        }
        if (maxs.length > 0) {
          params.price_max = maxs.join(",");
        }
      }

      // ✅ Add sort to URL params
      if (sort && sort !== "") {
        params.sort = sort;
      }

      const queryString = buildQueryString(params);
      const newURL = `${pathname}${queryString}`;

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
      activityFilters,
      countryIds,
      daysFilters,
      selectedPriceRanges,
      sortBy,
    ]
  );

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

  useEffect(() => {
    if (isUpdatingURL.current) return;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const activityParam = searchParams.get("activity");
    const countryIdParam = searchParams.get("country_id");
    const daysParam = searchParams.get("days");
    const priceMinParam = searchParams.get("price_min");
    const priceMaxParam = searchParams.get("price_max");
    const sortParam = searchParams.get("sort");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 10;
    const newActivities = parseCommaSeparatedStrings(activityParam);
    const newCountryIds = parseCommaSeparatedInts(countryIdParam);
    const newDays = parseCommaSeparatedInts(daysParam);
    const newPriceRanges = reconstructPriceRanges(priceMinParam, priceMaxParam);
    const newSort = sortParam || "";

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== itemsPerPage) setItemsPerPage(newLimit);
    if (newSort !== sortBy) setSortBy(newSort);

    if (JSON.stringify(newActivities) !== JSON.stringify(activityFilters)) {
      setActivityFilters(newActivities);
    }
    if (JSON.stringify(newCountryIds) !== JSON.stringify(countryIds)) {
      setCountryIds(newCountryIds);
    }
    if (JSON.stringify(newDays) !== JSON.stringify(daysFilters)) {
      setDaysFilters(newDays);
    }
    if (
      JSON.stringify(newPriceRanges) !== JSON.stringify(selectedPriceRanges)
    ) {
      setSelectedPriceRanges(newPriceRanges);
    }
  }, [searchParams]);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.id || userData.user_id;
        if (id) {
          setUserId(id);
          setIsUserLoggedIn(true);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsUserLoggedIn(false);
      }
    } else {
      setIsUserLoggedIn(false);
    }
  }, []);

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

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const fetchTours = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = {};

      if (userId) {
        queryParams.user_id = userId;
      }

      queryParams.page = currentPage.toString();
      queryParams.limit = itemsPerPage.toString();

      if (activityFilters.length > 0) {
        queryParams.activity = activityFilters.join(",");
      }

      if (countryIds.length > 0) {
        queryParams.country_id = countryIds.join(",");
      }

      if (daysFilters.length > 0) {
        queryParams.days = daysFilters.join(",");
      }

      if (priceMinArray.length > 0) {
        queryParams.price_min = priceMinArray.join(",");
      }

      if (priceMaxArray.length > 0) {
        queryParams.price_max = priceMaxArray.join(",");
      }

      // ✅ Add sort parameter
      if (sortBy && sortBy !== "") {
        queryParams.sort = sortBy;
      }

      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

      const apiUrl = `${base_url}/user/tours/select_tours.php?${queryString}`;
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
          background_image: tour.background_image,
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

          offer_percentage: tour?.offer_percentage?.match(/\d+/)?.[0] || null,
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
    activityFilters,
    countryIds,
    daysFilters,
    priceMinArray,
    priceMaxArray,
    sortBy,
  ]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

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

  // ✅ Handle sort change
  const handleSortChange = useCallback(
    (value) => {
      setSortBy(value);
      setCurrentPage(1);
      updateURLParams({ page: 1, sort: value });
    },
    [updateURLParams]
  );

  const handleActivityFilterToggle = useCallback(
    (activity) => {
      setActivityFilters((prev) => {
        const newFilters = prev.includes(activity)
          ? prev.filter((a) => a !== activity)
          : [...prev, activity];

        setCurrentPage(1);
        updateURLParams({ page: 1, activities: newFilters });
        return newFilters;
      });
    },
    [updateURLParams]
  );

  const handleCountryFilterToggle = useCallback(
    (countryIdValue) => {
      setCountryIds((prev) => {
        const newFilters = prev.includes(countryIdValue)
          ? prev.filter((id) => id !== countryIdValue)
          : [...prev, countryIdValue];

        setCurrentPage(1);
        updateURLParams({ page: 1, country_ids: newFilters });
        return newFilters;
      });
    },
    [updateURLParams]
  );

  const handleDaysFilterToggle = useCallback(
    (days) => {
      setDaysFilters((prev) => {
        const newFilters = prev.includes(days)
          ? prev.filter((d) => d !== days)
          : [...prev, days];

        setCurrentPage(1);
        updateURLParams({ page: 1, days: newFilters });
        return newFilters;
      });
    },
    [updateURLParams]
  );

  const handlePriceRangeToggle = useCallback(
    (rangeId) => {
      setSelectedPriceRanges((prev) => {
        const newFilters = prev.includes(rangeId)
          ? prev.filter((id) => id !== rangeId)
          : [...prev, rangeId];

        setCurrentPage(1);
        updateURLParams({ page: 1, price_ranges: newFilters });
        return newFilters;
      });
    },
    [updateURLParams]
  );

  const clearAllFilters = useCallback(() => {
    setActivityFilters([]);
    setCountryIds([]);
    setDaysFilters([]);
    setSelectedPriceRanges([]);
    // ✅ لا نقوم بإعادة تعيين السورت
    setCurrentPage(1);

    isUpdatingURL.current = true;
    // ✅ نحتفظ بالسورت في الـ URL
    const params = {};
    if (sortBy && sortBy !== "") {
      params.sort = sortBy;
    }
    const queryString = buildQueryString(params);
    const newURL = `${pathname}${queryString}`;
    window.history.replaceState(null, "", newURL);

    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [pathname, sortBy]);

  const getCountryNameById = (id) => {
    const country = availableCountries.find(
      (c) => parseInt(c.country_id) === id
    );
    return country ? country.country_name : "";
  };

  // ✅ لا نحسب السورت ضمن الفلاتر النشطة
  const hasActiveFilters =
    activityFilters.length > 0 ||
    countryIds.length > 0 ||
    daysFilters.length > 0 ||
    selectedPriceRanges.length > 0;

  const activeFiltersCount =
    activityFilters.length +
    countryIds.length +
    daysFilters.length +
    selectedPriceRanges.length;

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

  const startItem = trips.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // ✅ Sidebar Content Component (reusable for desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Price Range Filter */}
      <div className="single-widget mb-30">
        <h5 className="widget-title">Price Range</h5>
        <ul className="category-list">
          {PRICE_RANGES.map((range) => {
            const isSelected = selectedPriceRanges.includes(range.id);
            return (
              <li
                key={range.id}
                className={isSelected ? "selected_filter" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handlePriceRangeToggle(range.id);
                  if (window.innerWidth < 992) {
                    setTimeout(() => setIsMobileSidebarOpen(false), 300);
                  }
                }}
              >
                <a>{range.label}</a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Destination/Country Filter */}
      <div className="single-widget mb-30">
        <h5 className="widget-title">Destination</h5>
        <ul className="category-list two">
          {availableCountries.length > 0 ? (
            availableCountries.map((country) => {
              const countryIdInt = parseInt(country.country_id);
              const isSelected = countryIds.includes(countryIdInt);
              return (
                <li
                  key={country.country_id}
                  className={isSelected ? "selected_filter" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    handleCountryFilterToggle(countryIdInt);
                    if (window.innerWidth < 992) {
                      setTimeout(() => setIsMobileSidebarOpen(false), 300);
                    }
                  }}
                >
                  <a>{country.country_name}</a>
                </li>
              );
            })
          ) : (
            <li className="text-muted">Loading countries...</li>
          )}
        </ul>
      </div>

      {/* Duration Filter */}
      <div className="single-widget mb-30">
        <h5 className="widget-title">Durations</h5>
        <ul className="category-list">
          {DURATION_OPTIONS.map((duration) => {
            const isSelected = daysFilters.includes(duration.days);
            return (
              <li
                key={duration.days}
                className={isSelected ? "selected_filter" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  handleDaysFilterToggle(duration.days);
                  if (window.innerWidth < 992) {
                    setTimeout(() => setIsMobileSidebarOpen(false), 300);
                  }
                }}
              >
                <a>{duration.label}</a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <div className="single-widget mb-30">
          <button
            className="btn btn-outline-danger w-100"
            onClick={() => {
              clearAllFilters();
              if (window.innerWidth < 992) {
                setIsMobileSidebarOpen(false);
              }
            }}
          >
            <i className="bi bi-x-circle me-2"></i>
            Clear All Filters ({activeFiltersCount})
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <Breadcrumb pagename="Package Grid" pagetitle="Package Grid" />

      <div className="package-grid-with-sidebar-section pt-[120px] mb-[120px]">
        <div className="container">
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
            <div className="lg:col-span-2">
              <div className="package-inner-title-section mb-[10px]">
                <div className="flex flex-col gap-2">
                  <p className="mb-0">
                    Showing {startItem}–{endItem} of {totalItems} results
                  </p>
                  <small className="text-muted ">
                    Page {currentPage} of {totalPages}
                  </small>
                </div>
                <div className="selector-and-grid">
                  {/* ✅ Ant Design Select for Sort */}
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    style={{
                      minWidth: 180,
                      // marginRight: 12,
                    }}
                    options={SORT_OPTIONS}
                    placeholder="Sort By"
                  />

                  {/* ✅ Mobile Filter Button */}
                  <button
                    className="primary-btn2 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(true)}
                  >
                    <i className="bi bi-funnel me-2"></i>
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="badge bg-danger ms-2">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {hasActiveFilters && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  )}
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
                  <div className="sm:grid-cols-2 grid-cols-1 grid gap-3 ">
                    {trips.length > 0 ? (
                      trips.map((tour) => (
                        <div className=" item" key={tour.id}>
                          <div className="package-card">
                            {/* ✅ Discount Badge - Top Right Corner */}
                            {tour.offer_percentage && (
                              <div className="discount-ribbon">
                                <span>{tour.offer_percentage}% OFF</span>
                              </div>
                            )}
                            <div className="package-card-img-wrap">
                              <Link
                                href={`/package/package-details/${tour?.id}`}
                                className="card-img"
                              >
                                <img
                                  src={tour?.background_image}
                                  alt={tour?.title}
                                />
                              </Link>

                              <div
                                className={`favorite-btn ${
                                  tour.is_fav ? "active" : ""
                                } ${animatedId === tour.id ? "animate" : ""} ${
                                  isLoading(tour.id) ? "loading" : ""
                                } ${!isUserLoggedIn ? "disabled" : ""}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLoading(tour.id) && isUserLoggedIn) {
                                    handleToggleFavorite(tour.id, tour.is_fav);
                                  }
                                }}
                                title={
                                  !isUserLoggedIn
                                    ? "Login to add to favorites"
                                    : "Add to favorites"
                                }
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </div>

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
                      <div className="col-span-2 text-center py-5">
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

            {/* ✅ Desktop Sidebar (No Sticky) */}
            <div className="col-span-1 hidden lg:block">
              <div className="sidebar-area sticky-sidebar">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Sidebar Offcanvas with Tailwind */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 mobile-btn ${
          isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-[350px] bg-white z-[9999] transition-transform duration-300 ease-in-out flex flex-col sidebar-drawer ${
          isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <h5 className="text-lg font-semibold m-0">Filters</h5>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {/* Body with Scroll */}
        <div className="flex-1 overflow-y-auto lg:block hidden">
          <div className="sidebar-area">
            <SidebarContent />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Page;
