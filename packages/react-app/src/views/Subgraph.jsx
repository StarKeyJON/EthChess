import { gql, useQuery } from "@apollo/client";
import { Button, Input, Table, Typography } from "antd";
import "antd/dist/antd.css";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";
import React, { useState } from "react";
import { Address } from "../components";

const highlight = {
  marginLeft: 4,
  marginRight: 8,
  /* backgroundColor: "#f9f9f9", */ padding: 4,
  borderRadius: 4,
  fontWeight: "bolder",
};

function Subgraph(props) {
  function graphQLFetcher(graphQLParams) {
    return fetch(props.subgraphUri, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphQLParams),
    }).then(response => response.json());
  }

  const EXAMPLE_GRAPHQL = `
  {
    match(id: 1){
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
      p1Amount
      p2Amount
      refunded
      winner {
        id
        address
      }
    }
  }
  `;
  const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });

  // const purposeColumns = [
  //   {
  //     title: "Purpose",
  //     dataIndex: "purpose",
  //     key: "purpose",
  //   },
  //   {
  //     title: "Sender",
  //     key: "id",
  //     render: record => <Address value={record.sender.id} ensProvider={props.mainnetProvider} fontSize={16} />,
  //   },
  //   {
  //     title: "createdAt",
  //     key: "createdAt",
  //     dataIndex: "createdAt",
  //     render: d => new Date(d * 1000).toISOString(),
  //   },
  // ];

  // const [newPurpose, setNewPurpose] = useState("loading...");

  // const deployWarning = (
  //   <div style={{ marginTop: 8, padding: 8 }}>Warning: 🤔 Have you deployed your subgraph yet?</div>
  // );

  return (
    <>
      <div style={{textAlign: "left", alignItems: "center", justifyContent: "center", display: "flex"}}>
        <div style={{ marginTop: 50, marginBottom: 150, margin: 32, height: 800, width: "80%", border: "1px solid #888888" }}>
          <GraphiQL fetcher={graphQLFetcher} docExplorerOpen query={EXAMPLE_GRAPHQL} />
      </div>
      </div>
    </>
  );
}

export default Subgraph;
