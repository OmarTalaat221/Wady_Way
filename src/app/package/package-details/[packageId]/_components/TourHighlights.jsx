"use client";
import React from "react";
import { useTranslations } from "next-intl";

const TourHighlights = () => {
  const t = useTranslations("packageDetails");

  return (
    <div className="highlight-tour mb-[20px]">
      <h4>{t("highlightsTitle")}</h4>
      <ul>
        <li>
          <span>
            <i className="bi bi-check" />
          </span>{" "}
          {t("highlight1")}
        </li>
        <li>
          <span>
            <i className="bi bi-check" />
          </span>{" "}
          {t("highlight2")}
        </li>
        <li>
          <span>
            <i className="bi bi-check" />
          </span>{" "}
          {t("highlight3")}
        </li>
        <li>
          <span>
            <i className="bi bi-check" />
          </span>{" "}
          {t("highlight4")}
        </li>
        <li>
          <span>
            <i className="bi bi-check" />
          </span>{" "}
          {t("highlight5")}
        </li>
      </ul>
    </div>
  );
};

export default TourHighlights;
