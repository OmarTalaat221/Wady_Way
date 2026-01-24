"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { message } from "antd";
import axios from "axios";
import Link from "../../components/link";
import { base_url } from "../../uitils/base_url";
import "./_components/style.css";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fcm_token = localStorage.getItem("fcm_token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
        fcm_token: fcm_token,
      };

      const response = await axios.post(
        `${base_url}/user/auth/login.php`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Login successful!");

        // Store user data
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: formData.email,
            isLoggedIn: true,
            ...response.data.message,
          })
        );

        // Redirect to homepage
        window.location.href = "/";
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <div className="login-container">
        {/* Floating Particles */}
        <div className="floating-particle particle-1"></div>
        <div className="floating-particle particle-2"></div>
        <div className="floating-particle particle-3"></div>
        <div className="floating-particle particle-4"></div>
        <div className="floating-particle particle-5"></div>
        <div className="floating-particle particle-6"></div>

        <div className="form-container">
          <motion.div
            className="modern-modal-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="modern-title" variants={titleVariants}>
              <h2>Welcome Back</h2>
              <p>Sign in to continue your journey</p>
            </motion.div>

            <div className="p-8">
              <motion.form
                onSubmit={handleSubmit}
                variants={containerVariants}
                className="space-y-6"
              >
                {/* Email Input */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`modern-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </motion.div>

                {/* Password Input */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`modern-input ${errors.password ? "error" : ""}`}
                  />
                  {errors.password && (
                    <div className="error-message">{errors.password}</div>
                  )}
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div className="text-right" variants={itemVariants}>
                  <Link href="/forgot-password" className="modern-link">
                    Forgot Password?
                  </Link>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    className="modern-btn"
                    disabled={isLoading}
                  >
                    {isLoading && <span className="loading-spinner"></span>}
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </motion.div>

                {/* Register Link */}
                <motion.div
                  className="text-center mt-6"
                  variants={itemVariants}
                >
                  <span style={{ color: "#295557", fontWeight: "600" }}>
                    Don't have an account?{" "}
                  </span>
                  <Link href="/signup" className="modern-link">
                    Register here
                  </Link>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
