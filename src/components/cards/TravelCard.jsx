import React from "react";
import Link from "../link";

const TravelCard = ({
  data: tour,
  type,
  status = "notStarted",
  progress = 40,
}) => {
  return (
    <div className="package-card">
      <div className="package-card-img-wrap">
        <Link href={"/"} className="card-img">
          <img src={tour?.images[0]} alt="Oman Tour" />
        </Link>
        <div className="batch">
          <span className="date">{tour?.duration}</span>
          <div className="location">
            <ul className="location-list">
              {tour?.mainLocations?.map((mainLocat, index) => {
                return (
                  <li key={index}>
                    <Link href="/package">{mainLocat}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="date bottom-0 top-auto mt-2"
            style={{
              bottom: "0",
              top: "auto",
              backgroundColor:
                tour.status == "noStarted"
                  ? "orange"
                  : tour.status == "started"
                  ? "green"
                  : "#ef6161",
            }}
          >
            {tour.status == "noStarted"
              ? "Not started"
              : tour.status == "started"
              ? "Started"
              : "Finished"}
            {/* Not Started */}
          </div>
        </div>
      </div>
      <div className="package-card-content">
        <div className="card-content-top">
          <h5 style={{ height: "60px", overflow: "hidden" }}>
            <Link href={`/package/package-details/${tour?.id}`}>
              {tour?.title}
            </Link>
          </h5>
          <div className="location-area">
            <ul className="location-list scrollTextAni">
              {tour?.additionalLocations?.map((additLocat, index) => {
                return (
                  <li key={index}>
                    <Link href="/package">{additLocat}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div
          className="progress"
          style={{
            width: `${progress}%`,
            height: "4px",
            marginTop: "10px",
            backgroundColor: "#FFA63A",
          }}
        />

        <div className="card-content-bottom">
          <div className="price-area">
            <span>$2,898</span>
            <p>TAXES INCL/PERS</p>
          </div>
          <Link
            href={
              type == "profile" ? "/account/123" : "/package/package-details"
            }
            className="primary-btn2"
          >
            {type == "profile" ? "Show Details" : "Book a Trip"}
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
