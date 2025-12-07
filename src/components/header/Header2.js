"use client";
import Link from "next/link";
import navData from "../../data/nav.json";
import destinaiton_sidebar_data from "../../data/destination-_idebar.json";
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
import LoginModal from "../common/LoginModal";
import { Swiper, SwiperSlide } from "swiper/react";
import logo from "../../img/long_logo.png";
import { usePathname } from "next/navigation";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import { useTranslations } from "next-intl";
import setLanguageValue from "../../../actions/set-language-action";
import { Select } from "antd";
SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

const initialState = {
  activeMenu: "",
  activeSubMenu: "",
  isSidebarOpen: false,
  isLeftSidebarOpen: false,
  isRightSidebar: false,
  isLang: false,
  scrollY: 0,
  showFixedHeader: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_MENU":
      return {
        ...state,
        activeMenu: state.activeMenu === action.menu ? "" : action.menu,
        activeSubMenu:
          state.activeMenu === action.menu ? state.activeSubMenu : "",
      };
    case "TOGGLE_SUB_MENU":
      return {
        ...state,
        activeSubMenu:
          state.activeSubMenu === action.subMenu ? "" : action.subMenu,
      };
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen,
      };
    case "setScrollY":
      return {
        ...state,
        scrollY: action.payload,
        showFixedHeader: action.payload > 100, // Show fixed header after 100px scroll
      };
    case "TOGGLE_LEFT_SIDEBAR":
      return {
        ...state,
        isLeftSidebarOpen: !state.isLeftSidebarOpen,
      };
    case "TOGGLE_LANG":
      return {
        ...state,
        isLang: !state.isLang,
      };
    case "TOGGLE_RIGHTSIDEBAR":
      return {
        ...state,
        isRightSidebar: !state.isRightSidebar,
      };
    default:
      return state;
  }
}

const enFlag = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24">
    <g fill="none">
      <path
        fill="#2e42a5"
        fillRule="evenodd"
        d="M0 0v24h32V0z"
        clipRule="evenodd"
      ></path>
      <mask
        id="flagpackGbUkm0"
        width={32}
        height={24}
        x={0}
        y={0}
        maskUnits="userSpaceOnUse"
      >
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M0 0v24h32V0z"
          clipRule="evenodd"
        ></path>
      </mask>
      <g mask="url(#flagpackGbUkm0)">
        <path
          fill="#fff"
          d="m-3.563 22.285l7.042 2.979l28.68-22.026l3.715-4.426l-7.53-.995l-11.698 9.491l-9.416 6.396z"
        ></path>
        <path
          fill="#f50100"
          d="M-2.6 24.372L.989 26.1L34.54-1.599h-5.037z"
        ></path>
        <path
          fill="#fff"
          d="m35.563 22.285l-7.042 2.979L-.159 3.238l-3.715-4.426l7.53-.995l11.698 9.491l9.416 6.396z"
        ></path>
        <path
          fill="#f50100"
          d="m35.323 23.783l-3.588 1.728l-14.286-11.86l-4.236-1.324l-17.445-13.5H.806l17.434 13.18l4.631 1.588z"
        ></path>
        <mask id="flagpackGbUkm1" fill="#fff">
          <path
            fillRule="evenodd"
            d="M19.778-2h-7.556V8H-1.972v8h14.194v10h7.556V16h14.25V8h-14.25z"
            clipRule="evenodd"
          ></path>
        </mask>
        <path
          fill="#f50100"
          fillRule="evenodd"
          d="M19.778-2h-7.556V8H-1.972v8h14.194v10h7.556V16h14.25V8h-14.25z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#fff"
          d="M12.222-2v-2h-2v2zm7.556 0h2v-2h-2zM12.222 8v2h2V8zM-1.972 8V6h-2v2zm0 8h-2v2h2zm14.194 0h2v-2h-2zm0 10h-2v2h2zm7.556 0v2h2v-2zm0-10v-2h-2v2zm14.25 0v2h2v-2zm0-8h2V6h-2zm-14.25 0h-2v2h2zm-7.556-8h7.556v-4h-7.556zm2 8V-2h-4V8zm-16.194 2h14.194V6H-1.972zm2 6V8h-4v8zm12.194-2H-1.972v4h14.194zm2 12V16h-4v10zm5.556-2h-7.556v4h7.556zm-2-8v10h4V16zm16.25-2h-14.25v4h14.25zm-2-6v8h4V8zm-12.25 2h14.25V6h-14.25zm-2-12V8h4V-2z"
          mask="url(#flagpackGbUkm1)"
        ></path>
      </g>
    </g>
  </svg>
);

const arFlag = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
    <path fill="#d22f27" d="M5 17h62v38H5z"></path>
    <path fill="#5c9e31" d="M5 42h62v13H5z"></path>
    <path fill="#fff" d="M5 17h62v13H5z"></path>
    <path fill="#d22f27" d="M5 17h16v38H5z"></path>
    <g
      fill="none"
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
    >
      <path d="M10.5 23.917h5m-2.5 0v-4m4 .166l-4 4s-2 4-5 4"></path>
      <path d="m9 20.083l4 4s2 4 5 4"></path>
    </g>
    <path
      fill="none"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 17h62v38H5z"
    ></path>
  </svg>
);

