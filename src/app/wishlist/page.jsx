"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "next/link";
import "./style.css";

const WishlistPage = () => {
  const [favorites, setFavorites] = useState({});
  const [favoriteTrips, setFavoriteTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animation, setAnimation] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("tripFavorites");
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      setFavorites(parsedFavorites);

      // Get trips data
      import("../../data/trips")
        .then(({ trips }) => {
          // Filter trips that are in favorites
          const favTrips = trips.filter((trip) => parsedFavorites[trip.id]);
          setFavoriteTrips(favTrips);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading trips data:", err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = (tourId) => {
    setAnimation(`animate-heart-${tourId}`);
    setTimeout(() => setAnimation(""), 500);

    setFavorites((prev) => {
      const newFavorites = {
        ...prev,
        [tourId]: !prev[tourId],
      };

      // Save to localStorage
      localStorage.setItem("tripFavorites", JSON.stringify(newFavorites));

      // Update favorite trips list
      setFavoriteTrips((prevTrips) =>
        prevTrips.filter((trip) => trip.id !== tourId)
      );

      return newFavorites;
    });
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

  const shareOnTwitter = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    const message = `Check out this amazing tour: ${tour.title}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        message
      )}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
    closeShareModal();
  };

  const copyToClipboard = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopyAlert(true);
      setTimeout(() => {
        setShowCopyAlert(false);
      }, 2500);
      closeShareModal();
    });
  };

  return (
    <>
      <Breadcrumb pagename="My Wishlist" pagetitle="Wishlist" />

      {/* Copy to clipboard notification */}
      <div className={`copy-alert ${showCopyAlert ? "show" : ""}`}>
        Link copied to clipboard!
      </div>

      <div className="wishlist-section pt-10  mb-[60px]">
        <div className="container">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading your wishlist...</p>
            </div>
          ) : (
            <>
              <div className="row">
                <div className="col-12">
                  <div className="wishlist-header">
                    <h3>My Wishlist</h3>
                    <p>
                      {favoriteTrips.length}{" "}
                      {favoriteTrips.length === 1 ? "item" : "items"} saved to
                      your wishlist
                    </p>
                  </div>
                </div>
              </div>

              {favoriteTrips.length === 0 ? (
                <div className="empty-wishlist">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <h4>Your wishlist is empty</h4>
                  <p>
                    Add tours you love to your wishlist. Review them anytime and
                    easily move them to booking.
                  </p>
                  <Link href="/package" className="primary-btn2">
                    Discover Tours
                  </Link>
                </div>
              ) : (
                <div className="row gy-4">
                  {favoriteTrips.map((tour) => (
                    <div className="col-md-6 col-lg-4 item" key={tour.id}>
                      <div className="package-card">
                        <div className="package-card-img-wrap">
                          <Link
                            href={`/package/package-details/${tour.id}`}
                            className="card-img"
                          >
                            <img src={tour?.images[0]} alt={tour.title} />
                          </Link>
                          <div
                            className={`favorite-btn active ${
                              animation === `animate-heart-${tour.id}`
                                ? "heart-beat"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(tour.id);
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
                              className="share-option twitter"
                              onClick={() => shareOnTwitter(tour)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                              </svg>
                              <span>Twitter</span>
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
                                  (mainLocat, index) => (
                                    <li key={index}>
                                      <Link href="/package">{mainLocat}</Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="package-card-content">
                          <div className="card-content-top">
                            <h5 style={{ height: "60px", overflow: "hidden" }}>
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
                                      <Link href="/package">{additLocat}</Link>
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
                                {tour?.oldPrice}$ <del>{tour?.price}$ </del>
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
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default WishlistPage;
