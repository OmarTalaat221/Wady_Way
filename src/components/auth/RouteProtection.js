"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Preloader from "../../app/loading";

const RouteProtection = ({ children }) => {
  const protectedRoutes = ["/account"];
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const authRoutes = ["/login", "/signup"];

  useEffect(() => {
    const user = localStorage.getItem("user");
    const isLoggedIn = !!user;

    if (isLoggedIn && authRoutes.includes(pathname)) {
      router.push("/");
      return;
    }

    if (!isLoggedIn && protectedRoutes.includes(pathname)) {
      router.push("/login");
      return;
    }

    setIsLoading(false);
  }, [pathname, router, protectedRoutes]);

  if (isLoading) {
    return <Preloader />;
  }

  return children;
};

export default RouteProtection;
