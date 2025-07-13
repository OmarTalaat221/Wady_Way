import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "WADI WAY - Tour & Travel Agency NextJs Template",
  description:
    "WADI WAY is a NextJs Template for Tour and Travel Agency purpose",
  icons: {
    icon: "/assets/img/sm-logo.svg",
  },
};

const ActivityCard = ({
  image,
  country,
  countryIcon,
  title,
  description,
  rating,
  participants,
  price,
  duration,
}) => (
  <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 border border-gray-100">
    {/* Image Container */}
    <div className="relative overflow-hidden h-72">
      <img
        src={image}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        alt={title}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Country Badge */}
      <div className="absolute top-6 left-6">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-sm font-semibold hover:bg-white transition-all duration-300 shadow-lg"
          style={{ color: "#295557" }}
        >
          {country}
        </Link>
      </div>

      {/* Rating Badge */}
      <div
        className="absolute top-6 right-6 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        style={{ background: "#e8a355" }}
      >
        ⭐ {rating}
      </div>

      {/* Price Badge */}
      <div
        className="absolute bottom-6 right-6 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg"
        style={{ background: "#295557" }}
      >
        ${price}
      </div>
    </div>

    {/* Content */}
    <div className="px-8 pt-2 pb-4">
      {/* Activity Icon & Title */}
      <div className="flex items-start gap-4 mb-3">
        <div className="flex-1">
          <h3
            className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity duration-300 "
            style={{ color: "#295557" }}
          >
            <Link
              href="/activities/activities-details"
              className="!text-[#295557]"
            >
              {title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Activity Details */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>{participants} people</span>
        </div>
      </div>

      {/* CTA Button - Improved and Smaller */}
      <Link
        href="/activities/activities-details"
        className="group/btn relative inline-flex items-center justify-center w-full text-center text-white font-medium py-3 px-5 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] !bg-[#295557]"
      >
        <span className="relative z-10 flex items-center gap-2">
          Book Adventure
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </span>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left" />

        {/* Subtle glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full animate-pulse" />
      </Link>
    </div>
  </div>
);

const activities = [
  {
    image:
      "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740920653/kelly-sikkema-0SYAZsa1Hgo-unsplash_jrtmnq.jpg",
    country: "Bangladesh",
    countryIcon: "/assets/img/innerpage/bangladesh.png",
    title: "Zip Lining Adventure",
    description:
      "Experience the thrill of soaring through the air on our premium zip line course with breathtaking views.",
    rating: "4.8",
    participants: "2-8",
    price: "149",
    duration: "3 hours",
  },
  {
    image:
      "https://images.pexels.com/photos/914128/pexels-photo-914128.jpeg?cs=srgb&dl=pexels-saikat-ghosh-323099-914128.jpg&fm=jpg",
    country: "Nepal",
    countryIcon: "/assets/img/innerpage/bangladesh.png",
    title: "Mountain Trekking",
    description:
      "Embark on an unforgettable journey through pristine mountain trails with expert guides.",
    rating: "4.9",
    participants: "4-12",
    price: "299",
    duration: "Full day",
  },
  {
    image:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    country: "Thailand",
    countryIcon: "/assets/img/innerpage/bangladesh.png",
    title: "Scuba Diving",
    description:
      "Explore the underwater world with certified instructors in crystal clear tropical waters.",
    rating: "4.7",
    participants: "2-6",
    price: "199",
    duration: "4 hours",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    country: "Iceland",
    countryIcon: "/assets/img/innerpage/bangladesh.png",
    title: "Glacier Hiking",
    description:
      "Walk on ancient ice formations and witness the raw power of nature in this unique adventure.",
    rating: "4.6",
    participants: "3-10",
    price: "249",
    duration: "6 hours",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    country: "Costa Rica",
    countryIcon: "/assets/img/innerpage/bangladesh.png",
    title: "Canopy Tour",
    description:
      "Glide through the rainforest canopy and spot exotic wildlife in their natural habitat.",
    rating: "4.8",
    participants: "2-8",
    price: "179",
    duration: "2.5 hours",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    country: "New Zealand",
    countryIcon: "/assets/img/innerpage/bangladesh.png",
    title: "Bungee Jumping",
    description:
      "Take the ultimate leap of faith from stunning heights with professional safety equipment.",
    rating: "4.9",
    participants: "1-4",
    price: "329",
    duration: "2 hours",
  },
];

const page = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* <Topbar /> */}
      {/* <Header /> */}
      <Breadcrumb pagename="Activities" pagetitle="Activities" />

      {/* Hero Section */}
      <div className="bg-white py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{
                background: `linear-gradient(135deg, #295557 0%, #e8a355 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Epic Adventures Await
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover extraordinary experiences that will create memories to
              last a lifetime. From heart-pounding thrills to serene
              explorations, find your perfect adventure.
            </p>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="bg-white">
        <div className="container mx-auto px-4">
          {/* Filter Buttons - Improved and Smaller */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              "All Activities",
              "Adventure",
              "Water Sports",
              "Mountain",
              "Cultural",
            ].map((filter, index) => (
              <button
                key={filter}
                className={`group/filter relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 overflow-hidden ${
                  index === 0
                    ? "text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
                }`}
                style={
                  index === 0
                    ? {
                        background:
                          "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
                      }
                    : {}
                }
              >
                <span className="relative z-10">{filter}</span>

                {/* Active button hover effects */}
                {index === 0 && (
                  <>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/filter:scale-x-100 transition-transform duration-300 origin-left" />
                    <div className="absolute inset-0 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover/filter:translate-x-full" />
                  </>
                )}

                {/* Inactive button hover effect */}
                {index !== 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <ActivityCard key={index} {...activity} />
            ))}
          </div>

          {/* Load More Button - Improved and Smaller */}
          <div className="text-center mt-16">
            <button
              className="group/load relative inline-flex items-center gap-2 text-white font-medium py-3 px-6 rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Load More Adventures
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover/load:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </span>

              {/* Hover overlay effect */}
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/load:scale-x-100 transition-transform duration-300 origin-left" />

              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover/load:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/load:translate-x-full" />
            </button>
          </div>
        </div>
      </div>

      <Newslatter />
      <Footer />
    </div>
  );
};

export default page;
