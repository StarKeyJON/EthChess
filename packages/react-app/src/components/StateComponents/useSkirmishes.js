import { useContext, useEffect, useState } from "react";
import { GUNKEY } from "../../constants";
import { SocketContext } from "../../socketContext/socketContext";

const useSkirmishes = ({ gun, player }) => {
  const socket = useContext(SocketContext);
  let socketId = socket.id;
  const [skirmishes, setSkirmishes] = useState([]);
  const [inSkirmish, setInSkirmish] = useState(false);

  const newSkirmish = async () => {
    let skirmish = {
      gameId: socketId,
      nonce: 0,
      player1: socketId,
      player2: "",
      active: true,
      started: false,
      finished: false,
      gameInProgress: false,
    };
    gun.get(GUNKEY).get("skirmishes").get(socketId).put(skirmish);
    gun.get(GUNKEY).get("chessLobby").get(socketId).put(skirmish);
    socket.emit("newRoom", socketId, "skirmishes", skirmish);
  };

  const joinSkirmish = (skirmish, profile, gameId) => {
    if (gameId && skirmish.player1) {
      gun.get(GUNKEY).get("skirmishes").get(gameId).put({ started: true, player2: profile.socketId });
      gun.get(GUNKEY).get("chessLobby").get(gameId).put({ player2: profile.socketId });
      socket.emit("skirmishJoined", gameId, "skirmishes", skirmish, profile);
    }
  };

  const findSkirmishForPlayer = () => {
    if (skirmishes.length === 0) {
      newSkirmish();
      return;
    }
    let skirmish;
    for (let i; i < skirmishes.length; i++) {
      if (!skirmishes[i].started && skirmishes[i].player1 !== player.name) {
        skirmish = skirmishes[i];
      }
    }
    setOpponent(skirmish.gameId, player);
    return skirmish;
  };

  const setOpponent = (gameId, type, player) => {
    socket.emit("opponentSet", gameId, player, type);
    setInSkirmish(true);
  };

  /**
   *
   * @param {*} gameId
   * @param {*} outcome win, draw, no contest, canceled
   * @param {*} winner
   */
  const endSkirmish = (gameId, outcome, winner) => {
    gun
      .get(GUNKEY)
      .get("skirmishes")
      .get(gameId)
      .put({ active: false, gameInProgress: false, finished: true, outcome: outcome ?? "", winner: winner ?? "" });
    setInSkirmish(false);
  };

  useEffect(() => {
    var p = [];
    gun &&
      gun
        .get(GUNKEY)
        .get("skirmishes")
        .map()
        .on((ack, i) => {
          if (ack && ack.active && !ack.gameInProgress) {
            Object.assign(ack, { key: i });
            let s = new Set(p);
            if (!s.has(ack)) {
              p.push(ack);
            }
          }
        })
        .then(() => {
          setSkirmishes(p);
        });
  }, [gun, player]);

  return {
    inSkirmish,
    newSkirmish,
    skirmishes,
    joinSkirmish,
    findSkirmishForPlayer,
    setOpponent,
    endSkirmish,
  };
};

export default useSkirmishes;
