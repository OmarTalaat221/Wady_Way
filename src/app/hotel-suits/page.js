"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import axios from "axios";
import { base_url } from "../../uitils/base_url";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/hooks/useWishlist";
import { Select } from "antd"; // ✅ Import Ant Design Select
import "./style.css";

// ✅ Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ✅ Sort options
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "rating_low", label: "Lowest Rated" },
  { value: "newest", label: "Newest First" },
];

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [animatedId, setAnimatedId] = useState(null);

  // ✅ Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isUpdatingURL = useRef(false);

  const [availableRatings, setAvailableRatings] = useState([]);
  const [availableFacilities, setAvailableFacilities] = useState([]);

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam) : 1;
  });

  const [hotelsPerPage, setHotelsPerPage] = useState(() => {
    const limitParam = searchParams.get("limit");
    return limitParam ? parseInt(limitParam) : 10;
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchText, setSearchText] = useState(() => {
    return searchParams.get("search") || "";
  });

  const [selectedPriceRanges, setSelectedPriceRanges] = useState(() => {
    const minPriceParam = searchParams.get("price_min");
    const maxPriceParam = searchParams.get("price_max");

    if (minPriceParam && maxPriceParam) {
      const mins = minPriceParam.split(",").map(Number);
      const maxs = maxPriceParam.split(",").map(Number);

      // Reconstruct selected ranges
      const ranges = [];
      for (let i = 0; i < mins.length; i++) {
        ranges.push({ min: mins[i], max: maxs[i] });
      }
      return ranges;
    }
    return [];
  });

  const [selectedRatings, setSelectedRatings] = useState(() => {
    const ratingsParam = searchParams.get("rating_min");
    return ratingsParam ? ratingsParam.split(",").filter(Boolean) : [];
  });

  const [selectedFacilities, setSelectedFacilities] = useState(() => {
    const facilitiesParam = searchParams.get("facilities");
    return facilitiesParam ? facilitiesParam.split(",").filter(Boolean) : [];
  });

  // ✅ Sort state
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get("sort") || "";
  });

  const debouncedSearchText = useDebounce(searchText, 1500);

  const shareModalRefs = useRef({});

  const priceRanges = [
    { id: "under300", label: "Under $300/night", min: 0, max: 300 },
    { id: "300to500", label: "$300 - $500/night", min: 300, max: 500 },
    { id: "500to1000", label: "$500 - $1000/night", min: 500, max: 1000 },
    { id: "over1000", label: "$1000+/night", min: 1000, max: 10000 },
  ];

  const ratingOptions = [
    { id: "5", label: "5 Stars", value: 5 },
    { id: "4.5", label: "4.5 Stars", value: 4.5 },
    { id: "4", label: "4 Stars", value: 4 },
    { id: "3.5", label: "3.5 Stars", value: 3.5 },
    { id: "3", label: "3 Stars", value: 3 },
  ];

  const settings = useMemo(() => {
    return {
      modules: [EffectFade, Pagination, Navigation],
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 25,
      effect: "fade",
      loop: true,
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination5",
        clickable: true,
      },
    };
  }, []);

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
        limit = hotelsPerPage,
        search = debouncedSearchText,
        ratings = selectedRatings,
        facilities = selectedFacilities,
        priceRanges = selectedPriceRanges,
        sort = sortBy,
      } = options;

      const params = new URLSearchParams();

      if (page && page !== 1) {
        params.set("page", page.toString());
      }

      if (limit && limit !== 10) {
        params.set("limit", limit.toString());
      }

      if (search && search.trim()) {
        params.set("search", search.trim());
      }

      if (facilities && facilities.length > 0) {
        params.set("facilities", facilities.join(","));
      }

      if (sort && sort !== "") {
        params.set("sort", sort);
      }

      // ✅ Build URL manually for price and rating to avoid encoding
      let baseURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      const additionalParams = [];

      // ✅ Handle multiple price ranges - without encoding
      if (priceRanges && priceRanges.length > 0) {
        const sortedRanges = [...priceRanges].sort((a, b) => a.min - b.min);
        const minPrices = sortedRanges.map((r) => r.min).join(",");
        const maxPrices = sortedRanges.map((r) => r.max).join(",");
        additionalParams.push(`price_min=${minPrices}`);
        additionalParams.push(`price_max=${maxPrices}`);
      }

      // ✅ Handle ratings - only use rating_max if multiple different values
      if (ratings && ratings.length > 0) {
        const ratingValues = ratings.map((r) => parseFloat(r));
        const minRating = Math.min(...ratingValues);
        const maxRating = Math.max(...ratingValues);

        additionalParams.push(`rating_min=${minRating}`);

        // ✅ Only add rating_max if it's different from rating_min
        if (maxRating !== minRating) {
          additionalParams.push(`rating_max=${maxRating}`);
        }
      }

      // ✅ Combine URL
      let finalURL = baseURL;
      if (additionalParams.length > 0) {
        const separator = baseURL.includes("?") ? "&" : "?";
        finalURL = `${baseURL}${separator}${additionalParams.join("&")}`;
      }

      isUpdatingURL.current = true;
      window.history.replaceState(null, "", finalURL);

      setTimeout(() => {
        isUpdatingURL.current = false;
      }, 100);
    },
    [
      pathname,
      currentPage,
      hotelsPerPage,
      debouncedSearchText,
      selectedRatings,
      selectedFacilities,
      selectedPriceRanges,
      sortBy,
    ]
  );

  useEffect(() => {
    if (isUpdatingURL.current) return;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchParam = searchParams.get("search");
    const ratingsMinParam = searchParams.get("rating_min");
    const ratingsMaxParam = searchParams.get("rating_max");
    const facilitiesParam = searchParams.get("facilities");
    const minPriceParam = searchParams.get("price_min");
    const maxPriceParam = searchParams.get("price_max");
    const sortParam = searchParams.get("sort");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 10;
    const newSearch = searchParam || "";
    const newFacilities = facilitiesParam
      ? facilitiesParam.split(",").filter(Boolean)
      : [];
    const newSort = sortParam || "";

    // ✅ Parse ratings from min/max
    let newRatings = [];
    if (ratingsMinParam) {
      const minRating = parseFloat(ratingsMinParam);
      const maxRating = ratingsMaxParam
        ? parseFloat(ratingsMaxParam)
        : minRating;

      // Reconstruct selected ratings based on ratingOptions that fall within range
      newRatings = ratingOptions
        .filter((r) => r.value >= minRating && r.value <= maxRating)
        .map((r) => r.id);
    }

    // ✅ Parse price ranges
    let newPriceRanges = [];
    if (minPriceParam && maxPriceParam) {
      const mins = minPriceParam.split(",").map(Number);
      const maxs = maxPriceParam.split(",").map(Number);
      for (let i = 0; i < mins.length; i++) {
        if (!isNaN(mins[i]) && !isNaN(maxs[i])) {
          newPriceRanges.push({ min: mins[i], max: maxs[i] });
        }
      }
    }

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== hotelsPerPage) setHotelsPerPage(newLimit);
    if (newSearch !== searchText) setSearchText(newSearch);
    if (newSort !== sortBy) setSortBy(newSort);
    if (JSON.stringify(newRatings) !== JSON.stringify(selectedRatings)) {
      setSelectedRatings(newRatings);
    }
    if (JSON.stringify(newFacilities) !== JSON.stringify(selectedFacilities)) {
      setSelectedFacilities(newFacilities);
    }
    if (
      JSON.stringify(newPriceRanges) !== JSON.stringify(selectedPriceRanges)
    ) {
      setSelectedPriceRanges(newPriceRanges);
    }
  }, [searchParams]);

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

  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (userId) {
        params.set("user_id", userId);
      }

      params.set("page", currentPage.toString());
      params.set("limit", hotelsPerPage.toString());

      if (debouncedSearchText && debouncedSearchText.trim()) {
        params.set("search", debouncedSearchText.trim());
      }

      if (selectedFacilities.length > 0) {
        params.set("facilities", selectedFacilities.join(","));
      }

      if (sortBy && sortBy !== "") {
        params.set("sort", sortBy);
      }

      // ✅ Build API URL manually for price and rating
      let apiUrl = `${base_url}/user/hotels/get_all_hotels.php?${params.toString()}`;

      // ✅ Handle multiple price ranges - append without encoding
      if (selectedPriceRanges && selectedPriceRanges.length > 0) {
        const sortedRanges = [...selectedPriceRanges].sort(
          (a, b) => a.min - b.min
        );
        const minPrices = sortedRanges.map((r) => r.min).join(",");
        const maxPrices = sortedRanges.map((r) => r.max).join(",");
        apiUrl += `&price_min=${minPrices}&price_max=${maxPrices}`;
      }

      // ✅ Handle ratings - only use rating_max if different
      if (selectedRatings.length > 0) {
        const ratingValues = selectedRatings.map((r) => parseFloat(r));
        const minRating = Math.min(...ratingValues);
        const maxRating = Math.max(...ratingValues);

        apiUrl += `&rating_min=${minRating}`;

        // ✅ Only add rating_max if different from rating_min
        if (maxRating !== minRating) {
          apiUrl += `&rating_max=${maxRating}`;
        }
      }

      console.log("Fetching Hotels:", apiUrl);

      const response = await axios.get(apiUrl);

      if (response?.data?.status === "success") {
        const data = response.data;

        setTotalPages(parseInt(data.total_pages) || 1);
        setTotalItems(parseInt(data.total_items) || 0);

        const hotelsWithFav = data.message.map((hotel) => ({
          ...hotel,
          is_fav: hotel?.is_fav || false,
        }));

        setHotels(hotelsWithFav || []);
        setError(null);
      } else {
        setHotels([]);
        setTotalPages(1);
        setTotalItems(0);
        setError("No hotels available at the moment");
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to load hotels");
      setHotels([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    currentPage,
    hotelsPerPage,
    debouncedSearchText,
    selectedRatings,
    selectedFacilities,
    selectedPriceRanges,
    sortBy,
  ]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (userId) {
        params.set("user_id", userId);
      }

      params.set("page", "1");
      params.set("limit", "1000");

      const response = await axios.get(
        `${base_url}/user/hotels/get_all_hotels.php?${params.toString()}`
      );

      if (response?.data?.status === "success") {
        const allHotels = response.data.message;

        const ratingsSet = new Set();
        allHotels.forEach((hotel) => {
          if (hotel.ratings && hotel.ratings.length > 0) {
            const score = hotel.ratings[0].score;
            const rounded = Math.round(score * 2) / 2;
            ratingsSet.add(rounded.toString());
          }
        });
        setAvailableRatings(
          Array.from(ratingsSet).sort((a, b) => parseFloat(b) - parseFloat(a))
        );

        const facilitiesSet = new Set();
        allHotels.forEach((hotel) => {
          if (hotel.amenities && hotel.amenities.length > 0) {
            hotel.amenities.forEach((amenity) => {
              if (amenity.id && amenity.name) {
                facilitiesSet.add(
                  JSON.stringify({ id: amenity.id, name: amenity.name })
                );
              }
            });
          }
        });
        setAvailableFacilities(
          Array.from(facilitiesSet).map((item) => JSON.parse(item))
        );
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    updateURLParams({ search: debouncedSearchText, page: 1 });
  }, [debouncedSearchText]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = useCallback(
    (range) => {
      // Check if this range is already selected
      const isSelected = selectedPriceRanges.some(
        (r) => r.min === range.min && r.max === range.max
      );

      let newRanges;
      if (isSelected) {
        // Remove the range
        newRanges = selectedPriceRanges.filter(
          (r) => !(r.min === range.min && r.max === range.max)
        );
      } else {
        // Add the range
        newRanges = [
          ...selectedPriceRanges,
          { min: range.min, max: range.max },
        ];
      }

      setSelectedPriceRanges(newRanges);
      setCurrentPage(1);
      updateURLParams({
        page: 1,
        priceRanges: newRanges,
      });
    },
    [selectedPriceRanges, updateURLParams]
  );

  const handleRatingChange = useCallback(
    (rating) => {
      const ratingStr = rating.toString();
      const newRatings = selectedRatings.includes(ratingStr)
        ? selectedRatings.filter((r) => r !== ratingStr)
        : [...selectedRatings, ratingStr];

      setSelectedRatings(newRatings);
      setCurrentPage(1);
      updateURLParams({
        page: 1,
        ratings: newRatings,
      });
    },
    [selectedRatings, updateURLParams]
  );

  const handleFacilityChange = useCallback(
    (facilityId) => {
      const newFacilities = selectedFacilities.includes(facilityId)
        ? selectedFacilities.filter((f) => f !== facilityId)
        : [...selectedFacilities, facilityId];

      setSelectedFacilities(newFacilities);
      setCurrentPage(1);
      updateURLParams({
        page: 1,
        facilities: newFacilities,
      });
    },
    [selectedFacilities, updateURLParams]
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

  const clearAllFilters = useCallback(() => {
    setSearchText("");
    setSelectedRatings([]);
    setSelectedFacilities([]);
    setMinPrice("");
    setSelectedPriceRanges([]);

    setMaxPrice("");
    // ✅ لا نقوم بإعادة تعيين السورت
    setCurrentPage(1);

    isUpdatingURL.current = true;
    // ✅ نحتفظ بالسورت في الـ URL
    const params = {};
    if (sortBy && sortBy !== "") {
      params.sort = sortBy;
    }
    const queryString = params.sort ? `?sort=${params.sort}` : "";
    const newURL = `${pathname}${queryString}`;
    window.history.replaceState(null, "", newURL);
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [pathname, sortBy]);

  const handlePageChange = useCallback(
    (pageNumber) => {
      if (
        pageNumber >= 1 &&
        pageNumber <= totalPages &&
        pageNumber !== currentPage
      ) {
        setCurrentPage(pageNumber);
        updateURLParams({ page: pageNumber });
        window.scrollTo({ top: 300, behavior: "smooth" });
      }
    },
    [totalPages, currentPage, updateURLParams]
  );

  const handleToggleFavorite = async (hotelId, currentStatus) => {
    setAnimatedId(hotelId);

    const result = await toggleWishlist(hotelId, "hotel", currentStatus);

    if (result.success) {
      setHotels((prevHotels) =>
        prevHotels.map((hotel) =>
          hotel.id === hotelId ? { ...hotel, is_fav: result.is_fav } : hotel
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

  const shareOnFacebook = (hotel) => {
    const url = `${window.location.origin}/hotel-suits/hotel-details?hotel=${hotel.id}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
    closeShareModal();
  };

  const shareOnWhatsapp = (hotel) => {
    const url = `${window.location.origin}/hotel-suits/hotel-details?hotel=${hotel.id}`;
    const message = `Check out this amazing hotel: ${hotel.title} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    closeShareModal();
  };

  const copyToClipboard = (hotel) => {
    const url = `${window.location.origin}/hotel-suits/hotel-details?hotel=${hotel.id}`;
    navigator.clipboard.writeText(url).then(() => {
      closeShareModal();
    });
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="bi bi-star-fill" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="bi bi-star-half" />);
      } else {
        stars.push(<i key={i} className="bi bi-star" />);
      }
    }

    return stars;
  };

  const hasActiveFilters =
    searchText ||
    selectedRatings.length > 0 ||
    selectedFacilities.length > 0 ||
    selectedPriceRanges.length > 0;

  const activeFiltersCount =
    selectedRatings.length +
    selectedFacilities.length +
    selectedPriceRanges.length;

  // ✅ Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="single-widget mb-30">
          <button
            onClick={() => {
              clearAllFilters();
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(false);
              }
            }}
            className="w-full px-6 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold flex items-center justify-center gap-2"
          >
            <i className="bi bi-x-circle"></i>
            <span>Clear All Filters ({activeFiltersCount})</span>
          </button>
        </div>
      )}

      {/* Price Range Filter */}

      <div className="single-widget mb-30">
        <h5 className="widget-title">Filter by Price</h5>
        <div className="checkbox-container">
          <ul>
            {priceRanges.map((range) => {
              // ✅ Check if this range is in selectedPriceRanges
              const isSelected = selectedPriceRanges.some(
                (r) => r.min === range.min && r.max === range.max
              );
              return (
                <li key={range.id}>
                  <label className="containerss">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        handlePriceRangeChange(range);
                        if (window.innerWidth < 1024) {
                          setTimeout(() => setIsMobileSidebarOpen(false), 300);
                        }
                      }}
                    />
                    <span className="checkmark" />
                    <span className="text">{range.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="single-widget mb-30">
        <h5 className="widget-title">Star Rating</h5>
        <div className="checkbox-container">
          <ul>
            {ratingOptions.map((rating) => {
              const isSelected = selectedRatings.includes(rating.id);
              return (
                <li key={rating.id}>
                  <label className="containerss">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        handleRatingChange(rating.id);
                        if (window.innerWidth < 1024) {
                          setTimeout(() => setIsMobileSidebarOpen(false), 300);
                        }
                      }}
                    />
                    <span className="checkmark" />
                    <span className="text">
                      {rating.label}
                      <span className="ms-2">
                        {[...Array(Math.floor(rating.value))].map((_, i) => (
                          <i
                            key={i}
                            className="bi bi-star-fill text-warning"
                            style={{ fontSize: "12px" }}
                          />
                        ))}
                        {rating.value % 1 !== 0 && (
                          <i
                            className="bi bi-star-half text-warning"
                            style={{ fontSize: "12px" }}
                          />
                        )}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Breadcrumb pagename="Room & Suits" pagetitle="Room & Suits" />
      <div className="room-suits-page pt-[60px] mb-[60px]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ✅ Main Content */}
            <div className="lg:col-span-2 order-1">
              {/* ✅ Header with Results Info, Sort and Filter Button */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h5 className="text-xl font-semibold mb-1">
                    {hotels.length} {hotels.length === 1 ? "Hotel" : "Hotels"}{" "}
                    Found
                  </h5>
                  <small className="text-gray-500">
                    Page {currentPage} of {totalPages} • Total: {totalItems}{" "}
                    hotels
                  </small>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* ✅ Ant Design Select for Sort */}
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="min-w-[180px]"
                    size="large"
                    options={SORT_OPTIONS}
                    placeholder="Sort By"
                  />

                  {/* ✅ Mobile Filter Button */}
                  <button
                    className="lg:hidden px-6 py-3 bg-[#295557] text-white rounded-lg hover:bg-[#e8a355] transition-colors duration-300 flex items-center gap-2 font-semibold"
                    onClick={() => setIsMobileSidebarOpen(true)}
                  >
                    <i className="bi bi-funnel"></i>
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {hasActiveFilters && (
                    <button
                      className="hidden md:block px-4 py-2 text-sm border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-300"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* ✅ Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#295557] rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading hotels...</p>
                </div>
              )}

              {/* ✅ Error State */}
              {!loading && error && hotels.length === 0 && (
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

              {/* ✅ Hotels List */}
              {!loading && hotels.length === 0 && !error ? (
                <div className="text-center py-12">
                  <i className="bi bi-search text-5xl text-gray-400 mb-4 block"></i>
                  <h4 className="text-2xl font-semibold mb-3">
                    No hotels found matching your criteria
                  </h4>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters to see more results.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-3 bg-[#295557] text-white rounded-lg hover:bg-[#e8a355] transition-colors duration-300"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                !loading &&
                hotels.map((hotel) => (
                  <div key={hotel.id} className="room-suits-card mb-30">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                      <div className="md:col-span-4">
                        <div className="hotel-img-wrapper h-full">
                          <Swiper
                            {...settings}
                            className="swiper hotel-img-slider"
                          >
                            <span className="batch">
                              {hotel.duration || "Breakfast included"}
                            </span>
                            <div className="swiper-wrapper">
                              <SwiperSlide className="swiper-slide">
                                <div className="room-img">
                                  <img
                                    src={hotel.image?.split("//CAMP//")[0]}
                                    alt={hotel.title}
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/400x300/f0f0f0/666666?text=Hotel+Image";
                                    }}
                                  />
                                </div>
                              </SwiperSlide>
                            </div>
                            <div className="swiper-pagination5" />
                          </Swiper>

                          {/* Favorite Button */}
                          <div
                            className={`favorite-btn ${
                              hotel.is_fav ? "active" : ""
                            } ${animatedId === hotel.id ? "animate" : ""} ${
                              isLoading(hotel.id) ? "loading" : ""
                            } ${!isUserLoggedIn ? "disabled" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLoading(hotel.id) && isUserLoggedIn) {
                                handleToggleFavorite(hotel.id, hotel.is_fav);
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

                          {/* Share Button */}
                          <div
                            className="share-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleShareModal(hotel.id);
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
                              (shareModalRefs.current[hotel.id] = el)
                            }
                            className={`share-options ${
                              shareModalOpen === hotel.id ? "show" : ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="share-option facebook"
                              onClick={() => shareOnFacebook(hotel)}
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
                              onClick={() => shareOnWhatsapp(hotel)}
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
                              onClick={() => copyToClipboard(hotel)}
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
                        </div>
                      </div>
                      <div className="md:col-span-8">
                        <div className="room-content">
                          <div className="content-top">
                            <div className="reviews">
                              <ul className="flex gap-1">
                                {hotel.avg_rating
                                  ? renderStarRating(hotel.avg_rating)
                                  : renderStarRating(4.5)}
                              </ul>
                              <span className="text-gray-500 text-sm">
                                {hotel.avg_rating
                                  ? `${hotel.avg_rating} reviews`
                                  : "4.5 reviews"}
                              </span>
                            </div>
                            <h5>
                              <Link
                                href={`hotel-suits/hotel-details?hotel=${hotel.id}`}
                              >
                                {hotel.title}
                              </Link>
                            </h5>
                            <ul className="loaction-area">
                              <li>
                                <i className="bi bi-geo-alt" />
                                {hotel.location ||
                                  hotel.country_name ||
                                  "Location not specified"}
                              </li>
                            </ul>

                            {/* Display amenities */}
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="amenities-tags mt-2 flex flex-wrap gap-1">
                                {hotel.amenities
                                  .filter((a) => a.name)
                                  .slice(0, 4)
                                  .map((amenity, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                    >
                                      {amenity.name}
                                    </span>
                                  ))}
                                {hotel.amenities.filter((a) => a.name).length >
                                  4 && (
                                  <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
                                    +
                                    {hotel.amenities.filter((a) => a.name)
                                      .length - 4}{" "}
                                    more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="content-bottom">
                            <div className="room-type"></div>
                            <div className="price-and-book">
                              <div className="price-area">
                                <p>
                                  {`1 night, ${hotel.adults_num} adults` ||
                                    "1 night, 2 adults"}
                                </p>
                                <span className="text-[#295557] font-bold text-lg">
                                  {hotel.price_currency}
                                  {hotel.price_current}
                                  {hotel.price_original &&
                                    hotel.price_original >
                                      hotel.price_current && (
                                      <del className="text-gray-400 ml-2">
                                        {" "}
                                        {hotel.price_currency}
                                        {hotel.price_original}
                                      </del>
                                    )}
                                </span>
                              </div>
                              <div className="book-btn">
                                <Link
                                  href={`hotel-suits/hotel-details?hotel=${hotel.id}`}
                                  className="primary-btn2"
                                >
                                  Check Availability
                                  <i className="bi bi-arrow-right" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* ✅ Pagination */}
              {!loading && hotels.length > 0 && totalPages > 1 && (
                <div className="w-full mt-[70px]">
                  <nav className="inner-pagination-area flex justify-center">
                    <ul className="pagination-list flex items-center gap-2">
                      {/* Previous Button */}
                      <li>
                        <button
                          className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                            currentPage === 1
                              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                              : "hover:bg-[#295557] hover:text-white bg-white text-gray-700"
                          }`}
                          onClick={() => {
                            if (currentPage > 1)
                              handlePageChange(currentPage - 1);
                          }}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left" />
                        </button>
                      </li>

                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(
                          1,
                          currentPage - Math.floor(maxVisiblePages / 2)
                        );
                        let endPage = Math.min(
                          totalPages,
                          startPage + maxVisiblePages - 1
                        );

                        if (endPage - startPage < maxVisiblePages - 1) {
                          startPage = Math.max(
                            1,
                            endPage - maxVisiblePages + 1
                          );
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <li key={i}>
                              <button
                                className={`min-w-[40px] px-4 py-2 rounded-lg border transition-colors duration-300 ${
                                  currentPage === i
                                    ? "bg-[#295557] text-white border-[#295557]"
                                    : "bg-white text-gray-700 hover:bg-[#e8a355] hover:text-white hover:border-[#e8a355]"
                                }`}
                                onClick={() => handlePageChange(i)}
                              >
                                {i}
                              </button>
                            </li>
                          );
                        }
                        return pages;
                      })()}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <li>
                          <span className="px-4 py-2 text-gray-400">
                            <i className="bi bi-three-dots" />
                          </span>
                        </li>
                      )}

                      {/* Next Button */}
                      <li>
                        <button
                          className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                            currentPage === totalPages
                              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                              : "hover:bg-[#295557] hover:text-white bg-white text-gray-700"
                          }`}
                          onClick={() => {
                            if (currentPage < totalPages)
                              handlePageChange(currentPage + 1);
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <i className="bi bi-chevron-right" />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* ✅ Desktop Sidebar - Sticky */}
            <div className="hidden lg:block lg:col-span-1 order-2">
              <div className="sidebar-area sticky-sidebar">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 lg:hidden ${
          isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      {/* ✅ Mobile Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-[350px] bg-white z-[9999] transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${
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
        <div className="flex-1 overflow-y-auto">
          <div className="sidebar-area p-4">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
