// components/modals/InvitationCodeModal.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, Form } from "antd";
import {
  ArrowRightOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const InvitationCodeModal = ({ open, onClose, onSubmit, loading }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
    if (!open) {
      setCode("");
      setError("");
    }
  }, [open]);

  const handleSubmit = () => {
    setError("");

    if (!code.trim()) {
      setError("Please enter your invitation code");
      return;
    }

    if (code.trim().length < 4) {
      setError("Invitation code must be at least 4 characters");
      return;
    }

    onSubmit(code.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={460}
      destroyOnClose
      className="invitation-modal"
      styles={{
        header: { display: "none" },
        body: { padding: 0 },
      }}
    >
      {/* Header */}
      <div className="bg-[#295557] px-7 py-6 text-center">
        <h4 className="text-white text-xl font-bold m-0">Invitation Code</h4>
        <p className="text-white/90 mt-1.5 text-sm m-0">
          Enter your code to proceed with booking
        </p>
      </div>

      {/* Body */}
      <div className="pt-7">
        {/* Input */}
        <div className="mb-4">
          <label className="block font-semibold mb-2 text-center text-gray-800 text-base">
            Your Invitation Code
          </label>
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError("");
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter code here..."
            disabled={loading}
            maxLength={20}
            autoComplete="off"
            status={error ? "error" : ""}
            className="h-[52px] text-center text-lg font-semibold tracking-widest uppercase"
            styles={{
              input: {
                textAlign: "center",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              },
            }}
          />
          {error && (
            <div className="text-red-500 text-sm mt-1.5 flex items-center justify-center gap-1">
              <ExclamationCircleOutlined />
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 pt-1.5">
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            icon={!loading && <ArrowRightOutlined />}
            className="h-12 text-base font-bold"
            style={{
              background: "linear-gradient(135deg, #e8a355, #d4903e)",
              border: "none",
            }}
          >
            {loading ? "Validating..." : "Continue to Booking"}
          </Button>

          <Button
            onClick={onClose}
            disabled={loading}
            className="h-[42px] text-sm font-medium"
          >
            Cancel
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Don't have a code? Contact our support team.
        </p>
      </div>
    </Modal>
  );
};

export default InvitationCodeModal;
