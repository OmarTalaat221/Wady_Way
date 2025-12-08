"use client";

import React, { useEffect, useRef, useState } from "react";
import ModalVideo from "react-modal-video";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuantityCounter from "@/uitils/QuantityCounter";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import DatePicker from "react-datepicker";
import { IoLocationSharp } from "react-icons/io5";

import { IoAirplane } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { FaEarthAsia } from "react-icons/fa6";

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

// import { FaSquareParking, FaLocationDot } from "react-icons/fa6";

// import { GiDuration } from "react-icons/gi";
// import { MdNetworkWifi2Bar } from "react-icons/md";
// import { LiaLanguageSolid } from "react-icons/lia";
import "react-datepicker/dist/react-datepicker.css";
// import Newslatter from "@/components/common/Newslatter";
// import { Dropdown, Collapse } from "antd";
// import Footer from "@/components/footer/Footer";
// import Header from "@/components/header/Header";
// import Topbar from "@/components/topbar/Topbar";
// import Calendar from "react-calendar";
// import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, EffectFade, Autoplay } from "swiper/modules";
// import Link from "../../components/link";
import "./style.css";
import TravelCard from "./../../components/cards/TravelCard";
const Account = () => {
  const [isOpen, setOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [rowData, setRowData] = useState({});
  const [learnModal, setLearnModal] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(0);
  const position = [51.505, -0.09]; // Example: London coordinates

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

  const trips = [
    {
      id: 1,
      status: "started",
      title: "Wahiba Sands & Coastal Beauty",
      duration: "5 Days / 6 Nights",
      mainLocations: ["Wahiba Sands"],
      progress: "",
      additionalLocations: [
        "Sur ",
        "Wadi Bani Khalid ",
        "Wahiba Sands (Sharqiya Sands)",
        "Al Ashkharah Beach",
      ],
      duration: "5 Days / 6 Nights",
      activities: ["Historical", "Adventure", "All Activities"],
      price: 2200,
      oldPrice: 2500,
      images: [
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026633/mmolloudycmi92reqjnf.png",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026635/almwpyxf9paodjsfn2l4.png",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026637/no484epu8gjeo94jnxsa.png",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026630/jbk2a9rras3udoow8ssz.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026631/ubr4dih7ey70kgdrr8xl.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026631/ggotltgtqmq1yx8la7x2.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743026630/ynortj5vsjqh5cwopuvm.jpg",
      ],
      places: [
        {
          id: 1,
          name: "Sur",
          description:
            "Explore the coastal town, visit the dhow shipyard and lighthouse.",
        },
        {
          id: 2,
          name: "Wadi Bani Khalid",
          description:
            "A beautiful oasis with turquoise pools perfect for swimming.",
        },
        {
          id: 3,
          name: "Wahiba Sands (Sharqiya Sands)",
          description:
            "Go dune bashing, camel riding, and enjoy a Bedouin camp experience.",
        },
        {
          id: 4,
          name: "Al Ashkharah Beach",
          description: "Relax by the beach where the desert touches the sea.",
        },
      ],

      intro: `
      📌 Introduction to Wahiba Sands
  Wahiba Sands, also known as the Sharqiya Sands, is one of the most stunning deserts in Oman, stretching across vast golden dunes that reach up to 100 meters high. It is known for its diverse ecosystem, hosting authentic Bedouin culture and breathtaking landscapes.\n\n
  
  🌟 A trip to Wahiba Sands offers an exciting adventure across the dunes, moments of relaxation under a clear sky, and a rich cultural experience that reflects the true essence of Omani Bedouin life, making it an unforgettable destination for nature and adventure lovers! 🚙🏜✨
  `,

      inclusions: [
        "Transportation in 4x4 vehicles to and from the destination.",
        "Exciting dune bashing experience with a professional driver.",
        "Camel riding to experience authentic Bedouin life.",
        "Overnight stay at a Bedouin camp equipped with all comforts.",
        "Traditional meals (dinner and breakfast) with Omani coffee and tea.",
        "Sunrise and sunset viewing from breathtaking desert locations.",
        "Evening entertainment around the campfire with Bedouin storytelling.",
        "Professional tour guide providing insights into Omani culture and desert life.",
      ],
      exclusions: [
        "Flights to and from Oman.",
        "Personal expenses or shopping.",
        "Travel insurance.",
        "Additional activities not mentioned in the itinerary, such as sandboarding or private tours.",
        "Soft drinks and snacks not included in the package.",
      ],

      tourHighlights: [
        "🏝 Sur City – Explore this historic coastal town, visit the traditional dhow shipyard and the iconic Sur Lighthouse.",
        "🌊 Wadi Bani Khalid – A breathtaking oasis with turquoise water pools surrounded by mountains, perfect for swimming and relaxation.",
        "🏜 Wahiba Sands (Sharqiya Sands) – Experience dune bashing, camel riding, and camping in a Bedouin-style desert camp under a starry sky.",
        "🔥 Authentic Bedouin Experience – Meet local Bedouins, learn about their traditions, and enjoy Omani hospitality with coffee, dates, and traditional meals.",
        "🌅 Stunning Sunrises & Sunsets – Watch the desert transform as the sunlight paints the dunes in golden hues, creating an incredible photography opportunity.",
        "🏖 Al Ashkharah Beach – Relax on this serene beach where the desert meets the sea, enjoying the refreshing ocean breeze.",
      ],
      map: "https://www.google.com/maps/d/embed?mid=1M8hb-2EIdr0JJmpyqTpn1-VqVgerymI&ehbc=2E312F",
    },
    {
      id: 2,
      status: "noStarted",
      title: "Empty Quarter (Rub' al Khali) Exploration",
      duration: "7 Days / 6 Nights",
      mainLocations: ["Empty Quarter", "Salalah", "Shisr (Ubar)"],
      additionalLocations: ["Rub' al Khali Desert", "Mudayy Village"],
      activities: ["Adventure", "Camping", "Cultural", "All Activities"],
      price: 3000,
      oldPrice: 3500,
      images: [
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030052/bjnk1cypupxj6zuoviuk.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030071/luggiqx7frftm3udinam.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030106/gitvmynpnuqimfkgawyg.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030120/tiadbgewpqsqc4zo6ozd.png",
      ],
      places: [
        {
          id: 1,
          name: "Salalah",
          description:
            "Start in the lush south; visit frankincense land and relax by the beach.",
        },
        {
          id: 2,
          name: "Shisr (Ubar – The Lost City)",
          description: "Mysterious ruins on the edge of the Empty Quarter.",
        },
        {
          id: 3,
          name: "Rub' al Khali Desert",
          description:
            "Remote, endless dunes – ideal for extreme desert camping.",
        },
        {
          id: 4,
          name: "Mudayy Village",
          description: "Hidden desert-mountain settlement with stunning views.",
        },
      ],
      intro: `
        📌 Introduction to the Empty Quarter (Rub' al Khali)
        The Empty Quarter, or Rub' al Khali, is the largest continuous sand desert in the world, spanning across Oman, Saudi Arabia, the UAE, and Yemen. It is known for its massive dunes that reach up to 250 meters high and its deep-rooted history tied to Bedouin tribes and ancient trade routes. As one of the most isolated and mysterious places on Earth, it is a dream destination for adventurers and desert explorers.
  
        🌟 A journey to the Empty Quarter offers an unparalleled adventure through endless sand dunes, where thrill, challenge, and breathtaking desert landscapes create an unforgettable experience for explorers and nature lovers! 🚙🏜✨
      `,
      inclusions: [
        "4x4 transportation with expert drivers for navigating the soft sands.",
        "Thrilling dune bashing experience in one of the toughest terrains on Earth.",
        "Desert camping experience in a fully equipped Bedouin-style camp.",
        "Traditional Bedouin meals (dinner and breakfast) with hot beverages.",
        "Breathtaking sunrise and sunset views over the towering dunes.",
        "Authentic Bedouin cultural experience – learn about desert history and traditions.",
        "Professional tour guide providing insights into the geography, culture, and history of the Empty Quarter.",
      ],
      exclusions: [
        "Flights to and from Oman.",
        "Personal expenses and shopping.",
        "Travel insurance.",
        "Additional activities not mentioned in the itinerary, such as sandboarding or private tours.",
        "Soft drinks and snacks not included in the package.",
      ],
      tourHighlights: [
        "🏜 Off-road desert adventure – Ride across the golden dunes in a challenging and adrenaline-filled experience.",
        "🔥 Desert camping under the stars – Spend the night in a well-equipped Bedouin camp, surrounded by pure silence.",
        "🐪 Meet the local Bedouins – A rare opportunity to connect with the indigenous desert dwellers and experience their traditional way of life.",
        "🌅 Spectacular sunrises and sunsets – Watch the shifting colors of the dunes as the sun rises and sets over the vast desert landscape.",
        "🔭 Stargazing in the clearest night sky – Enjoy one of the best night skies in the world, with an unmatched view of the stars and galaxies.",
        "📸 Incredible photography opportunities – Capture the unique and mesmerizing terrain of the Empty Quarter.",
      ],
      map: "https://www.google.com/maps/d/embed?mid=14qTW1zFuYGfccE7tNcRmf8qbjrpRmjo&ehbc=2E312F",
    },
    {
      id: 3,
      title: "Nizwa to Wahiba through the Highlands",
      status: "finished",
      duration: "6 Days / 5 Nights",
      mainLocations: ["Nizwa", "Wahiba Sands", "Birkat Al Mouz"],
      additionalLocations: ["Ibra", "Jebel Shams", "Jebel Akhdar"],
      activities: ["Historical", "Adventure", "All Activities"],
      price: 2700,
      oldPrice: 3000,
      images: [
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030442/iul4dqnczeyphglrjfic.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030547/f6euolsb9mnlxknitkt5.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030692/zmho5ztkwfvy4it9mth8.webp",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743030712/paum14qhwt9f2nmn0xxp.jpg",
      ],
      places: [
        {
          id: 1,
          name: "Nizwa",
          description: "Explore the famous fort and souq.",
        },
        {
          id: 2,
          name: "Birkat Al Mouz",
          description:
            "A charming village with ancient falaj irrigation system and date plantations.",
        },
        {
          id: 3,
          name: "Ibra",
          description: "A historic town with old houses and women’s souq.",
        },
        {
          id: 4,
          name: "Wahiba Sands",
          description: "End with desert adventure and stargazing.",
        },
      ],
      intro: `
        🌟 The "Nizwa to Wahiba through the Highlands" tour is a once-in-a-lifetime adventure that showcases Oman’s rich history, majestic mountains, and vast deserts in a journey filled with cultural and natural wonders! 🚙🏜✨
      `,
      inclusions: [
        "4x4 transportation through mountains and desert landscapes.",
        "Visit to Nizwa Fort and a tour of the traditional Nizwa Souq.",
        "Exploration of Omani highlands, including stops at Jebel Shams or Jebel Akhdar (depending on the route).",
        "Stopovers in traditional mountain villages to experience authentic rural life.",
        "Dune bashing adventure in Wahiba Sands with experienced drivers.",
        "Overnight stay at a Bedouin-style desert camp with traditional meals.",
        "Camel riding experience during a stunning desert sunset.",
        "Professional tour guide providing insights into Omani history and culture.",
      ],
      exclusions: [
        "Flights to and from Oman.",
        "Personal expenses and shopping.",
        "Travel insurance.",
        "Soft drinks and additional meals not mentioned in the itinerary.",
        "Optional activities such as sandboarding or private excursions.",
      ],
      tourHighlights: [
        "🏰 Nizwa – Explore the famous Nizwa Fort and stroll through the traditional souq.",
        "⛰ Mountain Exploration – Drive through the highlands, stopping at Jebel Shams or Jebel Akhdar for breathtaking views.",
        "🏡 Traditional Mountain Villages – Visit old Omani villages and experience the traditional way of life.",
        "🏜 Desert Crossing to Wahiba Sands – Enjoy an exhilarating dune bashing adventure.",
        "🐪 Authentic Bedouin Experience – Stay in a desert camp, ride camels, and enjoy Omani hospitality.",
        "🌅 Stunning Sunrise & Sunset Views – Watch the dramatic landscape shift as the sun rises and sets over the mountains and desert.",
      ],
      map: "https://www.google.com/maps/d/embed?mid=1ormbApL7zvVhZi1K8J-b7GIdXUubYro&ehbc=2E312F",
    },
    {
      id: 4,
      title: "UAE Desert Trip: Dubai to Liwa Desert Expedition",
      status: "finished",
      duration: "5 Days / 4 Nights",
      mainLocations: ["Dubai", "Liwa Desert", "Al Ain"],
      additionalLocations: [
        "Al Marmoom Desert Conservation Reserve",
        "Moreeb Dune",
      ],
      activities: [
        "Adventure",
        "Camping",
        "Wildlife",
        "Cultural",
        "All Activities",
      ],
      price: 2900,
      oldPrice: 3200,
      images: [
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743031514/jac7djlp1s3csdxraxvl.png",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743031365/yu0pznlj9nipzq0qxtox.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743031403/qew7tp9mdyy8yxbay9vp.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743031412/nhe9xjb2uxtbqtxyqn9u.jpg",
        "https://res.cloudinary.com/dbzn1y8rt/image/upload/v1743031414/ya6id3qkczno4ejlz7rj.jpg",
      ],
      places: [
        {
          id: 1,
          name: "Dubai",
          description:
            "Start with a short city tour, then head out into the desert.",
        },
        {
          id: 2,
          name: "Al Marmoom Desert Conservation Reserve",
          description: "Wildlife spotting and cycling in the dunes.",
        },
        {
          id: 3,
          name: "Al Ain",
          description:
            "Explore the oasis city, camel market, and Jebel Hafeet.",
        },
        {
          id: 4,
          name: "Liwa Oasis",
          description:
            "Ultimate desert experience in massive dunes with overnight camp or luxury desert resort.",
        },
      ],
      intro: `
        🌟 The "Dubai to Liwa Desert Expedition" takes you deep into the heart of the desert, where adventure, excitement, and relaxation blend seamlessly into an unforgettable Bedouin-style experience! 🚙🏜✨
      `,
      inclusions: [
        "4x4 transportation through breathtaking desert landscapes.",
        "Thrilling dune bashing adventure with experienced drivers.",
        "Visit to Moreeb Dune – one of the tallest sand dunes in the world.",
        "Stopover at Liwa Oasis – a stunning green paradise in the middle of the desert.",
        "Overnight camping in the desert – stay in a fully equipped luxury or traditional camp.",
        "Authentic Arabic meals (dinner and breakfast) with hot beverages.",
        "Breathtaking sunset and sunrise views over the golden dunes.",
        "Camel riding experience for an authentic Bedouin-style adventure.",
        "Stargazing session – enjoy one of the clearest night skies in the world.",
        "Professional tour guide providing insights into the desert’s history and Bedouin culture.",
      ],
      exclusions: [
        "Flights to and from Dubai.",
        "Personal expenses and shopping.",
        "Travel insurance.",
        "Soft drinks and additional meals not mentioned in the itinerary.",
        "Optional activities such as sandboarding or private excursions.",
      ],
      tourHighlights: [
        "🏜 Dune Bashing Experience – A thrilling off-road drive across the towering golden dunes.",
        "🏔 Visit Moreeb Dune – One of the world’s highest sand dunes, perfect for adrenaline seekers and photographers.",
        "🌴 Discover Liwa Oasis – A stunning green haven in the middle of the desert.",
        "🔥 Desert Camping Experience – Spend a night in a well-equipped Bedouin camp and enjoy a traditional Arabian feast.",
        "🐪 Camel Riding – A unique way to explore the desert and enjoy a mesmerizing sunset ride.",
        "✨ Stargazing in the Desert – Experience the clearest night sky, filled with countless stars and celestial wonders.",
        "📸 Amazing Photography Opportunities – Capture the dramatic desert landscapes.",
      ],
      map: "https://www.google.com/maps/d/embed?mid=1HNROZh6cmMwMqFicYlPYu1oR0LupaWI&ehbc=2E312F",
    },
  ];

  const items = [
    {
      key: "1",
      label: "Personal",
      children: [{ title: "Travels", icon: <IoAirplane /> }],
    },
    {
      key: "1",
      label: "Settings",
      children: [
        { title: "Profile Settings", icon: <IoMdSettings /> },
        { title: "Languages", icon: <FaEarthAsia /> },
      ],
    },
  ];

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

  return (
    <div className="row g-4">
      {trips.map((trip, index) => {
        return (
          <div className="col-lg-6 col-md-6">
            <TravelCard
              data={trip}
              progress={75}
              status="started"
              type={"profile"}
            />
          </div>
        );
      })}

      {/* <div className="col-lg-6 col-md-6">
        <TravelCard progress={75} status="started" type={"profile"} />
      </div>
      <div className="col-lg-6 col-md-6">
        <TravelCard progress={0} status="noStarted" type={"profile"} />
      </div>
      <div className="col-lg-6 col-md-6">
        <TravelCard progress={100} status="finished" type={"profile"} />
      </div>
      <div className="col-lg-6 col-md-6">
        <TravelCard progress={100} status="finished" type={"profile"} />
      </div> */}
    </div>
  );
};

export default Account;
