"use client";
import React, { useEffect, useRef, useState } from "react";
import ModalVideo from "react-modal-video";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuantityCounter from "@/uitils/QuantityCounter";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import DatePicker from "react-datepicker";
import { IoCheckbox, IoLocationSharp } from "react-icons/io5";
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

import { FaSquareParking, FaLocationDot } from "react-icons/fa6";

import { GiDuration } from "react-icons/gi";
import { MdNetworkWifi2Bar } from "react-icons/md";
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
import LeftSummary from "../../package/package-details/[packageId]/package-summary/_components/left_summary";
import DayDetails from "./_components/DayDetails";
import SelfDeriveModal from "./_components/SelfDriveModal/SelfDeriveModal";

const ProfileTravelDetailsClient = ({ lang }) => {
  const [isOpen, setOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [rowData, setRowData] = useState({});
  const [learnModal, setLearnModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const position = [51.505, -0.09]; // Example: London coordinates
  const [selfDriveModal, setSelfDriveModal] = useState(false);

  const [people, setPeople] = useState({
    adults: 1,
    children: 0,
  });
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayIndex = parseInt(
              entry.target.getAttribute("data-day"),
              10
            );
            setCurrentDay(dayIndex);
          }
        });
      },
      {
        threshold: 0.5, // Adjust this value as needed
      }
    );

    const dayElements = document.querySelectorAll(".day-section");
    dayElements.forEach((element) => observer.observe(element));

    return () => {
      dayElements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  const customExpandIcon =
    (fontSize = "16px") =>
    ({ isActive }) =>
      (
        <BsFillCaretRightFill
          style={{
            color: "#cd533b",
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

  const accommodation = {
    id: 1,
    image:
      "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    name: "KEX Hostel",
    category: "Hostel",
    check_in_out: "15:00 / 11:00",
    location: "1 km from center",
    parking: "Available",
    price_per_night: 42,
    rating: 4.3,
    reviews: 2410,
  };

  const transfer = {
    id: 1,
    image:
      "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
    name: "Private Car Transfer",
    category: "Private Transfer",
    duration: "30 minutes",
    language: "English",
    price: 50,
    rating: 4.5,
    reviews: 120,

    difficulty: "Easy",
  };

  const [days, setDays] = useState([
    {
      day: 1,
      left: true,
      description: {
        en: "Day five offers the choice of sightseeing around the Snaefellsnes Peninsula or exploring Reykjavik.",
        ar: "اليوم الخامس يوفر خيار مشاهدة المعالم حول شبه جزيرة سنايفلسنس أو استكشاف ريكيافيك.",
      },
      tour_gide: false,
      driver: true,
      location: "Reykjavik",

      date: "19 Mar Wednesday",
      accommodation: [
        {
          id: 1,
          image:
            "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
          name: "KEX Hostel",
          category: { en: "Hostel", ar: "بيت شباب" },
          location: { en: "1 km from center", ar: "1 كم من المركز" },
          rating: 4.3,
        },
      ],
      transfers: [
        {
          id: 1,
          image:
            "https://www.ibiza-spotlight.com/sites/default/files/styles/auto_1500_width/public/generic-page-images/85579/slideshow-1617523508.jpg",
          name: { en: "Private Car Transfer", ar: "نقل خاص بالسيارة" },
          category: { en: "Private Transfer", ar: "نقل خاص" },
          rating: 4.5,
          capacity: "4",
        },
      ],
    },
    {
      day: 2,
      left: true,
      tour_gide: true,
      driver: false,
      description: {
        en: "Explore the northern capital of Iceland.",
        ar: "استكشف العاصمة الشمالية لأيسلندا.",
      },
      location: "Akureyri",
      date: "20 Mar Thursday",

      accommodation: [
        {
          id: 4,
          image:
            "https://gti.images.tshiftcdn.com/7294101/x/0/the-jet-nest-sculpture-seen-in-front-of-kef-airport-in-iceland.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
          name: "Fosshotel Baron",
          category: { en: "3 Stars Hotel", ar: "فندق 3 نجوم" },
          location: { en: "1.2 km from center", ar: "1.2 كم من المركز" },
          rating: 4.0,
        },
      ],
      transfers: [
        {
          id: 3,
          language: { en: "English", ar: "الإنجليزية" },
          image:
            "https://www.ibiza-spotlight.com/sites/default/files/styles/auto_1500_width/public/generic-page-images/85579/slideshow-1617523508.jpg",
          name: { en: "Domestic Flight", ar: "رحلة داخلية" },
          category: { en: "Flight", ar: "رحلة جوية" },
          rating: 4.7,
          capacity: "10",
        },
      ],
    },
    {
      day: 3,
      tour_gide: true,
      left: false,
      driver: true,
      description: {
        en: "Explore the northern capital of Iceland.",
        ar: "استكشف العاصمة الشمالية لأيسلندا.",
      },
      location: "Akureyri",

      date: "21 Mar Friday",

      accommodation: [
        {
          id: 78,
          image:
            "https://gti.images.tshiftcdn.com/7446826/x/0/northern-lights-tour-with-free-photos-refreshments.jpg?auto=format%2Ccompress&fit=crop&h=207&w=380",
          name: "Fosshotel Baron",
          category: { en: "3 Stars Hotel", ar: "فندق 3 نجوم" },
          location: { en: "1.2 km from center", ar: "1.2 كم من المركز" },
          rating: 4.0,
        },
      ],
      transfers: [
        {
          id: 5,
          image:
            "https://www.ibiza-spotlight.com/sites/default/files/styles/auto_1500_width/public/generic-page-images/85579/slideshow-1617523508.jpg",
          name: { en: "Private Car Transfer", ar: "نقل خاص بالسيارة" },
          category: { en: "Private Transfer", ar: "نقل خاص" },
          rating: 4.6,
          capacity: "4",
        },
      ],
    },
  ]);
  const calculatePriceDifference = (selectedPrice, defaultPrice) => {
    if (!selectedPrice) return defaultPrice;

    return defaultPrice - selectedPrice;
  };

  const contentStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #ccc1ae",
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
  return (
    <>
      <div className="package-details-area  mb-120 position-relative">
        <div className="container">
          <div className="others-image-wrap d-none">
            <a
              href="assets/img/innerpage/package-01.jpg"
              data-fancybox="images"
            >
              <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
            </a>
            <a
              href="assets/img/innerpage/package-02.jpg"
              data-fancybox="images"
            >
              <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
            </a>
            <a
              href="assets/img/innerpage/package-03.jpg"
              data-fancybox="images"
            >
              <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
            </a>
            <a
              href="assets/img/innerpage/package-04.jpg"
              data-fancybox="images"
            >
              <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
            </a>
            <a
              href="assets/img/innerpage/package-05.jpg"
              data-fancybox="images"
            >
              <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
            </a>
          </div>
          <div className="row g-xl-4 gy-5">
            <div className="col-xl-12">
              <h2>
                Experience the tour of excitement with the most adventurous
                activities.
              </h2>
              <div className="d-flex justify-content-between">
                <ul className="tour-info-metalist">
                  <li>
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 14 14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7 7C7.92826 7 8.8185 6.63125 9.47487 5.97487C10.1313 5.3185 10.5 4.42826 10.5 3.5C10.5 2.57174 10.1313 1.6815 9.47487 1.02513C8.8185 0.368749 7.92826 0 7 0C6.07174 0 5.1815 0.368749 4.52513 1.02513C3.86875 1.6815 3.5 2.57174 3.5 3.5C3.5 4.42826 3.86875 5.3185 4.52513 5.97487C5.1815 6.63125 6.07174 7 7 7ZM14 12.8333C14 14 12.8333 14 12.8333 14H1.16667C1.16667 14 0 14 0 12.8333C0 11.6667 1.16667 8.16667 7 8.16667C12.8333 8.16667 14 11.6667 14 12.8333Z"></path>
                    </svg>
                    Max People : 40
                  </li>
                  <li>
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 14 14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14 0.43748C14 0.372778 13.9856 0.308889 13.9579 0.250418C13.9302 0.191947 13.8898 0.140348 13.8398 0.0993396C13.7897 0.0583312 13.7312 0.0289339 13.6684 0.0132656C13.6057 -0.00240264 13.5402 -0.00395173 13.4768 0.00872996L9.1875 0.86623L4.89825 0.00872996C4.84164 -0.00258444 4.78336 -0.00258444 4.72675 0.00872996L0.35175 0.88373C0.252608 0.903546 0.163389 0.957088 0.099263 1.03525C0.0351366 1.11342 6.10593e-05 1.21138 0 1.31248L0 13.5625C3.90711e-05 13.6272 0.0144289 13.6911 0.0421328 13.7495C0.0698367 13.808 0.110165 13.8596 0.160212 13.9006C0.210259 13.9416 0.268779 13.971 0.331556 13.9867C0.394332 14.0024 0.459803 14.0039 0.52325 13.9912L4.8125 13.1337L9.10175 13.9912C9.15836 14.0025 9.21664 14.0025 9.27325 13.9912L13.6482 13.1162C13.7474 13.0964 13.8366 13.0429 13.9007 12.9647C13.9649 12.8865 13.9999 12.7886 14 12.6875V0.43748ZM4.375 12.3287V0.97123L4.8125 0.88373L5.25 0.97123V12.3287L4.89825 12.2587C4.84165 12.2474 4.78335 12.2474 4.72675 12.2587L4.375 12.3287ZM8.75 13.0287V1.67123L9.10175 1.74123C9.15836 1.75254 9.21664 1.75254 9.27325 1.74123L9.625 1.67123V13.0287L9.1875 13.1162L8.75 13.0287Z"
                      ></path>
                    </svg>
                    Italy &amp; France.
                  </li>
                </ul>

                <div className="text-secondary">4 Days Left</div>
              </div>

              <div className="itinerary-container">
                {days.map((hotel, index) => {
                  useEffect(() => {
                    console.log(selectedTours);
                  }, [selectedTours]);
                  return (
                    <Collapse
                      ghost
                      expandIcon={customExpandIcon("16px")}
                      size="large"
                      style={{
                        color: "#cd533b",
                        border: "1px solid  #cd533b",
                        marginBottom: "20px",
                      }}
                    >
                      <Panel
                        header={
                          <h2
                            className="mb-0 d-flex align-items-center justify-content-between"
                            style={{ color: "#cd533b", fontSize: "20px" }}
                          >
                            <div>Day {index + 1}</div>

                            {hotel.left && (
                              <div className="">{<IoCheckbox />}</div>
                            )}
                          </h2>
                        }
                        style={{ padding: "0px" }}
                      >
                        <div className="day-section" data-day={index}>
                          <div className="itinerary-grid mt-0 align-items-start">
                            <div key={index} className="itinerary-text">
                              <h3>{days[index]?.date}</h3>
                              <p className="feat_tour">
                                <span className="icon">🏨</span>{" "}
                                {
                                  selectedTours?.hotels?.find(
                                    (e) => e.day == hotel?.day
                                  )?.name
                                }
                              </p>
                              <p className="feat_tour">
                                <span className="icon">📍</span>{" "}
                                {
                                  selectedTours?.hotels?.find(
                                    (e) => e.day == hotel?.day
                                  )?.location
                                }
                              </p>
                            </div>

                            <div className="itinerary-image">
                              <button ref={prevRef} className="custom-prev">
                                &#8249;
                              </button>
                              <button ref={nextRef} className="custom-next">
                                &#8250;
                              </button>
                              <Swiper
                                spaceBetween={30}
                                onInit={(swiper) => {
                                  swiper.params.navigation.prevEl =
                                    prevRef.current;
                                  swiper.params.navigation.nextEl =
                                    nextRef.current;
                                  swiper.navigation.init();
                                  swiper.navigation.update();
                                }}
                                loop={true}
                                autoplay={{ delay: 5000 }}
                                effect={"fade"}
                                navigation={{
                                  nextEl: ".custom-next",
                                  prevEl: ".custom-prev",
                                }}
                                pagination={{ clickable: true }}
                                modules={[Navigation, EffectFade, Autoplay]}
                                className="mySwiper"
                              >
                                <SwiperSlide>
                                  <img
                                    src="https://gti.images.tshiftcdn.com/5850090/x/0/.jpg?auto=format%2Ccompress&crop=faces&bg=%23fff&q=75&ar=3%3A2&fit=crop&h=300"
                                    alt="Slide 1"
                                  />
                                </SwiperSlide>
                                <SwiperSlide>
                                  <img
                                    src="https://gti.images.tshiftcdn.com/503778/x/0/.jpg?auto=format%2Ccompress&crop=faces&bg=%23fff&q=75&ar=3%3A2&fit=crop&h=300"
                                    alt="Slide 2"
                                  />
                                </SwiperSlide>
                              </Swiper>
                            </div>
                          </div>

                          <DayDetails
                            setSelfDriveModal={setSelfDriveModal}
                            selfDriveModal={selfDriveModal}
                            days={days}
                            setDays={setDays}
                            lang={lang}
                            day={hotel}
                          />

                          {/* <div className="days_cont">
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex gap-4">
                                <div className="day-section">
                                  <h2
                                    style={{
                                      color: "#cd533b",
                                      fontSize: "17px",
                                      margin: "10px 0",
                                    }}
                                  >
                                    Accommodation
                                  </h2>
                                  <div className="cards-container-parent">
                                    <div className="cards-container">
                                      <div className={`card`}>
                                        <Link
                                          href={`/package/package-details/${123}`}
                                          className="cards-container-learnmore"
                                        >
                                          Learn more
                                        </Link>

                                        <div
                                          onClick={(e) => {
                                            //stop propagation
                                            e.stopPropagation();
                                            setMapModal(true);
                                          }}
                                          className="cards-container-location-icon"
                                        >
                                          <IoLocationSharp />
                                        </div>

                                        <img
                                          src={accommodation.image}
                                          alt={accommodation.name}
                                          className="card-image"
                                        />
                                        <div className="card-content">
                                          <h3>{accommodation.name}</h3>
                                          <div className="gap-3 mb-3 transfer_feat_cont">
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <FaHotel />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Category
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={
                                                    accommodation?.category
                                                  }
                                                >
                                                  {accommodation?.category}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <FaClock />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Check-in
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={
                                                    accommodation?.check_in_out
                                                  }
                                                >
                                                  {accommodation?.check_in_out}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <FaLocationDot />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Location
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={
                                                    accommodation?.location
                                                  }
                                                >
                                                  {accommodation.location}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <FaSquareParking />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Parking
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={accommodation?.parking}
                                                >
                                                  {accommodation.parking ||
                                                    "Not Available"}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="card-footer">
                                            <span className="price">
                                              {`+${accommodation.price_per_night} USD`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="day-section">
                                  <h2
                                    style={{
                                      color: "#cd533b",
                                      fontSize: "17px",
                                      margin: "10px 0",
                                    }}
                                  >
                                    Transfers
                                  </h2>
                                  <div className="cards-container-parent">
                                    <div className="cards-container">
                                      <div className={`card`}>
                                        <img
                                          src={transfer.image}
                                          alt={transfer.name}
                                          className="card-image"
                                        />
                                        <div className="card-content">
                                          <h3>{transfer.name}</h3>
                                          <div className="gap-3 mb-3 transfer_feat_cont">
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <FaHotel />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Category
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={transfer?.category}
                                                >
                                                  {transfer?.category}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <GiDuration />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Duration
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={transfer?.duration}
                                                >
                                                  {transfer?.duration}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <MdNetworkWifi2Bar />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Difficulty
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={transfer?.difficulty}
                                                >
                                                  {transfer.difficulty ||
                                                    "Easy"}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-2 transfer_in">
                                              <LiaLanguageSolid />
                                              <div className="d-flex flex-column transfer_cont">
                                                <div className="fw-bold">
                                                  Language
                                                </div>
                                                <div
                                                  className="transfer_info"
                                                  title={transfer?.language}
                                                >
                                                  {transfer.language}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="card-footer">
                                            <span className="price">
                                              {`+${transfer.price} USD`}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div> */}
                        </div>
                      </Panel>
                    </Collapse>
                  );
                })}
              </div>

              {/* <LeftSummary days={days} setDays={setDays} lang={lang} /> */}

              <div className="tour-location">
                <h4>Location Map</h4>
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
            </div>
          </div>
        </div>
        <Lightbox
          className="img-fluid"
          open={isOpenimg.openingState}
          plugins={[Fullscreen]}
          index={isOpenimg.openingIndex}
          close={() => setOpenimg(false)}
          styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
          slides={images.map(function (elem) {
            return { src: elem.imageBig };
          })}
        />
        <React.Fragment>
          <ModalVideo
            channel="youtube"
            onClick={() => setOpen(true)}
            isOpen={isOpen}
            animationSpeed="350"
            videoId="r4KpWiK08vM"
            ratio="16:9"
            onClose={() => setOpen(false)}
          />
        </React.Fragment>
      </div>
      <Newslatter />
      <SelfDeriveModal open={selfDriveModal} setOpen={setSelfDriveModal} />

      <Modal
        scrollable
        centered
        isOpen={learnModal}
        toggle={() => setLearnModal(false)}
        size="xl"
      >
        <ModalHeader
          toggle={() => setLearnModal(false)}
          className="experience_head"
        >
          <i className="fa fa-home"></i> Stay Apartments Bolholt
        </ModalHeader>

        <ModalBody>
          <div className="five_grid_modal">
            <div
              className="w-100"
              style={{
                position: "relative",
              }}
            >
              <img
                src="https://gti.images.tshiftcdn.com/432053/x/0/northern-lights-dancing-in-the-autumn-sky.jpg?w=360&h=220&fit=crop&crop=center&auto=format%2Ccompress&q=32&dpr=2&ixlib=react-9.8.1"
                alt="Main Room"
                className="img-fluid"
                style={{
                  borderRadius: "10px 0 0 10px",
                  height: "100%",
                }}
              />
              <span className="img_badge badge bg-danger mt-2">
                Likely to sell out soon
              </span>
            </div>
            <div className="w-100 img_grid_modal">
              <img
                src="https://gti.images.tshiftcdn.com/7946034/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="Building"
                className="img-fluid h-100"
              />
              <img
                src="https://gti.images.tshiftcdn.com/7946033/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="Room"
                className="img-fluid h-100"
                style={{
                  borderRadius: "0 10px 0 0 ",
                }}
              />
              <img
                src="https://gti.images.tshiftcdn.com/7946036/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="City"
                className="img-fluid h-100"
              />
              <img
                src="https://gti.images.tshiftcdn.com/7946035/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="Lounge"
                className="img-fluid h-100"
                style={{
                  borderRadius: "0 0 10px 0",
                }}
              />
            </div>
          </div>

          {/* Description & Summary */}
          <div className="mt-4">
            <h5 className="text-primary">Description</h5>
            <p>
              Stay Apartments Bolholt are a range of lovely flats located at the
              top of Reykjavik’s main street, Laugavegur. Guests who want chic,
              comfortable, self-catering accommodation within walking distance
              of the capital’s main sites will find it here.
            </p>
          </div>

          <div className="mt-3">
            <h5 className="text-primary">Summary</h5>
            <ul className="list-unstyled">
              <li>
                🏠 <b>Category:</b> Apartment
              </li>
              <li>
                📍 <b>Location:</b> 2.4 km from center
              </li>

              <li>
                ⏰ <b>Check-in & out:</b> 15:00 / 11:00
              </li>
            </ul>
          </div>
        </ModalBody>

        {/* Modal Footer */}
        <ModalFooter>
          <span className="text-success fw-bold">+121 USD per night</span>
          <Button color="success">Add to vacation</Button>
        </ModalFooter>
      </Modal>

      <Modal
        scrollable
        centered
        isOpen={mapModal}
        toggle={() => setMapModal(false)}
        size="xl"
      >
        <ModalHeader
          toggle={() => setMapModal(false)}
          className=""
        ></ModalHeader>

        <ModalBody>
          <iframe
            src="https://www.google.com/maps/d/u/0/embed?mid=1lsFRnAJyFnWmgitL0xs5qy6KFrmfD1Q"
            width="100%"
            height="600"
            frameborder="0"
            style={{
              border: 0,
            }}
            allowfullscreen=""
            aria-hidden="false"
            tabindex="0"
          ></iframe>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ProfileTravelDetailsClient;
