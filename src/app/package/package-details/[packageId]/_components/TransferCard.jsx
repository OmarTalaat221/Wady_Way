"use client";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { FaHotel } from "react-icons/fa";
import { GiDuration } from "react-icons/gi";

const TransferCard = ({
  item,
  index,
  activeTransfers,
  selectedTours,
  setSelectedTours,
  handleTransferClick,
  calculatePriceDifference,
}) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  if (!item) return null;

  const isSelected = activeTransfers?.[index]?.id === item.id;

  const selectedTransfer = activeTransfers?.[index];
  const priceDifference = selectedTransfer
    ? calculatePriceDifference(selectedTransfer.price, item.price)
    : 0;

  // استخراج الـ features من البيانات الأصلية
  const features = item.features || item.originalData?.features || [];

  const onTransferClick = () => {
    if (isSelected) return;
    handleTransferClick(item, index);
  };

  return (
    <div
      key={item.id}
      className={`card ${
        isSelected ? "selected" : ""
      } hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={onTransferClick}
    >
      <img
        src={item.image || "https://via.placeholder.com/300x200"}
        alt={item.name?.[locale] || item.name?.en || "Transfer"}
        className="card-image"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200";
        }}
      />
      <div className="card-content">
        <h3>{item.name?.[locale] || item.name?.en || "Transfer"}</h3>

        {/* عرض الـ Features من الـ API */}
        <div className="gap-3 mb-3 transfer_feat_cont">
          {features.length > 0 ? (
            features.slice(0, 4).map((feature, idx) => (
              <div
                key={feature.feature_id || idx}
                className="d-flex align-items-center gap-2 transfer_in"
              >
                <div
                  className="feature-icon"
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold">{feature.label}</div>
                  <div className="transfer_info" title={feature.feature}>
                    {feature.feature}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback للبيانات القديمة
            <>
              <div className="d-flex align-items-center gap-2 transfer_in">
                <FaHotel />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold">{t("brand")}</div>
                  <div className="transfer_info" title={item.category?.en}>
                    {item.category?.[locale] || item.category?.en || "Standard"}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 transfer_in">
                <GiDuration />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold capitalize">{t("capacity")}</div>
                  <div className="transfer_info" title={item.capacity}>
                    {item.capacity || 4} {t("passengers")}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card-footer">
          <span className="price">
            {isSelected
              ? t("selected")
              : priceDifference !== 0
                ? `${priceDifference > 0 ? "+" : ""}${priceDifference} USD`
                : t("samePrice")}
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
