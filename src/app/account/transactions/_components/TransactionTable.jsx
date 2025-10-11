"use client";
import { Card, Col, Row, Tag } from "antd";
import DataTable, {
  getColumnDateProps,
  getColumnSearchProps,
} from "../../../../uitils/DataTable";
import { FaArrowDown, FaArrowUp, FaMinus } from "react-icons/fa6";

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "Africa/Cairo",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTransactionType = (transaction) => {
  if (transaction.transaction_type === "deposit") {
    return "deposit";
  } else if (
    transaction.transaction_type === "withdeaw" ||
    transaction.transaction_type === "withdraw"
  ) {
    return "withdraw";
  } else if (
    transaction.transaction_type === "" &&
    transaction.transaction_reason.includes("deducted")
  ) {
    return "expense";
  } else {
    return "other";
  }
};

const getTransactionIcon = (type) => {
  switch (type) {
    case "deposit":
      return <FaArrowDown />;
    case "withdraw":
      return <FaArrowUp />;
    case "expense":
      return <FaMinus />;
    default:
      return <FaMinus />;
  }
};

const getTransactionColor = (type) => {
  switch (type) {
    case "deposit":
      return "bg-success";
    case "withdraw":
      return "bg-danger";
    case "expense":
      return "bg-warning";
    default:
      return "bg-secondary";
  }
};

const getTagColor = (type) => {
  switch (type) {
    case "deposit":
      return "green";
    case "withdraw":
      return "red";
    case "expense":
      return "orange";
    default:
      return "default";
  }
};

const headers = [
  {
    title: "Transaction Date",
    ...getColumnDateProps("created_at"),
    dataIndex: "created_at",
    render: (date, row) => {
      const type = getTransactionType(row);
      return (
        <div className="d-flex align-items-center gap-2 justify-center">
          <div
            className={`p-2 rounded-circle w-9 h-9 flex items-center justify-center ${getTransactionColor(
              type
            )} text-light`}
          >
            {getTransactionIcon(type)}
          </div>
          <div>{formatDate(date)}</div>
        </div>
      );
    },
  },
  {
    title: "Type",
    dataIndex: "transaction_type",
    key: "transaction_type",
    align: "center",
    sorter: (a, b) => {
      const typeA = getTransactionType(a);
      const typeB = getTransactionType(b);
      return typeA.localeCompare(typeB);
    },
    render: (_, record) => {
      const type = getTransactionType(record);
      return <Tag color={getTagColor(type)}>{type.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "center",
    sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    render: (amount, record) => {
      const type = getTransactionType(record);
      const prefix = type === "deposit" ? "+" : "-";
      const colorClass = type === "deposit" ? "text-success" : "text-danger";

      return (
        <span className={`font-weight-bold ${colorClass}`}>
          {prefix}${parseFloat(amount).toFixed(2)}
        </span>
      );
    },
  },
  {
    title: "Description",
    dataIndex: "transaction_reason",
    key: "transaction_reason",
    align: "center",
    sorter: (a, b) => a.transaction_reason.localeCompare(b.transaction_reason),
    ...getColumnSearchProps("transaction_reason"),
    render: (reason) => {
      // Truncate long descriptions
      return reason.length > 50 ? `${reason.substring(0, 50)}...` : reason;
    },
  },
];

const TransactionTable = ({ transactions, loading }) => {
  // Transform API data to match table structure
  const transformedData = transactions.map((transaction, index) => ({
    key: transaction.transaction_id || index,
    ...transaction,
  }));

  return (
    <Row className="mt-4">
      <Col xs="24" xl={24} className="!w-full">
        <Card
          title={<div className="fs-4">Your Transactions</div>}
          bordered={false}
        >
          <div className="">
            <DataTable
              loading={loading}
              addBtn={false}
              searchPlaceholder={"Search for transactions"}
              table={{ header: headers, rows: transformedData }}
              bordered={true}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionTable;
