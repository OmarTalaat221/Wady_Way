"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaHotel } from "react-icons/fa";
import { GiDuration } from "react-icons/gi";
import { FaPlus, FaUserTie } from "react-icons/fa6";

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

  // Extract features from original data
  const features = item.features || item.originalData?.features || [];

  // Parse capacity from features or fallback
  const capacity = (() => {
    console.log(item, "item");
    if (item.capacity) return parseInt(item.capacity);

    // Try to extract from features (e.g., "Up to 4 People")
    const groupFeature = features.find(
      (f) =>
        f.label?.toLowerCase().includes("capacity") ||
        f.label?.toLowerCase().includes("group") ||
        f.label?.toLowerCase().includes("passengers") ||
        f.feature?.toLowerCase().includes("people") ||
        f.feature?.toLowerCase().includes("passengers")
    );

    if (groupFeature) {
      const match = groupFeature.feature?.match(/(\d+)/);
      if (match) return parseInt(match[1]);
    }

    return 4; // Default fallback
  })();

  const onAddCar = (e) => {
    e?.stopPropagation();
    handleTransferClick(item, index);
  };

  return (
    <div
      key={item.id}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onAddCar}
    >
      <img
        src={item.image || "https://via.placeholder.com/300x200"}
        alt={item.name?.[locale] || item.name?.en || item.title || "Transfer"}
        className="card-image"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200";
        }}
      />

      <div className="card-content">
        <h3>
          {item.name?.[locale] || item.name?.en || item.title || "Transfer"}
        </h3>

        {/* Features from API */}
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
                  <div className="transfer_info" title={`${capacity}`}>
                    {capacity} {t("passengers")}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Capacity Badge */}
        <div className="flex items-center gap-2 mb-3 px-[15px]">
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <FaUserTie size={10} />
            {capacity} {capacity === 1 ? "seat" : "seats"}
          </span>
          <span className="text-xs text-gray-400">per vehicle</span>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <span className="price">
            +{item.price_current || item.price || 0} USD
          </span>
          <button
            onClick={onAddCar}
            className="flex items-center gap-1.5 bg-[#295557] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#1e3e40] transition-colors"
          >
            <FaPlus size={10} />
            {t("add") || "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
