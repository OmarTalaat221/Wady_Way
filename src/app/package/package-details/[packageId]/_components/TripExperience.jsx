"use client";
import React from "react";
import { FaFlagCheckered } from "react-icons/fa";
import { GiDuration } from "react-icons/gi";
import { MdNetworkWifi2Bar } from "react-icons/md";
import { LiaLanguageSolid } from "react-icons/lia";
import { useLocale, useTranslations } from "next-intl";

const TripExperience = ({ options = [], setRowData, setLearnModal }) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  if (!options || options.length === 0) {
    return (
      <div className="transfers-container" id="Transfer">
        <h2 style={{ color: "#295557", fontSize: "25px" }}>
          {t("tripExperience")}
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500">
            No experiences available for this package.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="transfers-container" id="Transfer">
      <h2 style={{ color: "#295557", fontSize: "25px" }}>
        {t("tripExperience")}
      </h2>

      <div className="cards-container-parent">
        <div className="cards-container">
          {options.map((option) => (
            <div
              key={option.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setRowData(option);
                setLearnModal(true);
              }}
            >
              <img
                src={option.image || "https://via.placeholder.com/380x207"}
                alt={option.title?.[locale] || option.title?.en || "Experience"}
                className="card-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/380x207";
                }}
              />
              <div className="card-content">
                <h3>
                  {option.title?.[locale] || option.title?.en || "Experience"}
                </h3>
                <div className="gap-3 mb-3 transfer_feat_cont">
                  <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
                    <FaFlagCheckered />
                    <div className="d-flex align-items-start flex-column transfer_cont">
                      <div className="fw-bold">{t("tourStarts")}</div>
                      <span
                        className="transfer_info"
                        title={option.location?.[locale] || option.location?.en}
                      >
                        {option.location?.[locale] ||
                          option.location?.en ||
                          "Location not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
                    <GiDuration />
                    <div className="d-flex align-items-start flex-column transfer_cont">
                      <div className="fw-bold">{t("duration")}</div>
                      <div
                        className="transfer_info"
                        title={option.duration?.[locale] || option.duration?.en}
                      >
                        {option.duration?.[locale] ||
                          option.duration?.en ||
                          "Duration not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
                    <MdNetworkWifi2Bar />
                    <div className="d-flex align-items-start flex-column transfer_cont">
                      <div className="fw-bold">{t("difficulty")}</div>
                      <div
                        className="transfer_info"
                        title={
                          option.difficulty?.[locale] || option.difficulty?.en
                        }
                      >
                        {option.difficulty?.[locale] ||
                          option.difficulty?.en ||
                          "Easy"}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-start transfer_in gap-2">
                    <LiaLanguageSolid />
                    <div className="d-flex align-items-start flex-column transfer_cont">
                      <div className="fw-bold">{t("languages")}</div>
                      <div
                        className="transfer_info"
                        title={option.language?.[locale] || option.language?.en}
                      >
                        {option.language?.[locale] ||
                          option.language?.en ||
                          "English"}
                      </div>
                    </div>
                  </div>
                </div>

                {option.price && (
                  <div className="text-center mt-3">
                    <span className="text-lg font-bold text-green-600">
                      ${option.price}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripExperience;
