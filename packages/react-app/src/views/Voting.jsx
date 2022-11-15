import { Card, Popover, Table } from "antd";
import React from "react";
import { FaInfoCircle, FaVoteYea } from "react-icons/fa";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

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

  const columns = [
    {
      title: "Match ID",
      dataIndex: "matchId",
      key: "matchId",
      width: "20%",
    },
    {
      title: "Claim",
      dataIndex: "endHash",
      key: "endHash",
      width: "20%",
    },
    {
      title: "Dispute",
      dataIndex: "contestedHash",
      key: "contestedHash",
      width: "20%",
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
