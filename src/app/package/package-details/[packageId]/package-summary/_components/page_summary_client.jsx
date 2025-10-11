"use client";
import React, { useState } from "react";
import Breadcrumb from "../../../../../../components/common/Breadcrumb";
import "./style.css";

import { Collapse } from "antd";
import { Alert } from "reactstrap";
import RightSummary from ".././_components/right_summary";
import { useTranslations } from "next-intl";

import LeftSummary from "./left_summary";

const PageSummaryClient = ({ lang }) => {
  const t = useTranslations("packageSummary");

  const [days, setDays] = useState([
    {
      day: 1,
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

  return (
    <>
      <Breadcrumb pagename="Package Summary" pagetitle="Package Summary" />

      <div className="container">
        <div className="mb-24 pt-10">
          <Alert
            color="warning"
            className="bg-amber-50 border-amber-300 rounded-lg"
          >
            <div className="text-amber-800 font-medium">{t("warning")}</div>
          </Alert>

          <h2 className="text-2xl font-bold mt-6 mb-4">{t("bookings")}</h2>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9">
              <LeftSummary days={days} setDays={setDays} lang={lang} />
            </div>
            <div className="xl:col-span-3">
              <RightSummary lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageSummaryClient;
