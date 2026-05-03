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
import { FaCarSide } from "react-icons/fa6";
import { FreeCancellation, PayAtPickup } from "../../../uitils/icnos";
import axios from "axios";
import { base_url } from "../../../uitils/base_url";
import ReviewModal from "@/components/reviews/ReviewModal";
import { Modal } from "antd";
import toast from "react-hot-toast";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";

/* ─── localStorage helpers ─────────────────────────────────────────────── */
const STORAGE_KEY = "transportReservations";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadTransportStorage(carId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    const entry = all[carId];
    if (!entry) return null;
    if (Date.now() - entry._savedAt > TTL_MS) {
      delete all[carId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function saveTransportStorage(carId, data) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[carId] = { ...data, _savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent
  }
}

function removeTransportFromStorage(carId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const all = JSON.parse(raw);
    delete all[carId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // silent
  }
}
/* ───────────────────────────────────────────────────────────────────────── */

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

  /* ─── core state ──────────────────────────────────────────────────────── */
  const [dateRange, setDateRange] = useState([
    new Date(),
    moment().add(1, "day").toDate(),
  ]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [nightCount, setNightCount] = useState(1);
  const [drivingType, setDrivingType] = useState("self_riding");

  /* ─── data state ──────────────────────────────────────────────────────── */
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ─── restore tracking ────────────────────────────────────────────────── */
  const hasRestoredRef = useRef(false);

  /* ─── invite code ─────────────────────────────────────────────────────── */
  const {
    inviteCode,
    hasStoredCode,
    isLoading: inviteCodeLoading,
    setManualInviteCode,
    clearCurrentInviteCode,
  } = useInviteCode(INVITE_CODE_TYPES.TRANSPORT, carId);

  /* ─── modal / booking state ───────────────────────────────────────────── */
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const calendarRef = useRef(null);

  /* ─── carousel settings ───────────────────────────────────────────────── */
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

  /* ─── UI text (i18n) ──────────────────────────────────────────────────── */
  const uiText = useMemo(() => {
    const isAr = locale === "ar";

    return {
      loginRequired: isAr
        ? "يرجى تسجيل الدخول للحجز"
        : "Please login to make a booking",
      selectDates: isAr
        ? "يرجى اختيار تواريخ الحجز"
        : "Please select booking dates",
      validDateRange: isAr
        ? "يرجى اختيار نطاق تاريخ صالح"
        : "Please select valid date range",
      loadingCar: isAr
        ? "جاري تحميل تفاصيل السيارة..."
        : "Loading car details...",
      notFoundTitle: isAr ? "السيارة غير موجودة" : "Car Not Found",
      notFoundFallback: isAr
        ? "تعذر العثور على السيارة المطلوبة."
        : "The requested car could not be found.",
      featuresTitle: isAr ? "مميزات السيارة" : "Car Features",
      customerReview: isAr ? "تقييمات العملاء" : "Customer Review",
      noReviews: isAr ? "لا توجد تقييمات بعد" : "No reviews yet",
      addReview: isAr ? "أضف تقييمك" : "GIVE A RATING",
      reserveTitle: isAr ? "احجز وسيلة النقل" : "Reserve Your Transport",
      reserveDesc: isAr
        ? "احجز السيارات في ثوانٍ. توفر فوري، جدولة مرنة، تسعير شفاف، ودعم على مدار الساعة."
        : "Book cars in seconds. Real-time availability, flexible scheduling, transparent pricing, and 24/7 support.",
      selectReserveDate: isAr
        ? "اختر تاريخ الحجز:"
        : "Select Your Reserve Date:",
      selectDateRange: isAr ? "اختر نطاق التاريخ" : "Select Date Range",
      selectDrivingType: isAr ? "اختر نوع القيادة:" : "Select Driving Type:",
      selfDriving: isAr ? "قيادة ذاتية" : "Self Driving",
      withDriver: isAr ? "مع سائق" : "With Driver",
      day: isAr ? "يوم" : "day",
      daysLabel: isAr ? "عدد الأيام:" : "Number of Days:",
      totalPrice: isAr ? "السعر الإجمالي:" : "Total Price:",
      bookNow: isAr ? "احجز الآن" : "Book Now",
      confirmTitle: isAr ? "تأكيد الحجز" : "Confirm Your Booking",
      reviewBeforeConfirm: isAr
        ? "يرجى مراجعة تفاصيل الحجز بعناية قبل التأكيد."
        : "Please review your booking details carefully before confirming.",
      bookingSummary: isAr ? "ملخص الحجز" : "Booking Summary",
      backToEdit: isAr ? "رجوع للتعديل" : "Back to Edit",
      confirmBooking: isAr ? "تأكيد الحجز" : "Confirm Booking",
      walletHoldImportantTitle: isAr ? "مهم:" : "Important:",
      walletHoldConfirmNote: isAr
        ? "بمجرد تأكيد الحجز، سيتم عمل حجز مؤقت للمبلغ من محفظتك فورًا، وسيظل الرصيد معلّقًا لحين قبول أو رفض الطلب."
        : "Once you confirm the booking, the total amount will be placed on hold from your wallet immediately and will remain held until the reservation is accepted or rejected.",
      walletHoldConfirmSubNote: isAr
        ? "في حالة رفض الحجز، سيتم فك الحجز المؤقت وإعادة الرصيد إلى محفظتك تلقائيًا."
        : "If the reservation is rejected, the held amount will be released back to your wallet automatically.",
      processingBooking: isAr
        ? "جاري معالجة الحجز..."
        : "Processing Booking...",
      bookingErrorTitle: isAr ? "خطأ في الحجز" : "Booking Error",
      waitProcessing: isAr
        ? "يرجى الانتظار أثناء معالجة حجزك..."
        : "Please wait while we process your booking...",
      bookingFailed: isAr ? "فشل الحجز" : "Booking Failed",
      close: isAr ? "إغلاق" : "Close",
      tryAgain: isAr ? "حاول مرة أخرى" : "Try Again",
      successTitle: isAr ? "تم الحجز بنجاح!" : "Booking Successful!",
      successDescription: isAr
        ? "تم إرسال طلب الحجز بنجاح، وتم عمل حجز مؤقت للمبلغ من محفظتك لحين مراجعة الطلب."
        : "Your booking request has been submitted successfully, and the amount has been placed on hold in your wallet while your reservation is under review.",
      holdStatusTitle: isAr ? "حالة الدفع" : "Payment Status",
      holdStatusValue: isAr
        ? "المبلغ محجوز مؤقتًا من المحفظة"
        : "Amount is on hold in wallet",
      holdInfoBox: isAr
        ? "إذا تم قبول الحجز، سيتم اعتماد المبلغ المحجوز. وإذا تم رفضه، سيتم إعادة الرصيد إلى محفظتك تلقائيًا."
        : "If the reservation is accepted, the held amount will be applied to the booking. If it is rejected, the amount will be returned to your wallet automatically.",
      done: isAr ? "تم" : "Done",
      bookingFailedFallback: isAr
        ? "فشل الحجز. يرجى المحاولة مرة أخرى."
        : "Booking failed. Please try again.",
      networkError: isAr
        ? "خطأ في الشبكة. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
        : "Network error. Please check your connection and try again.",
      car: isAr ? "السيارة" : "Car",
      location: isAr ? "الموقع" : "Location",
      drivingType: isAr ? "نوع القيادة" : "Driving Type",
      startDate: isAr ? "تاريخ البداية" : "Start Date",
      endDate: isAr ? "تاريخ النهاية" : "End Date",
      duration: isAr ? "المدة" : "Duration",
      dailyRate: isAr ? "السعر اليومي" : "Daily Rate",
      dailyRateWithDriver: isAr
        ? "السعر اليومي (العربية + السائق)"
        : "Daily Rate (Car + Driver)",
      totalAmount: isAr ? "المبلغ الإجمالي" : "Total Amount",
      from: isAr ? "من" : "From",
      to: isAr ? "إلى" : "To",
      total: isAr ? "الإجمالي" : "Total",
      reviews: isAr ? "تقييم" : "Reviews",
      noImages: isAr ? "لا توجد صور متاحة" : "No images available",
      reviewPendingMessage: isAr
        ? "طلب الحجز قيد المراجعة مع حجز المبلغ من المحفظة"
        : "Reservation under review with wallet amount on hold",
    };
  }, [locale]);

  /* ─── helpers ─────────────────────────────────────────────────────────── */
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

  const formatDate = (date, loc) => {
    if (!date) return "";
    if (loc === "ar") return moment(date).format("DD/MM/YYYY");
    return moment(date).format("MMM DD, YYYY");
  };

  /* ─── fetch car data ──────────────────────────────────────────────────── */
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

  /* ─── restore from localStorage AFTER carData is loaded ───────────── */
  useEffect(() => {
    if (!carId || !carData?.title || hasRestoredRef.current) return;

    const saved = loadTransportStorage(carId);
    if (!saved) {
      hasRestoredRef.current = true;
      return;
    }

    // restore dates
    if (saved.startDate && saved.endDate) {
      const restoredStart = new Date(saved.startDate);
      const restoredEnd = new Date(saved.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (restoredStart >= today) {
        setDateRange([restoredStart, restoredEnd]);
      }
    }

    // restore driving type
    if (
      saved.drivingType === "self_riding" ||
      saved.drivingType === "with_driver"
    ) {
      setDrivingType(saved.drivingType);
    }

    hasRestoredRef.current = true;
  }, [carId, carData?.title]);

  /* ─── persist to localStorage on every meaningful change ──────────── */
  useEffect(() => {
    if (!carId || !hasRestoredRef.current) return;

    saveTransportStorage(carId, {
      startDate: dateRange[0]?.toISOString() || null,
      endDate: dateRange[1]?.toISOString() || null,
      drivingType,
    });
  }, [carId, dateRange, drivingType]);

  /* ─── night count calc ────────────────────────────────────────────────── */
  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const days = moment(dateRange[1]).diff(moment(dateRange[0]), "days");
      setNightCount(days > 0 ? days : 1);
    }
  }, [dateRange]);

  /* ─── click outside calendar ──────────────────────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ─── date change ─────────────────────────────────────────────────────── */
  const handleDateChange = (value) => {
    setDateRange(value);
    setIsCalendarOpen(false);
  };

  const handleReviewSuccess = (reviewData) => {
    console.log("Review submitted:", reviewData);
  };

  /* ─── derived values ──────────────────────────────────────────────────── */
  const carImages = useMemo(() => {
    if (!carData?.image) return [];
    return carData.image.split("//CAMP//").map((url, i) => ({
      src: url.trim(),
      alt: `${carData.title} - Image ${i + 1}`,
    }));
  }, [carData]);

  const selfRidingPrice = useMemo(() => {
    return parseFloat(carData?.price_current || 0);
  }, [carData]);

  const driverExtraPrice = useMemo(() => {
    return parseFloat(carData?.driver_price || 0);
  }, [carData]);

  const withDriverPrice = useMemo(() => {
    return selfRidingPrice + driverExtraPrice;
  }, [selfRidingPrice, driverExtraPrice]);

  const currentPrice = useMemo(() => {
    return drivingType === "with_driver" ? withDriverPrice : selfRidingPrice;
  }, [drivingType, withDriverPrice, selfRidingPrice]);

  const totalPrice = useMemo(() => {
    return nightCount > 0 ? currentPrice * nightCount : currentPrice;
  }, [currentPrice, nightCount]);

  const displayRating = useMemo(() => {
    if (!carData?.ratings || !Array.isArray(carData.ratings)) return null;
    const validRating = carData.ratings.find(
      (r) => r?.score !== null && r?.score !== undefined && r?.score !== ""
    );
    if (!validRating) return null;
    const raw = parseFloat(validRating.score);
    if (isNaN(raw)) return null;
    return raw > 5 ? raw / 2 : raw;
  }, [carData]);

  /* ─── booking handlers ────────────────────────────────────────────────── */
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error(uiText.loginRequired);
      setTimeout(() => (window.location.href = `/${locale}/login`), 1500);
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      toast.error(uiText.selectDates);
      return;
    }

    if (nightCount <= 0) {
      toast.error(uiText.validDateRange);
      return;
    }

    setIsConfirmModalOpen(true);
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

        // ✅ remove only THIS car from localStorage
        removeTransportFromStorage(carId);

        setIsBookingModalOpen(false);
        setBookingDetails({
          carName: carData.title,
          days: nightCount,
          startDate: formatDate(dateRange[0], locale),
          endDate: formatDate(dateRange[1], locale),
          totalPrice: totalPrice.toFixed(2),
          drivingType:
            drivingType === "self_riding"
              ? uiText.selfDriving
              : uiText.withDriver,
          invitationCode: inviteCode,
          paymentStatus: uiText.holdStatusValue,
        });
        setIsSuccessModalOpen(true);

        // Reset form after success
        setTimeout(() => {
          setDateRange([new Date(), moment().add(1, "day").toDate()]);
          setDrivingType("self_riding");
        }, 500);
      } else {
        setBookingError(response.data.message || uiText.bookingFailedFallback);
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(err.response?.data?.message || uiText.networkError);
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

  /* ─── confirm summary rows ───────────────────────────────────────────── */
  const confirmSummaryRows = useMemo(() => {
    if (!carData) return [];
    return [
      {
        icon: "bi-tag",
        label: uiText.car,
        value: carData.title,
      },
      {
        icon: "bi-geo-alt",
        label: uiText.location,
        value: carData.location || "N/A",
      },
      {
        icon: "bi-gear",
        label: uiText.drivingType,
        value:
          drivingType === "self_riding"
            ? uiText.selfDriving
            : uiText.withDriver,
      },
      {
        icon: "bi-calendar-check",
        label: uiText.startDate,
        value: formatDate(dateRange[0], locale),
      },
      {
        icon: "bi-calendar-x",
        label: uiText.endDate,
        value: formatDate(dateRange[1], locale),
      },
      {
        icon: "bi-clock",
        label: uiText.duration,
        value: `${nightCount} ${
          nightCount === 1 ? uiText.day : locale === "ar" ? "أيام" : "Days"
        }`,
      },
      {
        icon: "bi-currency-exchange",
        label:
          drivingType === "with_driver"
            ? uiText.dailyRateWithDriver
            : uiText.dailyRate,
        value: `$${currentPrice.toFixed(2)}`,
      },
      {
        icon: "bi-wallet2",
        label: uiText.holdStatusTitle,
        value: uiText.holdStatusValue,
      },
      {
        icon: "bi-calculator",
        label: uiText.totalAmount,
        value: `$${totalPrice.toFixed(2)}`,
        isTotal: true,
      },
    ];
  }, [
    carData,
    drivingType,
    dateRange,
    nightCount,
    currentPrice,
    totalPrice,
    locale,
    uiText,
  ]);

  /* ─── loading / error / not found ─────────────────────────────────────── */
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
                <p className="mt-4 text-lg">{uiText.loadingCar}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
                  {uiText.notFoundTitle}
                </h2>
                <p className="text-gray-600">
                  {error || uiText.notFoundFallback}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ─── render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <Breadcrumb
        pagename={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
        pagetitle={locale === "ar" ? "تفاصيل النقل" : "Transport Details"}
      />

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
                      <p className="text-gray-500">{uiText.noImages}</p>
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

              {carData.features && carData.features.length > 0 && (
                <>
                  <h4 className="text-xl font-semibold mt-5 mb-3">
                    {uiText.featuresTitle}
                  </h4>
                  <div className="features-area mb-[20px]">
                    <div className="bg-[#f8f8f8] p-4 rounded-lg mb-4">
                      <ul className="flex items-center gap-4 flex-wrap">
                        {carData.features.map((feature, i) => (
                          <li
                            key={feature.id || i}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                          >
                            {feature.icon && (
                              <span
                                className="feature-icon flex-shrink-0 [&>span]:flex [&>span]:items-center [&_svg]:w-5 [&_svg]:h-5 [&>span]:text-[#e8a355]"
                                dangerouslySetInnerHTML={{
                                  __html: feature.icon,
                                }}
                              />
                            )}
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

              <div className="mb-7">
                <div className="mb-5">
                  <h4 className="text-2xl font-semibold">
                    {t("frequentlyAskedQuestion")}
                  </h4>
                </div>
                <Accordion items={faqData} />
              </div>

              <div className="review-wrapper">
                <h4>{uiText.customerReview}</h4>
                <div className="review-box">
                  <div className="total-review">
                    {displayRating !== null ? (
                      <>
                        <h2>{displayRating.toFixed(1)}</h2>
                        <div className="review-wrap">
                          <ul className="star-list">
                            {[...Array(5)].map((_, i) => (
                              <li key={i}>
                                <i
                                  className={
                                    i < Math.floor(displayRating)
                                      ? "bi bi-star-fill"
                                      : i < displayRating
                                        ? "bi bi-star-half"
                                        : "bi bi-star"
                                  }
                                />
                              </li>
                            ))}
                          </ul>
                          <span>
                            {carData?.reviews_count || ""} {uiText.reviews}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2>—</h2>
                        <div className="review-wrap">
                          <ul className="star-list">
                            {[...Array(5)].map((_, i) => (
                              <li key={i}>
                                <i className="bi bi-star" />
                              </li>
                            ))}
                          </ul>
                          <span>{uiText.noReviews}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    className="primary-btn1"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    {uiText.addReview}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="transport-sidebar">
                <div className="booking-form-wrap">
                  <h4>{uiText.reserveTitle}</h4>
                  <p>{uiText.reserveDesc}</p>

                  <div className="tab-content" id="v-pills-tabContent2">
                    <div
                      className="tab-pane fade active show"
                      id="v-pills-booking"
                      role="tabpanel"
                    >
                      <div className="sidebar-booking-form">
                        <form onSubmit={handleFormSubmit}>
                          <h6 className="text-lg font-semibold mb-3">
                            {uiText.selectReserveDate}
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
                                  placeholder={uiText.selectDateRange}
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

                          <h6 className="text-lg font-semibold mb-3">
                            {uiText.selectDrivingType}
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
                              <div>{uiText.selfDriving}</div>
                              <small className="text-gray-500">
                                ${selfRidingPrice.toFixed(2)} / {uiText.day}
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
                              <div>{uiText.withDriver}</div>
                              <small className="text-gray-500">
                                ${withDriverPrice.toFixed(2)} / {uiText.day}
                              </small>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">
                                {carData.title}:
                              </span>
                              <span className="text-base font-medium">
                                ${currentPrice.toFixed(2)} /{" "}
                                {carData.price_note?.toLowerCase() ||
                                  uiText.day}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">
                                {uiText.daysLabel}
                              </span>
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm text-[#e8a355] font-bold">
                                {nightCount}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 mb-6 bg-orange-50 rounded-lg">
                            <span className="text-lg font-semibold">
                              {uiText.totalPrice}
                            </span>
                            <span className="text-xl font-bold text-[#e8a355]">
                              ${totalPrice.toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-4 px-6 text-white font-semibold primary-btn1 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                          >
                            {uiText.bookNow}
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
      <Modal
        open={isConfirmModalOpen}
        onCancel={closeConfirmModal}
        footer={
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={closeConfirmModal}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors border-none cursor-pointer"
            >
              <i className="bi bi-arrow-left mr-2"></i>
              {uiText.backToEdit}
            </button>
            <button
              onClick={handleConfirmBooking}
              className="px-5 py-2.5 bg-gradient-to-br from-[#e8a355] to-[#d4903e] text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all border-none cursor-pointer"
            >
              {uiText.confirmBooking}
            </button>
          </div>
        }
        centered
        width={600}
        destroyOnClose
        styles={{
          body: {
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "20px 24px",
          },
        }}
        title={
          <div className="flex items-center gap-2">
            <i className="bi bi-check-circle text-blue-500"></i>
            <span className="text-lg font-bold">{uiText.confirmTitle}</span>
          </div>
        }
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
          <i className="bi bi-info-circle mr-2"></i>
          {uiText.reviewBeforeConfirm}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <h6 className="text-[#295557] font-bold mb-3 text-sm flex items-center gap-2">
            <i className="bi bi-car-front"></i>
            {uiText.bookingSummary}
          </h6>

          {confirmSummaryRows.map((row, i) => (
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
                {row.label}:
              </span>
              <span
                className={`font-semibold text-sm text-right ${
                  row.isTotal ? "text-[#e8a355]" : "text-gray-800"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
          <i className="bi bi-wallet2 mr-2"></i>
          <strong>{uiText.walletHoldImportantTitle}</strong>{" "}
          {uiText.walletHoldConfirmNote}
          <div className="mt-2">{uiText.walletHoldConfirmSubNote}</div>
        </div>
      </Modal>

      {/* Booking Status Modal */}
      <Modal
        open={isBookingModalOpen}
        onCancel={bookingLoading ? undefined : closeBookingModal}
        footer={null}
        centered
        width={420}
        closable={!bookingLoading}
        maskClosable={!bookingLoading}
        destroyOnClose
        styles={{
          body: {
            maxHeight: "60vh",
            overflowY: "auto",
            padding: "24px",
          },
        }}
        title={
          <span className="text-lg font-bold">
            {bookingLoading
              ? uiText.processingBooking
              : uiText.bookingErrorTitle}
          </span>
        }
      >
        <div className="text-center py-4">
          {bookingLoading && (
            <>
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e8a355] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">{uiText.waitProcessing}</p>
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
                {uiText.bookingFailed}
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                {bookingError}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={closeBookingModal}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors border-none cursor-pointer"
                >
                  {uiText.close}
                </button>
                <button
                  onClick={() => {
                    closeBookingModal();
                    setIsConfirmModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-br from-[#e8a355] to-[#d4903e] text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all border-none cursor-pointer"
                >
                  {uiText.tryAgain}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={isSuccessModalOpen}
        onCancel={closeSuccessModal}
        footer={null}
        centered
        width={500}
        destroyOnClose
        styles={{
          body: {
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "24px",
          },
        }}
        title={null}
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i
              className="bi bi-check-lg text-green-600"
              style={{ fontSize: "2.5rem" }}
            ></i>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {uiText.successTitle}
          </h3>
          <p className="text-gray-500 mb-6">{uiText.successDescription}</p>

          {bookingDetails && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                {[
                  {
                    icon: "bi-car-front",
                    label: uiText.car,
                    value: bookingDetails.carName,
                  },
                  {
                    icon: "bi-gear",
                    label: uiText.drivingType,
                    value: bookingDetails.drivingType,
                  },
                  {
                    icon: "bi-calendar-check",
                    label: uiText.from,
                    value: bookingDetails.startDate,
                  },
                  {
                    icon: "bi-calendar-x",
                    label: uiText.to,
                    value: bookingDetails.endDate,
                  },
                  {
                    icon: "bi-clock",
                    label: uiText.duration,
                    value: `${bookingDetails.days} ${
                      bookingDetails.days === 1
                        ? uiText.day
                        : locale === "ar"
                          ? "أيام"
                          : "Days"
                    }`,
                  },
                  {
                    icon: "bi-wallet2",
                    label: uiText.holdStatusTitle,
                    value: bookingDetails.paymentStatus,
                  },
                  {
                    icon: "bi-cash-stack",
                    label: uiText.total,
                    value: `$${bookingDetails.totalPrice}`,
                    isTotal: true,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center py-2 ${
                      row.isTotal
                        ? "border-t-2 border-gray-200 mt-2 pt-3 font-bold text-[#e8a355] text-base"
                        : "border-b border-gray-100"
                    }`}
                  >
                    <span
                      className={`text-sm flex items-center gap-1.5 ${
                        row.isTotal
                          ? "text-[#e8a355] font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      {row.label}:
                    </span>
                    <span
                      className={`text-sm font-semibold text-right ${
                        row.isTotal ? "text-[#e8a355]" : "text-gray-800"
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-6 text-left">
                <div className="font-semibold mb-1">
                  <i className="bi bi-info-circle mr-2"></i>
                  {uiText.reviewPendingMessage}
                </div>
                <div>{uiText.holdInfoBox}</div>
              </div>
            </>
          )}

          <button
            onClick={closeSuccessModal}
            className="px-8 py-3 bg-gradient-to-br from-[#295557] to-[#1e3f40] text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all border-none cursor-pointer"
          >
            {uiText.done}
          </button>
        </div>
      </Modal>

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
