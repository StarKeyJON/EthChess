// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useState } from "react";
import Chessground from "react-chessground";
import { Chess } from "chess.js";
import "./styles/chessGround.css";
// import "chessground/assets/chessground.cburnett.css";
import { Button, Modal, Space } from "antd";
import queen from "../../../assets/images/WhiteQueen.png";
import rook from "../../../assets/images/WhiteRook.png";
import bishop from "../../../assets/images/WhiteBishop.png";
import knight from "../../../assets/images/WhiteKnight.png";
import MoveTable from "./MoveTable";

const ChessMatch = () => {
  const [chess] = useState(new Chess());
  const [history, setHistory] = useState([]);
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState("");
  const [lastFen, setLastFen] = useState("");
  const [lastMove, setLastMove] = useState();
  const [inCheck, setInCheck] = useState([false, ""]);
  const [whosMove, setWhosMove] = useState("White");

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
    if (chess.inCheck()) {
      setInCheck([true, "Black"]);
    } else {
      setInCheck([false, ""]);
    }
    if (themove == null) {
      console.log("Illegal move", fen);
      setFen(lastFen);
      setFen(chess.fen());
      return;
    } else {
      setLastFen(fen);
      // setFen(fen);
      setFen(chess.fen());

      setLastMove([from, to]);
      setTimeout(randomMove, 500);
      let m = chess.history({ verbose: true });
      m.reverse();
      setHistory(m);
      setWhosMove("Black");
    }
  };

  const randomMove = () => {
    const moves = chess.moves({ verbose: true });
    const move = moves[Math.floor(Math.random() * moves.length)];
    if (moves.length > 0) {
      var themove = chess.move(move.san);
      if (themove == null) return;
      if (chess.inCheck()) {
        setInCheck([true, "White"]);
      } else {
        setInCheck([false, ""]);
      }
      setFen(chess.fen());
      setLastMove([move.from, move.to]);
      let m = chess.history({ verbose: true });
      m.reverse();
      setHistory(m);
      setWhosMove("White");
    }
  };

  const promotion = e => {
    const from = pendingMove[0];
    const to = pendingMove[1];
    chess.move({ from, to, promotion: e });
    setFen(chess.fen());
    setLastMove([from, to]);
    setSelectVisible(false);
    setTimeout(randomMove, 500);
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

  const resetBoard = () => {
    chess.reset();
    setFen(chess.fen());
  };

  const undoMove = () => {
    chess.undo();
    chess.undo();
    setFen(chess.fen());
  };

  const EditButtons = () => {
    return (
      <div style={{ marginBottom: 20, marginTop: 60 }}>
        <Space>
          <Button
            onClick={() => {
              resetBoard();
            }}
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              undoMove();
            }}
          >
            Undo
          </Button>
        </Space>
      </div>
    );
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

  return (
    <>
      <h1>{whosMove}'s turn!</h1>
      {inCheck[0] && (<h1 style={{ fontStyle: "italic", fontWeight: "bold", fontSize: 28 }}>{inCheck[1]} is in Check!</h1>)}
      <div style={{ alignContent: "center", justifyContent: "center", display: "flex", marginBottom: 50 }}>
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
        <PromotionModal />
      </div>
      <EditButtons />
      <MoveTable moves={history} />
    </>
  );
};

export default ChessMatch;
