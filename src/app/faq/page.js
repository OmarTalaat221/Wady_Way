// app/faq/page.js
"use client";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Link from "next/link";
import React from "react";
import FAQ from "../package/package-details/[packageId]/_components/FAQ";
import axios from "axios";
import { base_url } from "../../uitils/base_url";

const FAQPage = () => {
  const [generalFAQs, setGeneralFAQs] = useState([]);
  const [travelTipsFAQs, setTravelTipsFAQs] = useState([]);
  const [offer, setOffer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform FAQ data to match component structure
  const transformFAQData = (faqs) => {
    return faqs.map((faq, index) => ({
      id: `collapse${faq.type}${faq.id}`,
      question: `${String(index + 1).padStart(2, "0")}. ${faq.question}`,
      answer: faq.answer,
    }));
  };

  // Fetch FAQs from API
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make API call using axios
      const response = await axios.get(
        `${base_url}/user/faqs/select_faqs.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.status === "success") {
        const faqs = response.data.message || [];

        const generalQuestions = faqs.filter((faq) => faq.type === "general");
        const travelTipsQuestions = faqs.filter(
          (faq) => faq.type === "travel_tips"
        );

        setGeneralFAQs(transformFAQData(generalQuestions));
        setTravelTipsFAQs(transformFAQData(travelTipsQuestions));
        setOffer(response?.data?.first_offer);
      } else {
        throw new Error("Failed to fetch FAQs");
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);

      if (err.response) {
        setError(`Server error: ${err.response.status}`);
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }

      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Set fallback data when API fails
  const setFallbackData = () => {
    const fallbackGeneral = [
      {
        id: "1",
        question: "How do I book a trip on your website?",
        answer:
          "Aptent taciti sociosqu ad litora torquent per conubia nostra, per inci only Integer purus onthis felis non aliquam. Mauris nec just vitae ann auctor tol euismod sit amet non ipsul growing this.",
        type: "general",
      },
      {
        id: "2",
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, debit cards, PayPal, and bank transfers. Payment is secure and encrypted for your safety.",
        type: "general",
      },
      {
        id: "3",
        question: "Can I make changes to my reservation after booking?",
        answer:
          "Yes, you can make changes to your reservation up to 48 hours before your trip. Please contact our support team for assistance.",
        type: "general",
      },
      {
        id: "4",
        question: "What is your cancellation policy?",
        answer:
          "Cancellations made 7 days or more before the trip date will receive a full refund. Cancellations within 3–6 days will be charged a 50% fee.",
        type: "general",
      },
      {
        id: "5",
        question: "Do you offer group booking discounts?",
        answer:
          "Yes, we offer special discounts for groups of 6 or more travelers. Please contact our support team for group rates.",
        type: "general",
      },
    ];

    const fallbackTravelTips = [
      {
        id: "6",
        question: "What is your payment schedule and process?",
        answer:
          "A 30% deposit is required to confirm your booking, and the remaining balance must be paid at least 7 days before your trip begins.",
        type: "travel_tips",
      },
      {
        id: "7",
        question: "Are there any additional fees or surcharges?",
        answer:
          "All prices include taxes and standard service charges. Optional activities and personal expenses are not included.",
        type: "travel_tips",
      },
      {
        id: "8",
        question: "Can I transfer my reservation to another person?",
        answer:
          "Yes, reservations can be transferred to another traveler up to 3 days before departure with proper documentation.",
        type: "travel_tips",
      },
      {
        id: "9",
        question: "Can I request a private tour for my group?",
        answer:
          "Absolutely! We offer fully customizable private tours for families, friends, or corporate groups.",
        type: "travel_tips",
      },
    ];

    setGeneralFAQs(transformFAQData(fallbackGeneral));
    setTravelTipsFAQs(transformFAQData(fallbackTravelTips));
  };

  // Fetch FAQs on component mount
  useEffect(() => {
    fetchFAQs();
  }, []);

  // Retry function for failed requests
  const handleRetry = () => {
    setError(null);
    fetchFAQs();
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb pagename="FAQ" pagetitle="FAQ" />
        <div className="faq-section pt-120 mb-120">
          <div className="container">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "400px" }}
            >
              <div className="text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-3">Loading FAQs...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state with retry option
  if (error && generalFAQs.length === 0 && travelTipsFAQs.length === 0) {
    return (
      <>
        <Breadcrumb pagename="FAQ" pagetitle="FAQ" />
        <div className="faq-section pt-120 mb-120">
          <div className="container">
            <div className="text-center" style={{ minHeight: "400px" }}>
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Oops! Something went wrong</h4>
                <p>{error}</p>
                <hr />
                <button className="btn btn-primary" onClick={handleRetry}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Main render
  return (
    <>
      <Breadcrumb pagename="FAQ" pagetitle="FAQ" />
      <div className="faq-section pt-120 mb-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            {/* Left Sidebar - Banner */}
            <div className="col-lg-4">
              <div className="banner-and-inquiry-form">
                <div className="banner2-card four">
                  <img
                    src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914485/jack-ward-rknrvCrfS1k-unsplash_wlpbz5.jpg"
                    alt="Special Offer"
                  />
                  <div className="banner2-content-wrap">
                    <div className="banner2-content">
                      <span>{offer?.panner_title}</span>
                      <h3>{offer?.offer_percentage}</h3>
                      <p>{offer?.offer_descreption}</p>
                    </div>
                    <Link
                      href={`/package/package-details/${offer?.tour_id}`}
                      className="primary-btn1"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - FAQs */}
            <div className="col-lg-8">
              {/* Show error message if API failed but using fallback data */}
              {error &&
                (generalFAQs.length > 0 || travelTipsFAQs.length > 0) && (
                  <div
                    className="alert alert-warning alert-dismissible fade show mb-4"
                    role="alert"
                  >
                    <strong>Note:</strong> Unable to fetch latest FAQs. Showing
                    cached data.
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="alert"
                      aria-label="Close"
                    ></button>
                  </div>
                )}

              {/* General FAQs Section */}
              {generalFAQs.length > 0 && (
                <div className="faq-content-wrap mb-[40px]">
                  <div className="faq-content-title mb-50">
                    <h3>
                      General
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={23}
                        height={23}
                        viewBox="0 0 23 23"
                      >
                        <path
                          opacity="0.2"
                          d="M12.1406 3.31569L13.6613 1.28328C14.2277 0.526342 15.4311 0.905329 15.4615 1.85022L15.5502 4.60677C15.5714 5.26711 16.2158 5.72572 16.8467 5.52947L19.16 4.80985C20.0802 4.52359 20.8331 5.57662 20.2644 6.35473L18.8298 8.3179C18.4362 8.85663 18.6705 9.62248 19.2982 9.84869L21.6962 10.7128C22.5984 11.038 22.5699 12.3236 21.6542 12.6085L19.3662 13.3202C18.7146 13.5229 18.453 14.3043 18.8511 14.8585L20.246 16.8005C20.8121 17.5885 20.0372 18.6398 19.117 18.3324L16.6866 17.5204C16.039 17.304 15.3697 17.786 15.3697 18.4688V21.026C15.3697 21.9843 14.1519 22.3938 13.5729 21.6301L11.9573 19.4993C11.5506 18.9629 10.7409 18.9734 10.3482 19.5201L8.84725 21.6096C8.29002 22.3854 7.06631 22.0131 7.03559 21.0584L6.94981 18.3932C6.92856 17.7329 6.28416 17.2743 5.65329 17.4705L3.39578 18.1728C2.47005 18.4608 1.71725 17.3951 2.29806 16.6188L3.63735 14.8289C4.04321 14.2865 3.80363 13.506 3.16335 13.2847L0.734445 12.4451C-0.163318 12.1348 -0.163315 10.8652 0.734448 10.5549L3.16335 9.71533C3.80363 9.49403 4.04321 8.71352 3.63735 8.1711L2.17821 6.22099C1.60964 5.46111 2.32026 4.41074 3.23712 4.65581L5.87202 5.36011C6.507 5.52984 7.13025 5.0513 7.13025 4.39403V1.87955C7.13025 0.93114 8.32718 0.515473 8.91501 1.25974L10.5552 3.3364C10.9622 3.85179 11.7471 3.84154 12.1406 3.31569Z"
                        />
                      </svg>
                    </h3>
                  </div>
                  <div className="faq-content">
                    <div className="accordion" id="accordionTravel">
                      <FAQ text={false} faqData={generalFAQs} />
                    </div>
                  </div>
                </div>
              )}

              {/* Travel Tips FAQs Section */}
              {travelTipsFAQs.length > 0 && (
                <div className="faq-content-wrap">
                  <div className="faq-content-title mb-[20px]">
                    <h3>
                      Travel Tips
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={23}
                        height={23}
                        viewBox="0 0 23 23"
                      >
                        <path
                          opacity="0.2"
                          d="M12.1406 3.31569L13.6613 1.28328C14.2277 0.526342 15.4311 0.905329 15.4615 1.85022L15.5502 4.60677C15.5714 5.26711 16.2158 5.72572 16.8467 5.52947L19.16 4.80985C20.0802 4.52359 20.8331 5.57662 20.2644 6.35473L18.8298 8.3179C18.4362 8.85663 18.6705 9.62248 19.2982 9.84869L21.6962 10.7128C22.5984 11.038 22.5699 12.3236 21.6542 12.6085L19.3662 13.3202C18.7146 13.5229 18.453 14.3043 18.8511 14.8585L20.246 16.8005C20.8121 17.5885 20.0372 18.6398 19.117 18.3324L16.6866 17.5204C16.039 17.304 15.3697 17.786 15.3697 18.4688V21.026C15.3697 21.9843 14.1519 22.3938 13.5729 21.6301L11.9573 19.4993C11.5506 18.9629 10.7409 18.9734 10.3482 19.5201L8.84725 21.6096C8.29002 22.3854 7.06631 22.0131 7.03559 21.0584L6.94981 18.3932C6.92856 17.7329 6.28416 17.2743 5.65329 17.4705L3.39578 18.1728C2.47005 18.4608 1.71725 17.3951 2.29806 16.6188L3.63735 14.8289C4.04321 14.2865 3.80363 13.506 3.16335 13.2847L0.734445 12.4451C-0.163318 12.1348 -0.163315 10.8652 0.734448 10.5549L3.16335 9.71533C3.80363 9.49403 4.04321 8.71352 3.63735 8.1711L2.17821 6.22099C1.60964 5.46111 2.32026 4.41074 3.23712 4.65581L5.87202 5.36011C6.507 5.52984 7.13025 5.0513 7.13025 4.39403V1.87955C7.13025 0.93114 8.32718 0.515473 8.91501 1.25974L10.5552 3.3364C10.9622 3.85179 11.7471 3.84154 12.1406 3.31569Z"
                        />
                      </svg>
                    </h3>
                  </div>
                  <div className="faq-content">
                    <div className="accordion" id="accordionTravel2">
                      <FAQ faqData={travelTipsFAQs} text={false} />
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {generalFAQs.length === 0 &&
                travelTipsFAQs.length === 0 &&
                !loading &&
                !error && (
                  <div className="text-center py-10">
                    <i
                      className="bi bi-question-circle"
                      style={{ fontSize: "4rem", color: "#ccc" }}
                    ></i>
                    <p className="text-gray-500 mt-3">
                      No FAQs available at the moment.
                    </p>
                    <button
                      className="btn btn-primary mt-3"
                      onClick={fetchFAQs}
                    >
                      Refresh
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <Newslatter />
      <Footer />
    </>
  );
};

export default FAQPage;
