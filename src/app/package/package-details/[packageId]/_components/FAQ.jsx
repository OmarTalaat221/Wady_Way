"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Accordion from "@/components/accordion/accordion";

const FAQ = ({ faqData, text = true }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  return (
    <div className="mb-7">
      <div className="mb-5 ">
        {text && (
          <h4 className="text-2xl font-semibold">
            {t("frequentlyAskedQuestion")}
          </h4>
        )}
      </div>
      <Accordion items={faqData} />
    </div>
  );
};

export default FAQ;
