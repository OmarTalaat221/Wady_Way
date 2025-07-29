"use client";
import React from "react";
import LoginModal from "./../../components/common/LoginModal";
import "./_components/style.css";

import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "../../components/link";
const Signup = () => {
  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
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
                    <h2>Sign up to continue</h2>
                    <p>Enter your email address for regesteration.</p>
                  </div>
                  <form>
                    <div className="form-inner mb-[20px]">
                      <input type="text" name="name" placeholder="Name *" />
                    </div>
                    <div className="form-inner mb-[20px]">
                      <input type="text" name="email" placeholder="Email *" />
                    </div>
                    <div className="form-inner mb-[20px]">
                      <input type="password" placeholder="Password *" />
                    </div>
                    <div className="form-inner mb-[20px]">
                      <input type="password" placeholder="Confirm Password *" />
                    </div>
                    <a href="#" className="login-btn mb-[25px] text-white">
                      Sign Up
                    </a>

                    <div className="d-flex gap-2">
                      <div>Already have an account? </div>

                      <Link href={"/login"}>Login here</Link>
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

      {/* <Footer /> */}
    </>
  );
};

export default Signup;
