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

const PackageDetailsClient = () => {
  const { packageId } = useParams();
  const t = useTranslations("packageDetails");
  const tSummary = useTranslations("packageSummary");
  const locale = useLocale();

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

  const calculatePriceDifference = (selectedPrice, defaultPrice) => {
    if (!selectedPrice) return defaultPrice;
    return defaultPrice - selectedPrice;
  };

  const [people, setPeople] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  // Replace the single activeAccommodation state with a map of active accommodations by day
  const [activeAccommodations, setActiveAccommodations] = useState({});

  const handleToggle = (index) => {
    setActiveIndex(activeIndex == index ? null : index);
  };

  // Reset rooms when people count changes
  useEffect(() => {
    setRooms([
      {
        id: 1,
        adults: 1,
        children: 0,
        infants: 0,
      },
    ]);
    // Also reset flip and active accommodation if travelers change
    setIsFlipped(false);
  }, [people]);

  const handleAccommodationClick = (accommodation, dayIndex) => {
    // Create a copy of the current active accommodations
    const updatedActiveAccommodations = { ...activeAccommodations };

    // If clicking on the same accommodation that's already active for this day, do nothing
    if (updatedActiveAccommodations[dayIndex]?.id == accommodation.id) {
      return;
    }

    // Set this accommodation as active for this specific day
    updatedActiveAccommodations[dayIndex] = accommodation;
    setActiveAccommodations(updatedActiveAccommodations);

    // Update selectedTours state to match the active accommodation
    setSelectedTours((prevState) => ({
      ...prevState,
      hotels: [
        ...prevState.hotels.filter((h) => h.day !== dayIndex + 1),
        {
          day: dayIndex + 1,
          name: accommodation.name,
          id: accommodation.id,
          price: accommodation.price_per_night,
          location: accommodation.location,
        },
      ],
    }));

    // Reset rooms when changing accommodation
    setRooms([
      {
        id: 1,
        adults: 1,
        children: 0,
        infants: 0,
      },
    ]);

    // Set as selected accommodation for room selection if needed
    setSelectedAccommodation({ ...accommodation, dayIndex });
  };

  const handleFlip = (dayIndex) => {
    const totalTravelers = people.adults + people.children + people.infants;
    if (totalTravelers >= 3 && activeAccommodations[dayIndex]) {
      setSelectedAccommodation({ ...activeAccommodations[dayIndex], dayIndex });
      setIsFlipped(true);
    }
  };

  const handleRoomChange = (action, roomId, type) => {
    setRooms((prevRooms) => {
      const updatedRooms = prevRooms.map((room) => {
        if (room.id == roomId) {
          const updatedRoom = { ...room };

          if (action == "increase") {
            // Check total travelers before increasing
            const totalTravelers =
              people.adults + people.children + people.infants;
            const currentRoomTotal = room.adults + room.children + room.infants;
            const otherRoomsTotal = prevRooms.reduce((total, r) => {
              if (r.id !== roomId) {
                return total + r.adults + r.children + r.infants;
              }
              return total;
            }, 0);

            if (otherRoomsTotal + currentRoomTotal + 1 <= totalTravelers) {
              updatedRoom[type] += 1;
            }
          } else if (action == "decrease" && room[type] > 0) {
            // Don't allow adults to go below 1
            if (type == "adults" && room[type] <= 1) {
              return room;
            }
            updatedRoom[type] -= 1;
          }

          return updatedRoom;
        }
        return room;
      });

      return updatedRooms;
    });
  };

  const addRoom = () => {
    // Check if we already have 5 rooms
    if (rooms.length >= 5) return;

    // Check if we have enough travelers for another room
    const totalTravelers = people.adults + people.children + people.infants;
    const currentlyAssigned = rooms.reduce((total, room) => {
      return total + room.adults + room.children + room.infants;
    }, 0);

    // Only add room if we have unassigned travelers
    if (currentlyAssigned < totalTravelers) {
      const newRoomId = Math.max(...rooms.map((r) => r.id)) + 1;
      setRooms([
        ...rooms,
        {
          id: newRoomId,
          adults: 1,
          children: 0,
          infants: 0,
        },
      ]);
    }
  };

  const removeRoom = (roomId) => {
    if (rooms.length <= 1) return; // Don't remove the last room

    setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
  };

  const confirmRoomSelection = () => {
    if (selectedAccommodation && selectedAccommodation.dayIndex !== undefined) {
      // Update selectedTours state directly
      setSelectedTours((prevState) => ({
        ...prevState,
        hotels: [
          ...prevState.hotels.filter(
            (h) => h.day !== selectedAccommodation.dayIndex + 1
          ),
          {
            day: selectedAccommodation.dayIndex + 1,
            name: selectedAccommodation.name,
            id: selectedAccommodation.id,
            price: selectedAccommodation.price_per_night,
            location: selectedAccommodation.location,
          },
        ],
      }));
      setIsFlipped(false);
    }
  };

  const cancelRoomSelection = () => {
    setIsFlipped(false);
    // Reset rooms to initial state and clear active accommodation
    setRooms([
      {
        id: 1,
        adults: 1,
        children: 0,
        infants: 0,
      },
    ]);
  };

  const [selectedTours, setSelectedTours] = useState({
    title: "",
    hotels: [
      {
        day: 3,
        name: {
          en: "Fosshotel Baron",
          ar: "فوسهوتيل بارون",
        },
        id: 78,
        price: 300,
        location: {
          en: "1.2 km from center",
          ar: "1.2 كم من المركز",
        },
      },
      {
        day: 2,
        name: {
          en: "Fosshotel Baron",
          ar: "فوسهوتيل بارون",
        },
        id: 4,
        price: 670,
        location: {
          en: "1.2 km from center",
          ar: "1.2 كم من المركز",
        },
      },
      {
        day: 1,
        name: {
          en: "KEX Hostel",
          ar: "نزل كيكس",
        },
        id: 1,
        price: 42,
        location: {
          en: "1 km from center",
          ar: "1 كم من المركز",
        },
      },
    ],
    transfers: [
      {
        day: 1,
        name: {
          en: "Private Car",
          ar: "سيارة خاصة",
        },
        id: 1,
        price: 50,
      },
      {
        day: 2,
        name: {
          en: "Domestic Flight",
          ar: "رحلة داخلية",
        },
        id: 3,
        price: 150,
      },
      {
        day: 3,
        name: {
          en: "Private Car Transfer",
          ar: "نقل بسيارة خاصة",
        },
        id: 5,
        price: 100,
      },
    ],
  });

  const faqData = [
    {
      id: "travelcollapseOne",
      question: {
        en: "01. What is ski touring?",
        ar: "01. ما هو التزلج الاستكشافي؟",
      },
      answer: {
        en: "Ski touring is a form of skiing where participants travel across snow-covered terrain using skis. It often involves traversing backcountry or off-piste areas, away from ski resorts.",
        ar: "التزلج الاستكشافي هو شكل من أشكال التزلج حيث يسافر المشاركون عبر التضاريس المغطاة بالثلوج باستخدام الزلاجات. غالبًا ما يتضمن عبور المناطق النائية أو خارج المسارات، بعيدًا عن منتجعات التزلج.",
      },
    },
    {
      id: "travelcollapseTwo",
      question: {
        en: "02. What equipment do I need for ski touring?",
        ar: "02. ما هي المعدات التي أحتاجها للتزلج الاستكشافي؟",
      },
      answer: {
        en: "Essential equipment includes touring skis, bindings, climbing skins, poles, boots suitable for touring, safety gear (avalanche transceiver, shovel, probe), and appropriate clothing for variable weather conditions.",
        ar: "تشمل المعدات الأساسية زلاجات التزلج الاستكشافي، والمرابط، وجلود التسلق، والأعمدة، والأحذية المناسبة للتزلج الاستكشافي، ومعدات السلامة (جهاز إرسال واستقبال الانهيارات الثلجية، والمجرفة، والمسبار)، والملابس المناسبة للظروف الجوية المتغيرة.",
      },
    },
    {
      id: "travelcollapseThree",
      question: {
        en: "03. How is ski touring different from downhill skiing?",
        ar: "03. كيف يختلف التزلج الاستكشافي عن التزلج المنحدر؟",
      },
      answer: {
        en: "Ski touring involves ascending slopes using skins or other equipment, then descending using skis. It's more about the journey and exploring off-piste terrain than the controlled descents found in downhill skiing at resorts.",
        ar: "يتضمن التزلج الاستكشافي صعود المنحدرات باستخدام الجلود أو معدات أخرى، ثم النزول باستخدام الزلاجات. إنه يتعلق أكثر بالرحلة واستكشاف التضاريس خارج المسارات أكثر من الانحدارات المتحكم بها الموجودة في التزلج المنحدر في المنتجعات.",
      },
    },
  ];

  const today = new Date();
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);

  const twoDaysLater = new Date(oneDayLater);
  twoDaysLater.setDate(oneDayLater.getDate() + 2);
  const [dateValue, setDateValue] = useState([oneDayLater, twoDaysLater]);

  const handleDateChange = (newValue) => {
    const [start] = newValue;
    const end = new Date(start);
    end.setDate(start.getDate() + 2);

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
    if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; // Handle invalid date
    return date.toLocaleDateString("en-US", {
      timeZone: "Africa/Cairo",
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const scrollToDiv = (id) => {
    console.log(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const startDate = new Date(dateValue[0]);
  const endDate = new Date(dateValue[1]);
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const formattedRange = `${formattedStartDate} - ${formattedEndDate}`;

  const options = [
    {
      id: 0,
      title: {
        en: "Golden Circle Classic Tour",
        ar: "جولة الدائرة الذهبية الكلاسيكية",
      },
      duration: {
        en: "8 hours",
        ar: "8 ساعات",
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
        en: "Reykjavik, Iceland",
        ar: "ريكيافيك، آيسلندا",
      },
      price: 120,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
    {
      id: 1,
      title: {
        en: "Northern Lights Adventure",
        ar: "مغامرة الأضواء الشمالية",
      },
      duration: {
        en: "4 hours",
        ar: "4 ساعات",
      },
      difficulty: {
        en: "Easy",
        ar: "سهل",
      },
      language: {
        en: "English",
        ar: "الإنجليزية",
      },
      location: {
        en: "Reykjavik, Iceland",
        ar: "ريكيافيك، آيسلندا",
      },
      price: 95,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
  ];

  const days = [
    {
      day: 1,
      date: formattedDate(startDate),
      location: {
        en: "Reykjavik",
        ar: "ريكيافيك",
      },
      description: {
        en: "Day one offers the choice of sightseeing around the Snaefellsnes Peninsula or exploring Reykjavik.",
        ar: "يقدم اليوم الأول خيار مشاهدة المعالم السياحية حول شبه جزيرة سنايفلسنيس أو استكشاف ريكيافيك.",
      },
      accommodation: [
        {
          id: 1,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
          name: {
            en: "KEX Hostel",
            ar: "نزل كيكس",
          },
          category: {
            en: "Hostel",
            ar: "نزل",
          },
          check_in_out: "15:00 / 11:00",
          location: {
            en: "1 km from center",
            ar: "1 كم من المركز",
          },
          parking: {
            en: "Available",
            ar: "متوفر",
          },
          price_per_night: 42,
          rating: 4.3,
          reviews: 2410,
        },
        {
          id: 2,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729863/Accommodation_3_k7ycha.png",
          name: {
            en: "Stay Apartments Bolholt",
            ar: "شقق ستاي بولهولت",
          },
          category: {
            en: "Apartment",
            ar: "شقة",
          },
          check_in_out: "15:00 / 11:00",
          location: {
            en: "2.4 km from center",
            ar: "2.4 كم من المركز",
          },
          parking: {
            en: "Available",
            ar: "متوفر",
          },
          price_per_night: 123,
          rating: 4.2,
          reviews: 458,
        },
      ],
      transfers: [
        {
          id: 1,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735075/21_oo6clb.png",
          name: {
            en: "Private Car",
            ar: "سيارة خاصة",
          },
          category: {
            en: "jeep",
            ar: "جيب",
          },
          duration: {
            en: "4 seats",
            ar: "4 مقاعد",
          },
          language: {
            en: "English",
            ar: "الإنجليزية",
          },
          price: 50,
          rating: 4.5,
          reviews: 120,
          difficulty: {
            en: "Easy",
            ar: "سهل",
          },
          capacity: 4,
        },
        {
          id: 2,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735071/19_wtfslb.png",
          name: {
            en: "Family car",
            ar: "سيارة عائلية",
          },
          category: {
            en: "jeep",
            ar: "جيب",
          },
          duration: {
            en: "2 seats",
            ar: "مقعدان",
          },
          language: {
            en: "English",
            ar: "الإنجليزية",
          },
          price: 25,
          rating: 4.0,
          reviews: 350,
          difficulty: {
            en: "Easy",
            ar: "سهل",
          },
          capacity: 5,
        },
      ],
    },
    {
      day: 2,
      date: formattedDate(
        new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
      ),
      location: {
        en: "Akureyri",
        ar: "أكوريري",
      },
      description: {
        en: "Explore the northern capital of Iceland.",
        ar: "استكشف العاصمة الشمالية لآيسلندا.",
      },
      accommodation: [
        {
          id: 4,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
          name: {
            en: "Fosshotel Baron",
            ar: "فوسهوتيل بارون",
          },
          category: {
            en: "3 Stars Hotel",
            ar: "فندق 3 نجوم",
          },
          check_in_out: "15:00 / 11:00",
          location: {
            en: "1.2 km from center",
            ar: "1.2 كم من المركز",
          },
          parking: {
            en: "Available",
            ar: "متوفر",
          },
          price_per_night: 670,
          rating: 4.0,
          reviews: 1230,
        },
        {
          id: 3,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png",
          name: {
            en: "Stay Apartments Bolholt",
            ar: "شقق ستاي بولهولت",
          },
          category: {
            en: "Apartment",
            ar: "شقة",
          },
          check_in_out: "15:00 / 11:00",
          location: {
            en: "2.4 km from center",
            ar: "2.4 كم من المركز",
          },
          parking: {
            en: "Available",
            ar: "متوفر",
          },
          price_per_night: 222,
          rating: 4.2,
          reviews: 458,
        },
      ],
      transfers: [
        {
          id: 3,
          language: {
            en: "English",
            ar: "الإنجليزية",
          },
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729914/Domestic_Flight_wuqhnh.png",
          name: {
            en: "Domestic Flight",
            ar: "رحلة داخلية",
          },
          category: {
            en: "Flight",
            ar: "رحلة طيران",
          },
          duration: {
            en: "1 hour",
            ar: "ساعة واحدة",
          },
          price: 150,
          rating: 4.7,
          reviews: 890,
          difficulty: {
            en: "Easy",
            ar: "سهل",
          },
          capacity: 30,
        },
        {
          id: 4,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729917/Scenic_Bus_Ride_gyyuz3.png",
          name: {
            en: "Scenic Bus Ride",
            ar: "رحلة حافلة خلابة",
          },
          category: {
            en: "Bus",
            ar: "حافلة",
          },
          duration: {
            en: "5 hours",
            ar: "5 ساعات",
          },
          language: {
            en: "English",
            ar: "الإنجليزية",
          },
          price: 75,
          rating: 4.2,
          reviews: 560,
          difficulty: {
            en: "Easy",
            ar: "سهل",
          },
          capacity: 20,
        },
      ],
    },
    {
      day: 3,
      date: formattedDate(
        new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 2))
      ),
      location: {
        en: "Akureyri",
        ar: "أكوريري",
      },
      description: {
        en: "Explore the northern capital of Iceland.",
        ar: "استكشف العاصمة الشمالية لآيسلندا.",
      },
      accommodation: [
        {
          id: 78,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
          name: {
            en: "Fosshotel Baron",
            ar: "فوسهوتيل بارون",
          },
          category: {
            en: "3 Stars Hotel",
            ar: "فندق 3 نجوم",
          },
          check_in_out: "15:00 / 11:00",
          location: {
            en: "1.2 km from center",
            ar: "1.2 كم من المركز",
          },
          parking: {
            en: "Available",
            ar: "متوفر",
          },
          price_per_night: 300,
          rating: 4.0,
          reviews: 1230,
        },
        {
          id: 3,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png",
          name: {
            en: "Stay Apartments Bolholt",
            ar: "شقق ستاي بولهولت",
          },
          category: {
            en: "Apartment",
            ar: "شقة",
          },
          check_in_out: "15:00 / 11:00",
          location: {
            en: "2.4 km from center",
            ar: "2.4 كم من المركز",
          },
          parking: {
            en: "Available",
            ar: "متوفر",
          },
          price_per_night: 222,
          rating: 4.2,
          reviews: 458,
        },
      ],
      transfers: [
        {
          id: 5,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735075/21_oo6clb.png",
          name: {
            en: "Private Car Transfer",
            ar: "نقل بسيارة خاصة",
          },
          category: {
            en: "Private Transfer",
            ar: "نقل خاص",
          },
          duration: {
            en: "1 hour",
            ar: "ساعة واحدة",
          },
          language: {
            en: "English",
            ar: "الإنجليزية",
          },
          price: 100,
          rating: 4.6,
          reviews: 320,
          difficulty: {
            en: "Easy",
            ar: "سهل",
          },
          capacity: 4,
        },
        {
          id: 6,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735071/19_wtfslb.png",
          name: {
            en: "Bike Rental",
            ar: "تأجير دراجات",
          },
          category: {
            en: "Self-Transfer",
            ar: "نقل ذاتي",
          },
          duration: {
            en: "Flexible",
            ar: "مرن",
          },
          language: {
            en: "English",
            ar: "الإنجليزية",
          },
          price: 20,
          rating: 4.3,
          reviews: 210,
          difficulty: {
            en: "Easy",
            ar: "سهل",
          },
          capacity: 4,
        },
      ],
    },
  ];

  const items = [
    // {
    //   key: "2",
    //   label: "Transfer",
    //   children: [
    //     { title: formattedRange, icon: <FaCalendar /> },
    //     {
    //       title: options.find((e) => e.id == selectedOption)?.title,
    //       icon: <FaCar />,
    //     },
    //   ],
    // },
    {
      key: "3",
      label: {
        en: "Hotels",
        ar: "الفنادق",
      },
      children: days
        .map((day, index) => {
          const selectedHotels = selectedTours.hotels.filter(
            (selectedHotel) => selectedHotel.day == index + 1
          );

          if (selectedHotels.length == 0) return null; // Skip if no selection

          return {
            title: {
              en: `Day ${index + 1}`,
              ar: `اليوم ${index + 1}`,
            }, // Header for the day
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
      children: days
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
              // const totalPrice = transfer.reduce(
              //   (acc, car) => acc + car.price,
              //   0
              // );
              // SetSelectedCar(totalPrice);

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
        .filter(Boolean), // Remove null values
    },
  ];

  const images = [
    {
      id: 1,
      imageBig:
        "https://travelami.templaza.net/wp-content/uploads/2024/03/garrett-parker-DlkF4-dbCOU-unsplash.jpg",
    },
    {
      id: 2,
      imageBig:
        "https://travelami.templaza.net/wp-content/uploads/2024/04/evangelos-mpikakis-t029Goq_7xE-unsplash-500x500.jpg",
    },
    {
      id: 3,
      imageBig:
        "https://travelami.templaza.net/wp-content/uploads/2024/04/fynn-schmidt-IYKL2uhgsnU-unsplash-500x500.jpg",
    },
    {
      id: 4,
      imageBig:
        "https://travelami.templaza.net/wp-content/uploads/2024/04/kit-suman-5mcnzeSHFvE-unsplash-500x500.jpg",
    },
  ];

  // Add this after the state declarations
  useEffect(() => {
    // Set first accommodation as active for each day on initial render
    if (days && days.length > 0) {
      const initialActiveAccommodations = {};
      const initialHotels = [...selectedTours.hotels];

      // For each day, select the first accommodation if available
      days.forEach((day, index) => {
        if (day?.accommodation?.length > 0) {
          const accommodation = day.accommodation[0];

          // Add to active accommodations map
          initialActiveAccommodations[index] = accommodation;

          // Update selectedTours hotels array
          const existingHotelIndex = initialHotels.findIndex(
            (h) => h.day === index + 1
          );
          if (existingHotelIndex >= 0) {
            initialHotels[existingHotelIndex] = {
              day: index + 1,
              name: accommodation.name,
              id: accommodation.id,
              price: accommodation.price_per_night,
              location: accommodation.location,
            };
          } else {
            initialHotels.push({
              day: index + 1,
              name: accommodation.name,
              id: accommodation.id,
              price: accommodation.price_per_night,
              location: accommodation.location,
            });
          }
        }
      });

      // Set all active accommodations at once
      setActiveAccommodations(initialActiveAccommodations);

      // Update selectedTours with all hotels at once
      setSelectedTours((prev) => ({
        ...prev,
        hotels: initialHotels,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Breadcrumb pagename="Package Details" pagetitle="Package Details" />
      <div className="package-details-area pt-120 mb-120 position-relative">
        <div className="container">
          <div className="row">
            <div className="co-lg-12">
              <GallerySection
                images={images}
                setOpenimg={setOpenimg}
                isOpenimg={isOpenimg}
                isOpen={isOpen}
                setOpen={setOpen}
              />
            </div>
          </div>
          <div className="row g-xl-4 gy-5">
            <div className="col-xl-8">
              <PackageInfo />
              <IncludedExcluded />
              <TourHighlights />
              <TripExperience
                options={options}
                setRowData={setRowData}
                setLearnModal={setLearnModal}
                locale={locale}
              />

              <div className="itinerary-container">
                {days.map((hotel, index) => (
                  <ItineraryDay
                    key={index}
                    hotel={hotel}
                    index={index}
                    days={days}
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
                faqData={faqData}
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
