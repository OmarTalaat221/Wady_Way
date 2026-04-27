"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import {
  refreshUserId,
  initializeTourGuide,
  restoreSavedSelections,
  calculateTotal,
} from "@/lib/redux/slices/tourReservationSlice";
import Breadcrumb from "../../../../../../components/common/Breadcrumb";
import "./style.css";
import { Alert } from "reactstrap";
import RightSummary from ".././_components/right_summary";
import { useTranslations } from "next-intl";
import LeftSummary from "./left_summary";

const PageSummaryClient = ({ lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();
  const params = useParams();
  const packageId = params?.packageId;

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const restoredRef = useRef(false);

  // ─── Redux ────────────────────────────────────────────────────────────────
  const tourData = useSelector((s) => s.tourReservation?.tourData);
  const selectedByDay = useSelector((s) => s.tourReservation?.selectedByDay);
  const tourGuideByDay = useSelector((s) => s.tourReservation?.tourGuideByDay);
  const numAdults = useSelector((s) => s.tourReservation?.numAdults || 1);
  const numChildren = useSelector((s) => s.tourReservation?.numChildren || 0);
  const numInfants = useSelector((s) => s.tourReservation?.numInfants || 0);
  const startDate = useSelector((s) => s.tourReservation?.startDate);
  const endDate = useSelector((s) => s.tourReservation?.endDate);
  const tourId = useSelector((s) => s.tourReservation?.tourId);

  // ─── Step 1: Restore ──────────────────────────────────────────────────────
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    dispatch(refreshUserId());

    const targetId = tourId || packageId;
    if (targetId) {
      dispatch(restoreSavedSelections(targetId));
    }

    setTimeout(() => setLoading(false), 250);
  }, [dispatch, tourId, packageId]);

  // ─── Step 2: Init tour guides if missing ──────────────────────────────────
  useEffect(() => {
    if (!tourData?.itinerary?.length) return;
    if (Object.keys(tourGuideByDay || {}).length > 0) return;
    dispatch(initializeTourGuide(tourData.itinerary));
  }, [tourData, tourGuideByDay, dispatch]);

  // ─── Step 3: Recalculate total ────────────────────────────────────────────
  useEffect(() => {
    if (!tourData) return;
    dispatch(calculateTotal());
  }, [tourData, dispatch]);

  // ─── Step 4: Build days list ──────────────────────────────────────────────
  useEffect(() => {
    if (!tourData) return;

    const itineraryData = tourData.itinerary || tourData.days || [];

    const transformedDays = itineraryData.map((itineraryDay, idx) => {
      const dayNumber = itineraryDay.day || idx + 1;
      const dayKey = String(dayNumber);
      const selections = selectedByDay?.[dayKey] || {};

      // ── Hotel ──────────────────────────────────────────────────────────────
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

      // ── Cars ───────────────────────────────────────────────────────────────
      const carsData =
        Array.isArray(selections.cars) && selections.cars.length > 0
          ? selections.cars
          : selections.car
            ? [selections.car]
            : [];

      const transfers = carsData.map((carData) => ({
        id: carData.id || carData.car_id,
        image: carData.image?.split("//CAMP//")[0] || carData.image,
        name: {
          en: carData.title || carData.name?.en || "Car Transfer",
          ar: carData.title || carData.name?.ar || "نقل بالسيارة",
        },
        category: carData.category || { en: "Private Transfer", ar: "نقل خاص" },
        rating: 4.5,
        capacity: carData.capacity || carData.max_people || "4",
        price: carData.price_current || carData.price || 0,
        withDriver: !!carData.withDriver,
        instanceId: carData.instanceId,
      }));

      // ── Activities ─────────────────────────────────────────────────────────
      const activitiesData = selections.activities || [];
      const activities = activitiesData.map((activity) => ({
        id: activity.id || activity.activity_id,
        title: activity.title || activity.name?.en || "Activity",
        image: activity.image?.split("//CAMP//")[0] || activity.image,
        price: activity.price_current || activity.price || 0,
      }));

      // ── Date label ─────────────────────────────────────────────────────────
      const dateLabel =
        itineraryDay.date || itineraryDay.location?.en || `Day ${dayNumber}`;

      return {
        day: dayNumber,
        description: {
          en: itineraryDay.description || `Day ${dayNumber}`,
          ar: itineraryDay.description || `اليوم ${dayNumber}`,
        },
        title: itineraryDay.title || itineraryDay.location?.en || "",
        location: itineraryDay.title || itineraryDay.location?.en || "Location",
        date: dateLabel,
        accommodation: accommodations,
        transfers,
        activities,
      };
    });

    setDays(transformedDays);
  }, [tourData, selectedByDay]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-4 rounded-full animate-spin"
            style={{ borderColor: "#295557", borderTopColor: "transparent" }}
          />
          <p className="mt-3 text-gray-500">Loading your booking...</p>
        </div>
      </div>
    );
  }

  // ─── No data guard ────────────────────────────────────────────────────────
  if (!tourData) {
    return (
      <>
        <Breadcrumb pagename="Package Summary" pagetitle="Package Summary" />
        <div className="container py-10">
          <Alert color="warning">
            No package data found. Please{" "}
            <a
              href={packageId ? `/package/package-details/${packageId}` : "/"}
              className="font-semibold underline"
              style={{ color: "#295557" }}
            >
              go back and select a package
            </a>
            .
          </Alert>
        </div>
      </>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Breadcrumb pagename="Package Summary" pagetitle="Package Summary" />

      <div className="container">
        <div className="mb-24 pt-10">
          <div className="summary-header mt-6 mb-4">
            <h2 className="text-2xl font-bold">{t("bookings")}</h2>
            <div className="summary-info flex flex-wrap gap-4 mt-2 text-gray-600">
              <span>
                {numAdults} Adults
                {numChildren > 0 && `, ${numChildren} Children`}
                {numInfants > 0 && `, ${numInfants} Infants`}
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
