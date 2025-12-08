"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import axios from "axios";

const page = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allFeatures, setAllFeatures] = useState([]);

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

  // Function to fetch cars from API
  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/user/cars/select_car.php`);

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
  }, []);

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

  useEffect(() => {
    console.log(filteredCars, "filte");
  }, [filteredCars]);

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

                <div className="col-xl-8  order-lg-2 order-1">
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
                            <Link
                              href={`/transport/transport-details?id=${car?.id}`}
                              className="transport-img"
                            >
                              <img
                                src={car?.background_image}
                                alt={car?.name || "Car"}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200/666/FFFFFF?text=No+Image";
                                }}
                              />
                              {car?.location && <span>{car.location}</span>}
                            </Link>
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
                              className="btn !text-white p-[10px] hover:bg-[#1d3d3f]  !bg-[#295557]"
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

export default page;
