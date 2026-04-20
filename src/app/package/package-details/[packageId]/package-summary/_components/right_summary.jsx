"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import {
  formatReservationForAPI,
  resetReservation,
  selectPriceDetails,
  refreshUserId,
} from "@/lib/redux/slices/tourReservationSlice";
import toast from "react-hot-toast";
import { FaCheckCircle, FaSpinner, FaHome, FaUser } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";
import LoginRequiredModal from "./LoginRequiredModal";
import SignupRequiredModal from "./SignupRequiredModal";
import axios from "axios";

// ============================================
// Success Modal
// ============================================
const SuccessModal = ({ isOpen, onClose, bookingDetails }) => {
  const t = useTranslations("packageSummary");
  const router = useRouter();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    dispatch(resetReservation());
    router.push(`/`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-modal-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <IoClose size={24} />
        </button>

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

        <div className="p-6">
          {bookingDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                {t("booking_details") || "Booking Details"}
              </h3>
              <div className="space-y-2 text-sm">
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
                {bookingDetails.total_amount && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-500">
                      {t("total_paid") || "Total"}:
                    </span>
                    <span className="font-bold text-green-600">
                      ${bookingDetails.total_amount}
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

          <div className="flex flex-col sm:flex-row gap-3">
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

// ============================================
// Loading Spinner
// ============================================
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  return <FaSpinner className={`${sizeClasses[size]} animate-spin`} />;
};

// ============================================
// Main Component
// ============================================
const RightSummary = ({ lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();
  const router = useRouter();
  const { packageId } = useParams();

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const reservation = useSelector((state) => state.tourReservation);
  const { tourData, numAdults, numChildren, numInfants, tourId } = reservation;

  const priceDetails = useSelector(selectPriceDetails);
  const currentTourId = tourId || packageId;

  const { inviteCode, clearCurrentInviteCode } = useInviteCode(
    INVITE_CODE_TYPES.TOUR,
    currentTourId
  );

  const proceedWithBooking = async () => {
    setLoading(true);

    try {
      dispatch(refreshUserId());

      const freshUserId =
        reservation.userId ||
        (() => {
          if (typeof window !== "undefined") {
            try {
              const userData = localStorage.getItem("user");
              if (userData) {
                const parsed = JSON.parse(userData);
                return parsed.id || parsed.user_id || null;
              }
              return localStorage.getItem("user_id") || null;
            } catch {
              return null;
            }
          }
          return null;
        })();

      if (!freshUserId) {
        toast.error("Please login first");
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      const apiData = formatReservationForAPI(
        {
          ...reservation,
          userId: freshUserId,
        },
        inviteCode || ""
      );

      console.log("📤 Booking API Data:", apiData);

      // ─── Real Request ───────────────────────────────────────────
      const response = await axios.post(
        "https://camp-coding.tech/wady-way/user/tours/new_reserve_tour.php",
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Booking Response:", response.data);

      const resData = response.data;

      // Check success — adjust based on actual API response shape
      const isSuccess =
        resData?.status === "success" ||
        resData?.success === true ||
        resData?.code === 200 ||
        response.status === 200;

      if (isSuccess) {
        clearCurrentInviteCode();
        setBookingDetails({
          ...apiData,
          tourName: tourData?.title || tourData?.name || "",
        });
        setShowSuccessModal(true);
      } else {
        // API returned non-success payload
        const errMsg =
          resData?.message ||
          resData?.error ||
          "Booking failed. Please try again.";
        toast.error(errMsg);
      }
      // ────────────────────────────────────────────────────────────
    } catch (error) {
      console.error("❌ Booking Error:", error);

      // Axios error with response from server
      if (error.response) {
        const serverMsg =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status})`;
        toast.error(serverMsg);
      } else if (error.request) {
        // Request sent but no response
        toast.error("No response from server. Check your connection.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!reservation.userId) {
      setShowLoginModal(true);
      return;
    }

    if (!reservation.tourId && !currentTourId) {
      toast.error(t("no_tour_selected") || "No tour selected");
      return;
    }

    proceedWithBooking();
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    toast.success("You can now confirm your booking!");
    setTimeout(() => {
      proceedWithBooking();
    }, 500);
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    toast.success("Account created! You can now confirm your booking!");
    setTimeout(() => {
      proceedWithBooking();
    }, 500);
  };

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setTimeout(() => setShowSignupModal(true), 300);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setTimeout(() => setShowLoginModal(true), 300);
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
            <span className="font-medium">
              ${priceDetails.subtotal?.toFixed(2)}
            </span>
          </div>

          {priceDetails.discountPercentage > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-green-600">
                {t("discount")} ({priceDetails.discountPercentage}%)
              </span>
              <span className="text-green-600 font-semibold">
                - ${priceDetails.discountAmount?.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between py-3 mt-2 border-t border-gray-200">
            <span className="font-semibold">{t("total")}</span>
            <span className="font-bold text-lg text-[#295557]">
              ${priceDetails.total?.toFixed(2)}
            </span>
          </div>

          {!reservation.userId && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center gap-2">
                <FaUser size={10} />
                You need to login before confirming your booking
              </p>
            </div>
          )}

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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        bookingDetails={bookingDetails}
        lang={lang}
      />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
      />

      <SignupRequiredModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default RightSummary;
