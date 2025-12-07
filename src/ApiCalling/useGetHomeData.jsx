"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { base_url } from "../uitils/base_url";

export default function useGetHomeData() {
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${base_url}/user/homepage/select_homepage.php`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return useQuery({
    queryKey: ["homeData"],
    queryFn: fetchData,
  });
}
