"use client";
import React, { useMemo } from "react";
import HotelCard from "../Cards/HotelCard";

export default function HotelTab({ items = [], filterCategory = "" }) {
  // اختياري: فلترة حسب category
  const list = useMemo(() => {
    if (!filterCategory) return items;
    return items.filter(
      (x) => String(x?.category || "").toLowerCase() === filterCategory
    );
  }, [items, filterCategory]);

  return (
    <div
      className="tab-pane fade show active"
      id="Hotel"
      role="tabpanel"
      aria-labelledby="Hotel-tab"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((item) => (
          <HotelCard key={item?.id ?? item?.title} hotel={item} />
        ))}
      </div>
    </div>
  );
}
