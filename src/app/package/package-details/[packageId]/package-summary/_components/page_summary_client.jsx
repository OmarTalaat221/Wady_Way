"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { refreshUserId } from "@/lib/redux/slices/tourReservationSlice";
import Breadcrumb from "../../../../../../components/common/Breadcrumb";
import "./style.css";
import { Alert } from "reactstrap";
import RightSummary from ".././_components/right_summary";
import { useTranslations } from "next-intl";
import LeftSummary from "./left_summary";

const PageSummaryClient = ({ lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get Redux data
  const tourData = useSelector((state) => state.tourReservation?.tourData);
  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay
  );
  const numAdults = useSelector(
    (state) => state.tourReservation?.numAdults || 1
  );
  const numChildren = useSelector(
    (state) => state.tourReservation?.numChildren || 0
  );
  const numInfants = useSelector(
    (state) => state.tourReservation?.numInfants || 0
  );
  const startDate = useSelector((state) => state.tourReservation?.startDate);
  const endDate = useSelector((state) => state.tourReservation?.endDate);
  const totalAmount = useSelector(
    (state) => state.tourReservation?.totalAmount
  );
  const userId = useSelector((state) => state.tourReservation?.userId);

  // Refresh user ID from localStorage on mount
  useEffect(() => {
    dispatch(refreshUserId());
  }, [dispatch]);

  useEffect(() => {
    console.log("Redux State Debug:");
    console.log("Tour Data:", tourData);
    console.log("Selected By Day:", selectedByDay);
    console.log("User ID:", userId);
  }, [tourData, selectedByDay, userId]);

  useEffect(() => {
    if (tourData?.itinerary || tourData?.days) {
      const itineraryData = tourData.itinerary || tourData.days;

      const transformedDays = itineraryData.map((itineraryDay, idx) => {
        const dayNumber = itineraryDay.day || idx + 1;
        const dayKey = String(dayNumber);
        const selections = selectedByDay?.[dayKey] || {};

        console.log(`Day ${dayKey} selections:`, selections);

        // Get hotel data from Redux
        const hotelData = selections.hotel;
        const accommodations = hotelData
          ? [
              {
                id: hotelData.id || hotelData.hotel_id,
                image: hotelData.image?.split("//CAMP//")[0] || hotelData.image,
                name:
                  hotelData.title ||
                  hotelData.name?.en ||
                  hotelData.name ||
                  "Hotel",
                category: hotelData.category || { en: "Hotel", ar: "فندق" },
                location: hotelData.location || {
                  en: "City center",
                  ar: "مركز المدينة",
                },
                rating: hotelData.rating || 4.5,
                price: hotelData.adult_price || hotelData.price_per_night || 0,
              },
            ]
          : [];

        // Get car/transfer data from Redux
        const carData = selections.car;
        const transfers = carData
          ? [
              {
                id: carData.id || carData.car_id,
                image: carData.image?.split("//CAMP//")[0] || carData.image,
                name: {
                  en: carData.title || carData.name?.en || "Car Transfer",
                  ar: carData.title || carData.name?.ar || "نقل بالسيارة",
                },
                category: carData.category || {
                  en: "Private Transfer",
                  ar: "نقل خاص",
                },
                rating: 4.5,
                capacity: carData.capacity || "4",
                price: carData.price_current || carData.price || 0,
              },
            ]
          : [];

        // Get activities data from Redux
        const activitiesData = selections.activities || [];
        const activities = activitiesData.map((activity) => ({
          id: activity.id || activity.activity_id,
          title: activity.title || activity.name?.en || "Activity",
          image: activity.image?.split("//CAMP//")[0] || activity.image,
          price: activity.price_current || activity.price || 0,
        }));

        return {
          day: dayNumber,
          description: {
            en: itineraryDay.description || `Day ${dayNumber}`,
            ar: itineraryDay.description || `اليوم ${dayNumber}`,
          },
          title: itineraryDay.title || itineraryDay.location?.en || "",
          tour_guide: selections.tour_guide || false,
          driver: true,
          location:
            itineraryDay.title || itineraryDay.location?.en || "Location",
          date: itineraryDay.date || `Day ${dayNumber}`,
          accommodation: accommodations,
          transfers: transfers,
          activities: activities,
        };
      });

      setDays(transformedDays);
    }
    setLoading(false);
  }, [tourData, selectedByDay]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <>
        <Breadcrumb pagename="Package Summary" pagetitle="Package Summary" />
        <div className="container py-10">
          <Alert color="warning">
            No package data found. Please go back and select a package.
          </Alert>
        </div>
      </>
    );
  }

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

          {/* Summary Header with User Info */}
          <div className="summary-header mt-6 mb-4">
            <h2 className="text-2xl font-bold">{t("bookings")}</h2>
            <div className="summary-info flex flex-wrap gap-4 mt-2 text-gray-600">
              <span>
                {numAdults} Adults, {numChildren} Children, {numInfants} Infants
              </span>
              {startDate && endDate && (
                <span>
                  {startDate} - {endDate}
                </span>
              )}
            </div>
          </div>

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
