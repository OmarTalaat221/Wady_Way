// Newslatter.jsx (Newsletter)
"use client";

import React, { useState, useCallback, memo } from "react";
import Image from "next/image";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";

// Try to import useLocale, fallback if not available
let useLocale;
try {
  useLocale = require("next-intl").useLocale;
} catch {
  useLocale = () => "en";
}

// ─── Arrow Icon (memo'd) ───
const ArrowIcon = memo(({ isRTL }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 17"
    className={`stroke-[--white-color] w-4 h-[15px] sm:w-[18px] sm:h-[17px] ${isRTL ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <path d="M7 1L16 8.5M16 8.5L7 16M16 8.5H0.5" strokeWidth="1.5" />
  </svg>
));
ArrowIcon.displayName = "ArrowIcon";

// ─── Loading Spinner (memo'd) ───
const LoadingSpinner = memo(() => (
  <div
    className="w-4 h-4 sm:w-[18px] sm:h-[17px] border-2 border-white border-t-transparent rounded-full animate-spin"
    role="status"
    aria-label="Sending..."
  />
));
LoadingSpinner.displayName = "LoadingSpinner";

// ─── Status Message (memo'd) ───
const StatusMessage = memo(({ type, text }) => {
  if (!text) return null;
  return (
    <div
      className={`mt-3 sm:mt-4 text-sm sm:text-base font-rubik animate-fade-in ${
        type === "success" ? "text-green-600" : "text-red-600"
      }`}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {text}
    </div>
  );
});
StatusMessage.displayName = "StatusMessage";

// ═══════════════════════════════════════════
// ─── Main Newsletter Component ───
// ═══════════════════════════════════════════
const Newsletter = () => {
  let locale = "en";
  try {
    locale = useLocale();
  } catch {
    locale = "en";
  }
  const isRTL = locale === "ar";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email) {
        setMessage({ type: "error", text: "Please enter your email address" });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage({
          type: "error",
          text: "Please enter a valid email address",
        });
        return;
      }

      setLoading(true);
      setMessage({ type: "", text: "" });

      try {
        const response = await axios.post(
          `${baseUrl}/newsletter/join_newsletter.php`,
          { email },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.success || response.status === 200) {
          setMessage({
            type: "success",
            text: "Successfully subscribed to our newsletter!",
          });
          setEmail("");
        }
      } catch (error) {
        if (error.response) {
          setMessage({
            type: "error",
            text:
              error.response.data.message ||
              "Subscription failed. Please try again.",
          });
        } else if (error.request) {
          setMessage({
            type: "error",
            text: "Network error. Please check your connection.",
          });
        } else {
          setMessage({
            type: "error",
            text: "Something went wrong. Please try again.",
          });
        }
      } finally {
        setLoading(false);
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    },
    [email]
  );

  return (
    <section
      className="relative z-[1] px-4 -mb-[50px] sm:-mb-[70px] lg:-mb-[137px]"
      aria-label="Newsletter signup"
    >
      <div className="container mx-auto">
        <div className="row">
          <div className="col-lg-12">
            <div
              className="relative z-[1] overflow-hidden text-center rounded-[10px] sm:rounded-[20px] lg:rounded-[30px] 
                         py-10 px-4 sm:py-[60px] sm:px-6 md:py-[70px] md:px-8 lg:py-[86px] lg:px-10
                         bg-cover bg-no-repeat bg-center"
              style={{
                backgroundImage: `url('/assets/img/home1/newsletter-bg.png'), linear-gradient(180deg, #f9f4f0 0%, #f9f4f0 100%)`,
              }}
            >
              <h2
                className="text-[--title-color] font-rubik font-bold leading-[1.2] mb-2
                           text-xl xs:text-2xl sm:text-[32px] md:text-[36px] lg:text-[40px]
                           mt-0 lg:-mt-[10px]"
              >
                Join The Newsletter
              </h2>

              <p
                className="text-[--title-color] font-rubik font-normal leading-[1.5] tracking-[0.16px]
                           text-[13px] xs:text-sm sm:text-[15px] lg:text-base
                           mb-4 sm:mb-5"
              >
                To receive our best monthly deals
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div
                  className={`flex items-center justify-center w-full max-w-full sm:max-w-[450px] lg:max-w-[500px] 
                             mx-auto border border-[--primary-color1] rounded-lg sm:rounded-[10px]
                             ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter Your Gmail..."
                    disabled={loading}
                    autoComplete="email"
                    aria-label="Email address"
                    className={`bg-transparent border-none outline-none text-[--title-color] font-rubik 
                               flex-1 min-w-0 w-full
                               h-10 xs:h-11 sm:h-12
                               text-xs sm:text-[13px] lg:text-sm
                               py-2 px-3 sm:px-4 lg:px-5
                               placeholder:text-[rgba(16,12,8,0.4)]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${isRTL ? "text-right" : "text-left"}`}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    aria-label={
                      loading ? "Subscribing..." : "Subscribe to newsletter"
                    }
                    className={`bg-[--primary-color1] border-none cursor-pointer flex-shrink-0
                               flex items-center justify-center
                               p-3 xs:p-[14px] sm:p-4 lg:p-[17px]
                               transition-opacity duration-300 hover:opacity-90
                               disabled:opacity-50 disabled:cursor-not-allowed
                               ${
                                 isRTL
                                   ? "rounded-l-lg sm:rounded-l-[10px] rounded-r-none"
                                   : "rounded-r-lg sm:rounded-r-[10px] rounded-l-none"
                               }`}
                  >
                    {loading ? <LoadingSpinner /> : <ArrowIcon isRTL={isRTL} />}
                  </button>
                </div>

                <StatusMessage type={message.type} text={message.text} />
              </form>

              {/* Decorative vectors - lazy loaded */}
              <Image
                src="/assets/img/home1/banner3-vector1.png"
                alt=""
                width={300}
                height={200}
                loading="lazy"
                decoding="async"
                aria-hidden="true"
                className={`absolute top-0 -z-[1] max-w-[25%] lg:max-w-[30%] h-auto
                           hidden md:block md:opacity-70 lg:opacity-100
                           ${
                             isRTL
                               ? "right-0 left-auto rounded-r-[30px] scale-x-[-1]"
                               : "left-0 right-auto rounded-l-[30px]"
                           }`}
              />

              <Image
                src="/assets/img/home1/banner3-vector2.png"
                alt=""
                width={300}
                height={200}
                loading="lazy"
                decoding="async"
                aria-hidden="true"
                className={`absolute top-0 -z-[1] max-w-[25%] lg:max-w-[30%] h-auto
                           hidden md:block md:opacity-70 lg:opacity-100
                           ${
                             isRTL
                               ? "left-0 right-auto rounded-l-[30px] scale-x-[-1]"
                               : "right-0 left-auto rounded-r-[30px]"
                           }`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Newsletter);
