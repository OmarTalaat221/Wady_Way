"use client";
import React from "react";
import { useTranslations } from "next-intl";

const TourHighlights = ({ highlights = [] }) => {
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

  return (
    <div className="highlight-tour mb-[20px]">
      <h4>{t("highlightsTitle")}</h4>
      <ul>
        {displayHighlights.map((highlight, index) => (
          <li key={index}>
            <span>
              <i className="bi bi-check" />
            </span>{" "}
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TourHighlights;
