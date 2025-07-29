"use client";
import React from "react";
import { useTranslations } from "next-intl";

const IncludedExcluded = () => {
  const t = useTranslations("packageDetails");

  return (
    <div>
      <h4>{t("Included and Excluded")}</h4>

      <div className="includ-and-exclud-area mb-[20px]">
        <ul>
          <li>
            <i className="bi bi-check-lg" /> {t("included1")}
          </li>
          <li>
            <i className="bi bi-check-lg" /> {t("included2")}
          </li>
          <li>
            <i className="bi bi-check-lg" /> {t("included3")}
          </li>
          <li>
            <i className="bi bi-check-lg" /> {t("included4")}
          </li>
          <li>
            <i className="bi bi-check-lg" /> {t("included5")}
          </li>
        </ul>
        <ul className="exclud">
          <li>
            <i className="bi bi-x-lg" /> {t("excluded1")}
          </li>
          <li>
            <i className="bi bi-x-lg" /> {t("excluded2")}
          </li>
          <li>
            <i className="bi bi-x-lg" /> {t("excluded3")}
          </li>
          <li>
            <i className="bi bi-x-lg" /> {t("excluded4")}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default IncludedExcluded;
