"use client";
import React, { useState, useEffect } from "react";
import { TiSocialLinkedin } from "react-icons/ti";
import { FaXTwitter, FaInstagram, FaFacebook } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Modal, Spin, message } from "antd";
import Footer from "@/components/footer/Footer";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useLocale, useTranslations } from "next-intl";
import axios from "axios";
import { base_url } from "../../uitils/base_url";

const page = () => {
  const locale = useLocale();
  const t = useTranslations("team");
  const [OurTeamMembers, setOurTeamMembers] = useState([]);
  const [MemberData, setMemberData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseBestPlaces = (bestPlacesString) => {
    if (!bestPlacesString) return [];

    try {
      return JSON.parse(bestPlacesString);
    } catch (error) {
      return bestPlacesString
        .split(",")
        .map((place) => place.trim())
        .filter((place) => place.length > 0);
    }
  };

  // Fetch team members from API
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${base_url}/user/team/select_team.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        const transformedMembers = response.data.message
          .filter((member) => member.hidden === "0")
          .map((member) => ({
            id: parseInt(member.id),
            name: member.name,
            role: member.role,
            image: member.image,
            short_description: member.description,
            fun_fact: member.funFact,
            favourite_quote: member.favoriteQuote,
            favourite_travel_memory: member.favoriteMemory,
            best_places: parseBestPlaces(member.bestPlaces),
            is_top: member.is_top === "1",
            social: {
              instagram: member.ig_link,
              facebook: member.facebook_link,
            },
          }));

        // Sort to show top members first
        const sortedMembers = transformedMembers.sort((a, b) => {
          if (a.is_top && !b.is_top) return -1;
          if (!a.is_top && b.is_top) return 1;
          return 0;
        });

        setOurTeamMembers(sortedMembers);
        setError(null);
      } else {
        setError("Failed to fetch team members");
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setError("Failed to load team members. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Load team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (MemberData) {
      const index = OurTeamMembers.findIndex(
        (member) => member.id === MemberData.id
      );
      if (index !== -1) setCurrentIndex(index);
    }
  }, [MemberData, OurTeamMembers]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!MemberData) return;

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
  }, [MemberData, currentIndex]);

  const handleNext = () => {
    if (!MemberData || OurTeamMembers.length === 0) return;
    const nextIndex = (currentIndex + 1) % OurTeamMembers.length;
    setCurrentIndex(nextIndex);
    setMemberData(OurTeamMembers[nextIndex]);
  };

  const handlePrev = () => {
    if (!MemberData || OurTeamMembers.length === 0) return;
    const prevIndex =
      (currentIndex - 1 + OurTeamMembers.length) % OurTeamMembers.length;
    setCurrentIndex(prevIndex);
    setMemberData(OurTeamMembers[prevIndex]);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb pagename="Team" pagetitle="Team" />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Loading team members...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Breadcrumb pagename="Team" pagetitle="Team" />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchTeamMembers}
                className="bg-[#295557] text-white px-6 py-2 rounded-lg hover:bg-[#1e3e3f] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Breadcrumb pagename="Team" pagetitle="Team" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-2 text-[#295557]">
          {t("title")}
        </h1>
        <p className="text-center text-gray-600 mb-10">{t("description")}</p>

        {OurTeamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {OurTeamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 relative"
                onClick={() => setMemberData(member)}
              >
                {member.is_top && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      ⭐ Top Member
                    </span>
                  </div>
                )}
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-team.png";
                    }}
                  />
                </div>
                <div className="p-4 text-center">
                  <div className="font-bold text-lg text-[#295557]">
                    {member.name}
                  </div>
                  <p className="text-[12px] text-gray-600">{member.role}</p>
                  <div className="mt-3 flex justify-center gap-x-4">
                    {member.social.instagram &&
                      member.social.instagram !==
                        "https://www.instagram.com/" && (
                        <a
                          href={member.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white p-2 rounded-full border border-gray-300 text-[#295557] hover:!border-[#295557] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaInstagram className="text-xl" />
                        </a>
                      )}
                    {member.social.facebook &&
                      member.social.facebook !==
                        "https://www.facebook.com/" && (
                        <a
                          href={member.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white p-2 rounded-full border border-gray-300 text-[#295557] hover:!border-[#295557] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaFacebook className="text-xl" />
                        </a>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Team Members Found
            </h3>
            <p className="text-gray-500">
              Our team page is currently being updated. Please check back soon!
            </p>
          </div>
        )}

        <Modal
          open={!!MemberData}
          onCancel={() => setMemberData(null)}
          footer={null}
          title=""
          width="70%"
          centered
        >
          {MemberData && (
            <div className="flex flex-col md:flex-row gap-6 relative">
              <div className="w-full md:w-1/3">
                <img
                  src={MemberData.image}
                  alt={MemberData.name}
                  className="w-full h-52 md:h-80 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "/placeholder-team.png";
                  }}
                />
              </div>
              <div className="w-full md:w-2/3 space-y-5">
                <div className="border-b-2 border-[#295557] pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#295557]">
                      {MemberData.name}
                    </h2>
                    {MemberData.is_top && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ⭐ Top
                      </span>
                    )}
                  </div>
                  <p className="text-amber-700 mb-0 text-sm md:text-base font-medium">
                    {MemberData.role}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    About
                  </h3>
                  <p className="mt-1">{MemberData.short_description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Fun Fact
                  </h3>
                  <p className="mt-1">{MemberData.fun_fact}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Favourite Quote
                  </h3>
                  <p className="mt-1 italic">"{MemberData.favourite_quote}"</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Favourite Travel Memory
                  </h3>
                  <p className="mt-1">{MemberData.favourite_travel_memory}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                    Best Places
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MemberData.best_places.map((place, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm border border-[#295557]/20 text-[#295557]"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                {((MemberData.social.instagram &&
                  MemberData.social.instagram !==
                    "https://www.instagram.com/") ||
                  (MemberData.social.facebook &&
                    MemberData.social.facebook !==
                      "https://www.facebook.com/")) && (
                  <div>
                    <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                      Social Links
                    </h3>
                    <div className="flex gap-3 mt-2">
                      {MemberData.social.instagram &&
                        MemberData.social.instagram !==
                          "https://www.instagram.com/" && (
                          <a
                            href={MemberData.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2 rounded-full border border-gray-300 text-[#295557] hover:!border-[#295557] transition-colors"
                          >
                            <FaInstagram className="text-xl" />
                          </a>
                        )}
                      {MemberData.social.facebook &&
                        MemberData.social.facebook !==
                          "https://www.facebook.com/" && (
                          <a
                            href={MemberData.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2 rounded-full border border-gray-300 text-[#295557] hover:!border-[#295557] transition-colors"
                          >
                            <FaFacebook className="text-xl" />
                          </a>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              {OurTeamMembers.length > 1 && (
                <>
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
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default page;
