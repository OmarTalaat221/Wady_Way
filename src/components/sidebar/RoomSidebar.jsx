import React, { useState } from "react";

const RoomSidebar = ({ onFiltersChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [popularFilters, setPopularFilters] = useState({
    bookWithoutCard: false,
    freeCancellation: false,
    breakfastIncluded: false,
    noPrepayment: false,
    romantic: false,
  });
  const [facilities, setFacilities] = useState({
    airportShuttle: false,
    locker: false,
    gym: false,
    spa: false,
    parking: false,
    restaurant: false,
    swimmingPool: false,
    petFriendly: false,
  });
  const [starRatings, setStarRatings] = useState({
    fiveStar: false,
    fourHalfStar: false,
    fourStar: false,
    threeHalfStar: false,
    threeStar: false,
    twoHalfStar: false,
    twoStar: false,
    oneStar: false,
  });
  const [accessibility, setAccessibility] = useState({
    adaptedBath: false,
    rollInShower: false,
    raisedToilet: false,
    emergencyCord: false,
    showerChair: false,
  });

  // Handle search form submission
  // const handleSearchSubmit = (e) => {
  //   e.preventDefault();
  //   updateFilters();
  // };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);

    updateFilters();
  };

  // Handle popular filters change
  const handlePopularFilterChange = (filterName) => {
    const newFilters = {
      ...popularFilters,
      [filterName]: !popularFilters[filterName],
    };
    setPopularFilters(newFilters);
    updateFilters(newFilters);
  };

  // Handle facilities change
  const handleFacilitiesChange = (filterName) => {
    const newFilters = {
      ...facilities,
      [filterName]: !facilities[filterName],
    };
    setFacilities(newFilters);
    updateFilters();
  };

  // Handle star rating change
  const handleStarRatingChange = (filterName) => {
    const newFilters = {
      ...starRatings,
      [filterName]: !starRatings[filterName],
    };
    setStarRatings(newFilters);
    updateFilters();
  };

  // Handle accessibility change
  const handleAccessibilityChange = (filterName) => {
    const newFilters = {
      ...accessibility,
      [filterName]: !accessibility[filterName],
    };
    setAccessibility(newFilters);
    updateFilters();
  };

  // Update filters and notify parent component
  const updateFilters = (updatedPopularFilters = popularFilters) => {
    const allFilters = {
      searchTerm,
      popularFilters: updatedPopularFilters,
      facilities,
      starRatings,
      accessibility,
    };

    // Call parent callback if provided
    if (onFiltersChange) {
      onFiltersChange(allFilters);
    }
  };

  return (
    <>
      <div className="sidebar-area">
        <div className="single-widget mb-30">
          <h5 className="widget-title">Search Here</h5>
          <form>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search Here"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button type="submit">
                <i className="bx bx-search" />
              </button>
            </div>
          </form>
        </div>

        <div className="single-widget mb-30">
          <h5 className="widget-title">Popular Filters</h5>
          <div className="checkbox-container">
            <ul>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={popularFilters.bookWithoutCard}
                    onChange={() =>
                      handlePopularFilterChange("bookWithoutCard")
                    }
                  />
                  <span className="checkmark" />
                  <span className="text">Book without credit card</span>
                  <span className="qty">250</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={popularFilters.freeCancellation}
                    onChange={() =>
                      handlePopularFilterChange("freeCancellation")
                    }
                  />
                  <span className="checkmark" />
                  <span className="text">Free cancellation</span>
                  <span className="qty">90</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={popularFilters.breakfastIncluded}
                    onChange={() =>
                      handlePopularFilterChange("breakfastIncluded")
                    }
                  />
                  <span className="checkmark" />
                  <span className="text">Breakfast Included</span>
                  <span className="qty">35</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={popularFilters.noPrepayment}
                    onChange={() => handlePopularFilterChange("noPrepayment")}
                  />
                  <span className="checkmark" />
                  <span className="text">No prepayment</span>
                  <span className="qty">28</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={popularFilters.romantic}
                    onChange={() => handlePopularFilterChange("romantic")}
                  />
                  <span className="checkmark" />
                  <span className="text">Romantic</span>
                  <span className="qty">12</span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <div className="single-widget mb-30">
          <h5 className="widget-title">Facilities</h5>
          <div className="checkbox-container">
            <ul>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.airportShuttle}
                    onChange={() => handleFacilitiesChange("airportShuttle")}
                  />
                  <span className="checkmark" />
                  <span className="text">Airport shuttle</span>
                  <span className="qty">30</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.locker}
                    onChange={() => handleFacilitiesChange("locker")}
                  />
                  <span className="checkmark" />
                  <span className="text">Locker</span>
                  <span className="qty">90</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.gym}
                    onChange={() => handleFacilitiesChange("gym")}
                  />
                  <span className="checkmark" />
                  <span className="text">Gym</span>
                  <span className="qty">35</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.spa}
                    onChange={() => handleFacilitiesChange("spa")}
                  />
                  <span className="checkmark" />
                  <span className="text">Spa</span>
                  <span className="qty">28</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.parking}
                    onChange={() => handleFacilitiesChange("parking")}
                  />
                  <span className="checkmark" />
                  <span className="text">Parking</span>
                  <span className="qty">70</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.restaurant}
                    onChange={() => handleFacilitiesChange("restaurant")}
                  />
                  <span className="checkmark" />
                  <span className="text">Restaurant</span>
                  <span className="qty">120</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.swimmingPool}
                    onChange={() => handleFacilitiesChange("swimmingPool")}
                  />
                  <span className="checkmark" />
                  <span className="text">Swimming pool</span>
                  <span className="qty">36</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={facilities.petFriendly}
                    onChange={() => handleFacilitiesChange("petFriendly")}
                  />
                  <span className="checkmark" />
                  <span className="text">Pet friendly</span>
                  <span className="qty">10</span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <div className="single-widget mb-30">
          <h5 className="widget-title">Star Rating</h5>
          <div className="checkbox-container">
            <ul>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.fiveStar}
                    onChange={() => handleStarRatingChange("fiveStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <a href="#" className="review-no">
                      (5)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.fourHalfStar}
                    onChange={() => handleStarRatingChange("fourHalfStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-half" />
                    <a href="#" className="review-no">
                      (4.5)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.fourStar}
                    onChange={() => handleStarRatingChange("fourStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <a href="#" className="review-no">
                      (4.0)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.threeHalfStar}
                    onChange={() => handleStarRatingChange("threeHalfStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-half" />
                    <a href="#" className="review-no">
                      (3.5)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.threeStar}
                    onChange={() => handleStarRatingChange("threeStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <a href="#" className="review-no">
                      (3.0)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.twoHalfStar}
                    onChange={() => handleStarRatingChange("twoHalfStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-half" />
                    <a href="#" className="review-no">
                      (2.5)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.twoStar}
                    onChange={() => handleStarRatingChange("twoStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <a href="#" className="review-no">
                      (2.0)
                    </a>
                  </span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={starRatings.oneStar}
                    onChange={() => handleStarRatingChange("oneStar")}
                  />
                  <span className="checkmark" />
                  <span className="stars">
                    <i className="bi bi-star-fill" />
                    <a href="#" className="review-no">
                      (1.0)
                    </a>
                  </span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <div className="single-widget">
          <h5 className="widget-title">Room Accessibility</h5>
          <div className="checkbox-container">
            <ul>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={accessibility.adaptedBath}
                    onChange={() => handleAccessibilityChange("adaptedBath")}
                  />
                  <span className="checkmark" />
                  <span className="text">Adapted bath</span>
                  <span className="qty">250</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={accessibility.rollInShower}
                    onChange={() => handleAccessibilityChange("rollInShower")}
                  />
                  <span className="checkmark" />
                  <span className="text">Roll-in shower</span>
                  <span className="qty">90</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={accessibility.raisedToilet}
                    onChange={() => handleAccessibilityChange("raisedToilet")}
                  />
                  <span className="checkmark" />
                  <span className="text">Raised toilet</span>
                  <span className="qty">35</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={accessibility.emergencyCord}
                    onChange={() => handleAccessibilityChange("emergencyCord")}
                  />
                  <span className="checkmark" />
                  <span className="text">Emergency cord in bathroom</span>
                  <span className="qty">28</span>
                </label>
              </li>
              <li>
                <label className="containerss">
                  <input
                    type="checkbox"
                    checked={accessibility.showerChair}
                    onChange={() => handleAccessibilityChange("showerChair")}
                  />
                  <span className="checkmark" />
                  <span className="text">Shower chair</span>
                  <span className="qty">12</span>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomSidebar;
