import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
// import { addToast } from "@/store/notificationSlice";
import { base_url } from "@/uitils/base_url";

export const useWishlist = () => {
  const dispatch = useDispatch();
  const [loadingItems, setLoadingItems] = useState({});

  // Get user ID from localStorage
  const getUserId = () => {
    if (typeof window !== "undefined") {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          return userData.id || userData.user_id;
        } catch (error) {
          console.error("Error parsing user data:", error);
          return null;
        }
      }
    }
    return null;
  };

  // Toggle wishlist item
  const toggleWishlist = async (itemId, type = "tour", currentStatus) => {
    const userId = getUserId();

    // Check if user is logged in
    if (!userId) {
      // dispatch(
      //   addToast({
      //     type: "warning",
      //     title: "Login Required",
      //     message: "Please login to add items to your wishlist",
      //   })
      // );
      return { success: false, is_fav: currentStatus };
    }

    // Set loading state for this item
    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.post(
        `${base_url}/user/wish_list/toggle_wish_list.php`,
        {
          user_id: userId,
          item_id: itemId,
          type: type,
        }
      );

      if (response?.data?.status === "success") {
        const newStatus = !currentStatus;

        // dispatch(
        //   addToast({
        //     type: "success",
        //     title: newStatus ? "Added to Wishlist" : "Removed from Wishlist",
        //     message: newStatus
        //       ? "Item has been added to your wishlist"
        //       : "Item has been removed from your wishlist",
        //   })
        // );

        return { success: true, is_fav: newStatus };
      } else {
        // dispatch(
        //   addToast({
        //     type: "error",
        //     title: "Error",
        //     message: response?.data?.message || "Failed to update wishlist",
        //   })
        // );
        return { success: false, is_fav: currentStatus };
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);

      // dispatch(
      //   addToast({
      //     type: "error",
      //     title: "Error",
      //     message: "Failed to update wishlist. Please try again.",
      //   })
      // );

      return { success: false, is_fav: currentStatus };
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const isLoading = (itemId) => {
    return loadingItems[itemId] || false;
  };

  return {
    toggleWishlist,
    isLoading,
  };
};
