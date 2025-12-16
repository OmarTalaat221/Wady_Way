"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuantityCounter from "@/uitils/QuantityCounter";
import Calendar from "react-calendar";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import "../style.css";

import Slider from "react-slick";
import Accordion from "../../../components/accordion/accordion";
import { useLocale, useTranslations } from "next-intl";
import SlickCarousel from "@/components/SlickCarousel";
import { FaCarSide } from "react-icons/fa6";
import { FreeCancellation, PayAtPickup, ReplyRev } from "../../../uitils/icnos";
import axios from "axios";
import { base_url } from "../../../uitils/base_url";
import ReviewModal from "@/components/reviews/ReviewModal"; // Import ReviewModal
import toast from "react-hot-toast";

const faqData = [
  {
    question: {
      en: "What documents do I need to rent a car?",
      ar: "ما هي المستندات المطلوبة لاستئجار سيارة؟",
    },
    answer: {
      en: "You need a valid driver's license, a credit card, and sometimes an ID or passport.",
      ar: "تحتاج إلى رخصة قيادة سارية، وبطاقة ائتمان، وأحيانًا بطاقة هوية أو جواز سفر.",
    },
  },
  {
    question: {
      en: "What is the minimum age to rent a car?",
      ar: "ما هو الحد الأدنى للعمر لاستئجار سيارة؟",
    },
    answer: {
      en: "The minimum age is usually 21, but it can vary by company. Additional fees may apply for drivers under 25.",
      ar: "الحد الأدنى للعمر عادةً 21 عامًا، ولكن قد يختلف حسب الشركة. قد تُطبق رسوم إضافية للسائقين دون 25 عامًا.",
    },
  },
  {
    question: {
      en: "Can I return the car to a different location?",
      ar: "هل يمكنني إعادة السيارة إلى موقع مختلف؟",
    },
    answer: {
      en: "Yes, but a one-way fee may apply. Check with the rental company for details.",
      ar: "نعم، ولكن قد يتم فرض رسوم على الاتجاه الواحد. تحقق من الشركة المؤجرة للحصول على التفاصيل.",
    },
  },
];

