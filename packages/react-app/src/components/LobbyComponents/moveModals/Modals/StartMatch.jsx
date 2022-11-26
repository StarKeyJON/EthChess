import { Avatar, Button, Divider, Image, Modal, notification, Space } from "antd";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import Chessground from "react-chessground/chessground";
import { TbCurrencyEthereum } from "react-icons/tb";
import ethlogo from "../../../../assets/ethereumLogo.png";
import { useContractReader } from "eth-hooks";
import { gql, useQuery } from "@apollo/client";

import { beginningFEN } from "../../../../constants";
import { executeStartMatch } from "../Functions";
import { GetFromIPFS } from "../../../../helpers/ipfs";

const HandleStartMatch = ({
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
          txnHash
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
        *Total funds needed for:{" "}
        <div>
          Match Initiation <TbCurrencyEthereum /> {data?.wager} (paid now)
        </div>
        <div>
          Security Deposit for Winning Claim <TbCurrencyEthereum /> {data?.wager} (paid later)
        </div>
        <div>
          Security Deposit for Claim Dispute <TbCurrencyEthereum /> {data?.wager * 2} (paid later)
        </div>
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
          executeStartMatch(
            tx,
            data.txnHash,
            writeContracts,
            data.wageredAmount,
            startFen,
            gun,
            address,
            data.player1.id,
            gunUser,
          ) && setStartMatchModal(false);
        }}
      >
        <h3>You are about to execute a transaction to initiate a new Match.</h3>
        <br />
        <p>Press ok to confirm and sign the transaction.</p>
      </Modal>
    </Modal>
  );
};

export default HandleStartMatch;
