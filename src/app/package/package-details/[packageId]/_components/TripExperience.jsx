"use client";
import React from "react";
import { FaFlagCheckered } from "react-icons/fa";
import { GiDuration } from "react-icons/gi";
import { MdNetworkWifi2Bar } from "react-icons/md";
import { LiaLanguageSolid } from "react-icons/lia";
import { useLocale, useTranslations } from "next-intl";

const TripExperience = ({ options, setRowData, setLearnModal }) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  return (
    <div className="transfers-container" id="Transfer">
      <h2
        style={{
          color: "#295557",
          fontSize: "25px",
        }}
      >
        {t("tripExperience")}
      </h2>

      <div className="cards-container-parent">
        <div className="cards-container">
          {options.map((option) => {
            return (
              <div
                key={option.id}
                className={`card`}
                onClick={() => {
                  setRowData(option);
                  setLearnModal(true);
                }}
              >
                <img
                  src={option.image}
                  alt={option.title[locale] || option.title.en}
                  className="card-image"
                />
                <div className="card-content">
                  <h3>{option.title[locale] || option.title.en}</h3>
                  <div className="gap-3 mb-3 transfer_feat_cont">
                    <div
                      className="d-flex align-items-center justify-content-start transfer_in gap-2 "
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      <FaFlagCheckered />
                      <div className="d-flex align-items-start flex-column transfer_cont">
                        <div className="fw-bold">{t("tourStarts")}</div>
                        <span
                          className="transfer_info"
                          data-tooltip={
                            option.location[locale] || option.location.en
                          }
                        >
                          {option.location[locale] || option.location.en}
                        </span>
                      </div>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-start transfer_in gap-2 "
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      <GiDuration />
                      <div className="d-flex align-items-start flex-column transfer_cont">
                        <div className="fw-bold">{t("duration")}</div>
                        <div
                          className="transfer_info"
                          title={
                            option?.duration[locale] || option?.duration.en
                          }
                        >
                          {option.duration[locale] || option.duration.en}
                        </div>
                      </div>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-start transfer_in gap-2 "
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      <MdNetworkWifi2Bar />
                      <div className="d-flex align-items-start flex-column transfer_cont">
                        <div className="fw-bold">{t("difficulty")}</div>
                        <div
                          className="transfer_info"
                          title={
                            option?.difficulty[locale] || option?.difficulty.en
                          }
                        >
                          {option.difficulty[locale] || option.difficulty.en}
                        </div>
                      </div>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-start transfer_in gap-2 "
                      style={{
                        fontSize: "18px",
                      }}
                    >
                      <LiaLanguageSolid />
                      <div className="d-flex align-items-start flex-column transfer_cont">
                        <div className="fw-bold">{t("languages")}</div>
                        <div
                          className="transfer_info"
                          title={
                            option?.language[locale] || option?.language.en
                          }
                        >
                          {option.language[locale] || option.language.en}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TripExperience;
