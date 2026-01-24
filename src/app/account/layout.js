"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { IoAirplane } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { FaHeadset, FaHeart, FaBell, FaBookOpen } from "react-icons/fa6";
import {
  IoLogOutOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { MdAttachMoney } from "react-icons/md";
import { FiChevronRight } from "react-icons/fi";

import "react-datepicker/dist/react-datepicker.css";

import Link from "../../components/link";
import { usePathname } from "next/navigation";

// Fixed header height - adjust this based on your actual header height
const HEADER_HEIGHT = 80;

const Layout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Menu items array
  const menuItems = [
    {
      href: "/account",
      label: "Bookings",
      icon: <IoAirplane className="w-5 h-5" />,
    },
    {
      href: "/account/settings",
      label: "Settings",
      icon: <IoMdSettings className="w-5 h-5" />,
    },
    {
      href: "/account/blogs",
      label: "Blogs",
      icon: <FaBookOpen className="w-5 h-5" />,
    },
    {
      href: "/account/notifications",
      label: "Notifications",
      icon: <FaBell className="w-5 h-5" />,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: <FaHeart className="w-5 h-5" />,
    },
    {
      href: "/account/support",
      label: "Support",
      icon: <FaHeadset className="w-5 h-5" />,
    },
    {
      href: "/account/transactions",
      label: "Wallet",
      icon: <MdAttachMoney className="w-5 h-5" />,
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="py-4 sm:py-6 lg:py-8"
          style={{ paddingTop: `${HEADER_HEIGHT + 20}px` }}
        >
          <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 xl:gap-8">
            {/* Mobile Menu Toggle Button */}
            <div className="xl:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <span className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#295557] rounded-lg flex items-center justify-center">
                    <IoMenuOutline className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      Account Menu
                    </p>
                    <p className="text-xs text-gray-500">
                      {menuItems.find((item) => item.href === pathname)
                        ?.label || "Navigation"}
                    </p>
                  </div>
                </span>
                <FiChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-[999] xl:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Sidebar - Desktop & Mobile Drawer */}
            <aside
              className={`
                fixed xl:relative inset-y-0 left-0 z-[1000] xl:z-auto
                w-[280px] sm:w-[320px] xl:w-[280px] 2xl:w-[300px]
                bg-white xl:bg-transparent
                transform transition-transform duration-300 ease-in-out
                xl:transform-none xl:transition-none
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
              `}
              style={{
                top: 0,
                height: "100vh",
              }}
            >
              {/* Mobile Header */}
              <div className="xl:hidden flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoCloseOutline className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div
                className="xl:sticky overflow-y-auto"
                style={{
                  top: `${HEADER_HEIGHT + 32}px`,
                  maxHeight: `calc(100vh - ${HEADER_HEIGHT + 32}px)`,
                }}
              >
                <div className="p-4 xl:!p-0">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <nav className="p-2">
                      {/* Menu Items */}
                      {menuItems.map((item, index) => {
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-3 px-4 py-3 rounded-xl mb-1
                              transition-all duration-200 group
                              ${
                                isActive
                                  ? "bg-[#295557] text-white shadow-md"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-[#295557]"
                              }
                            `}
                          >
                            <span
                              className={`
                              flex-shrink-0 transition-transform group-hover:scale-110
                              ${isActive ? "text-white" : "text-[#295557]"}
                            `}
                            >
                              {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                              <FiChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </Link>
                        );
                      })}

                      {/* Divider */}
                      <div className="my-3 border-t border-gray-100" />

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                          <IoLogOutOutline className="w-5 h-5" />
                        </span>
                        <span className="font-medium">Logout</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
