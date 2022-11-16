import { Avatar, Button, Divider, Image, InputNumber, message, Modal, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { Chess } from "chess.js";
import { utils } from "ethers";
import { useCallback, useEffect, useState } from "react";
import Chessground from "react-chessground/chessground";
import { TbCurrencyEthereum } from "react-icons/tb";
import { appStage, beginningFEN, GUNKEY } from "../../constants";
import AddressInput from "../AddressInput";
import ethlogo from "../../assets/ethereumLogo.png";
import { useContractReader } from "eth-hooks";
import { gql, useQuery } from "@apollo/client";
import { GetFromIPFS } from "../../helpers/ipfs";
import { SEA } from "gun";

const executeNewMatch = (tx, writeContracts, wageredAmount, fen, address, gun) => {
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
          message: <Text>{"New Match Initiated!"}</Text>,
        });
        if (appStage === "production") {
          gun.get(GUNKEY).get(address).get("matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
          });
          gun.get(GUNKEY).get("pending_matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            player1: address,
          });
        }
        return true;
      }
    },
  );
};

const executeNewChallengeMatch = (tx, writeContracts, wageredAmount, challenger, fen, address, gun) => {
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
          message: <Text>{"New Match Initiated with Challenger " + challenger + "!"}</Text>,
        });
        if (appStage === "production") {
          gun.get(GUNKEY).get(address).get("matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            challenger: challenger,
            fen: fen,
          });
          gun.get(GUNKEY).get("pending_matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            player1: address,
            player2: challenger,
          });
        }
      }
    },
  );
};

const executeNewDeathMatch = (tx, writeContracts, wageredAmount, address, gun) => {
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
          message: <Text>{"DeathMatch Initiated!"}</Text>,
        });
        if (appStage === "production") {
          gun.get(GUNKEY).get("matches").get(address).set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
          });
          gun.get(GUNKEY).get("pending_matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            player1: address,
          });
        }
      }
    },
  );
};

const executeStartMatch = (tx, writeContracts, wageredAmount, fen, gameId, gun, address, player1) => {
  tx(
    writeContracts.ETHChessMatches.startMatch(gameId, fen, {
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
          message: <Text>{"Match Started!"}</Text>,
        });
        var pair = SEA.pair();
        if (appStage === "production") {
          gun.get(GUNKEY).get(address).get("matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            gameId: gameId,
          });
          gun.get(GUNKEY).get("matches").get(gameId).get("meta").put({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            player1: player1,
            player2: address,
            player2PubKey: pair.pub,
          });
        }
      }
    },
  );
};

const handleChallenge = (tx, writeContracts, wageredAmount, challenger, fen, address, gun) => {
  if (!challenger) {
    return executeNewMatch(tx, writeContracts, wageredAmount, fen, address, gun);
  } else if (challenger && challenger.length === 42 && challenger.slice(0, 2) === "0x") {
    return executeNewChallengeMatch(tx, writeContracts, wageredAmount, challenger, fen, address, gun);
  } else {
    notification.open({ message: "Fill out match info..." });
    return false;
  }
};

