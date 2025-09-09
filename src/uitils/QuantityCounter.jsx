"use client";
import React from "react";

function QuantityCounter({
  dcrIcon = "bi bi-chevron-down",
  incIcon = "bi bi-chevron-up",
  quantity = 1,
  onQuantityChange,
  minQuantity = 0,
  maxQuantity = 99,
}) {
  const increment = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || minQuantity;
    if (value >= minQuantity && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="quantity-counter">
      <a
        className="quantity__minus"
        style={{
          cursor: quantity > minQuantity ? "pointer" : "not-allowed",
          opacity: quantity > minQuantity ? 1 : 0.5,
        }}
        onClick={decrement}
      >
        <i className={dcrIcon} />
      </a>
      <input
        name="quantity"
        type="text"
        className="quantity__input"
        value={quantity}
        onChange={handleInputChange}
      />
      <a
        className="quantity__plus"
        style={{
          cursor: quantity < maxQuantity ? "pointer" : "not-allowed",
          opacity: quantity < maxQuantity ? 1 : 0.5,
        }}
        onClick={increment}
      >
        <i className={incIcon} />
      </a>
    </div>
  );
}

export default QuantityCounter;
