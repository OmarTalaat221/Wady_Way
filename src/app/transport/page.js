"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Select } from "antd";

import axios from "axios";
import { useDispatch } from "react-redux";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFeatures, setAllFeatures] = useState([]);
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
  const isInitialLoad = useRef(true);

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

  const [searchText, setSearchText] = useState("");

  // Replace minPrice and maxPrice state with:
  const [selectedPriceRanges, setSelectedPriceRanges] = useState(() => {
    const minPriceParam = searchParams.get("price_min");
    const maxPriceParam = searchParams.get("price_max");

    if (minPriceParam && maxPriceParam) {
      const mins = minPriceParam.split(",").map(Number);
      const maxs = maxPriceParam.split(",").map(Number);

      const ranges = [];
      for (let i = 0; i < mins.length; i++) {
        if (!isNaN(mins[i]) && !isNaN(maxs[i])) {
          ranges.push({ min: mins[i], max: maxs[i] });
        }
      }
      return ranges;
    }
    return [];
  });

  const [selectedFeatures, setSelectedFeatures] = useState(() => {
    const featuresParam = searchParams.get("features");
    return featuresParam ? featuresParam.split(",").filter(Boolean) : [];
  });

  const [selectedCarTypes, setSelectedCarTypes] = useState(() => {
    const carTypeParam = searchParams.get("car_type");
    return carTypeParam ? carTypeParam.split(",").filter(Boolean) : [];
  });

  const [carTypes, setCarTypes] = useState([]);

  // Add after other state declarations
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get("sort") || "";
  });

  // ✅ Sort options from API
  const SORT_OPTIONS = [
    { value: "", label: "Default" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating_high", label: "Highest Rated" },
    { value: "rating_low", label: "Lowest Rated" },
    { value: "newest", label: "Newest First" },
  ];

  const priceRanges = [
    { id: "under50", label: "Under $50/day", min: 0, max: 50 },
    { id: "50to100", label: "$50 - $100/day", min: 50, max: 100 },
    { id: "100to200", label: "$100 - $200/day", min: 100, max: 200 },
    { id: "over200", label: "$200+/day", min: 200, max: 10000 },
  ];

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
        features = selectedFeatures,
        car_type = selectedCarTypes,
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

      if (features && features.length > 0) {
        params.set("features", features.join(","));
      }

      if (car_type && car_type.length > 0) {
        params.set("car_type", car_type.join(","));
      }

      if (sort && sort !== "") {
        params.set("sort", sort);
      }

      // ✅ Build URL manually for price to avoid encoding
      let baseURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      const additionalParams = [];

      // ✅ Handle multiple price ranges - without encoding
      if (priceRanges && priceRanges.length > 0) {
        const minPrices = priceRanges.map((r) => r.min).join(",");
        const maxPrices = priceRanges.map((r) => r.max).join(",");
        additionalParams.push(`price_min=${minPrices}`);
        additionalParams.push(`price_max=${maxPrices}`);
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
      itemsPerPage,
      selectedFeatures,
      selectedCarTypes,
      selectedPriceRanges,
      sortBy,
    ]
  );
  useEffect(() => {
    if (isUpdatingURL.current) return;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const featuresParam = searchParams.get("features");
    const carTypeParam = searchParams.get("car_type");
    const minPriceParam = searchParams.get("price_min");
    const maxPriceParam = searchParams.get("price_max");
    const sortParam = searchParams.get("sort");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 10;
    const newFeatures = featuresParam
      ? featuresParam.split(",").filter(Boolean)
      : [];
    const newCarTypes = carTypeParam
      ? carTypeParam.split(",").filter(Boolean)
      : [];
    const newSort = sortParam || "";

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
    if (newLimit !== itemsPerPage) setItemsPerPage(newLimit);
    if (newSort !== sortBy) setSortBy(newSort);
    if (JSON.stringify(newFeatures) !== JSON.stringify(selectedFeatures)) {
      setSelectedFeatures(newFeatures);
    }
    if (JSON.stringify(newCarTypes) !== JSON.stringify(selectedCarTypes)) {
      setSelectedCarTypes(newCarTypes);
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

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (userId) {
        params.set("user_id", userId);
      }
      params.set("page", currentPage.toString());
      params.set("limit", itemsPerPage.toString());

      if (selectedFeatures.length > 0) {
        params.set("features", selectedFeatures.join(","));
      }

      if (selectedCarTypes.length > 0) {
        params.set("car_type", selectedCarTypes.join(","));
      }

      if (sortBy && sortBy !== "") {
        params.set("sort", sortBy);
      }

      // ✅ Build API URL manually for price
      let apiUrl = `${base_url}/user/cars/select_car.php?${params.toString()}`;

      // ✅ Handle multiple price ranges - append without encoding
      if (selectedPriceRanges && selectedPriceRanges.length > 0) {
        const minPrices = selectedPriceRanges.map((r) => r.min).join(",");
        const maxPrices = selectedPriceRanges.map((r) => r.max).join(",");
        apiUrl += `&price_min=${minPrices}&price_max=${maxPrices}`;
      }

      console.log("Fetching:", apiUrl);

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status == "success" && data.message) {
        setTotalPages(parseInt(data.total_pages) || 1);
        setTotalItems(parseInt(data.total_items) || 0);

        // ✅ Use featurs_sort and type_sort from API response
        if (data.featurs_sort && Array.isArray(data.featurs_sort)) {
          setAllFeatures(data.featurs_sort);
        }

        if (data.type_sort && Array.isArray(data.type_sort)) {
          setCarTypes(data.type_sort);
        }

        const mappedCars = data.message.map((car) => ({
          id: car.id,
          name: car.title || car.name || "Car Rental",
          type: car.car_type || car.type || "Standard",
          background_image: car.background_image,
          image: car.image,
          location: car.location || "Location not specified",
          price_current: car.price_current || "0.00",
          price_original: car.price_original || car.price_current || "0.00",
          rating:
            car.avg_rating ||
            (car.ratings && car.ratings.length > 0
              ? car.ratings[0].score
              : 4.0),
          reviews: car.review_count || Math.floor(Math.random() * 200) + 50,
          features: car.features || [],
          is_fav: car?.is_fav || false,
        }));

        setCars(mappedCars);
        setError(null);
      } else {
        setCars([]);
        setTotalPages(1);
        setTotalItems(0);
        setError("No cars available at the moment");
      }
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError(err.message || "An unexpected error occurred");
      setCars([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [
    userId,
    currentPage,
    itemsPerPage,
    selectedFeatures,
    selectedCarTypes,
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
      params.set("limit", "10");

      const response = await axios.get(
        `${base_url}/user/cars/select_car.php?${params.toString()}`
      );
      const data = response.data;

      if (data.status == "success" && data.message) {
        const allCars = data.message;

        const featuresSet = new Set();
        allCars.forEach((car) => {
          if (car.features && Array.isArray(car.features)) {
            car.features.forEach((feature) => {
              featuresSet.add(feature);
            });
          }
        });
        setAllFeatures(Array.from(featuresSet).sort());

        const typesSet = new Set();
        allCars.forEach((car) => {
          const type = car.car_type || car.type;
          if (type) {
            typesSet.add(type);
          }
        });
        setCarTypes(Array.from(typesSet).sort());
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
        updateURLParams({ page });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, currentPage, updateURLParams]
  );

  const handleToggleFavorite = async (carId, currentStatus) => {
    setAnimatedId(carId);

    const result = await toggleWishlist(carId, "transport", currentStatus);

    if (result.success) {
      setCars((prevCars) =>
        prevCars.map((car) =>
          car.id === carId ? { ...car, is_fav: result.is_fav } : car
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

  const shareOnFacebook = (car) => {
    const url = `${window.location.origin}/transport/transport-details?id=${car.id}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
    closeShareModal();
  };

  const shareOnWhatsapp = (car) => {
    const url = `${window.location.origin}/transport/transport-details?id=${car.id}`;
    const message = `Check out this amazing car: ${car.name} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    closeShareModal();
  };

  const copyToClipboard = (car) => {
    const url = `${window.location.origin}/transport/transport-details?id=${car.id}`;
    navigator.clipboard.writeText(url).then(() => {
      closeShareModal();
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
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

  const handleSortChange = useCallback(
    (value) => {
      setSortBy(value);
      setCurrentPage(1);
      updateURLParams({ page: 1, sort: value });
    },
    [updateURLParams]
  );

  const handleFeatureChange = useCallback(
    (feature) => {
      const newFeatures = selectedFeatures.includes(feature)
        ? selectedFeatures.filter((f) => f !== feature)
        : [...selectedFeatures, feature];

      setSelectedFeatures(newFeatures);
      setCurrentPage(1);
      updateURLParams({
        page: 1,
        features: newFeatures,
      });
    },
    [selectedFeatures, updateURLParams]
  );

  const handleCarTypeChange = useCallback(
    (type) => {
      const newCarTypes = selectedCarTypes.includes(type)
        ? selectedCarTypes.filter((t) => t !== type)
        : [...selectedCarTypes, type];

      setSelectedCarTypes(newCarTypes);
      setCurrentPage(1);
      updateURLParams({
        page: 1,
        car_type: newCarTypes,
      });
    },
    [selectedCarTypes, updateURLParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchText("");
    setSelectedFeatures([]);
    setSelectedCarTypes([]);
    setSelectedPriceRanges([]); // ✅ Clear price ranges
    setCurrentPage(1);

    isUpdatingURL.current = true;
    // ✅ Keep sort in URL
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

  // ✅ Active filters count
  const hasActiveFilters =
    searchText ||
    selectedCarTypes.length > 0 ||
    selectedFeatures.length > 0 ||
    selectedPriceRanges.length > 0; // ✅ Changed

  const activeFiltersCount =
    selectedCarTypes.length +
    selectedFeatures.length +
    selectedPriceRanges.length; // ✅ Changed

  const filteredCars = useMemo(() => {
    let filtered = [...cars];

    if (searchText.trim()) {
      filtered = filtered.filter(
        (car) =>
          car.name.toLowerCase().includes(searchText.toLowerCase()) ||
          car.type.toLowerCase().includes(searchText.toLowerCase()) ||
          car.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [cars, searchText]);

  // ✅ Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Search Box */}
      {/* <div className="single-widget mb-30">
        <h5 className="widget-title">Search Here</h5>
        <form onSubmit={handleSearch}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by car name, type or location"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit">
              <i className="bx bx-search" />
            </button>
          </div>
        </form>
      </div> */}

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

      {/* Car Type Filter */}
      {carTypes.length > 0 && (
        <div className="single-widget mb-30">
          <h5 className="widget-title">Car Type</h5>
          <div className="checkbox-container">
            <ul>
              {carTypes.map((type) => {
                const isSelected = selectedCarTypes.includes(type);
                return (
                  <li key={type}>
                    <label className="containerss">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          handleCarTypeChange(type);
                          if (window.innerWidth < 1024) {
                            setTimeout(
                              () => setIsMobileSidebarOpen(false),
                              300
                            );
                          }
                        }}
                      />
                      <span className="checkmark" />
                      <span className="text">{type}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Car Features Filter */}
      {allFeatures.length > 0 && (
        <div className="single-widget mb-30">
          <h5 className="widget-title">Car Features</h5>
          <div className="checkbox-container">
            <ul>
              {allFeatures.map((feature) => {
                const isSelected = selectedFeatures.includes(feature);
                return (
                  <li key={feature}>
                    <label className="containerss">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          handleFeatureChange(feature);
                          if (window.innerWidth < 1024) {
                            setTimeout(
                              () => setIsMobileSidebarOpen(false),
                              300
                            );
                          }
                        }}
                      />
                      <span className="checkmark" />
                      <span className="text">{feature}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <Breadcrumb pagename="Transports" pagetitle="Transports" />

      <div className="transport-page pt-[50px] mb-[50px]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ✅ Main Content */}
            <div className="lg:col-span-2 order-1">
              {/* ✅ Header with Results Info and Filter Button */}
              {/* ✅ Header with Results Info, Sort and Filter Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h5 className="text-xl font-semibold mb-1">
                    {filteredCars.length}{" "}
                    {filteredCars.length === 1 ? "Car" : "Cars"} Found
                  </h5>
                  <small className="text-gray-500">
                    Page {currentPage} of {totalPages} • Total: {totalItems}{" "}
                    cars
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
                    className="primary-btn2 lg:hidden flex"
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
                  <p className="mt-4 text-gray-600">Loading cars...</p>
                </div>
              )}

              {/* ✅ Error State */}
              {!loading && error && cars.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                    No Cars Available
                  </h4>
                  <p className="text-yellow-700 mb-4">{error}</p>
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    onClick={() => fetchCars()}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* ✅ Cars Grid */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-[70px]">
                  {filteredCars.length > 0 ? (
                    filteredCars.map((car) => (
                      <div key={car?.id} className="transport-card">
                        <div className="transport-card-img-wrap">
                          <Link
                            href={`/transport/transport-details?id=${car?.id}`}
                            className="transport-img"
                          >
                            <img
                              src={car?.image}
                              alt={car?.name || "Car"}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x200/666/FFFFFF?text=No+Image";
                              }}
                            />
                            {car?.location && <span>{car.location}</span>}
                          </Link>

                          {/* Favorite Button */}
                          <div
                            className={`favorite-btn ${
                              car.is_fav ? "active" : ""
                            } ${animatedId === car.id ? "animate" : ""} ${
                              isLoading(car.id) ? "loading" : ""
                            } ${!isUserLoggedIn ? "disabled" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLoading(car.id) && isUserLoggedIn) {
                                handleToggleFavorite(car.id, car.is_fav);
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
                              e.stopPropagation();
                              toggleShareModal(car.id);
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
                            ref={(el) => (shareModalRefs.current[car.id] = el)}
                            className={`share-options ${
                              shareModalOpen === car.id ? "show" : ""
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="share-option facebook"
                              onClick={() => shareOnFacebook(car)}
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
                              onClick={() => shareOnWhatsapp(car)}
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
                              onClick={() => copyToClipboard(car)}
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

                        <div className="transport-content">
                          <h4 className="line-clamp-1">
                            <Link
                              href={`/transport/transport-details?id=${car?.id}`}
                            >
                              {`${car?.name || "Car Rental"} (${
                                car?.type || "Standard"
                              })`}
                            </Link>
                          </h4>

                          <div className="price-info mb-2">
                            <span className="current-price text-[#295557] font-bold text-lg">
                              ${car?.price_current}/day
                            </span>
                            {car?.price_original !== car?.price_current && (
                              <span className="original-price text-gray-400 line-through ml-2">
                                ${car?.price_original}
                              </span>
                            )}
                          </div>

                          {car?.features && car.features.length > 0 && (
                            <div className="features-tags mb-3 flex flex-wrap gap-1">
                              {car.features.slice(0, 3).map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {feature}
                                </span>
                              ))}
                              {car.features.length > 3 && (
                                <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
                                  +{car.features.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="card-bottom">
                            <div className="details-btn flex items-center justify-center">
                              <Link
                                href={`/transport/transport-details?id=${car?.id}`}
                                className="primary-btn1 !w-fit"
                              >
                                View Details
                              </Link>
                            </div>
                            <div className="review-area">
                              <ul className="rating flex gap-1">
                                {[...Array(5)].map((_, starIndex) => (
                                  <li key={starIndex}>
                                    <i
                                      className={`bi ${
                                        starIndex < Math.floor(car?.rating || 4)
                                          ? "bi-star-fill text-yellow-400"
                                          : "bi-star text-gray-300"
                                      }`}
                                    />
                                  </li>
                                ))}
                              </ul>
                              <span className="text-gray-500 text-sm">
                                ({car?.reviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <i className="bi bi-search text-5xl text-gray-400 mb-4 block"></i>
                      <h4 className="text-2xl font-semibold mb-3">
                        No cars found matching your criteria
                      </h4>
                      <p className="text-gray-500 mb-6">
                        Try adjusting your filters or search terms
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
                  )}
                </div>
              )}

              {/* ✅ Pagination */}
              {!loading && filteredCars.length > 0 && totalPages > 1 && (
                <div className="w-full">
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
                            if (currentPage > 1) {
                              handlePageChange(currentPage - 1);
                            }
                          }}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left" />
                        </button>
                      </li>

                      {/* First Page */}
                      {currentPage > 2 && (
                        <li>
                          <button
                            className="min-w-[40px] px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-[#e8a355] hover:text-white transition-colors duration-300"
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                        </li>
                      )}

                      {/* Dots */}
                      {currentPage > 3 && (
                        <li>
                          <span className="px-4 py-2 text-gray-400">
                            <i className="bi bi-three-dots" />
                          </span>
                        </li>
                      )}

                      {/* Previous Page */}
                      {currentPage > 1 && (
                        <li>
                          <button
                            className="min-w-[40px] px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-[#e8a355] hover:text-white transition-colors duration-300"
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            {currentPage - 1}
                          </button>
                        </li>
                      )}

                      {/* Current Page */}
                      <li>
                        <button className="min-w-[40px] px-4 py-2 rounded-lg border bg-[#295557] text-white border-[#295557]">
                          {currentPage}
                        </button>
                      </li>

                      {/* Next Page */}
                      {currentPage < totalPages && (
                        <li>
                          <button
                            className="min-w-[40px] px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-[#e8a355] hover:text-white transition-colors duration-300"
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            {currentPage + 1}
                          </button>
                        </li>
                      )}

                      {/* Dots */}
                      {currentPage < totalPages - 2 && (
                        <li>
                          <span className="px-4 py-2 text-gray-400">
                            <i className="bi bi-three-dots" />
                          </span>
                        </li>
                      )}

                      {/* Last Page */}
                      {currentPage < totalPages - 1 && (
                        <li>
                          <button
                            className="min-w-[40px] px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-[#e8a355] hover:text-white transition-colors duration-300"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
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
