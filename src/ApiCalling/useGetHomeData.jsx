// ApiCalling/useGetHomeData.js
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { base_url } from "../uitils/base_url";
import { useCallback } from "react";

export default function useGetHomeData() {
  const queryClient = useQueryClient();

  const getUserId = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user)?.user_id : null;
  };

  const fetchData = async () => {
    const userId = getUserId();
    try {
      const response = await axios.get(
        `${base_url}/user/homepage/select_homepage.php?user_id=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["homeData"],
    queryFn: fetchData,
    enabled: typeof window !== "undefined",
  });

  // Update the entire data locally
  const updateDataLocally = useCallback(
    (updater) => {
      queryClient.setQueryData(["homeData"], (oldData) => {
        if (typeof updater === "function") {
          return updater(oldData);
        }
        return updater;
      });
    },
    [queryClient]
  );

  // Update tours locally
  const updateTours = useCallback(
    (updater) => {
      queryClient.setQueryData(["homeData"], (oldData) => {
        if (!oldData?.message) return oldData;
        const newTours =
          typeof updater === "function"
            ? updater(oldData.message.tours || [])
            : updater;
        return {
          ...oldData,
          message: {
            ...oldData.message,
            tours: newTours,
          },
        };
      });
    },
    [queryClient]
  );

  // Update hotels locally
  const updateHotels = useCallback(
    (updater) => {
      queryClient.setQueryData(["homeData"], (oldData) => {
        if (!oldData?.message) return oldData;
        const newHotels =
          typeof updater === "function"
            ? updater(oldData.message.hotels || [])
            : updater;
        return {
          ...oldData,
          message: {
            ...oldData.message,
            hotels: newHotels,
          },
        };
      });
    },
    [queryClient]
  );

  // Update transportation locally
  const updateTransportation = useCallback(
    (updater) => {
      queryClient.setQueryData(["homeData"], (oldData) => {
        if (!oldData?.message) return oldData;
        const newTransportation =
          typeof updater === "function"
            ? updater(oldData.message.transportation || [])
            : updater;
        return {
          ...oldData,
          message: {
            ...oldData.message,
            transportation: newTransportation,
          },
        };
      });
    },
    [queryClient]
  );

  // Reset to original fetched data
  const refetchData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["homeData"] });
  }, [queryClient]);

  return {
    ...query,
    updateDataLocally,
    updateTours,
    updateHotels,
    updateTransportation,
    refetchData,
  };
}
