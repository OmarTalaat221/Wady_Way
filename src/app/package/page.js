"use client";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import SelectComponent from "@/uitils/SelectComponent";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { trips } from "../../data/trips";
import "./style.css";

const page = () => {
  const [shareModalOpen, setShareModalOpen] = useState(null);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const tourPackages = [
    {
      id: 1,
      name: "Discover Oman's Rich Culture and Scenic Beauty",
      country: ["Oman", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742904609/photo-1708417251007-4881585719f8_osxrfo.avif",
      duration: "5 Days / 6 Nights",
      mainLocations: ["Muscat", "Salalah Tour"],
      additionalLocations: ["Nizwa", "Sur", "Jebel Akhdar"],
      activities: ["Historical", "Adventure", "All Activities"],
      price: 2200,
      oldPrice: 2500,
      link: "/package/package-details",
    },
    {
      id: 2,
      name: "Luxury Escape in Dubai",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742904661/photo-1523212307269-b5645414b985_cq01gb.avif",
      duration: "6 Days / 7 Nights",
      mainLocations: ["Dubai", "Abu Dhabi"],
      additionalLocations: ["Palm Jumeirah", "Burj Khalifa", "Desert Safari"],
      activities: ["City Tours", "Beaches", "All Activities"],
      price: 2800,
      oldPrice: 3000,
      link: "/package/package-details",
    },
    {
      id: 3,
      name: "Abu Dhabi Cultural Experience",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742904732/photo-1512632578888-169bbbc64f33_ybsvn7.avif",
      duration: "4 Days / 5 Nights",
      mainLocations: ["Abu Dhabi", "Yas Island"],
      additionalLocations: ["Louvre Abu Dhabi", "Sheikh Zayed Mosque"],
      activities: ["Museum Tours", "Historical", "All Activities"],
      price: 1900,
      oldPrice: 2200,
      link: "/package/package-details",
    },
    {
      id: 4,
      name: "Qatar & UAE Twin Destination",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742904784/photo-1682953329199-1d4a39a46685_wl51pc.avif",
      duration: "7 Days / 8 Nights",
      mainLocations: ["Doha", "Dubai"],
      additionalLocations: ["The Pearl", "West Bay", "Burj Khalifa"],
      activities: ["City Tours", "Cruises", "All Activities"],
      price: 3500,
      oldPrice: 3800,
      link: "/package/package-details",
    },
    {
      id: 5,
      name: "Oman Desert & Mountain Adventure",
      country: ["Oman", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742904871/premium_photo-1724459312010-8be0677d5c87_zmuahg.avif",
      duration: "6 Days / 7 Nights",
      mainLocations: ["Muscat", "Wahiba Sands"],
      additionalLocations: ["Jebel Shams", "Nizwa", "Sur"],
      activities: ["Hiking", "Adventure", "All Activities"],
      price: 2600,
      oldPrice: 2900,
      link: "/package/package-details",
    },
    {
      id: 6,
      name: "Dubai & Sharjah Heritage Tour",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742904980/premium_photo-1678403506860-921189711433_z4ganc.avif",
      duration: "5 Days / 6 Nights",
      mainLocations: ["Dubai", "Sharjah"],
      additionalLocations: [
        "Al Fahidi District",
        "Museum of Islamic Civilization",
      ],
      activities: ["Museum Tours", "Historical", "All Activities"],
      price: 2300,
      oldPrice: 2500,
      link: "/package/package-details",
    },
    {
      id: 7,
      name: "The Best of UAE & Bahrain",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742905029/premium_photo-1697730171668-d0d018aeebb2_xz21ue.avif",
      duration: "9 Days / 10 Nights",
      mainLocations: ["Dubai", "Abu Dhabi", "Manama"],
      additionalLocations: [
        "Sheikh Zayed Mosque",
        "The Avenues",
        "Bahrain Fort",
      ],
      activities: ["Historical", "Beaches", "All Activities"],
      price: 4100,
      oldPrice: 4500,
      link: "/package/package-details",
    },
    {
      id: 8,
      name: "Saudi Arabia & UAE Grand Tour",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742905192/photo-1551541711-489a256cd2a2_cwa7an.avif",
      duration: "10 Days / 11 Nights",
      mainLocations: ["Riyadh", "Jeddah", "Dubai"],
      additionalLocations: ["Kingdom Tower", "Al Balad", "Palm Jumeirah"],
      activities: ["City Tours", "Adventure", "All Activities"],
      price: 4800,
      oldPrice: 5000,
      link: "/package/package-details",
    },
    {
      id: 9,
      name: "Magical Oman & UAE Experience",
      country: ["Oman", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742905241/photo-1585134339424-0fc98d0bfe86_gag9pu.avif",
      duration: "8 Days / 9 Nights",
      mainLocations: ["Muscat", "Dubai"],
      additionalLocations: ["Jebel Akhdar", "Desert Safari", "Burj Khalifa"],
      activities: ["Adventure", "Hiking", "All Activities"],
      price: 3300,
      oldPrice: 3600,
      link: "/package/package-details",
    },
    {
      id: 10,
      name: "Doha & Abu Dhabi Highlights",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742905277/photo-1491577707151-ca4a8c3cb790_yfxxrl.avif",
      duration: "7 Days / 8 Nights",
      mainLocations: ["Doha", "Abu Dhabi"],
      additionalLocations: ["Katara Cultural Village", "Ferrari World"],
      activities: ["City Tours", "Adventure", "All Activities"],
      price: 3000,
      oldPrice: null,
      link: "/package/package-details",
    },
    {
      id: 11,
      name: "Desert Safari & Arabian Nights",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742905319/photo-1489493173507-6feea31f12ff_imjk6x.avif",
      duration: "5 Days / 6 Nights",
      mainLocations: ["Dubai", "Sharjah"],
      additionalLocations: ["Desert Safari", "Bedouin Camp Experience"],
      activities: ["Adventure", "Cruises", "All Activities"],
      price: 2500,
      oldPrice: 2700,
      link: "/package/package-details",
    },
    {
      id: 12,
      name: "Ultimate UAE Adventure",
      country: ["UAE", "All countries"],
      image:
        "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742905359/premium_photo-1664472621011-9a0e68e69b81_roozcf.avif",
      duration: "10 Days / 11 Nights",
      mainLocations: ["Dubai", "Abu Dhabi", "Fujairah"],
      additionalLocations: ["Yas Waterworld", "The Louvre", "Dibba"],
      activities: ["Beaches", "Adventure", "All Activities"],
      price: 4500,
      oldPrice: 4900,
      link: "/package/package-details",
    },
  ];

  const [SortedArray, setSortedArray] = useState(trips);
  const [ActivityFilter, setActivityFilter] = useState("All Activities");
  const [TourCountryFilter, setTourCountryFilter] = useState("All countries");
  const [favorites, setFavorites] = useState({});
  const [animatedId, setAnimatedId] = useState(null);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("tripFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tripFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    const newFavorites = { ...favorites };
    newFavorites[id] = !newFavorites[id];
    setFavorites(newFavorites);
    localStorage.setItem("tripFavorites", JSON.stringify(newFavorites));

    // Dispatch custom event for header to listen
    const event = new Event("storage");
    window.dispatchEvent(event);

    // Add animation class
    setAnimatedId(id);
    setTimeout(() => {
      setAnimatedId(null);
    }, 600);
  };

  const toggleShareModal = (id) => {
    if (shareModalOpen === id) {
      setShareModalOpen(null);
    } else {
      setShareModalOpen(id);
    }
  };

  const closeShareModal = () => {
    setShareModalOpen(null);
  };

  const shareOnFacebook = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
    closeShareModal();
  };

  const shareOnWhatsapp = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    const message = `Check out this amazing tour: ${tour.title} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    closeShareModal();
  };

  const copyToClipboard = (tour) => {
    const url = `${window.location.origin}/package/package-details/${tour.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopyAlert(true);
      setTimeout(() => {
        setShowCopyAlert(false);
      }, 2500);
      closeShareModal();
    });
  };

  const handelSortPackages = (selectedSort) => {
    console.log(selectedSort);

    let sortedArray = [...trips];

    if (selectedSort === "Price Low to High") {
      sortedArray.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "Price High to Low") {
      sortedArray.sort((a, b) => b.price - a.price);
    }

    setSortedArray(sortedArray);
  };

  const ActivitiesCategories = [
    "All Activities",
    "Beaches",
    "City Tours",
    "Cruises",
    "Hiking",
    "Historical",
    "Museum Tours",
    "Adventure",
  ];

  const TourCountry = ["All countries", "UAE", "Oman"];

  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <Breadcrumb pagename="Package Grid" pagetitle="Package Grid" />

      {/* Copy to clipboard notification */}
      <div className={`copy-alert ${showCopyAlert ? "show" : ""}`}>
        Link copied to clipboard!
      </div>
      <div className="package-grid-with-sidebar-section pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-lg-8">
              <div className="package-inner-title-section mb-10">
                <p>Showing 1–12 of {trips?.length} results</p>
                <div className="selector-and-grid">
                  <div className="selector">
                    <SelectComponent
                      options={["Price Low to High", "Price High to Low"]}
                      placeholder="Default Sorting"
                      sortFunc={handelSortPackages}
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
              <div className="list-grid-product-wrap mb-[70px]">
                <div className="row gy-4">
                  {SortedArray.filter((filter) =>
                    filter.activities.some(
                      (activity) => activity == ActivityFilter
                    )
                  ).map((tour, index) => {
                    console.log(tour);

                    return (
                      <div className="col-md-6 item" key={index}>
                        <div className="package-card">
                          <div className="package-card-img-wrap">
                            <Link href={"/"} className="card-img">
                              <img src={tour?.images[0]} alt="Oman Tour" />
                            </Link>
                            <div
                              className={`favorite-btn ${
                                favorites[tour.id] ? "active" : ""
                              } ${animatedId === tour.id ? "animate" : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(tour.id);
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </div>

                            {/* Share Button */}
                            <div
                              className="share-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleShareModal(tour.id);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                              </svg>
                            </div>

                            {/* Share Options Modal */}
                            <div
                              className={`share-options ${
                                shareModalOpen === tour.id ? "show" : ""
                              }`}
                            >
                              <div
                                className="share-option facebook"
                                onClick={() => shareOnFacebook(tour)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                                </svg>
                                <span>Facebook</span>
                              </div>
                              <div
                                className="share-option whatsapp"
                                onClick={() => shareOnWhatsapp(tour)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>WhatsApp</span>
                              </div>

                              <div
                                className="share-option copy"
                                onClick={() => copyToClipboard(tour)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                </svg>
                                <span>Copy Link</span>
                              </div>
                            </div>

                            {/* Backdrop for closing modal when clicking outside */}
                            {shareModalOpen === tour.id && (
                              <div
                                className="share-backdrop show"
                                onClick={closeShareModal}
                              ></div>
                            )}
                            <div className="batch">
                              <span className="date">{tour?.duration}</span>
                              <div className="location">
                                <ul className="location-list">
                                  {tour?.mainLocations?.map(
                                    (mainLocat, index) => {
                                      return (
                                        <li key={index}>
                                          <Link href="/package">
                                            {mainLocat}
                                          </Link>
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="package-card-content">
                            <div className="card-content-top">
                              <h5
                                style={{ height: "60px", overflow: "hidden" }}
                              >
                                <Link
                                  href={`/package/package-details/${tour?.id}`}
                                >
                                  {tour?.title}
                                </Link>
                              </h5>
                              <div className="location-area">
                                <ul className="location-list scrollTextAni">
                                  {tour?.additionalLocations?.map(
                                    (additLocat, index) => {
                                      return (
                                        <li key={index}>
                                          <Link href="/package">
                                            {additLocat}
                                          </Link>
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </div>
                            </div>
                            <div className="card-content-bottom">
                              <div className="price-area">
                                <h6>Starting From:</h6>
                                <span>
                                  {tour?.oldPrice}$ <del>{tour?.price}$ </del>
                                </span>
                                <p>TAXES INCL/PERS</p>
                              </div>
                              <Link
                                href={`/package/package-details/${tour?.id}`}
                                className="primary-btn2"
                              >
                                Book a Trip
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* <div className="row">
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
              </div> */}
            </div>
            <div className="col-lg-4">
              <div className="sidebar-area">
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Activity</h5>
                  <ul className="category-list">
                    {ActivitiesCategories.map((activity, index) => {
                      return (
                        <li
                          key={index}
                          className={
                            ActivityFilter == activity ? "selected_filter" : ""
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <a
                            onClick={() => {
                              setActivityFilter(activity);
                              console.log(activity);
                            }}
                          >
                            {activity}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Destination</h5>
                  <ul className="category-list two">
                    {TourCountry.map((country, index) => {
                      return (
                        <li
                          key={index}
                          className={
                            TourCountryFilter == country
                              ? "selected_filter"
                              : ""
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <a
                            onClick={() => {
                              setTourCountryFilter(country);
                              console.log(country);
                            }}
                          >
                            {country}
                          </a>
                        </li>
                      );
                    })}
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
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Season</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">Winter</Link>
                    </li>
                    <li>
                      <Link href="/blog">Spring</Link>
                    </li>
                    <li>
                      <Link href="/blog">Summer</Link>
                    </li>
                    <li>
                      <Link href="/blog">Autumn</Link>
                    </li>
                  </ul>
                </div>
                <div className="single-widget mb-30">
                  <h5 className="widget-title">Vibes</h5>
                  <ul className="category-list">
                    <li>
                      <Link href="/blog">Nature & Escape</Link>
                    </li>
                    <li>
                      <Link href="/blog">Urban Adventure</Link>
                    </li>
                    <li>
                      <Link href="/blog">Beach & Chill</Link>
                    </li>
                    <li>
                      <Link href="/blog">Wanderlust & Exploration</Link>
                    </li>
                    <li>
                      <Link href="/blog">Cultural & Festive</Link>
                    </li>
                    <li>
                      <Link href="/blog">Wellness & Zen</Link>
                    </li>
                    <li>
                      <Link href="/blog">Aesthetic & Instagrammable</Link>
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
