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
import { FiCheck, FiPlus } from "react-icons/fi";

// ✅ prop جديد: allowDeselect (default: false)
const ActivityCard = ({ item, dayIndex, allowDeselect = false }) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");
  const dispatch = useDispatch();

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay
  );
  const dayKey = String(dayIndex + 1);

  const isSelected =
    selectedByDay?.[dayKey]?.activities?.some(
      (a) =>
        String(a.id) === String(item.id) ||
        String(a.activity_id) === String(item.id)
    ) || false;

  const features = item.features || item.originalData?.features || [];

  const handleActivityClick = () => {
    if (isSelected) {
      // ✅ لو allowDeselect = true (في EditModal) يعمل remove
      // لو allowDeselect = false (في Package Details) مايعملش حاجة
      if (allowDeselect) {
        dispatch(removeActivity({ day: dayIndex + 1, activityId: item.id }));
      }
      return;
    }

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
          features: features,
        },
      })
    );
  };

  const getDurationFromFeatures = () => {
    const durationFeature = features.find(
      (f) => f.label?.toLowerCase() === "duration"
    );
    return (
      durationFeature?.feature ||
      item.duration?.[locale] ||
      item.duration?.en ||
      "N/A"
    );
  };

  const getDifficultyFromFeatures = () => {
    const difficultyFeature = features.find(
      (f) => f.label?.toLowerCase() === "difficulty"
    );
    return (
      difficultyFeature?.feature ||
      item.difficulty?.[locale] ||
      item.difficulty?.en ||
      "Easy"
    );
  };

  return (
    <div
      className={`card activity-card ${isSelected ? "selected-activity selected" : ""}`}
      style={{ position: "relative" }}
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

        <div className="gap-3 mb-3 transfer_feat_cont">
          {features.length > 0 ? (
            features.slice(0, 4).map((feature, idx) => (
              <div
                key={feature.feature_id || idx}
                className="d-flex align-items-center justify-content-start transfer_in gap-2"
              >
                <div
                  className="feature-icon"
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <div className="d-flex align-items-start flex-column transfer_cont">
                  <div className="fw-bold">{feature.label}</div>
                  <div className="transfer_info" title={feature.feature}>
                    {feature.feature}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
                <GiDuration />
                <div className="d-flex align-items-start flex-column transfer_cont">
                  <div className="fw-bold">{t("duration") || "Duration"}</div>
                  <div className="transfer_info">
                    {getDurationFromFeatures()}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
                <MdNetworkWifi2Bar />
                <div className="d-flex align-items-start flex-column transfer_cont">
                  <div className="fw-bold">
                    {t("difficulty") || "Difficulty"}
                  </div>
                  <div className="transfer_info">
                    {getDifficultyFromFeatures()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card-footer">
          <span className="price">
            {item.price_current || item.price
              ? `$${item.price_current || item.price}`
              : t("included") || "Included"}
          </span>

          <button
            onClick={handleActivityClick}
            // ✅ لو مش allowDeselect والـ card selected - disabled
            disabled={isSelected && !allowDeselect}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              transition-all duration-200
              ${
                isSelected
                  ? "bg-[#295557] text-white cursor-default"
                  : "bg-[#295557]/10 text-[#295557] hover:bg-[#295557] hover:text-white cursor-pointer"
              }
            `}
          >
            {isSelected ? (
              <>
                <FiCheck size={12} />
                {allowDeselect ? "Remove" : "Added"}
              </>
            ) : (
              <>
                <FiPlus size={12} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
