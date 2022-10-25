// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useCallback, useEffect, useState } from "react";
import Chessground from "react-chessground";
import { Chess } from "chess.js";
import "./styles/chessGround.css";
// import "chessground/assets/chessground.cburnett.css";
import { Input, Modal, notification, Spin } from "antd";
import queen from "../../../assets/images/WhiteQueen.png";
import rook from "../../../assets/images/WhiteRook.png";
import bishop from "../../../assets/images/WhiteBishop.png";
import knight from "../../../assets/images/WhiteKnight.png";
import { GUNKEY } from "../../../constants";
import { useParams } from "react-router-dom";

const ChessSkirmishes = ({
  gun,
  address,
  player,
  setPlayer,
  writeContracts,
  timeStamp,
  updateMove,
  findSkirmishForPlayer,
  setOpponent,
  endSkirmish,
}) => {
  const chess = new Chess();
  const gameId = useParams();

  const [pendingGame, setPendingGame] = useState(false);
  const [settingMatch, setSettingMatch] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [newOpponent, setNewOpponent] = useState(false);

  const [gameSoul, setGameSoul] = useState();
  const [pendingMove, setPendingMove] = useState([]);
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState("");
  const [lastFen, setLastFen] = useState("");
  const [lastMove, setLastMove] = useState([]);
  const [inCheck, setInCheck] = useState(false);
  const [gunMoved, setGunMoved] = useState(false);
  const [ipfsHistory, setIpsfsHistory] = useState([]);
  const [lastHash, setLastHash] = useState("");
  const [gunState, setGunState] = useState({
    gameId: gameId,
    nonce: 0,
    turn: "",
    fen: "",
    lastFen: "",
    move: [],
    lastMove: [],
    history: [],
    ipfsHistory: [],
    player1: "",
    player2: "",
  });
  const [nonce, setNonce] = useState(0);
  const [turn, setTurn] = useState("player");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [winningModalVisible, setWinningModalVisible] = useState(false);
  const [losingModalVisible, setLosingModalVisible] = useState(false);
  const [viewLogin, setViewLogin] = useState(false);
  const [joinedLobby, setJoinedLobby] = useState(false);
  const [profileState, setProfileState] = useState({
    age: Math.ceil(Math.random() * 100),
    name: `Player_${timeStamp}`,
    location: "web3",
  });

  const handleChange = e => {
    setProfileState({
      ...profileState,
      [e.target.name]: e.target.value,
    });
  };

  const lastId = () => {
    let id;
    gun
      .get(GUNKEY)
      .get("skirmishIds")
      .once(ack => {
        id = ack;
      });
    return id;
  };
  var profile = {
    name: profileState.name,
    age: profileState.age,
    location: profileState.location,
    address: address ?? "",
    active: true,
    isAvailable: true,
    joined: timeStamp,
    set: 0,
  };

  // Check if user has a player profile
  useEffect(() => {
    if (gun && (player === null || player === undefined) && !creatingProfile) {
      setCreatingProfile(true);
      setProfileModal(true);
    }
  }, [gun]);

  // Check if any skirmishes available

  // Connect to available opponent node, set connect, player details

  // Allow for opponent connection set and accept, player details entered, relay opponent details for confirmation, and gameId

  // //
  // const findPlayer1 = () => {
  //   gun
  //     .get(GUNKEY)
  //     .get("skirmshes")
  //     .get("matches")
  //     .map()
  //     .on(function (ack, soul) {
  //       console.log(ack);
  //       if (ack.isAvailable && ack.set === 0 && pendingGame && !gameInProgress && ack.player.name !== profile.name) {
  //         setPendingGame(false);
  //         gun.get(GUNKEY).get("skirmshes").get("matches").get(soul).put({
  //           set: 1,
  //           player2: profileState.name,
  //         });
  //         gun.get(GUNKEY).get("skirmshes").get("matches").map().off();
  //       }
  //     });
  // };

  // useEffect(() => {
  //   if (gun && newOpponent) {
  //     let soul = newMatch();
  //     gun
  //       .get(GUNKEY)
  //       .get("skirmshes")
  //       .get("matches")
  //       .get(soul)
  //       .on("set", function (ack) {
  //         if (ack.player2 !== undefined) {
  //           setGameInProgress(true);
  //           gun.get(GUNKEY).get("skirmshes").get("matches").get(soul).off();
  //         }
  //       });
  //   }
  // }, [gun]);

  //   useEffect(() => {
  //     if (opponent === null || undefined) {
  //       findPlayer();
  //     }
  //   }, [opponent]);

  const saveToGun = () => {
    if (gun && gameId) {
      let file = {
        gameId: gameId,
        nonce: nonce,
        turn: "Black",
        fen: fen,
        lastFen: lastFen,
        move: JSON.stringify(lastMove),
        history: JSON.stringify(chess.history({ verbose: true })),
        ipfsHistory: JSON.stringify(ipfsHistory),
        player1: gunState.player1,
        Player2: gunState.player2,
      };
      gun.get(GUNKEY).get("skirmshes").get("match").get(gameSoul).put(file);
    }
  };

  const onMove = (from, to, data) => {
    const moves = chess.moves({ verbose: true });
    for (let i = 0, len = moves.length; i < len; i++) {
      if (moves[i].flags.indexOf("p") !== -1 && moves[i].from === from) {
        setPendingMove([from, to]);
        setSelectVisible(true);
        return;
      }
    }
    var themove = chess.move({ from, to });
    if (themove == null) {
      notification.open({ message: "Illegal move!" });
      setFen(lastFen);
      setFen(chess.fen());
      return;
    } else {
      if (chess.inCheck()) {
        setInCheck(true);
      } else {
        setInCheck(false);
      }
      setLastFen(fen);
      // setFen(fen);
      setFen(chess.fen());
      saveToGun();
      setNonce(nonce + 1);
      setLastMove([from, to]);
      setGunMoved(false);
      setTurn("opponent");
    }
  };

  const moveGun = (from, to, gunfen) => {
    const moves = chess.moves({ verbose: true });
    for (let i = 0, len = moves.length; i < len; i++) {
      if (moves[i].flags.indexOf("p") !== -1 && moves[i].from === from) {
        setPendingMove([from, to]);
        setSelectVisible(true);
        return;
      }
    }
    chess.move({ from, to });
    if (chess.inCheck()) {
      setInCheck(true);
    } else {
      setInCheck(false);
    }
    setLastFen(fen);
    // setFen(fen);
    setFen(chess.fen());
    saveToGun();
    setLastMove([from, to]);
    setNonce(nonce + 1);
    setGunMoved(true);
    setTurn("player");
  };

  const promotion = e => {
    const from = pendingMove[0];
    const to = pendingMove[1];
    chess.move({ from, to, promotion: e });
    setFen(chess.fen());
    setLastMove([from, to]);
    setSelectVisible(false);
  };

  const turnColor = () => {
    return chess.turn() === "w" ? "white" : "black";
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

  const PromotionModal = () => {
    return (
      <Modal visible={selectVisible} footer={null} closable={false}>
        <div style={{ textAlign: "center", cursor: "pointer" }}>
          <span role="presentation" onClick={() => promotion("q")}>
            <img src={queen} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion("r")}>
            <img src={rook} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion("b")}>
            <img src={bishop} alt="" style={{ width: 50 }} />
          </span>
          <span role="presentation" onClick={() => promotion("n")}>
            <img src={knight} alt="" style={{ width: 50 }} />
          </span>
        </div>
      </Modal>
    );
  };

  const NewGameModal = () => {
    return (
      <Modal
        visible={settingMatch}
        footer={null}
        closable={false}
        onCancel={() => {
          window.location.replace("/lobby");
        }}
      >
        <div>
          <span>
            <Spin />
          </span>
          <span>Searching for a new opponent...</span>
        </div>
      </Modal>
    );
  };

  const updateGunState = useCallback(() => {
    if (gameInProgress && turn === "opponent") {
      if (gunState.nonce === nonce + 1 && !gunMoved) {
        moveGun(gunState.move[0], gunState.move[1], gunState.fen);
      }
    }
  }, [gun, turn, gunState]);

  const ProfileModal = () => {
    return (
      <Modal
        title="Enter an alias below!"
        visible={profileModal}
        onCancel={() => {
          window.location.replace("/lobby");
        }}
        onOk={() => {
          setCreatingProfile(false);
          setProfileModal(false);
          setSettingMatch(true);
          setPlayer(profile);
          setOpponent(gameId, profile);
        }}
      >
        <div
          style={{
            marginTop: 40,
            marginBottom: 40,
            alignContent: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          <form>
            <h3 style={{ marginBottom: 10 }}>Enter an Alias</h3>
            <Input
              title="Name"
              name="name"
              onChange={e => {
                handleChange(e);
              }}
              placeholder="Enter an alias"
              value={profileState.name}
            />
            <h3 style={{ marginBottom: 10, marginTop: 10 }}>Enter an Age</h3>
            <Input
              style={{
                width: 60,
              }}
              name="age"
              value={profileState.age}
              onChange={e => {
                handleChange(e);
              }}
            />
            <h3 style={{ marginBottom: 10, marginTop: 10 }}>Enter a General Location</h3>
            <Input
              placeholder="General location"
              onChange={e => {
                handleChange(e);
              }}
              value={profileState.location}
              name="location"
            />
          </form>
        </div>
        <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
          <p>
            Do not enter any real or sensitive information.
            <br />
            Info submitted is for gameplay usage only.
          </p>
        </div>
      </Modal>
    );
  };

  useEffect(() => {
    updateGunState();
  }, [gun]);

  // useEffect(() => {
  //   if (gun) {
  //     gun
  //       .get(GUNKEY)
  //       .get("match")
  //       .get(gameId)
  //       .on("move", function (ack) {
  //         if (ack && ack.nonce === nonce) {
  //           setGunState({
  //             gameId: ack.gameId,
  //             nonce: ack.nonce,
  //             turn: ack.turn,
  //             fen: ack.fen,
  //             move: JSON.parse(ack.move),
  //             lastMove: JSON.parse(ack.lastMove),
  //             history: JSON.parse(ack.history),
  //             ipfsHistory: JSON.parse(ack.ipfsHistory),
  //             player1: ack.player1,
  //             player2: ack.player2,
  //           });
  //         }
  //       });
  //   }
  //   return () => {};
  // }, [gun]);

  return (
    <>
      <div style={{ alignContent: "center", justifyContent: "center", display: "flex", marginBottom: 200 }}>
        <Chessground
          width={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
          height={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
          turnColor={turnColor()}
          movable={calcMovable()}
          lastMove={lastMove}
          fen={fen}
          onMove={onMove}
          check={JSON.stringify(inCheck)}
          style={{ margin: "auto" }}
        />
        <ProfileModal />
        <NewGameModal />
        <PromotionModal />
      </div>
    </>
  );
};

export default ChessSkirmishes;
