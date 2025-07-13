"use client";
import { Button, Card, Col, Row, Tag } from "antd";
import DataTable, {
  getColumnDateProps,
  getColumnSearchProps,
} from "../../../../uitils/DataTable";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";

const formattedDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; // Handle invalid date
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatDate = (date) => {
  return date.toLocaleString("en-US", {
    timeZone: "Africa/Cairo",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const headers = [
  {
    title: " Transaction Date",
    ...getColumnDateProps("createdAt"),
    dataIndex: "createdAt",
    render: (date, row) => {
      return (
        <div className="d-flex align-items-center gap-2 justify-center">
          <div
            className={`p-2 rounded-circle w-9 h-9 flex items-center justify-center ${
              row.type == "deposit" ? "bg-success" : "bg-danger"
            } text-light`}
          >
            {row.type == "deposit" ? <FaArrowDown /> : <FaArrowUp />}
          </div>
          <div>{formatDate(new Date(date))}</div>
        </div>
      );
    },
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    align: "center",
    sorter: (a, b) => a.type.localeCompare(b.type),
    render: (type) => {
      return (
        <Tag
          color={type == "deposit" ? "green" : "red"}
          className={type == "deposit" ? "text-success" : "text-danger"}
        >
          {type?.toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    align: "center",
    sorter: (a, b) => new Date(a.price) - new Date(b.price),
    render: (price) => {
      return <>$ {price}</>;
    },
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    align: "center",
    sorter: (a, b) => a.description.localeCompare(b.description),
    ...getColumnSearchProps("description"),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    align: "center",
    sorter: (a, b) => a.status.localeCompare(b.status),
    // ...getColumnSearchProps("description"),
    render: (status) => {
      return (
        <span className={status == "pending" ? "text-danger" : "text-success"}>
          {status?.toUpperCase()}
        </span>
      );
    },
  },

  // {
  //   title: "Actions",
  //   key: "actions",
  //   align: "end",
  //   render: (record, row) => (
  //     <div className="flex items-center justify-end gap-3">
  //       <button
  //         onClick={() => {
  //           setDeleteModal(true);
  //           setRowData(row);
  //         }}
  //         title="Delete Feature"
  //         className=" bg-danger text-white p-2 leading-none rounded-full text-lg hover:scale-110 transition-all"
  //       >
  //         <DeleteOutlined />
  //       </button>
  //       <button
  //         onClick={() => {
  //           setEditModal(true);
  //           setRowData(row);
  //         }}
  //         title="Edit Feature"
  //         className="bg-primary text-white p-2 leading-none rounded-full text-lg hover:scale-110 transition-all"
  //       >
  //         <EditOutlined />{" "}
  //       </button>
  //       <button
  //         onClick={() => {
  //           setShowHideModal(true);
  //           setRowData(row);
  //         }}
  //         title="Hide / Display Feature"
  //         className="bg-warning text-white p-2 leading-none rounded-full text-lg hover:scale-110 transition-all"
  //       >
  //         <EyeOutlined />
  //       </button>
  //     </div>
  //   ),
  // },
];

export const data = [
  {
    createdAt: "2025-02-10",
    price: "800",
    description: "this is a description of the transaction",
    status: "complete",
    type: "withdraw",
  },
  {
    createdAt: "2025-02-11",
    price: "800",
    description: "this is a description of the transaction",
    status: "complete",
    type: "deposit",
  },
  {
    createdAt: "2025-02-12",
    price: "800",
    description: "this is a description of the transaction",
    status: "pending",
    type: "deposit",
  },
  {
    createdAt: "2025-02-13",
    price: "800",
    description: "this is a description of the transaction",
    status: "complete",
    type: "withdraw",
  },
  {
    createdAt: "2025-02-14",
    price: "800",
    description: "this is a description of the transaction",
    status: "pending",
    type: "deposit",
  },
  {
    createdAt: "2025-02-15",
    price: "800",
    description: "this is a description of the transaction",
    status: "complete",
    type: "deposit",
  },
];

const TransactionTable = () => {
  return (
    <Row className="mt-4">
      <Col xs="24" xl={24} className="!w-full">
        <Card
          title={<div className="fs-4">Your transactions</div>}
          bordered={false}
        >
          <div className="">
            <DataTable
              loading={false}
              addBtn={false}
              // onAddClick={() => setAddModal(true)}
              searchPlaceholder={"Search for transactions"}
              table={{ header: headers, rows: data }}
              bordered={true}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionTable;
