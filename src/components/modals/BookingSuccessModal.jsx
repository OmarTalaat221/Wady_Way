// components/modals/BookingSuccessModal.jsx
"use client";
import React from "react";
import { Modal, Button } from "antd";
import { HomeOutlined, CheckOutlined } from "@ant-design/icons";

const BookingSuccessModal = ({ open, onClose, bookingDetails }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      destroyOnClose
      className="success-modal"
      styles={{
        header: { display: "none" },
        body: { padding: 0 },
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-500 px-7 py-8 text-center">
        {/* Checkmark */}
        <div className="w-[70px] h-[70px] bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckOutlined className="text-white text-4xl" />
        </div>

        <h3 className="text-white text-2xl font-bold m-0">Booking Submitted</h3>
        <p className="text-white/90 mt-2 text-[0.95rem] m-0">
          Your reservation is under review
        </p>
      </div>

      {/* Body */}
      <div className="pt-7">
        {/* Details Grid */}
        {bookingDetails && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3.5 text-center">
              <div className="text-[0.7rem] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Car
              </div>
              <div className="text-[0.95rem] text-gray-800 font-bold">
                {bookingDetails.carName}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 text-center">
              <div className="text-[0.7rem] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Duration
              </div>
              <div className="text-[0.95rem] text-gray-800 font-bold">
                {bookingDetails.days}{" "}
                {bookingDetails.days === 1 ? "Day" : "Days"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 text-center">
              <div className="text-[0.7rem] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Dates
              </div>
              <div className="text-[0.95rem] text-gray-800 font-bold">
                {bookingDetails.startDate} - {bookingDetails.endDate}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-center">
              <div className="text-[0.7rem] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Total
              </div>
              <div className="text-lg text-[#e8a355] font-bold">
                {bookingDetails.totalPrice}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-4 mb-5">
          <h6 className="text-blue-800 font-bold mb-3 text-sm">
            What happens next?
          </h6>

          <div className="flex items-start gap-2.5 mb-2">
            <span className="w-[22px] h-[22px] bg-blue-500 text-white rounded-full flex items-center justify-center text-[0.7rem] font-bold shrink-0 mt-0.5">
              1
            </span>
            <p className="text-gray-600 text-sm m-0 leading-snug">
              Our team will review your booking and verify your details.
            </p>
          </div>

          <div className="flex items-start gap-2.5 mb-2">
            <span className="w-[22px] h-[22px] bg-blue-500 text-white rounded-full flex items-center justify-center text-[0.7rem] font-bold shrink-0 mt-0.5">
              2
            </span>
            <p className="text-gray-600 text-sm m-0 leading-snug">
              Once approved, you will receive a payment link via email.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-[22px] h-[22px] bg-blue-500 text-white rounded-full flex items-center justify-center text-[0.7rem] font-bold shrink-0 mt-0.5">
              3
            </span>
            <p className="text-gray-600 text-sm m-0 leading-snug">
              Complete the payment to confirm your reservation.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2.5">
          <Button
            onClick={onClose}
            className="flex-1 h-12 text-[0.95rem] font-semibold"
          >
            Close
          </Button>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => (window.location.href = "/")}
            className="flex-1 h-12 text-[0.95rem] font-bold"
            style={{
              background: "linear-gradient(135deg, #e8a355, #d4903e)",
              border: "none",
            }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingSuccessModal;
