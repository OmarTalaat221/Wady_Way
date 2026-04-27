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
import {
  FaCheckCircle,
  FaSpinner,
  FaHome,
  FaUser,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";
import LoginRequiredModal from "./LoginRequiredModal";
import SignupRequiredModal from "./SignupRequiredModal";
import axios from "axios";
import { baseUrl } from "../../../../../../Constants/Const";

const BRAND = "#295557";

// ─────────────────────────────────────────────────────────────────────────────
// SuccessModal
// ─────────────────────────────────────────────────────────────────────────────
const SuccessModal = ({ isOpen, onClose, bookingDetails }) => {
  const t = useTranslations("packageSummary");
  const router = useRouter();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    dispatch(resetReservation());
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <IoClose size={24} />
        </button>

        <div className="bg-gradient-to-br from-green-400 to-green-600 pt-8 pb-12 px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
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

          <button
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-medium"
            style={{ background: BRAND }}
          >
            <FaHome />
            {t("back_home") || "Back to Home"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ErrorModal
// ─────────────────────────────────────────────────────────────────────────────
const ErrorModal = ({ isOpen, onClose, errorInfo, onRetry }) => {
  if (!isOpen || !errorInfo) return null;

  const isNetworkError = errorInfo.type === "network";
  const isServerError = errorInfo.type === "server";
  const isValidationError = errorInfo.type === "validation";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <IoClose size={24} />
        </button>

        {/* Header */}
        <div
          className={`pt-8 pb-10 px-6 text-center ${
            isNetworkError
              ? "bg-gradient-to-br from-amber-400 to-amber-600"
              : "bg-gradient-to-br from-red-400 to-red-600"
          }`}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
            {isNetworkError ? (
              <FaExclamationTriangle className="text-amber-500 text-4xl" />
            ) : (
              <FaTimesCircle className="text-red-500 text-5xl" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isNetworkError
              ? "Connection Error"
              : isValidationError
                ? "Booking Issue"
                : "Booking Failed"}
          </h2>
          <p className="text-white/90 text-sm">
            {isNetworkError
              ? "Could not connect to the server"
              : "Your booking could not be completed"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error message from API */}
          <div
            className={`rounded-xl p-4 mb-5 border ${
              isNetworkError
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-sm font-medium mb-1 ${
                isNetworkError ? "text-amber-800" : "text-red-800"
              }`}
            >
              {isNetworkError ? "What happened?" : "Error Details"}
            </p>
            <p
              className={`text-sm ${
                isNetworkError ? "text-amber-700" : "text-red-700"
              }`}
            >
              {errorInfo.message}
            </p>

            {/* Show error code if available */}
            {errorInfo.statusCode && (
              <p className="text-xs text-gray-400 mt-2">
                Error Code: {errorInfo.statusCode}
              </p>
            )}

            {/* Show field-specific errors if available */}
            {errorInfo.fieldErrors && errorInfo.fieldErrors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs font-semibold text-red-700 mb-2">
                  Please fix the following:
                </p>
                <ul className="space-y-1">
                  {errorInfo.fieldErrors.map((fieldErr, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-red-600 flex items-start gap-1.5"
                    >
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {fieldErr}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-4 rounded-xl text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              style={{ background: BRAND }}
            >
              {isValidationError ? "Go Back & Fix" : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
const RightSummary = ({ lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();
  const router = useRouter();
  const { packageId } = useParams();

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const reservation = useSelector((s) => s.tourReservation);
  const { tourData, numAdults, numChildren, numInfants, tourId } = reservation;

  const priceDetails = useSelector(selectPriceDetails);
  const currentTourId = tourId || packageId;

  const { inviteCode, clearCurrentInviteCode } = useInviteCode(
    INVITE_CODE_TYPES.TOUR,
    currentTourId
  );

  // ─── Parse API error response ──────────────────────────────────────────────
  const parseApiError = (error) => {
    // Network / timeout errors
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        return {
          type: "network",
          message:
            "The request timed out. The server took too long to respond. Please try again.",
          statusCode: null,
          fieldErrors: [],
        };
      }
      return {
        type: "network",
        message:
          error.message ||
          "Unable to connect to the server. Please check your internet connection and try again.",
        statusCode: null,
        fieldErrors: [],
      };
    }

    const status = error.response.status;
    const data = error.response.data;

    // Extract the main message
    let mainMessage = "";
    if (typeof data === "string") {
      mainMessage = data;
    } else if (data?.message) {
      mainMessage =
        typeof data.message === "string"
          ? data.message
          : JSON.stringify(data.message);
    } else if (data?.error) {
      mainMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
    } else if (data?.msg) {
      mainMessage = data.msg;
    }

    // Extract field-level errors if the API returns them
    let fieldErrors = [];
    if (data?.errors && typeof data.errors === "object") {
      if (Array.isArray(data.errors)) {
        fieldErrors = data.errors.map((e) =>
          typeof e === "string" ? e : e.message || JSON.stringify(e)
        );
      } else {
        Object.entries(data.errors).forEach(([field, msgs]) => {
          const messages = Array.isArray(msgs) ? msgs : [msgs];
          messages.forEach((msg) => {
            const label = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            fieldErrors.push(`${label}: ${msg}`);
          });
        });
      }
    }

    // Determine error type based on status code
    if (status === 422 || status === 400) {
      return {
        type: "validation",
        message:
          mainMessage ||
          "Some of the information you provided is invalid. Please review and try again.",
        statusCode: status,
        fieldErrors,
      };
    }

    if (status === 401 || status === 403) {
      return {
        type: "auth",
        message:
          mainMessage ||
          "You are not authorized to make this booking. Please log in and try again.",
        statusCode: status,
        fieldErrors: [],
      };
    }

    if (status === 404) {
      return {
        type: "server",
        message:
          mainMessage ||
          "The tour you are trying to book was not found. It may have been removed.",
        statusCode: status,
        fieldErrors: [],
      };
    }

    if (status === 409) {
      return {
        type: "server",
        message:
          mainMessage ||
          "There is a conflict with your booking. The dates or selections may no longer be available.",
        statusCode: status,
        fieldErrors: [],
      };
    }

    if (status >= 500) {
      return {
        type: "server",
        message:
          mainMessage ||
          "An internal server error occurred. Our team has been notified. Please try again later.",
        statusCode: status,
        fieldErrors: [],
      };
    }

    return {
      type: "server",
      message:
        mainMessage ||
        `Something went wrong (Error ${status}). Please try again.`,
      statusCode: status,
      fieldErrors,
    };
  };

  // ─── Parse non-success API response body ───────────────────────────────────
  const parseFailedResponse = (data) => {
    let mainMessage = "";
    let fieldErrors = [];

    if (data?.message) {
      mainMessage =
        typeof data.message === "string"
          ? data.message
          : JSON.stringify(data.message);
    } else if (data?.error) {
      mainMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
    } else if (data?.msg) {
      mainMessage = data.msg;
    }

    if (data?.errors && typeof data.errors === "object") {
      if (Array.isArray(data.errors)) {
        fieldErrors = data.errors.map((e) =>
          typeof e === "string" ? e : e.message || JSON.stringify(e)
        );
      } else {
        Object.entries(data.errors).forEach(([field, msgs]) => {
          const messages = Array.isArray(msgs) ? msgs : [msgs];
          messages.forEach((msg) => {
            const label = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            fieldErrors.push(`${label}: ${msg}`);
          });
        });
      }
    }

    return {
      type: "server",
      message: mainMessage || "Booking failed. Please try again.",
      statusCode: null,
      fieldErrors,
    };
  };

  // ─── Booking ───────────────────────────────────────────────────────────────
  const proceedWithBooking = async () => {
    setLoading(true);
    setErrorInfo(null);

    try {
      dispatch(refreshUserId());

      const freshUserId =
        reservation.userId ||
        (() => {
          if (typeof window === "undefined") return null;
          try {
            const userData = localStorage.getItem("user");
            if (userData) {
              const parsed = JSON.parse(userData);
              return parsed.id || parsed.user_id || null;
            }
            return null;
          } catch {
            return null;
          }
        })();

      if (!freshUserId) {
        toast.error("Please login first");
        setShowLoginModal(true);
        return;
      }

      const apiData = formatReservationForAPI(
        { ...reservation, userId: freshUserId },
        inviteCode || ""
      );

      console.log("📤 Booking Payload:", apiData);

      const response = await axios.post(
        `${baseUrl}/tours/new_reserve_tour.php`,
        apiData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Booking Response:", response.data);

      const resData = response.data;
      const isSuccess =
        resData?.status === "success" || resData?.success === true;

      if (isSuccess) {
        clearCurrentInviteCode();
        setBookingDetails({
          ...apiData,
          tourName: tourData?.title || "",
        });
        setShowSuccessModal(true);
      } else {
        // API returned 200 but status is not "success"
        const parsed = parseFailedResponse(resData);
        setErrorInfo(parsed);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("❌ Booking Error:", error);

      const parsed = parseApiError(error);

      // If auth error → show login modal
      if (parsed.type === "auth") {
        toast.error(parsed.message);
        setShowLoginModal(true);
        return;
      }

      setErrorInfo(parsed);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!reservation.userId) {
      setShowLoginModal(true);
      return;
    }
    if (!currentTourId) {
      toast.error("No tour selected");
      return;
    }
    proceedWithBooking();
  };

  const handleErrorRetry = () => {
    setShowErrorModal(false);
    setErrorInfo(null);

    if (errorInfo?.type === "validation") {
      // Go back to package details to fix selections
      router.push(`/package/package-details/${currentTourId}`);
    } else {
      // Retry the booking
      proceedWithBooking();
    }
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setErrorInfo(null);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setTimeout(() => proceedWithBooking(), 500);
  };

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    setTimeout(() => proceedWithBooking(), 500);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-lg shadow-md px-4 py-5 sticky top-24">
        <h3 className="text-lg font-semibold mb-4">
          {t("summary_description")}
        </h3>

        {tourData && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-gray-800 text-sm mb-2 truncate">
              {tourData.title}
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
          {/* Subtotal */}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t("subtotal")}</span>
            <span className="font-medium">
              ${priceDetails.subtotal?.toFixed(2)}
            </span>
          </div>

          {/* Discount */}
          {priceDetails.discountPercentage > 0 && (
            <div className="flex justify-between py-2 text-green-600">
              <span>
                {t("discount")} ({priceDetails.discountPercentage}%)
              </span>
              <span>- ${priceDetails.discountAmount?.toFixed(2)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between py-3 mt-2 border-t border-gray-200 font-bold">
            <span>{t("total")}</span>
            <span style={{ color: BRAND }}>
              ${priceDetails.total?.toFixed(2)}
            </span>
          </div>

          {/* Login warning */}
          {!reservation.userId && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center gap-2">
                <FaUser size={10} />
                You need to login before confirming your booking
              </p>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full mt-4 text-white py-3 px-4 rounded-lg font-medium
                       flex items-center justify-center gap-2 transition-opacity
                       disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: BRAND }}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />{" "}
                {t("processing") || "Processing..."}
              </>
            ) : (
              t("Confirm") || "Confirm Booking"
            )}
          </button>

          {/* Payment note */}
          <div className="mt-3 text-center">
            <span className="text-sm text-gray-500">{t("payment_status")}</span>
          </div>

          {/* Secure badge */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 
                   01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
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
        onClose={() => setShowSuccessModal(false)}
        bookingDetails={bookingDetails}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleErrorClose}
        errorInfo={errorInfo}
        onRetry={handleErrorRetry}
      />

      {/* Login Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setTimeout(() => setShowSignupModal(true), 300);
        }}
      />

      {/* Signup Modal */}
      <SignupRequiredModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setTimeout(() => setShowLoginModal(true), 300);
        }}
      />
    </>
  );
};

export default RightSummary;
