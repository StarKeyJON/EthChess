import { Avatar, Button, Divider, Image, InputNumber, message, Modal, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { Chess } from "chess.js";
import { utils } from "ethers";
import { useCallback, useState } from "react";
import Chessground from "react-chessground/chessground";
import { TbCurrencyEthereum } from "react-icons/tb";
import { appStage, beginningFEN } from "../../constants";
import AddressInput from "../AddressInput";
import ethlogo from "../../assets/ethereumLogo.png";
import { useContractReader } from "eth-hooks";

const executeNewMatch = ({ tx, writeContracts, wageredAmount, fen }) => {
  tx(
    writeContracts.ETHChessMatches.initMatch(fen, {
      value: utils.parseEther(wageredAmount.toString()),
    }),
    update => {
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
          message: <Text>{"Match Initiated!"}</Text>,
        });
      }
    },
  );
};

const executeNewChallengeMatch = ({ tx, writeContracts, wageredAmount, challenger, fen }) => {
  tx(
    writeContracts.ETHChessMatches.initChallengeMatch(challenger, fen, {
      value: utils.parseEther(wageredAmount.toString()),
    }),
    update => {
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
          message: <Text>{"Match Initiated with Challenger " + challenger + "!"}</Text>,
        });
      }
    },
  );
};

const executeNewDeathMatch = ({ tx, writeContracts, wageredAmount }) => {
  tx(
    writeContracts.ETHChessMatches.initDeathMatch({
      value: utils.parseEther(wageredAmount.toString()),
    }),
    update => {
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
          message: <Text>{"Match Initiated!"}</Text>,
        });
      }
    },
  );
};

const handleChallenge = (tx, writeContracts, wageredAmount, challenger, fen) => {
  if (typeof challenger === "undefined") {
    appStage === "production"
      ? executeNewMatch(tx, writeContracts, wageredAmount, fen)
      : console.log("Execute transaction!", tx, writeContracts, wageredAmount, fen);
  } else if (challenger && challenger.length === 42 && challenger.slice(0, 2) === "0x") {
    appStage === "production" && executeNewChallengeMatch(tx, writeContracts, wageredAmount, challenger, fen);
  }
};

export const HandleNewMatch = ({ tx, writeContracts, readContracts, mainnetProvider, confirmMatchModal, setConfirmMatchModal, newMatchModal, setNewMatchModal }) => {
  const minWager = useContractReader(readContracts, "ETHChessMatches", "minWager")?.toString() / 1e18;
  const [moveBoardVisible, setMoveBoardVisible] = useState(false);
  const [wageredAmount, setWageredAmount] = useState(0);
  const [challenger, setChallenger] = useState();
  const [fen, setFen] = useState(beginningFEN);
  const setAmount = useCallback(
    amt => {
      setWageredAmount(amt);
    },
    [wageredAmount],
  );

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
        <Modal style={{ alignItems: "center", justifyContent: "center", display: "flex" }} visible={moveBoardVisible}>
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
        setNewMatchModal(false);
      }}
    >
      <h3>Initiate a new Match by entering a wagered amount!</h3>
      <br />
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <div>
          Wagered Amount
          <br />
          <InputNumber
            min={0.00001}
            defaultValue={0.00001}
            onChange={val => {
              setAmount(val);
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
        <p>Current gameplay FEN: {fen}</p>
      </div>
      <Divider />
      <p style={{ marginTop: 30 }}>
        *Total funds needed will be <TbCurrencyEthereum />
        {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount} security deposit for a winning match claim, or,{" "}
        <TbCurrencyEthereum />
        {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount * 2} to dispute the match outcome.
      </p>
      (*security deposit returned after dispute resolution process)
      <br />
      (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
      <Modal
        title="Confirm transaction"
        visible={confirmMatchModal}
        onCancel={() => setConfirmMatchModal(false)}
        onOk={() => {
          handleChallenge(tx, writeContracts, wageredAmount, challenger, fen);
        }}
      >
        <h3>You are about to execute a transaction to initiate a new Match.</h3>
        <br />
        <p>Press ok to confirm and sign the transaction.</p>
      </Modal>
    </Modal>
  );
};

export const HandleNewDeathMatch = ({ tx, writeContracts, readContracts, confirmMatchModal, setConfirmMatchModal, newDeathMatchModal, setNewDeathMatchModal }) => {
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
        <Modal style={{ alignItems: "center", justifyContent: "center", display: "flex" }} visible={moveBoardVisible}>
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
        setNewDeathMatchModal(false);
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
      <p>Current gameplay FEN: {fen}</p>
      <Divider />
      <p style={{ marginTop: 30 }}>
        *Total funds needed will be <TbCurrencyEthereum />
        {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount} security deposit for a winning match claim, or,{" "}
        <TbCurrencyEthereum />
        {wageredAmount} + <TbCurrencyEthereum /> {wageredAmount * 2} to dispute the match outcome.
      </p>
      (*security deposit returned after dispute resolution process)
      <br />
      (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
      <Modal
        title="Confirm transaction"
        visible={confirmMatchModal}
        onOk={() => {
          appStage === "production" && executeNewDeathMatch(tx, writeContracts, wageredAmount);
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
