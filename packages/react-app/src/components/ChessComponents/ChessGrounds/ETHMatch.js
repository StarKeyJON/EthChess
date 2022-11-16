// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import Chessground from "react-chessground";
import "./styles/chessGround.css";
import { Button, Card, Modal, notification, Space, Spin } from "antd";
import queen from "../../../assets/images/WhiteQueen.png";
import rook from "../../../assets/images/WhiteRook.png";
import bishop from "../../../assets/images/WhiteBishop.png";
import knight from "../../../assets/images/WhiteKnight.png";
import { beginningFEN, GUNKEY } from "../../../constants";

import { Chess } from "chess.js";
import { SocketContext } from "../../../socketContext/socketContext";
import MoveTable from "../MoveTable";
import { AddToIPFS } from "../../../helpers/ipfs";
import { executeDispute, executeWin } from "../BoardComponents/WinLose";
import { gql, useQuery } from "@apollo/client";

const initialState = {
  chess: new Chess(),
  nonce: 0,
  gameState: {},
  gameId: 0,
  turn: "",
  fen: beginningFEN,
  lastFen: "",
  lastMove: [],
  pendingMove: [],
  history: [],
  ipfsHistory: [],
  lastHash: "",
  inCheck: [false, ""],
  moving: false,
  gunMoved: false,
  selectVisible: false,
  gunState: {},
  joined: false,
  player1: "",
  player2: "",
  settingMatch: false,
  gameInProgress: false,
  playerLeftModal: false,
  opponentLeftModal: false,
  winningModalVisible: false,
  losingModalVisible: false,
  gameOverModal: false,
  shakingHands: false,
  player1Shake: false,
  player2Shake: false,
};

function chessReducer(state, action) {
  switch (action.type) {
    case "STARTMATCH": {
      return { ...state, turn: action.player1, shakingHands: false, gameInProgress: true };
    }
    case "PENDINGMOVEON": {
      return { ...state, pendingMove: [action.from, action.to], selectVisible: true };
    }
    case "ILLEGALMOVE": {
      return { ...state, fen: state.chess.fen() };
    }
    case "CHECKCHECK": {
      return { ...state, inCheck: [action.inCheck, action.player] };
    }
    case "UPDATEBOARD": {
      let a = action.data;
      return {
        ...state,
        lastFen: a.lastFen,
        fen: a.fen,
        history: a.history,
        nonce: a.nonce,
        lastMove: a.lastMove,
        gunMoved: a.gunMoved,
        gameState: a.gameState,
        turn: a.turn,
        selectVisible: false,
        moving: false,
      };
    }
    case "GUN": {
      let data = action.ack;
      if (data.player2) {
        return { ...state, player1: data.player1, player2: data.player2, gunState: data };
      } else {
        return { ...state, player1: data.player1, gunState: data };
      }
    }
    case "UPDATEGUN": {
      return { ...state, gunState: action.ack };
    }
    case "IPFSHISTORY":
      let data = action.load;
      return { ...state, ipfsHistory: [...state.ipfsHistory, data], lastHash: data };
    case "QUIT": {
      return { ...state, userQuitModal: true };
    }
    case "NOQUIT": {
      return { ...state, userQuitModal: false };
    }
    case "RESET":
      return initialState;

    default:
      break;
  }
}

