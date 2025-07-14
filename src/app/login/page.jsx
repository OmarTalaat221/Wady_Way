"use client";
import React from "react";
import LoginModal from "./../../components/common/LoginModal";
import "./_components/style.css";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "../../components/link";
const Login = () => {
  const [data, setData] = React.useState({
    email: "admin@gmail.com",
    Password: "admin",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // call your API here to validate the user credentials
    //store in localStorage
    localStorage.setItem("user", JSON.stringify(data));
    // redirect to dashboard
    window.location.href = "/"; // replace with your dashboard path
    // or show a success message
    setData({ email: "", Password: "" }); // reset form fields to empty after successful login
  };

  return (
    <>
      <div className="login-page">
        <div
          className="modal login-modal "
          id="user-login"
          data-bs-keyboard="false"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <div className="login-registration-form">
                  <div className="form-title">
                    <h2>Sign in to continue</h2>
                    <p>Enter your email address for Login.</p>
                  </div>
                  <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="form-inner mb-20">
                      <input
                        type="text"
                        placeholder="Email *"
                        onChange={(e) => handleChange(e)}
                      />
                    </div>
                    <div className="form-inner mb-20">
                      <input
                        type="password"
                        placeholder="Password *"
                        onChange={(e) => handleChange(e)}
                      />
                    </div>
                    <button href="#" className="login-btn mb-25">
                      Sign In
                    </button>
                    <div className="d-flex gap-2">
                      <div>Don't have an account? </div>

                      <Link href={"/signup"}>Register here</Link>
                    </div>
                    {/* <div className="divider">
                    <span>or</span>
                  </div> */}
                    {/* <a href="#" className="google-login-btn">
                    <div className="icon">
                      <img
                        src="/assets/img/home1/icon/google-icon.svg"
                        alt=""
                      />
                    </div>
                    Sign in with Google
                  </a> */}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
