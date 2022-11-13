import { Button, Card, Col, Image, Modal, Popover, Row, Space } from "antd";
import React, { useContext, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { TbCurrencyEthereum } from "react-icons/tb";
import { UnWageredTables, WageredTables } from "../components/LobbyComponents";
import Skirmish from "../assets/chessSkirmish.jpg";
import { Link } from "react-router-dom";
import { SocketContext } from "../socketContext/socketContext";
import { useLobby, useSkirmishes } from "../components/StateComponents";
import useSocket from "../socketStore/useSocket";

const Lobby = ({
  gun,
  player,
  setPlayer,
  loggedIn,
  setLoginModal,
  address,
  startTime,
  tx,
  writeContracts,
  readContracts,
  mainnetProvider,
}) => {
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
      <title>Lobby</title>
      <div style={{ marginTop: 50 }}>
        <>
          <h1>ETH-Chess Lobby</h1>
          <br />
          <div>
            <h1>Skirmish against players, hold wagered matches and compete in ETH-Chess Deathmatches!</h1>
            <h3>For unwagered matches, please join the lobby and an alias will be created for you.</h3>
            <p></p>
          </div>
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
                            Connect your wallet to save gameplay stats!
                            <br />
                            If no wallet is connected a generic alias will be used.
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
                          <p>Gameplay stats will be saved!</p>
                        </>
                      ) : (
                        <>
                          <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
                            Connect your wallet,
                            <br /> or a temporary gameplay alias will be used.
                          </div>
                        </>
                      )}
                    </Modal>
                  </Card>
                )}
              </Col>
              <Col flex="auto">
                {address ? (
                  <>
                    <h3>Player Info</h3>
                    <p>Alias: {address}</p>
                    <p>
                      Room: <Link to={`/skirmish/room/${socketId}`}>{socketId}</Link>
                    </p>
                  </>
                ) : (
                  <>
                    {joinedLobby ? (
                      <>
                        <h3>Temporary Profile Data</h3>
                        <p>Alias: {profile.socketId}</p>
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
          {/* <LobbyPlayersTable players={fetchLobby()} /> */}
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
                          Matches can be against random opponents or specific addresses if desired.
                          <br />
                          Match initiators can decide to take the first move or let their opponet move first.
                          <br />
                          Any player can enter by matching the set wager and taking their move.
                          <br />
                          An ephemeral cryptographic keypair is generated for each user with every game.
                          <br />
                          Moves are validated by chess.js logic.
                          <br />
                          All moves are recorded to IPFS and each users cryptographic storage node in a decentralized
                          graph.
                          <br />
                          The winner can submit the ending IPFS hash and a security amount equal to the starting wager.
                          <br />
                          7 blocks must pass to allow time for a dispute to be made.
                          <br />
                          The loser can dispute the winners claim by entering their ending IPFS hash and a security
                          amount equal to 2x the starting wager.
                          <br />
                          ETHChess NFT holders can vote for the winner after reviewing and comparing the preserved data
                          and entered hashes.
                        </>
                      }
                    >
                      <FaInfoCircle size={12} />
                    </Popover>
                  </h1>
                  <WageredTables
                    players={fetchLobby()}
                    tx={tx}
                    writeContracts={writeContracts}
                    readContracts={readContracts}
                    mainnetProvider={mainnetProvider}
                    loggedIn={loggedIn}
                    setLoginModal={setLoginModal}
                  />
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