const ETHMatch = ({ gun, tx, writeContracts, address }) => {
  const socket = useContext(SocketContext);
  const socketId = socket.id;

  const { gameId } = useParams();
  const directoryHistory = useHistory();

  const matchQ = `
  {
      match(id: ${gameId}){
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

  const [gameplayState, dispatch] = useReducer(chessReducer, initialState);
  const gpState = useRef();

  let {
    chess,
    nonce,
    gameState,
    turn,
    fen,
    lastMove,
    pendingMove,
    history,
    ipfsHistory,
    inCheck,
    selectVisible,
    joined,
    player1,
    player2,
    // winningModalVisible,
    // losingModalVisible,
    color,
    userQuitModal,
    gameOverModal,
    winner,
  } = gameplayState;

  let opp = matchData?.player1 === address ? matchData?.player2 : matchData?.player1;

  const prepRoom = () => {
    if (address === matchData?.player1.id || address === matchData?.player2.id) {
      gun
        .get(GUNKEY)
        .get("matches")
        .get(gameId)
        .once(ack => {
          if (ack) {
            dispatch({ type: "GUN", ack: ack });
          }
        });
      dispatch({ type: "JOINED", socketId: socketId, gameId: gameId });
    } else {
      directoryHistory.push(`/match/view/${gameId}`);
    }
  };

  // IPFS file processing and uploading
  const handleIPFSInput = async e => {
    try {
      let added = await AddToIPFS(e);
      dispatch({ type: "IPFSHISTORY", load: added.path });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const onMove = (from, to) => {
    console.log("GamePlayState: ", gameplayState);
    if (turn === socketId) {
      const moves = chess.moves({ verbose: true });
      for (let i = 0, len = moves.length; i < len; i++) {
        if (moves[i].flags.indexOf("p") !== -1 && moves[i].from === from) {
          dispatch({ type: "PENDINGMOVEON", from: from, to: to });
          return;
        }
      }
      var themove = chess.move({ from, to });
      if (themove == null) {
        notification.open({ message: "Illegal move!" });
        dispatch({ type: "ILLEGALMOVE" });
        return;
      } else {
        let file = {
          gameId: gameId,
          player: socketId,
          nonce: nonce + 1,
          fen: chess.fen(),
          lastFen: fen,
          turn: opp,
          move: JSON.stringify([from, to]),
          lastMove: JSON.stringify(lastMove),
          history: JSON.stringify(chess.history({ verbose: true })),
        };
        let m = chess.history({ verbose: true });
        m.reverse();
        dispatch({
          type: "UPDATEBOARD",
          data: {
            history: m,
            lastFen: fen,
            fen: chess.fen(),
            nonce: nonce + 1,
            lastMove: [from, to],
            gunMoved: false,
            gameState: file,
            turn: opp,
          },
        });
        handleIPFSInput(file);

        socket.emit("onMove", gameId, "match", socketId, file);

        if (chess.inCheck()) {
          const movesleft = chess.moves({ verbose: true });
          if (movesleft.length === 0) {
            notification.open({ message: `Game Over! You are the winner!` });
            dispatch({ type: "GAMEOVER", winner: socketId });
          } else {
            dispatch({ type: "CHECKCHECK", inCheck: true, player: opp });
          }
        } else {
          dispatch({ type: "CHECKCHECK", inCheck: false });
        }
      }
    } else {
      notification.open({ message: "Not your move!" });
      dispatch({ type: "ILLEGALMOVE" });
    }
  };

  const promotion = e => {
    const from = pendingMove[0];
    const to = pendingMove[1];
    chess.move({ from, to, promotion: e });
    let file = {
      gameId: gameId,
      nonce: nonce + 1,
      fen: chess.fen(),
      lastFen: fen,
      turn: opp,
      move: JSON.stringify([from, to, e]),
      lastMove: JSON.stringify(lastMove),
      history: JSON.stringify(chess.history({ verbose: true })),
    };

    let m = chess.history({ verbose: true });
    m.reverse();
    dispatch({
      type: "UPDATEBOARD",
      data: {
        history: m,
        lastFen: fen,
        fen: chess.fen(),
        nonce: nonce + 1,
        lastMove: [from, to, e],
        gunMoved: false,
        gameState: file,
        turn: opp,
      },
    });
    socket.emit("onMove", gameId, "match", socketId, file);
    if (chess.inCheck()) {
      const movesleft = chess.moves({ verbose: true });
      if (movesleft.length === 0) {
        notification.open({ message: `Game Over! You are the winner!` });
        dispatch({ type: "GAMEOVER", winner: socketId });
      } else {
        dispatch({ type: "CHECKCHECK", inCheck: true, player: opp });
      }
    } else {
      dispatch({ type: "CHECKCHECK", inCheck: false });
    }
  };

  const moveGun = (from, to, prom, ack) => {
    let { gunMoved, chess } = gpState.current;
    if (!gunMoved && socketId !== ack.player) {
      console.log("Moving Gun!");
      if (prom !== undefined) {
        console.log("Gun promotion!", prom);
        chess.move({ from, to, promotion: prom });
        if (chess.inCheck()) {
          const moves = chess.moves({ verbose: true });
          if (moves.length === 0) {
            notification.open({ message: `Checkmate! Game Over! ${ack.player} is the winner!` });
            dispatch({ type: "GAMEOVER", winner: ack.player });
          } else {
            notification.open({ message: "Check!" });
            dispatch({ type: "CHECKCHECK", inCheck: true, player: socketId });
          }
        } else {
          dispatch({ type: "CHECKCHECK", inCheck: false });
        }
        let m = chess.history({ verbose: true });
        m.reverse();
        dispatch({
          type: "UPDATEBOARD",
          data: {
            history: m,
            lastFen: ack.lastFen,
            fen: ack.fen,
            nonce: ack.nonce,
            lastMove: [from, to, prom],
            gunMoved: true,
            gameState: ack,
            turn: ack.turn,
          },
        });
      } else {
        chess.move({ from, to });
        if (chess.inCheck()) {
          const moves = chess.moves({ verbose: true });
          if (moves.length === 0) {
            notification.open({ message: `Checkmate! Game Over! ${ack.player} is the winner!` });
            dispatch({ type: "GAMEOVER", winner: ack.player });
          } else {
            notification.open({ message: "Check!" });
            dispatch({ type: "CHECKCHECK", inCheck: true, player: socketId });
          }
        } else {
          dispatch({ type: "CHECKCHECK", inCheck: false });
        }
        let m = chess.history({ verbose: true });
        m.reverse();
        dispatch({
          type: "UPDATEBOARD",
          data: {
            history: m,
            lastFen: ack.lastFen,
            fen: ack.fen,
            nonce: ack.nonce,
            lastMove: [from, to],
            gunMoved: true,
            gameState: ack,
            turn: ack.turn,
          },
        });
      }
    }
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

  const GameOver = () => {
    return (
      <Modal
        title="GAME OVER!"
        visible={gameOverModal}
        onCancel={() => {
          dispatch({ type: "RESETGO" });
        }}
      >
        <Card>
          {winner === socketId ? (
            <>
              <h1>Congratulations!</h1>
              <br />
              <h3>Execute the claim below!</h3>
              <br />
              <Button onClick={() => executeWin({ tx, writeContracts, ipfsHistory, socketId })}></Button>
              <p>Please allow a minimum of 7 blocks for the dispute resolution period to pass!</p>
            </>
          ) : (
            <>
              <h1>Better luck next time!</h1>
              <br />
              <h3>You can dispute the results below within 7 blocks of the initial claim!</h3>
              <br />
              <Button onClick={() => executeDispute({ tx, writeContracts, ipfsHistory, socketId })}></Button>
            </>
          )}
        </Card>
      </Modal>
    );
  };

  const HandleQuit = () => {
    return (
      <Modal
        title="Confirm exit"
        visible={userQuitModal}
        onCancel={() => {
          dispatch({ type: "NOQUIT" });
        }}
        onOk={() => directoryHistory.push("/lobby")}
      >
        <h1>Are you sure you want to exit the match?</h1>
      </Modal>
    );
  };

  const handleMove = (prof, ack) => {
    // console.log("GamePlayState: ", gpState.current, ack, prof);
    let m = JSON.parse(ack.move);
    if (prof !== socketId && ack.nonce === gpState.current.nonce + 1) {
      moveGun(m[0], m[1], m[2], ack);
    }
  };

  const handleIllMove = () => {
    dispatch({ type: "ILLEGALMOVE" });
  };

  const handlePlayerLeftModal = useCallback(ack => {
    if (ack === player1) {
      dispatch({ type: "PLAYERLEFT" });
    } else {
      dispatch({ type: "OPPONENTLEFT" });
    }
  }, []);

  const handleJoined = useCallback(() => {
    if (!joined) {
      prepRoom();
    }
  }, [socketId]);

  useEffect(() => {
    if (!loading) {
      address === matchData.player1 || address === matchData.player2
        ? handleJoined()
        : directoryHistory.push(`/match/view/${gameId}`);
    }
  }, []);

  useEffect(() => {
    handleJoined();
    socket.on("playerJoined", ack => {
      notification.open({ message: `Player ${ack} joined the match!` });
      handleJoined(ack);
    });

    socket.on("playerMoved", ack => {
      let { profile, move } = ack;
      if (profile !== socketId) {
        handleMove(profile, move);
      }
    });

    socket.on("leftRoom", () => {
      handlePlayerLeftModal();
    });

    socket.on("illegalMove", ack => {
      handleIllMove(ack);
    });

    return () => {
      socket.emit("leftRoom", gameId, socketId);
    };
  }, []);

  useEffect(() => {
    gun
      .get(GUNKEY)
      .get("match")
      .get(gameId)
      .get("move")
      .on(ack => {
        if (ack && ack.nonce === nonce + 1) {
          let file = {
            gameId: ack.gameId,
            nonce: ack.nonce,
            fen: ack.fen,
            lastFen: ack.lastFen,
            turn: ack.turn,
            move: JSON.parse(ack.move),
            lastMove: JSON.parse(ack.lastMove),
            history: JSON.stringify(ack.history),
          };
          dispatch({
            type: "UPDATEBOARD",
            data: { ...file },
          });
        }
      });
  }, []);

  useEffect(() => {
    gpState.current = gameplayState;
  }, [gameplayState]);

  return (
    <>
      {inCheck[0] && <h1>Check!</h1>}
      <div style={{ alignContent: "center", justifyContent: "center", display: "flex", marginBottom: 50 }}>
        {gameState ?? (
          <Chessground
            width={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
            height={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
            turnColor={turnColor()}
            movable={calcMovable()}
            lastMove={lastMove}
            fen={fen}
            onMove={onMove}
            check={JSON.stringify(inCheck[0])}
            style={{ margin: "auto" }}
            orientation={color}
          />
        )}
        <PromotionModal />
        <GameOver />
        <HandleQuit />
      </div>
      {history.length === 0 ?? (
        <Space style={{ marginTop: 30 }}>
          <Card>
            <p>Quit the match?</p>
            <br />
            <Button
              style={{ backgroundColor: "red" }}
              onClick={() => {
                dispatch({ type: "QUIT" });
              }}
            >
              Exit
            </Button>
          </Card>
        </Space>
      )}
      <div style={{ marginTop: 50 }}>
        <MoveTable moves={history} />
      </div>
    </>
  );
};

export default ETHMatch;
