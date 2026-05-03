"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "antd";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuantityCounter from "@/uitils/QuantityCounter";
import FAQ from "../../package/package-details/[packageId]/_components/FAQ";
import { FaClock, FaFlag, FaUser } from "react-icons/fa6";
import { base_url } from "../../../uitils/base_url";
import { useSearchParams } from "next/navigation";
import ReviewModal from "@/components/reviews/ReviewModal";
import toast from "react-hot-toast";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";
import GallerySection from "../../package/package-details/[packageId]/_components/GallerySection";

/* ─── localStorage helpers ─────────────────────────────────────────────── */
const STORAGE_KEY = "activityReservations";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadActivityStorage(activityId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    const entry = all[activityId];
    if (!entry) return null;
    if (Date.now() - entry._savedAt > TTL_MS) {
      delete all[activityId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function saveActivityStorage(activityId, data) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[activityId] = { ...data, _savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent
  }
}

function removeActivityFromStorage(activityId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all = JSON.parse(raw);
    delete all[activityId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent
  }
}
/* ───────────────────────────────────────────────────────────────────────── */

const Page = () => {
  const [isOpen, setOpen] = useState(false);
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adultQuantity, setAdultQuantity] = useState(1);
  const [childQuantity, setChildQuantity] = useState(0);

  const [selectedDate, setSelectedDate] = useState("");
  const [calendarDate, setCalendarDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");

  /* ─── restore tracking ────────────────────────────────────────────────── */
  const hasRestoredRef = useRef(false);

  const {
    inviteCode,
    hasStoredCode,
    isLoading: inviteCodeLoading,
    setManualInviteCode,
    clearCurrentInviteCode,
  } = useInviteCode(INVITE_CODE_TYPES.ACTIVITY, activityId);

  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);

  const isForChildren = useMemo(() => {
    return (
      activityData?.for_children === "1" || activityData?.for_children === 1
    );
  }, [activityData?.for_children]);

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const images = useMemo(() => {
    if (
      activityData?.image &&
      activityData.image.split("//CAMP//")?.length > 0
    ) {
      return activityData.image.split("//CAMP//").map((image, index) => ({
        id: index + 1,
        imageBig: image,
      }));
    }
    return [{ id: 1, imageBig: "/path/to/default-activity-image.jpg" }];
  }, [activityData?.image]);

  const extractedVideoId = useMemo(() => {
    return extractYouTubeVideoId(activityData?.video_link);
  }, [activityData?.video_link]);

  const maxPeople = useMemo(() => {
    const max = parseInt(activityData?.max_people) || 0;
    return max > 0 ? max : null;
  }, [activityData?.max_people]);

  const maxAdultQuantity = useMemo(() => {
    if (!maxPeople) return 99;
    return Math.max(1, maxPeople - childQuantity);
  }, [maxPeople, childQuantity]);

  const maxChildQuantity = useMemo(() => {
    if (!isForChildren) return 0;
    if (!maxPeople) return 99;
    return Math.max(0, maxPeople - adultQuantity);
  }, [isForChildren, maxPeople, adultQuantity]);

  useEffect(() => {
    if (activityData && !isForChildren && childQuantity > 0) {
      setChildQuantity(0);
    }
  }, [isForChildren, activityData]);

  const handleAdultQuantityChange = (newQuantity) => {
    if (maxPeople) {
      const totalAfterChange = newQuantity + childQuantity;
      if (totalAfterChange > maxPeople) {
        toast.error(`Maximum ${maxPeople} people allowed for this activity`);
        return;
      }
    }
    setAdultQuantity(newQuantity);
  };

  const handleChildQuantityChange = (newQuantity) => {
    if (!isForChildren) {
      toast.error("This activity is not suitable for children");
      return;
    }
    if (maxPeople) {
      const totalAfterChange = adultQuantity + newQuantity;
      if (totalAfterChange > maxPeople) {
        toast.error(`Maximum ${maxPeople} people allowed for this activity`);
        return;
      }
    }
    setChildQuantity(newQuantity);
  };

  const calculateTotalPrice = () => {
    if (!activityData) return 0;
    const adultTotal = parseFloat(activityData.per_adult) * adultQuantity;
    const childTotal = isForChildren
      ? parseFloat(activityData.per_child) * childQuantity
      : 0;
    return (adultTotal + childTotal).toFixed(2);
  };

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${base_url}/user/activities/select_activity_by_id.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity_id: parseInt(activityId) }),
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

  const handleReviewSuccess = (reviewData) => {
    console.log("Review submitted:", reviewData);
    fetchActivityData();
  };

  // --- Calendar handler ---
  const handleCalendarChange = (date) => {
    setCalendarDate(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
    setIsCalendarOpen(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
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
    if (maxPeople && adultQuantity + childQuantity > maxPeople) {
      toast.error(`Maximum ${maxPeople} people allowed for this activity`);
      return;
    }
    if (!isForChildren && childQuantity > 0) {
      toast.error("This activity is not suitable for children");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    setIsConfirmModalOpen(false);
    setIsBookingModalOpen(true);
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData);
      const userId = user.user_id || user.id;

      const bookingData = {
        user_id: userId,
        activity_id: parseInt(activityId),
        childs_num: isForChildren ? childQuantity : 0,
        adults_num: adultQuantity,
        additional_activities: null,
        total_amount: parseFloat(calculateTotalPrice()),
        date: selectedDate,
        invite_code: inviteCode || "",
      };

      const response = await fetch(
        `${base_url}/user/activities/reserve_activity.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        clearCurrentInviteCode();

        // ✅ remove only THIS activity from localStorage
        removeActivityFromStorage(activityId);

        setBookingSuccess(true);

        // Reset form after success
        setTimeout(() => {
          setAdultQuantity(1);
          setChildQuantity(0);
          setSelectedDate("");
          setCalendarDate(null);
        }, 500);
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

  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingSuccess(false);
    setBookingError(null);
  };

  useEffect(() => {
    if (activityId) {
      fetchActivityData();
    }
  }, [activityId]);

  /* ─── restore from localStorage AFTER activityData is loaded ────────── */
  useEffect(() => {
    if (!activityId || !activityData?.title || hasRestoredRef.current) return;

    const saved = loadActivityStorage(activityId);
    if (!saved) {
      hasRestoredRef.current = true;
      return;
    }

    // restore date
    if (saved.selectedDate) {
      const restoredDate = new Date(saved.selectedDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (restoredDate >= today) {
        setSelectedDate(saved.selectedDate);
        setCalendarDate(restoredDate);
      }
    }

    // restore quantities
    if (typeof saved.adultQuantity === "number" && saved.adultQuantity >= 1) {
      setAdultQuantity(saved.adultQuantity);
    }
    if (typeof saved.childQuantity === "number" && saved.childQuantity >= 0) {
      setChildQuantity(saved.childQuantity);
    }

    hasRestoredRef.current = true;
  }, [activityId, activityData?.title]);

  /* ─── persist to localStorage on every meaningful change ──────────── */
  useEffect(() => {
    if (!activityId || !hasRestoredRef.current) return;

    saveActivityStorage(activityId, {
      selectedDate,
      adultQuantity,
      childQuantity,
    });
  }, [activityId, selectedDate, adultQuantity, childQuantity]);

  // --- Ratings ---
  const validRatings = useMemo(() => {
    if (!activityData?.ratings || !Array.isArray(activityData.ratings))
      return [];
    return activityData.ratings.filter(
      (r) => r.score !== null && r.score !== undefined && r.score !== ""
    );
  }, [activityData?.ratings]);

  const overallRating = useMemo(() => {
    if (validRatings.length === 0) return null;
    const total = validRatings.reduce((sum, r) => {
      let score = parseFloat(r.score);
      if (isNaN(score)) return sum;
      const max = parseFloat(r.maxScore) || 10;
      const normalized = max > 5 ? (score / max) * 5 : score;
      return sum + normalized;
    }, 0);
    const avg = total / validRatings.length;
    return avg > 0 ? avg.toFixed(1) : null;
  }, [validRatings]);

  // --- Map ---
  const mapFallbackUrl = useMemo(() => {
    const lat = parseFloat(activityData?.latitude);
    const lng = parseFloat(activityData?.longitude);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return `https://maps.google.com/maps?q=${lat},${lng}&z=12&output=embed`;
    }
    return null;
  }, [activityData?.latitude, activityData?.longitude]);

  if (loading || inviteCodeLoading) {
    return (
      <>
        <Breadcrumb
          pagename="Activities Details"
          pagetitle="Activities Details"
        />
        <div className="loading-container text-center py-5">
          <div
            className="spinner-border"
            style={{ color: "#295557" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading activity details...</p>
        </div>
      </>
    );
  }

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

  // --- Confirm Modal Footer ---
  const confirmModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        onClick={closeConfirmModal}
      >
        Cancel
      </button>
      <button
        type="button"
        className="px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors flex items-center gap-2"
        style={{ backgroundColor: "#295557" }}
        onClick={handleConfirmBooking}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e3e40")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#295557")}
      >
        <i className="bi bi-check-circle"></i>
        Confirm Booking
      </button>
    </div>
  );

  // --- Booking Status Modal Footer ---
  const bookingModalFooter = bookingLoading ? null : (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        onClick={closeBookingModal}
      >
        Close
      </button>
      {bookingError && (
        <button
          type="button"
          className="px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors"
          style={{ backgroundColor: "#295557" }}
          onClick={() => {
            closeBookingModal();
            setIsConfirmModalOpen(true);
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#1e3e40")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#295557")}
        >
          Try Again
        </button>
      )}
    </div>
  );

  return (
    <>
      <Breadcrumb
        pagename="Activities Details"
        pagetitle="Activities Details"
      />
      <div className="package-details-area pt-120 mb-[30px]">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <GallerySection
                images={images}
                videoId={extractedVideoId}
                setOpenimg={setOpenimg}
                isOpenimg={isOpenimg}
                isOpen={isOpen}
                setOpen={setOpen}
              />
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
                    {"$"}
                    {activityData.per_adult}/
                  </h3>
                  <span>adult</span>
                </div>

                {isForChildren && (
                  <>
                    <div className="tour-price">
                      <h3 className="!text-[rgb(226,155,75)]">&</h3>
                    </div>
                    <div className="tour-price">
                      <h3>
                        {"$"}
                        {activityData.per_child}/
                      </h3>
                      <span>child</span>
                    </div>
                  </>
                )}
              </div>

              <ul className="tour-info-metalist">
                <li>
                  <FaClock />
                  {activityData.duration}
                </li>
                {maxPeople && (
                  <li>
                    <FaUser />
                    Max People: {maxPeople}
                  </li>
                )}
                <li>
                  <FaFlag />
                  {activityData.country_name}
                </li>
              </ul>

              <p
                dangerouslySetInnerHTML={{
                  __html: activityData?.description,
                }}
              />

              {activityData.features?.length > 0 && (
                <div className="highlight-tour mb-[20px]">
                  <h4>Highlights of the Activity</h4>
                  <ul>
                    {activityData.features.map((feature, index) => (
                      <li
                        key={feature.id || index}
                        className="activity-highlight-item"
                      >
                        {feature.icon ? (
                          <span
                            className="activity-highlight-icon"
                            dangerouslySetInnerHTML={{ __html: feature.icon }}
                          />
                        ) : (
                          <span className="activity-highlight-icon">
                            <i className="bi bi-check" />
                          </span>
                        )}
                        <div className="activity-highlight-text">
                          <strong>{feature.label}:</strong> {feature.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="tour-location">
                <h4>Location Map</h4>
                <div className=" mb-30">
                  {mapFallbackUrl ? (
                    <iframe
                      src={mapFallbackUrl}
                      width="100%"
                      height={450}
                      style={{ border: 0, borderRadius: "12px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center bg-gray-100 rounded-xl"
                      style={{ height: 450 }}
                    >
                      <p className="text-gray-500">
                        Location not available for this activity
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {activityData?.faqs?.length > 0 && (
                <div className="faq-content-wrap mb-[25px]">
                  <FAQ faqData={activityData?.faqs} text={true} />
                </div>
              )}

              <div className="review-wrapper">
                <h4>Customer Review</h4>
                <div className="review-box">
                  <div className="total-review">
                    <h2>{overallRating || "N/A"}</h2>
                    <div className="review-wrap">
                      <ul className="star-list">
                        {[...Array(5)].map((_, i) => {
                          const rating = parseFloat(overallRating) || 0;
                          const starIndex = i + 1;
                          return (
                            <li key={i}>
                              <i
                                className={
                                  rating >= starIndex
                                    ? "bi bi-star-fill"
                                    : rating >= starIndex - 0.5
                                      ? "bi bi-star-half"
                                      : "bi bi-star"
                                }
                              />
                            </li>
                          );
                        })}
                      </ul>
                      <span className="text-gray-500 text-sm">
                        {overallRating
                          ? `${overallRating} / 5`
                          : "No ratings yet"}
                      </span>
                    </div>
                  </div>

                  {validRatings.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3 mb-3">
                      {validRatings.map((r, idx) => {
                        const score = parseFloat(r.score);
                        const max = parseFloat(r.maxScore) || 10;
                        const normalized =
                          max > 5
                            ? ((score / max) * 5).toFixed(1)
                            : score.toFixed(1);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                          >
                            {r.logo && (
                              <img
                                src={r.logo}
                                alt={r.platform || "Rating"}
                                className="w-5 h-5 object-contain"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {r.platform || "Rating"}
                            </span>
                            <span className="text-sm font-bold text-[#e8a355]">
                              {normalized}/5
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    className="primary-btn1"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    GIVE A RATING
                  </button>
                </div>
              </div>
            </div>

            {/* ===== Sidebar Booking Form ===== */}
            <div className="col-xl-4">
              <div className="booking-form-wrap">
                <h4>Reserve Your Activity</h4>
                <p>
                  Secure your spot for an unforgettable nature adventure now!
                </p>

                {maxPeople && (
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Maximum <strong>{maxPeople}</strong> people allowed for this
                    activity
                  </div>
                )}

                {!isForChildren && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium px-3 py-2 rounded-lg mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Adults only — children not permitted for this activity
                  </div>
                )}

                <div className="tab-content" id="v-pills-tabContent2">
                  <div
                    className="tab-pane fade active show"
                    id="v-pills-booking"
                    role="tabpanel"
                  >
                    <div className="sidebar-booking-form">
                      <form onSubmit={handleFormSubmit}>
                        {/* ===== Calendar Date Picker ===== */}
                        <div className="tour-date-wrap mb-50">
                          <h6>Select Your Booking Date:</h6>

                          {/* Clickable Date Display */}
                          <div
                            className="activity-cal-trigger"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                          >
                            <div className="activity-cal-trigger-left">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="3"
                                  y="4"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  ry="2"
                                />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <div className="activity-cal-trigger-text">
                                {selectedDate ? (
                                  <>
                                    <span className="activity-cal-date-main">
                                      {new Date(
                                        selectedDate + "T00:00:00"
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span className="activity-cal-date-sub">
                                      {new Date(
                                        selectedDate + "T00:00:00"
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                      })}
                                    </span>
                                  </>
                                ) : (
                                  <span className="activity-cal-placeholder">
                                    Choose a date
                                  </span>
                                )}
                              </div>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`activity-cal-chevron ${isCalendarOpen ? "activity-cal-chevron-open" : ""}`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {/* Calendar Dropdown */}
                          {isCalendarOpen && (
                            <div className="activity-cal-dropdown">
                              <Calendar
                                onChange={handleCalendarChange}
                                value={calendarDate}
                                minDate={new Date()}
                                locale="en-US"
                                className="activity-react-calendar"
                              />
                            </div>
                          )}

                          {/* Selected date chip */}
                          {selectedDate && !isCalendarOpen && (
                            <div className="activity-cal-selected-chip">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                              <span>
                                {new Date(
                                  selectedDate + "T00:00:00"
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="booking-form-item-type mb-45">
                          <div className="number-input-item adults">
                            <label className="number-input-lable">
                              Adult:<span></span>
                              <span className="mx-1">
                                {"$"}
                                {activityData.per_adult}
                                {activityData.price_original && (
                                  <del>
                                    {"$"}
                                    {activityData.price_original}
                                  </del>
                                )}
                              </span>
                            </label>
                            <QuantityCounter
                              quantity={adultQuantity}
                              onQuantityChange={handleAdultQuantityChange}
                              incIcon="bx bx-plus"
                              dcrIcon="bx bx-minus"
                              minQuantity={1}
                              maxQuantity={maxAdultQuantity}
                            />
                          </div>

                          {isForChildren && (
                            <div className="number-input-item children">
                              <label className="number-input-lable">
                                Children:<span></span>
                                <span>
                                  {"$"}
                                  {activityData.per_child}
                                </span>
                              </label>
                              <QuantityCounter
                                quantity={childQuantity}
                                onQuantityChange={handleChildQuantityChange}
                                incIcon="bx bx-plus"
                                dcrIcon="bx bx-minus"
                                minQuantity={0}
                                maxQuantity={maxChildQuantity}
                              />
                            </div>
                          )}
                        </div>

                        <div className="booking-form-item-type">
                          {adultQuantity > 0 && (
                            <div className="single-total mb-30">
                              <span>Adult</span>
                              <ul>
                                <li>
                                  <strong>
                                    {"$"}
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
                                {"$"}
                                {(
                                  parseFloat(activityData.per_adult) *
                                  adultQuantity
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}

                          {isForChildren && childQuantity > 0 && (
                            <div className="single-total mb-30">
                              <span>Children</span>
                              <ul>
                                <li>
                                  <strong>
                                    {"$"}
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
                                {"$"}
                                {(
                                  parseFloat(activityData.per_child) *
                                  childQuantity
                                ).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="total-price">
                          <span>Total Price:</span> {"$"}
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

        {/* ===== Ant Design Confirmation Modal ===== */}
        <Modal
          open={isConfirmModalOpen}
          onCancel={closeConfirmModal}
          title={null}
          footer={null}
          centered
          width={720}
          destroyOnClose
          className="activity-booking-modal"
          styles={{
            body: {
              maxHeight: "65vh",
              overflowY: "auto",
              padding: 0,
            },
          }}
        >
          <div className="activity-modal-inner">
            <div className="activity-modal-header">
              <div className="activity-modal-header-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3 className="activity-modal-title">Confirm Your Booking</h3>
                <p className="activity-modal-subtitle">
                  Please review the details below before confirming
                </p>
              </div>
            </div>

            <div className="activity-modal-info-banner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Once confirmed, the total amount will be held from your wallet
                balance until the booking is approved or rejected.
              </span>
            </div>

            <div className="activity-modal-summary-card">
              <div className="activity-modal-summary-header">
                <h4>{activityData.title}</h4>
                <span className="activity-modal-type-badge">
                  {activityData.activity_type}
                </span>
              </div>

              <div className="activity-modal-summary-grid">
                <div className="activity-modal-summary-row">
                  <span className="activity-modal-summary-label">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Date
                  </span>
                  <span className="activity-modal-summary-value">
                    {selectedDate
                      ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "—"}
                  </span>
                </div>

                <div className="activity-modal-summary-row">
                  <span className="activity-modal-summary-label">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Adults
                  </span>
                  <span className="activity-modal-summary-value">
                    {adultQuantity} × ${activityData.per_adult} ={" "}
                    <strong>
                      $
                      {(
                        parseFloat(activityData.per_adult) * adultQuantity
                      ).toFixed(2)}
                    </strong>
                  </span>
                </div>

                {isForChildren && childQuantity > 0 && (
                  <div className="activity-modal-summary-row">
                    <span className="activity-modal-summary-label">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      Children
                    </span>
                    <span className="activity-modal-summary-value">
                      {childQuantity} × ${activityData.per_child} ={" "}
                      <strong>
                        $
                        {(
                          parseFloat(activityData.per_child) * childQuantity
                        ).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                )}

                <div className="activity-modal-summary-row">
                  <span className="activity-modal-summary-label">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Total Guests
                  </span>
                  <span className="activity-modal-summary-value">
                    {adultQuantity + (isForChildren ? childQuantity : 0)}{" "}
                    {isForChildren ? "people" : "adults"}
                    {maxPeople && (
                      <span className="text-gray-400 text-xs ml-1">
                        (Max: {maxPeople})
                      </span>
                    )}
                  </span>
                </div>

                {!isForChildren && (
                  <div className="activity-modal-adults-only-badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Adults only activity — no children included
                  </div>
                )}
              </div>

              <div className="activity-modal-total-bar">
                <span>Total Amount</span>
                <span className="activity-modal-total-amount">
                  ${calculateTotalPrice()}
                </span>
              </div>
            </div>

            <div className="activity-modal-footer">{confirmModalFooter}</div>
          </div>
        </Modal>

        {/* ===== Ant Design Booking Status Modal ===== */}
        <Modal
          open={isBookingModalOpen}
          onCancel={bookingLoading ? undefined : closeBookingModal}
          title={null}
          footer={null}
          centered
          width={520}
          closable={!bookingLoading}
          maskClosable={!bookingLoading}
          destroyOnClose
          className="activity-booking-modal"
          styles={{
            body: {
              maxHeight: "65vh",
              overflowY: "auto",
              padding: 0,
            },
          }}
        >
          <div className="activity-modal-inner">
            {bookingLoading && (
              <div className="activity-modal-status-content">
                <div className="activity-modal-spinner">
                  <div className="activity-spinner-ring"></div>
                </div>
                <h4 className="activity-modal-status-title">
                  Processing Your Booking
                </h4>
                <p className="activity-modal-status-text">
                  Please wait while we process your booking request...
                </p>
              </div>
            )}

            {bookingSuccess && (
              <div className="activity-modal-status-content">
                <div className="activity-modal-success-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4 className="activity-modal-status-title text-green-700">
                  Booking Submitted Successfully!
                </h4>
                <p className="activity-modal-status-text">
                  Thank you for your booking!
                </p>

                <div className="activity-modal-wallet-info">
                  <div className="activity-modal-wallet-row">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <div>
                      <strong>${calculateTotalPrice()}</strong> has been held
                      from your wallet balance.
                    </div>
                  </div>
                  <p className="activity-modal-wallet-note">
                    Your booking is now under review. Our team will verify your
                    request shortly.
                  </p>
                  <div className="activity-modal-wallet-divider"></div>
                  <div className="activity-modal-wallet-detail">
                    <div className="activity-modal-wallet-detail-item">
                      <span className="activity-dot activity-dot-green"></span>
                      If <strong>approved</strong>, the held amount will be
                      deducted from your wallet.
                    </div>
                    <div className="activity-modal-wallet-detail-item">
                      <span className="activity-dot activity-dot-red"></span>
                      If <strong>rejected</strong>, the full amount will be
                      released back to your wallet.
                    </div>
                  </div>
                </div>

                <div className="activity-modal-footer">
                  {bookingModalFooter}
                </div>
              </div>
            )}

            {bookingError && (
              <div className="activity-modal-status-content">
                <div className="activity-modal-error-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h4 className="activity-modal-status-title text-red-600">
                  Booking Failed
                </h4>
                <div className="activity-modal-error-msg">{bookingError}</div>

                <div className="activity-modal-footer">
                  {bookingModalFooter}
                </div>
              </div>
            )}
          </div>
        </Modal>

        <ReviewModal
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          itemId={activityId}
          itemType="activity"
          itemName={activityData?.title}
          apiEndpoint="/user/rating/activity_rating.php"
          onSuccess={handleReviewSuccess}
        />
      </div>

      {/* ===== Scoped CSS — does NOT touch old CSS ===== */}
      <style jsx>{`
        /* ===== Calendar Trigger Button ===== */
        .activity-cal-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          background: #fff;
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;
          user-select: none;
        }
        .activity-cal-trigger:hover {
          border-color: #295557;
        }
        .activity-cal-trigger:active {
          box-shadow: 0 0 0 3px rgba(41, 85, 87, 0.1);
        }
        .activity-cal-trigger-left {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #295557;
        }
        .activity-cal-trigger-text {
          display: flex;
          flex-direction: column;
        }
        .activity-cal-date-main {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .activity-cal-date-sub {
          font-size: 12px;
          color: #888;
          line-height: 1.3;
        }
        .activity-cal-placeholder {
          font-size: 15px;
          color: #aaa;
        }
        .activity-cal-chevron {
          color: #888;
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }
        .activity-cal-chevron-open {
          transform: rotate(180deg);
        }

        /* ===== Calendar Dropdown ===== */
        .activity-cal-dropdown {
          margin-top: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          animation: actCalSlideDown 0.2s ease-out;
        }
        @keyframes actCalSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ===== Selected Date Chip ===== */
        .activity-cal-selected-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding: 8px 14px;
          background: rgba(41, 85, 87, 0.06);
          border: 1px solid rgba(41, 85, 87, 0.15);
          border-radius: 8px;
          font-size: 13px;
          color: #295557;
          font-weight: 500;
        }
        .activity-cal-selected-chip svg {
          color: #059669;
          flex-shrink: 0;
        }

        /* ===== react-calendar overrides (scoped) ===== */
        :global(.activity-react-calendar) {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
          background: #fff !important;
        }
        :global(.activity-react-calendar .react-calendar__navigation) {
          margin-bottom: 0 !important;
          padding: 8px 4px;
          background: #f9fafb;
          border-bottom: 1px solid #f0f0f0;
        }
        :global(.activity-react-calendar .react-calendar__navigation button) {
          min-width: 36px;
          font-size: 14px;
          font-weight: 600;
          color: #295557;
          background: none;
          border: none;
          border-radius: 8px;
          padding: 6px 8px;
        }
        :global(
          .activity-react-calendar .react-calendar__navigation button:hover
        ) {
          background: rgba(41, 85, 87, 0.08);
        }
        :global(
          .activity-react-calendar .react-calendar__navigation button:disabled
        ) {
          color: #ccc;
          background: none;
        }
        :global(
          .activity-react-calendar .react-calendar__month-view__weekdays
        ) {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #888;
          padding: 8px 0 4px;
        }
        :global(
          .activity-react-calendar .react-calendar__month-view__weekdays abbr
        ) {
          text-decoration: none !important;
        }
        :global(.activity-react-calendar .react-calendar__tile) {
          padding: 10px 6px !important;
          font-size: 14px;
          border-radius: 8px;
          color: #333;
          transition: all 0.15s ease;
        }
        :global(.activity-react-calendar .react-calendar__tile:hover) {
          background: rgba(41, 85, 87, 0.08) !important;
        }
        :global(.activity-react-calendar .react-calendar__tile--now) {
          background: rgba(232, 163, 85, 0.12) !important;
          color: #e8a355;
          font-weight: 700;
        }
        :global(.activity-react-calendar .react-calendar__tile--now:hover) {
          background: rgba(232, 163, 85, 0.2) !important;
        }
        :global(.activity-react-calendar .react-calendar__tile--active) {
          background: #295557 !important;
          color: #fff !important;
          font-weight: 700;
          border-radius: 8px;
        }
        :global(.activity-react-calendar .react-calendar__tile--active:hover) {
          background: #1e3e40 !important;
        }
        :global(.activity-react-calendar .react-calendar__tile:disabled) {
          color: #d1d5db !important;
          background: transparent !important;
          cursor: not-allowed;
        }
        :global(
          .activity-react-calendar
            .react-calendar__month-view__days__day--neighboringMonth
        ) {
          color: #d1d5db !important;
        }

        /* ===== Highlight items with icons ===== */
        .activity-highlight-item {
          display: flex !important;
          align-items: flex-start !important;
          gap: 10px;
          margin-bottom: 8px;
          list-style: none !important;
        }
        .activity-highlight-icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          margin-top: 2px;
        }
        .activity-highlight-icon :global(svg) {
          width: 20px;
          height: 20px;
        }
        .activity-highlight-text {
          flex: 1;
          line-height: 1.5;
        }

        /* ===== Ant Design Modal Overrides (scoped) ===== */
        :global(.activity-booking-modal .ant-modal-content) {
          border-radius: 16px !important;
          overflow: hidden;
          padding: 0 !important;
        }
        :global(.activity-booking-modal .ant-modal-header) {
          display: none !important;
        }
        :global(.activity-booking-modal .ant-modal-body) {
          padding: 0 !important;
        }
        :global(.activity-booking-modal .ant-modal-close) {
          top: 16px;
          right: 16px;
          color: #666;
        }
        :global(.activity-booking-modal .ant-modal-close:hover) {
          color: #333;
        }

        /* ===== Modal Inner Layout ===== */
        .activity-modal-inner {
          padding: 0;
        }
        .activity-modal-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 24px 28px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .activity-modal-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(41, 85, 87, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #295557;
          flex-shrink: 0;
        }
        .activity-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
        }
        .activity-modal-subtitle {
          font-size: 13px;
          color: #888;
          margin: 2px 0 0;
        }
        .activity-modal-info-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 16px 28px;
          padding: 12px 16px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 10px;
          font-size: 13px;
          color: #0369a1;
          line-height: 1.5;
        }
        .activity-modal-info-banner svg {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .activity-modal-summary-card {
          margin: 0 28px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        .activity-modal-summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .activity-modal-summary-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #295557;
        }
        .activity-modal-type-badge {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(232, 163, 85, 0.12);
          color: #e8a355;
        }
        .activity-modal-summary-grid {
          padding: 16px 18px;
        }
        .activity-modal-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .activity-modal-summary-row:last-child {
          border-bottom: none;
        }
        .activity-modal-summary-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }
        .activity-modal-summary-label svg {
          color: #295557;
        }
        .activity-modal-summary-value {
          font-size: 14px;
          color: #1f2937;
        }
        .activity-modal-adults-only-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          padding: 8px 12px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          font-size: 12px;
          color: #92400e;
        }
        .activity-modal-total-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          background: #295557;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }
        .activity-modal-total-amount {
          font-size: 22px;
          font-weight: 700;
          color: #e8a355;
        }
        .activity-modal-footer {
          padding: 16px 28px 24px;
          border-top: 1px solid #f0f0f0;
        }
        .activity-modal-status-content {
          padding: 32px 28px 0;
          text-align: center;
        }
        .activity-modal-status-title {
          font-size: 20px;
          font-weight: 700;
          margin: 16px 0 8px;
        }
        .activity-modal-status-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .activity-modal-spinner {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }
        .activity-spinner-ring {
          width: 52px;
          height: 52px;
          border: 4px solid #e5e7eb;
          border-top-color: #295557;
          border-radius: 50%;
          animation: activitySpin 0.8s linear infinite;
        }
        @keyframes activitySpin {
          to {
            transform: rotate(360deg);
          }
        }
        .activity-modal-success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #ecfdf5;
          color: #059669;
          margin-bottom: 4px;
        }
        .activity-modal-error-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fef2f2;
          color: #dc2626;
          margin-bottom: 4px;
        }
        .activity-modal-error-msg {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 14px;
          color: #991b1b;
          text-align: left;
          margin-bottom: 20px;
        }
        .activity-modal-wallet-info {
          text-align: left;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 20px;
        }
        .activity-modal-wallet-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #0c4a6e;
          line-height: 1.5;
        }
        .activity-modal-wallet-row svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #0284c7;
        }
        .activity-modal-wallet-note {
          font-size: 13px;
          color: #6b7280;
          margin: 10px 0 0;
        }
        .activity-modal-wallet-divider {
          height: 1px;
          background: #e0f2fe;
          margin: 14px 0;
        }
        .activity-modal-wallet-detail {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .activity-modal-wallet-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: #4b5563;
          line-height: 1.4;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .activity-dot-green {
          background: #059669;
        }
        .activity-dot-red {
          background: #dc2626;
        }
      `}</style>
    </>
  );
};

export default Page;
