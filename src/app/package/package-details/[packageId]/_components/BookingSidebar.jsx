"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Collapse } from "antd";
import Calendar from "react-calendar";
import { FaEdit, FaPlus, FaMinus } from "react-icons/fa";
import { FaBaby } from "react-icons/fa";
import { MdChildCare } from "react-icons/md";
import { FiInfo } from "react-icons/fi";
import { customExpandIcon } from "./CustomExpandIcon";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  setTourData,
  setTourInfo,
  setPeopleCount,
  calculateTotal,
  selectPriceDetails,
} from "@/lib/redux/slices/tourReservationSlice";
import toast from "react-hot-toast";

const { Panel } = Collapse;

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  selectedTours,
  inviteCode,
  hasInviteCode,
}) => {
  const locale = useLocale();
  const t = useTranslations("bookingSidebar");
  const dispatch = useDispatch();

  const selectedByDay = useSelector(
    (state) => state.tourReservation.selectedByDay
  );
  const priceDetails = useSelector(selectPriceDetails);

  // ✅ Infants لا يحسبوا في الـ max_persons
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

  // ── Handlers ──
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

  // ── Price Calculations ──
  const getSelectedHotels = () =>
    Object.values(selectedByDay)
      .map((d) => d.hotel)
      .filter(Boolean);

  const getSelectedCars = () =>
    Object.values(selectedByDay)
      .map((d) => d.car)
      .filter(Boolean);

  const getSelectedActivities = () => {
    const seen = new Set();
    return Object.values(selectedByDay)
      .flatMap((d) => d.activities || [])
      .filter((act) => {
        const key = String(act.id || act.activity_id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  const getActivitiesTotal = () => {
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
  };

  // ── Effects ──
  useEffect(() => {
    if (tourData) dispatch(setTourData(tourData));
  }, [tourData, dispatch]);

  useEffect(() => {
    dispatch(
      setPeopleCount({
        adults: people.adults,
        children: people.children,
        infants: people.infants,
      })
    );
  }, [people, dispatch]);

  useEffect(() => {
    if (dateValue?.length === 2) {
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
  }, [selectedByDay, people, dispatch]);

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
                  {/* ── Travel Dates ── */}
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
                            minDate={
                              new Date(
                                new Date().setDate(new Date().getDate() + 1)
                              )
                            }
                            selectRange={true}
                          />
                        </div>
                      </div>
                    )}
                  >
                    <div className="travel-item">
                      <label className="travel-label">{t("travelDates")}</label>
                      <div className="travel-input gap-2">
                        <span className="travel-icon mx-0">📅</span>
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

                  {/* ── Travelers ── */}
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

                          {/* ✅ Capacity warning */}
                          {!canAddMore && maxPersons !== Infinity && (
                            <div className="mx-2 flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <FiInfo
                                size={13}
                                className="text-amber-500  shrink-0"
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

                          {/* ✅ Infants - always allowed, no limit */}
                          <div className="d-flex justify-content-between px-2 align-items-center w-100">
                            <div className="flex flex-col">
                              <div className="drop_text flex items-center gap-1.5">
                                {t("infants")}
                                {/* ✅ Free badge */}
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
                              {/* ✅ Infants always can be added */}
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
                        <span className="travel-icon mx-0">👤</span>
                        <span className="travel-text">
                          {totalCountable}{" "}
                          {totalCountable === 1
                            ? t("traveler")
                            : t("travelers_plural")}
                          {/* ✅ Infants shown separately */}
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

                {/* ── Selected Options Collapse ── */}
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
                        {item.children?.map((child, index) => (
                          <div
                            key={index}
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
                                {child.children.map((subChild, subIndex) => (
                                  <div
                                    key={subIndex}
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

                {/* ── Price Breakdown ── */}
                {tourData && (
                  <div className="price-breakdown mb-3">
                    {/* Adults */}
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

                    {/* Children */}
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

                    {/* ✅ Infants - Free */}
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

                    {/* Hotels */}
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

                    {/* Cars */}
                    {getSelectedCars().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">{t("transfers")}</span>
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

                    {/* ✅ Activities with deduplication */}
                    {getSelectedActivities().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">{t("activities")}</span>
                        <span className="price-value">
                          ${getActivitiesTotal().toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Subtotal */}
                    <div className="price-item">
                      <span className="price-label font-semibold">
                        {t("subtotal") || "Subtotal"}:
                      </span>
                      <span className="price-value font-semibold">
                        ${priceDetails.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Discount */}
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

                {/* ✅ Invite Code Badge */}
                {hasInviteCode && inviteCode && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl mb-3">
                    <span className="text-emerald-600 text-sm">🏷️</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-emerald-700 mb-0">
                        Invite Code Applied
                      </p>
                      <p className="text-xs font-bold text-emerald-800 truncate mb-0">
                        {inviteCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer: Total + Book Now ── */}
              <div className="book_butt_cont">
                <div className="total-price">
                  <span>{t("totalPrice")}</span>
                  <span className="price-amount">
                    {tourData?.price_currency || "$"}
                    {priceDetails.total.toFixed(2)}
                  </span>
                </div>

                <Link
                  href={`/package/package-details/${packageId}/package-summary`}
                  className="primary-btn1 two text-white"
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
