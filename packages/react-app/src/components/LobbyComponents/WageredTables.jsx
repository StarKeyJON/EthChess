import React, { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Table, Button, Input, Space, Row, Col, Popover, Modal, InputNumber, Image, Avatar, message, notification, Divider } from "antd";
import { FaInfoCircle } from "react-icons/fa";
import { useCallback } from "react";
import ethlogo from "../../assets/ethereumLogo.png";
import { TbCurrencyEthereum } from "react-icons/tb";
import { useContractReader } from "eth-hooks";
import Text from "antd/lib/typography/Text";
import { utils } from "ethers";
import AddressInput from "../AddressInput";
import { appStage, beginningFEN } from "../../constants";
import { Link } from "react-router-dom";
import Chessground from "react-chessground/chessground";
import { Chess } from "chess.js";

const WageredTables = ({ players, address, tx, writeContracts, readContracts, mainnetProvider }) => {
  const [newMatchModal, setNewMatchModal] = useState(false);
  const [newDeathMatchModal, setNewDeathMatchModal] = useState(false);
  const [confirmMatchModal, setConfirmMatchModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const minWager = useContractReader(readContracts, "ETHChessMatches", "minWager")?.toString() / 1e18;

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
      render: gameId => <Link to={`/deathmatch/room/${gameId}`}>{gameId}</Link>,
    },
    {
      title: "Player",
      dataIndex: "playerName",
      key: "playerName",
      width: "35%",
      ...getColumnSearchProps("playerName"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "45%",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Joined",
      dataIndex: "timeJoined",
      key: "timeJoined",
      width: "20%",
    },
  ];

  const dcolumns = [
    {
      title: "Game ID",
      dataIndex: "gameId",
      key: "key",
      width: "20%",
      render: gameId => <Link to={`/match/room/${gameId}`}>{gameId}</Link>,
    },
    {
      title: "Player",
      dataIndex: "playerName",
      key: "playerName",
      width: "35%",
      ...getColumnSearchProps("playerName"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "45%",
      ...getColumnSearchProps("address"),
    },
    {
      title: "Joined",
      dataIndex: "timeJoined",
      key: "timeJoined",
      width: "20%",
    },
  ];

  const executeNewMatch = ({ tx, writeContracts, wageredAmount }) => {
    tx(
      writeContracts.ETHChessMatches.initMatch({
        value: utils.parseEther(wageredAmount.toString()),
      }),
      update => {
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
          notification.open({
            message: <Text>{"Match Initiated!"}</Text>,
          });
        }
      });
  };

  const executeNewChallengeMatch = ({ tx, writeContracts, wageredAmount, challenger }) => {
    tx(
      writeContracts.ETHChessMatches.initChallengeMatch(challenger, {
        value: utils.parseEther(wageredAmount.toString()),
      }),
      update => {
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
          notification.open({
            message: <Text>{"Match Initiated with Challenger " + challenger + "!"}</Text>,
          });
        }
      },
    );
  };

  const executeNewDeathMatch = ({ tx, writeContracts, wageredAmount }) => {
    tx(
      writeContracts.ETHChessMatches.initDeathMatch({
        value: utils.parseEther(wageredAmount.toString()),
      }),
      update => {
        if (update && (update.status === "confirmed" || update.status === 1)) {
          message.info(" 🍾 Transaction " + update.hash + " finished!");
          message.info(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
          notification.open({
            message: <Text>{"Match Initiated!"}</Text>,
          });
        }
      },
    );
  };

  const handleChallenge = (wageredAmount, challenger) => {
    if (typeof challenger === "undefined") {
      appStage === "production"
        ? executeNewMatch(tx, writeContracts, wageredAmount)
        : console.log("Execute transaction!");
    } else if (challenger && challenger.length === 42 && challenger.slice(0, 2) === "0x") {
      appStage === "production" && executeNewChallengeMatch(tx, writeContracts, wageredAmount, challenger);
    }
  };

  const HandleNewMatch = () => {
    const [moveBoardVisible, setMoveBoardVisible] = useState(false);
    const [wageredAmount, setWageredAmount] = useState(0);
    const [challenger, setChallenger] = useState();
    const [fen, setFen] = useState(beginningFEN);
    const setAmount = useCallback(
      amt => {
        setWageredAmount(amt);
      },
      [wageredAmount],
    );

    const MoveBoardModal = () => {
      const chess = new Chess();
      const [chessObject, setChessObject] = useState({
        pendingMove: [],
        lastMove: "",
        fen: "",
      });

      const onMove = (from, to, data) => {
        var themove = chess.move({ from, to });
        if (themove == null) {
          notification.open({ message: "Illegal move!" });
          setChessObject({ ...chessObject, fen: chess.fen() });
          return;
        } else {
          setFen(chess.fen());
          setMoveBoardVisible(false);
        }
      };

      const calcMovable = () => {
        if (chess && chess.SQUARES) {
          const dests = new Map();
          chess.SQUARES.forEach(s => {
            const ms = chess.moves({ square: s, verbose: true });
            if (ms.length)
              dests.set(
                s,
                ms.map(m => m.to),
              );
          });
          return {
            free: false,
            dests,
            color: "white",
          };
        }
      };

      return (
        <>
          <Modal style={{ alignItems: "center", justifyContent: "center", display: "flex" }} visible={moveBoardVisible}>
            <Chessground
              width={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
              height={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
              turnColor={"white"}
              movable={calcMovable()}
              lastMove={chessObject.lastMove}
              fen={chessObject.fen}
              onMove={onMove}
              check={false}
              style={{ margin: "auto" }}
              orientation={"white"}
            />
          </Modal>
        </>
      );
    };

    return (
      <Modal
        title="New Match"
        visible={newMatchModal}
        onOk={() => {
          if (wageredAmount > 0) {
            setConfirmMatchModal(true);
          } else {
            notification.open({ message: "Please enter a wager amount!" });
          }
        }}
        onCancel={() => {
          setNewMatchModal(false);
        }}
      >
        <h3>Initiate a new Match by entering a wagered amount!</h3>
        <br />
        <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <div>
            Wagered Amount
            <br />
            <InputNumber
              min={0.00001}
              defaultValue={0.00001}
              onChange={val => {
                setAmount(val);
              }}
            />
            <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} />
            ETH
          </div>
        </div>
        <Divider />
        <div
          style={{ alignItems: "center", justifyContent: "center", display: "flex", marginTop: 10, marginBottom: 20 }}
        >
          <div>
            Enter an address/ENS name for a Challenge match, else leave blank.
            <AddressInput
              value={challenger}
              ensProvider={mainnetProvider}
              onChange={e => {
                setChallenger(e);
              }}
            />
          </div>
        </div>
        <Divider />
        <div>
          <p>Take the first move, or let your opponent take the first move.</p>
          <div style={{ alignItems: "right", justifyContent: "right", display: "flex" }}>
            <Button
              onClick={() => {
                setMoveBoardVisible(true);
              }}
            >
              Move
            </Button>
          </div>
          <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
            <MoveBoardModal />
          </div>
          <p>Current gameplay FEN: {fen}</p>
        </div>
        <Divider />
        <p style={{ marginTop: 30 }}>
          *Total funds needed will be <TbCurrencyEthereum />
          {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount} security deposit for a winning match claim, or, <TbCurrencyEthereum />
          {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount * 2} to dispute the match outcome.
        </p>
        (*security deposit returned after dispute resolution process)
        <br />
        (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
        <Modal
          title="Confirm transaction"
          visible={confirmMatchModal}
          onCancel={() => setConfirmMatchModal(false)}
          onOk={() => {
            handleChallenge(wageredAmount, challenger);
          }}
        >
          <h3>You are about to execute a transaction to initiate a new Match.</h3>
          <br />
          <p>Press ok to confirm and sign the transaction.</p>
        </Modal>
      </Modal>
    );
  };

  const HandleNewDeathMatch = () => {
    const [moveBoardVisible, setMoveBoardVisible] = useState(false);
    const [wageredAmount, setWageredAmount] = useState(0);
    const [fen, setFen] = useState(beginningFEN);
    const setAmount = useCallback(
      amt => {
        setWageredAmount(amt);
      },
      [wageredAmount],
    );

    const MoveBoardModal = () => {
      const chess = new Chess();
      const [chessObject, setChessObject] = useState({
        pendingMove: [],
        lastMove: "",
        fen: "",
      });

      const onMove = (from, to, data) => {
        var themove = chess.move({ from, to });
        if (themove == null) {
          notification.open({ message: "Illegal move!" });
          setChessObject({ ...chessObject, fen: chess.fen() });
          return;
        } else {
          setFen(chess.fen());
          setMoveBoardVisible(false);
        }
      };

      const calcMovable = () => {
        if (chess && chess.SQUARES) {
          const dests = new Map();
          chess.SQUARES.forEach(s => {
            const ms = chess.moves({ square: s, verbose: true });
            if (ms.length)
              dests.set(
                s,
                ms.map(m => m.to),
              );
          });
          return {
            free: false,
            dests,
            color: "white",
          };
        }
      };

      return (
        <>
          <Modal style={{ alignItems: "center", justifyContent: "center", display: "flex" }} visible={moveBoardVisible}>
            <Chessground
              width={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
              height={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
              turnColor={"white"}
              movable={calcMovable()}
              lastMove={chessObject.lastMove}
              fen={chessObject.fen}
              onMove={onMove}
              check={false}
              style={{ margin: "auto" }}
              orientation={"white"}
            />
          </Modal>
        </>
      );
    };

    return (
      <Modal
        title="New DeathMatch"
        visible={newDeathMatchModal}
        onOk={() => {
          if (wageredAmount > 0) {
            setConfirmMatchModal(true);
          } else {
            notification.open({ message: "Please enter a wager amount!" });
          }
        }}
        onCancel={() => {
          setNewDeathMatchModal(false);
        }}
      >
        <h3>Initiate a new DeathMatch by entering a wagered amount!</h3>
        <br />
        <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <InputNumber
            min={0.00001}
            defaultValue={0.00001}
            onChange={val => {
              setAmount(val);
            }}
          />
          <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} /> ETH
        </div>
        <br />
        <Divider />
        <p>Take the first move, or let your opponent take the first move!</p>
        <div style={{ alignItems: "right", justifyContent: "right", display: "flex" }}>
          <Button
            onClick={() => {
              setMoveBoardVisible(true);
            }}
          >
            Move
          </Button>
        </div>
        <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
          <MoveBoardModal />
        </div>
        <p>Current gameplay FEN: {fen}</p>
        <Divider />
        <p style={{ marginTop: 30 }}>
          *Total funds needed will be <TbCurrencyEthereum />
          {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount} security deposit for a winning match claim, or, <TbCurrencyEthereum />
          {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount * 2} to dispute the match outcome.
        </p>
        (*security deposit returned after dispute resolution process)
        <br />
        (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
        <Modal
          title="Confirm transaction"
          visible={confirmMatchModal}
          onOk={() => {
            appStage === "production" && executeNewDeathMatch(tx, writeContracts, wageredAmount);
          }}
          onCancel={() => setConfirmMatchModal(false)}
        >
          <h3>You are about to execute a transaction to initiate a new DeathMatch.</h3>
          <br />
          <p>Press ok to confirm and sign the transaction.</p>
        </Modal>
      </Modal>
    );
  };

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
                <Button style={{ margin: 10 }} onClick={() => setNewMatchModal(true)}>
                  Initiate
                </Button>
                <HandleNewMatch />
              </h2>
            </Card>
          </div>
          <h3>Enter a Wagered Match Below!</h3>
          <Card>
            <Table dataSource={players} columns={columns} />
          </Card>
        </Col>
        <Col flex="auto">
          <div style={{ alignContent: "center", justifyContent: "center", display: "flex", margin: 30 }}>
            <Card>
              <h2>
                Initiate New Death Match{" "}
                <Popover
                  content={
                    <>
                      DeathMatches operate just as regular matches, but with a rolling reigning champion to beat!
                      <br />
                      Enter an ETH amount to set the DeathMatch entrance fee and execute the transaction to initiate the
                      DeathMatch.
                      <br />
                      Each opponent must pay the entrance fee to start a new round. If the opponent wins, they become
                      the new reigning champion.
                      <br />
                      The first reigning champion to beat three contestants in a row wins the entrance fee pool.
                      <br /> If a claim is disputed, ETHChess NFT holders will review the results and vote for the round
                      winner.
                      <br /> No refunds can be initiated.
                    </>
                  }
                >
                  <FaInfoCircle size={12} />
                </Popover>{" "}
                <Button style={{ margin: 10 }} onClick={() => setNewDeathMatchModal(true)}>
                  Initiate
                </Button>
                <HandleNewDeathMatch />
              </h2>
            </Card>
          </div>
          <h3>Enter a DeathMatch Below!</h3>
          <Card>
            <Table dataSource={players} columns={dcolumns} />
          </Card>
        </Col>
      </Row>
      <br />
    </div>
  );
};

export default WageredTables;