// Header Content Component (reusable for both headers)
const HeaderContent = ({
  state,
  currentLocale,
  changeLanguage,
  toggleSidebar,
  toggleMenu,
  toggleSubMenu,
  isFixed = false,
}) => {
  const pathname = usePathname();

  return (
    <>
      <div className="company-logo d-lg-flex d-none">
        <Link href="/">
          <img
            style={{
              width: "150px",
              height: "80px",
              objectFit: "contain",
            }}
            src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742474177/logo_qvee2o.png"
            alt=""
          />
        </Link>
      </div>
      <div className={`main-menu ${state.isSidebarOpen ? "show-menu" : ""}`}>
        <div className="mobile-logo-area d-lg-none d-flex justify-content-between align-items-center">
          <div className="mobile-logo-wrap">
            <Link href="/">
              <img alt="image" src="/assets/img/logo.svg" />
            </Link>
          </div>
          <div className="menu-close-btn" onClick={toggleSidebar}>
            <i className="bi bi-x" />
          </div>
        </div>

        <ul
          className="menu-list"
          style={{ color: "white", display: "flex", flexWrap: "nowrap" }}
        >
          {navData.map((data, index) => {
            const { id, label, link, icon, subMenu } = data;
            return (
              <li
                key={id + "-" + index}
                style={{ color: "white" }}
                className={`${icon === true ? "menu-item-has-children" : ""}`}
              >
                <Link
                  href={link}
                  className="drop-down !text-[13.5px]"
                  style={{ color: "white" }}
                >
                  {label}
                </Link>
                {icon && (
                  <i
                    style={{ color: "white" }}
                    onClick={() => toggleMenu(label)}
                    className={`bi bi-chevron-${
                      state.activeMenu === label ? "up" : "down"
                    } dropdown-icon`}
                  />
                )}

                {subMenu && (
                  <ul
                    className={`sub-menu  ${
                      label === "More"
                        ? "bg-white rounded-md shadow-lg p-2 text-gray-800 absolute z-50 "
                        : ""
                    } ${state.activeMenu === label ? "active" : ""}`}
                  >
                    {subMenu.map((subItem) => (
                      <li
                        className={`relative border-b border-gray-100 last:border-0 ${
                          subItem.subMenu
                            ? "before:!content-[''] before:absolute before:top-0 before:-right-5 before:w-[50px] before:h-[45px] before:bg-transparent before:rounded-md before:p-2 before:text-gray-800 before:z50"
                            : ""
                        }`}
                        key={`${id}-${subItem.id}`}
                      >
                        {subItem.subMenu ? (
                          <div
                            className="!text-[13.5px] text-gray-700 hover:text-[#e8a355] !py-0 !px-0 block transition-colors duration-200"
                            onClick={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center justify-between">
                              <div className="cursor-pointer hover:text-[#e8a355] transition-colors duration-200 p-[10px_15px] font-[400] uppercase leading-[1.3]">
                                {subItem.label}
                              </div>
                              {subItem.icon && (
                                <>
                                  <i
                                    className="d-lg-flex p-0 !text-black d-none bi bi-chevron-right dropdown-icon"
                                    style={{
                                      color: "black",
                                      position: "static",
                                    }}
                                  />
                                  <i
                                    onClick={() => toggleSubMenu(subItem.label)}
                                    className={`d-lg-none p-0 d-flex !text-black bi bi-chevron-${
                                      state.activeSubMenu === subItem.label
                                        ? "up"
                                        : "down"
                                    } dropdown-icon`}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Link
                            className="!text-[13.5px] text-gray-700 hover:text-[#e8a355] !py-0 !px-0 block transition-colors duration-200"
                            legacyBehavior
                            href={subItem.link}
                          >
                            <a>
                              <div className="flex items-center justify-between">
                                <div className="cursor-pointer hover:text-[#e8a355] transition-colors duration-200">
                                  {subItem.label}
                                </div>
                                {subItem.icon && (
                                  <i className="d-lg-flex p-0 !text-black d-none bi bi-chevron-right dropdown-icon" />
                                )}
                              </div>
                            </a>
                          </Link>
                        )}

                        {subItem.subMenu && (
                          <ul
                            className={`sub-menu dropdown-menu ${
                              data.label === "More" ? "white-dropdown ml-2" : ""
                            } ${
                              state.activeSubMenu == subItem.label
                                ? "active"
                                : ""
                            }`}
                          >
                            {subItem.subMenu.map((subSubItem) => (
                              <li key={`${subItem.id}-${subSubItem.id}`}>
                                <Link
                                  className="!text-[13.5px]"
                                  legacyBehavior
                                  href={subSubItem.link}
                                >
                                  <a>{subSubItem.label}</a>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="nav-right d-flex jsutify-content-end align-items-center">
        <div className="hotline-area d-xl-flex d-none">
          <div className="drop-down uppercase">
            <a
              href="#"
              className="text-white"
              onClick={(e) => {
                e.preventDefault();
                changeLanguage(currentLocale == "ar" ? "en" : "ar");
              }}
              style={{
                cursor: "pointer",
              }}
            >
              <div className="d-flex align-items-center gap-1">
                <div className="!uppercase ">{currentLocale}</div>
                <div style={{ width: "30px" }}>
                  {currentLocale == "ar" ? arFlag : enFlag}
                </div>
              </div>
            </a>
          </div>
        </div>
        <div className="sidebar-button mobile-menu-btn" onClick={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={25}
            height={25}
            viewBox="0 0 25 25"
          >
            <path d="M0 4.46439C0 4.70119 0.0940685 4.92829 0.261511 5.09574C0.428955 5.26318 0.656057 5.35725 0.892857 5.35725H24.1071C24.3439 5.35725 24.571 5.26318 24.7385 5.09574C24.9059 4.92829 25 4.70119 25 4.46439C25 4.22759 24.9059 4.00049 24.7385 3.83305C24.571 3.6656 24.3439 3.57153 24.1071 3.57153H0.892857C0.656057 3.57153 0.428955 3.6656 0.261511 3.83305C0.0940685 4.00049 0 4.22759 0 4.46439ZM4.46429 11.6072H24.1071C24.3439 11.6072 24.571 11.7013 24.7385 11.8688C24.9059 12.0362 25 12.2633 25 12.5001C25 12.7369 24.9059 12.964 24.7385 13.1315C24.571 13.2989 24.3439 13.393 24.1071 13.393H4.46429C4.22749 13.393 4.00038 13.2989 3.83294 13.1315C3.6655 12.964 3.57143 12.7369 3.57143 12.5001C3.57143 12.2633 3.6655 12.0362 3.83294 11.8688C4.00038 11.7013 4.22749 11.6072 4.46429 11.6072ZM12.5 19.643H24.1071C24.3439 19.643 24.571 19.737 24.7385 19.9045C24.9059 20.0719 25 20.299 25 20.5358C25 20.7726 24.9059 20.9997 24.7385 21.1672C24.571 21.3346 24.3439 21.4287 24.1071 21.4287H12.5C12.2632 21.4287 12.0361 21.3346 11.8687 21.1672C11.7012 20.9997 11.6071 20.7726 11.6071 20.5358C11.6071 20.299 11.7012 20.0719 11.8687 19.9045C12.0361 19.737 12.2632 19.643 12.5 19.643Z" />
          </svg>
        </div>
      </div>
    </>
  );
};

const Header = ({ currentLocale }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const t = useTranslations("packageDetails");
  const headerRef = useRef(null);
  const [favorites, setFavorites] = useState({});
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [lang, setLang] = useState(currentLocale);
  const [, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => {
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
  }, [lang]);

  // Load favorites count from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("tripFavorites");
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      setFavorites(parsedFavorites);
      const count = Object.values(parsedFavorites).filter(Boolean).length;
      setFavoritesCount(count);
    }

    const handleStorageChange = () => {
      const updatedFavorites = localStorage.getItem("tripFavorites");
      if (updatedFavorites) {
        const parsedFavorites = JSON.parse(updatedFavorites);
        setFavorites(parsedFavorites);
        const count = Object.values(parsedFavorites).filter(Boolean).length;
        setFavoritesCount(count);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Handle scroll for fixed header
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      dispatch({ type: "setScrollY", payload: currentScrollY });
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    const { setLanguageValue } = await import(
      "../../../actions/set-language-action"
    );
    startTransition(() => {
      setLanguageValue(newLang);
    });
  };

  const toggleMenu = (menu) => {
    dispatch({ type: "TOGGLE_MENU", menu });
  };

  const toggleRightSidebar = () => {
    dispatch({ type: "TOGGLE_RIGHTSIDEBAR" });
  };

  const toggleSubMenu = (subMenu) => {
    dispatch({ type: "TOGGLE_SUB_MENU", subMenu });
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_MENU", menu: "" });
    dispatch({ type: "TOGGLE_SUB_MENU", subMenu: "" });
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const settings = useMemo(() => {
    return {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 25,
      loop: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".destination-sidebar-next",
        prevEl: ".destination-sidebar-prev",
      },
      breakpoints: {
        280: {
          slidesPerView: 1,
        },
        386: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        992: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1200: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1400: {
          slidesPerView: 2,
        },
      },
    };
  }, []);

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .header-area-fixed {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          transform: translateY(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.3s ease-in-out;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          animation: none;
        }

        .header-area-fixed.show {
          transform: translateY(0);
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .header-area-static {
          position: relative;
          transition: opacity 0.3s ease-in-out;
        }

        @media (max-width: 991px) {
          .header-area-fixed {
            display: none !important;
          }
        }
      `}</style>

      {/* Static Header (Non-Fixed) */}
      <header
        ref={headerRef}
        style={{ background: "#e29b4bdb", color: "white" }}
        className="header-area style-1 header-area-static"
      >
        <HeaderContent
          state={state}
          currentLocale={currentLocale}
          changeLanguage={changeLanguage}
          toggleSidebar={toggleSidebar}
          toggleMenu={toggleMenu}
          toggleSubMenu={toggleSubMenu}
          isFixed={false}
        />
      </header>

      {/* Fixed Header (Appears on Scroll) */}
      <header
        style={{ background: "#e29b4bdb", color: "white" }}
        className={`header-area style-1 header-area-fixed ${
          state.showFixedHeader ? "show" : ""
        }`}
      >
        <HeaderContent
          state={state}
          currentLocale={currentLocale}
          changeLanguage={changeLanguage}
          toggleSidebar={toggleSidebar}
          toggleMenu={toggleMenu}
          toggleSubMenu={toggleSubMenu}
          isFixed={true}
        />
      </header>

      {/* Right Sidebar Menu */}
      <div
        className={`right-sidebar-menu ${
          state.isRightSidebar ? "show-right-menu" : ""
        }`}
      >
        <div className="sidebar-logo-area d-flex justify-content-between align-items-center">
          <div className="sidebar-logo-wrap">
            <Link href="/">
              <img alt="image" src="/assets/img/logo.svg" />
            </Link>
          </div>
          <div className="right-sidebar-close-btn" onClick={toggleRightSidebar}>
            <i className="bi bi-x" />
          </div>
        </div>
        <div className="sidebar-content-wrap">
          <div className="category-wrapper">
            <h4>Tour Type</h4>
            <ul className="category-list">
              <li>
                <Link
                  href="/activities/activities-details"
                  className="single-category"
                >
                  <div className="icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={45}
                      height={45}
                      viewBox="0 0 45 45"
                    >
                      <path d="M3.93643 16.3241C4.00671 17.5515 4.30556 18.6997 4.77828 19.5571C5.02773 20.0212 5.40094 20.4071 5.85647 20.6719C6.312 20.9368 6.83202 21.0701 7.35878 21.0572C7.33376 22.4024 7.27767 24.5653 7.15735 26.4887C6.72484 26.652 6.34999 26.939 6.07956 27.314C5.80914 27.6889 5.65512 28.1352 5.63671 28.5972C5.57781 30.0055 5.58315 32.0284 5.9333 33.7261C5.66701 34.0651 5.5243 34.4848 5.52875 34.9159C5.5332 35.3469 5.68453 35.7636 5.95776 36.097L7.56021 38.0377L6.50386 39.0677C6.44983 39.1204 6.40894 39.185 6.38448 39.2564C6.36001 39.3278 6.35266 39.4039 6.36302 39.4787C6.37337 39.5534 6.40114 39.6247 6.44409 39.6868C6.48703 39.7488 6.54395 39.7999 6.61027 39.8359L11.6053 42.5457C11.6053 42.5457 11.7 45 13.8244 45H27.1071C27.9756 45 28.6823 44.2103 28.6823 43.2396V42.4909C28.685 42.0612 28.5396 41.6436 28.2707 41.3085C28.4777 41.1486 28.6626 40.9618 28.8203 40.7531C29.0565 40.4283 29.1984 40.0447 29.2305 39.6444C29.2626 39.2441 29.1835 38.8427 29.002 38.4845L28.8029 38.0864C28.6263 37.7328 28.5342 37.3431 28.5338 36.9479V32.5047C29.0645 32.1647 30.171 31.2434 30.4421 29.3489C30.5056 28.88 30.5105 28.4051 30.4569 27.9349C30.2858 26.295 29.6697 22.483 27.548 19.891L32.3244 19.2106L33.448 24.9839L31.2736 25.9763C31.2156 26.0023 31.1633 26.0395 31.1197 26.0858C31.0762 26.132 31.0422 26.1865 31.0198 26.2459C30.9973 26.3054 30.9869 26.3687 30.989 26.4322C30.9912 26.4957 31.0059 26.5582 31.0323 26.616C31.0587 26.6738 31.0962 26.7258 31.1428 26.769C31.1894 26.8123 31.2441 26.8458 31.3037 26.8679C31.3633 26.8899 31.4267 26.8999 31.4902 26.8973C31.5537 26.8947 31.616 26.8795 31.6736 26.8527L34.1933 25.7028C34.2917 25.6579 34.3721 25.5812 34.4216 25.485C34.4711 25.3888 34.4868 25.2787 34.4661 25.1726L34.3407 24.5279L40.8523 20.6265C40.9498 20.5681 41.0236 20.477 41.0604 20.3694C41.0972 20.2618 41.0948 20.1447 41.0536 20.0387C39.4281 15.8626 36.7774 12.2463 35.6522 10.8137L36.673 10.0753C36.7263 10.0366 36.7712 9.98749 36.8048 9.93084C36.8384 9.87419 36.86 9.81125 36.8684 9.74591C36.8767 9.68057 36.8715 9.61422 36.8532 9.55096C36.8349 9.48769 36.8038 9.42885 36.7618 9.37808C35.3202 7.63422 33.5253 6.61316 32.2736 6.06369C31.592 5.7654 30.8667 5.57941 30.1257 5.51295C30.2741 4.98324 30.3517 4.43625 30.3567 3.88619C30.358 3.81723 30.3444 3.74881 30.317 3.68553C30.2896 3.62225 30.2489 3.5656 30.1977 3.51941C30.1465 3.47322 30.0859 3.43857 30.0202 3.41779C29.9544 3.39702 29.8849 3.3906 29.8165 3.39899L29.1662 3.47855C29.5722 2.45795 29.5643 1.31926 29.144 0.304443C29.1121 0.224182 29.0593 0.153946 28.991 0.101062C28.9228 0.0481787 28.8416 0.0145854 28.7559 0.00378731C28.6702 -0.00701079 28.5832 0.00538206 28.5039 0.0396728C28.4247 0.0739635 28.3561 0.128895 28.3053 0.198738C28.2957 0.21181 27.3365 1.50094 25.2346 2.03747C24.5378 2.20734 23.8165 2.25335 23.1038 2.1734C21.9304 2.04846 20.7441 2.14342 19.6055 2.45341C16.8062 3.25097 15.015 5.96346 15.439 8.76282C15.6163 9.94374 16.1804 11.0325 17.0429 11.8584C17.0151 12.3055 17.0655 12.7541 17.1919 13.1839C17.4966 14.4327 18.4365 14.8382 19.1717 14.9034V19.7878L17.4644 20.083C17.2493 19.8661 16.9587 19.7408 16.6534 19.7332C16.4539 19.7287 16.2543 19.7388 16.0563 19.7636C16.408 17.5427 16.1854 15.2687 15.4097 13.1582C15.5418 13.1722 15.6732 13.1863 15.8077 13.2003C15.8245 13.2021 15.8414 13.203 15.8583 13.203C15.9816 13.2027 16.1 13.1551 16.1893 13.0701C16.2785 12.9851 16.3318 12.8691 16.3381 12.746C16.3444 12.6229 16.3033 12.5021 16.2233 12.4083C16.1432 12.3146 16.0303 12.2552 15.9077 12.2422C15.5948 12.2095 15.282 12.1754 14.9694 12.14C14.8384 11.8826 14.6484 11.6599 14.415 11.4899C14.1815 11.32 13.9111 11.2076 13.6259 11.1621L12.2905 10.9502C12.0714 10.9141 11.8465 10.9374 11.6395 11.0178C11.4324 11.0981 11.2507 11.2325 11.1133 11.407C11.0614 11.4732 11.0163 11.5443 10.9785 11.6194C10.7469 11.5851 10.5154 11.5498 10.2841 11.5137C9.83896 11.4403 9.39859 11.3405 8.9653 11.2148C7.5082 10.8096 6.42992 11.2252 6.10718 11.3771C5.40436 11.4683 4.8026 12.0449 4.40381 13.0162C4.13295 13.7151 3.97632 14.453 3.93995 15.2017V15.2041C3.90584 15.484 3.90112 15.7666 3.92589 16.0475C3.93039 16.1394 3.93109 16.2308 3.93643 16.3241ZM12.2403 20.7187C12.3606 20.9261 12.5268 21.1031 12.7262 21.2362C12.9255 21.3693 13.1527 21.455 13.3903 21.4867L14.1011 21.582L14.1115 21.7787L11.4698 24.7527C11.4802 23.4054 11.4073 22.0587 11.2513 20.7204C11.582 20.7068 11.9117 20.7063 12.2403 20.7187ZM21.7201 44.0367H15.9389V42.4357C15.9384 42.1871 15.9176 41.9389 15.8765 41.6938H21.7201V44.0367ZM10.2336 27.5948L14.1776 23.155C14.278 25.4451 14.3914 29.0869 14.2397 31.4921L13.6494 31.978L10.2336 27.5948ZM13.8998 33.0186L14.3305 32.6646C14.4238 33.071 14.651 33.4343 14.9756 33.6962V39.6349C14.0585 38.3382 12.775 36.6989 11.4513 35.564L13.8998 33.0186ZM10.29 20.7958C10.5149 22.518 10.5263 24.4613 10.4921 25.8532L10.0652 26.3338H8.13189C8.24434 24.4373 8.29832 22.3551 8.32235 21.0522C8.72555 21.0268 9.12699 20.9787 9.52475 20.9079C9.77936 20.8627 10.0344 20.8253 10.29 20.7958ZM6.59916 28.6368C6.61364 28.2759 6.76743 27.9347 7.02822 27.6849C7.28901 27.4351 7.6365 27.296 7.99765 27.2971H9.21564C9.15562 27.3812 9.12432 27.4824 9.12639 27.5857C9.12847 27.689 9.16381 27.7889 9.22717 27.8706L9.90709 28.7433L6.7386 32.7154C6.57724 31.3622 6.53059 29.9978 6.59916 28.6368ZM6.70051 35.483C6.5665 35.3193 6.49248 35.1147 6.49072 34.9031C6.48895 34.6916 6.55955 34.4858 6.69081 34.3198L10.516 29.5249L12.936 32.6314L8.25179 37.3621L6.70051 35.483ZM12.5678 42.7809V42.2591C12.5679 42.1724 12.5445 42.0873 12.5001 42.0128C12.4558 41.9383 12.3922 41.8771 12.316 41.8357L7.64398 39.3002L10.7725 36.25C12.1861 37.447 13.5919 39.3331 14.3346 40.3983C14.7526 40.9957 14.9765 41.7074 14.9756 42.4365V44.0376H13.823C13.49 44.037 13.1708 43.9044 12.9355 43.6688C12.7002 43.4332 12.568 43.1139 12.5678 42.7809ZM22.6834 41.6938H25.2079V44.0367H22.6834V41.6938ZM27.7183 43.24C27.7183 43.6721 27.438 44.0371 27.1064 44.0371H26.1712V41.6938H27.1064C27.438 41.6938 27.7183 42.0592 27.7183 42.4909V43.24ZM29.4878 29.213C29.396 29.9998 29.048 30.7347 28.4974 31.3043C28.1535 25.7715 25.5834 21.1427 24.8474 19.9201C25.0661 19.7317 25.3404 19.62 25.6285 19.602C25.7168 19.5944 25.8056 19.6055 25.8894 19.6344C25.9731 19.6634 26.0499 19.7095 26.1147 19.7699C28.7011 22.1406 29.3584 26.6956 29.4981 28.0352C29.5433 28.4265 29.5399 28.822 29.4878 29.2125V29.213ZM23.7521 22.203L23.7186 22.2274C23.2713 22.5546 22.9613 23.0361 22.8485 23.5787L22.5501 24.9502L22.1749 22.9698C22.1619 22.9011 22.1341 22.8361 22.0934 22.7792C22.0528 22.7224 22.0002 22.6751 21.9395 22.6406C20.5633 21.8596 20.2021 20.9893 20.135 20.791V16.6603C21.1952 17.2749 22.3436 17.7229 23.54 17.9884C23.4632 18.8079 23.5512 19.4906 23.7982 20.0311C23.8087 20.0614 23.8221 20.0905 23.8384 20.1181C23.8944 20.2322 23.9595 20.3417 24.0331 20.4453C24.0488 20.4669 24.0622 20.4893 24.0761 20.5114L24.1229 20.5915C24.2629 20.8603 24.3025 21.1701 24.2345 21.4654C24.1666 21.7607 23.9955 22.0221 23.7521 22.2026V22.203ZM33.3376 18.0935L32.6413 18.1928L29.3425 18.6626C29.7361 15.5369 28.3039 13.6271 27.7142 12.9892L27.891 9.62674C31.3256 12.0217 32.9961 17.1759 33.3376 18.0931V18.0935ZM27.223 15.8417C27.3904 15.3813 27.5132 14.9058 27.5899 14.422C28.1229 15.296 28.6758 16.7569 28.35 18.8041L26.735 19.0342C26.5725 18.8915 26.3827 18.7833 26.1771 18.716C25.9716 18.6488 25.7545 18.6239 25.5391 18.6429C25.171 18.6735 24.8152 18.7901 24.5004 18.9833C24.4694 18.7056 24.4666 18.4254 24.492 18.1471C24.5259 18.1485 24.5599 18.1516 24.5936 18.1516C25.0038 18.1533 25.4077 18.0509 25.7675 17.854C26.1273 17.6571 26.4313 17.3722 26.6509 17.0258C26.8829 16.6523 27.0746 16.2552 27.2228 15.8413L27.223 15.8417ZM40.0051 20.0113L34.1445 23.5227L33.279 19.075L34.0609 18.9636L35.6705 18.7344C35.7336 18.7261 35.7946 18.7054 35.8497 18.6734C35.9048 18.6414 35.953 18.5988 35.9915 18.5481C36.0301 18.4973 36.0581 18.4394 36.0742 18.3778C36.0902 18.3161 36.0938 18.2519 36.0848 18.1888C36.0758 18.1257 36.0544 18.065 36.0218 18.0103C35.9892 17.9555 35.946 17.9078 35.8949 17.8698C35.8437 17.8319 35.7855 17.8045 35.7236 17.7891C35.6618 17.7738 35.5975 17.7709 35.5345 17.7806L34.3134 17.9547C33.7234 16.3494 33.0507 14.7758 32.298 13.2401L34.8704 11.3792C35.9184 12.7096 38.4032 16.0814 40.0048 20.0109L40.0051 20.0113ZM35.6802 9.60396L31.7793 12.4257C30.9508 11.357 30.0666 10.3327 29.1302 9.35713C28.8328 9.05673 28.4789 8.81804 28.089 8.65478C27.699 8.49152 27.2806 8.4069 26.8579 8.40579H26.5745C26.2185 8.40541 25.8771 8.26382 25.6254 8.01207C25.3736 7.76032 25.232 7.41899 25.2317 7.06297C25.2318 6.8988 25.2971 6.74142 25.4132 6.62534C25.5293 6.50926 25.6867 6.44396 25.8509 6.44377H29.4526C30.2896 6.43975 31.1183 6.61052 31.8856 6.94517C33.3184 7.56365 34.6097 8.46843 35.6802 9.60396ZM18.1243 12.9415C18.1205 12.9259 18.1161 12.9105 18.1109 12.8953C18.0084 12.5403 17.975 12.169 18.0125 11.8014C18.0241 11.6327 18.0954 11.4736 18.2136 11.3526C18.3317 11.2315 18.489 11.1565 18.6574 11.1408C18.819 11.1145 18.9847 11.1466 19.1248 11.2313C19.2649 11.316 19.3703 11.4478 19.4221 11.6031C19.4639 11.7185 19.4968 11.8369 19.5205 11.9573C19.5351 12.0306 19.5666 12.0994 19.6125 12.1584C19.6583 12.2174 19.7173 12.2649 19.7847 12.2971C19.852 12.3294 19.926 12.3456 20.0007 12.3443C20.0754 12.3431 20.1488 12.3245 20.215 12.29C20.3408 12.221 20.4605 12.1414 20.5726 12.0519C20.9409 11.7584 21.2381 11.3853 21.4419 10.9608C21.6457 10.5362 21.7509 10.071 21.7496 9.60003V9.24904C21.7496 9.05908 21.7882 8.87111 21.863 8.69651C21.9378 8.5219 22.0473 8.36429 22.1848 8.23321C22.3222 8.10213 22.4849 8.0003 22.6629 7.9339C22.8408 7.8675 23.0304 7.8379 23.2202 7.8469C23.2837 7.85046 23.3472 7.84141 23.4072 7.82027C23.4672 7.79913 23.5224 7.76632 23.5697 7.72374C23.6169 7.68115 23.6552 7.62964 23.6825 7.57216C23.7097 7.51468 23.7253 7.45238 23.7283 7.38885C23.7313 7.32532 23.7217 7.26182 23.7001 7.20201C23.6785 7.14221 23.6452 7.08728 23.6022 7.0404C23.5592 6.99352 23.5074 6.95562 23.4497 6.92887C23.392 6.90213 23.3295 6.88708 23.266 6.88459C22.9461 6.86943 22.6264 6.91935 22.3263 7.03134C22.0263 7.14333 21.7521 7.31505 21.5203 7.5361C21.2885 7.75715 21.104 8.02294 20.978 8.31737C20.8519 8.61181 20.787 8.92876 20.787 9.24904V9.59961C20.7884 10.1374 20.591 10.6568 20.2327 11.058C20.0754 10.7545 19.8276 10.5075 19.5236 10.3512C19.2197 10.1948 18.8746 10.1369 18.5363 10.1853C18.314 10.2113 18.0992 10.2813 17.9042 10.391C17.7093 10.5008 17.5381 10.6482 17.4006 10.8248C16.864 10.1989 16.5143 9.43458 16.3915 8.6193C16.0401 6.29773 17.5353 4.04559 19.8701 3.38043C20.8918 3.10702 21.9549 3.02293 23.0069 3.13234C23.8322 3.22397 24.6671 3.16949 25.4734 2.97139C26.5777 2.70144 27.6015 2.17178 28.4597 1.42644C28.5282 1.8326 28.5157 2.24829 28.4231 2.64963C28.3305 3.05098 28.1595 3.43007 27.92 3.76516C27.8587 3.8395 27.8212 3.93049 27.8121 4.0264C27.8031 4.1223 27.823 4.2187 27.8694 4.30316C27.9157 4.38761 27.9863 4.45624 28.072 4.50018C28.1577 4.54412 28.2546 4.56136 28.3502 4.54966L29.3596 4.4261C29.3236 4.78623 29.2438 5.14063 29.1221 5.48146H25.8509C25.4313 5.48195 25.029 5.64885 24.7323 5.94555C24.4357 6.24225 24.2688 6.64451 24.2684 7.06409C24.2692 7.67542 24.5124 8.26147 24.9447 8.69371C25.3771 9.12594 25.9632 9.36908 26.5745 9.36978C26.5745 9.36978 26.9118 9.37288 26.94 9.37386L26.7256 13.449C26.693 14.1525 26.5557 14.8472 26.3179 15.5101C26.1931 15.8596 26.0317 16.1949 25.8364 16.5104C25.6778 16.7576 25.449 16.9518 25.1794 17.0683C24.9097 17.1848 24.6115 17.2181 24.3228 17.1641C22.9663 16.9329 21.6644 16.4525 20.4829 15.7471C20.3771 15.6821 20.2897 15.5912 20.2287 15.4829C20.1678 15.3747 20.1355 15.2528 20.1348 15.1286V14.4117C20.1344 14.3425 20.1191 14.2742 20.0901 14.2114C20.061 14.1486 20.0189 14.0927 19.9664 14.0476C19.9139 14.0025 19.8524 13.9691 19.786 13.9498C19.7195 13.9304 19.6497 13.9256 19.5812 13.9355C19.3844 13.9651 18.3868 14.0502 18.1243 12.9415ZM19.1843 20.9678C19.1972 21.0231 19.5104 22.2891 21.2691 23.3624L22.0439 27.4541C22.0646 27.5632 22.1224 27.6619 22.2075 27.7333C22.2925 27.8047 22.3997 27.8446 22.5107 27.8461H22.5173C22.6273 27.8461 22.734 27.8084 22.8196 27.7394C22.9052 27.6703 22.9646 27.5741 22.988 27.4666L23.7892 23.7821C23.8516 23.4725 24.0264 23.1971 24.28 23.009L24.326 22.9752C24.5986 22.7719 24.8211 22.5088 24.9763 22.2062C26.0475 24.4131 27.504 28.1447 27.5691 32.2296V36.9479C27.5698 37.4926 27.6967 38.0298 27.9399 38.5173L28.1393 38.9152C28.2414 39.1133 28.287 39.3357 28.2709 39.5579C28.2548 39.7802 28.1777 39.9937 28.048 40.175C27.8725 40.4021 27.6525 40.591 27.4014 40.73H15.9389V33.62C16.5935 32.9131 18.6659 29.9202 17.8272 20.9972L19.1717 20.7651C19.1717 20.7651 19.176 20.9327 19.1843 20.9678ZM16.8509 20.9061C17.6319 28.9077 16.0293 31.9141 15.4002 32.7606C15.2071 32.4595 15.1772 31.9581 15.1863 31.7656C15.4084 28.6823 15.1703 23.5145 15.0574 21.4365C15.0498 21.3294 15.0759 21.2226 15.1321 21.1311C15.1883 21.0397 15.2718 20.9681 15.3707 20.9265C15.7706 20.7647 16.1991 20.686 16.6303 20.6951C16.6867 20.6973 16.7403 20.72 16.7811 20.759C16.8218 20.798 16.8469 20.8506 16.8514 20.9068L16.8509 20.9061ZM11.8667 12.0079C11.8985 11.9671 11.9408 11.9357 11.989 11.917C12.0372 11.8982 12.0895 11.8929 12.1405 11.9015L13.4752 12.1135C13.6137 12.1353 13.7449 12.1904 13.8575 12.274C13.9701 12.3575 14.0608 12.4671 14.1218 12.5934C15.5591 15.5742 15.3269 18.4808 15.0346 20.0251C15.0276 20.0279 15.0206 20.0301 15.0135 20.0329C14.7182 20.1516 14.47 20.364 14.3071 20.6374L13.5185 20.5315C13.3593 20.5102 13.2149 20.4269 13.1166 20.2998C13.0184 20.1727 12.9742 20.012 12.9936 19.8526C13.364 16.7362 12.4201 13.7783 11.8245 12.2926C11.8053 12.2457 11.799 12.1945 11.8064 12.1444C11.8139 12.0943 11.8347 12.0472 11.8667 12.0079ZM8.70764 12.1429C9.1769 12.2789 9.65384 12.3868 10.1359 12.4662C10.3566 12.5007 10.616 12.5404 10.9078 12.5835C10.9154 12.6063 10.9211 12.6295 10.9301 12.652C11.4915 14.0526 12.3819 16.8358 12.0367 19.74C12.0367 19.7432 12.0367 19.7463 12.0359 19.7495C11.138 19.7323 10.2405 19.803 9.35635 19.9604C8.96698 20.0301 8.57368 20.0758 8.17869 20.0972C8.80266 19.2101 9.14578 17.74 9.04809 16.0329C8.94688 14.2631 8.40416 12.7999 7.64089 12.0069C8.00124 11.9991 8.36076 12.045 8.70764 12.1429ZM5.29542 13.3821C5.55842 12.7417 5.92346 12.3475 6.27207 12.3278C6.28205 12.3278 6.29189 12.327 6.30187 12.327C7.04897 12.327 7.96208 13.9124 8.08705 16.0871C8.21285 18.2909 7.46547 19.9857 6.71302 20.0287C6.36371 20.0498 5.95678 19.6985 5.62237 19.0923C5.5528 18.9636 5.48942 18.8317 5.43247 18.697C5.61378 18.7746 5.8089 18.8147 6.00612 18.8151C6.15959 18.8147 6.31211 18.791 6.45846 18.7448C6.71181 18.6675 6.93981 18.5238 7.11873 18.3285C7.29764 18.1332 7.42092 17.8935 7.47573 17.6343C7.56154 17.2149 7.58991 16.7859 7.56007 16.3588C7.54373 15.9707 7.43687 15.5919 7.24801 15.2524C6.95887 14.7488 6.54771 14.4554 6.05869 14.4041C5.99533 14.3966 5.93112 14.4018 5.86978 14.4193C5.80843 14.4368 5.75118 14.4664 5.70135 14.5062C5.65151 14.546 5.61008 14.5954 5.57947 14.6513C5.54885 14.7073 5.52966 14.7688 5.523 14.8323C5.51635 14.8957 5.52236 14.9598 5.5407 15.0209C5.55903 15.0821 5.58932 15.1389 5.6298 15.1882C5.67029 15.2375 5.72017 15.2783 5.77654 15.3082C5.83291 15.338 5.89465 15.3564 5.95818 15.3622C6.12897 15.3801 6.28148 15.5046 6.41249 15.7319C6.52653 15.942 6.59015 16.1757 6.59832 16.4146C6.62308 16.7538 6.60171 17.0948 6.53478 17.4283C6.51471 17.5205 6.47056 17.6057 6.40682 17.6754C6.34309 17.745 6.26204 17.7965 6.17193 17.8246C6.08183 17.8527 5.98589 17.8564 5.89387 17.8354C5.80185 17.8144 5.71705 17.7693 5.6481 17.7049C5.08851 17.1828 4.92643 16.4586 4.88792 15.9499C4.85131 15.0754 4.98985 14.2023 5.29542 13.3821Z" />
                    </svg>
                  </div>
                  <h6>Adventure</h6>
                </Link>
              </li>
              {/* Add more category items as needed */}
            </ul>
          </div>
          <div className="destination-wrapper">
            <h4>Our Destinations</h4>
            <div className="row">
              <div className="col-lg-12">
                <Swiper
                  {...settings}
                  className="swiper destination-sidebar-slider mb-35"
                >
                  <div className="swiper-wrapper">
                    {destinaiton_sidebar_data.map((data, index) => {
                      const { id, img, tour_palce, tour_type, place } = data;
                      return (
                        <SwiperSlide
                          style={{ height: "240px", width: "230px" }}
                          key={index}
                          className="swiper-slide"
                        >
                          <div
                            className="destination-card2"
                            style={{ height: "240px", width: "230px" }}
                          >
                            <Link
                              href="/destination/destination-details"
                              className="destination-card-img"
                            >
                              <img
                                src={img}
                                alt=""
                                style={{ height: "240px", width: "230px" }}
                              />
                            </Link>
                            <div className="batch">
                              <span>{tour_palce} Tour</span>
                            </div>
                            <div className="destination-card2-content">
                              <span>{tour_type}</span>
                              <h4>
                                <Link href="/destination/destination-details">
                                  {place}
                                </Link>
                              </h4>
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </div>
                </Swiper>
                <div className="slide-and-view-btn-grp">
                  <div className="destination-sidebar-prev">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={53}
                      height={13}
                      viewBox="0 0 53 13"
                    >
                      <path d="M53 6.5L1 6.5M1 6.5L7 12M1 6.5L7 0.999996" />
                    </svg>
                  </div>
                  <Link href="destination/style2" className="secondary-btn2">
                    View All
                  </Link>
                  <div className="destination-sidebar-next">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={53}
                      height={13}
                      viewBox="0 0 53 13"
                    >
                      <path d="M0 6.5H52M52 6.5L46 1M52 6.5L46 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="hotline-area">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={28}
                height={28}
                viewBox="0 0 28 28"
              >
                <path d="M27.2653 21.5995L21.598 17.8201C20.8788 17.3443 19.9147 17.5009 19.383 18.1798L17.7322 20.3024C17.6296 20.4377 17.4816 20.5314 17.3154 20.5664C17.1492 20.6014 16.9759 20.5752 16.8275 20.4928L16.5134 20.3196C15.4725 19.7522 14.1772 19.0458 11.5675 16.4352C8.95784 13.8246 8.25001 12.5284 7.6826 11.4893L7.51042 11.1753C7.42683 11.0269 7.39968 10.8532 7.43398 10.6864C7.46827 10.5195 7.56169 10.3707 7.69704 10.2673L9.81816 8.61693C10.4968 8.08517 10.6536 7.1214 10.1784 6.40198L6.39895 0.734676C5.91192 0.00208106 4.9348 -0.21784 4.18082 0.235398L1.81096 1.65898C1.06634 2.09672 0.520053 2.80571 0.286612 3.63733C-0.56677 6.74673 0.0752209 12.1131 7.98033 20.0191C14.2687 26.307 18.9501 27.9979 22.1677 27.9979C22.9083 28.0011 23.6459 27.9048 24.3608 27.7115C25.1925 27.4783 25.9016 26.932 26.3391 26.1871L27.7641 23.8187C28.218 23.0645 27.9982 22.0868 27.2653 21.5995ZM26.9601 23.3399L25.5384 25.7098C25.2242 26.2474 24.7142 26.6427 24.1152 26.8128C21.2447 27.6009 16.2298 26.9482 8.64053 19.3589C1.0513 11.7697 0.398595 6.75515 1.18669 3.88421C1.35709 3.28446 1.75283 2.77385 2.2911 2.45921L4.66096 1.03749C4.98811 0.840645 5.41221 0.93606 5.62354 1.25397L7.67659 4.3363L9.39976 6.92078C9.60612 7.23283 9.53831 7.65108 9.24392 7.88199L7.1223 9.53232C6.47665 10.026 6.29227 10.9193 6.68979 11.6283L6.85826 11.9344C7.45459 13.0281 8.19599 14.3887 10.9027 17.095C13.6095 19.8012 14.9696 20.5427 16.0628 21.139L16.3694 21.3079C17.0783 21.7053 17.9716 21.521 18.4653 20.8753L20.1157 18.7537C20.3466 18.4595 20.7647 18.3918 21.0769 18.5979L26.7437 22.3773C27.0618 22.5885 27.1572 23.0128 26.9601 23.3399ZM15.8658 4.66809C20.2446 4.67296 23.7931 8.22149 23.798 12.6003C23.798 12.858 24.0069 13.0669 24.2646 13.0669C24.5223 13.0669 24.7312 12.858 24.7312 12.6003C24.7257 7.7063 20.7598 3.74029 15.8658 3.73494C15.6081 3.73494 15.3992 3.94381 15.3992 4.20151C15.3992 4.45922 15.6081 4.66809 15.8658 4.66809Z" />
                <path d="M15.865 7.46746C18.6983 7.4708 20.9943 9.76678 20.9976 12.6001C20.9976 12.7238 21.0468 12.8425 21.1343 12.93C21.2218 13.0175 21.3404 13.0666 21.4642 13.0666C21.5879 13.0666 21.7066 13.0175 21.7941 12.93C21.8816 12.8425 21.9308 12.7238 21.9308 12.6001C21.9269 9.2516 19.2134 6.53813 15.865 6.5343C15.6073 6.5343 15.3984 6.74318 15.3984 7.00088C15.3984 7.25859 15.6073 7.46746 15.865 7.46746Z" />
                <path d="M15.865 10.267C17.1528 10.2686 18.1964 11.3122 18.198 12.6C18.198 12.7238 18.2472 12.8424 18.3347 12.9299C18.4222 13.0174 18.5409 13.0666 18.6646 13.0666C18.7883 13.0666 18.907 13.0174 18.9945 12.9299C19.082 12.8424 19.1312 12.7238 19.1312 12.6C19.1291 10.797 17.668 9.33589 15.865 9.33386C15.6073 9.33386 15.3984 9.54274 15.3984 9.80044C15.3984 10.0581 15.6073 10.267 15.865 10.267Z" />
              </svg>
            </div>
            <div className="content">
              <span>{t("title")}</span>
              <h6>
                <a href="tel:+990737621432">+990-737 621 432</a>
              </h6>
            </div>
          </div>
          <div className="email-area">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={27}
                height={27}
                viewBox="0 0 27 27"
              >
                <g clipPath="url(#clip0_2102_235)">
                  <path d="M9.84668 19.8136V25.0313C9.84754 25.2087 9.90418 25.3812 10.0086 25.5246C10.1129 25.6679 10.2598 25.7748 10.4283 25.8301C10.5968 25.8853 10.7784 25.8861 10.9474 25.8324C11.1164 25.7787 11.2642 25.6732 11.3699 25.5308L14.4221 21.3773L9.84668 19.8136ZM26.6486 0.156459C26.5218 0.0661815 26.3725 0.0127263 26.2173 0.00200482C26.062 -0.00871662 25.9068 0.0237135 25.7688 0.0957086L0.456308 13.3145C0.310668 13.3914 0.190668 13.5092 0.111035 13.6535C0.0314025 13.7977 -0.00439878 13.962 0.00802526 14.1262C0.0204493 14.2905 0.0805582 14.4475 0.180975 14.5781C0.281392 14.7087 0.417748 14.8071 0.573308 14.8613L7.61018 17.2666L22.5963 4.45283L10.9998 18.4242L22.7932 22.4551C22.9102 22.4944 23.0344 22.5077 23.1571 22.4939C23.2798 22.4802 23.398 22.4399 23.5034 22.3757C23.6089 22.3115 23.699 22.225 23.7676 22.1223C23.8361 22.0196 23.8814 21.9032 23.9002 21.7812L26.9939 0.968709C27.0168 0.81464 26.9967 0.657239 26.9357 0.513898C26.8748 0.370556 26.7754 0.246854 26.6486 0.156459Z" />
                </g>
              </svg>
            </div>
            <div className="content">
              <span>Email:</span>
              <h6>
                <a href="mailto:info@gmail.com">info@gmail.com</a>
              </h6>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
