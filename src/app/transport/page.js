"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import axios from "axios";
import { useDispatch } from "react-redux";
// import { addToast } from "@/store/notificationSlice";
import { useWishlist } from "@/hooks/useWishlist";

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFeatures, setAllFeatures] = useState([]);
  const [userId, setUserId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [animatedId, setAnimatedId] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedCarTypes, setSelectedCarTypes] = useState([]);

  // Price range options
  const priceRanges = [
    { id: "under50", label: "Under $50/day", min: 0, max: 50 },
    { id: "50to100", label: "$50 - $100/day", min: 50, max: 100 },
    { id: "100to200", label: "$100 - $200/day", min: 100, max: 200 },
    { id: "over200", label: "$200+/day", min: 200, max: Infinity },
  ];

  // Car type options (will be populated from data)
  const [carTypes, setCarTypes] = useState([]);

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

  // Function to fetch cars from API
  const fetchCars = async () => {
    try {
      setLoading(true);

      // Prepare request body with user_id if available
      const requestBody = {};
      if (userId) {
        requestBody.user_id = userId;
      }

      const response = await axios.post(
        `${base_url}/user/cars/select_car.php`,
        requestBody
      );

      const data = response.data;

      if (data.status == "success" && data.message) {
        // Map API response to component structure
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
            car.ratings && car.ratings.length > 0 ? car.ratings[0].score : 4.0,
          reviews: car.review_count || Math.floor(Math.random() * 200) + 50,
          features: car.features || [],
          is_fav: car?.is_fav || false, // Get is_fav from API
        }));

        setCars(mappedCars);

        // Extract unique features from all cars
        const featuresSet = new Set();
        mappedCars.forEach((car) => {
          if (car.features && Array.isArray(car.features)) {
            car.features.forEach((feature) => {
              featuresSet.add(feature);
            });
          }
        });
        setAllFeatures(Array.from(featuresSet).sort());

        // Extract unique car types
        const typesSet = new Set();
        mappedCars.forEach((car) => {
          if (car.type) {
            typesSet.add(car.type);
          }
        });
        setCarTypes(Array.from(typesSet).sort());

        setError(null);
      } else {
        // If API returns no data, set empty arrays
        setCars([]);
        setAllFeatures([]);
        setCarTypes([]);
        setError("No cars available at the moment");
      }
    } catch (err) {
      console.error("Error fetching cars:", err);

      if (err.response) {
        setError(
          `Server error: ${err.response.status} - ${err.response.statusText}`
        );
      } else if (err.request) {
        setError("Network error: No response from server");
      } else {
        setError(err.message || "An unexpected error occurred");
      }

      // Set empty data on error
      setCars([]);
      setAllFeatures([]);
      setCarTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [userId]);

  // Toggle favorite with API
  const handleToggleFavorite = async (carId, currentStatus) => {
    // Add animation
    setAnimatedId(carId);

    // Call API through hook (type = "transport" for cars)
    const result = await toggleWishlist(carId, "transport", currentStatus);

    // Update local state if successful
    if (result.success) {
      // Update the cars array with new is_fav status
      setCars((prevCars) =>
        prevCars.map((car) =>
          car.id === carId ? { ...car, is_fav: result.is_fav } : car
        )
      );
    }

    // Remove animation after delay
    setTimeout(() => {
      setAnimatedId(null);
    }, 600);
  };

  // Share Modal Functions
  const toggleShareModal = (id) => {
    if (shareModalOpen === id) {
      setShareModalOpen(null);
    } else {
      setShareModalOpen(id);
    }
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
      // dispatch(
      //   addToast({
      //     type: "success",
      //     title: "Link Copied!",
      //     message: "Car link has been copied to clipboard",
      //   })
      // );
      closeShareModal();
    });
  };

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the filteredCars memo
  };

  // Handle price range checkbox
  const handlePriceRangeChange = (rangeId) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId)
        ? prev.filter((id) => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  // Handle feature checkbox
  const handleFeatureChange = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  // Handle car type checkbox
  const handleCarTypeChange = (type) => {
    setSelectedCarTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchText("");
    setSelectedPriceRanges([]);
    setSelectedFeatures([]);
    setSelectedCarTypes([]);
  };

  // Filter cars based on all criteria
  const filteredCars = useMemo(() => {
    let filtered = [...cars];

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(
        (car) =>
          car.name.toLowerCase().includes(searchText.toLowerCase()) ||
          car.type.toLowerCase().includes(searchText.toLowerCase()) ||
          car.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by price ranges
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((car) => {
        const price = parseFloat(car.price_current);
        return selectedPriceRanges.some((rangeId) => {
          const range = priceRanges.find((r) => r.id === rangeId);
          return price >= range.min && price <= range.max;
        });
      });
    }

    // Filter by car types
    if (selectedCarTypes.length > 0) {
      filtered = filtered.filter((car) => selectedCarTypes.includes(car.type));
    }

    // Filter by features
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((car) => {
        // Check if car has at least one of the selected features
        return selectedFeatures.some((feature) =>
          car.features.includes(feature)
        );
      });
    }

    return filtered;
  }, [
    cars,
    searchText,
    selectedPriceRanges,
    selectedCarTypes,
    selectedFeatures,
  ]);

  // Calculate counts for filters
  const getFeatureCount = (feature) => {
    return cars.filter((car) => car.features && car.features.includes(feature))
      .length;
  };

  const getPriceRangeCount = (range) => {
    return cars.filter((car) => {
      const price = parseFloat(car.price_current);
      return price >= range.min && price <= range.max;
    }).length;
  };

  const getCarTypeCount = (type) => {
    return cars.filter((car) => car.type === type).length;
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchText ||
    selectedPriceRanges.length > 0 ||
    selectedCarTypes.length > 0 ||
    selectedFeatures.length > 0;

  return (
    <>
      <div className="transport-page pt-120 mb-120">
        <div className="container">
          {/* Loading State */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-[#295557]" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading cars...</p>
            </div>
          ) : (
            <>
              <div className="row g-lg-4 gy-5">
                <div className="col-xl-4 order-lg-1 order-2">
                  <div className="sidebar-area">
                    {/* Search Box */}
                    <div className="single-widget mb-30">
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
                    </div>

                    {/* Clear Filters Button */}
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

                    {/* Price Filter */}
                    <div className="single-widget mb-30">
                      <h5 className="widget-title">Filter by Price</h5>
                      <div className="checkbox-container">
                        <ul>
                          {priceRanges.map((range) => {
                            const count = getPriceRangeCount(range);
                            return (
                              <li key={range.id}>
                                <label className="containerss">
                                  <input
                                    type="checkbox"
                                    checked={selectedPriceRanges.includes(
                                      range.id
                                    )}
                                    onChange={() =>
                                      handlePriceRangeChange(range.id)
                                    }
                                    disabled={count === 0}
                                  />
                                  <span className="checkmark" />
                                  <span
                                    className={`text ${
                                      count === 0 ? "text-muted" : ""
                                    }`}
                                  >
                                    {range.label}
                                  </span>
                                  <span className="qty">{count}</span>
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
                              const count = getCarTypeCount(type);
                              return (
                                <li key={type}>
                                  <label className="containerss">
                                    <input
                                      type="checkbox"
                                      checked={selectedCarTypes.includes(type)}
                                      onChange={() => handleCarTypeChange(type)}
                                      disabled={count === 0}
                                    />
                                    <span className="checkmark" />
                                    <span
                                      className={`text ${
                                        count === 0 ? "text-muted" : ""
                                      }`}
                                    >
                                      {type}
                                    </span>
                                    <span className="qty">{count}</span>
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
                              const count = getFeatureCount(feature);
                              return (
                                <li key={feature}>
                                  <label className="containerss">
                                    <input
                                      type="checkbox"
                                      checked={selectedFeatures.includes(
                                        feature
                                      )}
                                      onChange={() =>
                                        handleFeatureChange(feature)
                                      }
                                      disabled={count === 0}
                                    />
                                    <span className="checkmark" />
                                    <span
                                      className={`text ${
                                        count === 0 ? "text-muted" : ""
                                      }`}
                                    >
                                      {feature}
                                    </span>
                                    <span className="qty">{count}</span>
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-xl-8 order-lg-2 order-1">
                  {/* Error State */}
                  {error && !loading && cars.length === 0 && (
                    <div className="alert alert-warning" role="alert">
                      <h4 className="alert-heading">No Cars Available</h4>
                      <p>{error}</p>
                      <hr />
                      <button
                        className="btn btn-warning"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Results Info */}
                  {!loading && cars.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 className="mb-0">
                          {filteredCars.length}{" "}
                          {filteredCars.length === 1 ? "Car" : "Cars"} Found
                        </h5>
                      </div>
                      <div>
                        <small className="text-muted">
                          Total: {cars.length} cars available
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Cars Grid */}
                  {!loading && cars.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-[30px]">
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
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLoading(car.id)) {
                                    handleToggleFavorite(car.id, car.is_fav);
                                  }
                                }}
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
                                className={`share-options ${
                                  shareModalOpen === car.id ? "show" : ""
                                }`}
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

                              {/* Backdrop for closing modal when clicking outside */}
                              {shareModalOpen === car.id && (
                                <div
                                  className="share-backdrop show"
                                  onClick={closeShareModal}
                                ></div>
                              )}
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

                              {/* Display price */}
                              <div className="price-info mb-2">
                                <span className="current-price text-[#295557] fw-bold fs-5">
                                  ${car?.price_current}/day
                                </span>
                                {car?.price_original !== car?.price_current && (
                                  <span className="original-price text-muted text-decoration-line-through ms-2">
                                    ${car?.price_original}
                                  </span>
                                )}
                              </div>

                              {/* Display features */}
                              {car?.features && car.features.length > 0 && (
                                <div className="features-tags mb-3">
                                  {car.features
                                    .slice(0, 3)
                                    .map((feature, idx) => (
                                      <span
                                        key={idx}
                                        className="badge bg-secondary me-1 mb-1"
                                        style={{ fontSize: "0.75rem" }}
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  {car.features.length > 3 && (
                                    <span
                                      className="badge bg-dark"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      +{car.features.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="card-bottom">
                                <div className="details-btn md:w-full !w-fit">
                                  <Link
                                    href={`/transport/transport-details?id=${car?.id}`}
                                    className="primary-btn1"
                                  >
                                    View Details
                                  </Link>
                                </div>
                                <div className="review-area">
                                  <ul className="rating">
                                    {[...Array(5)].map((_, starIndex) => (
                                      <li key={starIndex}>
                                        <i
                                          className={`bi ${
                                            starIndex <
                                            Math.floor(car?.rating || 4)
                                              ? "bi-star-fill"
                                              : "bi-star"
                                          }`}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                  <span>({car?.reviews || 0} reviews)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-5">
                          <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                          <h4>No cars found matching your criteria</h4>
                          <p className="text-muted mb-4">
                            Try adjusting your filters or search terms
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={clearAllFilters}
                              className="btn !text-white p-[10px] hover:bg-[#1d3d3f] !bg-[#295557]"
                            >
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pagination - Only show if there are cars */}
                  {!loading && filteredCars.length > 0 && (
                    <div className="row">
                      <div className="col-lg-12">
                        <nav className="inner-pagination-area">
                          <ul className="pagination-list">
                            <li>
                              <a href="#" className="shop-pagi-btn">
                                <i className="bi bi-chevron-left" />
                              </a>
                            </li>
                            <li>
                              <a href="#" className="active">
                                1
                              </a>
                            </li>
                            <li>
                              <a href="#">2</a>
                            </li>
                            <li>
                              <a href="#">3</a>
                            </li>
                            <li>
                              <a href="#">
                                <i className="bi bi-three-dots" />
                              </a>
                            </li>
                            <li>
                              <a href="#">6</a>
                            </li>
                            <li>
                              <a href="#" className="shop-pagi-btn">
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
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
