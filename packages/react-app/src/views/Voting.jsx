import { Button, Card, Modal, Popover, Table } from "antd";
import React, { useState } from "react";
import { FaInfoCircle, FaVoteYea } from "react-icons/fa";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { GetFromIPFS } from "../helpers/ipfs";
import { ViewHistory } from "../components/VotingComponents";

const Voting = ({ address, tx, writeContracts, readContracts, gun, gunUser }) => {
  const matchQ = `
  {
    disputes(where: {onGoing: true}){
      id
      matchId
      claimStart
      security
      disputer
      startHash
      endHash
      contestedHash
      tally
      votedFor
      votedAgainst
      onGoing
    }
  }`;

  const MATCH_GQL = gql(matchQ);
  const { loading, matchData } = useQuery(MATCH_GQL, { pollInterval: 2500 });
  const [claimMod, setClaimMod] = useState(false);
  const [disputeMod, setDisputeMod] = useState(false);

  const ClaimModal = hash => {
    let data = GetFromIPFS(hash);
    return (
      <>
        <Modal visible={claimMod}>
          <h3>Claim History</h3>
          <ViewHistory history={data} />
        </Modal>
      </>
    );
  };

  const DisputeModal = hash => {
    let data = GetFromIPFS(hash);
    return (
      <>
        <Modal visible={disputeMod}>
          <h3>Dispute History</h3>
          <ViewHistory history={data} />
        </Modal>
      </>
    );
  };

  const columns = [
    {
      title: "Match ID",
      dataIndex: "matchId",
      key: "matchId",
      width: "20%",
    },
    {
      title: "View Claim",
      dataIndex: "endHash",
      key: "endHash",
      width: "20%",
      render: hash => {
        <>
          <Button
            onClick={() => {
              setClaimMod(true);
            }}
          >
            Claim
          </Button>
          <ClaimModal hash={hash} />
        </>;
      },
    },
    {
      title: "View Dispute",
      dataIndex: "contestedHash",
      key: "contestedHash",
      width: "20%",
      render: hash => {
        <>
          <Button
            onClick={() => {
              setDisputeMod(true);
            }}
          >
            Dispute
          </Button>
          <DisputeModal hash={hash} />
        </>;
      },
    },
    {
      title: "Outcome",
      dataIndex: "tally",
      key: "tally",
      width: "20%",
    },
    {
      title: "Security",
      dataIndex: "security",
      key: "security",
      width: "20%",
    },
  ];

  return (
    <>
      <div>
        <Card>
          <div>
            Mint an ETH-Chess NFT for 0.01 ETH <Link to="/mint">Mint</Link>
          </div>
          <div style={{ marginTop: 50 }}>
            <h1>
              <FaVoteYea /> Match Disputes{" "}
              <Popover
                content={
                  <>
                    ETHChess NFT holders can vote for disputes in matches.
                    <br />
                    Up to eleven votes can be made per dispute.
                    <br />
                    There is a one day window to settle disputes.
                    <br />
                    Voters receive one half of the match initiation amount.
                  </>
                }
              >
                <FaInfoCircle size={12} />
              </Popover>
            </h1>
            <Table dataSource={!loading ? matchData : ""} columns={columns} />
          </div>
        </Card>
      </div>
    </>
  );
};

export default Voting;
