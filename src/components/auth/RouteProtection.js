// ─── RouteProtection ─────────────────────────────────────────────────────────
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Preloader from "../../app/loading";

const protectedRoutes = ["/account"];
const authRoutes = ["/login", "/signup"];

const RouteProtection = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const isLoggedIn = !!user;

    // ── Case 1: Logged in + trying to access login/signup ──
    if (isLoggedIn && authRoutes.includes(pathname)) {
      router.replace("/");
      return;
    }

    // ── Case 2: NOT logged in + trying to access protected route ──
    if (!isLoggedIn && protectedRoutes.includes(pathname)) {
      // Replace current history entry with login
      // This prevents back button from going to /account
      router.replace("/login");
      return;
    }

    setIsReady(true);
    prevPathRef.current = pathname;
  }, [pathname, router]);

  // ── Listen for logout events ──
  useEffect(() => {
    const handleLogout = () => {
      // When logout happens, replace history so back won't go to protected pages
      router.replace("/login");
    };

    window.addEventListener("user-logout", handleLogout);
    return () => window.removeEventListener("user-logout", handleLogout);
  }, [router]);

  if (!isReady) return <Preloader />;

  return children;
};

export default RouteProtection;
