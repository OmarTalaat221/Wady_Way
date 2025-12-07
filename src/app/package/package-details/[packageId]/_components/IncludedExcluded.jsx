"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

const IncludedExcluded = ({
  includes = [],
  excludes = [],
  loading = false,
}) => {
  const t = useTranslations("packageDetails");
  const [showMore, setShowMore] = useState({
    includes: false,
    excludes: false,
  });

  const fallbackIncludes = [
    t("included1"),
    t("included2"),
    t("included3"),
    t("included4"),
    t("included5"),
  ];

  const fallbackExcludes = [
    t("excluded1"),
    t("excluded2"),
    t("excluded3"),
    t("excluded4"),
  ];

  const displayIncludes = includes.length > 0 ? includes : fallbackIncludes;
  const displayExcludes = excludes.length > 0 ? excludes : fallbackExcludes;

  const maxInitialItems = 5;

  if (loading) {
    return (
      <div className="included-excluded-section mb-[20px]">
        <h4 className="animate-pulse bg-gray-200 h-6 w-64 rounded mb-4"></h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Included skeleton */}
          <div>
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="bg-gray-200 h-4 w-full rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          {/* Excluded skeleton */}
          <div>
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="bg-gray-200 h-4 w-full rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderItems = (items, type, isPositive = true) => {
    const shouldShowToggle = items.length > maxInitialItems;
    const showAllItems = showMore[type];
    const itemsToShow =
      shouldShowToggle && !showAllItems
        ? items.slice(0, maxInitialItems)
        : items;

    return (
      <div className={`${isPositive ? "included-items" : "excluded-items"}`}>
        <h5
          className={`text-lg font-medium mb-3 ${
            isPositive ? "text-green-700" : "text-red-700"
          }`}
        >
          <i
            className={`bi ${
              isPositive ? "bi-check-circle" : "bi-x-circle"
            } mr-2`}
          ></i>
          {isPositive ? t("included") : t("excluded")}
        </h5>

        <ul className="space-y-2">
          {itemsToShow.map((item, index) => (
            <li
              key={index}
              className={`flex items-start gap-3 text-sm transition-colors hover:bg-gray-50 p-2 rounded ${
                isPositive ? "text-gray-700" : "text-gray-600"
              }`}
            >
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                  isPositive
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <i
                  className={`bi ${
                    isPositive ? "bi-check" : "bi-x"
                  } text-xs font-bold`}
                />
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        {shouldShowToggle && (
          <button
            onClick={() =>
              setShowMore((prev) => ({ ...prev, [type]: !prev[type] }))
            }
            className={`mt-3 text-sm font-medium transition-colors ${
              isPositive
                ? "text-green-600 hover:text-green-700"
                : "text-red-600 hover:text-red-700"
            }`}
          >
            {showAllItems ? (
              <>
                <i className="bi bi-chevron-up mr-1"></i>
                {t("showLess")}
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down mr-1"></i>
                {t("showMore")} ({items.length - maxInitialItems} {t("more")})
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="included-excluded-section mb-[20px]">
      <h4 className="text-xl font-semibold text-gray-800 mb-6">
        {t("includedAndExcluded")}
      </h4>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Included Section */}
          <div className="p-6">
            {renderItems(displayIncludes, "includes", true)}
          </div>

          {/* Excluded Section */}
          <div className="p-6">
            {renderItems(displayExcludes, "excludes", false)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncludedExcluded;
