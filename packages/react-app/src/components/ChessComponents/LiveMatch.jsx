import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { GUNKEY } from "../../constants";
import { ChessGround, ChessViewer } from "./ChessGrounds";


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
  }, [gun]);

  return (
    <>
      {address === roomId ? (
        <ChessGround />
      ) : address === game?.player2 ? (
        <ChessGround />
      ) : (
        <ChessViewer board={game} />
      )}
      <div></div>
    </>
  );
};

export default LiveMatch;
