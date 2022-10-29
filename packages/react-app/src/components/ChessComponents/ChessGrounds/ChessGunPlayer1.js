// credits https://github.com/lichess-org/chessground, https://github.com/ruilisi/react-chessground

import React, { useCallback, useEffect, useState } from "react";
import Chessground from "react-chessground";
import { Chess } from "chess.js";
import "./styles/chessGround.css";
// import "chessground/assets/chessground.cburnett.css";
import { Button, Card, message, Modal, notification, Space } from "antd";
import queen from "../../../assets/images/WhiteQueen.png";
import rook from "../../../assets/images/WhiteRook.png";
import bishop from "../../../assets/images/WhiteBishop.png";
import knight from "../../../assets/images/WhiteKnight.png";
import { GUNKEY } from "../../../constants";
import { ipfs } from "../../../helpers";
import Text from "antd/lib/typography/Text";

const ChessGunPlayer1 = ({ gun, address, player, gameId, writeContracts, tx }) => {
  const [chess] = useState(new Chess());
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
  const [turn, setTurn] = useState("White");
  const [gamePending, setGamePending] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [winningModalVisible, setWinningModalVisible] = useState(false);
  const [losingModalVisible, setLosingModalVisible] = useState(false);

  // IPFS file processing and uploading
  const handleIPFSInput = async e => {
    try {
      let added = await ipfs.add(e);
      // if(added & added.path) {
      let url = `https://pharout_labs_pinata.mypinata.cloud/ipfs/${added.path}`;
      setIpsfsHistory(() => [...ipfsHistory, added.path]);
      setLastHash(added.path);
      console.log(url);
      // }
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };

  const saveToGun = () => {
    if (gun && gameId) {
      let file = {
        gameId: gameId,
        nonce: nonce,
        turn: "White",
        fen: fen,
        lastFen: lastFen,
        move: JSON.stringify(lastMove),
        history: JSON.stringify(chess.history({ verbose: true })),
        ipfsHistory: JSON.stringify(ipfsHistory),
        player1: gunState.player1,
        Player2: gunState.player2,
      };
      gun.get(GUNKEY).get("match").get(gameId).put(file);
      handleIPFSInput(file);
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

  const updateGunState = useCallback(() => {
    if (turn === "opponent") {
      if (gunState.nonce === nonce + 1 && !gunMoved) {
        moveGun(gunState.move[0], gunState.move[1], gunState.fen);
      }
    }
  }, [gun, turn, gunState]);

  useEffect(() => {
    updateGunState();
  }, [updateGunState]);

  useEffect(() => {
    if (gun && !gamePending && !gameOver) {
      gun
        .get(GUNKEY)
        .get("match")
        .get(gameId)
        .on("move", function (ack) {
          if (ack.nonce === nonce) {
            setGunState({
              gameId: ack.gameId,
              nonce: ack.nonce,
              turn: ack.turn,
              fen: ack.fen,
              move: JSON.parse(ack.move),
              lastMove: JSON.parse(ack.lastMove),
              history: JSON.parse(ack.history),
              ipfsHistory: JSON.parse(ack.ipfsHistory),
              player1: ack.player1,
              player2: ack.player2,
            });
          }
        });
    }
    return () => {};
  }, [gun]);

  const executeWin = () => {
    tx(writeContracts.ETHChess.startClaim(ipfsHistory), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        message.info(" 🍾 Transaction " + update.hash + " finished!");
        message.info(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        notification.open({
          message: <Text>{"Claim Started! Please wait 7 blocks for the dispute period to end."}</Text>,
        });
      }
    });
  };

  const executeDispute = () => {
    tx(writeContracts.ETHChess.startDispute(ipfsHistory), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        message.info(" 🍾 Transaction " + update.hash + " finished!");
        message.info(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        notification.open({
          message: <Text>{"Dispute Started! Please allow time for the dispute resolution process."}</Text>,
        });
      }
    });
  };

  const HandleGameOver = () => {
    if (winner) {
      setWinningModalVisible(true);
    } else {
      setLosingModalVisible(true);
    }
  };

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
          viewOnly={!gamePending}
          onMove={onMove}
          check={inCheck}
          style={{ margin: "auto" }}
        />
        {gameOver && <HandleGameOver />}
        <PromotionModal />
        <>
          <Modal footer="" visible={winningModalVisible} onOk={executeWin}>
            <Space>
              <Card>
                <h1>Start the claim process by entering a security amount equal to the starting wager.</h1>
                <Button onClick={executeWin}>Claim</Button>
              </Card>
            </Space>
          </Modal>
        </>
        <>
          <Modal onCancel={() => setWinningModalVisible(false)} visible={losingModalVisible}>
            <Space>
              <Card>
                <h1>You can dipute the results by executing a transaction within 7 blocks!</h1>
                <Button onClick={executeDispute}>Execute</Button>
              </Card>
            </Space>
          </Modal>
        </>
      </div>
    </>
  );
};

export default ChessGunPlayer1;
