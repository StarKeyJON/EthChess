import React, { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Table, Button, Input, Space, Row, Col, Popover, Modal, InputNumber, Image, Avatar } from "antd";
import { FaInfoCircle } from "react-icons/fa";
import { useCallback } from "react";
import ethlogo from "../../assets/ethereumLogo.png";
import { TbCurrencyEthereum } from "react-icons/tb";

const WageredTables = ({ players, address, tx, writeContracts }) => {
  const [newMatchModal, setNewMatchModal] = useState(false);
  const [newDeathMatchModal, setNewDeathMatchModal] = useState(false);
  const [confirmMatchModal, setConfirmMatchModal] = useState(false);
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
      title: "Player",
      dataIndex: "playerName",
      key: "playerName",
      width: "20%",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "20%",
    },
    {
      title: "Joined",
      dataIndex: "timeJoined",
      key: "timeJoined",
      width: "20%",
      ...getColumnSearchProps("timeJoined"),
    },
  ];

  const HandleNewMatch = () => {
    const [wageredAmount, setWageredAmount] = useState(0);
    const setAmount = useCallback(
      amt => {
        setWageredAmount(amt);
      },
      [wageredAmount],
    );
    return (
      <Modal
        title="New Match"
        visible={newMatchModal}
        onOk={() => () => setConfirmMatchModal(true)}
        onCancel={() => {
          setNewMatchModal(false);
        }}
      >
        <h3>Initiate a new Match by entering a wagered amount!</h3>
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
        <p style={{ marginTop: 30 }}>
          *Total funds needed will be <TbCurrencyEthereum />
          {wageredAmount} + {wageredAmount} security deposit for a winning match claim, or, <TbCurrencyEthereum />
          {wageredAmount} + {wageredAmount * 2} to dispute the match outcome.
        </p>
        (*security deposit returned after dispute resolution process)
        <br />
        (**minimum wager amount is {writeContracts?.EthChessMatches?.fee()} <TbCurrencyEthereum />
        ETH)
        <Modal
          title="Confirm transaction"
          visible={confirmMatchModal}
          onCancel={() => setConfirmMatchModal(false)}>
          <h3>You are about to execute a transaction to initiate a new DeathMatch with {wageredAmount} <TbCurrencyEthereum /> ETH.</h3>
            <br />
            <p>Press ok to confirm and sign the transaction.</p>
          </Modal>
      </Modal>
    );
  };

  const HandleNewDeathMatch = () => {
    const [wageredAmount, setWageredAmount] = useState(0);
    const setAmount = useCallback(
      amt => {
        setWageredAmount(amt);
      },
      [wageredAmount],
    );

    return (
      <Modal
        title="New DeathMatch"
        visible={newDeathMatchModal}
        onOk={() => setConfirmMatchModal(true)}
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
        <p style={{ marginTop: 30 }}>
          *Total funds needed will be <TbCurrencyEthereum />
          {wageredAmount} + {wageredAmount} security deposit for a winning match claim, or, <TbCurrencyEthereum />
          {wageredAmount} + {wageredAmount * 2} to dispute the match outcome.
        </p>
        (*security deposit returned after dispute resolution process)
        <br />
        (**minimum wager amount is {writeContracts?.EthChessMatches?.fee} <TbCurrencyEthereum />
        ETH)
        <Modal
          title="Confirm transaction"
          visible={confirmMatchModal}
          onCancel={() => setConfirmMatchModal(false)}>
          <h3>You are about to execute a transaction to initiate a new DeathMatch with {wageredAmount} <TbCurrencyEthereum /> ETH.</h3>
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
                      Execute the transaction to initiate the match.
                      <br />
                      The winner of the match executes a claim. <br /> If the claim goes uncontested for 7 blocks,{" "}
                      <br />
                      the claimant can execute a call to finalize the results and disperse the funds.
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
                  Start
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
                      the new reigning cahmpion.
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
                  Start
                </Button>
                <HandleNewDeathMatch />
              </h2>
            </Card>
          </div>
          <h3>Enter a DeathMatch Below!</h3>
          <Card>
            <Table dataSource={players} columns={columns} />
          </Card>
        </Col>
      </Row>
      <br />
    </div>
  );
};

export default WageredTables;
