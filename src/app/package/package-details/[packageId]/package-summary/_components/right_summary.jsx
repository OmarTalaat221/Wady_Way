import { useTranslations } from "next-intl";
import React from "react";

const RightSummary = ({ lang }) => {
  const t = useTranslations("packageSummary");

  return (
    <div className="bg-white rounded-lg shadow-md px-4 py-5">
      <h3 className="text-lg font-semibold mb-4">{t("summary_description")}</h3>
      <p className="text-gray-600 mb-6">{t("order_description")}</p>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">{t("subtotal")}</span>
          <span className="font-medium">$1,500</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">{t("discount")}</span>
          <span className="text-green-600">- $1.00</span>
        </div>

        <div className="flex justify-between py-3 mt-2 border-t border-gray-200">
          <span className="font-semibold">{t("total")}</span>
          <span className="font-bold text-lg">$1,499</span>
        </div>

        <button className="w-full mt-4 bg-[#295557] hover:bg-[#1e3e3a] text-white py-2 px-4 rounded-md transition-colors">
          {t("Confirm")}
        </button>

        <div className="mt-3 text-center">
          <span className="text-sm text-gray-500 font-medium">
            {t("payment_status")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RightSummary;
