"use client";
import React from "react";
import { useTranslations } from "next-intl";

const TourHighlights = ({ highlights = [], loading = false }) => {
  const t = useTranslations("packageDetails");

  const fallbackHighlights = [
    t("highlight1"),
    t("highlight2"),
    t("highlight3"),
    t("highlight4"),
    t("highlight5"),
  ];

  const displayHighlights =
    highlights.length > 0 ? highlights : fallbackHighlights;

  if (loading) {
    return (
      <div className="highlight-tour mb-[20px]">
        <h4 className="animate-pulse bg-gray-200 h-6 w-48 rounded mb-4"></h4>
        <ul>
          {[1, 2, 3, 4, 5].map((index) => (
            <li key={index} className="mb-2">
              <span>
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse inline-block mr-2"></div>
              </span>
              <div className="bg-gray-200 h-4 w-3/4 rounded animate-pulse inline-block"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="highlight-tour mb-[20px]">
      <h4 className="text-xl font-semibold text-gray-800 mb-4">
        {t("highlightsTitle")}
      </h4>

      {displayHighlights.length > 0 ? (
        <ul className="space-y-2">
          {displayHighlights.map((highlight, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <i className="bi bi-check text-green-600 text-sm font-bold" />
              </span>
              <div className="">{highlight}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-2">
            <i className="bi bi-info-circle text-2xl"></i>
          </div>
          <p className="text-gray-500">
            No highlights available for this package.
          </p>
        </div>
      )}
    </div>
  );
};

export default TourHighlights;
