"use client";
import React, { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

  const reviewsData = [
    {
      id: 1,
      name: "Mr. Bowmik Haldar",
      date: "05 June, 2023",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "The tour was absolutely amazing! Our guide Ahmed was incredibly knowledgeable about Egyptian history and culture. The sunrise at the pyramids was breathtaking, and the camel ride was an unforgettable experience. The local restaurant they took us to served authentic Egyptian cuisine that was delicious. I highly recommend this tour to anyone visiting Egypt.",
      ratings: {
        overall: 4.5,
        transport: 4.5,
        food: 4.5,
        destination: 4.5,
        hospitality: 4.5,
      },
      gallery: [
        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1573160103600-f4a5840f8ed5?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1539650116574-75c0c6d0e925?w=600&h=400&fit=crop",
      ],
      videoUrl: "https://www.youtube.com/embed/FYE5EMoMbO4",
    },
    {
      id: 2,
      name: "Mr. Bowmik Haldar",
      date: "05 June, 2023",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "The tour was absolutely amazing! Our guide Ahmed was incredibly knowledgeable about Egyptian history and culture. The sunrise at the pyramids was breathtaking, and the camel ride was an unforgettable experience. The local restaurant they took us to served authentic Egyptian cuisine that was delicious. I highly recommend this tour to anyone visiting Egypt.",
      ratings: {
        overall: 4.5,
        transport: 4.5,
        food: 4.5,
        destination: 4.5,
        hospitality: 4.5,
      },
      gallery: [
        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1573160103600-f4a5840f8ed5?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1539650116574-75c0c6d0e925?w=600&h=400&fit=crop",
      ],
      videoUrl: "https://www.youtube.com/embed/FYE5EMoMbO4",
    },
    {
      id: 3,
      name: "Mr. Bowmik Haldar",
      date: "05 June, 2023",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "The tour was absolutely amazing! Our guide Ahmed was incredibly knowledgeable about Egyptian history and culture. The sunrise at the pyramids was breathtaking, and the camel ride was an unforgettable experience. The local restaurant they took us to served authentic Egyptian cuisine that was delicious. I highly recommend this tour to anyone visiting Egypt.",
      ratings: {
        overall: 4.5,
        transport: 4.5,
        food: 4.5,
        destination: 4.5,
        hospitality: 4.5,
      },
      gallery: [
        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1573160103600-f4a5840f8ed5?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1539650116574-75c0c6d0e925?w=600&h=400&fit=crop",
      ],
      videoUrl: "https://www.youtube.com/embed/FYE5EMoMbO4",
    },
    {
      id: 4,
      name: "Mr. Bowmik Haldar",
      date: "05 June, 2023",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "The tour was absolutely amazing! Our guide Ahmed was incredibly knowledgeable about Egyptian history and culture. The sunrise at the pyramids was breathtaking, and the camel ride was an unforgettable experience. The local restaurant they took us to served authentic Egyptian cuisine that was delicious. I highly recommend this tour to anyone visiting Egypt.",
      ratings: {
        overall: 4.5,
        transport: 4.5,
        food: 4.5,
        destination: 4.5,
        hospitality: 4.5,
      },
      gallery: [
        "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1573160103600-f4a5840f8ed5?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&h=400&fit=crop",
        // "https://images.unsplash.com/photo-1539650116574-75c0c6d0e925?w=600&h=400&fit=crop",
      ],
      videoUrl: "https://www.youtube.com/embed/FYE5EMoMbO4",
    },
  ];

  const [selectedReview, setSelectedReview] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Set initial selected review based on URL parameter or default to first review
  useEffect(() => {
    if (reviewIdParam) {
      const reviewId = parseInt(reviewIdParam);
      const review = reviewsData.find((r) => r.id === reviewId);
      if (review) {
        setSelectedReview(review);
      } else {
        setSelectedReview(reviewsData[0]);
      }
    } else {
      setSelectedReview(reviewsData[0]);
    }
  }, [reviewIdParam]);

  // Handle scroll for sticky reviews list on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        // Only apply on screens smaller than lg
        const reviewsSection = document.getElementById("reviews-section");
        if (reviewsSection) {
          const reviewsSectionTop = reviewsSection.getBoundingClientRect().top;
          const reviewsSectionBottom =
            reviewsSection.getBoundingClientRect().bottom;

          // Make the reviews list sticky when scrolling past it
          if (
            reviewsSectionTop <= 0
            // reviewsSectionBottom > window.innerHeight
          ) {
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

  const filteredReviews =
    activeFilter === "all"
      ? reviewsData
      : reviewsData.filter((review) => {
          if (activeFilter === "positive") return review.ratings.overall >= 3.5;
          if (activeFilter === "negative") return review.ratings.overall < 3.5;
          return true;
        });

  if (!selectedReview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Direction-aware classes based on current locale
  const directionClasses = {
    textAlign: currentLocale === "ar" ? "text-right" : "text-left",
    margin: currentLocale === "ar" ? "ml-3" : "mr-3",
    padding: currentLocale === "ar" ? "pr-4 pl-2" : "pl-4 pr-2",
    borderSide: currentLocale === "ar" ? "border-r-4" : "border-l-4",
  };

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

        {/* Filter Section */}
        <div className="mb-8">
          <div className={`flex flex-wrap gap-3 `}>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleFilterChange("all")}
            >
              {t("allReviews")}
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === "positive"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleFilterChange("positive")}
            >
              {t("positive")}
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === "negative"
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleFilterChange("negative")}
            >
              {t("negative")}
            </button>
          </div>
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
                      key={index}
                      className={`cursor-pointer border-b-4 flex-shrink-0 w-64 ${
                        selectedReview.id === review.id
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
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {review.name}
                          </h4>
                          <div className="flex items-center justify-center mt-1">
                            <div className="flex text-amber-400 ">
                              {[
                                ...Array(Math.floor(review.ratings.overall)),
                              ].map((_, i) => (
                                <i
                                  key={i}
                                  className="bi bi-star-fill text-xs"
                                ></i>
                              ))}
                              {review.ratings.overall % 1 !== 0 && (
                                <i className="bi bi-star-half text-xs"></i>
                              )}
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
                    key={index}
                    className={`cursor-pointer ${directionClasses.borderSide} ${
                      selectedReview.id === review.id
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
                        />
                      </div>
                      <div className={directionClasses.textAlign}>
                        <h4 className="font-medium text-gray-900">
                          {review.name}
                        </h4>
                        <div className={`flex items-center mt-1 `}>
                          <div className="flex text-amber-400 mx-2">
                            {[...Array(Math.floor(review.ratings.overall))].map(
                              (_, i) => (
                                <i
                                  key={i}
                                  className="bi bi-star-fill text-xs"
                                ></i>
                              )
                            )}
                            {review.ratings.overall % 1 !== 0 && (
                              <i className="bi bi-star-half text-xs"></i>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {review.content}
                        </p>
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
                    />
                  </div>
                  <div className={directionClasses.textAlign}>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedReview.name}
                    </h2>
                    <div className={`flex items-center mt-1 `}>
                      <div className="flex text-amber-400 mx-2">
                        {[
                          ...Array(Math.floor(selectedReview.ratings.overall)),
                        ].map((_, i) => (
                          <i key={i} className="bi bi-star-fill"></i>
                        ))}
                        {selectedReview.ratings.overall % 1 !== 0 && (
                          <i className="bi bi-star-half"></i>
                        )}
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
                    className={`text-lg font-semibold text-gray-900 mb-4 flex items-center }`}
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
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("overall")}</span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {[
                              ...Array(
                                Math.floor(selectedReview.ratings.overall)
                              ),
                            ].map((_, i) => (
                              <i key={i} className="bi bi-star-fill"></i>
                            ))}
                            {selectedReview.ratings.overall % 1 !== 0 && (
                              <i className="bi bi-star-half"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.overall}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("transport")}</span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {[
                              ...Array(
                                Math.floor(selectedReview.ratings.transport)
                              ),
                            ].map((_, i) => (
                              <i key={i} className="bi bi-star-fill"></i>
                            ))}
                            {selectedReview.ratings.transport % 1 !== 0 && (
                              <i className="bi bi-star-half"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.transport}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t("food")}</span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {[
                              ...Array(Math.floor(selectedReview.ratings.food)),
                            ].map((_, i) => (
                              <i key={i} className="bi bi-star-fill"></i>
                            ))}
                            {selectedReview.ratings.food % 1 !== 0 && (
                              <i className="bi bi-star-half"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.food}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {t("destination")}
                        </span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {[
                              ...Array(
                                Math.floor(selectedReview.ratings.destination)
                              ),
                            ].map((_, i) => (
                              <i key={i} className="bi bi-star-fill"></i>
                            ))}
                            {selectedReview.ratings.destination % 1 !== 0 && (
                              <i className="bi bi-star-half"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.destination}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {t("hospitality")}
                        </span>
                        <div className="flex items-center">
                          <div className="flex text-amber-400 mx-2">
                            {[
                              ...Array(
                                Math.floor(selectedReview.ratings.hospitality)
                              ),
                            ].map((_, i) => (
                              <i key={i} className="bi bi-star-fill"></i>
                            ))}
                            {selectedReview.ratings.hospitality % 1 !== 0 && (
                              <i className="bi bi-star-half"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {selectedReview.ratings.hospitality}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tour Gallery */}
                <div className="mb-8">
                  <h3
                    className={`text-lg font-semibold text-gray-900 mb-4 flex items-center `}
                  >
                    <span
                      className={`w-1 h-6 bg-amber-500 rounded ${directionClasses.margin}`}
                    ></span>
                    {t("tourGallery")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedReview.gallery.map((image, index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-48"
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

                {/* Tour Video */}
                <div>
                  <h3
                    className={`text-lg font-semibold text-gray-900 mb-4 flex items-center `}
                  >
                    <span
                      className={`w-1 h-6 bg-amber-500 rounded ${directionClasses.margin}`}
                    ></span>
                    {t("tourVideo")}
                  </h3>
                  <div className="aspect-w-16 relative pb-[56.25%]">
                    <iframe
                      src={selectedReview.videoUrl}
                      title="Tour Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                </div>
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
    </div>
  );
};

export default ReviewsDetails;
