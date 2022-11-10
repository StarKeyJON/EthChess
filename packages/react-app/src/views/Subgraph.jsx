import { gql, useQuery } from "@apollo/client";
import "antd/dist/antd.css";
import GraphiQL from "graphiql";
import "graphiql/graphiql.min.css";
import fetch from "isomorphic-fetch";
import React from "react";

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
  // const EXAMPLE_GQL = gql(EXAMPLE_GRAPHQL);
  // const { loading, data } = useQuery(EXAMPLE_GQL, { pollInterval: 2500 });

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
