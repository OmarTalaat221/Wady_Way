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
    ({ isActive }) =>
      (
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
    // <>
    //   <Breadcrumb pagename="Package Details" pagetitle="Package Details" />
    //   <div className="package-details-area pt-120 mb-120 position-relative">
    //     <div className="container">
    //       <div className="row">
    //         <div className="co-lg-12">
    //           <div className="package-img-group mb-50">
    //             <div className="row align-items-center g-3">
    //               <div className="col-lg-6">
    //                 <div className="gallery-img-wrap">
    //                   <img
    //                     src="https://travelami.templaza.net/wp-content/uploads/2024/03/garrett-parker-DlkF4-dbCOU-unsplash.jpg"
    //                     alt=""
    //                   />
    //                   <a>
    //                     <i
    //                       className="bi bi-eye"
    //                       onClick={() =>
    //                         setOpenimg({ openingState: true, openingIndex: 0 })
    //                       }
    //                     />
    //                   </a>
    //                 </div>
    //               </div>
    //               <div className="col-lg-6 h-100">
    //                 <div className="row g-3 h-100">
    //                   <div className="col-6">
    //                     <div className="gallery-img-wrap">
    //                       <img
    //                         src="https://travelami.templaza.net/wp-content/uploads/2024/03/luca-bravo-VowIFDxogG4-unsplash1380.jpg"
    //                         alt=""
    //                       />
    //                       <a>
    //                         <i
    //                           className="bi bi-eye"
    //                           onClick={() =>
    //                             setOpenimg({
    //                               openingState: true,
    //                               openingIndex: 1,
    //                             })
    //                           }
    //                         />
    //                       </a>
    //                     </div>
    //                   </div>
    //                   <div className="col-6">
    //                     <div className="gallery-img-wrap">
    //                       <img
    //                         src="https://travelami.templaza.net/wp-content/uploads/2024/04/alexander-ramsey-dBtWLliLt5k-unsplash.jpg"
    //                         alt=""
    //                       />
    //                       <a>
    //                         <i
    //                           className="bi bi-eye"
    //                           onClick={() =>
    //                             setOpenimg({
    //                               openingState: true,
    //                               openingIndex: 2,
    //                             })
    //                           }
    //                         />
    //                       </a>
    //                     </div>
    //                   </div>
    //                   <div className="col-6">
    //                     <div className="gallery-img-wrap active">
    //                       <img
    //                         src="https://travelami.templaza.net/wp-content/uploads/2024/04/alexander-ramsey-dBtWLliLt5k-unsplash.jpg"
    //                         alt=""
    //                       />
    //                       <button
    //                         className="StartSlideShowFirstImage "
    //                         onClick={() =>
    //                           setOpenimg({
    //                             openingState: true,
    //                             openingIndex: 3,
    //                           })
    //                         }
    //                       >
    //                         <i className="bi bi-plus-lg" /> View More Images
    //                       </button>
    //                     </div>
    //                   </div>
    //                   <div className="col-6">
    //                     <div className="gallery-img-wrap active">
    //                       <img
    //                         src="https://travelami.templaza.net/wp-content/uploads/2024/03/pascal-debrunner-1WQ5RZuH9xo-unsplash1380.jpg"
    //                         alt=""
    //                       />
    //                       <a
    //                         data-fancybox="gallery-01"
    //                         style={{ cursor: "pointer" }}
    //                         onClick={() => setOpen(true)}
    //                       >
    //                         <i className="bi bi-play-circle" /> Watch Video
    //                       </a>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //       <div className="others-image-wrap d-none">
    //         <a
    //           href="assets/img/innerpage/package-01.jpg"
    //           data-fancybox="images"
    //         >
    //           <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
    //         </a>
    //         <a
    //           href="assets/img/innerpage/package-02.jpg"
    //           data-fancybox="images"
    //         >
    //           <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
    //         </a>
    //         <a
    //           href="assets/img/innerpage/package-03.jpg"
    //           data-fancybox="images"
    //         >
    //           <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
    //         </a>
    //         <a
    //           href="assets/img/innerpage/package-04.jpg"
    //           data-fancybox="images"
    //         >
    //           <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
    //         </a>
    //         <a
    //           href="assets/img/innerpage/package-05.jpg"
    //           data-fancybox="images"
    //         >
    //           <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
    //         </a>
    //       </div>
    //       <div className="row g-xl-4 gy-5">
    //         <div className="col-xl-8">
    //           <h2>
    //             Experience the tour of excitement with the most adventurous
    //             activities.
    //           </h2>

    //           <ul className="tour-info-metalist">
    //             <li>
    //               <svg
    //                 width={14}
    //                 height={14}
    //                 viewBox="0 0 14 14"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <path d="M14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7ZM7 3.0625C7 2.94647 6.95391 2.83519 6.87186 2.75314C6.78981 2.67109 6.67853 2.625 6.5625 2.625C6.44647 2.625 6.33519 2.67109 6.25314 2.75314C6.17109 2.83519 6.125 2.94647 6.125 3.0625V7.875C6.12502 7.95212 6.14543 8.02785 6.18415 8.09454C6.22288 8.16123 6.27854 8.2165 6.3455 8.25475L9.408 10.0048C9.5085 10.0591 9.62626 10.0719 9.73611 10.0406C9.84596 10.0092 9.93919 9.93611 9.99587 9.83692C10.0525 9.73774 10.0682 9.62031 10.0394 9.50975C10.0107 9.39919 9.93982 9.30426 9.842 9.24525L7 7.62125V3.0625Z"></path>
    //               </svg>
    //               4 Days / 5 Night
    //             </li>
    //             <li>
    //               <svg
    //                 width={14}
    //                 height={14}
    //                 viewBox="0 0 14 14"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <path d="M7 7C7.92826 7 8.8185 6.63125 9.47487 5.97487C10.1313 5.3185 10.5 4.42826 10.5 3.5C10.5 2.57174 10.1313 1.6815 9.47487 1.02513C8.8185 0.368749 7.92826 0 7 0C6.07174 0 5.1815 0.368749 4.52513 1.02513C3.86875 1.6815 3.5 2.57174 3.5 3.5C3.5 4.42826 3.86875 5.3185 4.52513 5.97487C5.1815 6.63125 6.07174 7 7 7ZM14 12.8333C14 14 12.8333 14 12.8333 14H1.16667C1.16667 14 0 14 0 12.8333C0 11.6667 1.16667 8.16667 7 8.16667C12.8333 8.16667 14 11.6667 14 12.8333Z"></path>
    //               </svg>
    //               Max People : 40
    //             </li>
    //             <li>
    //               <svg
    //                 width={14}
    //                 height={14}
    //                 viewBox="0 0 14 14"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <path
    //                   fillRule="evenodd"
    //                   clipRule="evenodd"
    //                   d="M14 0.43748C14 0.372778 13.9856 0.308889 13.9579 0.250418C13.9302 0.191947 13.8898 0.140348 13.8398 0.0993396C13.7897 0.0583312 13.7312 0.0289339 13.6684 0.0132656C13.6057 -0.00240264 13.5402 -0.00395173 13.4768 0.00872996L9.1875 0.86623L4.89825 0.00872996C4.84164 -0.00258444 4.78336 -0.00258444 4.72675 0.00872996L0.35175 0.88373C0.252608 0.903546 0.163389 0.957088 0.099263 1.03525C0.0351366 1.11342 6.10593e-05 1.21138 0 1.31248L0 13.5625C3.90711e-05 13.6272 0.0144289 13.6911 0.0421328 13.7495C0.0698367 13.808 0.110165 13.8596 0.160212 13.9006C0.210259 13.9416 0.268779 13.971 0.331556 13.9867C0.394332 14.0024 0.459803 14.0039 0.52325 13.9912L4.8125 13.1337L9.10175 13.9912C9.15836 14.0025 9.21664 14.0025 9.27325 13.9912L13.6482 13.1162C13.7474 13.0964 13.8366 13.0429 13.9007 12.9647C13.9649 12.8865 13.9999 12.7886 14 12.6875V0.43748ZM4.375 12.3287V0.97123L4.8125 0.88373L5.25 0.97123V12.3287L4.89825 12.2587C4.84165 12.2474 4.78335 12.2474 4.72675 12.2587L4.375 12.3287ZM8.75 13.0287V1.67123L9.10175 1.74123C9.15836 1.75254 9.21664 1.75254 9.27325 1.74123L9.625 1.67123V13.0287L9.1875 13.1162L8.75 13.0287Z"
    //                 ></path>
    //               </svg>
    //               Italy &amp; France.
    //             </li>
    //           </ul>
    //           <p>
    //             Tour and travel refer to the activities related to planning,
    //             organizing, and experiencing trips to various destinations for
    //             leisure, exploration, adventure, or relaxation.Choose your
    //             destination based on your interests and preferences, whether
    //             it's a cultural experience, a natural adventure, historical
    //             exploration, or a beach vacation.
    //           </p>
    //           <p>
    //             Book suitable accommodation, which can range from hotels,
    //             resorts, hostels, vacation rentals, or even camping depending on
    //             your travel style and destination.Arrange transportation to and
    //             within your destination. This can include flights, trains,
    //             buses, rental cars, or even cruises.
    //           </p>
    //           <h4>Included and Excluded</h4>

    //           <div className="includ-and-exclud-area mb-[20px]">
    //             <ul>
    //               <li>
    //                 <i className="bi bi-check-lg" /> Meal as per hotel Plan and
    //                 drinks free too.
    //               </li>
    //               <li>
    //                 <i className="bi bi-check-lg" /> Return airport and round
    //                 trip transfers.
    //               </li>
    //               <li>
    //                 <i className="bi bi-check-lg" /> Accommodation on twin
    //                 sharing basis.
    //               </li>
    //               <li>
    //                 <i className="bi bi-check-lg" /> The above rates are on per
    //                 day disposal basi
    //               </li>
    //               <li>
    //                 <i className="bi bi-check-lg" /> Enjoy Brussels day tours.
    //                 Overnight Brussels
    //               </li>
    //             </ul>
    //             <ul className="exclud">
    //               <li>
    //                 <i className="bi bi-x-lg" /> AC will not be functional on
    //                 Hills or Slopes.
    //               </li>
    //               <li>
    //                 <i className="bi bi-x-lg" /> Any other service not mentioned
    //               </li>
    //               <li>
    //                 <i className="bi bi-x-lg" /> Additional entry fees other
    //                 than specified
    //               </li>
    //               <li>
    //                 <i className="bi bi-x-lg" /> Amsterdam canal cruise not
    //                 included for basic
    //               </li>
    //             </ul>
    //           </div>

    //           <div className="highlight-tour mb-[20px]">
    //             <h4>Highlights of the Tour</h4>
    //             <ul>
    //               <li>
    //                 <span>
    //                   <i className="bi bi-check" />
    //                 </span>{" "}
    //                 Our team of knowledgeable guides and travel experts are
    //                 dedicated to making your journey memorable and worry-free
    //               </li>
    //               <li>
    //                 <span>
    //                   <i className="bi bi-check" />
    //                 </span>{" "}
    //                 Dive into rich cultures and traditions. Explore historic
    //                 sites, savor authentic cuisine, and connect with locals.
    //               </li>
    //               <li>
    //                 <span>
    //                   <i className="bi bi-check" />
    //                 </span>{" "}
    //                 We take care of all the details, so you can focus on
    //                 creating memories. Rest assured that your journey is in
    //                 capable hands
    //               </li>
    //               <li>
    //                 <span>
    //                   <i className="bi bi-check" />
    //                 </span>{" "}
    //                 Sip cocktails on the beach as you watch the sun dip below
    //                 the horizon.
    //               </li>
    //               <li>
    //                 <span>
    //                   <i className="bi bi-check" />
    //                 </span>{" "}
    //                 From accommodations to dining experiences, we select the
    //                 best partners to ensure your comfort and enjoyment
    //                 throughout your journey.
    //               </li>
    //             </ul>
    //           </div>

    //           <div className="transfers-container" id="Transfer">
    //             <h2
    //               style={{
    //                 color: "#295557",
    //                 fontSize: "25px",
    //               }}
    //             >
    //               Trip Experience
    //             </h2>

    //             <div className="cards-container-parent">
    //               <div className="cards-container">
    //                 {options.map((option) => {
    //                   // const selectedOptionPrice = selectedOption
    //                   //   ? options.find((o) => o.id === selectedOption)?.price ||
    //                   //     0
    //                   //   : 0;

    //                   // const currentOptionPrice = option.price || 0;

    //                   // const priceDifference =
    //                   //   currentOptionPrice - selectedOptionPrice;

    //                   return (
    //                     <div
    //                       key={option.id}
    //                       className={`card`}
    //                       onClick={() => {
    //                         setRowData(option);
    //                         setLearnModal(true);
    //                       }}
    //                     >
    //                       <img
    //                         src={option.image}
    //                         alt={option.title}
    //                         className="card-image"
    //                       />
    //                       <div className="card-content">
    //                         <h3>{option.title}</h3>
    //                         <div className="gap-3 mb-3 transfer_feat_cont">
    //                           <div
    //                             className="d-flex align-items-center justify-content-start transfer_in gap-2 "
    //                             style={{
    //                               fontSize: "18px",
    //                             }}
    //                           >
    //                             <FaFlagCheckered />
    //                             <div className="d-flex align-items-start flex-column transfer_cont">
    //                               <div className="fw-bold">Tour starts</div>
    //                               <span
    //                                 className="transfer_info"
    //                                 data-tooltip={option.location}
    //                               >
    //                                 {option.location}
    //                               </span>
    //                             </div>
    //                           </div>
    //                           <div
    //                             className="d-flex align-items-center justify-content-start transfer_in gap-2 "
    //                             style={{
    //                               fontSize: "18px",
    //                             }}
    //                           >
    //                             <GiDuration />
    //                             <div className="d-flex align-items-start flex-column transfer_cont">
    //                               <div className="fw-bold">Duration</div>
    //                               <div
    //                                 className="transfer_info"
    //                                 title={option?.duration}
    //                               >
    //                                 {option.duration}
    //                               </div>
    //                             </div>
    //                           </div>
    //                           <div
    //                             className="d-flex align-items-center justify-content-start transfer_in gap-2 "
    //                             style={{
    //                               fontSize: "18px",
    //                             }}
    //                           >
    //                             <MdNetworkWifi2Bar />
    //                             <div className="d-flex align-items-start flex-column transfer_cont">
    //                               <div className="fw-bold">Difficulty</div>
    //                               <div
    //                                 className="transfer_info"
    //                                 title={option?.difficulty}
    //                               >
    //                                 {option.difficulty}
    //                               </div>
    //                             </div>
    //                           </div>
    //                           <div
    //                             className="d-flex align-items-center justify-content-start transfer_in gap-2 "
    //                             style={{
    //                               fontSize: "18px",
    //                             }}
    //                           >
    //                             <LiaLanguageSolid />
    //                             <div className="d-flex align-items-start flex-column transfer_cont">
    //                               <div className="fw-bold">Languages</div>
    //                               <div
    //                                 className="transfer_info"
    //                                 title={option?.language}
    //                               >
    //                                 {option.language}
    //                               </div>
    //                             </div>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   );
    //                 })}
    //               </div>
    //             </div>
    //           </div>

    //           <div className="itinerary-container">
    //             {days.map((hotel, index) => {
    //               return (
    //                 <div className="day-section" data-day={index}>
    //                   <div className="itinerary-grid">
    //                     <div key={index} className="itinerary-text">
    //                       <div className="personalize">
    //                         Personalize your itinerary
    //                       </div>
    //                       <div className="day-badge">Day {index + 1}</div>{" "}
    //                       <h3>{days[index]?.date}</h3>
    //                       <div className="day-details-div">
    //                         <p className="feat_tour">
    //                           <span className="icon">🏨</span>{" "}
    //                           {
    //                             selectedTours?.hotels?.find(
    //                               (e) => e.day == hotel?.day
    //                             )?.name
    //                           }
    //                         </p>
    //                         <p className="feat_tour">
    //                           <span className="icon">📍</span>{" "}
    //                           {
    //                             selectedTours?.hotels?.find(
    //                               (e) => e.day == hotel?.day
    //                             )?.location
    //                           }
    //                         </p>
    //                         <p className="feat_tour">
    //                           <span className="icon">🚗</span>{" "}
    //                           {
    //                             selectedTours?.transfers?.find(
    //                               (e) => e.day == hotel?.day
    //                             )?.name
    //                           }
    //                         </p>
    //                         <p className="description">
    //                           {days[index]?.description}
    //                         </p>{" "}
    //                         <a href="#" className="read-more">
    //                           Read more
    //                         </a>
    //                       </div>
    //                     </div>

    //                     <div className="itinerary-image">
    //                       <button ref={prevRef} className="custom-prev">
    //                         &#8249;
    //                       </button>
    //                       <button ref={nextRef} className="custom-next">
    //                         &#8250;
    //                       </button>
    //                       <Swiper
    //                         spaceBetween={30}
    //                         onInit={(swiper) => {
    //                           swiper.params.navigation.prevEl = prevRef.current;
    //                           swiper.params.navigation.nextEl = nextRef.current;
    //                           swiper.navigation.init();
    //                           swiper.navigation.update();
    //                         }}
    //                         loop={true}
    //                         autoplay={{ delay: 5000 }}
    //                         effect={"fade"}
    //                         navigation={{
    //                           nextEl: ".custom-next",
    //                           prevEl: ".custom-prev",
    //                         }}
    //                         pagination={{ clickable: true }}
    //                         modules={[Navigation, EffectFade, Autoplay]}
    //                         className="mySwiper"
    //                       >
    //                         <SwiperSlide>
    //                           <img
    //                             src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729863/Accommodation_3_k7ycha.png"
    //                             alt="Slide 1"
    //                           />
    //                         </SwiperSlide>
    //                         <SwiperSlide>
    //                           <img
    //                             src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png"
    //                             alt="Slide 3"
    //                           />
    //                         </SwiperSlide>
    //                         <SwiperSlide>
    //                           <img
    //                             src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729917/Scenic_Bus_Ride_gyyuz3.png"
    //                             alt="Slide 2"
    //                           />
    //                         </SwiperSlide>
    //                       </Swiper>
    //                     </div>
    //                   </div>

    //                   <div className="days_cont" style={{ color: "#295557" }}>
    //                     <div className="d-flex flex-column gap-2">
    //                       <Collapse
    //                         ghost
    //                         expandIcon={customExpandIcon("16px")}
    //                         size="large"
    //                         style={{ color: "#295557" }}
    //                       >
    //                         <Panel
    //                           header={
    //                             <h2
    //                               style={{ color: "#295557", fontSize: "20px" }}
    //                             >
    //                               Day {index + 1} options
    //                             </h2>
    //                           }
    //                           style={{ padding: "0px" }}
    //                         >
    //                           <div className="day-section day-section-bg">
    //                             <h2
    //                               style={{
    //                                 color: "#295557",
    //                                 fontSize: "22px",
    //                                 padding: "15px 0",
    //                                 display: "flex",
    //                                 alignItems: "center",
    //                                 gap: "10px",
    //                               }}
    //                             >
    //                               <FaBed />
    //                               Accommodation
    //                             </h2>
    //                             <div className="cards-container-parent">
    //                               <div className="cards-container">
    //                                 {hotel?.accommodation?.map((item) => {
    //                                   const selectedHotel =
    //                                     selectedTours.hotels.find(
    //                                       (selected) =>
    //                                         selected.day === index + 1
    //                                     );

    //                                   // Calculate price difference
    //                                   const priceDifference =
    //                                     calculatePriceDifference(
    //                                       activeAccommodations[index]
    //                                         ?.price_per_night,
    //                                       item?.price_per_night
    //                                     );

    //                                   const totalTravelers =
    //                                     people.adults +
    //                                     people.children +
    //                                     people.infants;
    //                                   const shouldFlip = totalTravelers >= 3;

    //                                   return (
    //                                     <div
    //                                       key={item.id}
    //                                       className={`card ${
    //                                         activeAccommodations[index]?.id ===
    //                                         item.id
    //                                           ? "selected"
    //                                           : ""
    //                                       } ${
    //                                         isFlipped &&
    //                                         selectedAccommodation?.id ===
    //                                           item.id
    //                                           ? "flipped"
    //                                           : ""
    //                                       }`}
    //                                       onClick={() => {
    //                                         if (
    //                                           isFlipped &&
    //                                           selectedAccommodation?.id ===
    //                                             item.id
    //                                         )
    //                                           return;
    //                                         handleAccommodationClick(
    //                                           item,
    //                                           index
    //                                         );
    //                                       }}
    //                                     >
    //                                       <div className="card-inner">
    //                                         <div className="card-front">
    //                                           {activeAccommodations[index]
    //                                             ?.id === item.id &&
    //                                             people.adults +
    //                                               people.children +
    //                                               people.infants >=
    //                                               3 && (
    //                                               <button
    //                                                 className="cards-container-learnmore"
    //                                                 onClick={(e) => {
    //                                                   e.stopPropagation();
    //                                                   handleFlip(index);
    //                                                 }}
    //                                               >
    //                                                 View Rooms
    //                                               </button>
    //                                             )}

    //                                           <div
    //                                             onClick={(e) => {
    //                                               //stop propagation
    //                                               e.stopPropagation();
    //                                               setMapModal(true);
    //                                             }}
    //                                             className="cards-container-location-icon"
    //                                           >
    //                                             <IoLocationSharp />
    //                                           </div>

    //                                           <img
    //                                             src={item.image}
    //                                             alt={item.name}
    //                                             className="card-image"
    //                                           />
    //                                           <div className="card-content">
    //                                             <h3 className="text-[20px] mb-2">
    //                                               {item.name}
    //                                             </h3>

    //                                             <div className="gap-3 mb-3 transfer_feat_cont">
    //                                               <div className="d-flex align-items-center gap-2 transfer_in">
    //                                                 <FaHotel />
    //                                                 <div className="d-flex flex-column transfer_cont">
    //                                                   <div className="fw-bold">
    //                                                     Category
    //                                                   </div>
    //                                                   <div
    //                                                     className="transfer_info"
    //                                                     title={item?.category}
    //                                                   >
    //                                                     {item?.category}
    //                                                   </div>
    //                                                 </div>
    //                                               </div>
    //                                               <div className="d-flex align-items-center gap-2 transfer_in">
    //                                                 <FaClock />
    //                                                 <div className="d-flex flex-column transfer_cont">
    //                                                   <div className="fw-bold">
    //                                                     Check-in
    //                                                   </div>
    //                                                   <div
    //                                                     className="transfer_info"
    //                                                     title={
    //                                                       item?.check_in_out
    //                                                     }
    //                                                   >
    //                                                     {item?.check_in_out}
    //                                                   </div>
    //                                                 </div>
    //                                               </div>
    //                                               <div className="d-flex align-items-center gap-2 transfer_in">
    //                                                 <FaLocationDot />
    //                                                 <div className="d-flex flex-column transfer_cont">
    //                                                   <div className="fw-bold">
    //                                                     Location
    //                                                   </div>
    //                                                   <div
    //                                                     className="transfer_info"
    //                                                     title={item?.location}
    //                                                   >
    //                                                     {item.location}
    //                                                   </div>
    //                                                 </div>
    //                                               </div>
    //                                               <div className="d-flex align-items-center gap-2 transfer_in">
    //                                                 <FaSquareParking />
    //                                                 <div className="d-flex flex-column transfer_cont">
    //                                                   <div className="fw-bold">
    //                                                     Parking
    //                                                   </div>
    //                                                   <div
    //                                                     className="transfer_info"
    //                                                     title={item?.parking}
    //                                                   >
    //                                                     {item.parking ||
    //                                                       "Not Available"}
    //                                                   </div>
    //                                                 </div>
    //                                               </div>
    //                                             </div>
    //                                             <div className="card-footer">
    //                                               <span className="price">
    //                                                 {activeAccommodations[index]
    //                                                   ?.id === item.id
    //                                                   ? "Selected"
    //                                                   : priceDifference !== 0
    //                                                   ? `${
    //                                                       priceDifference > 0
    //                                                         ? "+"
    //                                                         : ""
    //                                                     }${priceDifference} USD`
    //                                                   : priceDifference == 0
    //                                                   ? "Same Price"
    //                                                   : `+${item.price_per_night} USD`}
    //                                               </span>
    //                                               <div
    //                                                 className={`custom-radio ${
    //                                                   activeAccommodations[
    //                                                     index
    //                                                   ]?.id === item.id
    //                                                     ? "selected"
    //                                                     : ""
    //                                                 }`}
    //                                               >
    //                                                 <div className="radio-circle"></div>
    //                                               </div>
    //                                             </div>
    //                                           </div>
    //                                         </div>
    //                                         <div className="card-back">
    //                                           <div className="room-selection-container">
    //                                             <h4>Select Rooms</h4>
    //                                             <p className="mb-3">
    //                                               Total travelers:{" "}
    //                                               {totalTravelers}
    //                                             </p>

    //                                             <div className="rooms-container">
    //                                               {rooms.map((room) => (
    //                                                 <div
    //                                                   key={room.id}
    //                                                   className="room-item"
    //                                                 >
    //                                                   <div className="room-header">
    //                                                     <h5>Room {room.id}</h5>
    //                                                     {rooms.length > 1 && (
    //                                                       <button
    //                                                         className="remove-room-btn"
    //                                                         onClick={(e) => {
    //                                                           e.stopPropagation();
    //                                                           removeRoom(
    //                                                             room.id
    //                                                           );
    //                                                         }}
    //                                                       >
    //                                                         &times;
    //                                                       </button>
    //                                                     )}
    //                                                   </div>

    //                                                   <div className="room-occupants">
    //                                                     <div className="occupant-type">
    //                                                       <span>Adults</span>
    //                                                       <div className="counter">
    //                                                         <button
    //                                                           onClick={(e) => {
    //                                                             e.stopPropagation();
    //                                                             handleRoomChange(
    //                                                               "decrease",
    //                                                               room.id,
    //                                                               "adults"
    //                                                             );
    //                                                           }}
    //                                                           disabled={
    //                                                             room.adults <= 1
    //                                                           }
    //                                                         >
    //                                                           <FaMinus />
    //                                                         </button>
    //                                                         <span>
    //                                                           {room.adults}
    //                                                         </span>
    //                                                         <button
    //                                                           onClick={(e) => {
    //                                                             e.stopPropagation();
    //                                                             handleRoomChange(
    //                                                               "increase",
    //                                                               room.id,
    //                                                               "adults"
    //                                                             );
    //                                                           }}
    //                                                         >
    //                                                           <FaPlus />
    //                                                         </button>
    //                                                       </div>
    //                                                     </div>

    //                                                     {people.children >
    //                                                       0 && (
    //                                                       <div className="occupant-type">
    //                                                         <span>
    //                                                           Children
    //                                                         </span>
    //                                                         <div className="counter">
    //                                                           <button
    //                                                             onClick={(
    //                                                               e
    //                                                             ) => {
    //                                                               e.stopPropagation();
    //                                                               handleRoomChange(
    //                                                                 "decrease",
    //                                                                 room.id,
    //                                                                 "children"
    //                                                               );
    //                                                             }}
    //                                                             disabled={
    //                                                               room.children <=
    //                                                               0
    //                                                             }
    //                                                           >
    //                                                             <FaMinus />
    //                                                           </button>
    //                                                           <span>
    //                                                             {room.children}
    //                                                           </span>
    //                                                           <button
    //                                                             onClick={(
    //                                                               e
    //                                                             ) => {
    //                                                               e.stopPropagation();
    //                                                               handleRoomChange(
    //                                                                 "increase",
    //                                                                 room.id,
    //                                                                 "children"
    //                                                               );
    //                                                             }}
    //                                                           >
    //                                                             <FaPlus />
    //                                                           </button>
    //                                                         </div>
    //                                                       </div>
    //                                                     )}

    //                                                     {people.infants > 0 && (
    //                                                       <div className="occupant-type">
    //                                                         <span>Infants</span>
    //                                                         <div className="counter">
    //                                                           <button
    //                                                             onClick={(
    //                                                               e
    //                                                             ) => {
    //                                                               e.stopPropagation();
    //                                                               handleRoomChange(
    //                                                                 "decrease",
    //                                                                 room.id,
    //                                                                 "infants"
    //                                                               );
    //                                                             }}
    //                                                             disabled={
    //                                                               room.infants <=
    //                                                               0
    //                                                             }
    //                                                           >
    //                                                             <FaMinus />
    //                                                           </button>
    //                                                           <span>
    //                                                             {room.infants}
    //                                                           </span>
    //                                                           <button
    //                                                             onClick={(
    //                                                               e
    //                                                             ) => {
    //                                                               e.stopPropagation();
    //                                                               handleRoomChange(
    //                                                                 "increase",
    //                                                                 room.id,
    //                                                                 "infants"
    //                                                               );
    //                                                             }}
    //                                                           >
    //                                                             <FaPlus />
    //                                                           </button>
    //                                                         </div>
    //                                                       </div>
    //                                                     )}
    //                                                   </div>
    //                                                 </div>
    //                                               ))}
    //                                             </div>

    //                                             {rooms.length < 5 && (
    //                                               <button
    //                                                 className="add-room-btn"
    //                                                 onClick={(e) => {
    //                                                   e.stopPropagation();
    //                                                   addRoom();
    //                                                 }}
    //                                               >
    //                                                 <FaPlus /> Add Room
    //                                               </button>
    //                                             )}

    //                                             <div className="room-actions">
    //                                               <button
    //                                                 className="cancel-btn"
    //                                                 onClick={(e) => {
    //                                                   e.stopPropagation();
    //                                                   cancelRoomSelection();
    //                                                 }}
    //                                               >
    //                                                 Cancel
    //                                               </button>
    //                                               <button
    //                                                 className="confirm-btn"
    //                                                 onClick={(e) => {
    //                                                   e.stopPropagation();
    //                                                   confirmRoomSelection();
    //                                                 }}
    //                                               >
    //                                                 Confirm
    //                                               </button>
    //                                             </div>
    //                                           </div>
    //                                         </div>
    //                                       </div>
    //                                     </div>
    //                                   );
    //                                 })}
    //                               </div>
    //                             </div>
    //                           </div>

    //                           <div className="day-section day-section-bg">
    //                             <h2
    //                               style={{
    //                                 color: "#295557",
    //                                 fontSize: "22px",
    //                                 padding: "15px 0",
    //                                 display: "flex",
    //                                 alignItems: "center",
    //                                 gap: "10px",
    //                               }}
    //                             >
    //                               <MdEmojiTransportation />
    //                               cars
    //                             </h2>
    //                             <div className="cards-container-parent">
    //                               <div className="cards-container">
    //                                 {hotel?.transfers?.map((item) => {
    //                                   const selectedTransfer =
    //                                     selectedTours?.transfers?.find(
    //                                       (selected) =>
    //                                         selected.day === index + 1
    //                                     );

    //                                   const isSelected =
    //                                     selectedTransfer?.id === item.id;

    //                                   const priceDifference =
    //                                     calculatePriceDifference(
    //                                       selectedTransfer?.price,
    //                                       item?.price
    //                                     );
    //                                   console.log(priceDifference);
    //                                   return (
    //                                     <div
    //                                       key={item.id}
    //                                       className={`card ${
    //                                         isSelected ? "selected" : ""
    //                                       }`}
    //                                       onClick={() => {
    //                                         setSelectedTours((prevState) => ({
    //                                           ...prevState,
    //                                           transfers: [
    //                                             ...prevState.transfers.filter(
    //                                               (h) => h.day !== index + 1
    //                                             ),
    //                                             {
    //                                               day: index + 1,
    //                                               name: item.name,
    //                                               id: item.id,
    //                                               price: item.price,
    //                                             },
    //                                           ],
    //                                         }));
    //                                       }}
    //                                     >
    //                                       <img
    //                                         src={item.image}
    //                                         alt={item.name}
    //                                         className="card-image"
    //                                       />
    //                                       <div className="card-content">
    //                                         <h3>{item.name}</h3>
    //                                         <div className="gap-3 mb-3 transfer_feat_cont">
    //                                           <div className="d-flex align-items-center gap-2 transfer_in">
    //                                             <FaHotel />
    //                                             <div className="d-flex flex-column transfer_cont">
    //                                               <div className="fw-bold">
    //                                                 Brand
    //                                               </div>
    //                                               <div
    //                                                 className="transfer_info"
    //                                                 title={item?.category}
    //                                               >
    //                                                 {item?.category}
    //                                               </div>
    //                                             </div>
    //                                           </div>
    //                                           <div className="d-flex align-items-center gap-2 transfer_in">
    //                                             <GiDuration />
    //                                             <div className="d-flex flex-column transfer_cont">
    //                                               <div className="fw-bold capitalize">
    //                                                 capacity
    //                                               </div>
    //                                               <div
    //                                                 className="transfer_info"
    //                                                 title={item?.capacity}
    //                                               >
    //                                                 {item?.capacity}
    //                                               </div>
    //                                             </div>
    //                                           </div>
    //                                         </div>
    //                                         <div className="card-footer">
    //                                           <span className="price">
    //                                             {isSelected
    //                                               ? "Selected"
    //                                               : priceDifference !== 0
    //                                               ? `${
    //                                                   priceDifference > 0
    //                                                     ? "+"
    //                                                     : ""
    //                                                 }${priceDifference} USD`
    //                                               : priceDifference == 0
    //                                               ? "Same Price"
    //                                               : `+${item.price} USD`}
    //                                           </span>
    //                                           <div
    //                                             className={`custom-radio ${
    //                                               isSelected ? "selected" : ""
    //                                             }`}
    //                                           >
    //                                             <div className="radio-circle"></div>
    //                                           </div>
    //                                         </div>
    //                                       </div>
    //                                     </div>
    //                                   );
    //                                 })}
    //                               </div>
    //                             </div>
    //                           </div>
    //                         </Panel>
    //                       </Collapse>
    //                     </div>
    //                   </div>
    //                 </div>
    //               );
    //             })}
    //           </div>

    //           <div className="tour-location">
    //             <h4>Location Map</h4>
    //             <div className="map-area mb-30">
    //               <iframe
    //                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193325.0481540361!2d-74.06757856146028!3d40.79052383652264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1660366711448!5m2!1sen!2sbd"
    //                 width={600}
    //                 height={450}
    //                 style={{ border: 0 }}
    //                 allowFullScreen
    //                 loading="lazy"
    //                 referrerPolicy="no-referrer-when-downgrade"
    //               />
    //             </div>
    //           </div>
    //           <div className="faq-content-wrap mb-80">
    //             <div className="faq-content-title mb-[20px]">
    //               <h4>Frequently Asked &amp; Question</h4>
    //             </div>
    //             <div className="faq-content">
    //               <div className="accordion" id="accordionExample">
    //                 {faqData.map((item, index) => (
    //                   <div className="accordion-item" key={index}>
    //                     <h2 className="accordion-header">
    //                       <button
    //                         className={`accordion-button ${
    //                           activeIndex === index ? "" : "collapsed"
    //                         }`}
    //                         type="button"
    //                         onClick={() => handleToggle(index)}
    //                       >
    //                         {item.question}
    //                       </button>
    //                     </h2>
    //                     <div
    //                       className={`accordion-collapse collapse ${
    //                         activeIndex === index ? "show" : ""
    //                       }`}
    //                     >
    //                       <div className="accordion-body">{item.answer}</div>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             </div>
    //           </div>
    //           <div className="review-wrapper">
    //             <h4>Customer Review</h4>
    //             <div className="review-box">
    //               <div className="total-review">
    //                 <h2>9.5</h2>
    //                 <div className="review-wrap">
    //                   <ul className="star-list">
    //                     <li>
    //                       <i className="bi bi-star-fill" />
    //                     </li>
    //                     <li>
    //                       <i className="bi bi-star-fill" />
    //                     </li>
    //                     <li>
    //                       <i className="bi bi-star-fill" />
    //                     </li>
    //                     <li>
    //                       <i className="bi bi-star-fill" />
    //                     </li>
    //                     <li>
    //                       <i className="bi bi-star-half" />
    //                     </li>
    //                   </ul>
    //                   <span>2590 Reviews</span>
    //                 </div>
    //               </div>
    //               {/* modal for review */}
    //               <div
    //                 className="modal fade"
    //                 id="exampleModalToggle"
    //                 aria-hidden="true"
    //                 tabIndex={-1}
    //               >
    //                 <div className="modal-dialog modal-dialog-centered">
    //                   <div className="modal-content">
    //                     <div className="modal-body">
    //                       <button
    //                         type="button"
    //                         className="btn-close"
    //                         data-bs-dismiss="modal"
    //                         aria-label="Close"
    //                       >
    //                         <i className="bi bi-x-lg" />
    //                       </button>
    //                       <div className="row g-2">
    //                         <div className="col-lg-8">
    //                           <div className="review-from-wrapper">
    //                             <h4>Write Your Review</h4>
    //                             <form>
    //                               <div className="row">
    //                                 <div className="col-md-6 mb-[20px]">
    //                                   <div className="form-inner">
    //                                     <label>Name</label>
    //                                     <input
    //                                       type="text"
    //                                       placeholder="Enter Your Name:"
    //                                     />
    //                                   </div>
    //                                 </div>
    //                                 <div className="col-md-6 mb-[20px]">
    //                                   <div className="form-inner">
    //                                     <label>Email</label>
    //                                     <input
    //                                       type="email"
    //                                       placeholder="Enter Your Email:"
    //                                     />
    //                                   </div>
    //                                 </div>
    //                                 <div className="col-lg-12 mb-[20px]">
    //                                   <div className="form-inner">
    //                                     <label>Review*</label>
    //                                     <textarea
    //                                       name="message"
    //                                       placeholder="Enter Your Review..."
    //                                       defaultValue={""}
    //                                     />
    //                                   </div>
    //                                 </div>
    //                                 <div className="col-lg-12 mb-10">
    //                                   <div className="star-rating-wrapper">
    //                                     <ul className="star-rating-list">
    //                                       <li>
    //                                         <div
    //                                           className="rating-container"
    //                                           data-rating={0}
    //                                         >
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                         </div>
    //                                         <span>Overall</span>
    //                                       </li>
    //                                       <li>
    //                                         <div
    //                                           className="rating-container"
    //                                           data-rating={0}
    //                                         >
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                         </div>
    //                                         <span>Transport</span>
    //                                       </li>
    //                                       <li>
    //                                         <div
    //                                           className="rating-container"
    //                                           data-rating={0}
    //                                         >
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                         </div>
    //                                         <span>Food</span>
    //                                       </li>
    //                                       <li>
    //                                         <div
    //                                           className="rating-container"
    //                                           data-rating={0}
    //                                         >
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                         </div>
    //                                         <span>Destination</span>
    //                                       </li>
    //                                       <li>
    //                                         <div
    //                                           className="rating-container"
    //                                           data-rating={0}
    //                                         >
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                           <i className="bi bi-star-fill star-icon" />
    //                                         </div>
    //                                         <span>Hospitality</span>
    //                                       </li>
    //                                     </ul>
    //                                   </div>
    //                                 </div>
    //                                 <div className="col-lg-12">
    //                                   <button
    //                                     type="submit"
    //                                     className="primary-btn1"
    //                                   >
    //                                     Submit Now
    //                                   </button>
    //                                 </div>
    //                               </div>
    //                             </form>
    //                           </div>
    //                         </div>
    //                         <div className="col-lg-4 d-lg-flex d-none">
    //                           <div className="modal-form-image">
    //                             <img
    //                               src="/assets/img/innerpage/form-image.jpg"
    //                               alt="image"
    //                               className="img-fluid"
    //                             />
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //               <a
    //                 className="primary-btn1"
    //                 data-bs-toggle="modal"
    //                 href="#exampleModalToggle"
    //                 role="button"
    //               >
    //                 GIVE A RATING
    //               </a>
    //             </div>
    //             <div className="review-area">
    //               <ul className="comment">
    //                 <li>
    //                   <div className="single-comment-area">
    //                     <div className="author-img">
    //                       <img
    //                         src="https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder2.jpg"
    //                         alt=""
    //                       />
    //                     </div>
    //                     <div className="comment-content">
    //                       <div className="author-name-deg">
    //                         <h6>Mr. Bowmik Haldar,</h6>
    //                         <span>05 June, 2023</span>
    //                       </div>
    //                       <ul className="review-item-list">
    //                         <li>
    //                           <span>Overall</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Transport</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Food</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Destination</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Hospitality</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                       </ul>
    //                       <p>
    //                         A solution that we came up with is to think of
    //                         sanitary pads packaging as you would tea. Tea comes
    //                         individually packaged{" "}
    //                       </p>
    //                       <div className="replay-btn">
    //                         <svg
    //                           xmlns="http://www.w3.org/2000/svg"
    //                           width={14}
    //                           height={11}
    //                           viewBox="0 0 14 11"
    //                         >
    //                           <path d="M8.55126 1.11188C8.52766 1.10118 8.50182 1.09676 8.47612 1.09903C8.45042 1.1013 8.42569 1.11018 8.40419 1.12486C8.3827 1.13954 8.36513 1.15954 8.35311 1.18304C8.34109 1.20653 8.335 1.23276 8.33539 1.25932V2.52797C8.33539 2.67388 8.2791 2.81381 8.17889 2.91698C8.07868 3.02016 7.94277 3.07812 7.80106 3.07812C7.08826 3.07812 5.64984 3.08362 4.27447 3.98257C3.2229 4.66916 2.14783 5.9191 1.50129 8.24735C2.59132 7.16575 3.83632 6.57929 4.92635 6.2679C5.59636 6.07737 6.28492 5.96444 6.97926 5.93121C7.26347 5.91835 7.54815 5.92129 7.83205 5.94001H7.84594L7.85129 5.94111L7.80106 6.48906L7.85449 5.94111C7.98638 5.95476 8.10864 6.01839 8.19751 6.11966C8.28638 6.22092 8.33553 6.35258 8.33539 6.48906V7.75771C8.33539 7.87654 8.45294 7.95136 8.55126 7.90515L12.8088 4.67796C12.8233 4.66692 12.8383 4.65664 12.8537 4.64715C12.8769 4.63278 12.8962 4.61245 12.9095 4.58816C12.9229 4.56386 12.9299 4.53643 12.9299 4.50851C12.9299 4.4806 12.9229 4.45316 12.9095 4.42887C12.8962 4.40458 12.8769 4.38425 12.8537 4.36988C12.8382 4.36039 12.8233 4.35011 12.8088 4.33907L8.55126 1.11188ZM7.26673 7.02381C7.19406 7.02381 7.11391 7.02711 7.02842 7.03041C6.56462 7.05242 5.92342 7.12504 5.21169 7.32859C3.79464 7.7335 2.11684 8.65116 1.00115 10.7175C0.940817 10.8291 0.844683 10.9155 0.729224 10.9621C0.613765 11.0087 0.486168 11.0124 0.368304 10.9728C0.250441 10.9331 0.149648 10.8525 0.0831985 10.7447C0.0167484 10.6369 -0.011219 10.5086 0.0040884 10.3819C0.499949 6.29981 2.01959 4.15202 3.70167 3.05391C5.03215 2.18467 6.40218 2.01743 7.26673 1.98552V1.25932C7.26663 1.03273 7.32593 0.810317 7.43839 0.615545C7.55084 0.420773 7.71227 0.260866 7.90565 0.152696C8.09902 0.0445258 8.31717 -0.00789584 8.53707 0.000962485C8.75698 0.00982081 8.97048 0.0796305 9.15506 0.203025L13.4233 3.43792C13.5998 3.55133 13.7453 3.7091 13.8462 3.8964C13.9471 4.08369 14 4.29434 14 4.50851C14 4.72269 13.9471 4.93333 13.8462 5.12063C13.7453 5.30792 13.5998 5.4657 13.4233 5.57911L9.15506 8.814C8.97048 8.9374 8.75698 9.00721 8.53707 9.01607C8.31717 9.02492 8.09902 8.9725 7.90565 8.86433C7.71227 8.75616 7.55084 8.59626 7.43839 8.40148C7.32593 8.20671 7.26663 7.9843 7.26673 7.75771V7.02381Z"></path>
    //                         </svg>
    //                         Reply (01)
    //                       </div>
    //                     </div>
    //                   </div>
    //                   <ul className="comment-replay">
    //                     <li>
    //                       <div className="single-comment-area">
    //                         <div className="author-img">
    //                           <img
    //                             src="https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder1-500x500.jpg"
    //                             alt=""
    //                           />
    //                         </div>
    //                         <div className="comment-content">
    //                           <div className="author-name-deg">
    //                             <h6>Author Response,</h6>
    //                             <span>05 June, 2023</span>
    //                           </div>
    //                           <p>Thanks for your review.</p>
    //                           <div className="replay-btn">
    //                             <svg
    //                               xmlns="http://www.w3.org/2000/svg"
    //                               width={14}
    //                               height={11}
    //                               viewBox="0 0 14 11"
    //                             >
    //                               <path d="M8.55126 1.11188C8.52766 1.10118 8.50182 1.09676 8.47612 1.09903C8.45042 1.1013 8.42569 1.11018 8.40419 1.12486C8.3827 1.13954 8.36513 1.15954 8.35311 1.18304C8.34109 1.20653 8.335 1.23276 8.33539 1.25932V2.52797C8.33539 2.67388 8.2791 2.81381 8.17889 2.91698C8.07868 3.02016 7.94277 3.07812 7.80106 3.07812C7.08826 3.07812 5.64984 3.08362 4.27447 3.98257C3.2229 4.66916 2.14783 5.9191 1.50129 8.24735C2.59132 7.16575 3.83632 6.57929 4.92635 6.2679C5.59636 6.07737 6.28492 5.96444 6.97926 5.93121C7.26347 5.91835 7.54815 5.92129 7.83205 5.94001H7.84594L7.85129 5.94111L7.80106 6.48906L7.85449 5.94111C7.98638 5.95476 8.10864 6.01839 8.19751 6.11966C8.28638 6.22092 8.33553 6.35258 8.33539 6.48906V7.75771C8.33539 7.87654 8.45294 7.95136 8.55126 7.90515L12.8088 4.67796C12.8233 4.66692 12.8383 4.65664 12.8537 4.64715C12.8769 4.63278 12.8962 4.61245 12.9095 4.58816C12.9229 4.56386 12.9299 4.53643 12.9299 4.50851C12.9299 4.4806 12.9229 4.45316 12.9095 4.42887C12.8962 4.40458 12.8769 4.38425 12.8537 4.36988C12.8382 4.36039 12.8233 4.35011 12.8088 4.33907L8.55126 1.11188ZM7.26673 7.02381C7.19406 7.02381 7.11391 7.02711 7.02842 7.03041C6.56462 7.05242 5.92342 7.12504 5.21169 7.32859C3.79464 7.7335 2.11684 8.65116 1.00115 10.7175C0.940817 10.8291 0.844683 10.9155 0.729224 10.9621C0.613765 11.0087 0.486168 11.0124 0.368304 10.9728C0.250441 10.9331 0.149648 10.8525 0.0831985 10.7447C0.0167484 10.6369 -0.011219 10.5086 0.0040884 10.3819C0.499949 6.29981 2.01959 4.15202 3.70167 3.05391C5.03215 2.18467 6.40218 2.01743 7.26673 1.98552V1.25932C7.26663 1.03273 7.32593 0.810317 7.43839 0.615545C7.55084 0.420773 7.71227 0.260866 7.90565 0.152696C8.09902 0.0445258 8.31717 -0.00789584 8.53707 0.000962485C8.75698 0.00982081 8.97048 0.0796305 9.15506 0.203025L13.4233 3.43792C13.5998 3.55133 13.7453 3.7091 13.8462 3.8964C13.9471 4.08369 14 4.29434 14 4.50851C14 4.72269 13.9471 4.93333 13.8462 5.12063C13.7453 5.30792 13.5998 5.4657 13.4233 5.57911L9.15506 8.814C8.97048 8.9374 8.75698 9.00721 8.53707 9.01607C8.31717 9.02492 8.09902 8.9725 7.90565 8.86433C7.71227 8.75616 7.55084 8.59626 7.43839 8.40148C7.32593 8.20671 7.26663 7.9843 7.26673 7.75771V7.02381Z"></path>
    //                             </svg>
    //                             Reply
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </li>
    //                   </ul>
    //                 </li>
    //                 <li>
    //                   <div className="single-comment-area">
    //                     <div className="author-img">
    //                       <img
    //                         src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740905588/erik-lucatero-d2MSDujJl2g-unsplash_bukkgc.jpg"
    //                         alt=""
    //                       />
    //                     </div>
    //                     <div className="comment-content">
    //                       <div className="author-name-deg">
    //                         <h6>Srileka Panday,</h6>
    //                         <span>05 June, 2023</span>
    //                       </div>
    //                       <ul className="review-item-list">
    //                         <li>
    //                           <span>Overall</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Transport</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Food</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Destination</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Hospitality</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                       </ul>
    //                       <p>
    //                         A solution that we came up with is to think of
    //                         sanitary pads packaging as you would tea. Tea comes
    //                         individually packaged{" "}
    //                       </p>
    //                       <div className="replay-btn">
    //                         <svg
    //                           xmlns="http://www.w3.org/2000/svg"
    //                           width={14}
    //                           height={11}
    //                           viewBox="0 0 14 11"
    //                         >
    //                           <path d="M8.55126 1.11188C8.52766 1.10118 8.50182 1.09676 8.47612 1.09903C8.45042 1.1013 8.42569 1.11018 8.40419 1.12486C8.3827 1.13954 8.36513 1.15954 8.35311 1.18304C8.34109 1.20653 8.335 1.23276 8.33539 1.25932V2.52797C8.33539 2.67388 8.2791 2.81381 8.17889 2.91698C8.07868 3.02016 7.94277 3.07812 7.80106 3.07812C7.08826 3.07812 5.64984 3.08362 4.27447 3.98257C3.2229 4.66916 2.14783 5.9191 1.50129 8.24735C2.59132 7.16575 3.83632 6.57929 4.92635 6.2679C5.59636 6.07737 6.28492 5.96444 6.97926 5.93121C7.26347 5.91835 7.54815 5.92129 7.83205 5.94001H7.84594L7.85129 5.94111L7.80106 6.48906L7.85449 5.94111C7.98638 5.95476 8.10864 6.01839 8.19751 6.11966C8.28638 6.22092 8.33553 6.35258 8.33539 6.48906V7.75771C8.33539 7.87654 8.45294 7.95136 8.55126 7.90515L12.8088 4.67796C12.8233 4.66692 12.8383 4.65664 12.8537 4.64715C12.8769 4.63278 12.8962 4.61245 12.9095 4.58816C12.9229 4.56386 12.9299 4.53643 12.9299 4.50851C12.9299 4.4806 12.9229 4.45316 12.9095 4.42887C12.8962 4.40458 12.8769 4.38425 12.8537 4.36988C12.8382 4.36039 12.8233 4.35011 12.8088 4.33907L8.55126 1.11188ZM7.26673 7.02381C7.19406 7.02381 7.11391 7.02711 7.02842 7.03041C6.56462 7.05242 5.92342 7.12504 5.21169 7.32859C3.79464 7.7335 2.11684 8.65116 1.00115 10.7175C0.940817 10.8291 0.844683 10.9155 0.729224 10.9621C0.613765 11.0087 0.486168 11.0124 0.368304 10.9728C0.250441 10.9331 0.149648 10.8525 0.0831985 10.7447C0.0167484 10.6369 -0.011219 10.5086 0.0040884 10.3819C0.499949 6.29981 2.01959 4.15202 3.70167 3.05391C5.03215 2.18467 6.40218 2.01743 7.26673 1.98552V1.25932C7.26663 1.03273 7.32593 0.810317 7.43839 0.615545C7.55084 0.420773 7.71227 0.260866 7.90565 0.152696C8.09902 0.0445258 8.31717 -0.00789584 8.53707 0.000962485C8.75698 0.00982081 8.97048 0.0796305 9.15506 0.203025L13.4233 3.43792C13.5998 3.55133 13.7453 3.7091 13.8462 3.8964C13.9471 4.08369 14 4.29434 14 4.50851C14 4.72269 13.9471 4.93333 13.8462 5.12063C13.7453 5.30792 13.5998 5.4657 13.4233 5.57911L9.15506 8.814C8.97048 8.9374 8.75698 9.00721 8.53707 9.01607C8.31717 9.02492 8.09902 8.9725 7.90565 8.86433C7.71227 8.75616 7.55084 8.59626 7.43839 8.40148C7.32593 8.20671 7.26663 7.9843 7.26673 7.75771V7.02381Z"></path>
    //                         </svg>
    //                         Reply
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </li>
    //                 <li>
    //                   <div className="single-comment-area">
    //                     <div className="author-img">
    //                       <img
    //                         src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740905832/joes-valentine-qyQJU0zKiXk-unsplash_p28qom.jpg"
    //                         alt=""
    //                       />
    //                     </div>
    //                     <div className="comment-content">
    //                       <div className="author-name-deg">
    //                         <h6>Mr. Bowmik Haldar,</h6>
    //                         <span>05 June, 2023</span>
    //                       </div>
    //                       <ul className="review-item-list">
    //                         <li>
    //                           <span>Overall</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Transport</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Food</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Destination</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                         <li>
    //                           <span>Hospitality</span>
    //                           <ul className="star-list">
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-fill" />
    //                             </li>
    //                             <li>
    //                               <i className="bi bi-star-half" />
    //                             </li>
    //                           </ul>
    //                         </li>
    //                       </ul>
    //                       <p>
    //                         However, here are some well-regarded car dealerships
    //                         known for their customer service, inventory, and
    //                         overall reputation. It's always a good idea to
    //                         research and read reviews specific...
    //                       </p>
    //                       <div className="replay-btn">
    //                         <svg
    //                           xmlns="http://www.w3.org/2000/svg"
    //                           width={14}
    //                           height={11}
    //                           viewBox="0 0 14 11"
    //                         >
    //                           <path d="M8.55126 1.11188C8.52766 1.10118 8.50182 1.09676 8.47612 1.09903C8.45042 1.1013 8.42569 1.11018 8.40419 1.12486C8.3827 1.13954 8.36513 1.15954 8.35311 1.18304C8.34109 1.20653 8.335 1.23276 8.33539 1.25932V2.52797C8.33539 2.67388 8.2791 2.81381 8.17889 2.91698C8.07868 3.02016 7.94277 3.07812 7.80106 3.07812C7.08826 3.07812 5.64984 3.08362 4.27447 3.98257C3.2229 4.66916 2.14783 5.9191 1.50129 8.24735C2.59132 7.16575 3.83632 6.57929 4.92635 6.2679C5.59636 6.07737 6.28492 5.96444 6.97926 5.93121C7.26347 5.91835 7.54815 5.92129 7.83205 5.94001H7.84594L7.85129 5.94111L7.80106 6.48906L7.85449 5.94111C7.98638 5.95476 8.10864 6.01839 8.19751 6.11966C8.28638 6.22092 8.33553 6.35258 8.33539 6.48906V7.75771C8.33539 7.87654 8.45294 7.95136 8.55126 7.90515L12.8088 4.67796C12.8233 4.66692 12.8383 4.65664 12.8537 4.64715C12.8769 4.63278 12.8962 4.61245 12.9095 4.58816C12.9229 4.56386 12.9299 4.53643 12.9299 4.50851C12.9299 4.4806 12.9229 4.45316 12.9095 4.42887C12.8962 4.40458 12.8769 4.38425 12.8537 4.36988C12.8382 4.36039 12.8233 4.35011 12.8088 4.33907L8.55126 1.11188ZM7.26673 7.02381C7.19406 7.02381 7.11391 7.02711 7.02842 7.03041C6.56462 7.05242 5.92342 7.12504 5.21169 7.32859C3.79464 7.7335 2.11684 8.65116 1.00115 10.7175C0.940817 10.8291 0.844683 10.9155 0.729224 10.9621C0.613765 11.0087 0.486168 11.0124 0.368304 10.9728C0.250441 10.9331 0.149648 10.8525 0.0831985 10.7447C0.0167484 10.6369 -0.011219 10.5086 0.0040884 10.3819C0.499949 6.29981 2.01959 4.15202 3.70167 3.05391C5.03215 2.18467 6.40218 2.01743 7.26673 1.98552V1.25932C7.26663 1.03273 7.32593 0.810317 7.43839 0.615545C7.55084 0.420773 7.71227 0.260866 7.90565 0.152696C8.09902 0.0445258 8.31717 -0.00789584 8.53707 0.000962485C8.75698 0.00982081 8.97048 0.0796305 9.15506 0.203025L13.4233 3.43792C13.5998 3.55133 13.7453 3.7091 13.8462 3.8964C13.9471 4.08369 14 4.29434 14 4.50851C14 4.72269 13.9471 4.93333 13.8462 5.12063C13.7453 5.30792 13.5998 5.4657 13.4233 5.57911L9.15506 8.814C8.97048 8.9374 8.75698 9.00721 8.53707 9.01607C8.31717 9.02492 8.09902 8.9725 7.90565 8.86433C7.71227 8.75616 7.55084 8.59626 7.43839 8.40148C7.32593 8.20671 7.26663 7.9843 7.26673 7.75771V7.02381Z"></path>
    //                         </svg>
    //                         Reply
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </li>
    //               </ul>
    //             </div>
    //           </div>
    //         </div>
    //         <div
    //           className="col-xl-4"
    //           style={{
    //             position: "sticky",
    //             top: "90px",
    //             height: "100vh",
    //           }}
    //         >
    //           <div
    //             className="booking-form-wrap mb-10"
    //             style={{
    //               overflow: "hidden",
    //             }}
    //           >
    //             <h4 className="">Travel Details</h4>

    //             <div className="tab-content" id="v-pills-tabContent2">
    //               <div
    //                 className="tab-pane fade active show"
    //                 id="v-pills-booking"
    //                 role="tabpanel"
    //                 aria-labelledby="v-pills-booking-tab"
    //               >
    //                 <div className="sidebar-booking-form">
    //                   <div>
    //                     <div className="collapse_cont">
    //                       <div className="travel-grid">
    //                         {/* Travel Dates */}

    //                         <Dropdown
    //                           menu={{
    //                             items: [],
    //                           }}
    //                           trigger={["click"]}
    //                           dropdownRender={(menu) => (
    //                             <div style={contentStyle}>
    //                               {React.cloneElement(menu, {
    //                                 style: menuStyle,
    //                               })}

    //                               <div className="calendar_cont">
    //                                 <Calendar
    //                                   onChange={handleDateChange}
    //                                   value={dateValue}
    //                                   minDate={oneDayLater}
    //                                   selectRange={true}
    //                                 />
    //                               </div>
    //                             </div>
    //                           )}
    //                         >
    //                           <div className="travel-item">
    //                             <label className="travel-label">
    //                               Travel dates
    //                             </label>
    //                             <div className="travel-input">
    //                               <span className="travel-icon">📅</span>
    //                               <span className="travel-text">
    //                                 {formattedRange}
    //                               </span>
    //                               <span
    //                                 className="travel-dropdown"
    //                                 style={{ color: "#295557" }}
    //                               >
    //                                 ▼
    //                               </span>
    //                             </div>
    //                           </div>
    //                         </Dropdown>
    //                         <Dropdown
    //                           menu={{
    //                             items: [],
    //                           }}
    //                           trigger={["click"]}
    //                           dropdownRender={(menu) => (
    //                             <div style={contentStyle}>
    //                               {React.cloneElement(menu, {
    //                                 style: menuStyle,
    //                               })}

    //                               <div className="d-flex flex-column gap-2 p-2">
    //                                 <div className="add_travel_drop px-2">
    //                                   Add Travelers
    //                                 </div>

    //                                 <div className="d-flex justify-content-between px-2 align-items-center w-100">
    //                                   <div className="flex flex-col">
    //                                     <div className="drop_text">Adults</div>
    //                                     {/*drop_desc */}
    //                                     <div className="text-[10px] text-gray-500 ">
    //                                       Adults are 18 years or older.
    //                                     </div>
    //                                   </div>

    //                                   <div className="d-flex align-items-center gap-3">
    //                                     <button
    //                                       className="travel_button"
    //                                       disabled={people?.adults == 1}
    //                                       onClick={() =>
    //                                         setPeople({
    //                                           ...people,
    //                                           adults: people?.adults - 1,
    //                                         })
    //                                       }
    //                                     >
    //                                       <FaMinus />
    //                                     </button>

    //                                     <div className="adults_text">
    //                                       {people?.adults}
    //                                     </div>
    //                                     <button
    //                                       onClick={() =>
    //                                         setPeople({
    //                                           ...people,
    //                                           adults: people?.adults + 1,
    //                                         })
    //                                       }
    //                                       className="travel_button"
    //                                     >
    //                                       <FaPlus />
    //                                     </button>
    //                                   </div>
    //                                 </div>
    //                                 <div className="d-flex justify-content-between px-2 align-items-center w-100">
    //                                   <div className="flex flex-col">
    //                                     <div className="drop_text">
    //                                       Children
    //                                     </div>
    //                                     <div className="text-[10px] text-gray-500 ">
    //                                       Children are 2-12 years old.
    //                                     </div>
    //                                   </div>

    //                                   <div className="d-flex align-items-center gap-3">
    //                                     <button
    //                                       className="travel_button"
    //                                       disabled={people?.children <= 0}
    //                                       onClick={() =>
    //                                         setPeople({
    //                                           ...people,
    //                                           children: people?.children - 1,
    //                                         })
    //                                       }
    //                                     >
    //                                       <FaMinus />
    //                                     </button>

    //                                     <div className="adults_text">
    //                                       {people?.children}
    //                                     </div>
    //                                     <button
    //                                       onClick={() =>
    //                                         setPeople({
    //                                           ...people,
    //                                           children: people?.children + 1,
    //                                         })
    //                                       }
    //                                       className="travel_button"
    //                                     >
    //                                       <FaPlus />
    //                                     </button>
    //                                   </div>
    //                                 </div>
    //                                 <div className="d-flex justify-content-between px-2 align-items-center w-100">
    //                                   <div className="flex flex-col">
    //                                     <div className="drop_text">Infants</div>
    //                                     <div className="text-[10px] text-gray-500 ">
    //                                       Infants are 0-2 years old.
    //                                     </div>
    //                                   </div>

    //                                   <div className="d-flex align-items-center gap-3">
    //                                     <button
    //                                       className="travel_button"
    //                                       disabled={people?.infants <= 0}
    //                                       onClick={() =>
    //                                         setPeople({
    //                                           ...people,
    //                                           infants: people?.infants - 1,
    //                                         })
    //                                       }
    //                                     >
    //                                       <FaMinus />
    //                                     </button>

    //                                     <div className="adults_text">
    //                                       {people?.infants}
    //                                     </div>
    //                                     <button
    //                                       onClick={() =>
    //                                         setPeople({
    //                                           ...people,
    //                                           infants: people?.infants + 1,
    //                                         })
    //                                       }
    //                                       className="travel_button"
    //                                     >
    //                                       <FaPlus />
    //                                     </button>
    //                                   </div>
    //                                 </div>
    //                               </div>
    //                             </div>
    //                           )}
    //                         >
    //                           <div className="travel-item">
    //                             <label className="travel-label">
    //                               Travelers
    //                             </label>
    //                             <div className="travel-input">
    //                               <span className="travel-icon">👤</span>
    //                               <span className="travel-text">
    //                                 {+people?.adults +
    //                                   +people?.children +
    //                                   +people?.infants}{" "}
    //                                 {+people?.adults +
    //                                   +people?.children +
    //                                   +people?.infants ==
    //                                 1
    //                                   ? "traveler"
    //                                   : "travelers"}
    //                               </span>
    //                               <span
    //                                 className="travel-dropdown"
    //                                 style={{ color: "#295557" }}
    //                               >
    //                                 ▼
    //                               </span>
    //                             </div>
    //                           </div>
    //                         </Dropdown>
    //                       </div>
    //                       <Collapse
    //                         expandIcon={customExpandIcon("12px")}
    //                         ghost
    //                         size="large"
    //                       >
    //                         {items.map((item) => (
    //                           <Panel
    //                             key={item.key}
    //                             header={
    //                               <div className="d-flex justify-content-between align-items-center">
    //                                 <span className="panel_head">
    //                                   {item.label}
    //                                 </span>

    //                                 <button
    //                                   className="edit-button"
    //                                   type="button"
    //                                   onClick={() => scrollToDiv(item.label)}
    //                                 >
    //                                   <FaEdit className="edit-icon" />
    //                                   Edit
    //                                 </button>
    //                               </div>
    //                             }
    //                             style={{ padding: "0px" }}
    //                           >
    //                             <div
    //                               className={`d-flex justify-content-start flex-column gap-1`}
    //                               style={{ color: "#000" }}
    //                             >
    //                               {item.children?.map((child, index) => (
    //                                 <div
    //                                   key={index}
    //                                   className={`content_panel d-flex justify-content-start  flex-column align-items-start ${
    //                                     child?.children && "mb-2"
    //                                   }`}
    //                                 >
    //                                   <div className="fw-bold mb-3 d-flex align-items-center gap-2">
    //                                     <div>{child.icon}</div>
    //                                     <div className="text-start">
    //                                       {typeof child.title === "object" ? (
    //                                         <div className="d-flex align-items-center gap-2">
    //                                           <div>{child.title.icon}</div>
    //                                           <div>{child.title.subtitle}</div>
    //                                         </div>
    //                                       ) : (
    //                                         <div className="text-start">
    //                                           {child.title}
    //                                         </div>
    //                                       )}
    //                                     </div>
    //                                   </div>

    //                                   {child.children && (
    //                                     <div
    //                                       style={{
    //                                         marginLeft: "20px",
    //                                         width: "100%",
    //                                         textAlign: "left",
    //                                       }}
    //                                       className="d-flex flex-column gap-3"
    //                                     >
    //                                       {child.children.map(
    //                                         (subChild, subIndex) => (
    //                                           <div
    //                                             className="d-flex align-items-center gap-2"
    //                                             key={subIndex}
    //                                           >
    //                                             <div>{subChild.icon}</div>
    //                                             <div>{subChild.title}</div>
    //                                           </div>
    //                                         )
    //                                       )}
    //                                     </div>
    //                                   )}
    //                                 </div>
    //                               ))}
    //                             </div>
    //                           </Panel>
    //                         ))}
    //                       </Collapse>
    //                     </div>

    //                     <div className="book_butt_cont">
    //                       <div className="total-price">
    //                         <span>Total Price:</span>{" "}
    //                         {6 *
    //                           (+people?.adults * 70 + +people?.children * 50)}
    //                         $
    //                       </div>
    //                       <button
    //                         type="submit"
    //                         className="primary-btn1 two text-white"
    //                       >
    //                         Book Now
    //                       </button>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //     <Lightbox
    //       className="img-fluid"
    //       open={isOpenimg.openingState}
    //       plugins={[Fullscreen]}
    //       index={isOpenimg.openingIndex}
    //       close={() => setOpenimg(false)}
    //       styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
    //       slides={images.map(function (elem) {
    //         return { src: elem.imageBig };
    //       })}
    //     />
    //     <React.Fragment>
    //       <ModalVideo
    //         channel="youtube"
    //         onClick={() => setOpen(true)}
    //         isOpen={isOpen}
    //         animationSpeed="350"
    //         videoId="r4KpWiK08vM"
    //         ratio="16:9"
    //         onClose={() => setOpen(false)}
    //       />
    //     </React.Fragment>
    //   </div>
    //   <Newslatter />
    //   <Footer />
    //   <Modal
    //     scrollable
    //     centered
    //     isOpen={learnModal}
    //     toggle={() => setLearnModal(false)}
    //     size="xl"
    //   >
    //     <ModalHeader
    //       toggle={() => setLearnModal(false)}
    //       className="experience_head"
    //     >
    //       <i className="fa fa-home"></i> Stay Apartments Bolholt
    //     </ModalHeader>

    //     <ModalBody>
    //       <div className="five_grid_modal">
    //         <div
    //           className="w-100"
    //           style={{
    //             position: "relative",
    //           }}
    //         >
    //           <img
    //             src="https://gti.images.tshiftcdn.com/432053/x/0/northern-lights-dancing-in-the-autumn-sky.jpg?w=360&h=220&fit=crop&crop=center&auto=format%2Ccompress&q=32&dpr=2&ixlib=react-9.8.1"
    //             alt="Main Room"
    //             className="img-fluid"
    //             style={{
    //               borderRadius: "10px 0 0 10px",
    //               height: "100%",
    //             }}
    //           />
    //           <span className="img_badge badge bg-danger mt-2">
    //             Likely to sell out soon
    //           </span>
    //         </div>
    //         <div className="w-100 img_grid_modal">
    //           <img
    //             src="https://gti.images.tshiftcdn.com/7946034/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
    //             alt="Building"
    //             className="img-fluid h-100"
    //           />
    //           <img
    //             src="https://gti.images.tshiftcdn.com/7946033/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
    //             alt="Room"
    //             className="img-fluid h-100"
    //             style={{
    //               borderRadius: "0 10px 0 0 ",
    //             }}
    //           />
    //           <img
    //             src="https://gti.images.tshiftcdn.com/7946036/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
    //             alt="City"
    //             className="img-fluid h-100"
    //           />
    //           <img
    //             src="https://gti.images.tshiftcdn.com/7946035/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
    //             alt="Lounge"
    //             className="img-fluid h-100"
    //             style={{
    //               borderRadius: "0 0 10px 0",
    //             }}
    //           />
    //         </div>
    //       </div>

    //       {/* Description & Summary */}
    //       <div className="mt-4">
    //         <h5 className="text-primary">Description</h5>
    //         <p>
    //           Stay Apartments Bolholt are a range of lovely flats located at the
    //           top of Reykjavik's main street, Laugavegur. Guests who want chic,
    //           comfortable, self-catering accommodation within walking distance
    //           of the capital's main sites will find it here.
    //         </p>
    //       </div>

    //       <div className="mt-3">
    //         <h5 className="text-primary">Summary</h5>
    //         <ul className="list-unstyled">
    //           <li>
    //             🏠 <b>Category:</b> Apartment
    //           </li>
    //           <li>
    //             📍 <b>Location:</b> 2.4 km from center
    //           </li>

    //           <li>
    //             ⏰ <b>Check-in & out:</b> 15:00 / 11:00
    //           </li>
    //         </ul>
    //       </div>
    //     </ModalBody>

    //     {/* Modal Footer */}
    //     <ModalFooter>
    //       <span className="text-success fw-bold">+121 USD per night</span>
    //       <Button color="success">Add to vacation</Button>
    //     </ModalFooter>
    //   </Modal>

    //   <Modal
    //     scrollable
    //     centered
    //     isOpen={mapModal}
    //     toggle={() => setMapModal(false)}
    //     size="xl"
    //   >
    //     <ModalHeader
    //       toggle={() => setMapModal(false)}
    //       className=""
    //     ></ModalHeader>

    //     <ModalBody>
    //       <iframe
    //         src="https://www.google.com/maps/d/u/0/embed?mid=1lsFRnAJyFnWmgitL0xs5qy6KFrmfD1Q"
    //         width="100%"
    //         height="600"
    //         frameborder="0"
    //         style={{
    //           border: 0,
    //         }}
    //         allowfullscreen=""
    //         aria-hidden="false"
    //         tabindex="0"
    //       ></iframe>
    //     </ModalBody>
    //   </Modal>
    // </>
  );
};

export default Page;
