"use client";

import React, { useEffect, useRef, useState } from "react";

import { IoAirplane } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import {
  FaEarthAsia,
  FaHeadset,
  FaHeart,
  FaBell,
  FaBookOpen,
} from "react-icons/fa6";

import { BsFillCaretRightFill } from "react-icons/bs";

import "react-datepicker/dist/react-datepicker.css";
import { Collapse } from "antd";

import Link from "../../components/link";
import "./style.css";
import { usePathname } from "next/navigation";
import Newslatter from "../../components/common/Newslatter";
import { MdAttachMoney } from "react-icons/md";
import { href } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";
const Layout = ({ children }) => {
  const [currentDay, setCurrentDay] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayIndex = parseInt(
              entry.target.getAttribute("data-day"),
              10
            );
            setCurrentDay(dayIndex);
          }
        });
      },
      {
        threshold: 0.5, // Adjust this value as needed
      }
    );

    const dayElements = document.querySelectorAll(".day-section");
    dayElements.forEach((element) => observer.observe(element));

    return () => {
      dayElements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  const customExpandIcon =
    (fontSize = "16px") =>
    ({ isActive }) =>
      (
        <BsFillCaretRightFill
          style={{
            color: "#cd533b",
            fontSize: fontSize,
            transition: "transform 0.3s",
            transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      );

  const today = new Date();
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);

  const sixDaysLater = new Date(oneDayLater);
  sixDaysLater.setDate(oneDayLater.getDate() + 5);
  const [dateValue, setDateValue] = useState([oneDayLater, sixDaysLater]);

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    console.log(currentDay);
  }, [currentDay]);

  const formattedDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; // Handle invalid date
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const items = [
    {
      key: "1",
      label: "Personal",
      children: [{ title: "Travels", icon: <IoAirplane /> }],
    },
    {
      key: "1",
      label: "Settings",
      children: [
        { title: "Profile Settings", icon: <IoMdSettings /> },
        { title: "Languages", icon: <FaEarthAsia /> },
      ],
    },
  ];

  return (
    <div className="d-flex justify-content-center">
      <div className="profile_side_bar container mx-1">
        <div className="package-details-area mb-[30px] position-relative mx-auto">
          <div className="">
            <div className="row g-xl-4 gy-5 ">
              <div
                className="col-xl-3 xl:min-h-[200px] pt-[25px]   "
                style={{
                  position: "sticky",
                  top: "100px",
                }}
              >
                <div
                  className="booking-form-wrap "
                  style={{
                    overflow: "hidden",
                  }}
                >
                  {/* <h4 className="">Account</h4> */}

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
                            <div className="flex flex-column ">
                              {[
                                {
                                  href: "/account",
                                  label: "Travels",
                                  icon: <IoAirplane />,
                                },
                                {
                                  href: "/account/settings",
                                  label: "Settings",
                                  icon: <IoMdSettings />,
                                },

                                {
                                  href: "/account/blogs",
                                  label: "Blogs",
                                  icon: <FaBookOpen />,
                                },

                                {
                                  href: "/account/notifications",
                                  label: "Notifications",
                                  icon: <FaBell />,
                                },
                                {
                                  href: "/wishlist",
                                  label: "Wishlist",
                                  icon: <FaHeart />,
                                },
                                {
                                  href: "/account/support",
                                  label: "Support",
                                  icon: <FaHeadset />,
                                },
                                {
                                  href: "/account/transactions",
                                  label: "Wallet",
                                  icon: <MdAttachMoney />,
                                },
                              ].map((item) => {
                                return (
                                  <div className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <div className="text-start ">
                                      <Link
                                        href={item.href}
                                        className={`d-flex hover:text-[#295557] transition-all duration-300 profile_side_btn align-items-center gap-2 ${
                                          pathname == item.href ? "active" : ""
                                        }`}
                                      >
                                        <div>{item.icon}</div>
                                        <div>{item.label}</div>
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-9 !px-0 mt-5">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
