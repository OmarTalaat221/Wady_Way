"use client";
import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { FaCalendar, FaHotel, FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  setTourData,
  setTourInfo,
  setPeopleCount,
  selectHotel,
  selectCar,
  calculateTotal,
  refreshUserId,
  initializeTourGuide,
  initializeActivities,
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

const PackageDetailsClient = () => {
  const { packageId } = useParams();

  const t = useTranslations("packageDetails");
  const locale = useLocale();
  const dispatch = useDispatch();
  const { tourData, loading, error } = useTourDetails(packageId);

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay
  );

  const [isOpen, setOpen] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [rooms, setRooms] = useState([
    { id: 1, adults: 1, children: 0, infants: 0 },
  ]);
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

  const {
    inviteCode,
    hasStoredCode,
    isLoading: inviteCodeLoading,
  } = useInviteCode(INVITE_CODE_TYPES.TOUR, packageId);

  const today = new Date();
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);

  const calculateEndDate = (startDate, days) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days || 3) - 1);
    return endDate;
  };

  const [dateValue, setDateValue] = useState([
    oneDayLater,
    calculateEndDate(oneDayLater, tourData?.itinerary?.length),
  ]);

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

  useEffect(() => {
    dispatch(refreshUserId());
  }, [dispatch]);

  const transformedData = React.useMemo(() => {
    if (!tourData) return null;

    const getYouTubeVideoId = (videoInput) => {
      if (!videoInput) return null;
      if (
        videoInput.length === 11 &&
        !videoInput.includes("/") &&
        !videoInput.includes(".")
      ) {
        return videoInput;
      }
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtube\.com\/embed\/)([^?\s]+)/,
        /(?:youtu\.be\/)([^?\s]+)/,
        /(?:youtube\.com\/v\/)([^?\s]+)/,
        /(?:youtube\.com\/shorts\/)([^?\s]+)/,
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
          date: formattedDate(dayDate),
          location: { en: day.title, ar: day.title },
          description: { en: day.description, ar: day.description },
          accommodation:
            day.hotel_options?.map((hotel) => ({
              id: parseInt(hotel.hotel_id),
              image: hotel.image?.split("//CAMP//")[0] || hotel.image,
              name: { en: hotel.title, ar: hotel.title },
              category: { en: "Hotel", ar: "فندق" },
              check_in_out: "15:00 / 11:00",
              location: { en: "City center", ar: "مركز المدينة" },
              parking: { en: "Available", ar: "متوفر" },
              price_per_night: parseFloat(hotel.adult_price || 0),
              rating: 4.5,
              reviews: 100,
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
              capacity: car.capacity || 4,
              features: car.features || [],
              originalData: car,
            })) || [],
          activities:
            day.activities_options?.map((activity) => ({
              id: parseInt(activity.activity_id),
              activity_id: parseInt(activity.activity_id),
              title: { en: activity.title, ar: activity.title },
              duration: { en: "2 hours", ar: "ساعتان" },
              difficulty: { en: "Moderate", ar: "متوسط" },
              image: activity.image?.split("//CAMP//")[0] || activity.image,
              price: parseFloat(activity.price_current || 0),
              price_current: parseFloat(activity.price_current || 0),
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
    };
  }, [tourData, dateValue]);

  const calculatePriceDifference = (selectedPrice, defaultPrice) =>
    defaultPrice - (selectedPrice || defaultPrice);

  const handleToggle = (index) =>
    setActiveIndex(activeIndex === index ? null : index);

  const handleAccommodationClick = (accommodation, dayIndex) => {
    if (activeAccommodations[dayIndex]?.id === accommodation.id) return;
    const dayNumber = dayIndex + 1;

    setActiveAccommodations((prev) => ({ ...prev, [dayIndex]: accommodation }));
    setSelectedTours((prevState) => ({
      ...prevState,
      hotels: [
        ...prevState.hotels.filter((h) => h.day !== dayNumber),
        {
          day: dayNumber,
          name: accommodation.name,
          id: accommodation.id,
          price: accommodation.price_per_night,
          location: accommodation.location,
        },
      ],
    }));

    dispatch(
      selectHotel({
        day: dayNumber,
        hotel: {
          id: accommodation.id,
          hotel_id: accommodation.id,
          title: accommodation.name?.en || accommodation.name,
          name: accommodation.name,
          image: accommodation.image,
          adult_price: accommodation.price_per_night,
          price_per_night: accommodation.price_per_night,
          rating: accommodation.rating,
          category: accommodation.category,
          location: accommodation.location,
          check_in_out: accommodation.check_in_out,
          ...accommodation.originalData,
        },
      })
    );

    dispatch(calculateTotal());
    setRooms([{ id: 1, adults: 1, children: 0, infants: 0 }]);
    setSelectedAccommodation({ ...accommodation, dayIndex });
  };

  const handleTransferClick = (transfer, dayIndex) => {
    if (activeTransfers[dayIndex]?.id === transfer.id) return;
    const dayNumber = dayIndex + 1;

    setActiveTransfers((prev) => ({ ...prev, [dayIndex]: transfer }));
    setSelectedTours((prevState) => ({
      ...prevState,
      transfers: [
        ...prevState.transfers.filter((t) => t.day !== dayNumber),
        {
          day: dayNumber,
          name: transfer.name,
          id: transfer.id,
          price: transfer.price,
        },
      ],
    }));

    dispatch(
      selectCar({
        day: dayNumber,
        car: {
          id: transfer.id,
          car_id: transfer.id,
          title: transfer.name?.en || transfer.name,
          name: transfer.name,
          image: transfer.image,
          price_current: transfer.price,
          price: transfer.price,
          capacity: transfer.capacity,
          category: transfer.category,
          ...transfer.originalData,
        },
      })
    );

    dispatch(calculateTotal());
  };

  const handleFlip = (dayIndex) => {
    const totalTravelers = people.adults + people.children;
    if (totalTravelers >= 3 && activeAccommodations[dayIndex]) {
      setSelectedAccommodation({ ...activeAccommodations[dayIndex], dayIndex });
      setIsFlipped(true);
    }
  };

  const handleRoomChange = (action, roomId, type) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          const updatedRoom = { ...room };
          const totalTravelers = people.adults + people.children;
          const currentRoomTotal = room.adults + room.children;
          const otherRoomsTotal = prevRooms.reduce(
            (total, r) =>
              r.id !== roomId ? total + r.adults + r.children : total,
            0
          );

          if (
            action === "increase" &&
            otherRoomsTotal + currentRoomTotal < totalTravelers
          ) {
            updatedRoom[type] += 1;
          } else if (action === "decrease" && updatedRoom[type] > 0) {
            if (
              type === "adults" &&
              updatedRoom.adults === 1 &&
              updatedRoom.children === 0 &&
              rooms.length > 1
            )
              return room;
            if (
              type === "adults" &&
              updatedRoom.adults <= 1 &&
              rooms.length === 1
            )
              return room;
            updatedRoom[type] -= 1;
          }
          return updatedRoom;
        }
        return room;
      })
    );
  };

  const addRoom = () => {
    if (rooms.length >= 5) return;
    const totalTravelers = people.adults + people.children;
    const currentlyAssigned = rooms.reduce(
      (total, room) => total + room.adults + room.children,
      0
    );

    if (currentlyAssigned < totalTravelers) {
      const newRoomId = Math.max(...rooms.map((r) => r.id)) + 1;
      setRooms([
        ...rooms,
        { id: newRoomId, adults: 1, children: 0, infants: 0 },
      ]);
    }
  };

  const removeRoom = (roomId) => {
    if (rooms.length <= 1) return;
    setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
  };

  const confirmRoomSelection = () => {
    const totalTravelers = people.adults + people.children;
    const assignedTravelers = rooms.reduce(
      (total, room) => total + room.adults + room.children,
      0
    );

    if (assignedTravelers !== totalTravelers) {
      alert(`Please assign all ${totalTravelers} travelers.`);
      return;
    }

    if (selectedAccommodation) {
      setIsFlipped(false);
    }
  };

  const cancelRoomSelection = () => {
    setIsFlipped(false);
    setRooms([{ id: 1, adults: 1, children: 0, infants: 0 }]);
  };

  const handleDateChange = (newValue) => {
    const [start] = newValue;
    const duration = transformedData?.days?.length || 3;
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    setDateValue([start, end]);

    dispatch(
      setTourInfo({
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      })
    );
  };

  const scrollToDiv = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    dispatch(
      setPeopleCount({
        adults: people.adults,
        children: people.children,
        infants: people.infants,
      })
    );
    dispatch(calculateTotal());
    setRooms([{ id: 1, adults: 1, children: 0, infants: 0 }]);
    setIsFlipped(false);
  }, [people, dispatch]);

  // ✅ التهيئة الرئيسية
  useEffect(() => {
    if (!tourData?.itinerary || tourData.itinerary.length === 0) {
      return;
    }

    console.log("🚀 Starting initialization...");
    console.log("📦 tourData.itinerary:", tourData.itinerary);

    // 1. تخزين بيانات التور
    dispatch(setTourData(transformedData));

    // 2. ✅ تهيئة Tour Guide
    dispatch(initializeTourGuide(tourData.itinerary));

    // 3. ✅ تهيئة Activities
    dispatch(initializeActivities(tourData.itinerary));

    // 4. تهيئة الفنادق والسيارات
    const initialActiveAcc = {};
    const initialActiveTransfers = {};
    const initialHotels = [];
    const initialTransfers = [];

    transformedData.days.forEach((day, index) => {
      const dayNumber = index + 1;

      if (day.accommodation?.[0]) {
        const acc = day.accommodation[0];
        initialActiveAcc[index] = acc;
        initialHotels.push({
          day: dayNumber,
          name: acc.name,
          id: acc.id,
          price: acc.price_per_night,
          location: acc.location,
        });

        dispatch(
          selectHotel({
            day: dayNumber,
            hotel: {
              id: acc.id,
              hotel_id: acc.id,
              title: acc.name?.en || acc.name,
              name: acc.name,
              image: acc.image,
              adult_price: acc.price_per_night,
              price_per_night: acc.price_per_night,
              rating: acc.rating,
              category: acc.category,
              location: acc.location,
              ...acc.originalData,
            },
          })
        );
      }

      if (day.transfers?.[0]) {
        const transfer = day.transfers[0];
        initialActiveTransfers[index] = transfer;
        initialTransfers.push({
          day: dayNumber,
          name: transfer.name,
          id: transfer.id,
          price: transfer.price,
        });

        dispatch(
          selectCar({
            day: dayNumber,
            car: {
              id: transfer.id,
              car_id: transfer.id,
              title: transfer.name?.en || transfer.name,
              name: transfer.name,
              image: transfer.image,
              price_current: transfer.price,
              price: transfer.price,
              capacity: transfer.capacity,
              category: transfer.category,
              ...transfer.originalData,
            },
          })
        );
      }
    });

    setActiveAccommodations(initialActiveAcc);
    setActiveTransfers(initialActiveTransfers);
    setSelectedTours((prev) => ({
      ...prev,
      title: transformedData.title,
      hotels: initialHotels,
      transfers: initialTransfers,
    }));

    setTimeout(() => {
      dispatch(calculateTotal());
    }, 100);
  }, [tourData?.itinerary]);

  useEffect(() => {
    if (tourData?.itinerary?.length) {
      const newEndDate = calculateEndDate(
        dateValue[0],
        tourData.itinerary.length
      );
      setDateValue([dateValue[0], newEndDate]);

      dispatch(
        setTourInfo({
          startDate: dateValue[0].toISOString().split("T")[0],
          endDate: newEndDate.toISOString().split("T")[0],
        })
      );
    }
  }, [tourData?.itinerary?.length]);

  const items = React.useMemo(() => {
    if (!transformedData) return [];
    return [
      {
        key: "3",
        label: { en: "Hotels", ar: "الفنادق" },
        children: transformedData.days
          .map((day, index) => ({
            title: { en: `Day ${index + 1}`, ar: `اليوم ${index + 1}` },
            icon: <FaCalendar />,
            children: [
              { title: day.location, icon: <FaMapMarkerAlt /> },
              ...selectedTours.hotels
                .filter((sh) => sh.day === index + 1)
                .map((sh) => {
                  const h = day.accommodation.find((h) => h.id === sh.id);
                  return {
                    title: { en: `${h?.name.en}`, ar: `${h?.name.ar}` },
                    icon: <FaHotel />,
                  };
                }),
            ],
          }))
          .filter((d) => d.children.length > 1),
      },
      {
        key: "4",
        label: { en: "Transfers", ar: "المواصلات" },
        children: transformedData.days
          .map((day, index) => ({
            title: { en: `Day ${index + 1}`, ar: `اليوم ${index + 1}` },
            icon: <FaCalendar />,
            children: selectedTours.transfers
              .filter((st) => st.day === index + 1)
              .map((st) => {
                const t = day.transfers.find((t) => t.id === st.id);
                return {
                  title: { en: `${t?.name.en}`, ar: `${t?.name.ar}` },
                  icon: <FaCar />,
                };
              }),
          }))
          .filter((d) => d.children.length > 0),
      },
    ];
  }, [transformedData, selectedTours]);

  if (loading)
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p>{error}</p>
      </div>
    );
  if (!transformedData)
    return (
      <div className="container mx-auto text-center py-8">
        <h2 className="text-2xl font-bold">No Data</h2>
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
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
                }
              >
                <GallerySection
                  images={transformedData.images}
                  videoId={transformedData.videoId}
                  setOpenimg={setOpenimg}
                  isOpenimg={isOpenimg}
                  isOpen={isOpen}
                  setOpen={setOpen}
                />
              </Suspense>
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
                    selectedTours={selectedTours}
                    setSelectedTours={setSelectedTours}
                    activeAccommodations={activeAccommodations}
                    activeTransfers={activeTransfers}
                    isFlipped={isFlipped}
                    selectedAccommodation={selectedAccommodation}
                    handleAccommodationClick={handleAccommodationClick}
                    handleTransferClick={handleTransferClick}
                    handleFlip={handleFlip}
                    setMapModal={setMapModal}
                    people={people}
                    calculatePriceDifference={calculatePriceDifference}
                    rooms={rooms}
                    handleRoomChange={handleRoomChange}
                    addRoom={addRoom}
                    removeRoom={removeRoom}
                    confirmRoomSelection={confirmRoomSelection}
                    cancelRoomSelection={cancelRoomSelection}
                  />
                ))}
              </div>

              <div className="tour-location">
                <h4
                  className="mb-4"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#333",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#295557"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {t("locationMap")}
                </h4>

                <TourMapWrapper
                  itinerary={tourData?.itinerary || []}
                  height="450px"
                  className="mb-30"
                />
              </div>

              <Suspense
                fallback={
                  <div className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
                }
              >
                <Reviews
                  data={{
                    reviews: tourData?.reviews || [],
                    num_of_reviews: tourData?.num_of_reviews || 0,
                    avg_rate: tourData?.avg_rate || 0,
                  }}
                />
              </Suspense>
            </div>

            <div
              className="col-xl-4"
              style={{ position: "sticky", top: "90px", height: "100vh" }}
            >
              <Suspense
                fallback={
                  <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
                    ...
                  </div>
                }
              >
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
                  selectedTours={selectedTours}
                  inviteCode={inviteCode}
                  hasInviteCode={hasStoredCode}
                />
              </Suspense>
            </div>
          </div>
        </div>
        <Suspense fallback={null}>
          <Modals mapModal={mapModal} setMapModal={setMapModal} />
        </Suspense>
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default PackageDetailsClient;
