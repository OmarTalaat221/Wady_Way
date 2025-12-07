"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  formatReservationForAPI,
  resetReservation,
} from "@/lib/redux/slices/tourReservationSlice";
import { base_url } from "../../../../../../uitils/base_url";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCheckCircle, FaSpinner, FaHome, FaReceipt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, bookingDetails, lang }) => {
  const t = useTranslations("packageSummary");
  const router = useRouter();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    dispatch(resetReservation());
    router.push(`/`);
  };

  const handleViewBookings = () => {
    onClose();
    router.push(`/${lang || "en"}/my-bookings`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-modal-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <IoClose size={24} />
        </button>

        {/* Success Icon & Animation */}
        <div className="bg-gradient-to-br from-green-400 to-green-600 pt-8 pb-12 px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce-in">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("booking_success") || "Booking Confirmed!"}
          </h2>
          <p className="text-green-100">
            {t("booking_success_message") ||
              "Your tour has been successfully booked."}
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          {bookingDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                {t("booking_details") || "Booking Details"}
              </h3>
              <div className="space-y-2 text-sm">
                {bookingDetails.bookingId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {t("booking_id") || "Booking ID"}:
                    </span>
                    <span className="font-medium text-gray-800">
                      #{bookingDetails.bookingId}
                    </span>
                  </div>
                )}
                {bookingDetails.tourName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {t("tour") || "Tour"}:
                    </span>
                    <span className="font-medium text-gray-800 text-right max-w-[180px] truncate">
                      {bookingDetails.tourName}
                    </span>
                  </div>
                )}
                {bookingDetails.total && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-500">
                      {t("total_paid") || "Total"}:
                    </span>
                    <span className="font-bold text-green-600">
                      ${bookingDetails.total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-center text-sm mb-6">
            {t("confirmation_email") ||
              "A confirmation email has been sent to your registered email address."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* <button
              onClick={handleViewBookings}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <FaReceipt />
              {t("view_bookings") || "View Bookings"}
            </button> */}
            <button
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 bg-[#295557] hover:bg-[#1e3e3a] text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <FaHome />
              {t("back_home") || "Back to Home"}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return <FaSpinner className={`${sizeClasses[size]} animate-spin`} />;
};

const RightSummary = ({ lang }) => {
  const t = useTranslations("packageSummary");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const reservation = useSelector((state) => state.tourReservation);
  const { tourData, selectedByDay, numAdults, numChildren, numInfants } =
    reservation;

  const calculatePrices = () => {
    let subtotal = 0;

    if (tourData) {
      subtotal += parseFloat(tourData.per_adult || 0) * numAdults;
      subtotal += parseFloat(tourData.per_child || 0) * numChildren;
    }

    Object.values(selectedByDay || {}).forEach((day) => {
      if (day.hotel) {
        subtotal += parseFloat(
          day.hotel.adult_price || day.hotel.price_per_night || 0
        );
      }
      if (day.car) {
        subtotal += parseFloat(day.car.price_current || day.car.price || 0);
      }
      if (day.activities) {
        day.activities.forEach((activity) => {
          subtotal += parseFloat(activity.price_current || activity.price || 0);
        });
      }
    });

    const discount = 1.0;
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: (subtotal - discount).toFixed(2),
    };
  };

  const prices = calculatePrices();

  const handleConfirmBooking = async () => {
    // Validation
    if (!reservation.userId) {
      toast.error(t("please_login") || "Please login to continue");
      return;
    }

    if (!reservation.tourId) {
      toast.error(t("no_tour_selected") || "No tour selected");
      return;
    }

    setLoading(true);
    try {
      const apiData = formatReservationForAPI(reservation);
      // console.log("Sending booking data:", apiData);

      // console.log(apiData);
      // return;

      const response = await axios.post(
        `${base_url}/user/tours/reserve_tour.php`,
        apiData
      );

      console.log("Booking response:", response.data);

      if (response.data.status === "success") {
        // Set booking details for modal
        setBookingDetails({
          bookingId:
            response.data.booking_id || response.data.reservation_id || "N/A",
          tourName: tourData?.title || tourData?.name || "Tour Package",
          total: prices.total,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          adults: numAdults,
          children: numChildren,
          infants: numInfants,
        });

        setShowSuccessModal(true);
        toast.success(
          response.data.message || "Booking confirmed successfully!"
        );
      } else {
        toast.error(
          response.data.message || "Booking Failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Booking Error:", error);

      if (error.response) {
        toast.error(
          error.response.data?.message || "Server error. Please try again."
        );
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md px-4 py-5 sticky top-24">
        <h3 className="text-lg font-semibold mb-4">
          {t("summary_description")}
        </h3>
        <p className="text-gray-600 mb-6">{t("order_description")}</p>

        {/* Tour Info */}
        {tourData && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-gray-800 text-sm mb-2 truncate">
              {tourData.title || tourData.name}
            </h4>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>{t("adults") || "Adults"}:</span>
                <span>{numAdults}</span>
              </div>
              {numChildren > 0 && (
                <div className="flex justify-between">
                  <span>{t("children") || "Children"}:</span>
                  <span>{numChildren}</span>
                </div>
              )}
              {numInfants > 0 && (
                <div className="flex justify-between">
                  <span>{t("infants") || "Infants"}:</span>
                  <span>{numInfants}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t("subtotal")}</span>
            <span className="font-medium">${prices.subtotal}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t("discount")}</span>
            <span className="text-green-600">- ${prices.discount}</span>
          </div>

          <div className="flex justify-between py-3 mt-2 border-t border-gray-200">
            <span className="font-semibold">{t("total")}</span>
            <span className="font-bold text-lg text-[#295557]">
              ${prices.total}
            </span>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full mt-4 bg-[#295557] hover:bg-[#1e3e3a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <LoadingSpinner size="md" />
                <span>{t("processing") || "Processing..."}</span>
              </>
            ) : (
              <span>{t("Confirm") || "Confirm Booking"}</span>
            )}
          </button>

          <div className="mt-3 text-center">
            <span className="text-sm text-gray-500 font-medium">
              {t("payment_status")}
            </span>
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{t("secure_payment") || "Secure & Encrypted"}</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        bookingDetails={bookingDetails}
        lang={lang}
      />
    </>
  );
};

export default RightSummary;
