"use client";
import React from "react";
import { useTranslations } from "next-intl";

const IncludedExcluded = ({ includes = [], excludes = [] }) => {
  const t = useTranslations("packageDetails");

  return (
    <div>
      <h4>{t("Included and Excluded")}</h4>

      <div className="includ-and-exclud-area mb-[20px]">
        <ul>
          {includes.length > 0 ? (
            includes.map((item, index) => (
              <li key={index}>
                <i className="bi bi-check-lg" /> {item}
              </li>
            ))
          ) : (
            // Fallback included items
            <>
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
            </>
          )}
        </ul>
        <ul className="exclud">
          {excludes.length > 0 ? (
            excludes.map((item, index) => (
              <li key={index}>
                <i className="bi bi-x-lg" /> {item}
              </li>
            ))
          ) : (
            // Fallback excluded items
            <>
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
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default IncludedExcluded;
