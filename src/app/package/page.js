"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import SelectComponent from "@/uitils/SelectComponent";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import "./style.css";
import { base_url } from "../../uitils/base_url";
import axios from "axios";
import { useDispatch } from "react-redux";
// import { addToast } from "@/";
import { useWishlist } from "@/hooks/useWishlist";

const Page = () => {
  const dispatch = useDispatch();
  const { toggleWishlist, isLoading } = useWishlist();

  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [trips, setTrips] = useState([]);
  const [SortedArray, setSortedArray] = useState([]);
  const [ActivityFilter, setActivityFilter] = useState("All Activities");
  const [TourCountryFilter, setTourCountryFilter] = useState("All countries");
  const [animatedId, setAnimatedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

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

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);

        // Prepare request body with user_id if available
        const requestBody = {};
        if (userId) {
          requestBody.user_id = userId;
        }

        const response = await axios.post(
          `${base_url}/user/tours/select_tours.php`,
          requestBody
        );

        if (response?.data.status === "success") {
          const transformedTrips = response?.data.message.map((tour) => ({
            id: tour.id,
            title: tour.title,
            country: [tour.country_name, "All countries"],
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
            activities: tour.category
              ? [tour.category, "All Activities"]
              : ["All Activities"],
            price: parseFloat(tour.price_current),
            oldPrice: tour.price_original
              ? parseFloat(tour.price_original)
              : null,
            link: `/package/package-details/${tour.id}`,
            image: tour?.image,
            is_fav: tour?.is_fav || false, // Get is_fav from API
          }));

          setTrips(transformedTrips);
          setSortedArray(transformedTrips);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
        // dispatch(
        //   addToast({
        //     type: "error",
        //     title: "Error",
        //     message: "Failed to load tours",
        //   })
        // );
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [userId, dispatch]);

  // Toggle favorite with API
  const handleToggleFavorite = async (tourId, currentStatus) => {
    // Add animation
    setAnimatedId(tourId);

    // Call API through hook
    const result = await toggleWishlist(tourId, "tour", currentStatus);

    // Update local state if successful
    if (result.success) {
      // Update the trips array with new is_fav status
      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === tourId ? { ...trip, is_fav: result.is_fav } : trip
        )
      );

      setSortedArray((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === tourId ? { ...trip, is_fav: result.is_fav } : trip
        )
      );
    }

    // Remove animation after delay
    setTimeout(() => {
      setAnimatedId(null);
    }, 600);
  };

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
      // dispatch(
      //   addToast({
      //     type: "success",
      //     title: "Link Copied!",
      //     message: "Tour link has been copied to clipboard",
      //   })
      // );
      closeShareModal();
    });
  };

  const handelSortPackages = (selectedSort) => {
    console.log(selectedSort);

    let sortedArray = [...trips];

    if (selectedSort === "Price Low to High") {
      sortedArray.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "Price High to Low") {
      sortedArray.sort((a, b) => b.price - a.price);
    }

    setSortedArray(sortedArray);
  };

  const ActivitiesCategories = [
    "All Activities",
    "Beaches",
    "City Tours",
    "Cruises",
    "Hiking",
    "Historical",
    "Museum Tours",
    "Adventure",
  ];

  const TourCountry = ["All countries", "UAE", "Oman", "Australia"];

  // Filter trips based on activity and country
  const filteredTrips = SortedArray.filter((trip) => {
    const activityMatch =
      ActivityFilter === "All Activities" ||
      trip.activities.some((activity) => activity === ActivityFilter);

    const countryMatch =
      TourCountryFilter === "All countries" ||
      trip.country.some((country) => country === TourCountryFilter);

    return activityMatch && countryMatch;
  });

  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <Breadcrumb pagename="Package Grid" pagetitle="Package Grid" />

      <div className="package-grid-with-sidebar-section pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-lg-8">
              <div className="package-inner-title-section mb-10">
                <p>
                  Showing 1–{filteredTrips.length} of {trips?.length} results
                </p>
                <div className="selector-and-grid">
                  <div className="selector">
                    <SelectComponent
                      options={["Price Low to High", "Price High to Low"]}
                      placeholder="Default Sorting"
                      sortFunc={handelSortPackages}
                    />
                  </div>
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
                    <p>Loading tours...</p>
                  </div>
                ) : (
                  <div className="row gy-4">
                    {filteredTrips.map((tour, index) => {
                      return (
                        <div className="col-md-6 item" key={index}>
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

                              {/* Favorite Button */}
                              <div
                                className={`favorite-btn ${
                                  tour.is_fav ? "active" : ""
                                } ${animatedId === tour.id ? "animate" : ""} ${
                                  isLoading(tour.id) ? "loading" : ""
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLoading(tour.id)) {
                                    handleToggleFavorite(tour.id, tour.is_fav);
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
                                className={`share-options ${
                                  shareModalOpen === tour.id ? "show" : ""
                                }`}
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

                              {/* Backdrop for closing modal when clicking outside */}
                              {shareModalOpen === tour.id && (
                                <div
                                  className="share-backdrop show"
                                  onClick={closeShareModal}
                                ></div>
                              )}
                              <div className="batch">
                                <span className="date">{tour?.duration}</span>
                                <div className="location">
                                  <ul className="location-list">
                                    {tour?.mainLocations?.map(
                                      (mainLocat, index) => {
                                        return (
                                          <li key={index}>
                                            <Link href="/package">
                                              {mainLocat}
                                            </Link>
                                          </li>
                                        );
                                      }
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="package-card-content">
                              <div className="card-content-top">
                                <h5
                                  style={{ height: "60px", overflow: "hidden" }}
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
                                      (additLocat, index) => {
                                        return (
                                          <li key={index}>
                                            <Link href="/package">
                                              {additLocat}
                                            </Link>
                                          </li>
                                        );
                                      }
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="sidebar-area">
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Activity</h5>
                  <ul className="category-list">
                    {ActivitiesCategories.map((activity, index) => {
                      return (
                        <li
                          key={index}
                          className={
                            ActivityFilter == activity ? "selected_filter" : ""
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <a
                            onClick={() => {
                              setActivityFilter(activity);
                              console.log(activity);
                            }}
                          >
                            {activity}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Destination</h5>
                  <ul className="category-list two">
                    {TourCountry.map((country, index) => {
                      return (
                        <li
                          key={index}
                          className={
                            TourCountryFilter == country
                              ? "selected_filter"
                              : ""
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <a
                            onClick={() => {
                              setTourCountryFilter(country);
                              console.log(country);
                            }}
                          >
                            {country}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Durations</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">1 - 2 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">2 - 3 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">4 - 5 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">6 - 7 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">8 - 9 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">10 - 13 Days Tour</Link>
                    </li>
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Season</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">Winter</Link>
                    </li>
                    <li>
                      <Link href="/blog">Spring</Link>
                    </li>
                    <li>
                      <Link href="/blog">Summer</Link>
                    </li>
                    <li>
                      <Link href="/blog">Autumn</Link>
                    </li>
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Vibes</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">Nature & Escape</Link>
                    </li>
                    <li>
                      <Link href="/blog">Urban Adventure</Link>
                    </li>
                    <li>
                      <Link href="/blog">Beach & Chill</Link>
                    </li>
                    <li>
                      <Link href="/blog">Wanderlust & Exploration</Link>
                    </li>
                    <li>
                      <Link href="/blog">Cultural & Festive</Link>
                    </li>
                    <li>
                      <Link href="/blog">Wellness & Zen</Link>
                    </li>
                    <li>
                      <Link href="/blog">Aesthetic & Instagrammable</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default Page;
