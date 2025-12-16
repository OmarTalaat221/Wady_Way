"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IoAirplane } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { FaEarthAsia } from "react-icons/fa6";
import { BsFillCaretRightFill } from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import "./style.css";
import TravelCard from "./../../components/cards/TravelCard";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";

const Account = () => {
  // Next.js router hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for API data
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Initialize pagination from URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam) : 1;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get("limit");
    return limitParam ? parseInt(limitParam) : 6;
  });

  // Initialize status filter from URL params
  const [statusFilter, setStatusFilter] = useState(() => {
    return searchParams.get("status") || "all";
  });

  // Function to update URL params
  const updateURLParams = (updates = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update page
    const page = updates.page !== undefined ? updates.page : currentPage;
    if (page && page !== 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    // Update limit
    const limit = updates.limit !== undefined ? updates.limit : itemsPerPage;
    if (limit && limit !== 6) {
      params.set("limit", limit.toString());
    } else {
      params.delete("limit");
    }

    // Update status filter
    const status = updates.status !== undefined ? updates.status : statusFilter;
    if (status && status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    const newURL = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.push(newURL, { scroll: false });
  };

  // Sync state with URL params
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 6;
    const newStatus = statusParam || "all";

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== itemsPerPage) setItemsPerPage(newLimit);
    if (newStatus !== statusFilter) setStatusFilter(newStatus);
  }, [searchParams]);

  // Get user ID from localStorage
  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id || userData.user_id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Determine status based on dates
  const getStatusFromDates = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Reset time to compare only dates
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (now < start) {
      return "noStarted"; // Trip hasn't started yet
    } else if (now >= start && now <= end) {
      return "started"; // Trip is in progress
    } else {
      return "finished"; // Trip has ended
    }
  };

  // Calculate progress based on dates
  const calculateProgress = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Not started yet
    if (now < start) {
      return 0;
    }

    // Already finished
    if (now > end) {
      return 100;
    }

    // In progress - calculate percentage
    const totalDuration = end - start;
    const elapsed = now - start;
    const progress = Math.round((elapsed / totalDuration) * 100);

    return Math.min(Math.max(progress, 0), 100);
  };
  // Fetch profile travels from API
  const fetchProfileTravels = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(
        `${baseUrl}/my_tours/select_my_tours_list.php`,
        { user_id: userId }
      );

      if (res?.data?.status === "success") {
        const mappedTrips = res.data.message.map((item) => {
          const reservation = item.reservation;
          const tour = item.tour_details;

          // Parse route for locations
          const routeLocations = tour.route
            ? tour.route.split("-").map((loc) => loc.trim())
            : [];

          const images =
            tour.gallery && tour.gallery.length > 0
              ? tour.gallery.map((g) => g.image)
              : [tour.image];

          const cardStatus = getStatusFromDates(
            reservation.start_date,
            reservation.end_date
          );
          const progress = calculateProgress(
            reservation.start_date,
            reservation.end_date
          );

          return {
            id: reservation.reservation_id,
            tour_id: reservation.tour_id,
            title: tour.title || reservation.tour_title,
            duration: tour.duration,
            status: cardStatus,
            apiStatus: reservation.status,
            images: images,
            image: tour?.image,
            mainLocations: routeLocations.slice(0, 2),
            additionalLocations: routeLocations,
            price: parseFloat(reservation.total_amount),
            oldPrice: parseFloat(tour.price_original),
            currentPrice: parseFloat(tour.price_current),
            priceNote: tour.price_note || "TAXES INCL/PERS",
            priceCurrency: tour.price_currency || "$",
            numAdults: parseInt(reservation.num_adults),
            numChildren: parseInt(reservation.num_children),
            startDate: reservation.start_date,
            endDate: reservation.end_date,
            progress: progress,
            category: tour.category,
            countryName: tour.country_name,
            tourDetails: tour,
            reservation: reservation,
          };
        });

        setTrips(mappedTrips);
      } else {
        setTrips([]);
        setError("No tours found");
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
      setError("Failed to load your tours. Please try again.");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfileTravels();
    }
  }, [userId]);

  // Filter trips by status
  const filteredTrips =
    statusFilter === "all"
      ? trips
      : trips.filter((trip) => trip.status === statusFilter);

  // Pagination logic
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      updateURLParams({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    updateURLParams({ page: 1, limit: newLimit });
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    updateURLParams({ page: 1, status });
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Status filter options
  const statusFilters = [
    { value: "all", label: "All Trips" },
    { value: "noStarted", label: "Not Started" },
    { value: "started", label: "In Progress" },
    { value: "finished", label: "Completed" },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="row g-4">
        <div className="col-12 text-center py-5">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "#295557" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your travels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && trips.length === 0) {
    return (
      <div className="row g-4">
        <div className="col-12 text-center py-5">
          <i
            className="bi bi-exclamation-circle"
            style={{ fontSize: "48px", color: "#ef6161" }}
          ></i>
          <h4 className="mt-3">Oops! Something went wrong</h4>
          <p className="text-muted">{error}</p>
          <button
            onClick={() => fetchProfileTravels()}
            className="btn mt-3"
            style={{ backgroundColor: "#295557", color: "white" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="travels-container">
      {/* Filter and Results Info Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            {/* Status Filter Buttons */}
            <div className="d-flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilterChange(filter.value)}
                  className={`btn btn-sm ${
                    statusFilter === filter.value
                      ? "text-white"
                      : "btn-outline-secondary"
                  }`}
                  style={
                    statusFilter === filter.value
                      ? { backgroundColor: "#295557", borderColor: "#295557" }
                      : {}
                  }
                >
                  {filter.label}
                  <span
                    className="badge ms-2"
                    style={{
                      backgroundColor:
                        statusFilter === filter.value ? "white" : "#295557",
                      color:
                        statusFilter === filter.value ? "#295557" : "white",
                    }}
                  >
                    {filter.value === "all"
                      ? trips.length
                      : trips.filter((t) => t.status === filter.value).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {filteredTrips.length > 0 && (
        <div className="row mb-3">
          <div className="col-12">
            <p className="text-muted mb-0">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredTrips.length)} of{" "}
              {filteredTrips.length} trips
              {totalPages > 1 && (
                <span className="ms-2">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Trips Grid */}
      {paginatedTrips.length > 0 ? (
        <div className="row g-4">
          {paginatedTrips.map((trip) => (
            <div key={trip.id} className="col-lg-6 col-md-6">
              <TravelCard
                data={trip}
                progress={trip.progress}
                status={trip.status}
                type="profile"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          <div className="col-12 text-center py-5">
            <i
              className="bi bi-airplane"
              style={{ fontSize: "64px", color: "#ccc" }}
            ></i>
            <h4 className="mt-3">No trips found</h4>
            <p className="text-muted">
              {statusFilter === "all"
                ? "You haven't booked any tours yet."
                : `No ${statusFilters
                    .find((f) => f.value === statusFilter)
                    ?.label.toLowerCase()} trips found.`}
            </p>
            {statusFilter !== "all" && (
              <button
                onClick={() => handleStatusFilterChange("all")}
                className="btn btn-outline-secondary mt-2"
              >
                View All Trips
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && paginatedTrips.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav className="d-flex justify-content-center">
              <ul className="pagination">
                {/* Previous Button */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      color: currentPage === 1 ? "#ccc" : "#295557",
                      borderColor: "#dee2e6",
                    }}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {/* Page Numbers */}
                {getPaginationNumbers().map((page, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      page === currentPage ? "active" : ""
                    } ${page === "..." ? "disabled" : ""}`}
                  >
                    {page === "..." ? (
                      <span className="page-link">...</span>
                    ) : (
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                        style={
                          page === currentPage
                            ? {
                                backgroundColor: "#295557",
                                borderColor: "#295557",
                                color: "white",
                              }
                            : { color: "#295557", borderColor: "#dee2e6" }
                        }
                      >
                        {page}
                      </button>
                    )}
                  </li>
                ))}

                {/* Next Button */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      color: currentPage === totalPages ? "#ccc" : "#295557",
                      borderColor: "#dee2e6",
                    }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
