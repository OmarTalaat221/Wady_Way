"use client";
import React, { useState } from "react";
import { TiSocialLinkedin } from "react-icons/ti";
import { FaXTwitter } from "react-icons/fa6";
import { Modal } from "antd";
import Footer from "@/components/footer/Footer";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useLocale, useTranslations } from "next-intl";

const page = () => {
  const locale = useLocale();
  const t = useTranslations("team");
  const OurTeamMembers = [
    {
      id: 1,
      name: "John Smith",
      role: "Tour Guide",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      short_description:
        "Experienced tour guide with extensive knowledge of historical sites and local cultures.",
      fun_fact: "Can speak 7 different languages fluently!",
      favourite_quote:
        "The world is a book and those who do not travel read only one page.",
      favourite_travel_memory:
        "Watching the northern lights in Iceland while camping under the stars.",
      best_places: ["Rome", "Kyoto", "Marrakech"],
      social: {
        linkedin: "https://linkedin.com/in/johnsmith",
        twitter: "https://twitter.com/johnsmith",
      },
    },
    {
      id: 2,
      name: "Emma Wilson",
      role: "Travel Consultant",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      short_description:
        "Expert in crafting personalized travel experiences for all types of adventurers.",
      fun_fact: "Has visited over 50 countries across 6 continents.",
      favourite_quote: "Travel far, travel wide, travel deep.",
      favourite_travel_memory: "Dancing at the Rio Carnival in Brazil.",
      best_places: ["Bali", "New York", "Cape Town"],
      social: {
        linkedin: "https://linkedin.com/in/emmawilson",
        twitter: "https://twitter.com/emmawilson",
      },
    },
    {
      id: 3,
      name: "David Chen",
      role: "Adventure Specialist",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      short_description:
        "Specializes in creating thrilling outdoor experiences for adrenaline seekers.",
      fun_fact: "Once climbed Mount Kilimanjaro in record time.",
      favourite_quote: "Life begins at the end of your comfort zone.",
      favourite_travel_memory:
        "Scuba diving with whale sharks in the Philippines.",
      best_places: ["Patagonia", "Nepal", "Costa Rica"],
      social: {
        linkedin: "https://linkedin.com/in/davidchen",
        twitter: "https://twitter.com/davidchen",
      },
    },
    {
      id: 4,
      name: "Sofia Rodriguez",
      role: "Cultural Guide",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
      short_description:
        "Passionate about sharing cultural insights and hidden gems with travelers.",
      fun_fact: "Can cook authentic dishes from 15 different countries.",
      favourite_quote:
        "We travel not to escape life, but for life not to escape us.",
      favourite_travel_memory: "Attending a traditional tea ceremony in Kyoto.",
      best_places: ["Mexico City", "Istanbul", "Barcelona"],
      social: {
        linkedin: "https://linkedin.com/in/sofiarodriguez",
        twitter: "https://twitter.com/sofiarodriguez",
      },
    },
  ];

  const [MemberData, setMemberData] = useState(null);

  return (
    <>
      <Breadcrumb pagename="Team" pagetitle="Team" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-2 text-[#295557]">
          {t("title")}
        </h1>
        <p className="text-center text-gray-600 mb-10">{t("description")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {OurTeamMembers.length > 0 ? (
            OurTeamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
                onClick={() => setMemberData(member)}
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <div className="font-bold text-lg text-[#295557]">
                    {member.name}
                  </div>
                  <p className="text-[12px] text-gray-600">{member.role}</p>
                  <div className="mt-3 flex justify-center gap-x-4">
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-2 rounded-full border border-gray-300 text-[#295557] hover:!border-[#295557] transition-colors"
                    >
                      <TiSocialLinkedin className="text-xl" />
                    </a>
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-2 rounded-full border border-gray-300 text-[#295557] hover:!border-[#295557] transition-colors"
                    >
                      <FaXTwitter className="text-xl" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full">No team members yet</p>
          )}
        </div>

        <Modal
          open={MemberData}
          onCancel={() => setMemberData(null)}
          footer={null}
          title={``}
          width={"70%"}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <img
                src={MemberData?.image}
                alt={MemberData?.name}
                className="w-full h-52 md:h-80 object-contain rounded-lg"
              />
            </div>
            <div className="w-full md:w-2/3 space-y-5">
              <div className="border-b-2 border-[#295557] pb-2">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#295557]">
                  {MemberData?.name}
                </h2>
                <p className="text-amber-700 mb-0 text-sm md:text-base font-medium">
                  {MemberData?.role}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                  Short Description
                </h3>
                <p className="mt-1">{MemberData?.short_description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                  Fun Fact
                </h3>
                <p className="mt-1">{MemberData?.fun_fact}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                  Favourite Quote
                </h3>
                <p className="mt-1 italic">"{MemberData?.favourite_quote}"</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                  Favourite Travel Memory
                </h3>
                <p className="mt-1">{MemberData?.favourite_travel_memory}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#295557] uppercase text-sm tracking-wider">
                  Best Places
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {MemberData?.best_places.map((place, index) => (
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
          </div>
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default page;
