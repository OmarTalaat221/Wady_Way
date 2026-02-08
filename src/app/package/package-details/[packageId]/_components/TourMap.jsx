"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Primary Color
const PRIMARY_COLOR = "#295557";
const ACTIVE_COLOR = "#e29b4b";

// ✅ إنشاء أيقونة Location Pin مع رقم اليوم
const createLocationPinIcon = (dayNumber, isActive = false) => {
  const color = isActive ? ACTIVE_COLOR : PRIMARY_COLOR;

  return L.divIcon({
    className: "custom-location-marker",
    html: `
      <div style="position: relative; width: 40px; height: 50px;">
        <svg 
          width="40" 
          height="50" 
          viewBox="0 0 40 50" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));"
        >
          <path 
            d="M20 0C8.954 0 0 8.954 0 20c0 14.5 20 30 20 30s20-15.5 20-30C40 8.954 31.046 0 20 0z" 
            fill="${color}"
          />
          <circle cx="20" cy="18" r="12" fill="white"/>
        </svg>
        <span style="
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: bold;
          color: ${color};
        ">${dayNumber}</span>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -45],
  });
};

const TourMap = ({ itinerary, height = "450px", className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [activeDay, setActiveDay] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // ✅ Extract locations from itinerary
  const locations = useMemo(() => {
    if (!itinerary || !Array.isArray(itinerary)) return [];

    const allLocations = [];

    itinerary.forEach((day) => {
      if (day.day_locations && day.day_locations.length > 0) {
        day.day_locations.forEach((location) => {
          allLocations.push({
            day: day.day,
            dayId: day.day_id,
            title: day.title,
            description: location.description || day.title,
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            locationId: location.location_id,
          });
        });
      }
    });

    // Sort by day number
    return allLocations.sort((a, b) => a.day - b.day);
  }, [itinerary]);

  // ✅ Calculate map center
  const center = useMemo(() => {
    if (locations.length === 0) {
      return [30.0444, 31.2357]; // Cairo as default
    }

    const avgLat =
      locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLng =
      locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

    return [avgLat, avgLng];
  }, [locations]);

  // ✅ Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: center,
      zoom: locations.length === 1 ? 13 : 10,
      scrollWheelZoom: true,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // ✅ Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      polylineRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  // ✅ Add/Update Markers and Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove old polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (locations.length === 0) return;

    // ✅ Add polyline connecting all locations
    if (locations.length > 1) {
      const polylineCoords = locations.map((loc) => [
        loc.latitude,
        loc.longitude,
      ]);

      polylineRef.current = L.polyline(polylineCoords, {
        color: PRIMARY_COLOR,
        weight: 3,
        opacity: 0.7,
        dashArray: "10, 10",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Add animated dots along the line (optional decoration)
      const decoratedPolyline = L.polyline(polylineCoords, {
        color: PRIMARY_COLOR,
        weight: 5,
        opacity: 0.3,
      }).addTo(map);

      markersRef.current.push(decoratedPolyline);
    }

    // ✅ Add markers
    locations.forEach((location, index) => {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: createLocationPinIcon(location.day, activeDay === location.day),
        zIndexOffset: activeDay === location.day ? 1000 : index,
      });

      // Create popup content
      const popupContent = `
        <div class="tour-popup" style="min-width: 220px;">
          <div style="
            background: ${PRIMARY_COLOR};
            color: white;
            padding: 12px 15px;
            margin: -13px -20px 12px -20px;
            border-radius: 4px 4px 0 0;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="
                background: rgba(255,255,255,0.2);
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">Day ${location.day}</span>
              <span style="font-weight: 600; font-size: 14px;">${location.title}</span>
            </div>
          </div>
          <div style="padding: 0 5px;">
            <p style="margin-bottom: 10px; color: #555; font-size: 13px; line-height: 1.5;">
              ${location.description}
            </p>
            <div style="
              font-size: 11px;
              color: #888;
              background: #f5f5f5;
              padding: 8px 12px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="${PRIMARY_COLOR}">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: "custom-popup",
      });

      marker.on("click", () => {
        setActiveDay(location.day);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds
    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 13);
    } else if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [locations, isMapReady]);

  // ✅ Update marker icons when activeDay changes
  useEffect(() => {
    if (!isMapReady || markersRef.current.length === 0) return;

    // Skip polyline decorations, only update actual markers
    const actualMarkers = markersRef.current.filter(
      (m) => m instanceof L.Marker
    );

    actualMarkers.forEach((marker, index) => {
      if (locations[index]) {
        marker.setIcon(
          createLocationPinIcon(
            locations[index].day,
            activeDay === locations[index].day
          )
        );
        marker.setZIndexOffset(
          activeDay === locations[index].day ? 1000 : index
        );
      }
    });
  }, [activeDay, isMapReady, locations]);

  // ✅ If no locations available
  if (locations.length === 0) {
    return (
      <div
        className={`tour-map-empty ${className}`}
        style={{
          height,
          background: "linear-gradient(135deg, #f8fafa 0%, #e8eded 100%)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "15px",
          border: `2px dashed ${PRIMARY_COLOR}40`,
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: `${PRIMARY_COLOR}15`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PRIMARY_COLOR}
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <p style={{ color: "#666", margin: 0 }}>
          No locations available for this tour
        </p>
      </div>
    );
  }

  // Get unique days for legend
  const uniqueDays = [
    ...new Map(locations.map((loc) => [loc.day, loc])).values(),
  ];

  return (
    <div className={`tour-map-wrapper ${className}`}>
      {/* ✅ Legend - Days List */}
      <div className="map-legend mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span
            className="legend-label me-2"
            style={{ fontWeight: "600", color: "#333" }}
          >
            Tour Days:
          </span>
          {uniqueDays.map((loc) => (
            <button
              key={`day-btn-${loc.day}`}
              className={`day-badge ${activeDay === loc.day ? "active" : ""}`}
              onClick={() => {
                const newActiveDay = activeDay === loc.day ? null : loc.day;
                setActiveDay(newActiveDay);

                // Navigate to location on map
                if (mapInstanceRef.current && newActiveDay) {
                  mapInstanceRef.current.setView(
                    [loc.latitude, loc.longitude],
                    14,
                    { animate: true, duration: 0.5 }
                  );

                  // Open popup
                  const markerIndex = locations.findIndex(
                    (l) => l.day === loc.day
                  );
                  const actualMarkers = markersRef.current.filter(
                    (m) => m instanceof L.Marker
                  );
                  if (actualMarkers[markerIndex]) {
                    actualMarkers[markerIndex].openPopup();
                  }
                }
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "25px",
                border: "none",
                background:
                  activeDay === loc.day ? ACTIVE_COLOR : PRIMARY_COLOR,
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow:
                  activeDay === loc.day
                    ? `0 4px 15px ${ACTIVE_COLOR}50`
                    : `0 2px 8px ${PRIMARY_COLOR}40`,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Day {loc.day}
            </button>
          ))}

          {/* Reset View Button */}
          <button
            onClick={() => {
              setActiveDay(null);
              if (mapInstanceRef.current && locations.length > 0) {
                const bounds = L.latLngBounds(
                  locations.map((loc) => [loc.latitude, loc.longitude])
                );
                mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
              }
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "25px",
              border: `2px solid ${PRIMARY_COLOR}`,
              background: "white",
              color: PRIMARY_COLOR,
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              marginLeft: "auto",
            }}
            onMouseOver={(e) => {
              e.target.style.background = PRIMARY_COLOR;
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "white";
              e.target.style.color = PRIMARY_COLOR;
            }}
          >
            View All
          </button>
        </div>
      </div>

      {/* ✅ Map Container */}
      <div
        ref={mapRef}
        style={{
          height,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          border: `2px solid ${PRIMARY_COLOR}20`,
        }}
      />

      <style jsx global>{`
        .custom-location-marker {
          background: transparent !important;
          border: none !important;
        }

        .custom-location-marker:hover > div {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
          padding: 0;
          overflow: hidden;
        }

        .leaflet-popup-content {
          margin: 13px 20px;
        }

        .leaflet-popup-tip {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-top: 3px solid ${PRIMARY_COLOR};
        }

        .tour-map-wrapper {
          position: relative;
        }

        .map-legend {
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
          border: 1px solid #eee;
        }

        .day-badge:hover {
          transform: translateY(-2px);
        }

        .day-badge.active {
          animation: none;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }

        .leaflet-control-zoom a {
          background: white !important;
          color: ${PRIMARY_COLOR} !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          transition: all 0.3s ease;
        }

        .leaflet-control-zoom a:hover {
          background: ${PRIMARY_COLOR} !important;
          color: white !important;
        }

        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
        }

        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }

        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8) !important;
          padding: 4px 8px !important;
          border-radius: 4px 0 0 0 !important;
          font-size: 10px !important;
        }
      `}</style>
    </div>
  );
};

export default TourMap;
