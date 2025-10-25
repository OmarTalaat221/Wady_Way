// hooks/useTourDetails.js
"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { base_url } from "../uitils/base_url";

const useTourDetails = (packageId) => {
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${base_url}/user/tours/tour_details.php`,
          { id: packageId }
        );

        if (
          response?.data?.status === "success" &&
          response?.data?.message[0]
        ) {
          setTourData(response?.data?.message[0]);
        } else {
          throw new Error("Failed to fetch tour details");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchTourDetails();
    }
  }, [packageId]);

  return { tourData, loading, error };
};

export default useTourDetails;
