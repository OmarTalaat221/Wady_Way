"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Collapse } from "antd";
import Calendar from "react-calendar";
import { FaEdit, FaPlus, FaMinus } from "react-icons/fa";
import { customExpandIcon } from "./CustomExpandIcon";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import {
  setTourData,
  setTourInfo,
  setPeopleCount,
  calculateTotal,
  selectPriceDetails, // ✅ استيراد selector جديد
} from "@/lib/redux/slices/tourReservationSlice";
import toast from "react-hot-toast";

const { Panel } = Collapse;

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
}) => {
  const locale = useLocale();
  const t = useTranslations("bookingSidebar");
  const dispatch = useDispatch();

  const selectedByDay = useSelector(
    (state) => state.tourReservation.selectedByDay
  );

  // ✅ استخدام selector للحصول على تفاصيل الأسعار
  const priceDetails = useSelector(selectPriceDetails);

  const totalPeople = people.adults + people.children + people.infants;
  const maxPersons = tourData?.max_persons || Infinity;
  const canAddMorePeople = totalPeople < maxPersons;

  const contentStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #295557",
  };

  const menuStyle = {
    boxShadow: "none",
  };

  const handleAddPerson = (type) => {
    if (!canAddMorePeople) {
      toast.error(
        t("maxPersonsReached") ||
          `Maximum ${maxPersons} persons allowed for this tour`
      );
      return;
    }

    setPeople({
      ...people,
      [type]: people[type] + 1,
    });
  };

  const handleRemovePerson = (type, minValue = 0) => {
    if (people[type] <= minValue) return;

    setPeople({
      ...people,
      [type]: people[type] - 1,
    });
  };

  useEffect(() => {
    if (tourData) {
      dispatch(setTourData(tourData));
    }
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
    if (dateValue && dateValue.length === 2) {
      dispatch(
        setTourInfo({
          startDate: dateValue[0].toISOString().split("T")[0],
          endDate: dateValue[1].toISOString().split("T")[0],
        })
      );
    }
  }, [dateValue, dispatch]);

  useEffect(() => {
    dispatch(calculateTotal());
  }, [selectedByDay, people, dispatch]);

  const getSelectedHotels = () => {
    return Object.values(selectedByDay)
      .map((day) => day.hotel)
      .filter(Boolean);
  };

  const getSelectedCars = () => {
    return Object.values(selectedByDay)
      .map((day) => day.car)
      .filter(Boolean);
  };

  const getSelectedActivities = () => {
    return Object.values(selectedByDay)
      .flatMap((day) => day.activities || [])
      .filter(Boolean);
  };

  const numberOfDays =
    tourData?.itinerary?.length ||
    Math.ceil(
      (new Date(dateValue[1]) - new Date(dateValue[0])) / (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <div
      className="booking-form-wrap mb-10"
      style={{
        overflow: "hidden",
      }}
    >
      <h4 className="">{t("travelDetails")}</h4>

      <div className="tab-content" id="v-pills-tabContent2">
        <div
          className="tab-pane fade active show"
          id="v-pills-booking"
          role="tabpanel"
          aria-labelledby="v-pills-booking-tab"
        >
          <div className="sidebar-booking-form">
            <div>
              <div className="collapse_cont">
                <div className="travel-grid">
                  {/* Travel Dates */}
                  <Dropdown
                    menu={{
                      items: [],
                    }}
                    trigger={["click"]}
                    dropdownRender={(menu) => (
                      <div style={contentStyle}>
                        {React.cloneElement(menu, {
                          style: menuStyle,
                        })}
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

                  {/* Travelers Dropdown */}
                  <Dropdown
                    menu={{
                      items: [],
                    }}
                    trigger={["click"]}
                    dropdownRender={(menu) => (
                      <div style={contentStyle}>
                        {React.cloneElement(menu, {
                          style: menuStyle,
                        })}

                        <div className="d-flex flex-column gap-2 p-2">
                          <div className="add_travel_drop px-2">
                            {t("addTravelers")}
                            {maxPersons !== Infinity && (
                              <span className="text-sm text-gray-500 ms-2">
                                ({totalPeople}/{maxPersons})
                              </span>
                            )}
                          </div>

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
                                disabled={people?.adults <= 1}
                                onClick={() => handleRemovePerson("adults", 1)}
                              >
                                <FaMinus />
                              </button>

                              <div className="adults_text">
                                {people?.adults}
                              </div>

                              <button
                                onClick={() => handleAddPerson("adults")}
                                className="travel_button"
                                disabled={!canAddMorePeople}
                                style={{
                                  opacity: canAddMorePeople ? 1 : 0.5,
                                  cursor: canAddMorePeople
                                    ? "pointer"
                                    : "not-allowed",
                                }}
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
                                disabled={people?.children <= 0}
                                onClick={() =>
                                  handleRemovePerson("children", 0)
                                }
                              >
                                <FaMinus />
                              </button>

                              <div className="adults_text">
                                {people?.children}
                              </div>

                              <button
                                onClick={() => handleAddPerson("children")}
                                className="travel_button"
                                disabled={!canAddMorePeople}
                                style={{
                                  opacity: canAddMorePeople ? 1 : 0.5,
                                  cursor: canAddMorePeople
                                    ? "pointer"
                                    : "not-allowed",
                                }}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="d-flex justify-content-between px-2 align-items-center w-100">
                            <div className="flex flex-col">
                              <div className="drop_text">{t("infants")}</div>
                              <div className="text-[10px] text-gray-500">
                                {t("infantsDescription")}
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                              <button
                                className="travel_button"
                                disabled={people?.infants <= 0}
                                onClick={() => handleRemovePerson("infants", 0)}
                              >
                                <FaMinus />
                              </button>

                              <div className="adults_text">
                                {people?.infants}
                              </div>

                              <button
                                onClick={() => handleAddPerson("infants")}
                                className="travel_button"
                                disabled={!canAddMorePeople}
                                style={{
                                  opacity: canAddMorePeople ? 1 : 0.5,
                                  cursor: canAddMorePeople
                                    ? "pointer"
                                    : "not-allowed",
                                }}
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
                          {totalPeople}{" "}
                          {totalPeople === 1
                            ? t("traveler")
                            : t("travelers_plural")}
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
                            <FaEdit className="" />
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
                                    className="d-flex align-items-center gap-2"
                                    key={subIndex}
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

                {/* ✅ Price Breakdown مع الخصم */}
                {tourData && (
                  <div className="price-breakdown mb-3">
                    {/* Base Tour Prices */}
                    <div className="price-item">
                      <span className="price-label">
                        {t("adults")} ({people.adults} × ${tourData.per_adult}):
                      </span>
                      <span className="price-value">
                        $
                        {(
                          parseFloat(tourData.per_adult || 0) * people.adults
                        ).toFixed(2)}
                      </span>
                    </div>

                    {people.children > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          {t("children")} ({people.children} × $
                          {tourData.per_child}):
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

                    {/* Hotels */}
                    {getSelectedHotels().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">
                          {t("accommodations")}:
                        </span>
                        <span className="price-value">
                          $
                          {getSelectedHotels()
                            .reduce(
                              (sum, hotel) =>
                                sum +
                                parseFloat(
                                  hotel.adult_price ||
                                    hotel.price_per_night ||
                                    0
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
                        <span className="price-label">{t("transfers")}:</span>
                        <span className="price-value">
                          $
                          {getSelectedCars()
                            .reduce(
                              (sum, car) =>
                                sum +
                                parseFloat(car.price_current || car.price || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}
                    {getSelectedActivities().length > 0 && (
                      <div className="price-item">
                        <span className="price-label">{t("activities")}:</span>
                        <span className="price-value">
                          $
                          {getSelectedActivities()
                            .reduce(
                              (sum, activity) =>
                                sum +
                                parseFloat(
                                  activity.price_current || activity.price || 0
                                ),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* ✅ Subtotal */}
                    <div className="price-item">
                      <span className="price-label font-semibold">
                        {t("subtotal") || "Subtotal"}:
                      </span>
                      <span className="price-value font-semibold">
                        ${priceDetails.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* ✅ Discount */}
                    {priceDetails.discountPercentage > 0 && (
                      <div className="price-item">
                        <span className="price-label text-green-600">
                          {t("discount") || "Discount"} (
                          {priceDetails.discountPercentage}%):
                        </span>
                        <span className="price-value text-green-600">
                          - ${priceDetails.discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="book_butt_cont">
                {/* ✅ Total Price بعد الخصم */}
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
