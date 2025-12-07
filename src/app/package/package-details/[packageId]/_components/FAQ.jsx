"use client";
import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Accordion from "@/components/accordion/accordion";

const FAQ = ({ faqData = [], text = true }) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  // Fallback FAQ data if none provided
  const defaultFaqData = [
    {
      id: "faq1",
      question: {
        en: "What is included in the tour package?",
        ar: "ما هو المشمول في حزمة الجولة؟",
      },
      answer: {
        en: "The tour package includes accommodation, meals as specified, transportation, and guided tours.",
        ar: "تشمل حزمة الجولة الإقامة والوجبات المحددة والنقل والجولات المصحوبة بمرشدين.",
      },
    },
    {
      id: "faq2",
      question: {
        en: "What is the cancellation policy?",
        ar: "ما هي سياسة الإلغاء؟",
      },
      answer: {
        en: "Cancellation policies vary depending on the booking. Please check your booking details for specific terms.",
        ar: "تختلف سياسات الإلغاء حسب الحجز. يرجى مراجعة تفاصيل حجزك للشروط المحددة.",
      },
    },
    {
      id: "faq3",
      question: {
        en: "Can I modify my booking?",
        ar: "هل يمكنني تعديل حجزي؟",
      },
      answer: {
        en: "Modifications to bookings may be possible subject to availability and additional charges.",
        ar: "قد تكون التعديلات على الحجوزات ممكنة وفقاً للتوفر ورسوم إضافية.",
      },
    },
  ];

  const displayFaqData = faqData.length > 0 ? faqData : defaultFaqData;

  return (
    <div className="mb-7">
      {text && (
        <div className="mb-5">
          <h4 className="text-2xl font-semibold">
            {t("frequentlyAskedQuestion")}
          </h4>
        </div>
      )}

      {displayFaqData.length > 0 ? (
        <Accordion items={displayFaqData} />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No FAQ available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default FAQ;
