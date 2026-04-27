"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActivity,
  removeActivity,
  updateActivityPeople,
  calculateTotal,
} from "@/lib/redux/slices/tourReservationSlice";
import { GiDuration } from "react-icons/gi";
import { MdNetworkWifi2Bar } from "react-icons/md";
import {
  FiCheck,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiUsers,
  FiChevronLeft,
} from "react-icons/fi";

const BRAND = "#295557";

const getLocalizedValue = (value, locale) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return (
      value?.[locale] ||
      value?.en ||
      Object.values(value).find((v) => typeof v === "string" && v.trim()) ||
      ""
    );
  }
  return "";
};

const getFirstImage = (image) => {
  if (Array.isArray(image)) return getFirstImage(image[0]);
  if (typeof image === "string") return image?.split("//CAMP//")[0] || "";
  return "";
};

const toBoolean = (value) =>
  value === true || value === 1 || value === "1" || value === "true";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const ActivityCard = ({ item, dayIndex }) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");
  const dispatch = useDispatch();

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay || {}
  );
  const numAdults = useSelector((state) =>
    Number(state.tourReservation?.numAdults || 1)
  );
  const numChildren = useSelector((state) =>
    Number(state.tourReservation?.numChildren || 0)
  );

  const dayKey = String(dayIndex + 1);
  const dayNumber = dayIndex + 1;

  const resolvedActivityId =
    item?.activity_id ||
    item?.id ||
    item?.originalData?.activity_id ||
    item?.tour_activity_id ||
    item?.originalData?.tour_activity_id;

  const resolvedTourActivityId =
    item?.tour_activity_id ||
    item?.originalData?.tour_activity_id ||
    item?.activity_id ||
    item?.id ||
    item?.originalData?.activity_id;

  const forChildren = toBoolean(
    item?.for_children ?? item?.originalData?.for_children
  );

  const features =
    (Array.isArray(item?.features) && item.features.length > 0
      ? item.features
      : Array.isArray(item?.originalData?.features)
        ? item.originalData.features
        : []) || [];

  const title =
    getLocalizedValue(item?.title, locale) ||
    getLocalizedValue(item?.name, locale) ||
    getLocalizedValue(item?.originalData?.title, locale) ||
    getLocalizedValue(item?.originalData?.name, locale) ||
    "Activity";

  const imageSrc =
    getFirstImage(item?.image || item?.originalData?.image) ||
    "https://via.placeholder.com/380x207";

  const activityPrice =
    item?.price_current ??
    item?.price ??
    item?.originalData?.price_current ??
    item?.originalData?.price ??
    0;

  const selectedActivity = useMemo(() => {
    const activities = selectedByDay?.[dayKey]?.activities || [];

    return activities.find((activity) => {
      const activityId = String(activity?.activity_id ?? activity?.id ?? "");
      const tourActivityId = String(activity?.tour_activity_id ?? "");
      return (
        activityId === String(resolvedActivityId ?? "") ||
        tourActivityId === String(resolvedTourActivityId ?? "")
      );
    });
  }, [selectedByDay, dayKey, resolvedActivityId, resolvedTourActivityId]);

  const isSelected = !!selectedActivity;

  const [isFlipped, setIsFlipped] = useState(false);
  const [draftAdults, setDraftAdults] = useState(Math.max(numAdults, 0));
  const [draftChildren, setDraftChildren] = useState(
    forChildren ? Math.max(numChildren, 0) : 0
  );

  useEffect(() => {
    if (selectedActivity) {
      setDraftAdults(
        clamp(
          Number(selectedActivity?.num_adults ?? numAdults) || 0,
          0,
          Math.max(numAdults, 0)
        )
      );
      setDraftChildren(
        forChildren
          ? clamp(
              Number(selectedActivity?.num_children ?? numChildren) || 0,
              0,
              Math.max(numChildren, 0)
            )
          : 0
      );
    } else {
      setDraftAdults(Math.max(numAdults, 0));
      setDraftChildren(forChildren ? Math.max(numChildren, 0) : 0);
    }
  }, [selectedActivity, numAdults, numChildren, forChildren]);

  useEffect(() => {
    if (!isSelected) {
      setIsFlipped(false);
    }
  }, [isSelected]);

  const attendingCount = draftAdults + (forChildren ? draftChildren : 0);
  const notAttendingAdults = Math.max(numAdults - draftAdults, 0);
  const notAttendingChildren = Math.max(numChildren - draftChildren, 0);
  const totalNotAttending =
    notAttendingAdults + (forChildren ? notAttendingChildren : numChildren);

  const getDurationFromFeatures = () => {
    const durationFeature = features.find((feature) => {
      const label = getLocalizedValue(feature?.label, locale)
        ?.toLowerCase?.()
        ?.trim?.();
      return label === "duration";
    });

    return (
      durationFeature?.feature ||
      getLocalizedValue(item?.duration, locale) ||
      getLocalizedValue(item?.originalData?.duration, locale) ||
      "N/A"
    );
  };

  const getDifficultyFromFeatures = () => {
    const difficultyFeature = features.find((feature) => {
      const label = getLocalizedValue(feature?.label, locale)
        ?.toLowerCase?.()
        ?.trim?.();
      return label === "difficulty";
    });

    return (
      difficultyFeature?.feature ||
      getLocalizedValue(item?.difficulty, locale) ||
      getLocalizedValue(item?.originalData?.difficulty, locale) ||
      "Easy"
    );
  };

  const resetDraftFromSaved = () => {
    if (selectedActivity) {
      setDraftAdults(
        clamp(
          Number(selectedActivity?.num_adults ?? numAdults) || 0,
          0,
          Math.max(numAdults, 0)
        )
      );
      setDraftChildren(
        forChildren
          ? clamp(
              Number(selectedActivity?.num_children ?? numChildren) || 0,
              0,
              Math.max(numChildren, 0)
            )
          : 0
      );
    } else {
      setDraftAdults(Math.max(numAdults, 0));
      setDraftChildren(forChildren ? Math.max(numChildren, 0) : 0);
    }
  };

  const handleAdd = () => {
    const initialAdults = Math.max(numAdults, 0);
    const initialChildren = forChildren ? Math.max(numChildren, 0) : 0;

    setDraftAdults(initialAdults);
    setDraftChildren(initialChildren);

    dispatch(
      selectActivity({
        day: dayNumber,
        activity: {
          id: resolvedActivityId,
          activity_id: resolvedActivityId,
          tour_activity_id: resolvedTourActivityId,
          title: item?.title || item?.originalData?.title || title,
          name: title,
          image: imageSrc,
          price: activityPrice,
          price_current: activityPrice,
          for_children: forChildren,
          num_adults: initialAdults,
          num_children: initialChildren,
          features,
        },
      })
    );
    dispatch(calculateTotal());
    // ✅ Don't auto-flip to back; let user see Remove button on front
  };

  const handleRemove = () => {
    const activityIdToRemove =
      selectedActivity?.activity_id ??
      selectedActivity?.id ??
      resolvedActivityId;

    dispatch(
      removeActivity({
        day: dayNumber,
        activityId: activityIdToRemove,
      })
    );
    dispatch(calculateTotal());
    setIsFlipped(false);
  };

  const handleConfirmPeople = () => {
    if (!isSelected || attendingCount <= 0) return;

    const activityIdToUpdate =
      selectedActivity?.activity_id ??
      selectedActivity?.id ??
      resolvedActivityId;

    dispatch(
      updateActivityPeople({
        day: dayNumber,
        activityId: activityIdToUpdate,
        num_adults: draftAdults,
        num_children: forChildren ? draftChildren : 0,
      })
    );
    dispatch(calculateTotal());
    setIsFlipped(false);
  };

  const renderFeatureItem = (feature, idx) => {
    const label = getLocalizedValue(feature?.label, locale) || feature?.label;
    const value =
      getLocalizedValue(feature?.feature, locale) || feature?.feature || "N/A";

    return (
      <div
        key={feature?.feature_id || `${label}-${idx}`}
        className="flex items-start gap-2 min-w-0"
      >
        <div className="feature-icon shrink-0 mt-[2px] flex items-center justify-center [&_*]:text-[13px] [&_*]:leading-none">
          {feature?.icon ? (
            <div dangerouslySetInnerHTML={{ __html: feature.icon }} />
          ) : (
            <GiDuration size={13} />
          )}
        </div>

        <div className="d-flex align-items-start flex-column transfer_cont min-w-0">
          <div className="fw-bold text-[11px] leading-4 truncate w-full">
            {label}
          </div>
          <div
            className="transfer_info text-[11px] leading-4 break-words line-clamp-2"
            title={value}
          >
            {value}
          </div>
        </div>
      </div>
    );
  };

  const renderFallbackFeatures = () => (
    <>
      <div className="flex items-start gap-2 min-w-0">
        <div className="feature-icon shrink-0 mt-[2px] flex items-center justify-center text-[13px] leading-none">
          <GiDuration size={13} />
        </div>
        <div className="d-flex align-items-start flex-column transfer_cont min-w-0">
          <div className="fw-bold text-[11px] leading-4 truncate w-full">
            {t("duration") || "Duration"}
          </div>
          <div
            className="transfer_info text-[11px] leading-4 break-words line-clamp-2"
            title={getDurationFromFeatures()}
          >
            {getDurationFromFeatures()}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 min-w-0">
        <div className="feature-icon shrink-0 mt-[2px] flex items-center justify-center text-[13px] leading-none">
          <MdNetworkWifi2Bar size={13} />
        </div>
        <div className="d-flex align-items-start flex-column transfer_cont min-w-0">
          <div className="fw-bold text-[11px] leading-4 truncate w-full">
            {t("difficulty") || "Difficulty"}
          </div>
          <div
            className="transfer_info text-[11px] leading-4 break-words line-clamp-2"
            title={getDifficultyFromFeatures()}
          >
            {getDifficultyFromFeatures()}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`card activity-card ${isSelected ? "selected-activity selected" : ""} ${isFlipped ? "flipped" : ""}`}
      style={{
        position: "relative",
        perspective: "1200px",
      }}
    >
      <div
        className="card-inner"
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease-in-out",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ═══ FRONT SIDE ═══ */}
        <div
          className="card-front"
          style={{
            gridArea: "1 / 1",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#fff",
          }}
        >
          {isSelected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              className="cards-container-learnmore"
            >
              Participants
            </button>
          )}

          <img
            src={imageSrc}
            alt={title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/380x207";
            }}
          />

          <div className="card-content">
            <h3>{title}</h3>

            <div
              className={`transfer_feat_cont mb-3 ${
                features.length === 1
                  ? "flex flex-col gap-2"
                  : "grid grid-cols-2 gap-x-3 gap-y-2"
              }`}
            >
              {features.length > 0
                ? features.slice(0, 4).map(renderFeatureItem)
                : renderFallbackFeatures()}
            </div>

            <div className="card-footer">
              <span className="price">
                {activityPrice
                  ? `$${activityPrice}`
                  : t("included") || "Included"}
              </span>

              <div className="flex items-center gap-2">
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
                  >
                    <FiTrash2 size={11} />
                    Remove
                  </button>
                )}

                {!isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 bg-[#295557]/10 text-[#295557] hover:bg-[#295557] hover:text-white cursor-pointer"
                  >
                    <FiPlus size={12} />
                    Add
                  </button>
                )}

                {isSelected && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: BRAND }}
                  >
                    <FiCheck size={12} />
                    Added
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BACK SIDE — Participants Editor ═══ */}
        <div
          className="card-back"
          style={{
            gridArea: "1 / 1",
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#fff",
          }}
        >
          <div className="room-selection-container h-full flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="m-0">Participants</h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetDraftFromSaved();
                    setIsFlipped(false);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all"
                >
                  <FiChevronLeft size={12} />
                  Back
                </button>
              </div>
            </div>

            <p className="mb-2">
              Total travelers: {numAdults + numChildren}
              <span
                style={{ fontSize: "11px", color: "#888", display: "block" }}
              >
                ({numAdults} Adults
                {numChildren > 0 ? `, ${numChildren} Children` : ""})
              </span>
            </p>

            {forChildren && numChildren > 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#295557",
                  marginBottom: "10px",
                  background: "#f0f7f7",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                Children can join this activity
              </div>
            )}

            {!forChildren && numChildren > 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#856404",
                  marginBottom: "10px",
                  background: "#fff3cd",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                Children are not available for this activity
              </div>
            )}

            <div className="rooms-container !gap-3 flex-1">
              <div className="room-item">
                <div className="room-header">
                  <h5>Adults</h5>
                </div>

                <div className="room-occupants">
                  <div className="occupant-type w-full">
                    <span>Who will attend</span>
                    <div className="counter">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraftAdults((prev) =>
                            clamp(prev - 1, 0, Math.max(numAdults, 0))
                          );
                        }}
                        disabled={draftAdults <= 0}
                      >
                        <FiMinus />
                      </button>
                      <span>{draftAdults}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraftAdults((prev) =>
                            clamp(prev + 1, 0, Math.max(numAdults, 0))
                          );
                        }}
                        disabled={draftAdults >= numAdults}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <div className="occupant-type w-full">
                    <span>Will not attend</span>
                    <div
                      className="counter"
                      style={{
                        background: "#f8f8f8",
                        borderRadius: "999px",
                        padding: "6px 12px",
                        minWidth: "88px",
                        justifyContent: "center",
                      }}
                    >
                      <span>{notAttendingAdults}</span>
                    </div>
                  </div>
                </div>
              </div>

              {forChildren && numChildren > 0 && (
                <div className="room-item">
                  <div className="room-header">
                    <h5>Children</h5>
                  </div>

                  <div className="room-occupants">
                    <div className="occupant-type w-full">
                      <span>Who will attend</span>
                      <div className="counter">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraftChildren((prev) =>
                              clamp(prev - 1, 0, Math.max(numChildren, 0))
                            );
                          }}
                          disabled={draftChildren <= 0}
                        >
                          <FiMinus />
                        </button>
                        <span>{draftChildren}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraftChildren((prev) =>
                              clamp(prev + 1, 0, Math.max(numChildren, 0))
                            );
                          }}
                          disabled={draftChildren >= numChildren}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <div className="occupant-type w-full">
                      <span>Will not attend</span>
                      <div
                        className="counter"
                        style={{
                          background: "#f8f8f8",
                          borderRadius: "999px",
                          padding: "6px 12px",
                          minWidth: "88px",
                          justifyContent: "center",
                        }}
                      >
                        <span>{notAttendingChildren}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">
                    Attending
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    {attendingCount} Traveler
                    {attendingCount !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="rounded-lg border border-black/5 bg-white px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-400">
                    Not attending
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    {totalNotAttending} Traveler
                    {totalNotAttending !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            <div className="room-actions mt-3">
              <button
                type="button"
                className="cancel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  resetDraftFromSaved();
                  setIsFlipped(false);
                }}
              >
                {t("cancel")}
              </button>

              <button
                type="button"
                className="confirm-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmPeople();
                }}
                disabled={attendingCount <= 0}
                style={{
                  opacity: attendingCount <= 0 ? 0.6 : 1,
                  cursor: attendingCount <= 0 ? "not-allowed" : "pointer",
                }}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
