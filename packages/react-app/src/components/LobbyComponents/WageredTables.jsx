import React, { useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Table, Button, Input, Space, Row, Col, Popover } from "antd";
import { FaInfoCircle } from "react-icons/fa";

import { matchQ } from "./matchGraphQ";
import { HandleNewDeathMatch, HandleNewMatch, HandleStartDMatch, HandleStartMatch } from "./moveModals/Modals";

const WageredTables = ({
  gun,
  gunUser,
  players,
  tx,
  writeContracts,
  readContracts,
  mainnetProvider,
  address,
  loggedIn,
  setLoginModal,
}) => {
  const MATCH_GQL = gql(matchQ);
  const { loading, data } = useQuery(MATCH_GQL, { pollInterval: 2500 });
  const [newMatchModal, setNewMatchModal] = useState(false);
  const [newDeathMatchModal, setNewDeathMatchModal] = useState(false);
  const [startMatchModal, setStartMatchModal] = useState(false);
  const [startDMatchModal, setStartDMatchModal] = useState(false);
  const [gameId, setGameId] = useState();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // console.log(data);

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
      title: "Start Match",
      dataIndex: "gameId",
      key: "key",
      render: gameId => (
        <Button
          onClick={() => {
            if (loggedIn) {
              setGameId(gameId);
              setStartMatchModal(true);
            } else {
              setLoginModal(true);
            }
          }}
        >
          Enter
        </Button>
      ),
    },
    {
      title: "Game ID",
      dataIndex: "gameId",
      key: "key",
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

  const dcolumns = [
    {
      title: "Start Round",
      dataIndex: "gameId",
      key: "key",
      render: gameId => (
        <Button
          onClick={() => {
            if (loggedIn) {
              setGameId(gameId);
              setStartMatchModal(true);
            } else {
              setLoginModal(true);
            }
          }}
        >
          Enter
        </Button>
      ),
    },
    {
      title: "Game ID",
      dataIndex: "gameId",
      key: "gameId",
      width: "20%",
    },
    {
      title: "Reigning Champion",
      dataIndex: "reigningChamp",
      key: "reigningChamp",
      // width: "30%",
    },
    {
      title: "Round Started",
      dataIndex: "inProgress",
      key: "inProgress",
      // width: "10%",
    },
    {
      title: "Total Rewards",
      dataIndex: "totalRewards",
      key: "totalRewards",
      width: "10%",
    },
    {
      title: "Entrance Fee",
      dataIndex: "entranceFee",
      key: "entranceFee",
      width: "10%",
    },
  ];

  return (
    <div style={{ marginBottom: 100 }}>
      <Row gutter={[30, 30]}>
        <Col flex="auto">
          <div style={{ alignContent: "center", justifyContent: "center", display: "flex", margin: 30 }}>
            <Card>
              <h2>
                Initiate New Match{" "}
                <Popover
                  content={
                    <>
                      Enter an ETH amount to set the match wager.
                      <br />
                      Enter the first move if you would like to go first.
                      <br />
                      Execute the transaction to initiate the match.
                      <br />
                      The winner of the match executes a claim.
                      <br /> If the claim goes uncontested for 7 blocks, the claimant can execute a call to finalize the
                      results and disperse the funds.
                      <br /> If the claim is disputed, ETHChess NFT holders will review the results and vote for the
                      winner.
                      <br /> Refunds can be initiated by any party before a winning claim is entered, both parties must
                      confirm.
                    </>
                  }
                >
                  <FaInfoCircle size={12} />
                </Popover>{" "}
                <Button
                  style={{ margin: 10 }}
                  onClick={() => {
                    // loggedIn ? 
                    setNewMatchModal(true) 
                    // : setLoginModal(true);
                  }}
                >
                  Initiate
                </Button>
                <HandleNewMatch
                  gun={gun}
                  gunUser={gunUser}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  mainnetProvider={mainnetProvider}
                  newMatchModal={newMatchModal}
                  setNewMatchModal={setNewMatchModal}
                  address={address}
                />
              </h2>
            </Card>
          </div>
          <h3>Enter a Wagered Match Below!</h3>
          <Card>
            <Table dataSource={data?.matches} columns={columns} />
          </Card>
          <HandleStartMatch
            gun={gun}
            gunUser={gunUser}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            startMatchModal={startMatchModal}
            setStartMatchModal={setStartMatchModal}
            address={address}
            gameId={gameId}
          />
        </Col>
        <Col flex="auto">
          <div style={{ alignContent: "center", justifyContent: "center", display: "flex", margin: 30 }}>
            <Card>
              <h2>
                Initiate a New Death Match{" "}
                <Popover
                  content={
                    <>
                      DeathMatches operate just as regular matches, but with a rolling reigning champion to beat!
                      <br />
                      There can be only one DeathMatch at a time!
                      <br />
                      Enter an ETH amount to set the DeathMatch entrance fee and execute the transaction to initiate the
                      DeathMatch.
                      <br />
                      Each opponent must pay the entrance fee to start a new round. If the opponent wins, they become
                      the new reigning champion.
                      <br />
                      The first reigning champion to beat three contestants in a row wins the entrance fee pool, plus
                      half of the ETHChess Rewards pool!
                      <br /> If a claim is disputed, ETHChess NFT holders will review the results and vote for the round
                      winner.
                      <br /> No refunds can be initiated.
                    </>
                  }
                >
                  <FaInfoCircle size={12} />
                </Popover>{" "}
                <Button
                  style={{ margin: 10 }}
                  onClick={() => {
                    loggedIn ? setNewMatchModal(true) : setLoginModal(true);
                  }}
                >
                  Initiate
                </Button>
                <HandleNewDeathMatch
                  gun={gun}
                  gunUser={gunUser}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  newDeathMatchModal={newDeathMatchModal}
                  setNewDeathMatchModal={setNewDeathMatchModal}
                  address={address}
                />
              </h2>
            </Card>
          </div>
          <h3>Enter a DeathMatch Below!</h3>
          <Card>
            <Table dataSource={data?.deathMatches} columns={dcolumns} />
          </Card>
          <HandleStartDMatch
            gun={gun}
            gunUser={gunUser}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            startDMatchModal={startDMatchModal}
            setStartDMatchModal={setStartDMatchModal}
            address={address}
          />
        </Col>
      </Row>
      <br />
    </div>
  );
};

export default WageredTables;
