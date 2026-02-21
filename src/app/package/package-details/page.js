"use client";
import React, { useEffect, useRef, useState } from "react";
import ModalVideo from "react-modal-video";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuantityCounter from "@/uitils/QuantityCounter";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import DatePicker from "react-datepicker";
import { IoLocationSharp } from "react-icons/io5";
import "./style.css";
import {
  FaCalendar,
  FaUser,
  FaCar,
  FaHotel,
  FaPlus,
  FaMinus,
  FaFlagCheckered,
  FaClock,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaSquareParking, FaLocationDot, FaBed } from "react-icons/fa6";
import { GiDuration } from "react-icons/gi";
import { MdEmojiTransportation, MdNetworkWifi2Bar } from "react-icons/md";
import { LiaLanguageSolid } from "react-icons/lia";
import "react-datepicker/dist/react-datepicker.css";
import Newslatter from "@/components/common/Newslatter";
import { Dropdown, Collapse } from "antd";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Calendar from "react-calendar";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Autoplay } from "swiper/modules";
import Link from "../../../components/link";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

// Flip card styles

const Page = () => {
  const [isSticky, setIsSticky] = useState(false);

  window.onscroll = function () {
    if (window.scrollY > 100) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };
  const [isOpen, setOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [rowData, setRowData] = useState({});
  const [learnModal, setLearnModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const position = [51.505, -0.09]; // Example: London coordinates
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

  // Replace the single activeAccommodation state with a map of active accommodations by day
  const [activeAccommodations, setActiveAccommodations] = useState({});

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
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
    // setActiveAccommodation(null);
  }, [people]);

  const handleAccommodationClick = (accommodation, dayIndex) => {
    // Create a copy of the current active accommodations
    const updatedActiveAccommodations = { ...activeAccommodations };

    // If clicking on the same accommodation that's already active for this day, do nothing
    if (updatedActiveAccommodations[dayIndex]?.id === accommodation.id) {
      return;
    }

    // Set this accommodation as active for this specific day
    updatedActiveAccommodations[dayIndex] = accommodation;
    setActiveAccommodations(updatedActiveAccommodations);

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

    // If less than 3 travelers, automatically select without flipping
    const totalTravelers = people.adults + people.children + people.infants;
    if (totalTravelers < 3) {
      handleAccommodationSelection(accommodation, dayIndex);
    }
  };

  const handleFlip = (dayIndex) => {
    // Only flip if total travelers is 3 or more and we have an active accommodation for this day
    const totalTravelers = people.adults + people.children + people.infants;
    if (totalTravelers >= 3 && activeAccommodations[dayIndex]) {
      setSelectedAccommodation({ ...activeAccommodations[dayIndex], dayIndex });
      setIsFlipped(true);
    }
  };

  const handleAccommodationSelection = (accommodation, dayIndex) => {
    const day = dayIndex !== undefined ? dayIndex : currentDay;
    setSelectedTours((prevState) => ({
      ...prevState,
      hotels: [
        ...prevState.hotels.filter((h) => h.day !== day + 1),
        {
          day: day + 1,
          name: accommodation.name,
          id: accommodation.id,
          price: accommodation.price_per_night,
          location: accommodation.location,
        },
      ],
    }));
  };

  const handleRoomChange = (action, roomId, type) => {
    setRooms((prevRooms) => {
      const updatedRooms = prevRooms.map((room) => {
        if (room.id === roomId) {
          const updatedRoom = { ...room };

          if (action === "increase") {
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
          } else if (action === "decrease" && room[type] > 0) {
            // Don't allow adults to go below 1
            if (type === "adults" && room[type] <= 1) {
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
      handleAccommodationSelection(
        selectedAccommodation,
        selectedAccommodation.dayIndex
      );
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

  const customExpandIcon =
    (fontSize = "16px") =>
    ({ isActive }) => (
      <BsFillCaretRightFill
        style={{
          color: "#295557",
          fontSize: fontSize,
          transition: "transform 0.3s",
          transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
        }}
      />
    );
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [selectedTours, setSelectedTours] = useState({
    title: "",
    hotels: [
      {
        day: 3,
        name: "Fosshotel Baron",
        id: 78,
        price: 300,
        location: "1.2 km from center",
      },
      {
        day: 2,
        name: "Fosshotel Baron",
        id: 4,
        price: 670,
        location: "1.2 km from center",
      },
      {
        day: 1,
        name: "KEX Hostel",
        id: 1,
        price: 42,
        location: "1 km from center",
      },
    ],
    transfers: [
      {
        day: 1,
        name: "Private Car Transfer",
        id: 1,
        price: 50,
      },
      {
        day: 3,
        name: "Private Car Transfer",
        id: 5,
        price: 100,
      },
      {
        day: 2,
        name: "Domestic Flight",
        id: 3,
        price: 150,
      },
    ],
  });

  const faqData = [
    {
      id: "travelcollapseOne",
      question: "01. What is ski touring?",
      answer:
        "Ski touring is a form of skiing where participants travel across snow-covered terrain using skis. It often involves traversing backcountry or off-piste areas, away from ski resorts.",
    },
    {
      id: "travelcollapseTwo",
      question: "02. What equipment do I need for ski touring?",
      answer:
        "Essential equipment includes touring skis, bindings, climbing skins, poles, boots suitable for touring, safety gear (avalanche transceiver, shovel, probe), and appropriate clothing for variable weather conditions.",
    },
    {
      id: "travelcollapseThree",
      question: "03. How is ski touring different from downhill skiing?",
      answer:
        "Ski touring involves ascending slopes using skins or other equipment, then descending using skis. It's more about the journey and exploring off-piste terrain than the controlled descents found in downhill skiing at resorts.",
    },
    {
      id: "travelcollapseFour",
      question: "04. Is ski touring safe?",
      answer:
        "Ski touring involves inherent risks associated with backcountry travel, including avalanches, changing weather conditions, and navigation challenges. Proper education, avalanche safety training, and carrying necessary safety gear are crucial for safety.",
    },
    {
      id: "travelcollapseFive",
      question: "05. Do I need prior skiing experience for ski touring?",
      answer:
        "While some ski touring routes can be suitable for beginners, having prior skiing experience, especially in different snow conditions, can be beneficial for safety and enjoyment.",
    },
    {
      id: "travelcollapseSix",
      question: "06. Are there guided ski touring trips available?",
      answer:
        "Yes, many outdoor adventure companies offer guided ski touring trips led by experienced guides who can enhance safety, provide local knowledge, and help plan routes.",
    },
    {
      id: "travelcollapseSevene",
      question: "07. What fitness level is required for ski touring?",
      answer:
        "Ski touring demands physical fitness, including endurance and strength. Preparing with cardiovascular exercise, strength training, and skiing practice is recommended.",
    },
    {
      id: "travelcollapseEight",
      question:
        "08. What should I do in case of an emergency during ski touring?",
      answer:
        "Having a well-thought-out emergency plan, including communication devices, knowledge of rescue procedures, and first aid skills, is vital. Always inform someone about your itinerary before heading out.",
    },
  ];

  const today = new Date();
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);

  const sixDaysLater = new Date(oneDayLater);
  sixDaysLater.setDate(oneDayLater.getDate() + 5);
  const [dateValue, setDateValue] = useState([oneDayLater, sixDaysLater]);

  const handleDateChange = (newValue) => {
    const [start] = newValue;
    const end = new Date(start);
    end.setDate(start.getDate() + 5);

    setDateValue([start, end]);
  };

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    console.log(currentDay);
  }, [currentDay]);

  const formattedDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; // Handle invalid date
    return date.toLocaleDateString("en-US", {
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
      title: "Golden Circle Classic Tour",
      duration: "8 hours",
      difficulty: "Moderate",
      language: "English",
      location: "Reykjavik, Iceland",
      price: 120,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
    {
      id: 1,
      title: "Northern Lights Adventure",
      duration: "4 hours",
      difficulty: "Easy",
      language: "English",
      location: "Reykjavik, Iceland",
      price: 95,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
    {
      id: 2,
      title: "Glacier Hiking and Ice Cave Exploration",
      duration: "6 hours",
      difficulty: "Challenging",
      language: "English",
      location: "Skaftafell, Iceland",
      price: 250,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
    {
      id: 3,
      title: "Whale Watching Tour",
      duration: "3 hours",
      difficulty: "Easy",
      language: "English",
      location: "Husavik, Iceland",
      price: 85,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
    {
      id: 4,
      title: "Volcano Helicopter Tour",
      duration: "1.5 hours",
      difficulty: "Moderate",
      language: "English",
      location: "Reykjavik, Iceland",
      price: 450,
      image:
        "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    },
  ];

  const days = [
    {
      day: 1,
      date: formattedDate(startDate),
      location: "Reykjavik",
      description:
        "Day five offers the choice of sightseeing around the Snaefellsnes Peninsula or exploring Reykjavik.",
      accommodation: [
        {
          id: 1,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
          name: "KEX Hostel",
          category: "Hostel",
          check_in_out: "15:00 / 11:00",
          location: "1 km from center",
          parking: "Available",
          price_per_night: 42,
          rating: 4.3,
          reviews: 2410,
        },
        {
          id: 2,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729863/Accommodation_3_k7ycha.png",
          name: "Stay Apartments Bolholt",
          category: "Apartment",
          check_in_out: "15:00 / 11:00",
          location: "2.4 km from center",
          parking: "Available",
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

          name: "private Car",
          category: "jeep",
          duration: "4 seats",
          language: "English",
          price: 50,
          rating: 4.5,
          reviews: 120,
          difficulty: "Easy",
          capacity: 4,
        },
        {
          id: 2,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735071/19_wtfslb.png",
          name: "family car",
          category: "jeep",
          duration: "2 seats",
          language: "English",
          price: 25,
          rating: 4.0,
          reviews: 350,
          difficulty: "Easy",
          capacity: 5,
        },
      ],
    },
    {
      day: 2,
      date: formattedDate(
        new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
      ),
      location: "Akureyri",
      description: "Explore the northern capital of Iceland.",
      accommodation: [
        {
          id: 4,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",

          name: "Fosshotel Baron",
          category: "3 Stars Hotel",
          check_in_out: "15:00 / 11:00",
          location: "1.2 km from center",
          parking: "Available",
          price_per_night: 670,
          rating: 4.0,
          reviews: 1230,
        },
        {
          id: 3,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png",
          name: "Stay Apartments Bolholt",
          category: "Apartment",
          check_in_out: "15:00 / 11:00",
          location: "2.4 km from center",
          parking: "Available",
          price_per_night: 222,
          rating: 4.2,
          reviews: 458,
        },
      ],
      transfers: [
        {
          id: 3,
          language: "English",
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729914/Domestic_Flight_wuqhnh.png",
          name: "Domestic Flight",
          category: "Flight",
          duration: "1 hour",
          price: 150,
          rating: 4.7,
          reviews: 890,
          difficulty: "Easy",
          capacity: 30,
        },
        {
          id: 4,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729917/Scenic_Bus_Ride_gyyuz3.png",
          name: "Scenic Bus Ride",
          category: "Bus",
          duration: "5 hours",
          language: "English",
          price: 75,
          rating: 4.2,
          reviews: 560,
          difficulty: "Easy",
          capacity: 20,
        },
      ],
    },
    {
      day: 3,
      date: formattedDate(
        new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 2))
      ),
      location: "Akureyri",
      description: "Explore the northern capital of Iceland.",
      accommodation: [
        {
          id: 78,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729794/Accommodation_2_feidgt.png",
          name: "Fosshotel Baron",
          category: "3 Stars Hotel",
          check_in_out: "15:00 / 11:00",
          location: "1.2 km from center",
          parking: "Available",
          price_per_night: 300,

          rating: 4.0,
          reviews: 1230,
        },
        {
          id: 3,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png",
          name: "Stay Apartments Bolholt",
          category: "Apartment",
          check_in_out: "15:00 / 11:00",
          location: "2.4 km from center",
          parking: "Available",
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
          name: "Private Car Transfer",
          category: "Private Transfer",
          duration: "1 hour",
          language: "English",
          price: 100,
          rating: 4.6,
          reviews: 320,
          difficulty: "Easy",
          capacity: 4,
        },
        {
          id: 6,
          image:
            "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742735071/19_wtfslb.png",
          name: "Bike Rental",
          category: "Self-Transfer",
          duration: "Flexible",
          language: "English",
          price: 20,
          rating: 4.3,
          reviews: 210,
          difficulty: "Easy",
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
    //       title: options.find((e) => e.id === selectedOption)?.title,
    //       icon: <FaCar />,
    //     },
    //   ],
    // },
    {
      key: "3",
      label: "Hotels",
      children: days
        .map((day, index) => {
          const selectedHotels = selectedTours.hotels.filter(
            (selectedHotel) => selectedHotel.day === index + 1
          );

          if (selectedHotels.length === 0) return null; // Skip if no selection

          return {
            title: `Day ${index + 1}`, // Header for the day
            icon: <FaCalendar />,
            children: [
              {
                title: day.location,
                icon: <FaMapMarkerAlt />,
              },
              ...selectedHotels.map((selectedHotel) => {
                const hotel = day.accommodation.find(
                  (h) => h.id === selectedHotel.id
                );
                return {
                  title: `${hotel?.name} (${hotel?.category})`,
                  icon: <FaHotel />,
                };
              }),
            ],
          };
        })
        .filter(Boolean), // Remove null values
    },
    {
      key: "4",
      label: "Transfers",
      children: days
        .map((day, index) => {
          const selectedTransfers = selectedTours.transfers.filter(
            (selectedTransfer) => selectedTransfer.day === index + 1
          );

          if (selectedTransfers.length === 0) return null;

          return {
            title: `Day ${index + 1}`,
            icon: <FaCalendar />,
            children: selectedTransfers.map((selectedTransfer) => {
              const transfer = day.transfers.find(
                (t) => t.id === selectedTransfer.id
              );
              // const totalPrice = transfer.reduce(
              //   (acc, car) => acc + car.price,
              //   0
              // );
              // SetSelectedCar(totalPrice);

              return {
                title: `${transfer?.name} (${transfer?.price} USD)`,
                icon: <FaCar />,
              };
            }),
          };
        })
        .filter(Boolean), // Remove null values
    },
  ];

  const [selectedCar, SetSelectedCar] = useState(null);

  const calculatePriceDifference = (selectedPrice, defaultPrice) => {
    if (!selectedPrice) return defaultPrice;
    return defaultPrice - selectedPrice;
  };

  const contentStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #295557",
  };

  const menuStyle = {
    boxShadow: "none",
  };

  const { Panel } = Collapse;
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
    {
      id: 5,
      imageBig:
        "https://travelami.templaza.net/wp-content/uploads/2024/04/caleb-miller-0Bs3et8FYyg-unsplash-e1712501886990-500x500.jpg",
    },
    {
      id: 6,
      imageBig:
        "https://travelami.templaza.net/wp-content/uploads/2024/04/leonardo-ramos-CJ4mbwSK3EY-unsplash-500x500.jpg",
    },
  ];

  console.log(selectedCar);

  // Add this after the state declarations
  useEffect(() => {
    // Set first accommodation as active for each day on initial render
    if (days && days.length > 0) {
      const initialActiveAccommodations = {};

      // For each day, select the first accommodation if available
      days.forEach((day, index) => {
        if (day?.accommodation?.length > 0) {
          handleAccommodationSelection(day.accommodation[0], index);

          // Add to active accommodations map
          initialActiveAccommodations[index] = day.accommodation[0];
        }
      });

      // Set all active accommodations at once
      setActiveAccommodations(initialActiveAccommodations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header
      className={
        isSticky
          ? "default-layout sticky-one homeheader py-1"
          : "default-layout homeheader py-1"
      }
    >
      <div
        className={
          "w-full d-flex header-container justify-between align-center py-1"
          // : "default-layout header-container d-flex justify-between align-item-center py-1"
        }
      >
        sal;kdflasjmnfjknsajkndjk
        {/* <Logo home={location.pathname == "/package/package-details"} /> */}
        {/* <Links /> */}
        {/* <Icons home={location.pathname == "/package/package-details"} /> */}
      </div>
    </header>
  );
};

export default Page;
