import { Chess } from "chess.js";
import React, { useState } from "react";
import { beginningFEN } from "../../../../constants";

const useSkirmishState = ({ gameId }) => {
const [chess] = useState(new Chess());
  const [gameInProgress, setGameInProgress] = useState(false);
  const [playerLeftModal, setPlayerLeftModal] = useState(false);
  const [opponentLeftModal, setOpponentLeftModal] = useState(false);
  const [moving, setMoving] = useState(false);
  const [selectVisible, setSelectVisible] = useState(false);
  const [joined, setJoined] = useState(false);
  const [gameState, setGameState] = useState({});
  const [gunState, setGunState] = useState({});
  const [player1, setPlayer1] = useState(gameId);
  const [player2, setPlayer2] = useState("");
  const [turn, setTurn] = useState(gameId);
  const [nonce, setNonce] = useState(0);
  const [gunMoved, setGunMoved] = useState(false);
  const [inCheck, setInCheck] = useState(false);
  const [lastMove, setLastMove] = useState([]);
  const [fen, setFen] = useState(beginningFEN);
  const [lastFen, setLastFen] = useState("");
  const [pendingMove, setPendingMove] = useState([]);
  const [history, setHistory] = useState([]);
  const [player1Shake, setPlayer1Shake] = useState(false);
  const [player2Shake, setPlayer2Shake] = useState(false);
  return {
    chess,
    gameInProgress,
    setGameInProgress,
    playerLeftModal,
    setPlayerLeftModal,
    opponentLeftModal,
    setOpponentLeftModal,
    moving,
    setMoving,
    selectVisible,
    setSelectVisible,
    joined,
    setJoined,
    gameState,
    setGameState,
    gunState,
    setGunState,
    player1,
    setPlayer1,
    player2,
    setPlayer2,
    turn,
    setTurn,
    nonce,
    setNonce,
    gunMoved,
    setGunMoved,
    inCheck,
    setInCheck,
    lastMove,
    setLastMove,
    fen,
    setFen,
    lastFen,
    setLastFen,
    pendingMove,
    setPendingMove,
    history,
    setHistory,
    player1Shake,
    setPlayer1Shake,
    player2Shake,
    setPlayer2Shake,
  };
};

export default useSkirmishState;
