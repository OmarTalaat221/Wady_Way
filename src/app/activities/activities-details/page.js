"use client";
import React, { useState, useEffect, useRef } from "react";
import ModalVideo from "react-modal-video";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuantityCounter from "@/uitils/QuantityCounter";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import FAQ from "../../package/package-details/[packageId]/_components/FAQ";
import { FaClock, FaFlag, FaUser } from "react-icons/fa6";
import { TiArrowForward } from "react-icons/ti";
import { base_url } from "../../../uitils/base_url";
import { useSearchParams } from "next/navigation";
import ReviewModal from "@/components/reviews/ReviewModal"; // Import ReviewModal
import toast from "react-hot-toast";

const Page = () => {
  const [isOpenModalVideo, setOpenModalVideo] = useState(false);
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  // Dynamic data states
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quantity states
  const [adultQuantity, setAdultQuantity] = useState(1);
  const [childQuantity, setChildQuantity] = useState(0);

  // Booking states
  const [selectedDate, setSelectedDate] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Refs for modal click outside detection
  const confirmModalRef = useRef(null);
  const bookingModalRef = useRef(null);

  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!activityData) return 0;

    const adultTotal = parseFloat(activityData.per_adult) * adultQuantity;
    const childTotal = parseFloat(activityData.per_child) * childQuantity;

    return (adultTotal + childTotal).toFixed(2);
  };

  // Fetch activity data
  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${base_url}/user/activities/select_activity_by_id.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activity_id: parseInt(activityId),
          }),
        }
      );

      const result = await response.json();

      if (result.status === "success" && result.message.length > 0) {
        setActivityData(result.message[0]);
      } else {
        setError("Activity not found");
      }
    } catch (err) {
      setError("Failed to fetch activity data");
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle review submission success
  const handleReviewSuccess = (reviewData) => {
    console.log("Review submitted:", reviewData);
    // toast.success("Thank you for your review!");
    // fetchActivityData();
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

    if (!selectedDate) {
      toast.error("Please select a booking date");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Handle actual booking submission
  const handleConfirmBooking = async () => {
    setIsConfirmModalOpen(false);
    setIsBookingModalOpen(true);
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      // Get user ID
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData);
      const userId = user.user_id || user.id;

      const bookingData = {
        user_id: userId,
        activity_id: parseInt(activityId),
        childs_num: childQuantity,
        adults_num: adultQuantity,
        additional_activities: null,
        total_amount: parseFloat(calculateTotalPrice()),
        date: selectedDate,
      };

      const response = await fetch(
        `${base_url}/user/activities/reserve_activity.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setBookingSuccess(true);
      } else {
        setBookingError(result.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      setBookingError(
        err.response?.data?.message ||
          "Network error. Please check your connection and try again."
      );
      console.error("Booking error:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  // Close booking modal
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingSuccess(false);
    setBookingError(null);
  };

  // Handle click outside modal
  const handleModalOutsideClick = (e, modalRef, closeFunction) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeFunction();
    }
  };

  useEffect(() => {
    if (activityId) {
      fetchActivityData();
    }
  }, [activityId]);

  // Generate images array from activity data
  const images = activityData?.image?.split("//CAMP//") || [];

  const bigImages = images.map((image, index) => ({
    id: index,
    imageBig: image,
  }));

  useEffect(() => {
    console.log(images, "images");
  }, [images]);

  // Static FAQ data
  const faqData = [
    {
      id: "travelcollapseOne",
      question: `01. What is ${
        activityData?.activity_type || "this activity"
      }?`,
      answer:
        activityData?.description ||
        "This activity offers an exciting adventure experience.",
    },
    {
      id: "travelcollapseTwo",
      question: "02. What equipment do I need?",
      answer:
        activityData?.features?.length > 0
          ? `Essential equipment includes: ${activityData.features.join(", ")}`
          : "All necessary equipment will be provided.",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb
          pagename="Activities Details"
          pagetitle="Activities Details"
        />
        <div className="loading-container text-center py-5">
          <div className="spinner-border border-[#295557]" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading activity details...</p>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Breadcrumb
          pagename="Activities Details"
          pagetitle="Activities Details"
        />
        <div className="error-container text-center py-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </>
    );
  }

  // No data state
  if (!activityData) {
    return (
      <>
        <Breadcrumb
          pagename="Activities Details"
          pagetitle="Activities Details"
        />
        <div className="no-data-container text-center py-5">
          <p>No activity data found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        pagename="Activities Details"
        pagetitle="Activities Details"
      />
      <div className="package-details-area pt-120 mb-[30px]">
        <div className="container">
          <div className="row">
            <div className="co-lg-12">
              <div className="package-img-group mb-50">
                <div className="row align-items-center g-3">
                  <div className="col-lg-6">
                    <div className="gallery-img-wrap">
                      <img src={images[0]} alt={activityData.title} />
                      <a>
                        <i
                          className="bi bi-eye"
                          onClick={() =>
                            setOpenimg({ openingState: true, openingIndex: 0 })
                          }
                        />
                      </a>
                    </div>
                  </div>
                  <div className="col-lg-6 h-100">
                    <div className="row g-3 h-100">
                      <div className="col-6">
                        <div className="gallery-img-wrap">
                          <img src={images[1]} alt={activityData.title} />
                          <a>
                            <i
                              className="bi bi-eye "
                              onClick={() =>
                                setOpenimg({
                                  openingState: true,
                                  openingIndex: 1,
                                })
                              }
                            />
                          </a>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="gallery-img-wrap">
                          <img src={images[2]} alt={activityData.title} />
                          <a>
                            <i
                              className="bi bi-eye"
                              onClick={() =>
                                setOpenimg({
                                  openingState: true,
                                  openingIndex: 2,
                                })
                              }
                            />
                          </a>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="gallery-img-wrap active">
                          <img src={images[3]} alt={activityData.title} />
                          <button className="StartSlideShowFirstImage">
                            <i
                              className="bi bi-plus-lg"
                              onClick={() =>
                                setOpenimg({
                                  openingState: true,
                                  openingIndex: 3,
                                })
                              }
                            />{" "}
                            View More Images
                          </button>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="gallery-img-wrap active">
                          <img src={images[3]} alt={activityData.title} />
                          <a
                            data-fancybox="gallery-01"
                            style={{ cursor: "pointer" }}
                            onClick={() => setOpenModalVideo(true)}
                          >
                            <i className="bi bi-play-circle" /> Watch Video
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-xl-4 gy-5">
            <div className="col-xl-8">
              <div className="eg-tag2">
                <span>{activityData.activity_type}</span>
              </div>
              <h2 className="!mb-0">{activityData.title}</h2>
              <div className="flex items-center gap-3">
                <div className="tour-price">
                  <h3>
                    {activityData.price_currency}
                    {activityData.per_adult}/
                  </h3>
                  <span>{"adult"}</span>
                </div>
                <div className="tour-price">
                  <h3 className="!text-[rgb(226,155,75)]">&</h3>
                </div>

                <div className="tour-price">
                  <h3>
                    {activityData.price_currency}
                    {activityData.per_child}/
                  </h3>
                  <span>{"child"}</span>
                </div>
              </div>

              <ul className="tour-info-metalist">
                <li>
                  <FaClock />
                  {activityData.duration}
                </li>
                <li>
                  <FaUser />
                  Max People : 13
                </li>
                <li>
                  <FaFlag />
                  {activityData.country_name}
                </li>
              </ul>
              <p>{activityData.description}</p>

              <div className="highlight-tour mb-[20px]">
                <h4>Highlights of the Tour</h4>
                <ul>
                  {activityData.features?.map((feature, index) => (
                    <li key={index}>
                      <span>
                        <i className="bi bi-check" />
                      </span>{" "}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tour-location">
                <h4>Location Map</h4>
                <div className="map-area mb-30">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193325.0481540361!2d-74.06757856146028!3d40.79052383652264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1660366711448!5m2!1sen!2sbd"
                    width={600}
                    height={450}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="faq-content-wrap mb-[25px]">
                <FAQ faqData={faqData} text={true} />
              </div>

              {/* Review Section */}
              <div className="review-wrapper">
                <h4>Customer Review</h4>
                <div className="review-box">
                  <div className="total-review">
                    <h2>{activityData?.rating || "9.5"}</h2>
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
                      <span>
                        {activityData?.reviews_count || "2590"} Reviews
                      </span>
                    </div>
                  </div>

                  {/* Review Button */}
                  <button
                    className="primary-btn1"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    GIVE A RATING
                  </button>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="booking-form-wrap">
                <h4>Reserve Your Activity</h4>
                <p>
                  Secure your spot for an unforgettable nature adventure now!
                </p>

                <div className="tab-content" id="v-pills-tabContent2">
                  <div
                    className="tab-pane fade active show"
                    id="v-pills-booking"
                    role="tabpanel"
                  >
                    <div className="sidebar-booking-form">
                      <form onSubmit={handleFormSubmit}>
                        <div className="tour-date-wrap mb-50">
                          <h6>Select Your Booking Date:</h6>
                          <div className="form-inner mb-[20px]">
                            <div className="form-group">
                              <input
                                type="date"
                                name="inOut"
                                value={selectedDate}
                                onChange={(e) =>
                                  setSelectedDate(e.target.value)
                                }
                                min={new Date().toISOString().split("T")[0]}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="booking-form-item-type mb-45">
                          <div className="number-input-item adults">
                            <label className="number-input-lable">
                              Adult:<span></span>
                              <span className="mx-1">
                                {activityData.price_currency}
                                {activityData.per_adult}
                                {activityData.price_original && (
                                  <del>
                                    {activityData.price_currency}
                                    {activityData.price_original}
                                  </del>
                                )}
                              </span>
                            </label>
                            <QuantityCounter
                              quantity={adultQuantity}
                              onQuantityChange={setAdultQuantity}
                              incIcon="bx bx-plus"
                              dcrIcon="bx bx-minus"
                              minQuantity={1}
                            />
                          </div>
                          <div className="number-input-item children">
                            <label className="number-input-lable">
                              Children:<span></span>
                              <span>
                                {activityData.price_currency}
                                {activityData.per_child}
                              </span>
                            </label>
                            <QuantityCounter
                              quantity={childQuantity}
                              onQuantityChange={setChildQuantity}
                              incIcon="bx bx-plus"
                              dcrIcon="bx bx-minus"
                              minQuantity={0}
                            />
                          </div>
                        </div>

                        {/* Price breakdown */}
                        <div className="booking-form-item-type">
                          {adultQuantity > 0 && (
                            <div className="single-total mb-30">
                              <span>Adult</span>
                              <ul>
                                <li>
                                  <strong>
                                    {activityData.price_currency}
                                    {activityData.per_adult}
                                  </strong>{" "}
                                  PRICE
                                </li>
                                <li>
                                  <i className="bi bi-x-lg" />
                                </li>
                                <li>
                                  <strong>{adultQuantity}</strong> QTY
                                </li>
                              </ul>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={27}
                                height={15}
                                viewBox="0 0 27 15"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M23.999 5.44668L25.6991 7.4978L23.9991 9.54878H0V10.5743H23.1491L20.0135 14.3575L20.7834 14.9956L26.7334 7.81687L26.9979 7.4978L26.7334 7.17873L20.7834 0L20.0135 0.638141L23.149 4.42114H0V5.44668H23.999Z"
                                />
                              </svg>
                              <div className="total">
                                {activityData.price_currency}
                                {(
                                  parseFloat(activityData.per_adult) *
                                  adultQuantity
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}

                          {childQuantity > 0 && (
                            <div className="single-total mb-30">
                              <span>Children</span>
                              <ul>
                                <li>
                                  <strong>
                                    {activityData.price_currency}
                                    {activityData.per_child}
                                  </strong>{" "}
                                  PRICE
                                </li>
                                <li>
                                  <i className="bi bi-x-lg" />
                                </li>
                                <li>
                                  <strong>{childQuantity}</strong> QTY
                                </li>
                              </ul>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={27}
                                height={15}
                                viewBox="0 0 27 15"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M23.999 5.44668L25.6991 7.4978L23.9991 9.54878H0V10.5743H23.1491L20.0135 14.3575L20.7834 14.9956L26.7334 7.81687L26.9979 7.4978L26.7334 7.17873L20.7834 0L20.0135 0.638141L23.149 4.42114H0V5.44668H23.999Z"
                                />
                              </svg>
                              <div className="total">
                                {activityData.price_currency}
                                {(
                                  parseFloat(activityData.per_child) *
                                  childQuantity
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="total-price">
                          <span>Total Price:</span>{" "}
                          {activityData.price_currency}
                          {calculateTotalPrice()}
                        </div>
                        <button type="submit" className="primary-btn1 two">
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

        {/* Confirmation Modal */}
        {isConfirmModalOpen && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={(e) =>
              handleModalOutsideClick(e, confirmModalRef, closeConfirmModal)
            }
          >
            <div className="modal-dialog !max-w-[800px] modal-dialog-centered">
              <div className="modal-content" ref={confirmModalRef}>
                <div className="modal-header border-0">
                  <h5 className="modal-title">Confirm Your Booking</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeConfirmModal}
                  ></button>
                </div>
                <div className="modal-body py-4">
                  <div className="booking-confirmation">
                    <div className="alert alert-info mb-4">
                      <h6 className="alert-heading mb-3">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        Please review your booking details
                      </h6>
                      <p className="mb-0">
                        Once confirmed, your booking request will be submitted
                        for review.
                      </p>
                    </div>

                    <div className="booking-summary">
                      <h6 className="mb-3">Booking Summary:</h6>
                      <div className="row">
                        <div className="col-12">
                          <div className="summary-item mb-3 p-3 bg-light rounded">
                            <h6 className="text-primary mb-2">
                              {activityData.title}
                            </h6>
                            <div className="summary-details">
                              <div className="row mb-2">
                                <div className="col-6">
                                  <strong>Date:</strong>
                                </div>
                                <div className="col-6">
                                  {new Date(selectedDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                              </div>
                              <div className="row mb-2">
                                <div className="col-6">
                                  <strong>Adults:</strong>
                                </div>
                                <div className="col-6">
                                  {adultQuantity} ×{" "}
                                  {activityData.price_currency}
                                  {activityData.per_adult}
                                </div>
                              </div>
                              {childQuantity > 0 && (
                                <div className="row mb-2">
                                  <div className="col-6">
                                    <strong>Children:</strong>
                                  </div>
                                  <div className="col-6">
                                    {childQuantity} ×{" "}
                                    {activityData.price_currency}
                                    {activityData.per_child}
                                  </div>
                                </div>
                              )}
                              <hr />
                              <div className="row">
                                <div className="col-6">
                                  <strong>Total Amount:</strong>
                                </div>
                                <div className="col-6">
                                  <strong className="text-success">
                                    {activityData.price_currency}
                                    {calculateTotalPrice()}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeConfirmModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmBooking}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Status Modal */}
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
                      <h4 className="text-success mb-3">
                        Booking Under Review
                      </h4>
                      <div className="alert alert-info">
                        <p className="mb-2">
                          <strong>Thank you for your booking!</strong>
                        </p>
                        <p className="mb-2">
                          Your booking request is currently under review. Our
                          team will verify your information and check the
                          required papers.
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
          itemId={activityId}
          itemType="activity"
          itemName={activityData?.title}
          apiEndpoint="/user/rating/activity_rating.php"
          onSuccess={handleReviewSuccess}
        />

        <React.Fragment>
          <ModalVideo
            channel="youtube"
            onClick={() => setOpenModalVideo(true)}
            isOpen={isOpenModalVideo}
            animationSpeed="350"
            videoId="r4KpWiK08vM"
            ratio="16:9"
            onClose={() => setOpenModalVideo(false)}
          />
        </React.Fragment>
        <Lightbox
          className="img-fluid"
          open={isOpenimg.openingState}
          plugins={[Fullscreen]}
          index={isOpenimg.openingIndex}
          close={() => setOpenimg(false)}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
          slides={images.map(function (elem) {
            return { src: elem };
          })}
        />
      </div>

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

        .booking-details,
        .booking-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .summary-item {
          border: 1px solid #e9ecef;
        }

        .summary-details .row {
          margin-bottom: 0;
        }

        .booking-confirmation .alert-info {
          border-left: 4px solid #0dcaf0;
        }
      `}</style>
    </>
  );
};

export default Page;
