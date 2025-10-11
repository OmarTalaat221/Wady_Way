import { Modal } from "antd";
import React, { useState } from "react";
import "./style.css";
import { Button, Drawer, Form, Input, Upload } from "antd";
import { CloudUploadOutlined, UploadOutlined } from "@ant-design/icons";

const SelfDeriveModal = ({ open, setOpen, onChange }) => {
  const [drivingLicense, setDrivingLicense] = useState([]);
  const [idCard, setIdCard] = useState([]);
  const [contract, setContract] = useState([]);
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <div className="fileBox">
        <CloudUploadOutlined />
      </div>
    </button>
  );

  const handleBeforeIdCardUpload = (file) => {
    setIdCard((prevList) => [file]);
    return false;
    
  };
  const handleBeforeIdSelfingDrivingUpload = (file) => {
    setDrivingLicense((prevList) => [file]);
    return false;
  };
  const handleBeforeContractUpload = (file) => {
    setContract((prevList) => [file]);
    return false;
  };

  return (
    <div>
      <Modal
        title=""
        open={open}
        onCancel={() => setOpen(false)}
        // okButtonProps={{ loading, className: "bg-danger hover:!bg-danger" }}
        okText="Delete Memory"
        // footer={false}
        // onOk={() => handleDelete()}
      >
        <div className="w-100 d-flex flex-column gap-4 justify-content-center align-items-center">
          <div className="d-flex flex-column justify-content-center gap-2 align-items-center">
            <div>Your Id Card image:</div>
            <div>
              <Upload
                accept="image/*"
                multiple={false}
                beforeUpload={handleBeforeIdCardUpload}
                fileList={idCard}
                onRemove={(file) => {
                  setIdCard((prevList) =>
                    prevList.filter((item) => item.uid !== file.uid)
                  );
                }}
                className="w-full flex flex-col h-[400px] items-center justify-center overflow-auto"
              >
                <div className=" w-full p-11">
                  {idCard[0] ? (
                    <img
                      draggable={false}
                      className="mx-auto shadow-2xl rounded-md cursor-pointer"
                      src={
                        idCard[0] instanceof File
                          ? URL.createObjectURL(idCard[0])
                          : idCard[0]?.url
                      }
                      alt="avatar"
                      style={{
                        width: "200px",

                        textAlign: "center ",
                      }}
                    />
                  ) : (
                    uploadButton
                  )}
                </div>
              </Upload>
            </div>
          </div>
          <div className="d-flex flex-column gap-2 align-items-center">
            <div>Your driving license:</div>
            <div>
              <Upload
                accept="image/*"
                multiple={false}
                beforeUpload={handleBeforeIdSelfingDrivingUpload}
                fileList={drivingLicense}
                onRemove={(file) => {
                  setDrivingLicense((prevList) =>
                    prevList.filter((item) => item.uid !== file.uid)
                  );
                }}
                className="w-full flex flex-col h-[400px] items-center justify-center overflow-auto"
              >
                <div className=" w-full p-11">
                  {drivingLicense[0] ? (
                    <img
                      draggable={false}
                      className="mx-auto shadow-2xl rounded-md cursor-pointer"
                      src={
                        drivingLicense[0] instanceof File
                          ? URL.createObjectURL(drivingLicense[0])
                          : drivingLicense[0]?.url
                      }
                      alt="avatar"
                      style={{
                        width: "200px",

                        textAlign: "center ",
                      }}
                    />
                  ) : (
                    uploadButton
                  )}
                </div>
              </Upload>
            </div>
          </div>
          <div className="d-flex flex-column gap-2 align-items-center">
            <div>Your Contract image:</div>
            <div>
              <Upload
                accept="image/*"
                multiple={false}
                beforeUpload={handleBeforeContractUpload}
                fileList={contract}
                onRemove={(file) => {
                  setContract((prevList) =>
                    prevList.filter((item) => item.uid !== file.uid)
                  );
                }}
                className="w-full flex flex-col h-[400px] items-center justify-center overflow-auto"
              >
                <div className=" w-full p-11">
                  {contract[0] ? (
                    <img
                      draggable={false}
                      className="mx-auto shadow-2xl rounded-md cursor-pointer"
                      src={
                        contract[0] instanceof File
                          ? URL.createObjectURL(contract[0])
                          : contract[0]?.url
                      }
                      alt="avatar"
                      style={{
                        width: "200px",

                        textAlign: "center ",
                      }}
                    />
                  ) : (
                    uploadButton
                  )}
                </div>
              </Upload>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SelfDeriveModal;
