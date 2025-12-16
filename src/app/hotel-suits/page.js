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
import RoomSidebar from "@/components/sidebar/RoomSidebar";
import Link from "next/link";
import axios from "axios";
import { base_url } from "../../uitils/base_url";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/hooks/useWishlist";
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

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [animatedId, setAnimatedId] = useState(null);

  // ✅ Flag to prevent URL sync loop
  const isUpdatingURL = useRef(false);

  // ✅ Available filter options (populated from initial fetch)
  const [availableRatings, setAvailableRatings] = useState([]);
  const [availableFacilities, setAvailableFacilities] = useState([]);

  // Initialize pagination from URL params
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

  // ✅ Filter states - Initialize from URL params
  const [searchText, setSearchText] = useState(() => {
    return searchParams.get("search") || "";
  });

  const [minPrice, setMinPrice] = useState(() => {
    const minPriceParam = searchParams.get("min_price");
    return minPriceParam ? parseFloat(minPriceParam) : "";
  });

  const [maxPrice, setMaxPrice] = useState(() => {
    const maxPriceParam = searchParams.get("max_price");
    return maxPriceParam ? parseFloat(maxPriceParam) : "";
  });

  const [selectedRatings, setSelectedRatings] = useState(() => {
    const ratingsParam = searchParams.get("rating_min");
    return ratingsParam ? ratingsParam.split(",").filter(Boolean) : [];
  });

  const [selectedFacilities, setSelectedFacilities] = useState(() => {
    const facilitiesParam = searchParams.get("facilities");
    return facilitiesParam ? facilitiesParam.split(",").filter(Boolean) : [];
  });

  const debouncedSearchText = useDebounce(searchText, 1500);

  const shareModalRefs = useRef({});

  const priceRanges = [
    { id: "under100", label: "Under $100/night", min: 0, max: 100 },
    { id: "100to200", label: "$100 - $200/night", min: 100, max: 200 },
    { id: "200to500", label: "$200 - $500/night", min: 200, max: 500 },
    { id: "over500", label: "$500+/night", min: 500, max: 10000 },
  ];

  // Rating options
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

  const updateURLParams = useCallback(
    (options = {}) => {
      const {
        page = currentPage,
        limit = hotelsPerPage,
        search = debouncedSearchText,
        ratings = selectedRatings,
        facilities = selectedFacilities,
        min_price = minPrice,
        max_price = maxPrice,
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

      if (ratings && ratings.length > 0) {
        params.set("rating_min", ratings.join(","));
      }

      if (facilities && facilities.length > 0) {
        params.set("facilities", facilities.join(","));
      }

      if (min_price !== "" && min_price !== null && min_price >= 0) {
        params.set("min_price", min_price.toString());
      }

      if (max_price !== "" && max_price !== null && max_price > 0) {
        params.set("max_price", max_price.toString());
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
      hotelsPerPage,
      debouncedSearchText,
      selectedRatings,
      selectedFacilities,
      minPrice,
      maxPrice,
    ]
  );

  useEffect(() => {
    if (isUpdatingURL.current) return;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchParam = searchParams.get("search");
    const ratingsParam = searchParams.get("rating_min");
    const facilitiesParam = searchParams.get("facilities");
    const minPriceParam = searchParams.get("min_price");
    const maxPriceParam = searchParams.get("max_price");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 10;
    const newSearch = searchParam || "";
    const newRatings = ratingsParam
      ? ratingsParam.split(",").filter(Boolean)
      : [];
    const newFacilities = facilitiesParam
      ? facilitiesParam.split(",").filter(Boolean)
      : [];
    const newMinPrice = minPriceParam ? parseFloat(minPriceParam) : "";
    const newMaxPrice = maxPriceParam ? parseFloat(maxPriceParam) : "";

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== hotelsPerPage) setHotelsPerPage(newLimit);
    if (newSearch !== searchText) setSearchText(newSearch);
    if (JSON.stringify(newRatings) !== JSON.stringify(selectedRatings)) {
      setSelectedRatings(newRatings);
    }
    if (JSON.stringify(newFacilities) !== JSON.stringify(selectedFacilities)) {
      setSelectedFacilities(newFacilities);
    }
    if (newMinPrice !== minPrice) setMinPrice(newMinPrice);
    if (newMaxPrice !== maxPrice) setMaxPrice(newMaxPrice);
  }, [searchParams]);

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

  // ✅ Fetch hotels with filters in API GET params
  const fetchHotels = useCallback(async () => {
    // if (!userId) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (userId) {
        params.set("user_id", userId);
      }

      params.set("page", currentPage.toString());
      params.set("limit", hotelsPerPage.toString());

      // ✅ Add search filter
      if (debouncedSearchText && debouncedSearchText.trim()) {
        params.set("search", debouncedSearchText.trim());
      }

      if (selectedRatings.length > 0) {
        params.set("rating_min", selectedRatings.join(","));
      }

      // ✅ Add facilities filter (comma-separated)
      if (selectedFacilities.length > 0) {
        params.set("facilities", selectedFacilities.join(","));
      }

      // ✅ Add price filters
      if (minPrice !== "" && minPrice !== null && minPrice >= 0) {
        params.set("min_price", minPrice.toString());
      }

      if (maxPrice !== "" && maxPrice !== null && maxPrice > 0) {
        params.set("max_price", maxPrice.toString());
      }

      const apiUrl = `${base_url}/user/hotels/get_all_hotels.php?${params.toString()}`;
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
    minPrice,
    maxPrice,
  ]);

  // ✅ Fetch filter options on mount (all hotels without filters)
  const fetchFilterOptions = useCallback(async () => {
    // if (!userId) return;

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

        // Extract unique ratings
        const ratingsSet = new Set();
        allHotels.forEach((hotel) => {
          if (hotel.ratings && hotel.ratings.length > 0) {
            const score = hotel.ratings[0].score;
            // Round to nearest 0.5
            const rounded = Math.round(score * 2) / 2;
            ratingsSet.add(rounded.toString());
          }
        });
        setAvailableRatings(
          Array.from(ratingsSet).sort((a, b) => parseFloat(b) - parseFloat(a))
        );

        // Extract unique facilities
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

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // ✅ Fetch hotels when filters change
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // ✅ Update URL when debounced search changes
  useEffect(() => {
    updateURLParams({ search: debouncedSearchText, page: 1 });
  }, [debouncedSearchText]);

  // ✅ Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  // ✅ Handle price range change
  const handlePriceRangeChange = useCallback(
    (range) => {
      if (minPrice === range.min && maxPrice === range.max) {
        // Toggle off
        setMinPrice("");
        setMaxPrice("");
        setCurrentPage(1);
        updateURLParams({
          page: 1,
          min_price: "",
          max_price: "",
        });
      } else {
        // Select new range
        setMinPrice(range.min);
        setMaxPrice(range.max);
        setCurrentPage(1);
        updateURLParams({
          page: 1,
          min_price: range.min,
          max_price: range.max,
        });
      }
    },
    [minPrice, maxPrice, updateURLParams]
  );

  // ✅ Handle rating change
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

  // ✅ Handle facility change
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

  // ✅ Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchText("");
    setSelectedRatings([]);
    setSelectedFacilities([]);
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);

    isUpdatingURL.current = true;
    window.history.replaceState(null, "", pathname);
    setTimeout(() => {
      isUpdatingURL.current = false;
    }, 100);
  }, [pathname]);

  // Handle page change
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

  // Toggle favorite
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

  // Share Modal Functions
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

  // Render star ratings
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

  // Check if any filters are active
  const hasActiveFilters =
    searchText ||
    selectedRatings.length > 0 ||
    selectedFacilities.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "";

  // Pagination
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;

  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i}>
          <a
            href="#"
            className={currentPage === i ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </a>
        </li>
      );
    }

    return pageNumbers;
  };

  return (
    <>
      <Breadcrumb pagename="Room & Suits" pagetitle="Room & Suits" />
      <div className="room-suits-page pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-xl-4 order-lg-1 order-2">
              <div className="sidebar-area">
                {/* ✅ Search Box with Debounce */}
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Search Hotels</h5>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by name, location..."
                      value={searchText}
                      onChange={handleSearchChange}
                    />
                    <button type="button">
                      <i className="bx bx-search" />
                    </button>
                  </div>
                  {searchText && (
                    <small className="text-muted mt-1 d-block">
                      Searching for "{searchText}"...
                    </small>
                  )}
                </div>

                {/* ✅ Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="single-widget mb-30">
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-outline-danger w-100"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* ✅ Price Range Filter */}
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Filter by Price</h5>
                  <div className="checkbox-container">
                    <ul>
                      {priceRanges.map((range) => {
                        const isSelected =
                          minPrice === range.min && maxPrice === range.max;
                        return (
                          <li key={range.id}>
                            <label className="containerss">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePriceRangeChange(range)}
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

                {/* ✅ Rating Filter */}
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
                                onChange={() => handleRatingChange(rating.id)}
                              />
                              <span className="checkmark" />
                              <span className="text">
                                {rating.label}
                                <span className="ms-2">
                                  {[...Array(Math.floor(rating.value))].map(
                                    (_, i) => (
                                      <i
                                        key={i}
                                        className="bi bi-star-fill text-warning"
                                        style={{ fontSize: "12px" }}
                                      />
                                    )
                                  )}
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

                {/* ✅ Facilities Filter */}
                {/* {availableFacilities.length > 0 && (
                  <div className="single-widget mb-30">
                    <h5 className="widget-title">Facilities</h5>
                    <div className="checkbox-container">
                      <ul>
                        {availableFacilities.map((facility) => {
                          const isSelected = selectedFacilities.includes(
                            facility.id
                          );
                          return (
                            <li key={facility.id}>
                              <label className="containerss">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handleFacilityChange(facility.id)
                                  }
                                />
                                <span className="checkmark" />
                                <span className="text">{facility.name}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            <div className="col-xl-8 order-lg-2 order-1">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading hotels...</p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && hotels.length === 0 && (
                <div className="text-center py-5">
                  <div className="alert alert-warning" role="alert">
                    {error}
                  </div>
                  <button
                    className="btn btn-warning"
                    onClick={() => fetchHotels()}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Results Info */}
              {!loading && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-0">
                      {hotels.length} {hotels.length === 1 ? "Hotel" : "Hotels"}{" "}
                      Found
                    </h5>
                    <small className="text-muted">
                      Page {currentPage} of {totalPages}
                    </small>
                  </div>
                  <div>
                    <small className="text-muted">
                      Total: {totalItems} hotels available
                    </small>
                  </div>
                </div>
              )}

              {/* Hotels List */}
              {!loading && hotels.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                  <h4>No hotels found matching your criteria</h4>
                  <p className="text-muted mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-primary"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                !loading && (
                  <>
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="room-suits-card mb-30">
                        <div className="row g-0">
                          <div className="col-md-4">
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
                                  if (!isLoading(hotel.id)) {
                                    handleToggleFavorite(
                                      hotel.id,
                                      hotel.is_fav
                                    );
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
                          <div className="col-md-8">
                            <div className="room-content">
                              <div className="content-top">
                                <div className="reviews">
                                  <ul>
                                    {hotel.ratings && hotel.ratings.length > 0
                                      ? renderStarRating(hotel.ratings[0].score)
                                      : renderStarRating(4.5)}
                                  </ul>
                                  <span>
                                    {hotel.ratings && hotel.ratings.length > 0
                                      ? `${hotel.ratings[0].score} reviews`
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
                                {hotel.amenities &&
                                  hotel.amenities.length > 0 && (
                                    <div className="amenities-tags mt-2">
                                      {hotel.amenities
                                        .filter((a) => a.name)
                                        .slice(0, 4)
                                        .map((amenity, idx) => (
                                          <span
                                            key={idx}
                                            className="badge bg-light text-dark me-1 mb-1"
                                            style={{ fontSize: "0.75rem" }}
                                          >
                                            {amenity.name}
                                          </span>
                                        ))}
                                      {hotel.amenities.filter((a) => a.name)
                                        .length > 4 && (
                                        <span
                                          className="badge bg-secondary"
                                          style={{ fontSize: "0.75rem" }}
                                        >
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
                                    <span>
                                      {hotel.price_currency}
                                      {hotel.price_current}
                                      {hotel.price_original &&
                                        hotel.price_original >
                                          hotel.price_current && (
                                          <del>
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
                    ))}
                  </>
                )
              )}

              {/* Pagination */}
              {!loading && hotels.length > 0 && totalPages > 1 && (
                <div className="row mt-70">
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
                              if (currentPage > 1)
                                handlePageChange(currentPage - 1);
                            }}
                          >
                            <i className="bi bi-chevron-left" />
                          </a>
                        </li>

                        {renderPaginationNumbers()}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <li>
                            <span className="pagination-dots">
                              <i className="bi bi-three-dots" />
                            </span>
                          </li>
                        )}

                        <li>
                          <a
                            href="#"
                            className={`shop-pagi-btn ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages)
                                handlePageChange(currentPage + 1);
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
