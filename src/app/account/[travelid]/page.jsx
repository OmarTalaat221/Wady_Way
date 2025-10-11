import React from "react";
import "react-datepicker/dist/react-datepicker.css";

import ProfileTravelDetailsClient from "./TravelDetailsClient";
import { cookies } from "next/headers";

const ProfileTravelDetails = () => {
  const cookiesStore = cookies();

  const lang = cookiesStore.get("lang") || "en";

  return <ProfileTravelDetailsClient lang={lang.value} />;
};

export default ProfileTravelDetails;
