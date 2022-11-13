import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Popover, Space, Table } from "antd";
import React, { useRef, useState } from "react";
import { FaInfoCircle, FaVoteYea } from "react-icons/fa";
import Highlighter from "react-highlight-words";
import { gql, useQuery } from "@apollo/client";

const Voting = ({ players }) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const matchQ = `
  {
      disputes(where: onGoing){
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
      title: "GameId",
      dataIndex: "gameId",
      key: "gameId",
      width: "20%",
    },
    {
      title: "Claim",
      dataIndex: "claimHash",
      key: "claimHash",
      width: "20%",
    },
    {
      title: "Dispute",
      dataIndex: "disputeHash",
      key: "disputeHash",
      width: "20%",
    },
    {
      title: "Votes",
      dataIndex: "votes",
      key: "votes",
      width: "20%",
    },
    {
      title: "Security",
      dataIndex: "security",
      key: "security",
      width: "20%",
      ...getColumnSearchProps("security"),
    },
  ];


  return (
    <>
      <div>
        <Card>
          <div style={{ marginTop: 50 }}>
            <h1>
              <FaVoteYea /> Match Disputes{" "}
              <Popover
                content={
                  <>
                    ETHChess NFT holders can vote for disputes in matches.
                    <br />
                    Up to eleven votes can be made per dispute.
                    <br />
                    There is a one day window to settle disputes.
                    <br />
                    Voters receive one half of the match initiation amount.
                  </>
                }
              >
                <FaInfoCircle size={12} />
              </Popover>
            </h1>
            <Table dataSource={!loading ? matchData : ""} columns={columns} />
          </div>
        </Card>
      </div>
    </>
  );
};

export default Voting;
