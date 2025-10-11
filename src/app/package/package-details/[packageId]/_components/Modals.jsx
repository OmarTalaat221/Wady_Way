"use client";
import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const Modals = ({
  learnModal,
  setLearnModal,
  mapModal,
  setMapModal,
  rowData,
}) => {
  return (
    <>
      <Modal
        scrollable
        centered
        isOpen={learnModal}
        toggle={() => setLearnModal(false)}
        size="xl"
      >
        <ModalHeader
          toggle={() => setLearnModal(false)}
          className="experience_head"
        >
          <i className="fa fa-home"></i>{" "}
          {rowData?.title || "Experience Details"}
        </ModalHeader>

        <ModalBody>
          <div className="five_grid_modal">
            <div
              className="w-100"
              style={{
                position: "relative",
              }}
            >
              <img
                src={
                  rowData?.image ||
                  "https://gti.images.tshiftcdn.com/432053/x/0/northern-lights-dancing-in-the-autumn-sky.jpg?w=360&h=220&fit=crop&crop=center&auto=format%2Ccompress&q=32&dpr=2&ixlib=react-9.8.1"
                }
                alt="Main Room"
                className="img-fluid"
                style={{
                  borderRadius: "10px 0 0 10px",
                  height: "100%",
                }}
              />
              <span className="img_badge badge bg-danger mt-2">
                Likely to sell out soon
              </span>
            </div>
            <div className="w-100 img_grid_modal">
              <img
                src="https://gti.images.tshiftcdn.com/7946034/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="Building"
                className="img-fluid h-100"
              />
              <img
                src="https://gti.images.tshiftcdn.com/7946033/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="Room"
                className="img-fluid h-100"
                style={{
                  borderRadius: "0 10px 0 0 ",
                }}
              />
              <img
                src="https://gti.images.tshiftcdn.com/7946036/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="City"
                className="img-fluid h-100"
              />
              <img
                src="https://gti.images.tshiftcdn.com/7946035/x/0/.jpg?auto=format%2Ccompress&fit=crop&crop=center&dpr=2&q=32&w=228&h=180"
                alt="Lounge"
                className="img-fluid h-100"
                style={{
                  borderRadius: "0 0 10px 0",
                }}
              />
            </div>
          </div>

          {/* Description & Summary */}
          <div className="mt-4">
            <h5 className="text-primary">Description</h5>
            <p>
              {rowData?.description ||
                "This experience offers a unique opportunity to explore the natural beauty and cultural richness of the area. Participants will enjoy guided tours, engaging activities, and memorable moments in one of the most picturesque locations."}
            </p>
          </div>

          <div className="mt-3">
            <h5 className="text-primary">Summary</h5>
            <ul className="list-unstyled">
              <li>
                📍 <b>Location:</b> {rowData?.location || "Reykjavik, Iceland"}
              </li>
              <li>
                ⏱️ <b>Duration:</b> {rowData?.duration || "8 hours"}
              </li>
              <li>
                🌐 <b>Language:</b> {rowData?.language || "English"}
              </li>
              <li>
                📊 <b>Difficulty:</b> {rowData?.difficulty || "Moderate"}
              </li>
            </ul>
          </div>
        </ModalBody>

        {/* Modal Footer */}
        <ModalFooter>
          <span className="text-success fw-bold">
            +{rowData?.price || 120} USD
          </span>
          <Button color="success">Add to vacation</Button>
        </ModalFooter>
      </Modal>

      <Modal
        scrollable
        centered
        isOpen={mapModal}
        toggle={() => setMapModal(false)}
        size="xl"
      >
        <ModalHeader
          toggle={() => setMapModal(false)}
          className=""
        ></ModalHeader>

        <ModalBody>
          <iframe
            src="https://www.google.com/maps/d/u/0/embed?mid=1lsFRnAJyFnWmgitL0xs5qy6KFrmfD1Q"
            width="100%"
            height="600"
            frameBorder="0"
            style={{
              border: 0,
            }}
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
          ></iframe>
        </ModalBody>
      </Modal>
    </>
  );
};

export default Modals;
