// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useEffect, useState } from "react";
import Chessground from "react-chessground";
import { Chess } from "chess.js";
import "./styles/chessGround.css";
import "./styles/chessGround-theme.css";
import { GUNKEY } from "../../../constants";
import { useParams } from "react-router-dom";

const ChessViewer = ({ gun }) => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState();
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState("");
  const [lastMove, setLastMove] = useState();
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    gun &&
      gun
        .get(GUNKEY)
        .get("skirmishes")
        .get(gameId)
        .get("move")
        .on(ack => {
          if (ack && ack.fen !== fen && ack.nonce === nonce + 1) {
            console.log(ack)
            setFen(ack.fen);
            setGameState(ack);
            setNonce(ack.nonce);
          }
        });
  }, [gun]);

  const turnColor = () => {
    return chess.turn() === "w" ? "white" : "black";
  };

  return (
    <>
      <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
        <Chessground
          width={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
          height={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
          turnColor={turnColor()}
          lastMove={lastMove}
          fen={fen}
          viewOnly={true}
          style={{ margin: "auto" }}
        />
      </div>
    </>
  );
};

export default ChessViewer;
