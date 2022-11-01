import { Card, Space, Table } from "antd";
import React from "react";

const MoveTable = ({ moves }) => {
  const columns = [
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      //   width: "40%",
      render: color => {
        if (color === "w") {
          return <>White</>;
        } else {
          return <>Black</>;
        }
      },
    },
    {
      title: "Piece",
      dataIndex: "piece",
      key: "piece",
      //   width: "30%",
      ellipsis: true,
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      //   width: "10%",
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      //   width: "10%",
    },
    {
      title: "Flags",
      dataIndex: "flags",
      key: "flags",
      //   width: "10%",
      ellipsis: true,
    },
  ];
  return (
    <>
      <Space>
        <Card>
          <h3>Moves History</h3>
          <p>*most recent moves shown first*</p>
          <Table size="small" key="moves-table" dataSource={moves} columns={columns} />
        </Card>
      </Space>
    </>
  );
};

export default MoveTable;
