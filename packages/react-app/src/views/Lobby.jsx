import { Button, Card, Col, Image, Modal, Popover, Row, Space } from "antd";
import React, { useContext, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { TbCurrencyEthereum } from "react-icons/tb";
import { LobbyPlayersTable, UnWageredTables, WageredTables } from "../components/LobbyComponents";
import Skirmish from "../assets/chessSkirmish.jpg";
import { Link } from "react-router-dom";
import { SocketContext } from "../socketContext/socketContext";
import { useLobby, useSkirmishes } from "../components/StateComponents";
import useSocket from "../socketStore/useSocket";

const Lobby = ({ gun, player, setPlayer, loggedIn, address, startTime, tx, writeContracts }) => {
  const { updateSocketData, lobbyJoinEmit, lobbyLeaveEmit } = useSocket();
  const { skirmishes, newSkirmish, endSkirmish } = useSkirmishes({
    gun,
    player,
  });
  const { fetchLobby, joinLobby, leaveLobby, joinedLobby, profile } = useLobby({
    gun,
    address,
    startTime,
    player,
    setPlayer,
    newSkirmish,
    endSkirmish,
    updateSocketData,
    lobbyJoinEmit,
    lobbyLeaveEmit,
  });
  const socket = useContext(SocketContext);
  let socketId = socket.id;
  const [viewLogin, setViewLogin] = useState(false);

  const viewModalToggle = () => {
    setViewLogin(!viewLogin);
  };

  return (
    <>
      <div style={{ marginTop: 50 }}>
        <>
          <Space style={{ marginBottom: 50 }}>
            <Row>
              <Col flex="auto">
                <Image preview={false} style={{ width: 180 }} src={Skirmish} alt="Chess pieces scattered on a cloth" />
              </Col>
              <Col flex="auto">
                {joinedLobby ? (
                  <>
                    <Card>
                      <h3>Leave the lobby below!</h3>
                      <Button
                        type="primary"
                        onClick={() => {
                          leaveLobby();
                          viewModalToggle();
                        }}
                      >
                        Exit!
                      </Button>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <h3>
                      Enter the Lobby & play against the world!{" "}
                      <Popover
                        content={
                          <>
                            Sign-up or log-in with your profile to save gameplay stats!
                            <br />
                            If no alias is created a generic profile will be used.
                            <br />
                            Connect an Ethereum wallet and create a profile to compete.
                          </>
                        }
                      >
                        <FaInfoCircle size={12} />
                      </Popover>
                    </h3>
                    <Button
                      type="primary"
                      onClick={() => {
                        viewModalToggle();
                      }}
                    >
                      Join!
                    </Button>
                    <Modal
                      title="Join the lobby!"
                      visible={viewLogin}
                      onCancel={viewModalToggle}
                      onOk={() => {
                        setPlayer(profile);
                        joinLobby();
                      }}
                    >
                      {loggedIn ? (
                        <>
                          <h1>Your player info will be used!</h1>
                          <p>Gameplay stats will be saved!</p>
                        </>
                      ) : (
                        <>
                          <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
                            <Link to="/profile">Log-in/Sign-up!</Link>
                            <br /> or a temporary gameplay alias will be used.
                          </div>
                        </>
                      )}
                    </Modal>
                  </Card>
                )}
              </Col>
              <Col flex="auto">
                {loggedIn ? (
                  <>
                    <h3>Player Data</h3>
                    <p>Name: {player.name}</p>
                    <p>
                      Room: <Link to={`/skirmish/room/${socketId}`}>{socketId}</Link>
                    </p>
                  </>
                ) : (
                  <>
                    {joinedLobby ? (
                      <>
                        <h3>Temporary Profile Data</h3>
                        <p>Name: {profile.name}</p>
                        <p>
                          Room: <Link to={`/skirmish/room/${socketId}`}>{socketId}</Link>
                        </p>
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </Col>
            </Row>
          </Space>
          <LobbyPlayersTable players={fetchLobby()} />
        </>
        <>
          {/* <Link to={`/skirmish/room/${socketId}`}>Go to your skirmish room</Link> */}
          <div style={{ marginTop: 50 }} className="arena-card">
            <UnWageredTables players={skirmishes} />
          </div>
          <div style={{ marginTop: 50 }}>
            <Card>
              <Space>
                <div className="arena-card">
                  <h1>
                    <TbCurrencyEthereum /> Live Wagered Matches{" "}
                    <Popover
                      content={
                        <>
                          Matches are initiated on the Ethereum blockchain with a set wager amount in ETH.
                          <br />
                          Any player can enter by matching the set wager and taking the first move.
                          <br />
                          An ephemeral cryptographic keypair is generated for each user with every game.
                          <br />
                          Moves are validated by chess.js logic.
                          <br />
                          All moves are recorded to IPFS and each users cryptographic storage node.
                          <br />
                          The winner can submit the ending IPFS hash and a security amount equal to the starting wager.
                          <br />
                          The opponent can dispute the claim by entering their ending IPFS hash and a security amount
                          equal to 2x the starting wager.
                          <br />
                          ETHChess NFT holders can vote for the winner after reviewing and comparing the preserved data
                          and entered hashes.
                        </>
                      }
                    >
                      <FaInfoCircle size={12} />
                    </Popover>
                  </h1>
                  <WageredTables address={address} players={fetchLobby()} tx={tx} writeContracts={writeContracts} />
                </div>
              </Space>
            </Card>
          </div>
        </>
      </div>
    </>
  );
};

export default Lobby;
