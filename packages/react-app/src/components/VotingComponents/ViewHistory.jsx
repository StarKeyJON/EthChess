// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useCallback, useState } from "react";
import Chessground from "react-chessground";
import { Chess } from "chess.js";
import "../ChessComponents/ChessGrounds/styles/chessGround.css";
import "../ChessComponents/ChessGrounds/styles/chessGround-theme.css";

import { Button } from "antd";
import MoveTable from "../ChessComponents/MoveTable";

const ViewHistory = ({ history }) => {
  const [moveId, setMoveId] = useState(0);
  const [viewedHistory, setViewedHistory] = useState([]);
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState("");
  const [lastMove, setLastMove] = useState("");

  const forwards = useCallback(() => {
    if (history.length < moveId + 1) {
      let id = moveId + 1;
      setFen(history[id]);
      setLastMove(history[moveId]);
      setMoveId(id);
      setViewedHistory(history.slice(0, id));
    }
  }, [moveId]);

  const backwards = useCallback(() => {
    if (moveId > 0) {
      let id = moveId - 1;
      setFen(history[id]);
      setLastMove(history[moveId]);
      setMoveId(id);
      setViewedHistory(history.slice(0, id));
    }
  }, [moveId]);

  const reset = () => {
    setFen(history[0]);
    setLastMove("");
    setMoveId(0);
    setViewedHistory([]);
  };

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
      <div>
        <>
          <Button onClick={() => forwards()}>Forwards</Button>
          <Button onClick={() => backwards()}>Backwards</Button>
          <Button onClick={() => reset()}>Reset</Button>
        </>
      </div>
      <div style={{ marginTop: 50 }}>{history && <MoveTable moves={JSON.parse(viewedHistory)} />}</div>
    </>
  );
};

export default ViewHistory;
