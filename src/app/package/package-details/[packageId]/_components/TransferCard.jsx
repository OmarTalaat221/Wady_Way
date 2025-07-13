"use client";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaHotel } from "react-icons/fa";
import { GiDuration } from "react-icons/gi";

const TransferCard = ({
  item,
  index,
  selectedTours,
  setSelectedTours,
  calculatePriceDifference,
}) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  const selectedTransfer = selectedTours?.transfers?.find(
    (selected) => selected.day === index + 1
  );

  const isSelected = selectedTransfer?.id === item.id;

  const priceDifference = calculatePriceDifference(
    selectedTransfer?.price,
    item?.price
  );

  return (
    <div
      key={item.id}
      className={`card ${isSelected ? "selected" : ""}`}
      onClick={() => {
        setSelectedTours((prevState) => ({
          ...prevState,
          transfers: [
            ...prevState.transfers.filter((h) => h.day !== index + 1),
            {
              day: index + 1,
              name: item.name,
              id: item.id,
              price: item.price,
            },
          ],
        }));
      }}
    >
      <img
        src={item.image}
        alt={item.name[locale] || item.name.en}
        className="card-image"
      />
      <div className="card-content">
        <h3>{item.name[locale] || item.name.en}</h3>
        <div className="gap-3 mb-3 transfer_feat_cont">
          <div className="d-flex align-items-center gap-2 transfer_in">
            <FaHotel />
            <div className="d-flex flex-column transfer_cont">
              <div className="fw-bold">{t("brand")}</div>
              <div className="transfer_info" title={item?.category.en}>
                {item?.category.en}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 transfer_in">
            <GiDuration />
            <div className="d-flex flex-column transfer_cont">
              <div className="fw-bold capitalize">{t("capacity")}</div>
              <div className="transfer_info" title={item?.capacity}>
                {item?.capacity}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <span className="price">
            {isSelected
              ? t("selected")
              : priceDifference !== 0
              ? `${priceDifference > 0 ? "+" : ""}${priceDifference} USD`
              : priceDifference == 0
              ? t("samePrice")
              : `+${item.price} USD`}
          </span>
          <div className={`custom-radio ${isSelected ? "selected" : ""}`}>
            <div className="radio-circle"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
