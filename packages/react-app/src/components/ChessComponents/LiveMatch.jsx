import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { GUNKEY } from "../../constants";
import { ChessMatches, ChessViewer } from "./ChessGrounds";

const LiveMatch = ({ gun, address }) => {
  const [game, setGame] = useState();
  const roomId = useParams();
  useEffect(() => {
    gun
      .get(GUNKEY)
      .get(roomId)
      .once(ack => {
        if (ack && ack.board) {
          setGame(ack.board);
        }
      });
  }, []);

  return (
    <>
      {address === roomId ? (
        <ChessMatches gun={gun} />
      ) : address === game?.player2 ? (
        <ChessMatches gun={gun} />
      ) : (
        <ChessViewer board={game} />
      )}
      <div></div>
    </>
  );
};

export default LiveMatch;
