"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Select } from "antd";
import TourCard from "../../components/facilitySlide/Cards/TourCard";

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

  const [searchText, setSearchText] = useState("");

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

  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get("sort") || "";
  });

  // ✅ Sort options
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

  // ✅ Clean Icon Function
  const cleanIcon = useCallback((icon) => {
    if (!icon) return "";
    let result = icon;
    let prevResult = "";
    while (prevResult !== result) {
      prevResult = result;
      result = result
        .replace(/\\\\/g, "TEMP_BACKSLASH")
        .replace(/\\"/g, '"')
        .replace(/TEMP_BACKSLASH/g, "")
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "");
    }
    result = result.replace(/\\/g, "");
    return result.trim();
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

      let baseURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      const additionalParams = [];

      if (priceRanges && priceRanges.length > 0) {
        const minPrices = priceRanges.map((r) => r.min).join(",");
        const maxPrices = priceRanges.map((r) => r.max).join(",");
        additionalParams.push(`price_min=${minPrices}`);
        additionalParams.push(`price_max=${maxPrices}`);
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

      let apiUrl = `${base_url}/user/cars/select_car.php?${params.toString()}`;

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

        // ✅ معالجة features_sort
        if (data.features_sort && Array.isArray(data.features_sort)) {
          if (typeof data.features_sort[0] === "string") {
            setAllFeatures(data.features_sort);
          } else {
            setAllFeatures(
              data.features_sort.map((f) =>
                typeof f === "string" ? f : f.name || ""
              )
            );
          }
        }

        // ✅ معالجة type_sort
        if (data.type_sort && Array.isArray(data.type_sort)) {
          setCarTypes(data.type_sort);
        }

        const mappedCars = data.message.map((car) => {
          const rawRating =
            car.avg_rating ||
            (car.ratings && car.ratings.length > 0
              ? car.ratings[0].score
              : null);

          return {
            id: car.id,
            title: car.title || car.name || "Car Rental",
            type: car.car_type || car.type || "Standard",
            image: car.image,
            location: car.location || "",
            price_current: car.price_current || "0.00",
            price_original: car.price_original || car.price_current || "0.00",
            rating: rawRating,
            reviews: car.review_count || Math.floor(Math.random() * 200) + 50,
            features: car.features
              ? car.features.map((f) => {
                  if (typeof f === "string") {
                    return { id: f, name: f, icon: "" };
                  }
                  return {
                    id: f.feature_id || f.id || "",
                    name: f.name || f.feature || "",
                    icon: cleanIcon(f.icon),
                  };
                })
              : [],
            is_fav: car?.is_fav || false,
            offer_percentage: car.offer_percentage || null,
          };
        });

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
    cleanIcon,
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
              if (typeof feature === "string") {
                featuresSet.add(feature);
              } else if (feature && feature.name) {
                featuresSet.add(feature.name);
              }
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

  const handleSearch = (e) => {
    e.preventDefault();
  };

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
      const featureName =
        typeof feature === "string" ? feature : feature?.name || "";
      const newFeatures = selectedFeatures.includes(featureName)
        ? selectedFeatures.filter((f) => f !== featureName)
        : [...selectedFeatures, featureName];

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
      const typeName = typeof type === "string" ? type : type?.name || "";
      const newCarTypes = selectedCarTypes.includes(typeName)
        ? selectedCarTypes.filter((t) => t !== typeName)
        : [...selectedCarTypes, typeName];

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

  const hasActiveFilters =
    searchText ||
    selectedCarTypes.length > 0 ||
    selectedFeatures.length > 0 ||
    selectedPriceRanges.length > 0;

  const activeFiltersCount =
    selectedCarTypes.length +
    selectedFeatures.length +
    selectedPriceRanges.length;

  const filteredCars = useMemo(() => {
    let filtered = [...cars];

    if (searchText.trim()) {
      filtered = filtered.filter(
        (car) =>
          (car.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (car.type || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (car.location || "").toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [cars, searchText]);

  // ✅ Map car data to TourCard item shape
  const mapCarToCardItem = useCallback(
    (car) => {
      const hasDiscount =
        car.price_original &&
        car.price_current &&
        parseFloat(car.price_original) > parseFloat(car.price_current);

      return {
        id: car.id,
        title: `${car.title || "Car Rental"}${car.type ? ` (${car.type})` : ""}`,
        image: car.image,
        detailsHref: `/transport/transport-details?id=${car.id}`,
        itemType: "transport",
        priceLabel: "Price/Day:",
        price: `$${car.price_current}`,
        oldPrice: hasDiscount ? `$${car.price_original}` : null,
        priceNote: "TAXES INCL",
        ctaLabel: "Rent Car",
        is_fav: car.is_fav,
        isWishlistDisabled: !isUserLoggedIn,
        offer_percentage: car.offer_percentage,
        rating: car.rating,
        reviews: car.reviews,
        features: car.features,

        cities: [],
        duration: null,
      };
    },
    [isUserLoggedIn]
  );

  // ✅ Sidebar Content Component
  const SidebarContent = () => (
    <>
      {/* Price Range Filter */}
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

      {/* Car Type Filter */}
      {carTypes.length > 0 && (
        <div className="single-widget mb-30">
          <h5 className="widget-title">Car Type</h5>
          <div className="checkbox-container">
            <ul>
              {carTypes.map((type, index) => {
                const typeName =
                  typeof type === "string" ? type : type?.name || "";
                if (!typeName) return null;
                const isSelected = selectedCarTypes.includes(typeName);
                return (
                  <li key={typeName || index}>
                    <label className="containerss">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          handleCarTypeChange(typeName);
                          if (window.innerWidth < 1024) {
                            setTimeout(
                              () => setIsMobileSidebarOpen(false),
                              300
                            );
                          }
                        }}
                      />
                      <span className="checkmark" />
                      <span className="text">{typeName}</span>
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
              {allFeatures.map((feature, index) => {
                const featureName =
                  typeof feature === "string" ? feature : feature?.name || "";
                if (!featureName) return null;
                const isSelected = selectedFeatures.includes(featureName);
                return (
                  <li key={featureName || index}>
                    <label className="containerss">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          handleFeatureChange(featureName);
                          if (window.innerWidth < 1024) {
                            setTimeout(
                              () => setIsMobileSidebarOpen(false),
                              300
                            );
                          }
                        }}
                      />
                      <span className="checkmark" />
                      <span className="text">{featureName}</span>
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

              {/* ✅ Cars Grid using TourCard */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-[70px]">
                  {filteredCars.length > 0 ? (
                    filteredCars.map((car) => (
                      <TourCard
                        key={car.id}
                        item={mapCarToCardItem(car)}
                        onFavoriteChange={(newFavStatus) => {
                          setCars((prevCars) =>
                            prevCars.map((c) =>
                              c.id === car.id
                                ? { ...c, is_fav: newFavStatus }
                                : c
                            )
                          );
                        }}
                      />
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

        {/* ✅ Footer with Clear Button */}
        {hasActiveFilters && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              className="w-full px-4 py-3 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
              onClick={() => {
                clearAllFilters();
                setIsMobileSidebarOpen(false);
              }}
            >
              Clear All Filters ({activeFiltersCount})
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Page;
