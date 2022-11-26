import { Avatar, Button, Divider, Image, InputNumber, Modal, notification, Space } from "antd";
import { Chess } from "chess.js";
import { useState } from "react";
import Chessground from "react-chessground/chessground";
import { TbCurrencyEthereum } from "react-icons/tb";

import ethlogo from "../../../../assets/ethereumLogo.png";
import { useContractReader } from "eth-hooks";
import { handleChallenge } from "../Functions";
import { beginningFEN } from "../../../../constants";
import AddressInput from "../../../AddressInput";

const HandleNewMatch = ({
  tx,
  writeContracts,
  readContracts,
  mainnetProvider,
  newMatchModal,
  setNewMatchModal,
  address,
  gun,
  gunUser,
}) => {
  const minWager = useContractReader(readContracts, "ETHChessMatches", "minWager")?.toString() / 1e18;
  const [confirmMatchModal, setConfirmMatchModal] = useState(false);
  const [moveBoardVisible, setMoveBoardVisible] = useState(false);
  const [wageredAmount, setWageredAmount] = useState(0);
  const [challenger, setChallenger] = useState("");
  const [fen, setFen] = useState(beginningFEN);

  const revert = () => {
    setWageredAmount(0);
    setFen(beginningFEN);
    setNewMatchModal(false);
    setChallenger("");
  };

  const MoveBoardModal = () => {
    const chess = new Chess();
    const [chessObject, setChessObject] = useState({
      pendingMove: [],
      lastMove: [],
      fen: "",
    });

    const onMove = (from, to, data) => {
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
      title="New Match"
      visible={newMatchModal}
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
      <h3>Initiate a new Match by entering a wagered amount!</h3>
      <br />
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <div>
          Wagered Amount
          <br />
          <InputNumber
            min={minWager}
            defaultValue={wageredAmount}
            onChange={val => {
              setWageredAmount(val);
            }}
          />
          <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} />
          ETH
        </div>
      </div>
      <Divider />
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex", marginTop: 10, marginBottom: 20 }}>
        <div>
          Enter an address/ENS name for a Challenge match, else leave blank.
          <AddressInput
            value={challenger}
            ensProvider={mainnetProvider}
            onChange={e => {
              setChallenger(e);
            }}
          />
        </div>
      </div>
      <Divider />
      <div>
        <p>Take the first move, or let your opponent take the first move.</p>
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
        <p>You are playing as the {fen === beginningFEN ? "Black" : "White"} pieces.</p>
      </div>
      <Divider />
      <p style={{ marginTop: 30 }}>
        *Total funds needed for:{" "}
        <div>
          Match Initiation <TbCurrencyEthereum /> {wageredAmount} (paid now)
        </div>
        <div>
          Security Deposit for Winning Claim <TbCurrencyEthereum /> {wageredAmount} (paid later)
        </div>
        <div>
          Security Deposit for Claim Dispute <TbCurrencyEthereum /> {wageredAmount * 2} (paid later)
        </div>
      </p>
      (*security deposit returned after dispute resolution process settled in your favor)
      <br />
      (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
      <Modal
        title="Confirm transaction"
        visible={confirmMatchModal}
        onCancel={() => setConfirmMatchModal(false)}
        onOk={() => {
          setConfirmMatchModal(false);
          handleChallenge(tx, writeContracts, wageredAmount, challenger, fen, address, gun, gunUser) &&
            setNewMatchModal(false);
        }}
      >
        <h3>You are about to execute a transaction to initiate a new Match.</h3>
        <br />
        <p>Press ok to confirm and sign the transaction.</p>
      </Modal>
    </Modal>
  );
};

export default HandleNewMatch;
