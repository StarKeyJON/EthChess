import { SearchOutlined } from "@ant-design/icons";
import { gql, useQuery } from "@apollo/client";
import { Button, Card, Input, Space, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { Link } from "react-router-dom";
import { GUNKEY } from "../../constants";

const ProfileInfo = ({ gun, address }) => {
  const [playerHistory, setPlayerHistory] = useState({});

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const matchQ = `
  {
      matches(player1: ${address}){
        id
        matchId
        player1 {
          id
        }
        player2 {
          id
        }
        startTime
        startHash
        endHash
        p1Amount
        p2Amount
        inProgress
      }
    }`;
  const MATCH_GQL = gql(matchQ);
  const { loading, matchData } = useQuery(MATCH_GQL, { pollInterval: 2500 });

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
      title: "Game ID",
      dataIndex: "gameId",
      key: "key",
      width: "20%",
      render: gameId => <Link to={`/match/room/${gameId}`}>{gameId}</Link>,
    },
    {
      title: "Player1",
      dataIndex: "player1",
      key: "player1",
      // width: "45%",
      ...getColumnSearchProps("player1"),
    },
    {
      title: "Player2",
      dataIndex: "player2",
      key: "player2",
      // width: "45%",
      ...getColumnSearchProps("player2"),
    },
    {
      title: "Started",
      dataIndex: "inProgress",
      key: "inProgress",
      width: "10%",
    },
    {
      title: "Wager Amount",
      dataIndex: "wager",
      key: "wager",
      width: "10%",
    },
  ];

  useEffect(() => {
    gun
      .get(GUNKEY)
      .get("chess_matches")
      .get(address)
      .map()
      .once(ack => {
        if (ack) {
          setPlayerHistory(ack);
        }
      });
  }, [address, gun]);

  return (
    <>
      <div>
        <h1>Profile</h1>
        <Card>
          <h3>Find your matches and match history info below!</h3>
        </Card>
      </div>
      <div>
        <h3>Current Live Matches</h3>
        <Table dataSource={playerHistory} columns={columns} />
      </div>
      <div>
        <h3>Match History</h3>
        <Table dataSource={playerHistory} columns={columns} />
      </div>
    </>
  );
};

export default ProfileInfo;
