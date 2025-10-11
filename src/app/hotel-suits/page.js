"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);
import Breadcrumb from "@/components/common/Breadcrumb";
import RoomSidebar from "@/components/sidebar/RoomSidebar";
import Link from "next/link";
import axios from "axios";
import { base_url } from "../../uitils/base_url";
const Page = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelsPerPage] = useState(6);

  const settings = useMemo(() => {
    return {
      slidesPerView: "auto",
      speed: 1500,
      spaceBetween: 25,
      effect: "fade",
      loop: true,
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination5",
        clickable: true,
      },
    };
  }, []);

  // Fetch hotels data
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${base_url}/user/hotels/get_all_hotels.php`
        );
        if (response?.data?.status == "success") {
          setHotels(response.data?.message || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotels");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Update filtered hotels when hotels data changes
  useEffect(() => {
    setFilteredHotels(hotels);
  }, [hotels]);

  // Handle filter changes from sidebar
  const handleFiltersChange = (filters) => {
    let filtered = [...hotels];

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (hotel) =>
          hotel.title
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          hotel.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          (hotel.country_name &&
            hotel.country_name
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())) ||
          (hotel.location &&
            hotel.location
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Apply star rating filters
    const selectedRatings = [];
    if (filters.starRatings.fiveStar) selectedRatings.push(5);
    if (filters.starRatings.fourHalfStar) selectedRatings.push(4.5);
    if (filters.starRatings.fourStar) selectedRatings.push(4);
    if (filters.starRatings.threeHalfStar) selectedRatings.push(3.5);
    if (filters.starRatings.threeStar) selectedRatings.push(3);
    if (filters.starRatings.twoHalfStar) selectedRatings.push(2.5);
    if (filters.starRatings.twoStar) selectedRatings.push(2);
    if (filters.starRatings.oneStar) selectedRatings.push(1);

    if (selectedRatings.length > 0) {
      filtered = filtered.filter((hotel) => {
        if (hotel.ratings && hotel.ratings.length > 0) {
          return selectedRatings.some(
            (rating) => Math.abs(hotel.ratings[0].score - rating) < 0.3
          );
        }
        return false;
      });
    }

    // Apply facilities filters
    const selectedFacilities = [];
    Object.keys(filters.facilities).forEach((key) => {
      if (filters.facilities[key]) {
        const facilityMap = {
          restaurant: "restaurant",
          gym: "gym",
          spa: "spa",
          parking: "parking",
          wifi: "wifi",
          swimmingPool: "pool",
          petFriendly: "pet",
          airportShuttle: "shuttle",
          locker: "locker",
        };
        if (facilityMap[key]) {
          selectedFacilities.push(facilityMap[key]);
        }
      }
    });

    if (selectedFacilities.length > 0) {
      filtered = filtered.filter((hotel) => {
        if (hotel.amenities && hotel.amenities.length > 0) {
          return selectedFacilities.some((facility) =>
            hotel.amenities.some(
              (amenity) =>
                amenity.id.toLowerCase().includes(facility) ||
                amenity.name.toLowerCase().includes(facility)
            )
          );
        }
        return false;
      });
    }

    setFilteredHotels(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Render star ratings
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="bi bi-star-fill" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="bi bi-star-half" />);
      } else {
        stars.push(<i key={i} className="bi bi-star" />);
      }
    }

    return stars;
  };

  // Render amenity icon
  const renderAmenityIcon = (amenity) => {
    const iconMap = {
      restaurant: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 18 18"
        >
          <g>
            <path d="M2.96092 0.994803C2.83436 1.06512 2.63748 1.34637 2.56365 1.56433C2.44412 1.9159 2.48631 2.38347 2.66561 2.67175C2.69373 2.72097 2.77811 2.83347 2.85193 2.92136C3.12615 3.25886 3.12967 3.53308 2.86248 3.8987C2.72537 4.08855 2.76404 4.31706 2.95389 4.4155C3.21053 4.54558 3.43553 4.39441 3.64646 3.94792C3.72732 3.77214 3.74139 3.70183 3.74139 3.41003C3.74139 3.11824 3.72732 3.04792 3.64646 2.87214C3.59373 2.75613 3.48475 2.59089 3.4074 2.49597C3.12615 2.15847 3.11912 1.88425 3.38982 1.51511C3.43904 1.44832 3.47771 1.36043 3.47771 1.31472C3.47771 1.04402 3.18943 0.868241 2.96092 0.994803Z" />
          </g>
        </svg>
      ),
      wifi: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 18 18"
        >
          <path d="M9.20926 0.0478783C9.16707 0.076004 9.09676 0.181473 9.05106 0.283426C8.98075 0.438112 8.96668 0.529518 8.96668 0.803738C8.96668 1.15882 9.01239 1.29592 9.20926 1.53147L9.29364 1.63342L9.15653 1.91116C8.91395 2.39983 8.8577 2.86389 8.98426 3.34905C9.10731 3.83069 9.40614 4.28772 9.78934 4.576L9.99676 4.73068L9.65574 5.26506L9.31824 5.79592L9.037 5.78889L8.75575 5.77834L8.42176 5.2967C8.01395 4.70959 7.9577 4.64983 7.73622 4.54436C7.53231 4.44943 7.21942 4.43537 7.00497 4.5092C6.56551 4.6674 6.29481 5.19475 6.42489 5.64474C6.46005 5.76076 6.63583 6.04553 6.9452 6.48498C7.85926 7.77873 7.76083 7.7049 8.60809 7.72248L9.1952 7.73654V8.24982V8.7631L8.51317 9.44865C7.60614 10.3697 7.67294 10.1799 7.65536 11.8252L7.64129 13.0908L7.40926 13.1963C6.89598 13.4283 6.55145 13.8502 6.43895 14.3811L6.41786 14.4795H5.87645H5.33153L5.31044 14.2756C5.20849 13.3229 4.65653 12.6971 3.73896 12.4967L3.64052 12.4756V10.1026C3.64052 8.79826 3.64755 7.72951 3.6581 7.72951C3.66513 7.72951 3.83388 7.81388 4.02724 7.91232C4.35771 8.08459 4.39989 8.09865 4.61786 8.09513C5.01864 8.09162 5.34559 7.89123 5.51786 7.5467C5.69364 7.19513 5.60927 6.73107 5.3245 6.48146C5.17684 6.35139 1.45732 4.2385 1.27099 4.17873C1.08466 4.11897 0.704976 4.15061 0.529195 4.24201C0.363961 4.32639 0.160055 4.53381 0.0686488 4.70607C-0.026273 4.88889 -0.0227574 5.31076 0.0791956 5.49709C0.198727 5.71857 0.335836 5.82404 0.996772 6.20373L1.61904 6.55529L1.63662 7.91935L1.65419 9.28341L1.75263 9.36779C1.87216 9.46974 1.94951 9.47326 2.07255 9.37833L2.16396 9.30802V8.09162C2.16396 7.36037 2.17802 6.88576 2.1956 6.89279C2.21318 6.89631 2.42763 7.01232 2.67021 7.14943L3.11318 7.39552V9.93732V12.4791L2.64911 12.4686L2.18154 12.458L2.16396 11.3928C2.14638 10.3873 2.14286 10.324 2.07958 10.2748C1.97763 10.201 1.79833 10.2115 1.72099 10.2994C1.65771 10.3697 1.65419 10.4471 1.64365 11.4209L1.6331 12.4721L1.07412 12.4826C0.574898 12.4932 0.504586 12.5002 0.420211 12.567C0.279586 12.669 0.195211 12.7955 0.160055 12.9537C0.117867 13.133 0.117867 17.0564 0.160055 17.2357C0.202242 17.4256 0.293648 17.5416 0.476461 17.633L0.631148 17.7139H8.56942C14.212 17.7139 16.5569 17.7033 16.6905 17.6752C17.1546 17.5803 17.6221 17.2146 17.819 16.7928C18.2444 15.8928 17.7839 14.8416 16.8346 14.5498C16.6413 14.49 16.5077 14.4795 15.9944 14.4795C15.6569 14.4795 15.3827 14.4725 15.3827 14.4619C15.3827 14.4514 15.5444 14.0119 15.7378 13.4846C16.1104 12.4861 16.1526 12.2998 16.0542 12.11C16.026 12.0572 15.9522 11.9869 15.896 11.9483C15.7694 11.8744 14.8202 11.5299 13.8534 11.21C13.4878 11.0869 13.1819 10.985 13.1749 10.9815C13.1714 10.9779 13.0729 10.5033 12.9604 9.93029L12.7565 8.88615L12.8936 8.17599C12.971 7.78576 13.0378 7.46232 13.0448 7.45529C13.0518 7.44826 13.1046 7.45177 13.1643 7.46584L13.2663 7.48693L13.2803 8.16193C13.2909 8.83341 13.2909 8.83693 13.3928 9.02326C13.5827 9.36427 13.9096 9.54357 14.2858 9.51544C14.5389 9.49786 14.7288 9.40646 14.9151 9.21661C15.1647 8.95646 15.1788 8.87912 15.1647 7.63459C15.1542 6.41467 15.1542 6.41818 14.8624 6.13693C14.7147 5.99279 14.4968 5.9049 13.3155 5.51115L12.7811 5.33185L12.5702 5.03654C12.4542 4.87482 12.3593 4.73068 12.3593 4.72014C12.3593 4.70959 12.4401 4.62522 12.5421 4.53732C13.0378 4.09084 13.3155 3.34553 13.312 2.45608C13.312 2.19944 13.2944 1.97444 13.2557 1.84085C13.08 1.16585 12.63 0.691236 11.9233 0.427567C11.8249 0.388893 11.5542 0.364285 11.0585 0.343191C10.2956 0.315065 10.1233 0.283426 9.66278 0.100613C9.36395 -0.0189171 9.31121 -0.0259495 9.20926 0.0478783Z" />
        </svg>
      ),
      gym: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 18 18"
        >
          <g>
            <path d="M0.683593 0.0562801C0.490234 0.123077 0.30039 0.288311 0.180859 0.485186L0.0859375 0.650419V7.20705V13.7637L0.163281 13.9043C0.251172 14.0695 0.423437 14.2383 0.595702 14.3297C0.711718 14.393 0.848827 14.3965 2.87382 14.407L5.02538 14.4176L5.11327 14.3297C5.21874 14.2242 5.22577 14.1012 5.13437 13.9887L5.06757 13.9043L2.93711 13.8867L0.80664 13.8691L0.711718 13.7707L0.61328 13.6758L0.602734 10.582L0.595702 7.4883H3.79492H6.99413V10.6875V13.8867H6.55468C6.30507 13.8867 6.08007 13.9043 6.03085 13.9254C5.85155 14.0063 5.83749 14.2875 6.00624 14.3754C6.05194 14.4035 6.8289 14.4141 8.39686 14.4141H10.7172L10.7277 15.8801C10.7383 17.3109 10.7418 17.3531 10.8156 17.4902C10.9035 17.6555 11.0758 17.8242 11.248 17.9156C11.364 17.9789 11.5117 17.9824 14.3242 17.9824H17.2773L17.4179 17.9051C17.6043 17.8066 17.766 17.6309 17.8539 17.4375C17.9242 17.2863 17.9277 17.2125 17.9277 15.3949C17.9277 13.2645 17.9312 13.2891 17.664 13.0254C17.5832 12.9445 17.4461 12.8496 17.3582 12.8145L17.1965 12.7547L17.1824 11.9215C17.1683 11.1797 17.1578 11.0672 17.0875 10.8457C16.8344 10.0582 16.2683 9.41486 15.5371 9.07736C15.2383 8.93673 14.8551 8.82423 14.6863 8.82423C14.4648 8.82423 14.4824 9.17228 14.4824 4.78479C14.4824 0.260185 14.5035 0.580107 14.2012 0.281281C13.8988 -0.02458 14.5246 3.05176e-05 7.26132 0.00354576C1.7664 0.00354576 0.803124 0.0140934 0.683593 0.0562801Z" />
          </g>
        </svg>
      ),
      spa: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 18 18"
        >
          <g>
            <path d="M1.88029 3.66674C1.30022 3.8601 0.92053 4.33823 0.885373 4.92182C0.811545 6.21908 2.35139 6.92221 3.26193 6.00463C3.4799 5.78666 3.61349 5.52651 3.66271 5.22768C3.76115 4.64057 3.43068 4.01479 2.88576 3.75463C2.68889 3.65971 2.60803 3.64213 2.33732 3.63159C2.14045 3.62456 1.96818 3.63862 1.88029 3.66674Z" />
          </g>
        </svg>
      ),
      parking: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 18 16"
        >
          <path d="M12.0937 0.0562334C11.9531 0.126546 11.8371 0.239046 11.7668 0.369123C11.714 0.46053 11.707 0.615218 11.707 1.55037C11.707 2.56287 11.7105 2.63318 11.7738 2.7035C11.8652 2.80545 12.041 2.80193 12.1394 2.69646C12.2168 2.61561 12.2168 2.591 12.2168 1.61365C12.2168 1.06522 12.2308 0.594124 12.2449 0.569514C12.2695 0.534358 12.8144 0.527327 14.857 0.534358L17.4375 0.544905L17.448 3.10779C17.4515 4.97107 17.4445 5.68474 17.4164 5.71638C17.3601 5.78318 12.3258 5.79021 12.259 5.72341C12.2273 5.69177 12.2168 5.46326 12.2168 4.9113C12.2168 4.4367 12.2027 4.11677 12.1781 4.07459C12.1254 3.96912 11.9777 3.92693 11.8582 3.97615C11.7035 4.03943 11.6824 4.18006 11.6965 5.02732C11.707 5.75857 11.7105 5.79021 11.7949 5.94138C11.8476 6.0363 11.939 6.12771 12.0234 6.17693C12.1605 6.25427 12.1887 6.25779 13.2293 6.25779H14.291V7.80466C14.291 9.05622 14.284 9.35153 14.2453 9.35153C14.0941 9.35153 13.5597 9.17927 13.2926 9.04567C13.1203 8.9613 12.5051 8.56755 11.9215 8.17732C10.6137 7.29138 10.3183 7.14021 9.61522 6.97497C9.39022 6.92575 9.09842 6.91169 7.59374 6.90114C6.42304 6.8906 5.69179 6.89763 5.40351 6.92575C4.46835 7.01013 3.77578 7.32302 3.02343 8.00153C2.41875 8.54294 1.96875 8.782 1.20234 8.9613C0.956249 9.02106 0.692577 9.10192 0.611718 9.14059C0.418359 9.24255 0.214453 9.46052 0.0984373 9.69606L0 9.89645V11.3906C0 12.7441 0.00703124 12.8953 0.0597655 12.9972C0.175781 13.2047 0.323437 13.3066 0.878905 13.5527L1.43086 13.8023L1.5082 14.0132C1.62422 14.3261 1.74375 14.5125 1.96523 14.7234C2.78789 15.5004 4.14843 15.2437 4.64062 14.2207L4.76718 13.957H9.01756H13.2644L13.391 14.2242C13.5914 14.6496 13.9957 14.9906 14.4492 15.1207C14.6988 15.191 15.2086 15.1769 15.4511 15.0925C15.8836 14.9449 16.2527 14.6109 16.4461 14.1996L16.5551 13.964L16.9066 13.95C17.114 13.9394 17.3144 13.9078 17.3918 13.8761C17.6097 13.7847 17.8312 13.5527 17.9121 13.3312C17.9824 13.1449 17.9859 13.0781 17.9754 12.2343C17.9613 11.2078 17.9472 11.1515 17.6273 10.6699C17.2371 10.0898 16.8468 9.87184 15.8308 9.66794L15.6269 9.62927V7.94528V6.2613L16.6043 6.25076L17.5851 6.24021L17.7152 6.13826C17.789 6.08201 17.8804 5.96951 17.9156 5.88513C17.9824 5.74099 17.9824 5.62498 17.9754 3.08318L17.9648 0.435921L17.8699 0.29178C17.8136 0.207405 17.7152 0.119514 17.6238 0.0738115C17.4691 -1.62125e-05 17.448 -1.62125e-05 14.8324 -1.62125e-05C12.5156 -1.62125e-05 12.1851 0.00701523 12.0937 0.0562334Z" />
        </svg>
      ),
    };

    return (
      iconMap[amenity.id] || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={16}
          height={16}
          viewBox="0 0 18 18"
        >
          <circle cx="9" cy="9" r="8" fill="currentColor" />
        </svg>
      )
    );
  };

  // Pagination logic
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate pagination numbers
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i}>
          <a
            href="#"
            className={currentPage === i ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              paginate(i);
            }}
          >
            {i}
          </a>
        </li>
      );
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pagename="Room & Suits" pagetitle="Room & Suits" />
        <div className="room-suits-page pt-120 mb-120">
          <div className="container">
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading hotels...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pagename="Room & Suits" pagetitle="Room & Suits" />
        <div className="room-suits-page pt-120 mb-120">
          <div className="container">
            <div className="text-center">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pagename="Room & Suits" pagetitle="Room & Suits" />
      <div className="room-suits-page pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-xl-4 order-lg-1 order-2">
              <RoomSidebar onFiltersChange={handleFiltersChange} />
            </div>
            <div className="col-xl-8 order-lg-2 order-1">
              {currentHotels.length === 0 ? (
                <div className="text-center">
                  <p>No hotels found matching your criteria.</p>
                  <p className="text-muted">
                    {filteredHotels.length === 0
                      ? "Try adjusting your filters to see more results."
                      : `Showing 0 of ${filteredHotels.length} hotels.`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-muted">
                      Showing {indexOfFirstHotel + 1}-
                      {Math.min(indexOfLastHotel, filteredHotels.length)} of{" "}
                      {filteredHotels.length} hotels
                    </p>
                  </div>

                  {currentHotels.map((hotel, index) => (
                    <div key={hotel.id} className="room-suits-card mb-30">
                      <div className="row g-0">
                        <div className="col-md-4">
                          <Swiper
                            {...settings}
                            className="swiper hotel-img-slider"
                          >
                            <span className="batch">
                              {hotel.duration || "Breakfast included"}
                            </span>
                            <div className="swiper-wrapper">
                              <SwiperSlide className="swiper-slide">
                                <div className="room-img">
                                  <img
                                    src={hotel.image?.split("//CAMP//")[0]}
                                    alt={hotel.title}
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/400x300/f0f0f0/666666?text=Hotel+Image";
                                    }}
                                  />
                                </div>
                              </SwiperSlide>
                              {hotel.background_image &&
                                hotel.background_image !== hotel.image && (
                                  <SwiperSlide className="swiper-slide">
                                    <div className="room-img">
                                      <img
                                        src={hotel.image?.split("//CAMP//")[0]}
                                        alt={hotel.title}
                                        onError={(e) => {
                                          e.target.src =
                                            "https://via.placeholder.com/400x300/f0f0f0/666666?text=Hotel+Image";
                                        }}
                                      />
                                    </div>
                                  </SwiperSlide>
                                )}
                            </div>
                            <div className="swiper-pagination5" />
                          </Swiper>
                        </div>
                        <div className="col-md-8">
                          <div className="room-content">
                            <div className="content-top">
                              <div className="reviews">
                                <ul>
                                  {hotel.ratings && hotel.ratings.length > 0 ? (
                                    renderStarRating(hotel.ratings[0].score)
                                  ) : (
                                    <>
                                      <li>
                                        <i className="bi bi-star-fill" />
                                      </li>
                                      <li>
                                        <i className="bi bi-star-fill" />
                                      </li>
                                      <li>
                                        <i className="bi bi-star-fill" />
                                      </li>
                                      <li>
                                        <i className="bi bi-star-fill" />
                                      </li>
                                      <li>
                                        <i className="bi bi-star-half" />
                                      </li>
                                    </>
                                  )}
                                </ul>
                                <span>
                                  {hotel.ratings && hotel.ratings.length > 0
                                    ? `${hotel.ratings[0].score} reviews`
                                    : "4.5 reviews"}
                                </span>
                              </div>
                              <h5>
                                <Link
                                  href={`hotel-suits/hotel-details?hotel=${hotel.id}`}
                                >
                                  {hotel.title}
                                </Link>
                              </h5>
                              <ul className="loaction-area">
                                <li>
                                  <i className="bi bi-geo-alt" />
                                  {hotel.location ||
                                    hotel.country_name ||
                                    "Location not specified"}
                                </li>
                              </ul>
                            </div>
                            <div className="content-bottom">
                              <div className="room-type"></div>
                              <div className="price-and-book">
                                <div className="price-area">
                                  <p>
                                    {`1 night , ${hotel.adults_num} adults` ||
                                      "1 night, 2 adults"}
                                  </p>
                                  <span>
                                    {hotel.price_currency}
                                    {hotel.price_current}
                                    {hotel.price_original &&
                                      hotel.price_original !==
                                        hotel.price_current && (
                                        <del>
                                          {" "}
                                          {hotel.price_currency}
                                          {hotel.price_original}
                                        </del>
                                      )}
                                  </span>
                                </div>
                                <div className="book-btn">
                                  <Link
                                    href={`hotel-suits/hotel-details?hotel=${hotel.id}`}
                                    className="primary-btn2"
                                  >
                                    {"Check Availability"}
                                    <i className="bi bi-arrow-right" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {totalPages > 1 && (
                <div className="row mt-70">
                  <div className="col-lg-12">
                    <nav className="inner-pagination-area">
                      <ul className="pagination-list">
                        <li>
                          <a
                            href="#"
                            className="shop-pagi-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) paginate(currentPage - 1);
                            }}
                            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                          >
                            <i className="bi bi-chevron-left" />
                          </a>
                        </li>

                        {renderPaginationNumbers()}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <li>
                            <a href="#">
                              <i className="bi bi-three-dots" />
                            </a>
                          </li>
                        )}

                        <li>
                          <a
                            href="#"
                            className="shop-pagi-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages)
                                paginate(currentPage + 1);
                            }}
                            style={{
                              opacity: currentPage === totalPages ? 0.5 : 1,
                            }}
                          >
                            <i className="bi bi-chevron-right" />
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
