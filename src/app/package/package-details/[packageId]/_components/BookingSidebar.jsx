// BookingSidebar.jsx
"use client";
import React, { useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Collapse } from "antd";
import Calendar from "react-calendar";
import { FaEdit, FaPlus, FaMinus } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { customExpandIcon } from "./CustomExpandIcon";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  setTourData,
  setTourInfo,
  calculateTotal,
  selectPriceDetails,
  validateRoomsForAllDays,
  validateCarsForAllDays,
} from "@/lib/redux/slices/tourReservationSlice";
import toast from "react-hot-toast";
import { FaCalendar, FaUser } from "react-icons/fa6";

const { Panel } = Collapse;

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const scrollAndHighlight = (selector) => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.style.transition = "box-shadow 0.3s, outline 0.3s";
  el.style.outline = "3px solid #295557";
  el.style.boxShadow = "0 0 20px rgba(41, 85, 87, 0.3)";
  el.style.borderRadius = "12px";
  setTimeout(() => {
    el.style.outline = "none";
    el.style.boxShadow = "none";
  }, 3000);
};

const BookingSidebar = ({
  dateValue,
  handleDateChange,
  formattedRange,
  people,
  setPeople,
  items,
  scrollToDiv,
  packageId,
  tourData,
  inviteCode,
  hasInviteCode,
}) => {
  const locale = useLocale();
  const t = useTranslations("bookingSidebar");
  const dispatch = useDispatch();

  const selectedByDay = useSelector(
    (state) => state.tourReservation.selectedByDay || {}
  );
  const tourGuideByDay = useSelector(
    (state) => state.tourReservation.tourGuideByDay || {}
  );
  const priceDetails = useSelector(selectPriceDetails);
  const fullState = useSelector((state) => state);

  const totalCountable = people.adults + people.children;
  const maxPersons = tourData?.max_persons
    ? parseInt(tourData.max_persons)
    : Infinity;
  const canAddMore = totalCountable < maxPersons;

  const contentStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #295557",
  };

  const menuStyle = { boxShadow: "none" };

  // ─── People handlers ────────────────────────────────────────────────────
  const handleAddPerson = (type) => {
    if (type !== "infants" && !canAddMore) {
      toast.error(
        `Maximum ${maxPersons} travelers allowed (adults + children)`
      );
      return;
    }
    setPeople((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleRemovePerson = (type, minValue = 0) => {
    if (people[type] <= minValue) return;
    setPeople((prev) => ({ ...prev, [type]: prev[type] - 1 }));
  };

  // ─── Derived selections ──────────────────────────────────────────────────
  const getSelectedHotels = useCallback(
    () =>
      Object.values(selectedByDay)
        .map((d) => d.hotel)
        .filter(Boolean),
    [selectedByDay]
  );

  const getSelectedCars = useCallback(
    () =>
      Object.values(selectedByDay).flatMap((d) =>
        Array.isArray(d.cars) ? d.cars : d.car ? [d.car] : []
      ),
    [selectedByDay]
  );

  const getSelectedActivities = useCallback(() => {
    const seen = new Set();
    return Object.values(selectedByDay)
      .flatMap((d) => d.activities || [])
      .filter((act) => {
        const key = String(act.id || act.activity_id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [selectedByDay]);

  const getActivitiesTotal = useCallback(() => {
    let total = 0;
    Object.values(selectedByDay).forEach((day) => {
      const seen = new Set();
      (day.activities || []).forEach((act) => {
        const key = String(act.id || act.activity_id);
        if (seen.has(key)) return;
        seen.add(key);
        total += parseFloat(act.price_current || act.price || 0);
      });
    });
    return total;
  }, [selectedByDay]);

  const getDriversCount = useCallback(
    () => getSelectedCars().filter((car) => car.withDriver).length,
    [getSelectedCars]
  );

  const getDriversTotal = useCallback(() => {
    const driverPrice = parseFloat(tourData?.driver_price || 0);
    return getDriversCount() * driverPrice;
  }, [getDriversCount, tourData]);

  const getGuidesCount = useCallback(
    () =>
      Object.values(tourGuideByDay).filter(
        (guide) => guide?.isAvailable && guide?.isSelected
      ).length,
    [tourGuideByDay]
  );

  const getGuidesTotal = useCallback(
    () =>
      Object.values(tourGuideByDay).reduce((sum, guide) => {
        if (guide?.isAvailable && guide?.isSelected) {
          return sum + parseFloat(guide.guidePrice || 0);
        }
        return sum;
      }, 0),
    [tourGuideByDay]
  );

  // ─── Validation helpers ──────────────────────────────────────────────────

  /**
   * Check if the user has made ANY manual selection across all days.
   * If no manual selection exists → first-visit → skip car validation warning.
   */
  const hasAnyUserSelection = useCallback(() => {
    return Object.values(selectedByDay).some((day) => {
      const hasCars = Array.isArray(day?.cars)
        ? day.cars.length > 0
        : !!day?.car;
      const hasHotel = !!day?.hotel;
      const hasActivities = Array.isArray(day?.activities)
        ? day.activities.length > 0
        : false;
      return hasCars || hasHotel || hasActivities;
    });
  }, [selectedByDay]);

  /**
   * Check if all days with data have cars selected.
   * Returns { allGood, missingDays[] }
   */
  const checkCarsStatus = useCallback(() => {
    const itinerary = tourData?.itinerary || tourData?.days || [];
    const validDayNumbers = itinerary.map((d) => Number(d.day)).filter(Boolean);

    const missingDays = [];

    validDayNumbers.forEach((dayNum) => {
      const dayKey = String(dayNum);
      const dayData = selectedByDay?.[dayKey];
      const cars = Array.isArray(dayData?.cars)
        ? dayData.cars
        : dayData?.car
          ? [dayData.car]
          : [];

      if (cars.length === 0) {
        missingDays.push(dayNum);
      }
    });

    return { allGood: missingDays.length === 0, missingDays };
  }, [selectedByDay, tourData]);

  const getRoomIssues = useCallback(() => {
    const totalTravelers = people.adults + people.children;
    if (totalTravelers < 3 && (people.infants || 0) === 0) return [];

    const issues = [];
    Object.entries(selectedByDay).forEach(([dayKey, dayData]) => {
      if (!dayData?.hotel) return;
      const rooms = Array.isArray(dayData.rooms) ? dayData.rooms : [];
      const assigned = rooms.reduce(
        (sum, room) =>
          sum +
          Number(room.adults || 0) +
          Number(room.kids ?? room.children ?? 0),
        0
      );
      if (rooms.length === 0 && totalTravelers >= 3) {
        issues.push({
          day: parseInt(dayKey),
          assigned: 0,
          required: totalTravelers,
        });
      } else if (rooms.length > 0 && assigned !== totalTravelers) {
        issues.push({
          day: parseInt(dayKey),
          assigned,
          required: totalTravelers,
        });
      }
    });
    return issues;
  }, [people, selectedByDay]);

  const getCarIssues = useCallback(() => {
    const carValidation = validateCarsForAllDays(fullState);
    return carValidation.errors;
  }, [fullState]);

  // ─── Memoized issues ─────────────────────────────────────────────────────
  const roomIssues = useMemo(() => getRoomIssues(), [getRoomIssues]);

  // Only show car issues if user has made selections (not on first visit)
  const carIssues = useMemo(() => {
    if (!hasAnyUserSelection()) return [];
    return getCarIssues();
  }, [getCarIssues, hasAnyUserSelection]);

  // ─── Book Now click ──────────────────────────────────────────────────────
  const handleBookNowClick = useCallback(
    (e) => {
      const totalTravelers = people.adults + people.children;

      // ✅ Only validate cars if user has made at least one selection
      // On first visit with no localStorage data, default cars are auto-selected
      // but we still want to validate capacity issues
      const carValidation = validateCarsForAllDays(fullState);

      if (!carValidation.isValid) {
        // Check if this is a "no cars" error or capacity error
        const firstError = carValidation.errors[0];

        // If it's a capacity issue → always block
        if (firstError?.type === "insufficient_capacity") {
          e.preventDefault();
          toast.error(
            `Day ${firstError.day}: Car capacity (${firstError.totalCapacity} seats) is not enough for ${firstError.requiredSeats} passengers. Please add more cars.`,
            { duration: 5000, icon: "🚗" }
          );
          setTimeout(() => {
            scrollAndHighlight(`[data-cars="day-${firstError.day}"]`);
          }, 300);
          return;
        }

        // If it's "no_cars" → only block if user has made some selection
        // (meaning they removed a car manually, not first visit with no data)
        if (firstError?.type === "no_cars" && hasAnyUserSelection()) {
          e.preventDefault();
          toast.error(
            `Please select cars for Day ${firstError.day}. Cars are required for all travelers.`,
            { duration: 5000, icon: "🚗" }
          );
          setTimeout(() => {
            scrollAndHighlight(`[data-cars="day-${firstError.day}"]`);
          }, 300);
          return;
        }
      }

      // ─── Room validation ───────────────────────────────────────────────
      if (totalTravelers >= 3 || people.infants > 0) {
        const validation = validateRoomsForAllDays(fullState);
        if (!validation.isValid) {
          e.preventDefault();
          const firstError = validation.errors[0];
          toast.error(
            `Please assign all ${firstError.required} travelers to rooms for Day ${firstError.day} (currently ${firstError.assigned} assigned)`,
            { duration: 5000, icon: "🏨" }
          );
          setTimeout(() => {
            scrollAndHighlight(`[data-accommodation="day-${firstError.day}"]`);
          }, 300);
          return;
        }
      }
    },
    [people, fullState, hasAnyUserSelection]
  );

  // ─── Sync effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (tourData) dispatch(setTourData(tourData));
  }, [tourData, dispatch]);

  useEffect(() => {
    if (dateValue?.length === 2 && dateValue[0] && dateValue[1]) {
      dispatch(
        setTourInfo({
          startDate: formatDateLocal(dateValue[0]),
          endDate: formatDateLocal(dateValue[1]),
        })
      );
    }
  }, [dateValue, dispatch]);

  useEffect(() => {
    dispatch(calculateTotal());
  }, [selectedByDay, tourGuideByDay, people, dispatch]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="booking-form-wrap mb-10" style={{ overflow: "hidden" }}>
      <h4>{t("travelDetails")}</h4>

      <div className="tab-content" id="v-pills-tabContent2">
        <div
          className="tab-pane fade active show"
          id="v-pills-booking"
          role="tabpanel"
        >
          <div className="sidebar-booking-form">
            <div>
              <div className="collapse_cont">
                <div className="travel-grid">
                  {/* ─── Date Picker ─── */}
                  <Dropdown
                    menu={{ items: [] }}
                    trigger={["click"]}
                    dropdownRender={(menu) => (
                      <div style={contentStyle}>
                        {React.cloneElement(menu, { style: menuStyle })}
                        <div className="calendar_cont">
                          <Calendar
                            onChange={handleDateChange}
                            value={dateValue}
                            minDate={new Date()}
                            selectRange={true}
                          />
                        </div>
                      </div>
                    )}
                  >
                    <div className="travel-item">
                      <label className="travel-label">{t("travelDates")}</label>
                      <div className="travel-input gap-2">
                        <span className="travel-icon mx-0">
                          <FaCalendar />
                        </span>
                        <span className="travel-text">{formattedRange}</span>
                        <span
                          className="travel-dropdown"
                          style={{ color: "#295557" }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </Dropdown>

                  {/* ─── Travelers Picker ─── */}
                  <Dropdown
                    menu={{ items: [] }}
                    trigger={["click"]}
                    dropdownRender={(menu) => (
                      <div style={contentStyle}>
                        {React.cloneElement(menu, { style: menuStyle })}
                        <div className="d-flex flex-column gap-2 p-2">
                          <div className="add_travel_drop px-2">
                            {t("addTravelers")}
                            {maxPersons !== Infinity && (
                              <span className="text-sm text-gray-500 ms-2">
                                ({totalCountable}/{maxPersons})
                              </span>
                            )}
                          </div>

                          {!canAddMore && maxPersons !== Infinity && (
                            <div className="mx-2 flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <FiInfo
                                size={13}
                                className="text-amber-500 shrink-0"
                              />
                              <p className="text-[11px] text-amber-700 mb-0">
                                Maximum {maxPersons} adults + children allowed
                              </p>
                            </div>
                          )}

                          {/* Adults */}
                          <div className="d-flex justify-content-between px-2 align-items-center w-100">
                            <div className="flex flex-col">
                              <div className="drop_text">{t("adults")}</div>
                              <div className="text-[10px] text-gray-500">
                                {t("adultsDescription")}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <button
                                className="travel_button"
                                disabled={people.adults <= 1}
                                onClick={() => handleRemovePerson("adults", 1)}
                              >
                                <FaMinus />
                              </button>
                              <div className="adults_text">{people.adults}</div>
                              <button
                                className="travel_button"
                                disabled={!canAddMore}
                                style={{
                                  opacity: canAddMore ? 1 : 0.5,
                                  cursor: canAddMore
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                                onClick={() => handleAddPerson("adults")}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="d-flex justify-content-between px-2 align-items-center w-100">
                            <div className="flex flex-col">
                              <div className="drop_text">{t("children")}</div>
                              <div className="text-[10px] text-gray-500">
                                {t("childrenDescription")}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <button
                                className="travel_button"
                                disabled={people.children <= 0}
                                onClick={() =>
                                  handleRemovePerson("children", 0)
                                }
                              >
                                <FaMinus />
                              </button>
                              <div className="adults_text">
                                {people.children}
                              </div>
                              <button
                                className="travel_button"
                                disabled={!canAddMore}
                                style={{
                                  opacity: canAddMore ? 1 : 0.5,
                                  cursor: canAddMore
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                                onClick={() => handleAddPerson("children")}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="d-flex justify-content-between px-2 align-items-center w-100">
                            <div className="flex flex-col">
                              <div className="drop_text flex items-center gap-1.5">
                                {t("infants")}
                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                                  FREE
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {t("infantsDescription")}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <button
                                className="travel_button"
                                disabled={people.infants <= 0}
                                onClick={() => handleRemovePerson("infants", 0)}
                              >
                                <FaMinus />
                              </button>
                              <div className="adults_text">
                                {people.infants}
                              </div>
                              <button
                                className="travel_button"
                                onClick={() => handleAddPerson("infants")}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  >
                    <div className="travel-item">
                      <label className="travel-label">{t("travelers")}</label>
                      <div className="travel-input gap-2">
                        <span className="travel-icon mx-0">
                          <FaUser />
                        </span>
                        <span className="travel-text">
                          {totalCountable}{" "}
                          {totalCountable === 1
                            ? t("traveler")
                            : t("travelers_plural")}
                          {people.infants > 0 && (
                            <span className="text-gray-400 text-sm">
                              {" "}
                              + {people.infants} infant
                              {people.infants > 1 ? "s" : ""}
                            </span>
                          )}
                          {maxPersons !== Infinity && (
                            <span className="text-gray-400 text-sm">
                              {" "}
                              (max {maxPersons})
                            </span>
                          )}
                        </span>
                        <span
                          className="travel-dropdown"
                          style={{ color: "#295557" }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </Dropdown>
                </div>

                {/* ─── Collapse Panels ─── */}
                <Collapse
                  expandIcon={customExpandIcon("12px")}
                  ghost
                  size="large"
                >
                  {items?.map((item) => (
                    <Panel
                      key={item.key}
                      header={
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="panel_head">
                            {item.label?.[locale] || item.label?.en}
                          </span>
                          <button
                            className="edit-button flex gap-[5px] px-1"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToDiv(
                                item.label?.[locale] || item.label?.en
                              );
                            }}
                          >
                            <FaEdit />
                            {t("edit")}
                          </button>
                        </div>
                      }
                      style={{ padding: "0px" }}
                    >
                      <div
                        className="d-flex justify-content-start flex-column gap-1"
                        style={{ color: "#000" }}
                      >
                        {item.children?.map((child, childIdx) => (
                          <div
                            key={childIdx}
                            className={`content_panel d-flex justify-content-start flex-column align-items-start ${
                              child?.children ? "mb-2" : ""
                            }`}
                          >
                            <div className="fw-bold mb-3 d-flex align-items-center gap-2">
                              <div>{child.icon}</div>
                              <div className="text-start">
                                {child.title?.[locale] || child.title?.en}
                              </div>
                            </div>
                            {child.children && (
                              <div
                                style={{
                                  marginLeft: "20px",
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                className="d-flex flex-column gap-3"
                              >
                                {child.children.map((subChild, subIdx) => (
                                  <div
                                    key={subIdx}
                                    className="d-flex align-items-center gap-2"
                                  >
                                    <div>{subChild.icon}</div>
                                    <div>
                                      {subChild.title?.[locale] ||
                                        subChild.title?.en}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  ))}
                </Collapse>

                {/* ─── Price Breakdown ─── */}
                {tourData && (
                  <div className="price-breakdown mb-3">
                    {parseFloat(tourData.per_adult || 0) > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          {t("adults")} ({people.adults} × $
                          {parseFloat(tourData.per_adult).toFixed(0)}):
                        </span>
                        <span className="price-value">
                          $
                          {(
                            parseFloat(tourData.per_adult || 0) * people.adults
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {people.children > 0 &&
                      parseFloat(tourData.per_child || 0) > 0 && (
                        <div className="price-item">
                          <span className="price-label">
                            {t("children")} ({people.children} × $
                            {parseFloat(tourData.per_child).toFixed(0)}):
                          </span>
                          <span className="price-value">
                            $
                            {(
                              parseFloat(tourData.per_child || 0) *
                              people.children
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}

                    {people.infants > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          {t("infants")} ({people.infants}):
                        </span>
                        <span className="price-value text-emerald-600 font-semibold text-sm">
                          Free
                        </span>
                      </div>
                    )}

                    {getSelectedHotels().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          {t("accommodations")}
                        </span>
                        <span className="price-value">
                          $
                          {getSelectedHotels()
                            .reduce(
                              (sum, h) =>
                                sum +
                                parseFloat(
                                  h.adult_price || h.price_per_night || 0
                                ),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}

                    {getSelectedCars().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          {t("transfers")} ({getSelectedCars().length})
                        </span>
                        <span className="price-value">
                          $
                          {getSelectedCars()
                            .reduce(
                              (sum, c) =>
                                sum +
                                parseFloat(c.price_current || c.price || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}

                    {getDriversCount() > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          Drivers ({getDriversCount()} × $
                          {parseFloat(tourData?.driver_price || 0).toFixed(0)})
                        </span>
                        <span className="price-value">
                          ${getDriversTotal().toFixed(2)}
                        </span>
                      </div>
                    )}

                    {getSelectedActivities().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">{t("activities")}</span>
                        <span className="price-value">
                          ${getActivitiesTotal().toFixed(2)}
                        </span>
                      </div>
                    )}

                    {getGuidesCount() > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          Tour Guide ({getGuidesCount()})
                        </span>
                        <span className="price-value">
                          ${getGuidesTotal().toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="price-item">
                      <span className="price-label font-semibold">
                        {t("subtotal") || "Subtotal"}:
                      </span>
                      <span className="price-value font-semibold">
                        ${priceDetails.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {priceDetails.discountPercentage > 0 && (
                      <div className="price-item">
                        <span className="price-label text-green-600">
                          {t("discount") || "Discount"} (
                          {priceDetails.discountPercentage}%):
                        </span>
                        <span className="price-value text-green-600">
                          -${priceDetails.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Room Issues Warning ─── */}
                {roomIssues.length > 0 && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-amber-700">
                        Room Distribution Incomplete
                      </span>
                    </div>
                    {roomIssues.map((issue) => (
                      <div
                        key={issue.day}
                        className="flex items-center justify-between text-xs mb-1"
                      >
                        <span className="text-amber-700">
                          Day {issue.day}: {issue.assigned}/{issue.required}{" "}
                          assigned
                        </span>
                        <button
                          type="button"
                          className="text-[10px] px-2 py-0.5 rounded-full text-white"
                          style={{ background: "#295557" }}
                          onClick={() => {
                            setTimeout(() => {
                              scrollAndHighlight(
                                `[data-accommodation="day-${issue.day}"]`
                              );
                            }, 100);
                          }}
                        >
                          Fix →
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Car Issues Warning ─── 
                    Only shown if user has made manual selections (not first visit) */}
                {carIssues.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-red-700">
                        Cars Required
                      </span>
                    </div>
                    {carIssues.map((issue) => (
                      <div
                        key={issue.day}
                        className="flex items-center justify-between text-xs mb-1"
                      >
                        <span className="text-red-700">
                          {issue.type === "no_cars"
                            ? `Day ${issue.day}: No cars selected`
                            : `Day ${issue.day}: ${issue.totalCapacity}/${issue.requiredSeats} seats`}
                        </span>
                        <button
                          type="button"
                          className="text-[10px] px-2 py-0.5 rounded-full text-white bg-red-500"
                          onClick={() => {
                            setTimeout(() => {
                              scrollAndHighlight(
                                `[data-cars="day-${issue.day}"]`
                              );
                            }, 100);
                          }}
                        >
                          Fix →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Total + Book Now ─── */}
              <div className="book_butt_cont">
                <div className="total-price">
                  <span>{t("totalPrice")}</span>
                  <span className="price-amount">
                    {"$"}
                    {priceDetails.total.toFixed(2)}
                  </span>
                </div>

                <Link
                  href={`/package/package-details/${packageId}/package-summary`}
                  className="primary-btn1 two text-white"
                  onClick={handleBookNowClick}
                >
                  {t("bookNow")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;
