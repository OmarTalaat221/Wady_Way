"use client";
import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { useLocale, useTranslations } from "next-intl";

const Modals = ({
  learnModal,
  setLearnModal,
  mapModal,
  setMapModal,
  rowData,
}) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  return (
    <>
      {/* Experience Details Modal */}
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
          <i className="fa fa-home me-2"></i>
          {rowData?.title?.[locale] ||
            rowData?.title?.en ||
            "Experience Details"}
        </ModalHeader>

        <ModalBody>
          <div className="five_grid_modal">
            <div className="w-100" style={{ position: "relative" }}>
              <img
                src={rowData?.image || "https://via.placeholder.com/600x400"}
                alt="Experience"
                className="img-fluid"
                style={{
                  borderRadius: "10px 0 0 10px",
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400";
                }}
              />
              <span className="img_badge badge bg-danger position-absolute top-0 start-0 m-2 h-fit">
                Popular Choice
              </span>
            </div>
            <div className="w-100 img_grid_modal">
              {[1, 2, 3, 4].map((index) => (
                <img
                  key={index}
                  src={rowData?.image || "https://via.placeholder.com/228x180"}
                  alt={`Experience ${index}`}
                  className="img-fluid h-100"
                  style={{
                    borderRadius:
                      index === 2
                        ? "0 10px 0 0"
                        : index === 4
                        ? "0 0 10px 0"
                        : "0",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/228x180";
                  }}
                />
              ))}
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
            <h5 className="text-primary">Experience Details</h5>
            <div className="row">
              <div className="col-md-6">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>📍 Location:</strong>{" "}
                    {rowData?.location?.[locale] ||
                      rowData?.location?.en ||
                      "Not specified"}
                  </li>
                  <li className="mb-2">
                    <strong>⏱️ Duration:</strong>{" "}
                    {rowData?.duration?.[locale] ||
                      rowData?.duration?.en ||
                      "Not specified"}
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>🌐 Language:</strong>{" "}
                    {rowData?.language?.[locale] ||
                      rowData?.language?.en ||
                      "English"}
                  </li>
                  <li className="mb-2">
                    <strong>📊 Difficulty:</strong>{" "}
                    {rowData?.difficulty?.[locale] ||
                      rowData?.difficulty?.en ||
                      "Easy"}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features */}
          {rowData?.features && rowData.features.length > 0 && (
            <div className="mt-3">
              <h5 className="text-primary">What's Included</h5>
              <div className="row">
                {rowData.features.map((feature, index) => (
                  <div key={index} className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      <span>{feature.feature || feature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="text-success fw-bold fs-5">
              ${rowData?.price || 0} USD
            </span>
            <Button color="success" size="lg">
              Add to Vacation
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Map Modal */}
      <Modal
        scrollable
        centered
        isOpen={mapModal}
        toggle={() => setMapModal(false)}
        size="xl"
      >
        <ModalHeader toggle={() => setMapModal(false)}>
          <i className="fa fa-map-marker-alt me-2"></i>
          Location Map
        </ModalHeader>

        <ModalBody className="p-0">
          <iframe
            src="https://www.google.com/maps/d/u/0/embed?mid=1lsFRnAJyFnWmgitL0xs5qy6KFrmfD1Q"
            width="100%"
            height="600"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen=""
            aria-hidden="false"
            tabIndex="0"
            title="Location Map"
          ></iframe>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={() => setMapModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Modals;
