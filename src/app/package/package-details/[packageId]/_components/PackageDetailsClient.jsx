// PackageDetailsClient.jsx
"use client";
import React, { useEffect, useState, Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import {
  FaCalendar,
  FaHotel,
  FaCar,
  FaMapMarkerAlt,
  FaFilePdf,
  FaDownload,
} from "react-icons/fa";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  setTourData,
  setTourInfo,
  setPeopleCount,
  selectHotel,
  calculateTotal,
  refreshUserId,
  initializeTourGuide,
  initializeActivities,
  restoreSavedSelections,
  setDayCars,
} from "@/lib/redux/slices/tourReservationSlice";
import useTourDetails from "../../../../../hooks/useTourDetails";
import LoadingSpinner from "../../../../../components/common/LoadingSpinner";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import PackageInfo from "./PackageInfo";
import IncludedExcluded from "./IncludedExcluded";
import TourHighlights from "./TourHighlights";
import ItineraryDay from "./ItineraryDay";
import TourMapWrapper from "./TourMapWrapper";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";
import "./style.css";
import { FaRegEye } from "react-icons/fa6";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return null;
    const parsed = new Date(year, month - 1, day);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

const buildEndDate = (startDate, durationDays) => {
  const duration = Math.max(Number(durationDays || 1), 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration - 1);
  return endDate;
};

const getInclusiveDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const isSameDate = (a, b) => {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return formatDateLocal(a) === formatDateLocal(b);
};

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const GallerySection = dynamic(() => import("./GallerySection"), {
  loading: () => (
    <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});
const Reviews = dynamic(() => import("./Reviews"), {
  loading: () => (
    <div className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
  ),
});
const BookingSidebar = dynamic(() => import("./BookingSidebar"), {
  loading: () => (
    <div className="bg-gray-100 p-6 rounded-lg animate-pulse">...</div>
  ),
});
const Modals = dynamic(() => import("./Modals"), { ssr: false });

// ─── Main Component ───────────────────────────────────────────────────────────

const PackageDetailsClient = () => {
  const { packageId } = useParams();
  const t = useTranslations("packageDetails");
  const locale = useLocale();
  const dispatch = useDispatch();
  const { tourData, loading, error } = useTourDetails(packageId);

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay || {}
  );
  const restoredAdults = useSelector(
    (state) => state.tourReservation?.numAdults || 1
  );
  const restoredChildren = useSelector(
    (state) => state.tourReservation?.numChildren || 0
  );
  const restoredInfants = useSelector(
    (state) => state.tourReservation?.numInfants || 0
  );
  const restoredStartDate = useSelector(
    (state) => state.tourReservation?.startDate || null
  );
  const restoredEndDate = useSelector(
    (state) => state.tourReservation?.endDate || null
  );

  const [isOpen, setOpen] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [people, setPeople] = useState({ adults: 1, children: 0, infants: 0 });
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });
  const [activeAccommodations, setActiveAccommodations] = useState({});
  const [activeTransfers, setActiveTransfers] = useState({});
  const [selectedTours, setSelectedTours] = useState({
    title: "",
    hotels: [],
    transfers: [],
    activities: [],
  });
  const [hasRestored, setHasRestored] = useState(false);

  // ✅ Track whether user had saved data in localStorage
  const [hadSavedData, setHadSavedData] = useState(false);

  const peopleHydratedRef = useRef(false);
  const datesHydratedRef = useRef(false);
  const initRef = useRef(false);

  const { inviteCode, hasStoredCode } = useInviteCode(
    INVITE_CODE_TYPES.TOUR,
    packageId
  );

  const [dateValue, setDateValue] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [today, today];
  });

  const formatDate = (date) =>
    date.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short",
      day: "numeric",
    });

  const formattedDate = (date) =>
    date instanceof Date && !isNaN(date)
      ? date.toLocaleDateString("en-US", {
          timeZone: "Africa/Cairo",
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : "Invalid Date";

  // 1. Initial Load & Restore
  useEffect(() => {
    dispatch(refreshUserId());
    if (packageId) {
      dispatch(restoreSavedSelections(packageId));

      // ✅ Check if there was saved data BEFORE restore
      try {
        const raw = localStorage.getItem("tourReservations");
        if (raw) {
          const parsed = JSON.parse(raw);
          const saved = parsed?.[String(packageId)];
          // Has saved data = had actual selections (not just empty shell)
          const hasSaved =
            saved &&
            (Object.keys(saved.selectedByDay || {}).length > 0 ||
              saved.numAdults > 1 ||
              saved.numChildren > 0);
          setHadSavedData(!!hasSaved);
        }
      } catch {
        setHadSavedData(false);
      }

      setHasRestored(true);
    }
  }, [dispatch, packageId]);

  // 2. Hydrate dates from Redux / itinerary duration
  useEffect(() => {
    if (!hasRestored) return;
    if (!tourData?.itinerary?.length) return;
    if (datesHydratedRef.current) return;

    const duration = tourData.itinerary.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let finalStart = today;
    let finalEnd = buildEndDate(today, duration);

    const savedStart = parseDateString(restoredStartDate);
    const savedEnd = parseDateString(restoredEndDate);

    if (savedStart) {
      finalStart = savedStart;
      if (savedEnd && getInclusiveDays(savedStart, savedEnd) === duration) {
        finalEnd = savedEnd;
      } else {
        finalEnd = buildEndDate(savedStart, duration);
      }
    }

    setDateValue((prev) => {
      if (
        prev?.length === 2 &&
        isSameDate(prev[0], finalStart) &&
        isSameDate(prev[1], finalEnd)
      ) {
        return prev;
      }
      return [finalStart, finalEnd];
    });

    dispatch(
      setTourInfo({
        startDate: formatDateLocal(finalStart),
        endDate: formatDateLocal(finalEnd),
      })
    );

    datesHydratedRef.current = true;
  }, [hasRestored, tourData, restoredStartDate, restoredEndDate, dispatch]);

  // 3. Hydrate People from Redux
  useEffect(() => {
    if (!hasRestored || peopleHydratedRef.current) return;
    const nextPeople = {
      adults: restoredAdults || 1,
      children: restoredChildren || 0,
      infants: restoredInfants || 0,
    };
    setPeople((prev) => {
      const isSame =
        prev.adults === nextPeople.adults &&
        prev.children === nextPeople.children &&
        prev.infants === nextPeople.infants;
      return isSame ? prev : nextPeople;
    });
    peopleHydratedRef.current = true;
  }, [hasRestored, restoredAdults, restoredChildren, restoredInfants]);

  // 4. Transform Data
  const transformedData = React.useMemo(() => {
    if (!tourData) return null;

    const getYouTubeVideoId = (videoInput) => {
      if (!videoInput) return null;
      if (
        videoInput.length === 11 &&
        !videoInput.includes("/") &&
        !videoInput.includes(".")
      )
        return videoInput;
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtube\.com\/embed\/)([^?\s]+)/,
        /(?:youtu\.be\/)([^?\s]+)/,
      ];
      for (const pattern of patterns) {
        const match = videoInput.match(pattern);
        if (match && match[1]) return match[1];
      }
      return videoInput;
    };

    const images =
      tourData.gallery?.map((img, index) => ({
        id: index + 1,
        imageBig: img.image,
      })) || [];

    const days =
      tourData.itinerary?.map((day, index) => {
        const dayDate = new Date(dateValue[0]);
        dayDate.setDate(dayDate.getDate() + index);
        return {
          day: day.day,
          isTourguide: day.isTourguide,
          guide_price: day.guide_price,
          date: formattedDate(dayDate),
          location: { en: day.title, ar: day.title },
          description: { en: day.description, ar: day.description },
          accommodation:
            day.hotel_options?.map((hotel) => ({
              id: parseInt(hotel.hotel_id),
              image: hotel.image?.split("//CAMP//")[0] || hotel.image,
              name: { en: hotel.title, ar: hotel.title },
              category: { en: "Hotel", ar: "فندق" },
              price_per_night: parseFloat(hotel.adult_price || 0),
              per_room: parseInt(hotel.per_room || 6),
              amenities: hotel.amenities || [],
              originalData: hotel,
            })) || [],
          transfers:
            day.cars_options?.map((car) => ({
              id: parseInt(car.car_id),
              image: car.image?.split("//CAMP//")[0] || car.image,
              name: { en: car.title, ar: car.title },
              category: { en: "Car", ar: "سيارة" },
              price: parseFloat(car.price_current || 0),
              capacity: car.max_people,
              features: car.features || [],
              originalData: car,
            })) || [],
          activities:
            day.activities_options?.map((activity) => ({
              id: parseInt(activity.activity_id),
              activity_id: parseInt(activity.activity_id),
              title: { en: activity.title, ar: activity.title },
              image: activity.image?.split("//CAMP//")[0] || activity.image,
              price: parseFloat(activity.price_current || 0),
              features: activity.features || [],
              originalData: activity,
            })) || [],
        };
      }) || [];

    return {
      ...tourData,
      images,
      days,
      videoId: getYouTubeVideoId(tourData.video_link),
      attachments: Array.isArray(tourData.attachments)
        ? tourData.attachments.filter(Boolean)
        : [],
    };
  }, [tourData, dateValue]);

  const mapHotelForRedux = React.useCallback(
    (accommodation) => ({
      id: accommodation.id,
      hotel_id: accommodation.id,
      title: accommodation.name?.en || accommodation.name,
      image: accommodation.image,
      adult_price: accommodation.price_per_night,
      ...accommodation.originalData,
    }),
    []
  );

  const mapCarForRedux = React.useCallback(
    (transfer, withDriver = false) => ({
      id: transfer.id,
      car_id: transfer.id,
      title: transfer.name?.en || transfer.name,
      image: transfer.image,
      price_current: transfer.price,
      capacity: transfer.capacity,
      withDriver,
      ...transfer.originalData,
    }),
    []
  );

  const calculatePriceDifference = (selectedPrice, defaultPrice) =>
    defaultPrice - (selectedPrice || defaultPrice);

  const handleAccommodationClick = (accommodation, dayIndex) => {
    const dayNumber = dayIndex + 1;

    if (activeAccommodations[dayIndex]?.id !== accommodation.id) {
      setActiveAccommodations((prev) => ({
        ...prev,
        [dayIndex]: accommodation,
      }));
      dispatch(
        selectHotel({ day: dayNumber, hotel: mapHotelForRedux(accommodation) })
      );
      dispatch(calculateTotal());
    }

    // ✅ لو إجمالي المسافرين > 2 → يلف الكارت عشان يوزع الغرف
    // ✅ لو ≤ 2 → مش محتاج يلف (أوضة واحدة تلقائي)
    const totalTravelers = people.adults + people.children;

    if (totalTravelers > 2) {
      setSelectedAccommodation({ ...accommodation, dayIndex });
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
      setSelectedAccommodation(null);
    }
  };

  const handleTransferClick = (transfer, dayIndex) => {
    const dayNumber = dayIndex + 1;
    setActiveTransfers((prev) => ({ ...prev, [dayIndex]: transfer }));
  };

  const handleDateChange = (newValue) => {
    const start = Array.isArray(newValue) ? newValue[0] : newValue;
    if (!start || !(start instanceof Date) || isNaN(start)) return;

    const duration =
      tourData?.itinerary?.length || transformedData?.days?.length || 1;
    const end = buildEndDate(start, duration);

    setDateValue([start, end]);
    dispatch(
      setTourInfo({
        startDate: formatDateLocal(start),
        endDate: formatDateLocal(end),
      })
    );
  };

  const scrollToDiv = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const localPeopleCaughtUpRef = useRef(false);

  // 5. Sync People to Redux
  useEffect(() => {
    if (!hasRestored) return;

    // ✅ Wait for local state to match restored state before enabling sync
    if (!localPeopleCaughtUpRef.current) {
      if (
        people.adults === (restoredAdults || 1) &&
        people.children === (restoredChildren || 0) &&
        people.infants === (restoredInfants || 0)
      ) {
        localPeopleCaughtUpRef.current = true;
      } else {
        return; // Skip syncing to Redux until local state has caught up
      }
    }

    const reduxMatchesLocal =
      people.adults === restoredAdults &&
      people.children === restoredChildren &&
      people.infants === restoredInfants;

    if (!reduxMatchesLocal) {
      dispatch(
        setPeopleCount({
          adults: people.adults,
          children: people.children,
          infants: people.infants,
        })
      );
      dispatch(calculateTotal());
      setIsFlipped(false);
      setSelectedAccommodation(null);
    }
  }, [
    people,
    dispatch,
    hasRestored,
    restoredAdults,
    restoredChildren,
    restoredInfants,
  ]);

  // 6. Main Initialization
  useEffect(() => {
    if (!hasRestored || !tourData?.itinerary?.length || !transformedData)
      return;
    if (initRef.current) return;
    initRef.current = true;

    dispatch(setTourData(transformedData));
    dispatch(initializeTourGuide(tourData.itinerary));
    dispatch(initializeActivities(tourData.itinerary));

    const restoredActiveAcc = {};
    const restoredActiveTransfers = {};

    transformedData.days.forEach((day, index) => {
      const dayNumber = index + 1;
      const dayKey = String(dayNumber);
      const savedDay = selectedByDay?.[dayKey] || {};

      // ─── Hotel ───────────────────────────────────────────────────────────
      const savedHotel = savedDay?.hotel;
      const finalHotel =
        day.accommodation?.find(
          (a) => a.id === parseInt(savedHotel?.id || savedHotel?.hotel_id)
        ) || day.accommodation?.[0];

      if (finalHotel) {
        restoredActiveAcc[index] = finalHotel;
        if (!savedHotel) {
          dispatch(
            selectHotel({
              day: dayNumber,
              hotel: mapHotelForRedux(finalHotel),
            })
          );
        }
      }

      // ─── Cars ─────────────────────────────────────────────────────────────
      const savedCars = Array.isArray(savedDay?.cars)
        ? savedDay.cars
        : savedDay?.car
          ? [savedDay.car]
          : [];

      // ✅ Find the matching transfer for the active UI indicator
      const matchedTransfer =
        savedCars.length > 0
          ? day.transfers?.find(
              (t) => t.id === parseInt(savedCars[0]?.id || savedCars[0]?.car_id)
            )
          : null;

      const finalTransfer = matchedTransfer || day.transfers?.[0];

      if (finalTransfer) {
        restoredActiveTransfers[index] = finalTransfer;

        // ✅ Only dispatch default car if:
        // 1. No saved cars from localStorage
        // 2. User didn't have previous saved data (first visit)
        // This prevents "no car selected" false positive on first visit
        if (!savedCars.length) {
          dispatch(
            setDayCars({
              day: dayNumber,
              cars: [mapCarForRedux(finalTransfer, false)],
            })
          );
        }
      }
    });

    setActiveAccommodations(restoredActiveAcc);
    setActiveTransfers(restoredActiveTransfers);
    setTimeout(() => dispatch(calculateTotal()), 100);
  }, [
    hasRestored,
    transformedData,
    tourData,
    selectedByDay,
    dispatch,
    mapHotelForRedux,
    mapCarForRedux,
  ]);

  const items = React.useMemo(() => {
    if (!transformedData) return [];
    return [
      {
        key: "3",
        label: { en: "Hotels", ar: "الفنادق" },
        children: transformedData.days
          .map((day, idx) => {
            const hId = parseInt(
              selectedByDay?.[String(idx + 1)]?.hotel?.id || 0
            );
            const hotel = hId
              ? day.accommodation?.find((h) => h.id === hId)
              : null;
            return hotel
              ? {
                  title: { en: `Day ${idx + 1}`, ar: `اليوم ${idx + 1}` },
                  icon: <FaCalendar />,
                  children: [
                    {
                      title: { en: hotel.name.en, ar: hotel.name.ar },
                      icon: <FaHotel />,
                    },
                  ],
                }
              : null;
          })
          .filter(Boolean),
      },
      {
        key: "4",
        label: { en: "Transfers", ar: "المواصلات" },
        children: transformedData.days
          .map((day, idx) => {
            const cars = selectedByDay?.[String(idx + 1)]?.cars || [];
            return cars.length
              ? {
                  title: { en: `Day ${idx + 1}`, ar: `اليوم ${idx + 1}` },
                  icon: <FaCalendar />,
                  children: cars.map((c) => ({
                    title: {
                      en: `${c.title}${c.withDriver ? " + Driver" : ""}`,
                    },
                    icon: <FaCar />,
                  })),
                }
              : null;
          })
          .filter(Boolean),
      },
    ];
  }, [transformedData, selectedByDay]);

  if (loading)
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );

  if (error || !transformedData)
    return (
      <div className="container mx-auto text-center py-8">
        <h2>{error || "No Data"}</h2>
      </div>
    );

  const formattedRange = `${formatDate(dateValue[0])} - ${formatDate(dateValue[1])}`;

  return (
    <>
      <Breadcrumb
        pagename={transformedData.title}
        pagetitle={transformedData.title}
      />
      <div className="package-details-area pt-120 mb-120 position-relative">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <GallerySection
                images={transformedData.images}
                videoId={transformedData.videoId}
                setOpenimg={setOpenimg}
                isOpenimg={isOpenimg}
                isOpen={isOpen}
                setOpen={setOpen}
              />
            </div>
          </div>
          <div className="row g-xl-4 gy-5">
            <div className="col-xl-8">
              <PackageInfo tourData={transformedData} />
              <IncludedExcluded
                includes={transformedData.includes}
                excludes={transformedData.excludes}
              />
              <TourHighlights highlights={transformedData.highlights} />

              <div className="itinerary-container">
                {transformedData.days.map((dayData, index) => (
                  <ItineraryDay
                    key={index}
                    hotel={dayData}
                    index={index}
                    days={transformedData.days}
                    locale={locale}
                    activeAccommodations={activeAccommodations}
                    activeTransfers={activeTransfers}
                    isFlipped={isFlipped}
                    setIsFlipped={setIsFlipped}
                    selectedAccommodation={selectedAccommodation}
                    setSelectedAccommodation={setSelectedAccommodation}
                    handleAccommodationClick={handleAccommodationClick}
                    handleTransferClick={handleTransferClick}
                    setMapModal={setMapModal}
                    people={people}
                    calculatePriceDifference={calculatePriceDifference}
                  />
                ))}
              </div>

              <div className="tour-location">
                <h4 className="mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt color="#295557" />
                  {t("locationMap")}
                </h4>
                <TourMapWrapper
                  itinerary={tourData?.itinerary || []}
                  height="450px"
                  className="mb-30"
                />
              </div>

              <Reviews
                data={{
                  reviews: tourData?.reviews || [],
                  num_of_reviews: tourData?.num_of_reviews || 0,
                  avg_rate: tourData?.avg_rate || 0,
                }}
              />
            </div>

            <div className="col-xl-4 sticky top-[90px] h-fit">
              <BookingSidebar
                dateValue={dateValue}
                handleDateChange={handleDateChange}
                formattedRange={formattedRange}
                people={people}
                setPeople={setPeople}
                items={items}
                scrollToDiv={scrollToDiv}
                packageId={packageId}
                tourData={transformedData}
                inviteCode={inviteCode}
                hasInviteCode={hasStoredCode}
              />
            </div>
          </div>
        </div>
        <Modals mapModal={mapModal} setMapModal={setMapModal} />
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default PackageDetailsClient;
