"use client";
import React, { useState } from "react";
import "./_components/style.css";
import Link from "../../components/link";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // In a real app, you would call your API here
      // For demo purposes, we'll use a timeout to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, we'll just use the demo credentials
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
          isLoggedIn: true,
        })
      );

      // Redirect to homepage
      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({ form: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="modal login-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="login-registration-form">
                <div className="form-title">
                  <h2>Welcome Back</h2>
                  <p>Sign in to continue your journey</p>
                </div>

                {errors.form && (
                  <div className="alert alert-danger" role="alert">
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-inner mb-[20px]">
                    <input
                      type="text"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <small className="text-danger">{errors.email}</small>
                    )}
                  </div>

                  <div className="form-inner mb-[20px]">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? "error" : ""}
                    />
                    {errors.password && (
                      <small className="text-danger">{errors.password}</small>
                    )}
                  </div>

                  <div className="d-flex justify-end mb-[20px]">
                    <Link href="#" className="forgot-password">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="login-btn mb-[25px]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>
                        <i className="bx bx-loader-alt bx-spin me-2"></i>
                        Signing In...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="d-flex gap-2">
                    <div>Don't have an account? </div>

                    <Link href={"/signup"}>Register here</Link>
                  </div>

                  {/* <div className="divider">
                    <span>or continue with</span>
                  </div>

                  <div className="social-login mt-20">
                    <button type="button" className="google-login-btn">
                      <div className="icon">
                        <img
                          src="/assets/img/home1/icon/google-icon.svg"
                          alt="Google"
                        />
                      </div>
                      <span>Sign in with Google</span>
                    </button>
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
