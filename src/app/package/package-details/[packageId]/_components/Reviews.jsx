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

  // Sample reviews data (in a real app, this would come from an API)
  const reviewsData = [
    {
      id: 1,
      name: "Mr. Bowmik Haldar",
      date: "05 June, 2023",
      image:
        "https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder2.jpg",
      content:
        "A solution that we came up with is to think of sanitary pads packaging as you would tea. Tea comes individually packaged and is stored in a beautiful box that people display in their homes.",
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
        "https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder1-500x500.jpg",
      content:
        "The tour was absolutely amazing! The guide was knowledgeable and friendly. The accommodations were comfortable and the food was delicious. I would highly recommend this tour to anyone looking for an authentic experience.",
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
        "https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder2.jpg",
      content:
        "This was my second time taking this tour and it was even better than the first! The itinerary was well-planned and gave us plenty of time to explore each location. The local experiences were authentic and memorable.",
      ratings: {
        overall: 4.5,
        transport: 4,
        food: 5,
        destination: 5,
        hospitality: 4.5,
      },
    },
  ];

  return (
    <div className="w-full">
      <h4 className="text-2xl font-bold mb-6">{t("customerReview")}</h4>
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-4xl font-bold text-amber-500 mr-4">9.5</h2>
            <div>
              <div className="flex text-amber-400 mb-1">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-half"></i>
              </div>
              <span className="text-gray-600">
                {t("reviewCount", { count: 2590 })}
              </span>
            </div>
          </div>
          <a
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md transition-colors"
            data-bs-toggle="modal"
            href="#exampleModalToggle"
            role="button"
          >
            {t("giveRating")}
          </a>
        </div>
      </div>

      {/* Reviews Section */}
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
                      <div className="flex text-amber-400">
                        {[...Array(Math.floor(review.ratings.overall))].map(
                          (_, i) => (
                            <i key={i} className="bi bi-star-fill"></i>
                          )
                        )}
                        {review.ratings.overall % 1 !== 0 && (
                          <i className="bi bi-star-half"></i>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm mr-2">
                        {t("transport")}
                      </span>
                      <div className="flex text-amber-400">
                        {[...Array(Math.floor(review.ratings.transport))].map(
                          (_, i) => (
                            <i key={i} className="bi bi-star-fill"></i>
                          )
                        )}
                        {review.ratings.transport % 1 !== 0 && (
                          <i className="bi bi-star-half"></i>
                        )}
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

      {/* Modal for review */}
      <div
        className="modal fade"
        id="exampleModalToggle"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
              <div className="row g-2">
                <div className="col-lg-8">
                  <div className="review-from-wrapper">
                    <h4>{t("writeReview")}</h4>
                    <form>
                      <div className="row">
                        <div className="col-md-6 mb-[20px]">
                          <div className="form-inner">
                            <label>{t("name")}</label>
                            <input type="text" placeholder={t("enterName")} />
                          </div>
                        </div>
                        <div className="col-md-6 mb-[20px]">
                          <div className="form-inner">
                            <label>{t("email")}</label>
                            <input type="email" placeholder={t("enterEmail")} />
                          </div>
                        </div>
                        <div className="col-lg-12 mb-[20px]">
                          <div className="form-inner">
                            <label>{t("review")}*</label>
                            <textarea
                              name="message"
                              placeholder={t("enterReview")}
                              defaultValue={""}
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 mb-10">
                          <div className="star-rating-wrapper">
                            <ul className="star-rating-list">
                              <li>
                                <div
                                  className="rating-container"
                                  data-rating={0}
                                >
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                </div>
                                <span>{t("overall")}</span>
                              </li>
                              <li>
                                <div
                                  className="rating-container"
                                  data-rating={0}
                                >
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                </div>
                                <span>{t("transport")}</span>
                              </li>
                              <li>
                                <div
                                  className="rating-container"
                                  data-rating={0}
                                >
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                </div>
                                <span>{t("food")}</span>
                              </li>
                              <li>
                                <div
                                  className="rating-container"
                                  data-rating={0}
                                >
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                </div>
                                <span>{t("destination")}</span>
                              </li>
                              <li>
                                <div
                                  className="rating-container"
                                  data-rating={0}
                                >
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                  <i className="bi bi-star-fill star-icon" />
                                </div>
                                <span>{t("hospitality")}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <button type="submit" className="primary-btn1">
                            {t("submitNow")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="col-lg-4 d-lg-flex d-none">
                  <div className="modal-form-image">
                    <img
                      src="/assets/img/innerpage/form-image.jpg"
                      alt="image"
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
