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
  const t = useTranslations("packageDetails");

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          <button
            className={`${headerClassName} ${
              activeIndex === index ? activeHeaderClassName : ""
            }`}
            onClick={() => handleToggle(index)}
          >
            <span>
              {useTranslation && item.question[locale]
                ? item.question[locale] || item.question.en
                : item.question}
            </span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${
                activeIndex === index ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              activeIndex === index ? "max-h-[500px]" : "max-h-0"
            }`}
          >
            <div className={contentClassName}>
              {useTranslation && item.answer[locale]
                ? item.answer[locale] || item.answer.en
                : item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
