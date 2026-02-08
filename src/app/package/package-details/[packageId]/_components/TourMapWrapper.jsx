"use client";

import dynamic from "next/dynamic";
import React from "react";

const PRIMARY_COLOR = "#295557";

const TourMap = dynamic(() => import("./TourMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "450px",
        background: `linear-gradient(135deg, ${PRIMARY_COLOR}10 0%, ${PRIMARY_COLOR}05 100%)`,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${PRIMARY_COLOR}20`,
      }}
    >
      <div className="text-center">
        <div
          style={{
            width: "50px",
            height: "50px",
            border: `3px solid ${PRIMARY_COLOR}20`,
            borderTopColor: PRIMARY_COLOR,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px",
          }}
        />
        <p style={{ color: "#666", margin: 0 }}>Loading map...</p>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  ),
});

const TourMapWrapper = ({ itinerary, height = "450px", className = "" }) => {
  const mapKey = React.useMemo(() => {
    if (!itinerary) return "empty";
    const locationsCount = itinerary.reduce(
      (acc, day) => acc + (day.day_locations?.length || 0),
      0
    );
    return `map-${itinerary.length}-${locationsCount}`;
  }, [itinerary]);

  return (
    <TourMap
      key={mapKey}
      itinerary={itinerary}
      height={height}
      className={className}
    />
  );
};

export default TourMapWrapper;
