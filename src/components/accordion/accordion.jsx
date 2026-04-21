// src/components/accordion/accordion.jsx
"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const Accordion = ({
  items,
  itemClassName = "border border-gray-200 rounded-lg overflow-hidden",
  headerClassName = "flex justify-between items-center w-full p-4 text-left font-medium",
  activeHeaderClassName = "bg-gray-50",
  contentClassName = "p-4 border-t border-gray-200",
  useTranslation = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const locale = useLocale();

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // ✅ Helper: get text value whether string or locale object
  const getText = (field) => {
    if (!field) return "";

    // If it's a plain string → return directly (activity FAQs case)
    if (typeof field === "string") return field;

    // If it's a locale object → get by locale with fallback
    if (typeof field === "object") {
      return field[locale] || field.en || field.ar || "";
    }

    return "";
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id ?? index} className={itemClassName}>
          <button
            className={`${headerClassName} ${
              activeIndex === index ? activeHeaderClassName : ""
            }`}
            onClick={() => handleToggle(index)}
          >
            <span>{getText(item.question)}</span>
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                activeIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              activeIndex === index ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className={contentClassName}>{getText(item.answer)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
