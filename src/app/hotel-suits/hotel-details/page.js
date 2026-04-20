"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ReactDatePicker from "react-datepicker";
import QuantityCounter from "@/uitils/QuantityCounter";

import { useSearchParams } from "next/navigation";
import axios from "axios";
import { base_url } from "../../../uitils/base_url";
import { Drawer } from "antd";
import { FaPlus, FaMinus, FaHotel } from "react-icons/fa6";
import moment from "moment";

import ReviewModal from "../../../components/reviews/ReviewModal";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";
import GallerySection from "../../package/package-details/[packageId]/_components/GallerySection";
import toast from "react-hot-toast";

const Page = () => {
  const [dateRange, setDateRange] = useState([
    new Date(),
    moment().add(1, "day").toDate(),
  ]);
  const [startDate, endDate] = dateRange;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  // ✅ Rooms start EMPTY - user must distribute manually
  const [rooms, setRooms] = useState([
    { id: 1, adults: 0, children: 0, babies: 0 },
  ]);
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);

  const [infants, setInfants] = useState(0);

  const handleAdultQuantityChange = (newQuantity) => {
    setAdults(newQuantity);
  };

  const handleChildQuantityChange = (newQuantity) => {
    setChildren(newQuantity);
  };

  const handleInfantQuantityChange = (newQuantity) => {
    setInfants(newQuantity);
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const [hotelData, setHotelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [user, setUser] = useState(null);

  const confirmModalRef = useRef(null);
  const bookingModalRef = useRef(null);

  const searchParams = useSearchParams();
  const hotelID = searchParams.get("hotel");

  const {
    inviteCode,
    hasStoredCode,
    isLoading: inviteCodeLoading,
    setManualInviteCode,
    clearCurrentInviteCode,
  } = useInviteCode(INVITE_CODE_TYPES.HOTEL, hotelID);

  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);

  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);
  const openBookingModal = () => setIsBookingModalOpen(true);
  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingSuccess(false);
    setBookingError(null);
    setBookingLoading(false);
  };

  const handleModalOutsideClick = (e, modalRef, closeFunction) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeFunction();
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (hotelID) {
      fetchHotelData();
    }
  }, [hotelID]);

  const perRoom = useMemo(() => {
    return parseInt(hotelData?.per_room) || 4;
  }, [hotelData?.per_room]);

  const addRoom = () => {
    if (rooms.length >= 5) {
      toast.error("Maximum 5 rooms allowed");
      return;
    }
    setRooms((prev) => [
      ...prev,
      { id: Date.now(), adults: 0, children: 0, babies: 0 },
    ]);
  };

  const removeRoom = (roomId) => {
    if (rooms.length <= 1) return;
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  const handleRoomChange = (action, roomId, type) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;

        if (type === "babies") {
          const currentTotalBabies = prev.reduce((sum, r) => sum + r.babies, 0);
          if (action === "increase") {
            if (currentTotalBabies >= infants) {
              toast.error("All infants have been distributed");
              return room;
            }
            return { ...room, babies: room.babies + 1 };
          } else {
            return { ...room, babies: Math.max(0, room.babies - 1) };
          }
        }

        const currentTotal = prev.reduce(
          (sum, r) => sum + (type === "adults" ? r.adults : r.children),
          0
        );
        const max = type === "adults" ? adults : children;

        if (action === "increase") {
          if (currentTotal >= max) {
            toast.error(`All ${type} have been distributed`);
            return room;
          }
          const roomOccupancy = room.adults + room.children;
          if (roomOccupancy >= perRoom) {
            toast.error(
              `Maximum ${perRoom} guests (adults + children) per room`
            );
            return room;
          }
          return { ...room, [type]: room[type] + 1 };
        } else {
          return { ...room, [type]: Math.max(0, room[type] - 1) };
        }
      })
    );
  };

  // ✅ Check if distribution is complete (for UI indicators)
  const isDistributionComplete = useMemo(() => {
    const totalDistributedAdults = rooms.reduce((s, r) => s + r.adults, 0);
    const totalDistributedChildren = rooms.reduce((s, r) => s + r.children, 0);
    const totalDistributedBabies = rooms.reduce((s, r) => s + r.babies, 0);

    const adultsOk = totalDistributedAdults === adults;
    const childrenOk = totalDistributedChildren === children;
    const babiesOk = infants === 0 || totalDistributedBabies === infants;

    const noChildAlone = !rooms.some((r) => r.adults === 0 && r.children > 0);
    const noEmptyRoom = !rooms.some(
      (r) => r.adults === 0 && r.children === 0 && r.babies === 0
    );
    const noOverCapacity = !rooms.some((r) => r.adults + r.children > perRoom);

    return (
      adultsOk &&
      childrenOk &&
      babiesOk &&
      noChildAlone &&
      noEmptyRoom &&
      noOverCapacity
    );
  }, [rooms, adults, children, infants, perRoom]);

  const validateRoomDistribution = () => {
    const totalDistributedAdults = rooms.reduce((s, r) => s + r.adults, 0);
    const totalDistributedChildren = rooms.reduce((s, r) => s + r.children, 0);
    const totalDistributedBabies = rooms.reduce((s, r) => s + r.babies, 0);

    if (totalDistributedAdults !== adults) {
      toast.error(`Please distribute all ${adults} adults across rooms`);
      return false;
    }
    if (totalDistributedChildren !== children) {
      toast.error(`Please distribute all ${children} children across rooms`);
      return false;
    }
    if (infants > 0 && totalDistributedBabies !== infants) {
      toast.error(`Please distribute all ${infants} infants across rooms`);
      return false;
    }

    const childAlone = rooms.some((r) => r.adults === 0 && r.children > 0);
    if (childAlone) {
      toast.error("Children cannot stay alone in a room");
      return false;
    }

    const emptyRoom = rooms.some(
      (r) => r.adults === 0 && r.children === 0 && r.babies === 0
    );
    if (emptyRoom) {
      toast.error("Please remove empty rooms or assign guests");
      return false;
    }

    const overCapacity = rooms.some((r) => r.adults + r.children > perRoom);
    if (overCapacity) {
      toast.error(
        `Each room can hold maximum ${perRoom} guests (adults + children)`
      );
      return false;
    }

    return true;
  };

  // ✅ Confirm only works if distribution is valid
  const confirmRoomSelection = () => {
    if (validateRoomDistribution()) {
      setIsRoomDrawerOpen(false);
      toast.success(`${rooms.length} room(s) configured successfully`);
    }
  };

  // ✅ Reset rooms to EMPTY when guests change - user must redistribute
  useEffect(() => {
    setRooms([{ id: 1, adults: 0, children: 0, babies: 0 }]);
  }, [adults, children, infants]);

  const fetchHotelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${base_url}/user/hotels/hotel_by_id.php`,
        { hotel_id: hotelID },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        setHotelData(response.data.message[0]);
      } else {
        const errorMsg = response.data.message || "Failed to fetch hotel data";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Network error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const { adultPrice, childPrice, totalDays } = useMemo(() => {
    if (!startDate || !endDate) {
      return {
        adultPrice: parseFloat(hotelData?.adult_price) || 0,
        childPrice: parseFloat(hotelData?.child_price) || 0,
        totalDays: 0,
      };
    }

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const adultRate = parseFloat(hotelData?.adult_price) || 0;
    const childRate = parseFloat(hotelData?.child_price) || 0;

    return {
      adultPrice: isNaN(adultRate) ? 0 : adultRate,
      childPrice: isNaN(childRate) ? 0 : childRate,
      totalDays: Math.max(0, days),
    };
  }, [startDate, endDate, hotelData?.adult_price, hotelData?.child_price]);

  const maxAdultQuantity = 99;
  const maxChildQuantity = 99;
  const maxInfantQuantity = 99;
  const maxPeople = null;

  const calculateTotal = useMemo(() => {
    if (
      !hotelData ||
      totalDays <= 0 ||
      isNaN(adultPrice) ||
      isNaN(childPrice)
    ) {
      return 0;
    }
    const total =
      adultPrice * adults * totalDays + childPrice * children * totalDays;
    return Math.max(0, total);
  }, [hotelData, adultPrice, childPrice, adults, children, totalDays]);

  const handleDateChange = (update) => {
    if (update && update[0] && update[1]) {
      if (update[1] <= update[0]) {
        const nextDay = moment(update[0]).add(1, "day").toDate();
        setDateRange([update[0], nextDay]);
        toast.error(
          "Check-out date has been adjusted to be after check-in date"
        );
        return;
      }
    }
    setDateRange(update);
  };

  const formatRoomsForAPI = useCallback(() => {
    return rooms.map((room) => ({
      adults: room.adults.toString(),
      kids: room.children.toString(),
      babies: room.babies.toString(),
    }));
  }, [rooms]);

  // ✅ handleBooking - ALWAYS validates rooms, opens drawer if not distributed
  const handleBooking = async (e) => {
    e.preventDefault();

    if (maxPeople && adults + children > maxPeople) {
      toast.error(`Maximum ${maxPeople} people allowed for this hotel`);
      return;
    }
    if (!user || !user.isLoggedIn) {
      toast.error("Please login to make a booking");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    const validationErrors = [];

    if (!startDate || !endDate) {
      validationErrors.push("Please select check-in and check-out dates");
    }

    if (startDate && endDate && startDate >= endDate) {
      validationErrors.push("Check-out date must be after check-in date");
    }

    if (!hotelData || !hotelID) {
      validationErrors.push("Hotel information not available");
    }

    const today = moment().startOf("day");
    if (startDate && moment(startDate).isBefore(today)) {
      validationErrors.push("Check-in date cannot be in the past");
    }

    if (totalDays <= 0) {
      validationErrors.push("Invalid date range selected");
    }

    if (adults <= 0) {
      validationErrors.push("At least one adult is required");
    }

    if (validationErrors.length > 0) {
      validationErrors.forEach((err) => toast.error(err));
      return;
    }

    // ✅ ALWAYS check room distribution - open drawer if not complete
    if (!isDistributionComplete) {
      toast.error("Please distribute all guests across rooms first");
      setIsRoomDrawerOpen(true);
      return;
    }

    openConfirmModal();
  };

  const handleConfirmBooking = async () => {
    try {
      closeConfirmModal();
      openBookingModal();
      setBookingLoading(true);
      setBookingSuccess(false);
      setBookingError(null);

      const bookingData = {
        user_id: user.user_id || user.id || "1",
        hotel_id: hotelID,
        aditional_services: "",
        total_amount: calculateTotal.toString(),
        start_date: moment(startDate).format("YYYY-MM-DD"),
        end_date: moment(endDate).format("YYYY-MM-DD"),
        invite_code: inviteCode || "",
        rooms: formatRoomsForAPI(),
      };

      console.log("Booking data being sent:", bookingData);

      const response = await axios.post(
        `${base_url}/user/hotels/reserve_hotel.php`,
        bookingData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success === "success") {
        setBookingSuccess(true);
        setBookingError(null);
        clearCurrentInviteCode();

        setTimeout(() => {
          const tomorrow = moment().add(1, "day").toDate();
          setDateRange([new Date(), tomorrow]);
          setAdults(1);
          setChildren(0);
          setInfants(0);
        }, 2000);
      } else {
        setBookingSuccess(false);
        setBookingError(
          response.data.message || "Booking failed. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Network error occurred during booking";
      setBookingSuccess(false);
      setBookingError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const images = useMemo(() => {
    if (hotelData?.image && hotelData.image.split("//CAMP//")?.length > 0) {
      return hotelData.image.split("//CAMP//").map((image, index) => ({
        id: index + 1,
        imageBig: image,
      }));
    }
    return [{ id: 1, imageBig: "/path/to/default-hotel-image.jpg" }];
  }, [hotelData?.image]);

  const extractedVideoId = useMemo(() => {
    return extractYouTubeVideoId(hotelData?.video_link);
  }, [hotelData?.video_link]);

  const amenities = useMemo(() => {
    if (!hotelData?.amenities || !Array.isArray(hotelData.amenities)) return [];
    return hotelData.amenities.filter((a) => a.name || a.label);
  }, [hotelData?.amenities]);

  // ✅ Distribution progress for UI
  const distributionProgress = useMemo(() => {
    const distributedAdults = rooms.reduce((s, r) => s + r.adults, 0);
    const distributedChildren = rooms.reduce((s, r) => s + r.children, 0);
    const distributedBabies = rooms.reduce((s, r) => s + r.babies, 0);

    return {
      adults: { distributed: distributedAdults, total: adults },
      children: { distributed: distributedChildren, total: children },
      babies: { distributed: distributedBabies, total: infants },
      remainingAdults: adults - distributedAdults,
      remainingChildren: children - distributedChildren,
      remainingBabies: infants - distributedBabies,
    };
  }, [rooms, adults, children, infants]);

  if (loading || inviteCodeLoading) {
    return (
      <>
        <Breadcrumb pagename="Hotel Details" pagetitle="Hotel Details" />
        <div className="loading-container text-center py-5">
          <div
            className="spinner-border"
            style={{ color: "#295557" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading hotel details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pagename="Hotel Details" pagetitle="Hotel Details" />
        <div className="error-container text-center py-5">
          <div className="alert alert-danger" role="alert">
            <h4>Error Loading Hotel Details</h4>
            <p>{error}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!hotelData) {
    return (
      <>
        <Breadcrumb pagename="Hotel Details" pagetitle="Hotel Details" />
        <div className="error-container text-center py-5">
          <div className="alert alert-warning" role="alert">
            <h4>Hotel Not Found</h4>
            <p>The requested hotel could not be found.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const formatCurrency = (amount) => {
    const currency = hotelData.price_currency || "$";
    return `${currency}${parseFloat(amount || 0).toFixed(0)}`;
  };

  return (
    <>
      <Breadcrumb pagename="Hotel Details" pagetitle="Hotel Details" />
      <div className="room-details-area pt-120 mb-120">
        <div className="container">
          <div className="row">
            <GallerySection
              images={images}
              videoId={extractedVideoId}
              setOpenimg={setOpenimg}
              isOpenimg={isOpenimg}
              isOpen={isOpen}
              setOpen={setOpen}
            />
          </div>

          <div className="row g-xl-4 gy-5">
            <div className="col-xl-8">
              <h2>{hotelData?.name || "Hotel Name"}</h2>

              <div className="price-area">
                <div className="flex items-center gap-3">
                  <div className="tour-price">
                    <h3>{formatCurrency(adultPrice)}/</h3>
                    <span>adult</span>
                  </div>
                  <div className="tour-price">
                    <h3 className="!text-[rgb(226,155,75)]">&</h3>
                  </div>
                  <div className="tour-price">
                    <h3>{formatCurrency(childPrice)}/</h3>
                    <span>child</span>
                  </div>
                </div>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: hotelData?.description,
                }}
              />

              {amenities.length > 0 && (
                <>
                  <h4>Highlights</h4>
                  <ul className="room-features">
                    {amenities.map((amenity, index) => (
                      <li key={amenity.id || index}>
                        {amenity.icon ? (
                          <span
                            className="inline-flex items-center justify-center w-[30px] h-[30px] shrink-0"
                            dangerouslySetInnerHTML={{ __html: amenity.icon }}
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-[30px] h-[30px] shrink-0 text-[#295557]">
                            <svg
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        {amenity.name || amenity.label}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4>Children and extra beds</h4>
              <p>
                {hotelData?.children_policy ||
                  "Children are welcome! Kids stay free when using existing bedding. Additional bed charges may apply."}
              </p>

              {perRoom && (
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 mt-3 mb-4 bg-gray-50">
                  <FaHotel className="text-[#295557] shrink-0" />
                  <span className="text-sm text-gray-700">
                    <strong>Room Capacity:</strong> Maximum {perRoom} guests
                    (adults + children) per room. Infants are not counted.
                  </span>
                </div>
              )}

              <div className="review-wrapper mt-70">
                <h4>Customer Review</h4>
                <div className="review-box">
                  <div className="total-review">
                    <h2>{hotelData?.overall_rating || "9.5"}</h2>
                    <div className="review-wrap">
                      <ul className="star-list">
                        {[...Array(5)].map((_, i) => (
                          <li key={i}>
                            <i
                              className={
                                i < 4 ? "bi bi-star-fill" : "bi bi-star-half"
                              }
                            />
                          </li>
                        ))}
                      </ul>
                      <span>{hotelData?.total_reviews || "2590"} Reviews</span>
                    </div>
                  </div>
                  <button
                    className="primary-btn1"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    GIVE A RATING
                  </button>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="booking-form-wrap mb-30">
                <h4>Book Your Room</h4>
                <p>
                  Reserve your ideal room early for a hassle-free trip; secure
                  comfort and convenience!
                </p>

                <div className="tab-content" id="v-pills-tabContent2">
                  <div
                    className="tab-pane fade active show"
                    id="v-pills-booking"
                    role="tabpanel"
                    aria-labelledby="v-pills-booking-tab"
                  >
                    <div className="sidebar-booking-form">
                      <form onSubmit={handleBooking}>
                        <div className="tour-date-wrap mb-[30px]">
                          <div className="form-check !pl-0 customdate">
                            <span className="form-group">
                              <ReactDatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Check In & Out Date"
                                onChange={handleDateChange}
                                withPortal
                                minDate={new Date()}
                                className="form-control"
                                isClearable={false}
                              />
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={15}
                                height={15}
                                viewBox="0 0 15 15"
                              >
                                <path d="M10.3125 7.03125C10.3125 6.90693 10.3619 6.7877 10.4498 6.69979C10.5377 6.61189 10.6569 6.5625 10.7812 6.5625H11.7188C11.8431 6.5625 11.9623 6.61189 12.0502 6.69979C12.1381 6.7877 12.1875 6.90693 12.1875 7.03125V7.96875C12.1875 8.09307 12.1381 8.2123 12.0502 8.30021C11.9623 8.38811 11.8431 8.4375 11.7188 8.4375H10.7812C10.6569 8.4375 10.5377 8.38811 10.4498 8.30021C10.3619 8.2123 10.3125 8.09307 10.3125 7.96875V7.03125Z" />
                                <path d="M3.28125 0C3.40557 0 3.5248 0.049386 3.61271 0.137294C3.70061 0.225201 3.75 0.34443 3.75 0.46875V0.9375H11.25V0.46875C11.25 0.34443 11.2994 0.225201 11.3873 0.137294C11.4752 0.049386 11.5944 0 11.7188 0C11.8431 0 11.9623 0.049386 12.0502 0.137294C12.1381 0.225201 12.1875 0.34443 12.1875 0.46875V0.9375H13.125C13.6223 0.9375 14.0992 1.13504 14.4508 1.48667C14.8025 1.83831 15 2.31522 15 2.8125V13.125C15 13.6223 14.8025 14.0992 14.4508 14.4508C14.0992 14.8025 13.6223 15 13.125 15H1.875C1.37772 15 0.900806 14.8025 0.549175 14.4508C0.197544 14.0992 0 13.6223 0 13.125V2.8125C0 2.31522 0.197544 1.83831 0.549175 1.48667C0.900806 1.13504 1.37772 0.9375 1.875 0.9375H2.8125V0.46875C2.8125 0.34443 2.86189 0.225201 2.94979 0.137294C3.0377 0.049386 3.15693 0 3.28125 0V0ZM1.875 1.875C1.62636 1.875 1.3879 1.97377 1.21209 2.14959C1.03627 2.3254 0.9375 2.56386 0.9375 2.8125V13.125C0.9375 13.3736 1.03627 13.6121 1.21209 13.7879C1.3879 13.9637 1.62636 14.0625 1.875 14.0625H13.125C13.3736 14.0625 13.6121 13.9637 13.7879 13.7879C13.9637 13.6121 14.0625 13.3736 14.0625 13.125V2.8125C14.0625 2.56386 13.9637 2.3254 13.7879 2.14959C13.6121 1.97377 13.3736 1.875 13.125 1.875H1.875Z" />
                                <path d="M2.34375 3.75C2.34375 3.62568 2.39314 3.50645 2.48104 3.41854C2.56895 3.33064 2.68818 3.28125 2.8125 3.28125H12.1875C12.3118 3.28125 12.431 3.33064 12.519 3.41854C12.6069 3.50645 12.6562 3.62568 12.6562 3.75V4.6875C12.6562 4.81182 12.6069 4.93105 12.519 5.01896C12.431 5.10686 12.3118 5.15625 12.1875 5.15625H2.8125C2.68818 5.15625 2.56895 5.10686 2.48104 5.01896C2.39314 4.93105 2.34375 4.81182 2.34375 4.6875V3.75Z" />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="booking-form-item-type mb-45">
                          <div className="number-input-item adults">
                            <label className="number-input-lable">
                              Adult:<span></span>
                              <span>
                                {formatCurrency(adultPrice)}
                                {hotelData?.adult_price_original && (
                                  <del>
                                    {" "}
                                    {formatCurrency(
                                      hotelData.adult_price_original
                                    )}
                                  </del>
                                )}
                              </span>
                            </label>
                            <QuantityCounter
                              quantity={adults}
                              onQuantityChange={handleAdultQuantityChange}
                              minQuantity={1}
                              maxQuantity={maxAdultQuantity}
                            />
                          </div>
                          <div className="number-input-item children">
                            <label className="number-input-lable">
                              Children:<span></span>
                              <span>{formatCurrency(childPrice)}</span>
                            </label>
                            <QuantityCounter
                              quantity={children}
                              onQuantityChange={handleChildQuantityChange}
                              minQuantity={0}
                              maxQuantity={maxChildQuantity}
                            />
                          </div>
                          <div className="number-input-item infants">
                            <label className="number-input-lable">
                              Infants:<span></span>
                              <span className="text-green-600 font-medium">
                                Free
                              </span>
                            </label>
                            <QuantityCounter
                              quantity={infants}
                              onQuantityChange={handleInfantQuantityChange}
                              minQuantity={0}
                              maxQuantity={maxInfantQuantity}
                            />
                          </div>
                        </div>

                        <div className="booking-form-item-type">
                          <div className="single-total mb-[30px]">
                            <span>Adult</span>
                            <ul>
                              <li>
                                <strong>{formatCurrency(adultPrice)}</strong>{" "}
                                PRICE
                              </li>
                              <li>
                                <i className="bi bi-x-lg" />
                              </li>
                              <li>
                                <strong>{adults}</strong> QTY
                              </li>
                              <li>
                                <i className="bi bi-x-lg" />
                              </li>
                              <li>
                                <strong>{totalDays}</strong> DAYS
                              </li>
                            </ul>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={27}
                              height={15}
                              viewBox="0 0 27 15"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M23.999 5.44668L25.6991 7.4978L23.9991 9.54878H0V10.5743H23.1491L20.0135 14.3575L20.7834 14.9956L26.7334 7.81687L26.9979 7.4978L26.7334 7.17873L20.7834 0L20.0135 0.638141L23.149 4.42114H0V5.44668H23.999Z"
                              />
                            </svg>
                            <div className="total">
                              {formatCurrency(adultPrice * adults * totalDays)}
                            </div>
                          </div>

                          {children > 0 && (
                            <div className="single-total mb-[30px]">
                              <span>Children</span>
                              <ul>
                                <li>
                                  <strong>{formatCurrency(childPrice)}</strong>{" "}
                                  PRICE
                                </li>
                                <li>
                                  <i className="bi bi-x-lg" />
                                </li>
                                <li>
                                  <strong>{children}</strong> QTY
                                </li>
                                <li>
                                  <i className="bi bi-x-lg" />
                                </li>
                                <li>
                                  <strong>{totalDays}</strong> DAYS
                                </li>
                              </ul>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={27}
                                height={15}
                                viewBox="0 0 27 15"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M23.999 5.44668L25.6991 7.4978L23.9991 9.54878H0V10.5743H23.1491L20.0135 14.3575L20.7834 14.9956L26.7334 7.81687L26.9979 7.4978L26.7334 7.17873L20.7834 0L20.0135 0.638141L23.149 4.42114H0V5.44668H23.999Z"
                                />
                              </svg>
                              <div className="total">
                                {formatCurrency(
                                  childPrice * children * totalDays
                                )}
                              </div>
                            </div>
                          )}

                          {/* ✅ Room Distribution Button with status indicator */}
                          <div className="mt-3 pb-3">
                            <button
                              type="button"
                              onClick={() => setIsRoomDrawerOpen(true)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 border transition-all duration-200 ${
                                isDistributionComplete
                                  ? "border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                                  : "border-red-400 text-red-600 bg-red-50 hover:bg-red-100"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <FaHotel className="text-sm" />
                                <span className="text-sm font-medium">
                                  {isDistributionComplete
                                    ? `Rooms Configured (${rooms.length})`
                                    : "Configure Rooms (Required)"}
                                </span>
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  isDistributionComplete
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {isDistributionComplete
                                  ? `${rooms.length} ${rooms.length === 1 ? "Room" : "Rooms"}`
                                  : "Not Set"}
                              </span>
                            </button>
                            <p className="text-xs text-gray-400 mt-1 mb-0 !border-none">
                              Max {perRoom} guests per room (excl. infants)
                            </p>
                          </div>
                        </div>

                        <div className="total-price">
                          <span>Total Price:</span>{" "}
                          {formatCurrency(calculateTotal)}
                          {totalDays > 0 && (
                            <small className="d-block text-muted">
                              for {totalDays}{" "}
                              {totalDays === 1 ? "night" : "nights"}
                            </small>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="primary-btn1 two"
                          disabled={
                            bookingLoading ||
                            !startDate ||
                            !endDate ||
                            !user?.isLoggedIn ||
                            totalDays <= 0
                          }
                        >
                          {bookingLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Booking...
                            </>
                          ) : !user?.isLoggedIn ? (
                            "Login to Book"
                          ) : (
                            "Book Now"
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              <div className="banner2-card">
                <img
                  src="https://travelami.templaza.net/wp-content/uploads/2024/04/evangelos-mpikakis-t029Goq_7xE-unsplash-500x500.jpg"
                  alt="Contact Banner"
                />
                <div className="banner2-content-wrap">
                  <div className="banner2-content">
                    <div className="hotline-area">
                      <div className="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={28}
                          height={28}
                          viewBox="0 0 28 28"
                        >
                          <path d="M27.2653 21.5995L21.598 17.8201C20.8788 17.3443 19.9147 17.5009 19.383 18.1798L17.7322 20.3024C17.6296 20.4377 17.4816 20.5314 17.3154 20.5664C17.1492 20.6014 16.9759 20.5752 16.8275 20.4928L16.5134 20.3196C15.4725 19.7522 14.1772 19.0458 11.5675 16.4352C8.95784 13.8246 8.25001 12.5284 7.6826 11.4893L7.51042 11.1753C7.42683 11.0269 7.39968 10.8532 7.43398 10.6864C7.46827 10.5195 7.56169 10.3707 7.69704 10.2673L9.81816 8.61693C10.4968 8.08517 10.6536 7.1214 10.1784 6.40198L6.39895 0.734676C5.91192 0.00208106 4.9348 -0.21784 4.18082 0.235398L1.81096 1.65898C1.06634 2.09672 0.520053 2.80571 0.286612 3.63733C-0.56677 6.74673 0.0752209 12.1131 7.98033 20.0191C14.2687 26.307 18.9501 27.9979 22.1677 27.9979C22.9083 28.0011 23.6459 27.9048 24.3608 27.7115C25.1925 27.4783 25.9016 26.932 26.3391 26.1871L27.7641 23.8187C28.218 23.0645 27.9982 22.0868 27.2653 21.5995Z" />
                        </svg>
                      </div>
                      <div className="content">
                        <span>For More Inquiry</span>
                        <h6>
                          <a
                            href={`tel:${hotelData?.phone || "+990737621432"}`}
                          >
                            {hotelData?.phone || "+968-737 621 432"}
                          </a>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) =>
            handleModalOutsideClick(e, confirmModalRef, closeConfirmModal)
          }
        >
          <div className="modal-dialog !max-w-[800px] modal-dialog-centered">
            <div className="modal-content" ref={confirmModalRef}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirm Your Booking</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeConfirmModal}
                ></button>
              </div>
              <div className="modal-body py-4">
                <div className="booking-confirmation">
                  <div className="alert alert-info mb-4">
                    <h6 className="alert-heading mb-3">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      Please review your booking details
                    </h6>
                    <p className="mb-0">
                      Once confirmed, your booking request will be submitted for
                      review.
                    </p>
                  </div>

                  <div className="booking-summary">
                    <h6 className="mb-3">Booking Summary:</h6>
                    <div className="row">
                      <div className="col-12">
                        <div className="summary-item mb-3 p-3 bg-light rounded">
                          <h6 className="text-primary mb-2">
                            {hotelData?.name || "Hotel Booking"}
                          </h6>
                          <div className="summary-details">
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Check-in:</strong>
                              </div>
                              <div className="col-6">
                                {moment(startDate).format("MMM DD, YYYY")}
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Check-out:</strong>
                              </div>
                              <div className="col-6">
                                {moment(endDate).format("MMM DD, YYYY")}
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Duration:</strong>
                              </div>
                              <div className="col-6">
                                {totalDays}{" "}
                                {totalDays === 1 ? "night" : "nights"}
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Adults:</strong>
                              </div>
                              <div className="col-6">
                                {adults} x {formatCurrency(adultPrice)}
                              </div>
                            </div>
                            {children > 0 && (
                              <div className="row mb-2">
                                <div className="col-6">
                                  <strong>Children:</strong>
                                </div>
                                <div className="col-6">
                                  {children} x {formatCurrency(childPrice)}
                                </div>
                              </div>
                            )}
                            {infants > 0 && (
                              <div className="row mb-2">
                                <div className="col-6">
                                  <strong>Infants:</strong>
                                </div>
                                <div className="col-6 text-green-600">
                                  {infants} x Free
                                </div>
                              </div>
                            )}
                            <hr />

                            <div className="row mb-2">
                              <div className="col-6">
                                <strong>Rooms:</strong>
                              </div>
                              <div className="col-6">
                                {rooms.length}{" "}
                                {rooms.length === 1 ? "room" : "rooms"}
                                <div className="text-xs text-gray-500 mt-1">
                                  {rooms.map((r, i) => (
                                    <div key={r.id}>
                                      Room {i + 1}: {r.adults}A
                                      {r.children > 0
                                        ? ` + ${r.children}C`
                                        : ""}
                                      {r.babies > 0 ? ` + ${r.babies}I` : ""}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-6">
                                <strong>Total Amount:</strong>
                              </div>
                              <div className="col-6">
                                <strong className="text-success">
                                  {formatCurrency(calculateTotal)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeConfirmModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmBooking}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Status Modal */}
      {isBookingModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) =>
            !bookingLoading &&
            handleModalOutsideClick(e, bookingModalRef, closeBookingModal)
          }
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" ref={bookingModalRef}>
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  {bookingLoading
                    ? "Processing Booking..."
                    : bookingSuccess
                      ? "Booking Submitted!"
                      : "Booking Error"}
                </h5>
                {!bookingLoading && (
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeBookingModal}
                  ></button>
                )}
              </div>
              <div className="modal-body text-center py-4">
                {bookingLoading && (
                  <>
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Please wait while we process your booking...</p>
                  </>
                )}

                {bookingSuccess && (
                  <>
                    <div className="text-success mb-3">
                      <i
                        className="bi bi-check-circle-fill"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="text-success mb-3">Booking Under Review</h4>
                    <div className="alert alert-info">
                      <p className="mb-2">
                        <strong>Thank you for your booking!</strong>
                      </p>
                      <p className="mb-2">
                        Your booking request is currently under review. Our team
                        will verify your information and check the required
                        details.
                      </p>
                      <p className="mb-0">
                        <strong>
                          Once approved, we will send a payment link to your
                          email address to complete your reservation.
                        </strong>
                      </p>
                    </div>
                  </>
                )}

                {bookingError && (
                  <>
                    <div className="text-danger mb-3">
                      <i
                        className="bi bi-exclamation-triangle-fill"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="text-danger mb-3">Booking Failed</h4>
                    <div className="alert alert-danger">{bookingError}</div>
                  </>
                )}
              </div>
              {!bookingLoading && (
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeBookingModal}
                  >
                    Close
                  </button>
                  {bookingError && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        closeBookingModal();
                        setIsConfirmModalOpen(true);
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ReviewModal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        itemId={hotelID}
        itemType="hotel"
        itemName={hotelData?.name}
        apiEndpoint="/user/rating/hotel_rating.php"
        onSuccess={(data) => {
          console.log("Review submitted:", data);
        }}
      />

      {/* ✅ Room Distribution Drawer */}
      <Drawer
        title={
          <div>
            <h5 className="mb-0 text-lg font-semibold">Room Distribution</h5>
            <p className="text-xs text-gray-500 mb-0 mt-1">
              {adults} Adults
              {children > 0 ? `, ${children} Children` : ""}
              {infants > 0 ? `, ${infants} Infants` : ""} - {rooms.length}{" "}
              {rooms.length === 1 ? "Room" : "Rooms"}
            </p>
          </div>
        }
        placement="right"
        onClose={() => setIsRoomDrawerOpen(false)}
        open={isRoomDrawerOpen}
        width={420}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setIsRoomDrawerOpen(false)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRoomSelection}
              disabled={!isDistributionComplete}
              className={`flex-1 py-2.5 rounded-lg transition-colors ${
                isDistributionComplete
                  ? "bg-[#295557] text-white hover:bg-[#1e3e40]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* ✅ Remaining guests indicator */}
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
            <p className="text-sm font-medium text-gray-800 mb-2">
              Remaining to distribute:
            </p>
            <div className="flex flex-wrap gap-3">
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  distributionProgress.remainingAdults === 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Adults: {distributionProgress.remainingAdults}/{adults}
              </span>
              {children > 0 && (
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    distributionProgress.remainingChildren === 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Children: {distributionProgress.remainingChildren}/{children}
                </span>
              )}
              {infants > 0 && (
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    distributionProgress.remainingBabies === 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Infants: {distributionProgress.remainingBabies}/{infants}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 mb-0">
              Max {perRoom} per room (adults + children). Infants not counted.
            </p>
          </div>

          {/* Rooms list */}
          {rooms.map((room, roomIdx) => {
            const roomOccupancy = room.adults + room.children;
            const isAtCapacity = roomOccupancy >= perRoom;

            return (
              <div
                key={room.id}
                className={`border rounded-xl p-4 bg-white shadow-sm ${
                  isAtCapacity ? "border-amber-300" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h6 className="font-semibold text-[#295557] mb-0">
                      Room {roomIdx + 1}
                    </h6>
                    <span
                      className={`text-xs ${
                        isAtCapacity ? "text-amber-600" : "text-gray-400"
                      }`}
                    >
                      {roomOccupancy}/{perRoom} capacity
                    </span>
                  </div>
                  {rooms.length > 1 && (
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {room.adults === 0 && room.children > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-3">
                    <span>Children can't stay alone in a room</span>
                  </div>
                )}

                {isAtCapacity && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg mb-3">
                    <span>Room at max capacity ({perRoom})</span>
                  </div>
                )}

                {/* Adults counter */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">Adults</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleRoomChange("decrease", room.id, "adults")
                      }
                      disabled={room.adults <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] hover:text-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="w-6 text-center font-semibold">
                      {room.adults}
                    </span>
                    <button
                      onClick={() =>
                        handleRoomChange("increase", room.id, "adults")
                      }
                      disabled={
                        distributionProgress.remainingAdults <= 0 ||
                        roomOccupancy >= perRoom
                      }
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] hover:text-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Children counter */}
                {children > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">Children</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleRoomChange("decrease", room.id, "children")
                        }
                        disabled={room.children <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] hover:text-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="w-6 text-center font-semibold">
                        {room.children}
                      </span>
                      <button
                        onClick={() =>
                          handleRoomChange("increase", room.id, "children")
                        }
                        disabled={
                          distributionProgress.remainingChildren <= 0 ||
                          roomOccupancy >= perRoom
                        }
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] hover:text-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Infants counter */}
                {infants > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm text-gray-700">Infants</span>
                      <span className="text-[10px] text-gray-400 block">
                        Not counted in capacity
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleRoomChange("decrease", room.id, "babies")
                        }
                        disabled={room.babies <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] hover:text-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="w-6 text-center font-semibold">
                        {room.babies}
                      </span>
                      <button
                        onClick={() =>
                          handleRoomChange("increase", room.id, "babies")
                        }
                        disabled={distributionProgress.remainingBabies <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] hover:text-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Room summary */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-0">
                    {room.adults + room.children} countable guest(s)
                    {room.babies > 0 ? ` + ${room.babies} infant(s)` : ""}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Add room button */}
          {rooms.length < 5 && (
            <button
              onClick={addRoom}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-500 hover:border-[#295557] hover:text-[#295557] transition-colors"
            >
              <FaPlus className="text-xs" />
              <span className="text-sm font-medium">Add Room</span>
            </button>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Page;
