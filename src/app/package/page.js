"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import SelectComponent from "@/uitils/SelectComponent";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <Breadcrumb pagename="Package Grid" pagetitle="Package Grid" />
      <div className="package-grid-with-sidebar-section pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-lg-8">
              <div className="package-inner-title-section mb-40">
                <p>Showing 1–12 of 101 results</p>
                <div className="selector-and-grid">
                  <div className="selector">
                    <SelectComponent
                      options={["Price Low to Hig", "Price High to Low"]}
                      placeholder="Default Sorting"
                    />
                  </div>
                  <ul className="grid-view">
                    <li className="grid active">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 14 14"
                      >
                        <mask
                          id="mask0_1631_19"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x={0}
                          y={0}
                          width={14}
                          height={14}
                        >
                          <rect width={14} height={14} fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_1631_19)">
                          <path d="M5.47853 6.08726H0.608726C0.272536 6.08726 0 5.81472 0 5.47853V0.608726C0 0.272536 0.272536 0 0.608726 0H5.47853C5.81472 0 6.08726 0.272536 6.08726 0.608726V5.47853C6.08726 5.81472 5.81472 6.08726 5.47853 6.08726Z" />
                          <path d="M13.3911 6.08726H8.52132C8.18513 6.08726 7.9126 5.81472 7.9126 5.47853V0.608726C7.9126 0.272536 8.18513 0 8.52132 0H13.3911C13.7273 0 13.9999 0.272536 13.9999 0.608726V5.47853C13.9999 5.81472 13.7273 6.08726 13.3911 6.08726Z" />
                          <path d="M5.47853 14.0013H0.608726C0.272536 14.0013 0 13.7288 0 13.3926V8.52279C0 8.1866 0.272536 7.91406 0.608726 7.91406H5.47853C5.81472 7.91406 6.08726 8.1866 6.08726 8.52279V13.3926C6.08726 13.7288 5.81472 14.0013 5.47853 14.0013Z" />
                          <path d="M13.3916 14.0013H8.52181C8.18562 14.0013 7.91309 13.7288 7.91309 13.3926V8.52279C7.91309 8.1866 8.18562 7.91406 8.52181 7.91406H13.3916C13.7278 7.91406 14.0003 8.1866 14.0003 8.52279V13.3926C14.0003 13.7288 13.7278 14.0013 13.3916 14.0013Z" />
                        </g>
                      </svg>
                    </li>
                    <li className="lists">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 14 14"
                      >
                        <mask
                          id="mask0_1631_3"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x={0}
                          y={0}
                          width={14}
                          height={14}
                        >
                          <rect width={14} height={14} fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_1631_3)">
                          <path d="M1.21747 2C0.545203 2 0 2.55848 0 3.24765C0 3.93632 0.545203 4.49433 1.21747 4.49433C1.88974 4.49433 2.43494 3.93632 2.43494 3.24765C2.43494 2.55848 1.88974 2 1.21747 2Z" />
                          <path d="M1.21747 5.75195C0.545203 5.75195 0 6.30996 0 6.99913C0 7.68781 0.545203 8.24628 1.21747 8.24628C1.88974 8.24628 2.43494 7.68781 2.43494 6.99913C2.43494 6.30996 1.88974 5.75195 1.21747 5.75195Z" />
                          <path d="M1.21747 9.50586C0.545203 9.50586 0 10.0643 0 10.753C0 11.4417 0.545203 12.0002 1.21747 12.0002C1.88974 12.0002 2.43494 11.4417 2.43494 10.753C2.43494 10.0643 1.88974 9.50586 1.21747 9.50586Z" />
                          <path d="M13.0845 2.31055H4.42429C3.91874 2.31055 3.50879 2.7305 3.50879 3.24886C3.50879 3.76677 3.91871 4.1867 4.42429 4.1867H13.0845C13.59 4.1867 14 3.76677 14 3.24886C14 2.7305 13.59 2.31055 13.0845 2.31055Z" />
                          <path d="M13.0845 6.06055H4.42429C3.91874 6.06055 3.50879 6.48047 3.50879 6.99886C3.50879 7.51677 3.91871 7.9367 4.42429 7.9367H13.0845C13.59 7.9367 14 7.51677 14 6.99886C14 6.48047 13.59 6.06055 13.0845 6.06055Z" />
                          <path d="M13.0845 9.81348H4.42429C3.91874 9.81348 3.50879 10.2334 3.50879 10.7513C3.50879 11.2692 3.91871 11.6891 4.42429 11.6891H13.0845C13.59 11.6891 14 11.2692 14 10.7513C14 10.2334 13.59 9.81348 13.0845 9.81348Z" />
                        </g>
                      </svg>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="list-grid-product-wrap mb-70">
                <div className="row gy-4">
                  <div className="col-md-6 item">
                    <div className="package-card">
                      <div className="package-card-img-wrap">
                        <Link
                          href="/package/package-details"
                          className="card-img"
                        >
                          <img
                            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903308/martijn-vonk-jxZ-gTYPf4g-unsplash_zwv8bx.jpg"
                            alt=""
                          />
                        </Link>
                        <div className="batch">
                          <span className="date">3 Days / 4 Night</span>
                          <div className="location">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                            >
                              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
                            </svg>
                            <ul className="location-list">
                              <li>
                                <Link href="/package">Nepal</Link>
                              </li>
                              <li>
                                <Link href="/package">Indonesia Tour</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="package-card-content">
                        <div className="card-content-top">
                          <h5>
                            <Link href="/package/package-details">
                              the Allure Italy's Rich Culture, History, and
                              Cuisine.
                            </Link>
                          </h5>
                          <div className="location-area">
                            <ul className="location-list scrollTextAni">
                              <li>
                                <Link href="/package">Alexandria</Link>
                              </li>
                              <li>
                                <Link href="/package">Sharm El Sheikh</Link>
                              </li>
                              <li>
                                <Link href="/package">Mansoura</Link>
                              </li>
                              <li>
                                <Link href="/package">Karachi</Link>
                              </li>
                              <li>
                                <Link href="/package">Lahore</Link>
                              </li>
                              <li>
                                <Link href="/package">Islamabad</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-content-bottom">
                          <div className="price-area">
                            <h6>Starting Form:</h6>
                            <span>
                              $2,898 <del>$3000</del>
                            </span>
                            <p>TAXES INCL/PERS</p>
                          </div>
                          <Link
                            href="/package/package-details"
                            className="primary-btn2"
                          >
                            Book a Trip
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
                  </div>
                  <div className="col-md-6 item">
                    <div className="package-card">
                      <div className="package-card-img-wrap">
                        <Link
                          href="/package/package-details"
                          className="card-img"
                        >
                          <img
                            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903890/hassan-altarazi-gP2i2agfPFE-unsplash_dlwjnr.jpg"
                            alt=""
                          />
                        </Link>
                        <div className="batch">
                          <span className="date">7 Days / 8 Night</span>
                          <div className="location">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                            >
                              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
                            </svg>
                            <ul className="location-list">
                              <li>
                                <Link href="/package">Egypt</Link>
                              </li>
                              <li>
                                <Link href="/package">Turkey Tour</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="package-card-content">
                        <div className="card-content-top">
                          <h5>
                            <Link href="/package/package-details">
                              Explore Travel NYC's Museums, Diversity, and
                              Energy.
                            </Link>
                          </h5>
                          <div className="location-area">
                            <ul className="location-list scrollTextAni">
                              <li>
                                <Link href="/package">Mecca</Link>
                              </li>
                              <li>
                                <Link href="/package">Medina</Link>
                              </li>
                              <li>
                                <Link href="/package">Riyadh</Link>
                              </li>
                              <li>
                                <Link href="/package">Doha</Link>
                              </li>
                              <li>
                                <Link href="/package">Al Wakrah</Link>
                              </li>
                              <li>
                                <Link href="/package">Al Rayyan</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-content-bottom">
                          <div className="price-area">
                            <h6>Starting Form:</h6>
                            <span>$3,256</span>
                            <p>TAXES INCL/PERS</p>
                          </div>
                          <Link
                            href="/package/package-details"
                            className="primary-btn2"
                          >
                            Book a Trip
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
                  </div>
                  <div className="col-md-6 item">
                    <div className="package-card">
                      <div className="package-card-img-wrap">
                        <Link
                          href="/package/package-details"
                          className="card-img"
                        >
                          <img
                            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903328/dilip-poddar-WFjbA52simE-unsplash_ko5ydj.jpg"
                            alt=""
                          />
                        </Link>
                        <div className="batch">
                          <span className="date">5 Days / 6 Night</span>
                          <div className="location">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                            >
                              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
                            </svg>
                            <ul className="location-list">
                              <li>
                                <Link href="/package">France</Link>
                              </li>
                              <li>
                                <Link href="/package">Spain Tour</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="package-card-content">
                        <div className="card-content-top">
                          <h5>
                            <Link href="/package/package-details">
                              Embark Tranquility, Adventure, and Spiritual.
                            </Link>
                          </h5>
                          <div className="location-area">
                            <ul className="location-list scrollTextAni">
                              <li>
                                <Link href="/package">Alexandria</Link>
                              </li>
                              <li>
                                <Link href="/package">Sharm El Sheikh</Link>
                              </li>
                              <li>
                                <Link href="/package">Mansoura</Link>
                              </li>
                              <li>
                                <Link href="/package">Karachi</Link>
                              </li>
                              <li>
                                <Link href="/package">Lahore</Link>
                              </li>
                              <li>
                                <Link href="/package">Islamabad</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-content-bottom">
                          <div className="price-area">
                            <h6>Starting Form:</h6>
                            <span>
                              $1,988 <del>$2500</del>
                            </span>
                            <p>TAXES INCL/PERS</p>
                          </div>
                          <Link
                            href="/package/package-details"
                            className="primary-btn2"
                          >
                            Book a Trip
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
                  </div>
                  <div className="col-md-6 item">
                    <div className="package-card">
                      <div className="package-card-img-wrap">
                        <Link
                          href="/package/package-details"
                          className="card-img"
                        >
                          <img
                            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903229/anish-mathew-jose-H5k_HyEYJsk-unsplash_opab4u.jpg"
                            alt=""
                          />
                        </Link>
                        <div className="batch">
                          <span className="date">8 Days / 9 Night</span>
                          <div className="location">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                            >
                              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
                            </svg>
                            <ul className="location-list">
                              <li>
                                <Link href="/package">India</Link>
                              </li>
                              <li>
                                <Link href="/package">Japan Tour</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="package-card-content">
                        <div className="card-content-top">
                          <h5>
                            <Link href="/package/package-details">
                              Embracing City Lights, Landm, and Iconic Culture.
                            </Link>
                          </h5>
                          <div className="location-area">
                            <ul className="location-list">
                              <li>
                                <Link href="/package">Bangalore</Link>
                              </li>
                              <li>
                                <Link href="/package">Chennai</Link>
                              </li>
                              <li>
                                <Link href="/package">New Delhi</Link>
                              </li>
                              <li>
                                <Link href="/package">Dhaka</Link>
                              </li>
                              <li>
                                <Link href="/package">Rangpur</Link>
                              </li>
                              <li>
                                <Link href="/package">Sylhet</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-content-bottom">
                          <div className="price-area">
                            <h6>Starting Form:</h6>
                            <span>$3,798</span>
                            <p>TAXES INCL/PERS</p>
                          </div>
                          <Link
                            href="/package/package-details"
                            className="primary-btn2"
                          >
                            Book a Trip
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
                  </div>
                  <div className="col-md-6 item">
                    <div className="package-card">
                      <div className="package-card-img-wrap">
                        <Link
                          href="/package/package-details"
                          className="card-img"
                        >
                          <img
                            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903193/chris-karidis-nnzkZNYWHaU-unsplash_iqwgll.jpg"
                            alt=""
                          />
                        </Link>
                        <div className="batch">
                          <span className="date">6 Days / 7 Night</span>
                          <div className="location">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                            >
                              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
                            </svg>
                            <ul className="location-list">
                              <li>
                                <Link href="/package">Brazil</Link>
                              </li>
                              <li>
                                <Link href="/package">Hungary Tour</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="package-card-content">
                        <div className="card-content-top">
                          <h5>
                            <Link href="/package/package-details">
                              A Journey of Tour Beauty and Inspiration.
                            </Link>
                          </h5>
                          <div className="location-area">
                            <ul className="location-list scrollTextAni">
                              <li>
                                <Link href="/package">Paris</Link>
                              </li>
                              <li>
                                <Link href="/package">Marseille</Link>
                              </li>
                              <li>
                                <Link href="/package">Bordeaux</Link>
                              </li>
                              <li>
                                <Link href="/package">Madrid</Link>
                              </li>
                              <li>
                                <Link href="/package">Barcelona</Link>
                              </li>
                              <li>
                                <Link href="/package">Valencia</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-content-bottom">
                          <div className="price-area">
                            <h6>Starting Form:</h6>
                            <span>
                              $4,562 <del>$5,000</del>
                            </span>
                            <p>TAXES INCL/PERS</p>
                          </div>
                          <Link
                            href="/package/package-details"
                            className="primary-btn2"
                          >
                            Book a Trip
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
                  </div>
                  <div className="col-md-6 item">
                    <div className="package-card">
                      <div className="package-card-img-wrap">
                        <Link
                          href="/package/package-details"
                          className="card-img"
                        >
                          <img
                            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903272/bijay-pakhrin-ejjRgncBkpg-unsplash_hpmf7e.jpg"
                            alt=""
                          />
                        </Link>
                        <div className="batch">
                          <span className="date">4 Days / 5 Night</span>
                          <div className="location">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                            >
                              <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
                            </svg>
                            <ul className="location-list">
                              <li>
                                <Link href="/package">Nepal</Link>
                              </li>
                              <li>
                                <Link href="/package">Indonesia Tour </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="package-card-content">
                        <div className="card-content-top">
                          <h5>
                            <Link href="/package/package-details">
                              Adventure Art, Architecture, and Mediterranean.
                            </Link>
                          </h5>
                          <div className="location-area">
                            <ul className="location-list scrollTextAni">
                              <li>
                                <Link href="/package">Kathmandu</Link>
                              </li>
                              <li>
                                <Link href="/package">Pokhara</Link>
                              </li>
                              <li>
                                <Link href="/package">Lalitpur</Link>
                              </li>
                              <li>
                                <Link href="/package">Jakarta</Link>
                              </li>
                              <li>
                                <Link href="/package">Surabaya</Link>
                              </li>
                              <li>
                                <Link href="/package">Bandung</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-content-bottom">
                          <div className="price-area">
                            <h6>Starting Form:</h6>
                            <span>
                              $5,320 <del>$5,500</del>
                            </span>
                            <p>TAXES INCL/PERS</p>
                          </div>
                          <Link
                            href="/package/package-details"
                            className="primary-btn2"
                          >
                            Book a Trip
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
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <nav className="inner-pagination-area">
                    <ul className="pagination-list">
                      <li>
                        <a href="#" className="shop-pagi-btn">
                          <i className="bi bi-chevron-left" />
                        </a>
                      </li>
                      <li>
                        <a href="#">1</a>
                      </li>
                      <li>
                        <a href="#" className="active">
                          2
                        </a>
                      </li>
                      <li>
                        <a href="#">3</a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="bi bi-three-dots" />
                        </a>
                      </li>
                      <li>
                        <a href="#">6</a>
                      </li>
                      <li>
                        <a href="#" className="shop-pagi-btn">
                          <i className="bi bi-chevron-right" />
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="sidebar-area">
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Activity</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">All Package</Link>
                    </li>
                    <li>
                      <Link href="/blog">Beaches</Link>
                    </li>
                    <li>
                      <Link href="/blog">City Tours</Link>
                    </li>
                    <li>
                      <Link href="/blog">Cruises</Link>
                    </li>
                    <li>
                      <Link href="/blog">Hiking</Link>
                    </li>
                    <li>
                      <Link href="/blog">Historical</Link>
                    </li>
                    <li>
                      <Link href="/blog">Museum Tours</Link>
                    </li>
                    <li>
                      <Link href="/blog">Adventure</Link>
                    </li>
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Destination</h5>
                  <ul className="category-list two">
                    <li>
                      <Link href="/blog">
                        Indonesia
                        <span>20</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Switzerland
                        <span>35</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Egypt
                        <span>25</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Saudi Arab
                        <span>18</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Europe
                        <span>06</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Bangladesh
                        <span>08</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Luxury Retreat
                        <span>15</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog">
                        Photography Expedition
                        <span>25</span>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Durations</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">1 - 2 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">2 - 3 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">4 - 5 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">6 - 7 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">8 - 9 Days Tour</Link>
                    </li>
                    <li>
                      <Link href="/blog">10 - 13 Days Tour</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default page;
