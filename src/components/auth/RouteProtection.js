// components/auth/RouteProtection.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Preloader from "../../app/loading";

const RouteProtection = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const authRoutes = ["/login", "/signup"];

  useEffect(() => {
    const user = localStorage.getItem("user");
    // const token = localStorage.getItem("token");
    const isLoggedIn = user;

    if (isLoggedIn) {
      if (authRoutes.includes(pathname)) {
        router.push("/");
        return;
      }
    } else {
      if (!authRoutes.includes(pathname)) {
        router.push("/login");
        return;
      }
    }

    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading) {
    return <Preloader />;
  }

  return children;
};

export default RouteProtection;
