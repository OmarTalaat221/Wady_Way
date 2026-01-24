"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { base_url } from "../../../../../uitils/base_url";
import { Modal } from "antd";
import "./style.css";

const ReviewsDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const packageId = params.packageId;
  const reviewIdParam = searchParams.get("reviewId");
  const t = useTranslations("reviewsDetails");
  const currentLocale = useLocale();
  const reviewsListRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [showMobileReviews, setShowMobileReviews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Parse images helper
  const parseImages = (images) => {
    if (!images) return [];
    if (typeof images === "string") {
      try {
        return JSON.parse(images);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(images) ? images : [];
  };

  // Clean video URL helper
  const cleanVideoUrl = (video) => {
    if (!video || typeof video !== "string") return null;
    const cleaned = video
      .replace(/\\/g, "")
      .replace(/^"/, "")
      .replace(/"$/, "");
    if (cleaned === "[]" || cleaned === "Array" || cleaned === "") {
      return null;
    }
    return cleaned;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Transform API review to component format
  const transformReview = (reviewData) => ({
    id: reviewData.rating_id,
    user_id: reviewData.user_id,
    name: reviewData.full_name || `Traveler #${reviewData.user_id}`,
    date: formatDate(reviewData.created_at),
    image: reviewData.image || "https://via.placeholder.com/150x150?text=User",
    content: reviewData.comment,
    gallery: parseImages(reviewData.images),
    videoUrl: cleanVideoUrl(reviewData.video),
    ratings: {
      overall: parseFloat(reviewData.overall) || 0,
      transport: parseFloat(reviewData.transport) || 0,
      hotel: parseFloat(reviewData.hotel) || 0,
      activity: parseFloat(reviewData.activity) || 0,
    },
  });

  // Fetch review details from API
  const fetchReviewDetails = async () => {
    if (!reviewIdParam) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/rating/select_tour_rating.php`,
        { review_id: reviewIdParam }
      );

      if (response.data?.status === "success") {
        const mainReview = response.data.message?.review;
        const relatedReviews = response.data.message?.related_reviews || [];

        // Transform main review
        const transformedMainReview = mainReview
          ? transformReview(mainReview)
          : null;

        // Transform related reviews (filter approved only)
        const transformedRelated = relatedReviews
          .filter((r) => r.status === "approved")
          .map(transformReview);

        // Combine all reviews with main review first
        const allReviews = transformedMainReview
          ? [transformedMainReview, ...transformedRelated]
          : transformedRelated;

        setReviewsData(allReviews);

        // Set selected review
        if (transformedMainReview) {
          setSelectedReview(transformedMainReview);
        } else if (allReviews.length > 0) {
          setSelectedReview(allReviews[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching review details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewDetails();
  }, [reviewIdParam]);

  // Handle scroll for sticky reviews list on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        const reviewsSection = document.getElementById("reviews-section");
        if (reviewsSection) {
          const reviewsSectionTop = reviewsSection.getBoundingClientRect().top;
          if (reviewsSectionTop <= 0) {
            setIsSticky(true);
          } else {
            setIsSticky(false);
          }
        }
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredReviews = useMemo(() => {
    if (activeFilter === "all") return reviewsData;
    return reviewsData.filter((review) => {
      if (activeFilter === "positive") return review.ratings.overall >= 3.5;
      if (activeFilter === "negative") return review.ratings.overall < 3.5;
      return true;
    });
  }, [reviewsData, activeFilter]);

  // Direction-aware classes based on current locale
  const directionClasses = {
    textAlign: currentLocale === "ar" ? "text-right" : "text-left",
    margin: currentLocale === "ar" ? "ml-3" : "mr-3",
    padding: currentLocale === "ar" ? "pr-4 pl-2" : "pl-4 pr-2",
    borderSide: currentLocale === "ar" ? "border-r-4" : "border-l-4",
  };

  // Render stars helper
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half"></i>);
    }

    return stars;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // No reviews found
  if (!selectedReview || reviewsData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-16">
        <i className="bi bi-chat-square-text text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {t("noReviewFound") || "No Review Found"}
        </h3>
        <p className="text-gray-500 mb-6">
          {t("reviewNotExist") ||
            "The review you're looking for doesn't exist or has been removed."}
        </p>
        <Link
          href={`/package/package-details/${packageId}`}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md transition-colors inline-block"
        >
          {t("backToPackage") || "Back to Package"}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className={`flex items-center text-sm mb-3 `}>
            <Link
              href="/"
              className="text-gray-500 hover:text-amber-500 transition-colors"
            >
              {t("home")}
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mx-2 text-gray-400 ${
                currentLocale === "ar" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={`/package/package-details/${packageId}`}
              className="text-gray-500 hover:text-amber-500 transition-colors"
            >
              {t("packageDetails")}
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mx-2 text-gray-400 ${
                currentLocale === "ar" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-gray-900 font-medium">{t("reviews")}</span>
          </div>
          <h1
            className={`text-3xl md:text-4xl font-bold text-gray-900 ${directionClasses.textAlign}`}
          >
            {t("clientReviews")}
          </h1>
        </div>

        {/* Main Content */}
        <div id="reviews-section" className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Horizontal Reviews List (visible only on small screens) */}
          <div
            className={`lg:hidden w-full ${
              isSticky
                ? "fixed top-0 left-0 right-0 z-50 bg-gray-50 py-4 shadow-md transition-all duration-300"
                : ""
            }`}
          >
            <div className="flex items-center justify-between px-4 mb-2">
              <h3 className="font-bold text-lg text-gray-900">
                {t("reviews")} ({filteredReviews.length})
              </h3>
              <button
                onClick={() => setShowMobileReviews(!showMobileReviews)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 hover:shadow-md transition-all transform hover:scale-105"
                aria-label={showMobileReviews ? "Hide reviews" : "Show reviews"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-amber-600 transition-transform duration-300 ease-in-out ${
                    showMobileReviews ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div
              className={`overflow-hidden transition-all ${
                showMobileReviews
                  ? "duration-700 ease-out max-h-96 opacity-100 transform translate-y-0"
                  : "duration-500 ease-in max-h-0 opacity-0 transform -translate-y-2"
              }`}
            >
              <div
                className="overflow-x-auto pb-4 no-scrollbar"
                ref={reviewsListRef}
              >
                <div
                  className={`flex gap-x-4 ${isSticky ? "px-4" : ""}`}
                  style={{ minWidth: "max-content" }}
                >
                  {filteredReviews.map((review, index) => (
                    <div
                      key={review.id || index}
                      className={`cursor-pointer border-b-4 flex-shrink-0 w-64 ${
                        selectedReview?.id === review.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-transparent hover:bg-gray-50 border-gray-200"
                      } p-4 rounded-lg transition-all shadow-sm`}
                      onClick={() => setSelectedReview(review)}
                    >
                      <div className="flex items-center flex-col">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={review.image}
                            alt={review.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/48x48?text=User";
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-center mt-2">
                            {review.name}
                          </h4>
                          <div className="flex items-center justify-center mt-1">
                            <div className="flex text-amber-400">
                              {renderStars(review.ratings.overall)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar - Reviews List (visible only on large screens) */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3
                  className={`font-bold text-lg text-gray-900 ${directionClasses.textAlign}`}
                >
                  {t("reviews")} ({filteredReviews.length})
                </h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                {filteredReviews.map((review, index) => (
                  <div
                    key={review.id || index}
                    className={`cursor-pointer ${directionClasses.borderSide} ${
                      selectedReview?.id === review.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-transparent hover:bg-gray-50"
                    } p-4 transition-all`}
                    onClick={() => setSelectedReview(review)}
                  >
                    <div className={`flex items-start `}>
                      <div
                        className={`w-12 h-12 rounded-full overflow-hidden ${directionClasses.margin} flex-shrink-0`}
                      >
                        <img
                          src={review.image}
                          alt={review.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48x48?text=User";
                          }}
                        />
                      </div>
                      <div className={directionClasses.textAlign}>
                        <h4 className="font-medium text-gray-900">
                          {review.name}
                        </h4>
                        <div className={`flex items-center mt-1 `}>
                          <div className="flex text-amber-400 mx-2">
                            {renderStars(review.ratings.overall)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {review.content}
                        </p>
                        {/* Media indicators */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Review Details */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Review Header */}
              <div className="p-6 border-b border-gray-100">
                <div className={`flex items-center `}>
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden ${directionClasses.margin}`}
                  >
                    <img
                      src={selectedReview.image}
                      alt={selectedReview.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/64x64?text=User";
                      }}
                    />
                  </div>
                  <div className={directionClasses.textAlign}>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedReview.name}
                    </h2>
                    <div className={`flex items-center mt-1 `}>
                      <div className="flex text-amber-400 mx-2">
                        {renderStars(selectedReview.ratings.overall)}
                      </div>
                      <span className="text-gray-500">
                        {selectedReview.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="p-6">
                {/* Client Story */}
                <div className="mb-8">
                  <h3
                    className={`text-lg font-semibold text-gray-900 mb-4 flex items-center `}
                  >
                    <span
                      className={`w-1 h-6 bg-amber-500 rounded ${directionClasses.margin}`}
                    ></span>
                    {t("clientStory")}
                  </h3>
                  <p
                    className={`text-gray-700 leading-relaxed ${directionClasses.textAlign}`}
                  >
                    {selectedReview.content}
                  </p>
                </div>

                {/* Ratings */}
                <div className="mb-8">
                  <h3
                    className={`text-lg font-semibold text-gray-900 mb-4 flex items-center `}
                  >
                    <span
                      className={`w-1 h-6 bg-amber-500 rounded ${directionClasses.margin}`}
                    ></span>
                    {t("ratings")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Overall */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("overall")}</span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {renderStars(selectedReview.ratings.overall)}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.overall.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Transport */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("transport")}</span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {renderStars(selectedReview.ratings.transport)}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.transport.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Hotel */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {t("hotel") || "Hotel"}
                        </span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {renderStars(selectedReview.ratings.hotel)}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.hotel.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Activity */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {t("activity") || "Activity"}
                        </span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {renderStars(selectedReview.ratings.activity)}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.activity.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tour Gallery */}
                {selectedReview.gallery &&
                  selectedReview.gallery.length > 0 && (
                    <div className="mb-8">
                      <h3
                        className={`text-lg font-semibold text-gray-900 mb-4 flex items-center `}
                      >
                        <span
                          className={`w-1 h-6 bg-amber-500 rounded ${directionClasses.margin}`}
                        ></span>
                        {t("tourGallery")} ({selectedReview.gallery.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {selectedReview.gallery.map((image, index) => (
                          <div
                            key={index}
                            className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-48 cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                          >
                            <img
                              src={image}
                              alt={`Tour image ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Tour Video */}
                {selectedReview.videoUrl && (
                  <div>
                    <h3
                      className={`text-lg font-semibold text-gray-900 mb-4 flex items-center `}
                    >
                      <span
                        className={`w-1 h-6 bg-amber-500 rounded ${directionClasses.margin}`}
                      ></span>
                      {t("tourVideo")}
                    </h3>
                    <div
                      className="relative w-full bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setShowVideoModal(true)}
                    >
                      <video
                        src={selectedReview.videoUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                          <i className="bi bi-play-fill text-white text-3xl"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notice Box */}
            <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className={`flex items-center text-gray-700 `}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-amber-500 ${directionClasses.margin}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("reviewNotice")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={!!selectedImage}
        footer={null}
        onCancel={() => setSelectedImage(null)}
        centered
        width="auto"
        styles={{
          body: { padding: 0 },
          content: { background: "transparent", boxShadow: "none" },
        }}
        closeIcon={<i className="bi bi-x-lg text-white text-xl"></i>}
      >
        <img
          src={selectedImage}
          alt="Preview"
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        />
      </Modal>

      {/* Video Modal */}
      <Modal
        open={showVideoModal}
        footer={null}
        onCancel={() => setShowVideoModal(false)}
        centered
        width={800}
        destroyOnClose
        styles={{
          body: { padding: 0 },
          content: { borderRadius: 12 },
        }}
        closeIcon={<i className="bi bi-x-lg text-white text-xl"></i>}
      >
        {selectedReview?.videoUrl && (
          <video
            src={selectedReview.videoUrl}
            controls
            autoPlay
            className="w-full rounded-lg"
            style={{ maxHeight: "80vh" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ReviewsDetails;
