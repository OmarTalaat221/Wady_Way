import { useTranslations } from "next-intl";
import React from "react";

const RightSummary = ({ lang }) => {
  const t = useTranslations("packageSummary");

  return (
    <div className="order-summary">
      <p className="order-description">{t("order_description")}</p>

      <div className="order-details">
        <div className="order-row">
          <span>{t("subtotal")}</span> <span>$1,500</span>
        </div>
        <div className="order-row">
          <span>{t("discount")}</span> <span>- $1.00</span>
        </div>

        <div className="order-total">
          <span>{t("total")}</span> <span>$1,499</span>
        </div>
      </div>
    </div>
  );
};

export default RightSummary;
