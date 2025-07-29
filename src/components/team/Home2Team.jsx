"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Modal } from "antd";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";

const Home2Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Landry Palmer",
      role: "Tour Guide",
      image:
        "https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder2.jpg",
      background:
        "https://travelami.templaza.net/wp-content/uploads/2024/03/damiano-baschiera-hFXZ5cNfkOk-unsplash.jpg",
      short_description:
        "Experienced tour guide with extensive knowledge of historical sites and local cultures.",
      fun_fact: "Can speak 5 different languages fluently!",
      favourite_quote:
        "Travel is the only thing you buy that makes you richer.",
      favourite_travel_memory:
        "Watching the sunrise at Angkor Wat in Cambodia.",
      best_places: ["Paris", "Bali", "New York"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
    {
      id: 2,
      name: "Jackson Mason",
      role: "Tour Guide",
      image:
        "https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder1-500x500.jpg",
      background:
        "https://travelami.templaza.net/wp-content/uploads/2024/03/anthony-delanoix-Q0-fOL2nqZc-unsplash.jpg",
      short_description:
        "Specialized in adventure tourism and outdoor activities with over 10 years of experience.",
      fun_fact: "Has climbed Mount Everest twice!",
      favourite_quote: "Not all who wander are lost.",
      favourite_travel_memory: "Camping under the Northern Lights in Iceland.",
      best_places: ["Tokyo", "Santorini", "Machu Picchu"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
    {
      id: 3,
      name: "Joseph David",
      role: "Tour Guide",
      image:
        "https://travelami.templaza.net/wp-content/uploads/2025/02/Our-Team-1-700x831.jpg",
      background:
        "https://travelami.templaza.net/wp-content/uploads/2024/03/giuseppe-mondi-OIbcmFyMDbo-unsplash.jpg",
      short_description:
        "Cultural expert with deep knowledge of local traditions and hidden gems.",
      fun_fact: "Has visited over 60 countries across all continents.",
      favourite_quote:
        "The world is a book and those who do not travel read only one page.",
      favourite_travel_memory:
        "Dancing with locals at a festival in Rio de Janeiro.",
      best_places: ["Rome", "Kyoto", "Marrakech"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
    {
      id: 4,
      name: "Josiah Caleb",
      role: "Tour Guide",
      image:
        "https://travelami.templaza.net/wp-content/uploads/2025/02/co-founder1-500x500.jpg",
      background:
        "https://travelami.templaza.net/wp-content/uploads/2024/03/giuseppe-mondi-OIbcmFyMDbo-unsplash.jpg",
      short_description:
        "Specializes in eco-tourism and sustainable travel experiences.",
      fun_fact: "Once lived with a remote tribe in the Amazon for a month.",
      favourite_quote: "Take only memories, leave only footprints.",
      favourite_travel_memory: "Snorkeling with manta rays in the Maldives.",
      best_places: ["Costa Rica", "New Zealand", "Norway"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
    {
      id: 5,
      name: "David Luis",
      role: "Tour Guide",
      image: "/assets/img/home2/teams-card-img5.png",
      background: "/assets/img/home2/teams-card-bg.png",
      short_description:
        "Food and culinary tour specialist with a passion for local cuisines.",
      fun_fact: "Trained as a chef before becoming a tour guide.",
      favourite_quote: "Food is the ingredient that binds us together.",
      favourite_travel_memory:
        "Learning to make pasta from an Italian grandmother in Tuscany.",
      best_places: ["Barcelona", "Bangkok", "Istanbul"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
    {
      id: 6,
      name: "Alison Bekkar",
      role: "Tour Guide",
      image: "/assets/img/home2/teams-card-img6.png",
      background: "/assets/img/home2/teams-card-bg.png",
      short_description:
        "History and architecture expert specializing in European destinations.",
      fun_fact: "Has a PhD in Art History from Oxford University.",
      favourite_quote:
        "We travel not to escape life, but for life not to escape us.",
      favourite_travel_memory: "Exploring ancient ruins in Greece at sunrise.",
      best_places: ["Florence", "Prague", "Vienna"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
    {
      id: 7,
      name: "Arthor Morgan",
      role: "Tour Guide",
      image: "/assets/img/home2/teams-card-img7.png",
      background: "/assets/img/home2/teams-card-bg.png",
      short_description:
        "Wildlife and safari specialist with expertise in African destinations.",
      fun_fact: "Former wildlife photographer for National Geographic.",
      favourite_quote: "The greatest adventure is what lies ahead.",
      favourite_travel_memory:
        "Witnessing the Great Migration in the Serengeti.",
      best_places: ["Kenya", "Tanzania", "South Africa"],
      social: {
        instagram: "https://www.instagram.com/",
        pinterest: "https://www.pinterest.com/",
        twitter: "https://twitter.com/",
        facebook: "https://www.facebook.com/",
      },
    },
  ];

  const [memberData, setMemberData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (memberData) {
      const index = teamMembers.findIndex(
        (member) => member.id === memberData.id
      );
      if (index !== -1) setCurrentIndex(index);
    }
  }, [memberData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!memberData) return;

      if (e.key === "ArrowRight" || e.key === "d") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        handlePrev();
      } else if (e.key === "Escape") {
        setMemberData(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [memberData, currentIndex]);

  const handleNext = () => {
    if (!memberData) return;
    const nextIndex = (currentIndex + 1) % teamMembers.length;
    setCurrentIndex(nextIndex);
    setMemberData(teamMembers[nextIndex]);
  };

  const handlePrev = () => {
    if (!memberData) return;
    const prevIndex =
      (currentIndex - 1 + teamMembers.length) % teamMembers.length;
    setCurrentIndex(prevIndex);
    setMemberData(teamMembers[prevIndex]);
  };

  const settings = useMemo(() => {
    return {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 25,
      autoplay: {
        delay: 2500, // Autoplay duration in milliseconds
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".teams-card-next",
        prevEl: ".teams-card-prev",
      },

      breakpoints: {
        280: {
          slidesPerView: 1,
        },
        386: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 15,
        },
        1400: {
          slidesPerView: 4,
        },
      },
    };
  }, []);
  return (
    <>
      <div className="teams-section mb-[60px]">
        <div className="container">
          <div className="row mb-50">
            <div className="col-lg-12">
              <div className="section-title2 text-center">
                <div className="eg-section-tag">
                  <span>Tour Guide</span>
                </div>
                <h2>Our Travel Guide </h2>
              </div>
            </div>
          </div>
          <div className="teams-slider-area">
            <div className="row mb-[60px]">
              <div className="col-lg-12">
                <Swiper
                  modules={[Autoplay, Navigation]}
                  {...settings}
                  className="swiper teams-card-slider"
                >
                  <div className="swiper-wrapper">
                    {teamMembers.map((member, index) => (
                      <SwiperSlide className="swiper-slide" key={member.id}>
                        <div
                          className="teams-card"
                          onClick={() => setMemberData(member)}
                        >
                          <img src={member.background} alt="" />
                          <div className="teams-img">
                            <img src={member.image} alt={member.name} />
                          </div>
                          <div className="teams-content">
                            <h4>{member.name}</h4>
                            <span>{member.role}</span>
                          </div>
                          <ul className="social-list">
                            <li>
                              <a href={member.social.instagram}>
                                <i className="bx bxl-instagram" />
                              </a>
                            </li>
                            <li>
                              <a href={member.social.pinterest}>
                                <i className="bx bxl-pinterest-alt" />
                              </a>
                            </li>
                            <li>
                              <a href={member.social.twitter}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={18}
                                  height={18}
                                  fill="currentColor"
                                  className="bi bi-twitter-x"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
                                </svg>
                              </a>
                            </li>
                            <li>
                              <a href={member.social.facebook}>
                                <i className="bx bxl-facebook" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </SwiperSlide>
                    ))}
                  </div>
                </Swiper>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="slide-and-view-btn-grp style-4">
                  <div className="slider-btn-grp3">
                    <div className="slider-btn teams-card-prev">
                      <i className="bi bi-arrow-left" />
                      <span>PREV</span>
                    </div>
                    <div className="primary-btn3">
                      <Link className="text-white" href="/Team">
                        View All Team Members
                      </Link>
                    </div>
                    <div className="slider-btn teams-card-next">
                      <span>NEXT</span>
                      <i className="bi bi-arrow-right" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={memberData}
        onCancel={() => setMemberData(null)}
        footer={null}
        title={``}
        width={"70%"}
      >
        <div className="flex flex-col md:flex-row gap-6 relative">
          <div className="w-full md:w-1/3">
            <img
              src={memberData?.image}
              alt={memberData?.name}
              className="w-full h-52 md:h-80 object-contain rounded-lg"
            />
          </div>
          <div className="w-full md:w-2/3 space-y-5">
            <div className="border-b-2 border-[#295557] pb-2">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#295557]">
                {memberData?.name}
              </h2>
              <p className="text-amber-700 mb-0 text-sm md:text-base font-medium">
                {memberData?.role}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                Short Description
              </h3>
              <p className="mt-1">{memberData?.short_description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                Fun Fact
              </h3>
              <p className="mt-1">{memberData?.fun_fact}</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                Favourite Quote
              </h3>
              <p className="mt-1 italic">"{memberData?.favourite_quote}"</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                Favourite Travel Memory
              </h3>
              <p className="mt-1">{memberData?.favourite_travel_memory}</p>
            </div>

            <div>
              <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                Best Places
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {memberData?.best_places.map((place, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm border border-[#295557]/20 text-[#295557]"
                  >
                    {place}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="bg-[#295557] text-white p-2 rounded-full hover:bg-[#1e3e3f] transition-colors shadow-md"
              aria-label="Previous team member"
            >
              <FaChevronLeft />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="bg-[#295557] text-white p-2 rounded-full hover:bg-[#1e3e3f] transition-colors shadow-md"
              aria-label="Next team member"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Home2Team;