export const HandleNewMatch = ({
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

export const HandleNewDeathMatch = ({
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

export const HandleStartMatch = ({
  gun,
  gunUser,
  tx,
  writeContracts,
  readContracts,
  mainnetProvider,
  startMatchModal,
  setStartMatchModal,
  gameId,
  address,
}) => {
  const [confirmMatchModal, setConfirmMatchModal] = useState(false);
  const minWager = useContractReader(readContracts, "ETHChessMatches", "minWager")?.toString() / 1e18;
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
  const { loading, data } = useQuery(MATCH_GQL, { pollInterval: 2500 });
  const [moveBoardVisible, setMoveBoardVisible] = useState(false);
  const [startFen, setStartFen] = useState(beginningFEN);
  const [fen, setFen] = useState();

  const revert = () => {
    setFen(beginningFEN);
    setStartMatchModal(false);
  };

  const MoveBoardModal = ({ fen }) => {
    const chess = new Chess(fen);
    const [chessObject, setChessObject] = useState({
      pendingMove: [],
      lastMove: [],
      fen: data.fen,
    });

    const onMove = (from, to, data) => {
      var themove = chess.move({ from, to });
      if (themove == null) {
        notification.open({ message: "Illegal move!" });
        setChessObject({ ...chessObject, fen: chess.fen() });
        return;
      } else {
        setStartFen(chess.fen());
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

    useEffect(() => {
      if (!loading && data) {
        let startIpfs = GetFromIPFS(data.startIpfs);
        setFen(startIpfs.fen);
      }
    }, [loading]);

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
            fen={data.fen}
            onMove={onMove}
            check={"false"}
            style={{ margin: "auto" }}
            orientation={data.fen === beginningFEN ? "black" : "white"}
          />
        </Modal>
      </>
    );
  };

  return (
    <Modal
      title="Start Match"
      visible={startMatchModal}
      onCancel={() => {
        revert();
      }}
    >
      <h3>Start a new Match by matching the wagered amount!</h3>
      <br />
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <div>
          {data?.wager}
          <br />
          <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} />
          ETH
        </div>
      </div>
      <Divider />
      <div>
        <p>Take your first move!</p>
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
          <MoveBoardModal fen={fen} />
        </div>
        <p>Current gameplay FEN: {fen === beginningFEN ? "Unmoved board" : fen}</p>
      </div>
      <Divider />
      <p style={{ marginTop: 30 }}>
        *Total funds needed will be <TbCurrencyEthereum />
        {data?.wager} + <TbCurrencyEthereum /> {data?.wager} security deposit for a winning match claim, or,{" "}
        <TbCurrencyEthereum />
        {data?.wager} + <TbCurrencyEthereum /> {data?.wager * 2} to dispute the match outcome.
      </p>
      (*security deposit returned after dispute resolution process)
      <br />
      (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
      <Modal
        title="Confirm transaction"
        visible={confirmMatchModal}
        onCancel={() => setConfirmMatchModal(false)}
        onOk={() => {
          setConfirmMatchModal(false);
          executeStartMatch(tx, writeContracts, data.wageredAmount, startFen, gun, address, data.player1.id) &&
            setStartMatchModal(false);
        }}
      >
        <h3>You are about to execute a transaction to initiate a new Match.</h3>
        <br />
        <p>Press ok to confirm and sign the transaction.</p>
      </Modal>
    </Modal>
  );
};

export const HandleStartDMatch = ({
  gun,
  gunUser,
  tx,
  writeContracts,
  readContracts,
  mainnetProvider,
  startDMatchModal,
  setStartDMatchModal,
  gameId,
  address,
  player1,
}) => {
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
  const minWager = useContractReader(readContracts, "ETHChessMatches", "minWager")?.toString() / 1e18;
  const MATCH_GQL = gql(matchQ);
  const { loading, matchData } = useQuery(MATCH_GQL, { pollInterval: 2500 });
  const [confirmMatchModal, setConfirmMatchModal] = useState(false);
  const [moveBoardVisible, setMoveBoardVisible] = useState(false);
  const [wageredAmount, setWageredAmount] = useState(0);
  const [challenger, setChallenger] = useState("");
  const [fen, setFen] = useState();

  const revert = () => {
    setWageredAmount(0);
    setFen(beginningFEN);
    setStartDMatchModal(false);
    setChallenger("");
  };

  const MoveBoardModal = ({ fen }) => {
    const chess = new Chess(fen);
    const [chessObject, setChessObject] = useState({
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

    useEffect(() => {
      if (!loading && matchData) {
        let startIpfs = GetFromIPFS(matchData.startIpfs);
        setFen(startIpfs.fen);
      }
    }, [loading]);

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
      title="Start DeathMatch"
      visible={startDMatchModal}
      onCancel={() => {
        revert();
      }}
    >
      <h3>Start a new DeathMatch Round!</h3>
      <br />
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <div>
          Entrance Fee Needed
          <br />
          {matchData?.entranceFee}
          <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} />
          ETH
        </div>
      </div>
      <Divider />
      <div>
        <p>Take your first move.</p>
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
      </div>
      <Divider />
      <p style={{ marginTop: 30 }}>
        *Total funds needed will be <TbCurrencyEthereum />
        {matchData?.entranceFee} + <TbCurrencyEthereum /> {matchData?.entranceFee} security deposit for a winning match
        claim, or, <TbCurrencyEthereum />
        {matchData?.entranceFee} + <TbCurrencyEthereum /> {matchData?.entranceFee * 2} to dispute the match outcome.
      </p>
      (*security deposit returned after dispute resolution process)
      <br />
      (**minimum wager amount is <TbCurrencyEthereum /> {minWager})
      <Modal
        title="Confirm transaction"
        visible={confirmMatchModal}
        onCancel={() => setConfirmMatchModal(false)}
        onOk={() => {
          setConfirmMatchModal(false);
          executeStartMatch(tx, writeContracts, wageredAmount, challenger, fen, gun, address, player1) &&
            setStartDMatchModal(false);
        }}
      >
        <h3>You are about to execute a transaction to initiate a new Match.</h3>
        <br />
        <p>Press ok to confirm and sign the transaction.</p>
      </Modal>
    </Modal>
  );
};
