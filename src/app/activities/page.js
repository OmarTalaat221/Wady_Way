"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { base_url } from "../../uitils/base_url";
import axios from "axios";

const ActivityCard = ({ activity }) => {
  const {
    id,
    title,
    subtitle,
    image,
    duration,
    price_current,
    price_currency,
    price_note,
    activity_type,
    country_name,
    ratings,
    features,
  } = activity;

  // Calculate average rating
  const averageRating =
    ratings && ratings.length > 0
      ? (
          ratings.reduce((sum, rating) => sum + rating.score, 0) /
          ratings.length
        ).toFixed(1)
      : "4.5";

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 border border-gray-100">
      {/* Image Container */}
      <div className="relative overflow-hidden h-72">
        <img
          src={image}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={title}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x300/295557/ffffff?text=Activity+Image";
          }}
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
            {country_name}
          </Link>
        </div>

        {/* Rating Badge */}
        <div
          className="absolute top-6 right-6 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          style={{ background: "#e8a355" }}
        >
          ⭐{" "}
          {averageRating >= 5
            ? 5?.toFixed(1)
            : averageRating <= 0
            ? 0?.toFixed(1)
            : averageRating}
        </div>

        {/* Price Badge */}
        <div
          className="absolute bottom-6 right-6 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg"
          style={{ background: "#295557" }}
        >
          {price_currency}
          {price_current}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pt-2 pb-4">
        {/* Activity Icon & Title */}
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-1">
            <h3
              className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity duration-300"
              style={{ color: "#295557" }}
            >
              <Link
                href={`/activities/activities-details?id=${id}`}
                className="!text-[#295557]"
              >
                {title}
              </Link>
            </h3>
            {subtitle && (
              <p className="text-gray-600 text-sm mb-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Activity Details */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {activity_type}
            </span>
          </div>
        </div>

        {/* Features */}
        {/* {features && features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )} */}

        {/* Price Note */}
        {price_current && (
          <div className="mb-4 text-xs text-gray-500 text-center">
            {price_current} {price_currency} {price_note}
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={`/activities/activities-details?id=${id}`}
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
};

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All Activities");
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter options based on activity types
  const filterOptions = [
    "All Activities",
    "Adventure",
    "Water Sports",
    "Mountain",
    "Cultural",
    "Scuba Diving",
  ];

  // Fetch activities data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${base_url}/user/activities/select_activities.php`
        );

        if (response.data.status == "success") {
          setActivities(response.data.message);
          setFilteredActivities(response.data.message);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities based on selected filter
  useEffect(() => {
    if (activeFilter === "All Activities") {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter((activity) => {
        const activityType = activity.activity_type?.toLowerCase() || "";
        const category = activity.category?.toLowerCase() || "";
        const title = activity.title?.toLowerCase() || "";

        const filterLower = activeFilter.toLowerCase();

        return (
          activityType.includes(filterLower) ||
          category.includes(filterLower) ||
          title.includes(filterLower) ||
          (filterLower === "adventure" &&
            (activityType.includes("adventure") ||
              title.includes("adventure"))) ||
          (filterLower === "water sports" &&
            (activityType.includes("diving") ||
              activityType.includes("water") ||
              title.includes("diving"))) ||
          (filterLower === "mountain" &&
            (title.includes("mountain") ||
              title.includes("trek") ||
              title.includes("hiking"))) ||
          (filterLower === "cultural" &&
            (activityType.includes("cultural") ||
              category.includes("cultural")))
        );
      });
      setFilteredActivities(filtered);
    }
    // Reset visible count when filter changes
    setVisibleCount(6);
  }, [activeFilter, activities]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const loadMoreActivities = () => {
    setVisibleCount((prev) => prev + 6);
  };

  // Get visible activities based on current count
  const visibleActivities = filteredActivities.slice(0, visibleCount);
  const hasMoreActivities = visibleCount < filteredActivities.length;

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Breadcrumb pagename="Activities" pagetitle="Activities" />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col gap-2 justify-center items-center h-64">
            <div
              style={{
                borderBottom: "2px solid #295557",
              }}
              className="animate-spin  rounded-full h-12 w-12  "
            ></div>
            Loading Activities
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <Breadcrumb pagename="Activities" pagetitle="Activities" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">
              Error loading activities
            </div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#295557] text-white rounded-lg hover:bg-[#1f4042] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
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
              Epic Adventures
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover extraordinary experiences that will create memories to
              last a lifetime. From heart-pounding thrills to serene
              explorations, find your perfect adventure.
            </p>
            {/* <div className="mt-4 text-sm text-gray-500">
              {filteredActivities.length}{" "}
              {filteredActivities.length === 1 ? "activity" : "activities"}{" "}
              found
            </div> */}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="bg-white pb-8">
        <div className="container mx-auto px-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {filterOptions.map((filter, index) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`group/filter relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 overflow-hidden ${
                  activeFilter === filter
                    ? "text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-300 transform hover:scale-105 active:scale-95"
                }`}
                style={
                  activeFilter === filter
                    ? {
                        background:
                          "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
                      }
                    : {}
                }
              >
                <span className="relative z-10">{filter}</span>

                {/* Active button hover effects */}
                {activeFilter === filter && (
                  <>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/filter:scale-x-100 transition-transform duration-300 origin-left" />
                    <div className="absolute inset-0 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 -translate-x-full group-hover/filter:translate-x-full" />
                  </>
                )}

                {/* Inactive button hover effect */}
                {activeFilter !== filter && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover/filter:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Activities Grid */}
          {visibleActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 text-xl mb-4">
                No activities found
              </div>
              <p className="text-gray-400">
                Try selecting a different filter or check back later for new
                activities.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {hasMoreActivities && (
            <div className="text-center mt-16">
              <button
                onClick={loadMoreActivities}
                className="group/load relative inline-flex items-center gap-2 text-white font-medium py-3 px-6 rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #295557 0%, #e8a355 100%)",
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
          )}
        </div>
      </div>

      <Newslatter />
      <Footer />
    </div>
  );
};

export default ActivitiesPage;
