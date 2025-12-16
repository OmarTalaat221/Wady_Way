// components/MobileHeader.jsx
"use client";
import Link from "next/link";
import navData from "../../data/nav.json";
import { useState, useEffect, useTransition } from "react";
import { usePathname } from "next/navigation";
import "./MobileHeader.css";

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

const MobileHeader = ({ currentLocale }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setExpandedMenus({});
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSubMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const changeLanguage = async (newLang) => {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
    const { setLanguageValue } = await import(
      "../../../actions/set-language-action"
    );
    startTransition(() => {
      setLanguageValue(newLang);
    });
  };

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <header className={`mobile-header ${scrolled ? "scrolled" : ""}`}>
        <div className="mobile-header-container">
          {/* Logo */}
          <Link href="/" className="mobile-logo">
            <img
              src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742474177/logo_qvee2o.png"
              alt="Logo"
            />
          </Link>

          {/* Right Section */}
          <div className="mobile-header-right">
            {/* Language Switcher */}
            {/* <button
              className="lang-toggle"
              onClick={() =>
                changeLanguage(currentLocale === "ar" ? "en" : "ar")
              }
            >
              <span className="lang-flag">
                {currentLocale === "ar" ? arFlag : enFlag}
              </span>
            </button> */}

            {/* Hamburger Menu Button */}
            <button
              className={`hamburger-btn ${isMenuOpen ? "active" : ""}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide-out Menu */}
      <nav className={`mobile-nav ${isMenuOpen ? "active" : ""}`}>
        {/* Menu Header */}
        <div className="mobile-nav-header">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <img
              src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742474177/logo_qvee2o.png"
              alt="Logo"
            />
          </Link>
          <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Menu Content */}
        <div className="mobile-nav-content">
          <ul className="nav-list">
            {navData.map((item, index) => (
              <li
                key={item.id}
                className="nav-item"
                // style={{ animationDelay: `${index * 0.05}s` }}
              >
                {item.subMenu ? (
                  <>
                    <div
                      className={`nav-link has-children ${
                        expandedMenus[item.id] ? "active" : ""
                      }`}
                      onClick={() => toggleSubMenu(item.id)}
                    >
                      <span>{item.label}</span>
                      <svg
                        className={`arrow ${
                          expandedMenus[item.id] ? "rotate" : ""
                        }`}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>

                    <ul
                      className={`sub-nav ${
                        expandedMenus[item.id] ? "open" : ""
                      }`}
                    >
                      {item.subMenu.map((subItem) => (
                        <li key={subItem.id} className="sub-nav-item">
                          {subItem.subMenu ? (
                            <>
                              <div
                                className={`sub-nav-link has-children ${
                                  expandedMenus[subItem.id] ? "active" : ""
                                }`}
                                onClick={() => toggleSubMenu(subItem.id)}
                              >
                                <span>{subItem.label}</span>
                                <svg
                                  className={`arrow ${
                                    expandedMenus[subItem.id] ? "rotate" : ""
                                  }`}
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </div>

                              <ul
                                className={`nested-nav ${
                                  expandedMenus[subItem.id] ? "open" : ""
                                }`}
                              >
                                {subItem.subMenu.map((nestedItem) => (
                                  <li
                                    key={nestedItem.id}
                                    className="nested-nav-item"
                                  >
                                    <Link
                                      href={nestedItem.link}
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      {nestedItem.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <Link
                              href={subItem.link}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={item.link}
                    className="nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Menu Footer */}
        <div className="mobile-nav-footer">
          <a href="tel:+990737621432" className="footer-contact">
            <div className="icon-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <span>+990-737 621 432</span>
          </a>

          <a href="mailto:info@gmail.com" className="footer-contact">
            <div className="icon-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <span>info@gmail.com</span>
          </a>

          <div className="social-icons">
            <a href="#" className="social-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      <style jsx>{``}</style>
    </>
  );
};

export default MobileHeader;
