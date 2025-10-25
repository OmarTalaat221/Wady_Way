"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import GallerySection from "./GallerySection";
import PackageInfo from "./PackageInfo";
import IncludedExcluded from "./IncludedExcluded";
import TourHighlights from "./TourHighlights";
import TripExperience from "./TripExperience";
import ItineraryDay from "./ItineraryDay";
import FAQ from "./FAQ";
import Reviews from "./Reviews";
import BookingSidebar from "./BookingSidebar";
import Modals from "./Modals";
import { FaCalendar, FaHotel, FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import useTourDetails from "../../../../../hooks/useTourDetails";
import LoadingSpinner from "../../../../../components/common/LoadingSpinner";

const PackageDetailsClient = () => {
  const { packageId } = useParams();

  useEffect(() => {
    console.log(packageId, "packageId");
  }, [packageId]);
  const t = useTranslations("packageDetails");
  const tSummary = useTranslations("packageSummary");
  const locale = useLocale();

  // Fetch tour data
  const { tourData, loading, error } = useTourDetails(packageId);

  // Existing state
  const [isOpen, setOpen] = useState(false);
  const [rowData, setRowData] = useState({});
  const [learnModal, setLearnModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [rooms, setRooms] = useState([
    {
      id: 1,
      adults: 1,
      children: 0,
      infants: 0,
    },
  ]);

  const [people, setPeople] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  const [activeAccommodations, setActiveAccommodations] = useState({});
  const [selectedTours, setSelectedTours] = useState({
    title: "",
    hotels: [],
    transfers: [],
    activities: [],
  });

  // Date handling
  const today = new Date();
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);
  const twoDaysLater = new Date(oneDayLater);
  twoDaysLater.setDate(
    oneDayLater.getDate() + (tourData?.itinerary?.length || 3) - 1
  );

  const [dateValue, setDateValue] = useState([oneDayLater, twoDaysLater]);

  // Transform API data to component format
  const transformedData = React.useMemo(() => {
    if (!tourData) return null;

    // Transform gallery
    const images =
      tourData.gallery?.map((img, index) => ({
        id: index + 1,
        imageBig: img.image,
      })) || [];

    // Transform itinerary days
    const days =
      tourData.itinerary?.map((day, index) => ({
        day: day.day,
        date: formattedDate(
          new Date(
            new Date(dateValue[0]).setDate(
              new Date(dateValue[0]).getDate() + index
            )
          )
        ),
        location: {
          en: day.title,
          ar: day.title, // You might want to add Arabic translations
        },
        description: {
          en: day.description,
          ar: day.description,
        },
        accommodation:
          day.hotel_options?.map((hotel) => ({
            id: parseInt(hotel.hotel_id),
            image: hotel.image?.split("//CAMP//")[0] || hotel.image,
            name: {
              en: hotel.title,
              ar: hotel.title,
            },
            category: {
              en: "Hotel", // You might want to determine this from amenities
              ar: "فندق",
            },
            check_in_out: "15:00 / 11:00", // Default values
            location: {
              en: "City center",
              ar: "مركز المدينة",
            },
            parking: {
              en: "Available",
              ar: "متوفر",
            },
            price_per_night: parseFloat(hotel.adult_price),
            rating: 4.5, // Default rating
            reviews: 100,
            amenities: hotel.amenities || [],
          })) || [],
        transfers:
          day.cars_options?.map((car) => ({
            id: parseInt(car.car_id),
            image: car.image?.split("//CAMP//")[0] || car.image,
            name: {
              en: car.title,
              ar: car.title,
            },
            category: {
              en: "Car",
              ar: "سيارة",
            },
            duration: {
              en: "Flexible",
              ar: "مرن",
            },
            language: {
              en: "English",
              ar: "الإنجليزية",
            },
            price: parseFloat(car.price_current),
            rating: 4.5,
            reviews: 100,
            difficulty: {
              en: "Easy",
              ar: "سهل",
            },
            capacity: 4,
            features: car.features || [],
          })) || [],
        activities:
          day.activities_options?.map((activity) => ({
            id: parseInt(activity.activity_id),
            title: {
              en: activity.title,
              ar: activity.title,
            },
            duration: {
              en: "2 hours",
              ar: "ساعتان",
            },
            difficulty: {
              en: "Moderate",
              ar: "متوسط",
            },
            language: {
              en: "English",
              ar: "الإنجليزية",
            },
            location: {
              en: day.title,
              ar: day.title,
            },
            price: parseFloat(activity.price_current),
            image: activity.image?.split("//CAMP//")[0] || activity.image,
            features: activity.features || [],
          })) || [],
      })) || [];

    // Fallback FAQ data if not in API
    const faqData = [
      {
        id: "travelcollapseOne",
        question: {
          en: "01. What is included in this tour?",
          ar: "01. ما هو المشمول في هذه الجولة؟",
        },
        answer: {
          en:
            tourData.includes?.join(", ") ||
            "Various inclusions as per itinerary",
          ar: "متنوعة وفقاً للبرنامج",
        },
      },
      {
        id: "travelcollapseTwo",
        question: {
          en: "02. What is the cancellation policy?",
          ar: "02. ما هي سياسة الإلغاء؟",
        },
        answer: {
          en: "Cancellation policy varies. Please contact us for details.",
          ar: "تختلف سياسة الإلغاء. يرجى الاتصال بنا للحصول على التفاصيل.",
        },
      },
      {
        id: "travelcollapseThree",
        question: {
          en: "03. Is transportation included?",
          ar: "03. هل المواصلات مشمولة؟",
        },
        answer: {
          en: "Transportation options are available as shown in the itinerary.",
          ar: "خيارات المواصلات متاحة كما هو موضح في البرنامج.",
        },
      },
    ];

    return {
      ...tourData,
      images,
      days,
      faqData,
      options: days.reduce((acc, day) => [...acc, ...day.activities], []),
    };
  }, [tourData, dateValue]);

  // All your existing functions (calculatePriceDifference, handleToggle, etc.)
  const calculatePriceDifference = (selectedPrice, defaultPrice) => {
    if (!selectedPrice) return defaultPrice;
    return defaultPrice - selectedPrice;
  };

  const handleToggle = (index) => {
    setActiveIndex(activeIndex == index ? null : index);
  };

  // ... (include all your existing handler functions)

  const handleDateChange = (newValue) => {
    const [start] = newValue;
    const end = new Date(start);
    const duration = transformedData?.days?.length || 3;
    end.setDate(start.getDate() + duration - 1);
    setDateValue([start, end]);
  };

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short",
      day: "numeric",
    });
  };

  const formattedDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      timeZone: "Africa/Cairo",
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const scrollToDiv = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Initialize default selections when data loads
  useEffect(() => {
    if (transformedData?.days && transformedData.days.length > 0) {
      const initialActiveAccommodations = {};
      const initialHotels = [];
      const initialTransfers = [];

      transformedData.days.forEach((day, index) => {
        // Set first accommodation as default
        if (day?.accommodation?.length > 0) {
          const accommodation = day.accommodation[0];
          initialActiveAccommodations[index] = accommodation;
          initialHotels.push({
            day: index + 1,
            name: accommodation.name,
            id: accommodation.id,
            price: accommodation.price_per_night,
            location: accommodation.location,
          });
        }

        // Set first transfer as default
        if (day?.transfers?.length > 0) {
          const transfer = day.transfers[0];
          initialTransfers.push({
            day: index + 1,
            name: transfer.name,
            id: transfer.id,
            price: transfer.price,
          });
        }
      });

      setActiveAccommodations(initialActiveAccommodations);
      setSelectedTours((prev) => ({
        ...prev,
        title: transformedData.title,
        hotels: initialHotels,
        transfers: initialTransfers,
      }));
    }
  }, [transformedData]);

  // Build items for BookingSidebar
  const items = React.useMemo(() => {
    if (!transformedData) return [];

    return [
      {
        key: "3",
        label: {
          en: "Hotels",
          ar: "الفنادق",
        },
        children: transformedData.days
          .map((day, index) => {
            const selectedHotels = selectedTours.hotels.filter(
              (selectedHotel) => selectedHotel.day == index + 1
            );

            if (selectedHotels.length == 0) return null;

            return {
              title: {
                en: `Day ${index + 1}`,
                ar: `اليوم ${index + 1}`,
              },
              icon: <FaCalendar />,
              children: [
                {
                  title: day.location,
                  icon: <FaMapMarkerAlt />,
                },
                ...selectedHotels.map((selectedHotel) => {
                  const hotel = day.accommodation.find(
                    (h) => h.id == selectedHotel.id
                  );
                  return {
                    title: {
                      en: `${hotel?.name.en} (${hotel?.category.en})`,
                      ar: `${hotel?.name.ar} (${hotel?.category.ar})`,
                    },
                    icon: <FaHotel />,
                  };
                }),
              ],
            };
          })
          .filter(Boolean),
      },
      {
        key: "4",
        label: {
          en: "Transfers",
          ar: "المواصلات",
        },
        children: transformedData.days
          .map((day, index) => {
            const selectedTransfers = selectedTours.transfers.filter(
              (selectedTransfer) => selectedTransfer.day == index + 1
            );

            if (selectedTransfers.length == 0) return null;

            return {
              title: {
                en: `Day ${index + 1}`,
                ar: `اليوم ${index + 1}`,
              },
              icon: <FaCalendar />,
              children: selectedTransfers.map((selectedTransfer) => {
                const transfer = day.transfers.find(
                  (t) => t.id == selectedTransfer.id
                );

                return {
                  title: {
                    en: `${transfer?.name.en} (${transfer?.price} USD)`,
                    ar: `${transfer?.name.ar} (${transfer?.price} USD)`,
                  },
                  icon: <FaCar />,
                };
              }),
            };
          })
          .filter(Boolean),
      },
    ];
  }, [transformedData, selectedTours]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    );
  }

  // No data state
  if (!transformedData) {
    return (
      <div className="no-data-container">
        <p>No tour data available</p>
      </div>
    );
  }

  const startDate = new Date(dateValue[0]);
  const endDate = new Date(dateValue[1]);
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const formattedRange = `${formattedStartDate} - ${formattedEndDate}`;

  return (
    <>
      <Breadcrumb
        pagename={transformedData.title}
        pagetitle={transformedData.title}
      />
      <div className="package-details-area pt-120 mb-120 position-relative">
        <div className="container">
          <div className="row">
            <div className="co-lg-12">
              <GallerySection
                images={transformedData.images}
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
              <TripExperience
                options={transformedData.options}
                setRowData={setRowData}
                setLearnModal={setLearnModal}
                locale={locale}
              />

              <div className="itinerary-container">
                {transformedData.days.map((hotel, index) => (
                  <ItineraryDay
                    key={index}
                    hotel={hotel}
                    index={index}
                    days={transformedData.days}
                    selectedTours={selectedTours}
                    setSelectedTours={setSelectedTours}
                    activeAccommodations={activeAccommodations}
                    setActiveAccommodations={setActiveAccommodations}
                    isFlipped={isFlipped}
                    setIsFlipped={setIsFlipped}
                    selectedAccommodation={selectedAccommodation}
                    setSelectedAccommodation={setSelectedAccommodation}
                    handleAccommodationClick={handleAccommodationClick}
                    handleFlip={handleFlip}
                    setMapModal={setMapModal}
                    people={people}
                    calculatePriceDifference={calculatePriceDifference}
                    rooms={rooms}
                    setRooms={setRooms}
                    handleRoomChange={handleRoomChange}
                    addRoom={addRoom}
                    removeRoom={removeRoom}
                    confirmRoomSelection={confirmRoomSelection}
                    cancelRoomSelection={cancelRoomSelection}
                  />
                ))}
              </div>

              <div className="tour-location">
                <h4>{t("locationMap")}</h4>
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

              <FAQ
                faqData={transformedData.faqData}
                activeIndex={activeIndex}
                handleToggle={handleToggle}
                locale={locale}
              />
              <Reviews />
            </div>

            <div
              className="col-xl-4"
              style={{
                position: "sticky",
                top: "90px",
                height: "100vh",
              }}
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
              />
            </div>
          </div>
        </div>

        <Modals
          learnModal={learnModal}
          setLearnModal={setLearnModal}
          mapModal={mapModal}
          setMapModal={setMapModal}
          rowData={rowData}
        />
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default PackageDetailsClient;
