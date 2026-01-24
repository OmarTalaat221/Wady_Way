"use client";
import React, { useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

const Reviews = ({ data }) => {
  const t = useTranslations("packageDetails");
  const locale = useLocale();
  const params = useParams();
  const packageId = params.packageId;

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

  // Transform API data to component format
  const reviewsData = useMemo(() => {
    if (!data?.reviews || data.reviews.length === 0) return [];

    return data.reviews.map((review) => {
      // Parse images if it's a JSON string
      let parsedImages = [];
      if (review.images) {
        if (typeof review.images === "string") {
          try {
            parsedImages = JSON.parse(review.images);
          } catch (e) {
            parsedImages = [];
          }
        } else if (Array.isArray(review.images)) {
          parsedImages = review.images;
        }
      }

      // Clean video URL
      let videoUrl = review.video || "";
      if (typeof videoUrl === "string") {
        videoUrl = videoUrl
          .replace(/\\/g, "")
          .replace(/^"/, "")
          .replace(/"$/, "");
        if (videoUrl === "[]" || videoUrl === "Array") {
          videoUrl = "";
        }
      }

      return {
        id: review.rating_id,
        name: review.full_name || `Traveler #${review.user_id}`,
        date: formatDate(review.created_at),
        image: review.image || "https://via.placeholder.com/56x56?text=User",
        content: review.comment,
        images: parsedImages,
        video: videoUrl,
        ratings: {
          overall: parseFloat(review.overall) || 0,
          transport: parseFloat(review.transport) || 0,
          hotel: parseFloat(review.hotel) || 0,
          activity: parseFloat(review.activity) || 0,
        },
      };
    });
  }, [data?.reviews]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-yellow-400"></i>);
    }

    if (hasHalfStar) {
      stars.push(
        <i key="half" className="bi bi-star-half text-yellow-400"></i>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="bi bi-star text-yellow-400"></i>
      );
    }

    return stars;
  };

  const averageRating = data?.avg_rate || 0;
  const totalReviews = data?.num_of_reviews || 0;

  // useEffect(() => {
  //   console.log(averageRating, "averageRating");
  //   console.log(totalReviews, "totalReviews");
  // }, [averageRating, totalReviews]);

  return (
    <div className="w-full">
      <h4 className="text-2xl font-bold mb-6">{t("customerReview")}</h4>

      {/* Overall Rating Summary */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-4xl font-bold text-amber-500 mr-4">
              {parseFloat(averageRating).toFixed(1)}
            </h2>
            <div>
              <div className="flex text-amber-400 mb-1">
                {renderStars(parseFloat(averageRating))}
              </div>
              <span className="text-gray-600">
                {totalReviews} {t("reviewCount")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviewsData.length > 0 ? (
        <div className="space-y-6">
          {reviewsData.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <Link
                href={`/package/package-details/${packageId}/reviews-details?reviewId=${review.id}`}
                className="block"
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/56x56?text=User";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="font-semibold text-lg">{review.name}</h6>
                      <span className="text-gray-500 text-sm">
                        {review.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-gray-600 text-sm mr-2">
                          {t("overall")}
                        </span>
                        <div className="flex">
                          {renderStars(review.ratings.overall)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm mr-2">
                          {t("transport")}
                        </span>
                        <div className="flex">
                          {renderStars(review.ratings.transport)}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 line-clamp-2">
                      {review.content}
                    </p>

                    {/* Media indicators */}
                    {(review.images?.length > 0 || review.video) && (
                      <div className="flex items-center gap-3 mt-3">
                        {review.images?.length > 0 && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <i className="bi bi-image"></i>
                            {review.images.length} photo
                            {review.images.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {review.video && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <i className="bi bi-play-circle"></i>
                            Video
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <span className="text-amber-500 hover:text-amber-600 font-medium flex items-center">
                        {t("viewDetails")}
                        <i
                          className={`bi bi-arrow-right mx-2 ${
                            locale === "ar" ? "rotate-180" : ""
                          }`}
                        ></i>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
          <i className="bi bi-chat-square-text text-4xl text-gray-300 mb-3 block"></i>
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        </div>
      )}

      {reviewsData.length > 3 && (
        <div className="text-center mt-8">
          <Link
            href={`/package/package-details/${packageId}/reviews-details`}
            className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-md transition-colors inline-block"
          >
            {t("viewAllReviews") || "View All Reviews"}
          </Link>
        </div>
      )}

      {/* Review Modal */}
      <div
        className="modal fade"
        id="reviewModal"
        tabIndex={-1}
        aria-labelledby="reviewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="reviewModalLabel">
                {t("writeReview")}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t("enterName")}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t("email")}</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder={t("enterEmail")}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">{t("review")}*</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder={t("enterReview")}
                    ></textarea>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Rating</label>
                    <div className="star-rating-wrapper">
                      {["overall", "transport", "hotel", "activity"].map(
                        (category) => (
                          <div
                            key={category}
                            className="d-flex justify-content-between align-items-center mb-2"
                          >
                            <span className="text-capitalize">
                              {t(category)}
                            </span>
                            <div className="rating-stars">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className="bi bi-star text-gray-300 cursor-pointer hover:text-yellow-400"
                                  onClick={(e) => {
                                    console.log(`${category}: ${star} stars`);
                                  }}
                                ></i>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                {t("submitNow")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
