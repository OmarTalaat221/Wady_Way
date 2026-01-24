// components/activities/tabs/RaftingTab.jsx
"use client";
import React from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";

const RaftingTab = ({ setOpen }) => {
  return (
    <div className="verticle-tab-content-wrap">
      <div className="verticle-tab-content">
        <div className="eg-tag2">
          <span>Rafting</span>
        </div>
        <h2>Whitewater Rush: Thrilling Rafting Adventure</h2>
        <p>
          Ride through rapids, paddle through currents, and enjoy thrilling
          adventures with expert guides amidst stunning natural landscapes and
          excitement.
        </p>
        <ul>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Professional Guides
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Adventurous Rapids
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Scenic Landscapes
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Team Experience
          </li>
        </ul>
        <div className="content-bottom-area">
          <Link href="/activities/activities-details" className="primary-btn1">
            Check Availability
          </Link>
          <a
            style={{ cursor: "pointer" }}
            onClick={() => setOpen(true)}
            className="video-area video2"
          >
            <div className="icon">
              <svg
                className="video-circle"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="51px"
                viewBox="0 0 206 206"
                style={{ enableBackground: "new 0 0 206 206" }}
                xmlSpace="preserve"
              >
                <circle
                  className="circle"
                  strokeMiterlimit={10}
                  cx={103}
                  cy={103}
                  r={100}
                />
                <path
                  className="circle-half top-half"
                  strokeWidth={4}
                  strokeMiterlimit={10}
                  d="M16.4,53C44,5.2,105.2-11.2,153,16.4s64.2,88.8,36.6,136.6"
                />
                <path
                  className="circle-half bottom-half"
                  strokeWidth={4}
                  strokeMiterlimit={10}
                  d="M189.6,153C162,200.8,100.8,217.2,53,189.6S-11.2,100.8,16.4,53"
                />
              </svg>
              <i className="bi bi-play" />
            </div>
            <h6>Watch Adventure</h6>
          </a>
        </div>
      </div>
      <div className="verticle-tab-img">
        <div className="verticle-tab-img1 mb-[25px]">
          <LazyLoadImage
            width="246"
            height="180"
            className="object-cover h-[180px]"
            src="https://res.cloudinary.com/simpleview/image/upload/v1756727272/clients/norway/rafting_voss_A_smund_Aarsand_4_av_7__4a2841ba-91a6-40aa-bdf5-cec59fe97c0d.jpg"
            alt="Whitewater rafting"
          />
        </div>
        <div className="verticle-tab-img2">
          <LazyLoadImage
            width="246"
            height="300"
            className="object-cover h-[300px]"
            src="https://riverraftingkolad.in/wp-content/uploads/2025/02/River-Rafting-in-India.jpg"
            alt="Rafting team"
          />
        </div>
      </div>
    </div>
  );
};

export default RaftingTab;
