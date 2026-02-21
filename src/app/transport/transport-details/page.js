"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import Calendar from "react-calendar";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import "../style.css";

import Accordion from "../../../components/accordion/accordion";
import { useLocale, useTranslations } from "next-intl";
import SlickCarousel from "@/components/SlickCarousel";
import { FaCarSide, FaTicket } from "react-icons/fa6";
import { FreeCancellation, PayAtPickup } from "../../../uitils/icnos";
import axios from "axios";
import { base_url } from "../../../uitils/base_url";
import ReviewModal from "@/components/reviews/ReviewModal";
import InvitationCodeModal from "@/components/modals/InvitationCodeModal";
import BookingSuccessModal from "@/components/modals/BookingSuccessModal";
import toast from "react-hot-toast";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";

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
  const searchParams = useSearchParams();
  const carId = searchParams.get("id") || searchParams.get("car_id");
  const locale = useLocale();
  const t = useTranslations("transportDetails");

  // Date states
  const [dateRange, setDateRange] = useState([
    new Date(),
    moment().add(1, "day").toDate(),
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [nightCount, setNightCount] = useState(1);

  // Car data states
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivingType, setDrivingType] = useState("self_riding");

  // Invite code hook
  const {
    inviteCode,
    hasStoredCode,
    isLoading: inviteCodeLoading,
    setManualInviteCode,
    clearCurrentInviteCode,
  } = useInviteCode(INVITE_CODE_TYPES.TRANSPORT, carId);

  // Modal states
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Refs
  const calendarRef = useRef(null);
  const confirmModalRef = useRef(null);
  const bookingModalRef = useRef(null);

  // Slider settings
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

  // ✅ Clean Icon Function
  const cleanIcon = useCallback((icon) => {
    if (!icon) return "";
    let result = icon;
    let prevResult = "";
    while (prevResult !== result) {
      prevResult = result;
      result = result
        .replace(/\\\\/g, "TEMP_BACKSLASH")
        .replace(/\\"/g, '"')
        .replace(/TEMP_BACKSLASH/g, "")
        .replace(/\\n/g, "")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "");
    }
    result = result.replace(/\\/g, "");
    return result.trim();
  }, []);

  // Fetch car data
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        if (!carId) {
          setError("Car ID not found");
          setLoading(false);
          return;
        }
        const response = await axios.post(
          `${base_url}/user/cars/select_car_by_id.php`,
          { car_id: carId },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data.status === "success") {
          const car = response.data.message[0];

          // ✅ معالجة الـ features مع تنظيف الـ icons
          if (car.features && Array.isArray(car.features)) {
            car.features = car.features.map((f) => {
              if (typeof f === "string") {
                return { id: f, name: f, icon: "" };
              }
              return {
                id: f.feature_id || f.id || "",
                name: f.name || f.feature || "",
                icon: cleanIcon(f.icon),
              };
            });
          }

          setCarData(car);
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
  }, [carId, cleanIcon]);

  // Calculate night count
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const days = moment(dateRange[1]).diff(moment(dateRange[0]), "days");
      setNightCount(days > 0 ? days : 1);
    }
  }, [dateRange]);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper functions
  const handleModalOutsideClick = (e, modalRef, closeFunction) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeFunction();
    }
  };

  const formatDate = (date, loc) => {
    if (!date) return "";
    if (loc === "ar") return moment(date).format("DD/MM/YYYY");
    return moment(date).format("MMM DD, YYYY");
  };

  const handleDateChange = (value) => {
    setDateRange(value);
    setIsCalendarOpen(false);
  };

  const handleReviewSuccess = (reviewData) => {
    console.log("Review submitted:", reviewData);
  };

  // Parse car images
  const carImages = useMemo(() => {
    if (!carData?.image) return [];
    return carData.image.split("//CAMP//").map((url, i) => ({
      src: url.trim(),
      alt: `${carData.title} - Image ${i + 1}`,
    }));
  }, [carData]);

  // ============================================
  // BOOKING FLOW
  // ============================================

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error(
        locale === "ar"
          ? "يرجى تسجيل الدخول للحجز"
          : "Please login to make a booking"
      );
      setTimeout(() => (window.location.href = `/${locale}/login`), 1500);
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      toast.error(
        locale === "ar"
          ? "يرجى اختيار تواريخ الحجز"
          : "Please select booking dates"
      );
      return;
    }

    if (nightCount <= 0) {
      toast.error(
        locale === "ar"
          ? "يرجى اختيار نطاق تاريخ صالح"
          : "Please select valid date range"
      );
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleInvitationSubmit = (code) => {
    setInvitationLoading(true);
    setTimeout(() => {
      setManualInviteCode(code);
      setInvitationLoading(false);
      setIsInvitationModalOpen(false);
      setIsConfirmModalOpen(true);
    }, 600);
  };

  const handleConfirmBooking = async () => {
    setIsConfirmModalOpen(false);
    setIsBookingModalOpen(true);
    setBookingLoading(true);
    setBookingError(null);

    try {
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
        invite_code: inviteCode || "",
      };

      const response = await axios.post(
        `${base_url}/user/cars/reserve_car.php`,
        bookingData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        clearCurrentInviteCode();

        setIsBookingModalOpen(false);
        setBookingDetails({
          carName: carData.title,
          days: nightCount,
          startDate: formatDate(dateRange[0], locale),
          endDate: formatDate(dateRange[1], locale),
          totalPrice: totalPrice.toFixed(2),
          drivingType:
            drivingType === "self_riding"
              ? locale === "ar"
                ? "قيادة ذاتية"
                : "Self Driving"
              : locale === "ar"
                ? "مع سائق"
                : "With Driver",
          invitationCode: inviteCode,
        });
        setIsSuccessModalOpen(true);
      } else {
        setBookingError(
          response.data.message ||
            (locale === "ar"
              ? "فشل الحجز. يرجى المحاولة مرة أخرى."
              : "Booking failed. Please try again.")
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(
        err.response?.data?.message ||
          (locale === "ar"
            ? "خطأ في الشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
            : "Network error. Please check your connection and try again.")
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const closeConfirmModal = () => setIsConfirmModalOpen(false);
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingLoading(false);
    setBookingError(null);
  };
  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setBookingDetails(null);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading || inviteCodeLoading) {
    return (
      <>
        <Breadcrumb
          pagename={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
          pagetitle={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
        />
        <div className="transport-details-section pt-[50px] mb-[30px]">
          <div className="container">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div
                  style={{ borderBottom: "2px solid #e8a355" }}
                  className="animate-spin rounded-full h-16 w-16 mx-auto"
                />
                <p className="mt-4 text-lg">
                  {locale === "ar"
                    ? "جاري تحميل تفاصيل السيارة..."
                    : "Loading car details..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error || !carData) {
    return (
      <>
        <Breadcrumb
          pagename={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
          pagetitle={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
        />
        <div className="transport-details-section pt-[50px] mb-[30px]">
          <div className="container">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="text-6xl text-red-500 mb-4">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {locale === "ar" ? "السيارة غير موجودة" : "Car Not Found"}
                </h2>
                <p className="text-gray-600">
                  {error ||
                    (locale === "ar"
                      ? "تعذر العثور على السيارة المطلوبة."
                      : "The requested car could not be found.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Calculate prices
  const currentPrice = parseFloat(carData.price_current || 0);
  const totalPrice = nightCount > 0 ? currentPrice * nightCount : currentPrice;

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <>
      <Breadcrumb
        pagename={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
        pagetitle={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
      />

      <div className="transport-details-section pt-[50px] mb-[30px]">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            {/* LEFT COLUMN - Car Details */}
            <div className="col-lg-8">
              {/* Car Images */}
              <div className="transport-image-area mb-50">
                <div className="w-full">
                  {carImages.length > 0 ? (
                    <SlickCarousel images={carImages} />
                  ) : (
                    <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
                      <p className="text-gray-500">
                        {locale === "ar"
                          ? "لا توجد صور متاحة"
                          : "No images available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Car Title */}
              <h3 className="text-2xl font-bold mb-4">{carData.title}</h3>

              {/* Features List */}
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

              {/* Subtitle */}
              <p className="text-base mb-4">{carData.subtitle}</p>

              {/* Car Type */}
              <p className="text-base mb-4">
                <strong>
                  {locale === "ar" ? "نوع السيارة:" : "Car Type:"}
                </strong>{" "}
                {carData.car_type}
              </p>

              {/* ✅ Car Features with Icons */}
              {carData.features && carData.features.length > 0 && (
                <>
                  <h4 className="text-xl font-semibold mt-5 mb-3">
                    {locale === "ar" ? "مميزات السيارة" : "Car Features"}
                  </h4>
                  <div className="features-area mb-[20px]">
                    <div className="bg-[#f8f8f8] p-4 rounded-lg mb-4">
                      <ul className="flex items-center gap-4 flex-wrap">
                        {carData.features.map((feature, i) => (
                          <li
                            key={feature.id || i}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* ✅ عرض الـ Icon */}
                            {feature.icon && (
                              <span
                                className="feature-icon flex-shrink-0 [&>span]:flex [&>span]:items-center [&_svg]:w-5 [&_svg]:h-5 [&>span]:text-[#e8a355]"
                                dangerouslySetInnerHTML={{
                                  __html: feature.icon,
                                }}
                              />
                            )}
                            {/* ✅ عرض الاسم */}
                            <span className="text-sm font-medium text-gray-700">
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {/* FAQ Section */}
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
                <h4>
                  {locale === "ar" ? "تقييمات العملاء" : "Customer Review"}
                </h4>
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
                      <span>
                        {carData?.reviews_count || "2590"}{" "}
                        {locale === "ar" ? "تقييم" : "Reviews"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="primary-btn1"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    {locale === "ar" ? "أضف تقييمك" : "GIVE A RATING"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Booking Sidebar */}
            <div className="col-lg-4">
              <div className="transport-sidebar">
                <div className="booking-form-wrap">
                  <h4>
                    {locale === "ar"
                      ? "احجز وسيلة النقل"
                      : "Reserve Your Transport"}
                  </h4>
                  <p>
                    {locale === "ar"
                      ? "احجز السيارات في ثوانٍ. توفر فوري، جدولة مرنة، تسعير شفاف، ودعم على مدار الساعة."
                      : "Book cars in seconds. Real-time availability, flexible scheduling, transparent pricing, and 24/7 support."}
                  </p>

                  <div className="tab-content" id="v-pills-tabContent2">
                    <div
                      className="tab-pane fade active show"
                      id="v-pills-booking"
                      role="tabpanel"
                    >
                      <div className="sidebar-booking-form">
                        <form onSubmit={handleFormSubmit}>
                          {/* Date Selection */}
                          <h6 className="text-lg font-semibold mb-3">
                            {locale === "ar"
                              ? "اختر تاريخ الحجز:"
                              : "Select Your Reserve Date:"}
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
                                  value={`${formatDate(dateRange[0], locale)} - ${formatDate(dateRange[1], locale)}`}
                                  placeholder={
                                    locale === "ar"
                                      ? "اختر نطاق التاريخ"
                                      : "Select Date Range"
                                  }
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
                                      formatShortWeekday={(loc, date) =>
                                        loc === "ar"
                                          ? moment(date)
                                              .locale("ar")
                                              .format("dd")
                                              .charAt(0)
                                          : moment(date).format("dd").charAt(0)
                                      }
                                      formatMonthYear={(loc, date) =>
                                        loc === "ar"
                                          ? moment(date)
                                              .locale("ar")
                                              .format("MMMM YYYY")
                                          : moment(date).format("MMMM YYYY")
                                      }
                                      nextLabel={
                                        <i className="bi bi-chevron-right" />
                                      }
                                      prevLabel={
                                        <i className="bi bi-chevron-left" />
                                      }
                                      next2Label={null}
                                      prev2Label={null}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Driving Type Selection */}
                          <h6 className="text-lg font-semibold mb-3">
                            {locale === "ar"
                              ? "اختر نوع القيادة:"
                              : "Select Driving Type:"}
                          </h6>
                          <div className="flex gap-2.5 mb-5">
                            <div
                              className={`flex-1 p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${
                                drivingType === "self_riding"
                                  ? "border-[#e8a355] bg-[#fff7e6] text-[#e8a355] font-bold"
                                  : "border-gray-200 bg-white hover:border-[#e8a355]"
                              }`}
                              onClick={() => setDrivingType("self_riding")}
                            >
                              <div>
                                {locale === "ar"
                                  ? "قيادة ذاتية"
                                  : "Self Driving"}
                              </div>
                              <small className="text-gray-500">
                                {locale === "ar"
                                  ? "قُد بنفسك"
                                  : "Drive yourself"}
                              </small>
                            </div>
                            <div
                              className={`flex-1 p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${
                                drivingType === "with_driver"
                                  ? "border-[#e8a355] bg-[#fff7e6] text-[#e8a355] font-bold"
                                  : "border-gray-200 bg-white hover:border-[#e8a355]"
                              }`}
                              onClick={() => setDrivingType("with_driver")}
                            >
                              <div>
                                {locale === "ar" ? "مع سائق" : "With Driver"}
                              </div>
                              <small className="text-gray-500">
                                {locale === "ar"
                                  ? "سائق محترف"
                                  : "Professional driver"}
                              </small>
                            </div>
                          </div>

                          {/* Price per Day */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">
                                {carData.title}:
                              </span>
                              <span className="text-base font-medium">
                                ${currentPrice} /{" "}
                                {carData.price_note?.toLowerCase() ||
                                  (locale === "ar" ? "يوم" : "day")}
                              </span>
                            </div>
                          </div>

                          {/* Number of Days */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">
                                {locale === "ar"
                                  ? "عدد الأيام:"
                                  : "Number of Days:"}
                              </span>
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm text-[#e8a355] font-bold">
                                {nightCount}
                              </div>
                            </div>
                          </div>

                          {/* Total Price */}
                          <div className="flex items-center justify-between p-4 mb-6 bg-orange-50 rounded-lg">
                            <span className="text-lg font-semibold">
                              {locale === "ar"
                                ? "السعر الإجمالي:"
                                : "Total Price:"}
                            </span>
                            <span className="text-xl font-bold text-[#e8a355]">
                              ${totalPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* Book Now Button */}
                          <button
                            type="submit"
                            className="w-full py-4 px-6 text-white font-semibold primary-btn1 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          >
                            {locale === "ar" ? "احجز الآن" : "Book Now"}
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

      {/* MODALS */}
      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
          onClick={(e) =>
            handleModalOutsideClick(e, confirmModalRef, closeConfirmModal)
          }
        >
          <div
            ref={confirmModalRef}
            className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl animate-[slideUp_0.3s_ease-out] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h5 className="text-lg font-bold flex items-center gap-2 m-0">
                <i className="bi bi-check-circle text-blue-500"></i>
                {locale === "ar" ? "تأكيد الحجز" : "Confirm Your Booking"}
              </h5>
              <button
                onClick={closeConfirmModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors border-none bg-transparent"
              >
                <i className="bi bi-x-lg text-gray-500"></i>
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                <i className="bi bi-info-circle mr-2"></i>
                {locale === "ar"
                  ? "يرجى مراجعة تفاصيل الحجز بعناية قبل التأكيد."
                  : "Please review your booking details carefully before confirming."}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h6 className="text-[#295557] font-bold mb-3 text-sm flex items-center gap-2">
                  <i className="bi bi-car-front"></i>
                  {locale === "ar" ? "ملخص الحجز" : "Booking Summary"}
                </h6>

                {[
                  {
                    icon: "bi-tag",
                    label: locale === "ar" ? "السيارة" : "Car",
                    value: carData.title,
                  },
                  {
                    icon: "bi-geo-alt",
                    label: locale === "ar" ? "الموقع" : "Location",
                    value: carData.location || "N/A",
                  },
                  {
                    icon: "bi-gear",
                    label: locale === "ar" ? "نوع القيادة" : "Driving Type",
                    value:
                      drivingType === "self_riding"
                        ? locale === "ar"
                          ? "قيادة ذاتية"
                          : "Self Driving"
                        : locale === "ar"
                          ? "مع سائق"
                          : "With Driver",
                  },
                  {
                    icon: "bi-calendar-check",
                    label: locale === "ar" ? "تاريخ البداية" : "Start Date",
                    value: formatDate(dateRange[0], locale),
                  },
                  {
                    icon: "bi-calendar-x",
                    label: locale === "ar" ? "تاريخ النهاية" : "End Date",
                    value: formatDate(dateRange[1], locale),
                  },
                  {
                    icon: "bi-clock",
                    label: locale === "ar" ? "المدة" : "Duration",
                    value: `${nightCount} ${
                      nightCount === 1
                        ? locale === "ar"
                          ? "يوم"
                          : "Day"
                        : locale === "ar"
                          ? "أيام"
                          : "Days"
                    }`,
                  },
                  {
                    icon: "bi-currency-exchange",
                    label: locale === "ar" ? "السعر اليومي" : "Daily Rate",
                    value: `$${currentPrice.toFixed(2)}`,
                  },
                  {
                    icon: "bi-calculator",
                    label: locale === "ar" ? "المبلغ الإجمالي" : "Total Amount",
                    value: `$${totalPrice.toFixed(2)}`,
                    isTotal: true,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center py-2 ${
                      row.isTotal
                        ? "border-t-2 border-gray-200 mt-2 pt-3 font-bold text-[#e8a355] text-lg"
                        : "border-b border-gray-200"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        row.isTotal ? "text-[#e8a355]" : "text-gray-500"
                      } text-sm flex items-center`}
                    >
                      {row.icon && <i className={`bi ${row.icon} mr-2`}></i>}
                      {row.label}:
                    </span>
                    <span
                      className={`font-semibold ${
                        row.isTotal ? "text-[#e8a355]" : "text-gray-800"
                      } text-sm`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <i className="bi bi-exclamation-triangle mr-2"></i>
                <strong>{locale === "ar" ? "مهم:" : "Important:"}</strong>{" "}
                {locale === "ar"
                  ? "سيتم مراجعة حجزك. بمجرد الموافقة، سنرسل رابط الدفع لإكمال الحجز."
                  : "Your booking will be under review. Once approved, we will send a payment link to complete your reservation."}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={closeConfirmModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors border-none cursor-pointer"
              >
                <i className="bi bi-arrow-left mr-2"></i>
                {locale === "ar" ? "رجوع للتعديل" : "Back to Edit"}
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-5 py-2.5 bg-gradient-to-br from-[#e8a355] to-[#d4903e] text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all border-none cursor-pointer"
              >
                {locale === "ar" ? "تأكيد الحجز" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Loading/Error Modal */}
      {isBookingModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
          onClick={(e) =>
            !bookingLoading &&
            handleModalOutsideClick(e, bookingModalRef, closeBookingModal)
          }
        >
          <div
            ref={bookingModalRef}
            className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl animate-[slideUp_0.3s_ease-out] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h5 className="text-lg font-bold m-0">
                {bookingLoading
                  ? locale === "ar"
                    ? "جاري معالجة الحجز..."
                    : "Processing Booking..."
                  : locale === "ar"
                    ? "خطأ في الحجز"
                    : "Booking Error"}
              </h5>
              {!bookingLoading && (
                <button
                  onClick={closeBookingModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors border-none bg-transparent"
                >
                  <i className="bi bi-x-lg text-gray-500"></i>
                </button>
              )}
            </div>

            <div className="px-6 py-8 text-center">
              {bookingLoading && (
                <>
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e8a355] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {locale === "ar"
                      ? "يرجى الانتظار أثناء معالجة حجزك..."
                      : "Please wait while we process your booking..."}
                  </p>
                </>
              )}

              {bookingError && (
                <>
                  <div className="text-red-500 mb-3">
                    <i
                      className="bi bi-exclamation-triangle-fill"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h4 className="text-red-500 font-bold mb-3">
                    {locale === "ar" ? "فشل الحجز" : "Booking Failed"}
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {bookingError}
                  </div>
                </>
              )}
            </div>

            {!bookingLoading && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={closeBookingModal}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors border-none cursor-pointer"
                >
                  {locale === "ar" ? "إغلاق" : "Close"}
                </button>
                {bookingError && (
                  <button
                    onClick={() => {
                      closeBookingModal();
                      setIsConfirmModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-br from-[#e8a355] to-[#d4903e] text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all border-none cursor-pointer"
                  >
                    {locale === "ar" ? "حاول مرة أخرى" : "Try Again"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      <BookingSuccessModal
        open={isSuccessModalOpen}
        onClose={closeSuccessModal}
        bookingDetails={bookingDetails}
      />

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

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Features with Icons Styling */
        .feature-icon span {
          color: #e8a355 !important;
        }

        .feature-icon svg {
          stroke: #e8a355;
        }
      `}</style>
    </>
  );
};

export default Page;
