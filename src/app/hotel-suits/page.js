"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import axios from "axios";
import { base_url } from "../../uitils/base_url";
import { Select } from "antd";
// import { TourCard } from "./components/common/TourCard";
import "./style.css";
import TourCard from "../../components/facilitySlide/Cards/TourCard";

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

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "rating_low", label: "Lowest Rated" },
  { value: "newest", label: "Newest First" },
];

const getCurrencySymbol = (currency) => {
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  if (currency === "AED") return "AED ";
  if (currency === "SAR") return "SAR ";
  return currency || "$";
};

const getFirstImage = (image) => {
  if (Array.isArray(image)) return getFirstImage(image[0]);
  if (typeof image === "string") {
    return image?.split("//CAMP//")[0] || "";
  }
  return "";
};

const Page = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

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

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isUpdatingURL = useRef(false);

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

  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get("sort") || "";
  });

  const debouncedSearchText = useDebounce(searchText, 1500);

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

      let baseURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      const additionalParams = [];

      if (priceRanges && priceRanges.length > 0) {
        const sortedRanges = [...priceRanges].sort((a, b) => a.min - b.min);
        const minPrices = sortedRanges.map((r) => r.min).join(",");
        const maxPrices = sortedRanges.map((r) => r.max).join(",");
        additionalParams.push(`price_min=${minPrices}`);
        additionalParams.push(`price_max=${maxPrices}`);
      }

      if (ratings && ratings.length > 0) {
        const ratingValues = ratings.map((r) => parseFloat(r));
        const minRating = Math.min(...ratingValues);
        const maxRating = Math.max(...ratingValues);

        additionalParams.push(`rating_min=${minRating}`);

        if (maxRating !== minRating) {
          additionalParams.push(`rating_max=${maxRating}`);
        }
      }

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

    let newRatings = [];
    if (ratingsMinParam) {
      const minRating = parseFloat(ratingsMinParam);
      const maxRating = ratingsMaxParam
        ? parseFloat(ratingsMaxParam)
        : minRating;

      newRatings = ratingOptions
        .filter((r) => r.value >= minRating && r.value <= maxRating)
        .map((r) => r.id);
    }

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
  }, [
    searchParams,
    currentPage,
    hotelsPerPage,
    searchText,
    sortBy,
    selectedRatings,
    selectedFacilities,
    selectedPriceRanges,
    ratingOptions,
  ]);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const id = userData.id || userData.user_id;
        if (id) {
          setUserId(id);
          setIsUserLoggedIn(true);
        } else {
          setIsUserLoggedIn(false);
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

      let apiUrl = `${base_url}/user/hotels/get_all_hotels.php?${params.toString()}`;

      if (selectedPriceRanges && selectedPriceRanges.length > 0) {
        const sortedRanges = [...selectedPriceRanges].sort(
          (a, b) => a.min - b.min
        );
        const minPrices = sortedRanges.map((r) => r.min).join(",");
        const maxPrices = sortedRanges.map((r) => r.max).join(",");
        apiUrl += `&price_min=${minPrices}&price_max=${maxPrices}`;
      }

      if (selectedRatings.length > 0) {
        const ratingValues = selectedRatings.map((r) => parseFloat(r));
        const minRating = Math.min(...ratingValues);
        const maxRating = Math.max(...ratingValues);

        apiUrl += `&rating_min=${minRating}`;

        if (maxRating !== minRating) {
          apiUrl += `&rating_max=${maxRating}`;
        }
      }

      const response = await axios.get(apiUrl);

      if (response?.data?.status === "success") {
        const data = response.data;

        setTotalPages(parseInt(data.total_pages) || 1);
        setTotalItems(parseInt(data.total_items) || 0);

        const hotelsWithFav = (data.message || []).map((hotel) => ({
          ...hotel,
          is_fav: hotel?.is_fav || false,
        }));

        setHotels(hotelsWithFav);
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

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    updateURLParams({ search: debouncedSearchText, page: 1 });
  }, [debouncedSearchText, updateURLParams]);

  const handlePriceRangeChange = useCallback(
    (range) => {
      const isSelected = selectedPriceRanges.some(
        (r) => r.min === range.min && r.max === range.max
      );

      let newRanges;
      if (isSelected) {
        newRanges = selectedPriceRanges.filter(
          (r) => !(r.min === range.min && r.max === range.max)
        );
      } else {
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
    setSelectedPriceRanges([]);
    setCurrentPage(1);

    isUpdatingURL.current = true;
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

  const mapHotelToTourCardItem = useCallback(
    (hotel) => {
      const detailsHref = `/hotel-suits/hotel-details?hotel=${hotel.id}`;
      const currentPrice = parseFloat(hotel?.price_current || 0);
      const originalPrice = parseFloat(hotel?.price_original || 0);
      const currencySymbol = getCurrencySymbol(hotel?.price_currency);

      const uniqueLocations = [
        ...new Set([hotel?.location, hotel?.country_name].filter(Boolean)),
      ];

      const offerPercentage =
        originalPrice > currentPrice && currentPrice > 0
          ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
          : null;

      return {
        id: hotel.id,
        itemType: "hotel",
        is_fav: hotel.is_fav,
        isWishlistDisabled: !isUserLoggedIn,
        title: hotel.title,
        image: getFirstImage(hotel.image),
        detailsHref,
        priceLabel: "Per Night From:",
        price: `${"$"}${hotel.price_current || "0"}`,
        oldPrice:
          originalPrice > currentPrice ? `${"$"}${hotel.price_original}` : null,
        priceNote: hotel.adults_num
          ? `${hotel.adults_num} Adults`
          : "PER NIGHT",
        ctaLabel: "Book Now",
        offer_percentage: offerPercentage,
        // badgeLocations: uniqueLocations.slice(0, 2).map((label) => ({
        //   label,
        //   href: detailsHref,
        // })),
        cities: uniqueLocations.slice(0, 2).map((label) => ({
          label,
          href: detailsHref,
        })),
      };
    },
    [isUserLoggedIn]
  );

  const handleHotelFavoriteChange = useCallback((hotelId, nextValue) => {
    setHotels((prev) =>
      prev.map((hotel) =>
        String(hotel.id) === String(hotelId)
          ? { ...hotel, is_fav: nextValue }
          : hotel
      )
    );
  }, []);

  const hasActiveFilters =
    searchText ||
    selectedRatings.length > 0 ||
    selectedFacilities.length > 0 ||
    selectedPriceRanges.length > 0;

  const activeFiltersCount =
    selectedRatings.length +
    selectedFacilities.length +
    selectedPriceRanges.length;

  const SidebarContent = () => (
    <>
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

      <div className="single-widget mb-30">
        <h5 className="widget-title">Filter by Price</h5>
        <div className="checkbox-container">
          <ul>
            {priceRanges.map((range) => {
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
            <div className="lg:col-span-2 order-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h5 className="text-xl font-semibold mb-1">
                    {totalItems} {totalItems === 1 ? "Hotel" : "Hotels"} Found
                  </h5>
                  <small className="text-gray-500">
                    Page {currentPage} of {totalPages} • Total: {totalItems}{" "}
                    hotels
                  </small>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="min-w-[180px]"
                    size="large"
                    options={SORT_OPTIONS}
                    placeholder="Sort By"
                  />

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

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#295557] rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading hotels...</p>
                </div>
              )}

              {!loading && error && hotels.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                  <h4>No hotels found matching your criteria</h4>
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
                !loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hotels.map((hotel) => {
                      const cardItem = mapHotelToTourCardItem(hotel);

                      return (
                        <div key={hotel.id} className="h-full">
                          <TourCard
                            item={cardItem}
                            onFavoriteChange={(nextValue) =>
                              handleHotelFavoriteChange(hotel.id, nextValue)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {!loading && hotels.length > 0 && totalPages > 1 && (
                <div className="w-full mt-[70px]">
                  <nav className="inner-pagination-area flex justify-center">
                    <ul className="pagination-list flex items-center gap-2">
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

                      <li>
                        <button
                          className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                            currentPage === totalPages
                              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                              : "hover:bg-[#295557] hover:text-white bg-white text-gray-700"
                          }`}
                          onClick={() => {
                            if (currentPage < totalPages) {
                              handlePageChange(currentPage + 1);
                            }
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

            <div className="hidden lg:block lg:col-span-1 order-2">
              <div className="sidebar-area sticky-sidebar">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 lg:hidden ${
          isMobileSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-[350px] bg-white z-[9999] transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <h5 className="text-lg font-semibold m-0">Filters</h5>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

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
