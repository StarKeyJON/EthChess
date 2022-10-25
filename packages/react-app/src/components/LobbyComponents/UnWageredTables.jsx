import React, { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Table, Button, Input, Space, Popover } from "antd";
import { Link } from "react-router-dom";
import { FaChess, FaInfoCircle } from "react-icons/fa";

const UnWageredTables = ({ players }) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "GameId",
      dataIndex: "gameId",
      key: "gameId",
      width: "20%",
      render: gameId => <Link to={`/skirmish/room/${gameId}`}>{gameId}</Link>,
    },
    {
      title: "Started",
      dataIndex: "started",
      key: "started",
      width: "20%",
      render: started => started ? <>True</>:<>False</>
    },
    {
      title: "Player1",
      dataIndex: "player1",
      key: "player1",
      width: "20%",
      ...getColumnSearchProps("player1"),
    },
    {
      title: "Player2",
      dataIndex: "player2",
      key: "player2",
      width: "20%",
      ...getColumnSearchProps("player2"),
    },
    {
      title: "FEN",
      dataIndex: "fen",
      key: "fen",
      width: "20%",
    },
    // {
    //   title: "Joined",
    //   dataIndex: "joined",
    //   key: "joined",
    //   width: "20%",
    //   render: (a) => {new Date(a.joined).toUTCString()}
    // }
  ];

  return (
    <>
      <Card>
        <Table
          size="medium"
          title={() => (
            <div>
              <h1>
                <FaChess /> Live Skirmishes{" "}
                <Popover
                  content={
                    <>
                      A skirmish room is created for each player when they join the lobby.
                      <br />
                      No wagers are made and no moves are recorded to IPFS.
                    </>
                  }
                >
                  <FaInfoCircle size={12} />
                </Popover>
              </h1>
              <p>Enter skirmishes against live players around the world.</p>
            </div>
          )}
          dataSource={players}
          columns={columns}
        />
      </Card>
    </>
  );
};

export default UnWageredTables;
