"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import TransactionHeader from "./_components/TransactionHeader";
import TransactionTable from "./_components/TransactionTable";
import { base_url } from "../../../uitils/base_url";

const Transactions = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  }, []);

  // Fetch wallet data
  const fetchWalletData = async () => {
    if (!userData?.user_id && !userData?.id) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/wallet/select_wallet.php`,
        {
          user_id: userData.user_id || userData.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setWalletData(response.data.message);
      } else {
        console.error("Failed to fetch wallet data");
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchWalletData();
    }
  }, [userData]);

  return (
    <div className="pt-4">
      <TransactionHeader walletData={walletData} loading={loading} />
      <TransactionTable
        transactions={walletData?.transactions || []}
        loading={loading}
      />
    </div>
  );
};

export default Transactions;
