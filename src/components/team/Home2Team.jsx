"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Modal, Spin } from "antd";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";

const Home2Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/team/select_team.php`);

        if (response?.data.status === "success") {
          const transformedData = response?.data.message
            .filter((member) => member.hidden === "0")
            .map((member) => ({
              id: parseInt(member.id),
              name: member.name,
              role: member.role,
              image: member.image,
              background:
                "https://travelami.templaza.net/wp-content/uploads/2024/03/damiano-baschiera-hFXZ5cNfkOk-unsplash.jpg", // Default background
              short_description: member.description,
              fun_fact: member.funFact,
              favourite_quote: member.favoriteQuote,
              favourite_travel_memory: member.favoriteMemory,
              best_places: member.bestPlaces
                ? member.bestPlaces.split(",").map((p) => p.trim())
                : [],
              is_top: member.is_top === "1",
              social: {
                instagram: member.ig_link || "https://www.instagram.com/",
                facebook: member.facebook_link || "https://www.facebook.com/",
                pinterest: "https://www.pinterest.com/",
                twitter: "https://twitter.com/",
              },
            }));

          setTeamMembers(transformedData);
        } else {
          setError("Failed to fetch team members");
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError("Error fetching team members");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (memberData && teamMembers.length > 0) {
      const index = teamMembers.findIndex(
        (member) => member.id === memberData.id
      );
      if (index !== -1) setCurrentIndex(index);
    }
  }, [memberData, teamMembers]);

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
  }, [memberData, currentIndex, teamMembers]);

  const handleNext = () => {
    if (!memberData || teamMembers.length === 0) return;
    const nextIndex = (currentIndex + 1) % teamMembers.length;
    setCurrentIndex(nextIndex);
    setMemberData(teamMembers[nextIndex]);
  };

  const handlePrev = () => {
    if (!memberData || teamMembers.length === 0) return;
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
        delay: 2500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".teams-card-next",
        prevEl: ".teams-card-prev",
      },
      breakpoints: {
        280: { slidesPerView: 1 },
        386: { slidesPerView: 1 },
        576: { slidesPerView: 2, spaceBetween: 15 },
        768: { slidesPerView: 2, spaceBetween: 15 },
        992: { slidesPerView: 3, spaceBetween: 15 },
        1200: { slidesPerView: 4, spaceBetween: 15 },
        1400: { slidesPerView: 4 },
      },
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="teams-section mb-[60px]">
        <div className="container">
          <div className="row mb-50">
            <div className="col-lg-12">
              <div className="section-title2 text-center">
                <div className="eg-section-tag">
                  <span>Tour Guide</span>
                </div>
                <h2>Our Travel Guide</h2>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="teams-section mb-[60px]">
        <div className="container">
          <div className="row mb-50">
            <div className="col-lg-12">
              <div className="section-title2 text-center">
                <div className="eg-section-tag">
                  <span>Tour Guide</span>
                </div>
                <h2>Our Travel Guide</h2>
              </div>
            </div>
          </div>
          <div className="text-center text-red-500 py-10">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#295557] text-white rounded hover:bg-[#1e3e3f]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (teamMembers.length === 0) {
    return (
      <div className="teams-section mb-[60px]">
        <div className="container">
          <div className="row mb-50">
            <div className="col-lg-12">
              <div className="section-title2 text-center">
                <div className="eg-section-tag">
                  <span>Tour Guide</span>
                </div>
                <h2>Our Travel Guide</h2>
              </div>
            </div>
          </div>
          <div className="text-center py-10">
            <p>No team members available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

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
                <h2>Our Travel Guide</h2>
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
                    {teamMembers.map((member) => (
                      <SwiperSlide className="swiper-slide" key={member.id}>
                        <div
                          className="teams-card cursor-pointer"
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
                              <a
                                href={member.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="bx bxl-instagram" />
                              </a>
                            </li>
                            <li>
                              <a
                                href={member.social.pinterest}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="bx bxl-pinterest-alt" />
                              </a>
                            </li>
                            <li>
                              <a
                                href={member.social.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
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
                              <a
                                href={member.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
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
        open={!!memberData}
        onCancel={() => setMemberData(null)}
        footer={null}
        title={null}
        width={"70%"}
        centered
      >
        {memberData && (
          <div className="flex flex-col md:flex-row gap-6 relative">
            <div className="w-full md:w-1/3">
              <img
                src={memberData.image}
                alt={memberData.name}
                className="w-full h-52 md:h-80 object-contain rounded-lg"
              />
            </div>
            <div className="w-full md:w-2/3 space-y-5">
              <div className="border-b-2 border-[#295557] pb-2">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#295557]">
                  {memberData.name}
                </h2>
                <p className="text-amber-700 mb-0 text-sm md:text-base font-medium">
                  {memberData.role}
                </p>
              </div>

              {memberData.short_description && (
                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Short Description
                  </h3>
                  <p className="mt-1">{memberData.short_description}</p>
                </div>
              )}

              {memberData.fun_fact && (
                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Fun Fact
                  </h3>
                  <p className="mt-1">{memberData.fun_fact}</p>
                </div>
              )}

              {memberData.favourite_quote && (
                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Favourite Quote
                  </h3>
                  <p className="mt-1 italic">"{memberData.favourite_quote}"</p>
                </div>
              )}

              {memberData.favourite_travel_memory && (
                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Favourite Travel Memory
                  </h3>
                  <p className="mt-1">{memberData.favourite_travel_memory}</p>
                </div>
              )}

              {memberData.best_places && memberData.best_places.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Best Places
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {memberData.best_places.map((place, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm border border-[#295557]/20 text-[#295557]"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-[#295557] text-white p-2 rounded-full hover:bg-[#1e3e3f] transition-colors shadow-md z-10"
              aria-label="Previous team member"
            >
              <FaChevronLeft />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-[#295557] text-white p-2 rounded-full hover:bg-[#1e3e3f] transition-colors shadow-md z-10"
              aria-label="Next team member"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Home2Team;
