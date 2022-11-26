import { Avatar, Button, Divider, Image, InputNumber, Modal, notification, Space } from "antd";
import { Chess } from "chess.js";
import { useCallback, useState } from "react";
import Chessground from "react-chessground/chessground";
import { TbCurrencyEthereum } from "react-icons/tb";
import ethlogo from "../../../../assets/ethereumLogo.png";
import { useContractReader } from "eth-hooks";
import { executeNewDeathMatch } from "../Functions";
import { appStage, beginningFEN } from "../../../../constants";

const HandleNewDeathMatch = ({
  gun,
  tx,
  writeContracts,
  readContracts,
  newDeathMatchModal,
  setNewDeathMatchModal,
  address,
}) => {
  const [confirmMatchModal, setConfirmMatchModal] = useState(false);
  const minWager = useContractReader(readContracts, "ETHChessMatches", "minWager")?.toString() / 1e18;
  const [moveBoardVisible, setMoveBoardVisible] = useState(false);
  const [wageredAmount, setWageredAmount] = useState(0);
  const [fen, setFen] = useState(beginningFEN);
  const setAmount = useCallback(
    amt => {
      setWageredAmount(amt);
    },
    [wageredAmount],
  );

  const revert = () => {
    setWageredAmount(0);
    setFen(beginningFEN);
    setNewDeathMatchModal(false);
  };

  const MoveBoardModal = () => {
    const chess = new Chess();
    const [chessObject, setChessObject] = useState({
      pendingMove: [],
      lastMove: [],
      fen: "",
    });

    const onMove = (from, to) => {
      var themove = chess.move({ from, to });
      if (themove == null) {
        notification.open({ message: "Illegal move!" });
        setChessObject({ ...chessObject, fen: chess.fen() });
        return;
      } else {
        setChessObject({ ...chessObject, fen: chess.fen() });
        setFen(chess.fen());
        setMoveBoardVisible(false);
      }
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

    return (
      <>
        <Modal
          onCancel={() => setMoveBoardVisible(false)}
          style={{ alignItems: "center", justifyContent: "center", display: "flex" }}
          visible={moveBoardVisible}
        >
          <Chessground
            width={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
            height={window.screen.availWidth < 1000 ? "80vw" : "50vw"}
            turnColor={"white"}
            movable={calcMovable()}
            lastMove={chessObject.lastMove}
            fen={chessObject.fen}
            onMove={onMove}
            check={"false"}
            style={{ margin: "auto" }}
            orientation={"white"}
          />
        </Modal>
      </>
    );
  };

  return (
    <Modal
      title="New DeathMatch"
      visible={newDeathMatchModal}
      onOk={() => {
        if (wageredAmount > 0) {
          setConfirmMatchModal(true);
        } else {
          notification.open({ message: "Please enter a wager amount!" });
        }
      }}
      onCancel={() => {
        revert();
      }}
    >
      <h3>Initiate a new DeathMatch by entering a wagered amount!</h3>
      <br />
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <InputNumber
          min={0.00001}
          defaultValue={0.00001}
          onChange={val => {
            setAmount(val);
          }}
        />
        <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} /> ETH
      </div>
      <br />
      <Divider />
      <p>Take the first move, or let your opponent take the first move!</p>
      <div style={{ alignItems: "right", justifyContent: "right", display: "flex" }}>
        <Button
          onClick={() => {
            setMoveBoardVisible(true);
          }}
        >
          Move
        </Button>
      </div>
      <div style={{ alignContent: "center", justifyContent: "center", display: "flex" }}>
        <MoveBoardModal />
      </div>
      <p>Current gameplay FEN: {fen === beginningFEN ? "Unmoved board" : fen}</p>
      <Divider />
      <p style={{ marginTop: 30 }}>
        *Total funds needed for:{" "}
        <div>
          Match Initiation <TbCurrencyEthereum /> {wageredAmount} (paid now)
        </div>
        <div>
          Security Deposit for Winning Claim <TbCurrencyEthereum /> {wageredAmount}
        </div>
        <div>
          Security Deposit for Claim Dispute <TbCurrencyEthereum /> {wageredAmount * 2}
        </div>
      </p>
      (*security deposit returned after dispute resolution process)
      <br />
      (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
      <Modal
        title="Confirm transaction"
        visible={confirmMatchModal}
        onOk={() => {
          if (appStage === "production") {
            setConfirmMatchModal(false);
            executeNewDeathMatch(tx, writeContracts, wageredAmount, address, gun) && setNewDeathMatchModal(false);
          }
        }}
        onCancel={() => setConfirmMatchModal(false)}
      >
        <h3>You are about to execute a transaction to initiate a new DeathMatch.</h3>
        <br />
        <p>Press ok to confirm and sign the transaction.</p>
      </Modal>
    </Modal>
  );
};

export default HandleNewDeathMatch;
