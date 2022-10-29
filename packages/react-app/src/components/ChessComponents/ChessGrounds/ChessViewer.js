// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useEffect, useState } from "react";
import Chessground from "react-chessground";
import { Chess } from "chess.js";
import "./styles/chessGround.css";
import "./styles/chessGround-theme.css";
import { GUNKEY } from "../../../constants";
import { useParams } from "react-router-dom";
import MoveTable from "../MoveTable";

const ChessViewer = ({ gun }) => {
  const { gameId } = useParams();
  const [gameState, setGameState] = useState({});
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState("");
  const [lastMove, setLastMove] = useState();

  useEffect(() => {
    gun
      .get(GUNKEY)
      .get("skirmishes")
      .get(gameId)
      .get("move")
      .on(ack => {
        console.log(ack)
        if (ack && ack.fen !== fen) {
          setFen(ack.fen);
          setGameState(ack);
          setLastMove(ack.lastMove);
        }
      });
  }, []);

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
      <div style={{ marginTop: 50 }}>
        {gameState && gameState?.history && <MoveTable moves={JSON.parse(gameState?.history)} />}
      </div>
    </>
  );
};

export default ChessViewer;
