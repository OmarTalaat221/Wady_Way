"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActivity,
  removeActivity,
} from "@/lib/redux/slices/tourReservationSlice";
import { GiDuration } from "react-icons/gi";
import { MdNetworkWifi2Bar } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";

const ActivityCard = ({ item, dayIndex }) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");
  const dispatch = useDispatch();

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay
  );
  const dayKey = String(dayIndex + 1);

  // Check if this activity is selected
  const isSelected =
    selectedByDay?.[dayKey]?.activities?.some(
      (a) => a.id === item.id || a.activity_id === item.id
    ) || false;

  const handleToggleActivity = () => {
    if (isSelected) {
      dispatch(
        removeActivity({
          day: dayIndex + 1,
          activityId: item.id,
        })
      );
    } else {
      dispatch(
        selectActivity({
          day: dayIndex + 1,
          activity: {
            id: item.id,
            activity_id: item.id,
            title: item.title,
            name: item.title,
            image: item.image,
            price: item.price_current || item.price || 0,
            price_current: item.price_current || item.price || 0,
            duration: item.duration,
            difficulty: item.difficulty,
          },
        })
      );
    }
  };

  return (
    <div
      className={`card activity-card ${isSelected ? "selected-activity" : ""}`}
      onClick={handleToggleActivity}
      style={{ cursor: "pointer", position: "relative" }}
    >
      <img
        src={item.image || "https://via.placeholder.com/380x207"}
        alt={item.title?.[locale] || item.title?.en}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/380x207";
        }}
      />
      <div className="card-content">
        <h3>{item.title?.[locale] || item.title?.en}</h3>

        {/* {(item.price_current || item.price) && (
          <div className="activity-price mb-2">
            <span className="font-bold text-[#295557]">
              ${item.price_current || item.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              {t("perPerson") || "per person"}
            </span>
          </div>
        )} */}

        <div className="gap-3 mb-3 transfer_feat_cont">
          <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
            <GiDuration />
            <div className="d-flex align-items-start flex-column transfer_cont">
              <div className="fw-bold">{t("duration")}</div>
              <div className="transfer_info">
                {item.duration?.[locale] || item.duration?.en || "N/A"}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
            <MdNetworkWifi2Bar />
            <div className="d-flex align-items-start flex-column transfer_cont">
              <div className="fw-bold">{t("difficulty")}</div>
              <div className="transfer_info">
                {item.difficulty?.[locale] || item.difficulty?.en || "Easy"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
