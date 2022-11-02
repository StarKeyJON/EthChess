import { Card, Space, Table } from "antd";
import React, { useEffect, useState } from "react";

const MoveTable = ({ moves }) => {
  const [theMoves, setTheMoves] = useState();
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
  useEffect(() => {
    if (moves) {
      const newMoves = moves.map((move, i) => {
        Object.assign(move, { key: i });
        return move;
      });
      setTheMoves(newMoves);
    }
  }, [moves]);

  return (
    <>
      <Space>
        <Card>
          <h3>Moves History</h3>
          <p>*most recent moves shown first*</p>
          <Table size="small" key="moves-table" dataSource={theMoves} columns={columns} />
        </Card>
      </Space>
    </>
  );
};

export default MoveTable;
