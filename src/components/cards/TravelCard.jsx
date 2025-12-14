import React, { useEffect } from "react";
import Link from "next/link";

const TravelCard = ({
  data: tour,
  type,
  status = "notStarted",
  progress = 0,
}) => {
  useEffect(() => {
    console.log(tour, "tour");
  }, [tour]);
  // Get first image from images array or use fallback
  const mainImage = tour?.image
    ? tour?.image
    : tour.images[0]?.split("//CAMP//")[0];

  // Format price with currency
  const formatPrice = (price, currency = "$") => {
    if (!price) return "N/A";
    return `${currency}${parseFloat(price).toLocaleString()}`;
  };

  const getDaysInfo = () => {
    if (!tour?.startDate || !tour?.endDate) return null;

    const now = new Date();
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (daysUntilStart > 0) {
      return `Starts in ${daysUntilStart} day${
        daysUntilStart !== 1 ? "s" : ""
      }`;
    } else if (daysUntilEnd >= 0) {
      return `${daysUntilEnd} day${daysUntilEnd !== 1 ? "s" : ""} remaining`;
    } else {
      const daysAgo = Math.abs(daysUntilEnd);
      return `Ended ${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;
    }
  };

  const daysInfo = getDaysInfo();

  // Get status display text and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case "noStarted":
        return { text: "Not Started", color: "orange" };
      case "started":
        return { text: "In Progress", color: "green" };
      case "finished":
        return { text: "Completed", color: "#ef6161" };
      default:
        return { text: "Pending", color: "gray" };
    }
  };

  const statusDisplay = getStatusDisplay(tour?.status || status);

  return (
    <div className="package-card">
      <div className="package-card-img-wrap">
        <Link
          href={
            type === "profile"
              ? `/account/${tour?.id}`
              : `/package/package-details/${tour?.tour_id || tour?.id}`
          }
          className="card-img"
        >
          <img
            src={mainImage}
            alt={tour?.title || "Tour"}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=Tour+Image";
            }}
          />
        </Link>
        <div className="batch">
          <span className="date">{tour?.duration}</span>
          <div className="location">
            <ul className="location-list">
              {tour?.mainLocations?.slice(0, 2).map((mainLocat, index) => (
                <li key={index}>
                  <Link href="/package">{mainLocat}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="date bottom-0 top-auto mt-2"
            style={{
              bottom: "0",
              top: "auto",
              backgroundColor: statusDisplay.color,
            }}
          >
            {statusDisplay.text}
          </div>
        </div>
      </div>
      <div className="package-card-content">
        <div className="card-content-top pb-0">
          <h5 style={{ minHeight: "50px", overflow: "hidden" }}>
            <Link
              href={
                type === "profile"
                  ? `/account/${tour?.id}`
                  : `/package/package-details/${tour?.tour_id || tour?.id}`
              }
            >
              {tour?.title}
            </Link>
          </h5>
          <div className="location-area">
            <ul className="location-list scrollTextAni">
              {tour?.additionalLocations?.map((additLocat, index) => (
                <li key={index}>
                  <Link href="/package">{additLocat}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="progress-container"
          style={{
            width: "100%",
            height: "4px",
            marginTop: "10px",
            backgroundColor: "#e9ecef",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#FFA63A",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Progress percentage */}
        {type === "profile" && (
          <div className="d-flex justify-content-between align-items-center mt-1">
            <small className="text-muted">
              {progress}% completed
              {daysInfo && ` • ${daysInfo}`}
            </small>
            {tour?.startDate && tour?.endDate && (
              <small className="text-muted">
                {new Date(tour.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(tour.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </small>
            )}
          </div>
        )}

        <div className="card-content-bottom">
          <div className="price-area">
            <span>
              {formatPrice(
                tour?.price || tour?.currentPrice,
                tour?.priceCurrency
              )}
            </span>
            <p>{tour?.priceNote || "TAXES INCL/PERS"}</p>
          </div>
          <Link
            href={
              type === "profile"
                ? `/account/${tour?.id}`
                : `/package/package-details/${tour?.tour_id || tour?.id}`
            }
            className="primary-btn2"
          >
            {type === "profile" ? "Show Details" : "Book a Trip"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
            >
              <path d="M8.15624 10.2261L7.70276 12.3534L5.60722 18L6.85097 17.7928L12.6612 10.1948C13.4812 10.1662 14.2764 10.1222 14.9674 10.054C18.1643 9.73783 17.9985 8.99997 17.9985 8.99997C17.9985 8.99997 18.1643 8.26211 14.9674 7.94594C14.2764 7.87745 13.4811 7.8335 12.6611 7.80518L6.851 0.206972L5.60722 -5.41705e-07L7.70276 5.64663L8.15624 7.77386C7.0917 7.78979 6.37132 7.81403 6.37132 7.81403C6.37132 7.81403 4.90278 7.84793 2.63059 8.35988L0.778036 5.79016L0.000253424 5.79016L0.554115 8.91458C0.454429 8.94514 0.454429 9.05483 0.554115 9.08539L0.000253144 12.2098L0.778036 12.2098L2.63059 9.64035C4.90278 10.1523 6.37132 10.1857 6.37132 10.1857C6.37132 10.1857 7.0917 10.2102 8.15624 10.2261Z" />
              <path d="M12.0703 11.9318L12.0703 12.7706L8.97041 12.7706L8.97041 11.9318L12.0703 11.9318ZM12.0703 5.23292L12.0703 6.0714L8.97059 6.0714L8.97059 5.23292L12.0703 5.23292ZM9.97892 14.7465L9.97892 15.585L7.11389 15.585L7.11389 14.7465L9.97892 14.7465ZM9.97892 2.41846L9.97892 3.2572L7.11389 3.2572L7.11389 2.41846L9.97892 2.41846Z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