const Page = () => {
  // Set default date range to today and tomorrow (1 day rental)
  const [dateRange, setDateRange] = useState([
    new Date(),
    moment().add(1, "day").toDate(),
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [nightCount, setNightCount] = useState(1);
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivingType, setDrivingType] = useState("self_riding");

  // Confirmation modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Booking modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const calendarRef = useRef(null);
  const confirmModalRef = useRef(null);
  const bookingModalRef = useRef(null);
  const searchParams = useSearchParams();

  const settings = useMemo(() => {
    return {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 10,
      loop: true,
      autoplay: false,
      navigation: {
        nextEl: ".product-stand-next",
        prevEl: ".product-stand-prev",
      },
    };
  }, []);

  // Fetch car data
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const carId = searchParams.get("id") || searchParams.get("car_id");

        if (!carId) {
          setError("Car ID not found");
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${base_url}/user/cars/select_car_by_id.php`,
          {
            car_id: carId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === "success") {
          setCarData(response.data.message[0]);
        } else {
          setError("Car not found");
        }
      } catch (err) {
        setError("Failed to fetch car data");
        console.error("Error fetching car data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [searchParams]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const days = moment(dateRange[1]).diff(moment(dateRange[0]), "days");
      setNightCount(days > 0 ? days : 1);
    }
  }, [dateRange]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle outside clicks for modals
  const handleModalOutsideClick = (e, modalRef, closeFunction) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeFunction();
    }
  };

  const formatDate = (date, locale) => {
    if (!date) return "";
    if (locale === "ar") {
      return moment(date).format("DD/MM/YYYY");
    }
    return moment(date).format("MMM DD, YYYY");
  };

  const handleDateChange = (value) => {
    setDateRange(value);
    setIsCalendarOpen(false);
  };

  // Handle review submission success
  const handleReviewSuccess = (reviewData) => {
    console.log("Review submitted:", reviewData);
    // toast.success("Thank you for your review!");
    // fetchCarData();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Get user data
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please login to make a booking");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    // Validation
    if (!dateRange[0] || !dateRange[1]) {
      toast.error("Please select booking dates");
      return;
    }

    if (nightCount <= 0) {
      toast.error("Please select valid date range");
      return;
    }

    // Show confirmation modal
    setIsConfirmModalOpen(true);
  };

  // Handle confirmation and proceed with booking
  const handleConfirmBooking = async () => {
    setIsConfirmModalOpen(false);
    setIsBookingModalOpen(true);
    setBookingLoading(true);
    setBookingSuccess(false);
    setBookingError(null);

    try {
      // Get user ID
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData);
      const userId = user.user_id || user.id;

      const bookingData = {
        user_id: userId,
        car_id: parseInt(carData.id),
        total_amount: parseFloat(totalPrice.toFixed(2)),
        type: drivingType,
        start_date: moment(dateRange[0]).format("YYYY-MM-DD"),
        end_date: moment(dateRange[1]).format("YYYY-MM-DD"),
      };

      const response = await axios.post(
        `${base_url}/user/cars/reserve_car.php`,
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setBookingSuccess(true);
      } else {
        setBookingError(
          response.data.message || "Booking failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(
        err.response?.data?.message ||
          "Network error. Please check your connection and try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingLoading(false);
    setBookingSuccess(false);
    setBookingError(null);
  };

  const locale = useLocale();
  const t = useTranslations("transportDetails");

  // Parse car images from the API response
  const carImages = useMemo(() => {
    if (!carData?.image) return [];

    const imageUrls = carData.image.split("//CAMP//");

    return imageUrls.map((url, index) => ({
      src: url.trim(),
      alt: `${carData.title} - Image ${index + 1}`,
    }));
  }, [carData]);

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb
          pagename="Transport Details"
          pagetitle="Transport Details"
        />
        <div className="transport-details-section pt-[50px] mb-[30px]">
          <div className="container">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div
                  style={{
                    borderBottom: "2px solid #e8a355",
                  }}
                  className="animate-spin rounded-full h-16 w-16 mx-auto"
                ></div>
                <p className="mt-4 text-lg">Loading car details...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !carData) {
    return (
      <>
        <Breadcrumb
          pagename="Transport Details"
          pagetitle="Transport Details"
        />
        <div className="transport-details-section pt-[50px] mb-[30px]">
          <div className="container">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl text-red-500 mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
                <p className="text-gray-600">
                  {error || "The requested car could not be found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentPrice = parseFloat(carData.price_current || 0);
  const totalPrice = nightCount > 0 ? currentPrice * nightCount : currentPrice;

  return (
    <>
      <style jsx>{`
        .modal.show {
          animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-content {
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .booking-details {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #e8a355;
        }

        .driving-type-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .driving-type-option {
          flex: 1;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .driving-type-option.selected {
          border-color: #e8a355;
          background-color: #fff7e6;
          color: #e8a355;
          font-weight: bold;
        }

        .driving-type-option:hover {
          border-color: #e8a355;
        }

        .confirmation-details {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .detail-row:last-child {
          border-bottom: none;
          font-weight: bold;
          color: #e8a355;
          font-size: 1.1em;
        }

        .detail-label {
          font-weight: 500;
          color: #6c757d;
        }

        .detail-value {
          font-weight: 600;
          color: #212529;
        }
      `}</style>

      <Breadcrumb pagename="Transport Details" pagetitle="Transport Details" />
      <div className="transport-details-section pt-[50px] mb-[30px]">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-lg-8">
              <div className="transport-image-area mb-50">
                <div className="w-full">
                  {carImages.length > 0 ? (
                    <SlickCarousel images={carImages} />
                  ) : (
                    <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">{carData.title}</h3>
              <ul className="fetures">
                <li>
                  <FreeCancellation />
                  {t("freeCancellation")}
                </li>
                <li>
                  <PayAtPickup />
                  {t("payAtPickup")}
                </li>
                <li>
                  <FaCarSide />
                  {t("shuttleToCar")}
                </li>
              </ul>
              <p className="text-base mb-4">{carData.subtitle}</p>
              <p className="text-base mb-4">
                <strong>Location:</strong> {carData.location}
              </p>
              <p className="text-base mb-4">
                <strong>Car Type:</strong> {carData.car_type}
              </p>

              {/* Features Section */}
              {carData.features && carData.features.length > 0 && (
                <>
                  <h4 className="text-xl font-semibold mt-5 mb-3">
                    Car Features
                  </h4>
                  <div className="features-area mb-[20px]">
                    <div className="bg-[#f8f8f8] p-4 rounded-lg mb-4">
                      <h5 className="text-lg font-semibold mb-3 text-[#e8a355]">
                        Included Features
                      </h5>
                      <ul className="flex items-center gap-6 flex-wrap">
                        {carData.features.map((feature, index) => (
                          <li key={index} className="mb-2 flex items-start">
                            <i className="bi bi-check-lg text-green-600 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              <div className="mb-7">
                <div className="mb-5">
                  <h4 className="text-2xl font-semibold">
                    {t("frequentlyAskedQuestion")}
                  </h4>
                </div>
                <Accordion items={faqData} />
              </div>

              {/* Review Section */}
              <div className="review-wrapper">
                <h4>Customer Review</h4>
                <div className="review-box">
                  <div className="total-review">
                    <h2>{carData?.rating || "9.5"}</h2>
                    <div className="review-wrap">
                      <ul className="star-list">
                        {[...Array(5)].map((_, i) => (
                          <li key={i}>
                            <i
                              className={
                                i < 4 ? "bi bi-star-fill" : "bi bi-star-half"
                              }
                            />
                          </li>
                        ))}
                      </ul>
                      <span>{carData?.reviews_count || "2590"} Reviews</span>
                    </div>
                  </div>

                  {/* Replace the old modal button with new ReviewModal button */}
                  <button
                    className="primary-btn1"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    GIVE A RATING
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="transport-sidebar">
                <div className="booking-form-wrap">
                  <h4>Reserve Your Transport</h4>
                  <p>
                    Book cars in seconds. Real-time availability, flexible
                    scheduling, transparent pricing, and 24/7 support for
                    stress-free travel.
                  </p>

                  <div className="tab-content" id="v-pills-tabContent2">
                    <div
                      className="tab-pane fade active show"
                      id="v-pills-booking"
                      role="tabpanel"
                      aria-labelledby="v-pills-booking-tab"
                    >
                      <div className="sidebar-booking-form">
                        <form onSubmit={handleFormSubmit}>
                          <h6 className="text-lg font-semibold mb-3">
                            Select Your Reserve Date:
                          </h6>
                          <div className="mb-4">
                            <div className="form-group">
                              <div className="relative">
                                <input
                                  type="text"
                                  readOnly
                                  onClick={() =>
                                    setIsCalendarOpen(!isCalendarOpen)
                                  }
                                  value={`${formatDate(
                                    dateRange[0],
                                    locale
                                  )} - ${formatDate(dateRange[1], locale)}`}
                                  placeholder="Select Date Range"
                                  className="w-full h-14 rounded-lg border border-gray-300 px-4 focus:outline-none focus:border-orange-500 cursor-pointer"
                                />
                                {isCalendarOpen && (
                                  <div
                                    className="absolute z-50 top-full left-0 mt-1 bg-white shadow-lg rounded-lg overflow-hidden"
                                    ref={calendarRef}
                                  >
                                    <Calendar
                                      onChange={handleDateChange}
                                      value={dateRange}
                                      selectRange={true}
                                      locale={locale}
                                      className="date-range-calendar"
                                      minDate={new Date()}
                                      formatShortWeekday={(locale, date) =>
                                        locale === "ar"
                                          ? moment(date)
                                              .locale("ar")
                                              .format("dd")
                                              .charAt(0)
                                          : moment(date).format("dd").charAt(0)
                                      }
                                      formatMonthYear={(locale, date) =>
                                        locale === "ar"
                                          ? moment(date)
                                              .locale("ar")
                                              .format("MMMM YYYY")
                                          : moment(date).format("MMMM YYYY")
                                      }
                                      nextLabel={
                                        <i className="bi bi-chevron-right"></i>
                                      }
                                      prevLabel={
                                        <i className="bi bi-chevron-left"></i>
                                      }
                                      next2Label={null}
                                      prev2Label={null}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Driving Type Selector */}
                          <h6 className="text-lg font-semibold mb-3">
                            Select Driving Type:
                          </h6>
                          <div className="driving-type-selector">
                            <div
                              className={`driving-type-option ${
                                drivingType === "self_riding" ? "selected" : ""
                              }`}
                              onClick={() => setDrivingType("self_riding")}
                            >
                              <div>Self Driving</div>
                              <small>Drive yourself</small>
                            </div>
                            <div
                              className={`driving-type-option ${
                                drivingType === "with_driver" ? "selected" : ""
                              }`}
                              onClick={() => setDrivingType("with_driver")}
                            >
                              <div>With Driver</div>
                              <small>Professional driver</small>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <div className="text-base font-medium">
                                <span>{carData.title}:</span>
                              </div>
                              <div className="text-base font-medium">
                                {carData.price_currency}
                                {currentPrice} /{" "}
                                {carData.price_note?.toLowerCase()}
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <div className="text-base font-medium">
                                <span>
                                  {locale === "ar"
                                    ? "عدد الأيام:"
                                    : "Number of Days:"}
                                </span>
                              </div>
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm text-[#e8a355] font-bold">
                                {nightCount}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 mb-6 bg-orange-50 rounded-lg">
                            <span className="text-lg font-semibold">
                              {locale === "ar"
                                ? "السعر الإجمالي:"
                                : "Total Price:"}
                            </span>
                            <span className="text-xl font-bold text-[#e8a355]">
                              {carData.price_currency}
                              {totalPrice.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-4 px-6 text-white font-semibold primary-btn1 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          >
                            Book Now
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) =>
            handleModalOutsideClick(e, confirmModalRef, closeConfirmModal)
          }
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" ref={confirmModalRef}>
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle text-primary me-2"></i>
                  Confirm Your Booking
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeConfirmModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Please review your booking details carefully before
                  confirming.
                </div>

                <div className="confirmation-details">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-car-front me-2"></i>
                    Booking Summary
                  </h6>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-tag me-2"></i>Car:
                    </span>
                    <span className="detail-value">{carData.title}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-geo-alt me-2"></i>Location:
                    </span>
                    <span className="detail-value">{carData.location}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-gear me-2"></i>Driving Type:
                    </span>
                    <span className="detail-value">
                      {drivingType === "self_riding"
                        ? "Self Driving"
                        : "With Driver"}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-calendar-check me-2"></i>Start Date:
                    </span>
                    <span className="detail-value">
                      {formatDate(dateRange[0], locale)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-calendar-x me-2"></i>End Date:
                    </span>
                    <span className="detail-value">
                      {formatDate(dateRange[1], locale)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-clock me-2"></i>Duration:
                    </span>
                    <span className="detail-value">
                      {nightCount} {nightCount === 1 ? "Day" : "Days"}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-currency-exchange me-2"></i>Daily
                      Rate:
                    </span>
                    <span className="detail-value">
                      {carData.price_currency}
                      {currentPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      <i className="bi bi-calculator me-2"></i>Total Amount:
                    </span>
                    <span className="detail-value text-primary">
                      {carData.price_currency}
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="alert alert-warning mt-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> Your booking will be under review.
                  Once approved, we'll send a payment link to complete your
                  reservation.
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeConfirmModal}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Edit
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBooking}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) =>
            !bookingLoading &&
            handleModalOutsideClick(e, bookingModalRef, closeBookingModal)
          }
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" ref={bookingModalRef}>
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  {bookingLoading
                    ? "Processing Booking..."
                    : bookingSuccess
                    ? "Booking Submitted!"
                    : "Booking Error"}
                </h5>
                {!bookingLoading && (
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeBookingModal}
                  ></button>
                )}
              </div>
              <div className="modal-body text-center py-4">
                {bookingLoading && (
                  <>
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Please wait while we process your booking...</p>
                  </>
                )}

                {bookingSuccess && (
                  <>
                    <div className="text-success mb-3">
                      <i
                        className="bi bi-check-circle-fill"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="text-success mb-3">Booking Under Review</h4>
                    <div className="alert alert-info">
                      <p className="mb-2">
                        <strong>Thank you for your booking!</strong>
                      </p>
                      <p className="mb-2">
                        Your car rental request is currently under review. Our
                        team will verify your information and check the required
                        documents.
                      </p>
                      <p className="mb-0">
                        <strong>
                          Once approved, we will send a payment link to your
                          email address to complete your reservation.
                        </strong>
                      </p>
                    </div>
                  </>
                )}

                {bookingError && (
                  <>
                    <div className="text-danger mb-3">
                      <i
                        className="bi bi-exclamation-triangle-fill"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="text-danger mb-3">Booking Failed</h4>
                    <div className="alert alert-danger">{bookingError}</div>
                  </>
                )}
              </div>
              {!bookingLoading && (
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeBookingModal}
                  >
                    Close
                  </button>
                  {bookingError && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        closeBookingModal();
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        itemId={carData?.id}
        itemType="car"
        itemName={carData?.title}
        apiEndpoint="/user/rating/car_rating.php"
        onSuccess={handleReviewSuccess}
      />
    </>
  );
};

export default Page;
