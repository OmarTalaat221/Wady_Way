"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";

const Reviews = () => {
  const t = useTranslations("packageDetails");
  const locale = useLocale();
  const params = useParams();
  const packageId = params.packageId;

  // Sample reviews data
  const reviewsData = [
    {
      id: 1,
      name: "Mr. Bowmik Haldar",
      date: "05 June, 2023",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content:
        "Amazing experience! The tour was well organized and our guide was very knowledgeable. Highly recommended for anyone looking for an authentic travel experience.",
      ratings: {
        overall: 4.5,
        transport: 4.5,
        food: 4.5,
        destination: 4.5,
        hospitality: 4.5,
      },
    },
    {
      id: 2,
      name: "Sarah Johnson",
      date: "12 May, 2023",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content:
        "The tour exceeded my expectations! Beautiful destinations, comfortable accommodations, and excellent service throughout. The food was delicious and the transportation was reliable.",
      ratings: {
        overall: 5,
        transport: 4.5,
        food: 5,
        destination: 5,
        hospitality: 4.5,
      },
    },
    {
      id: 3,
      name: "John Smith",
      date: "23 April, 2023",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content:
        "This was my second time taking this tour and it was even better than the first! The itinerary was well-planned and gave us plenty of time to explore each location.",
      ratings: {
        overall: 4.5,
        transport: 4,
        food: 5,
        destination: 5,
        hospitality: 4.5,
      },
    },
  ];

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-yellow-400"></i>);
    }

    if (hasHalfStar) {
      stars.push(
        <i key="half" className="bi bi-star-half text-yellow-400"></i>
      );
    }

    return stars;
  };

  return (
    <div className="w-full">
      <h4 className="text-2xl font-bold mb-6">{t("customerReview")}</h4>

      {/* Overall Rating Summary */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-4xl font-bold text-amber-500 mr-4">4.7</h2>
            <div>
              <div className="flex text-amber-400 mb-1">{renderStars(4.7)}</div>
              <span className="text-gray-600">
                {t("reviewCount", { count: 2590 })}
              </span>
            </div>
          </div>
          <button
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md transition-colors"
            data-bs-toggle="modal"
            data-bs-target="#reviewModal"
          >
            {t("giveRating")}
          </button>
        </div>
      </div>

      {/* Reviews List */}
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
                    // onError={(e) => {
                    //   e.target.src = "https://via.placeholder.com/56x56";
                    // }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h6 className="font-semibold text-lg">{review.name}</h6>
                    <span className="text-gray-500 text-sm">{review.date}</span>
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

                  <p className="text-gray-700 line-clamp-2">{review.content}</p>

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

      <div className="text-center mt-8">
        <Link
          href={`/package/package-details/${packageId}/reviews-details`}
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-md transition-colors inline-block"
        >
          {t("viewAllReviews") || "View All Reviews"}
        </Link>
      </div>

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
                      {[
                        "overall",
                        "transport",
                        "food",
                        "destination",
                        "hospitality",
                      ].map((category) => (
                        <div
                          key={category}
                          className="d-flex justify-content-between align-items-center mb-2"
                        >
                          <span className="text-capitalize">{t(category)}</span>
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i
                                key={star}
                                className="bi bi-star text-gray-300 cursor-pointer hover:text-yellow-400"
                                onClick={(e) => {
                                  // Handle star rating
                                  console.log(`${category}: ${star} stars`);
                                }}
                              ></i>
                            ))}
                          </div>
                        </div>
                      ))}
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
