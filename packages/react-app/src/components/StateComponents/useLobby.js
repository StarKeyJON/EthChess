import { useCallback, useContext, useEffect, useState } from "react";
import { GUNKEY } from "../../constants";
import { SocketContext } from "../../socketContext/socketContext";

const useLobby = ({ gun, address, startTime, setPlayer, newSkirmish, endSkirmish, lobbyJoinEmit }) => {
  const socket = useContext(SocketContext);
  let socketId = socket.id;
  const [joinedLobby, setJoinedLobby] = useState(false);
  const [players, setPlayers] = useState([]);
  const [profile, setProfile] = useState({
    address: address ?? "",
    active: true,
    inMatch: false,
    skirmishId: socketId,
    gamesPlayed: 0,
    ratio: 0,
    uuid: "",
    joined: startTime,
    socketId: socketId,
    gameId: socketId,
  });
  const fetchLobby = () => {
    return players;
  };

  const updateProfile = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const setSocket = useCallback(() => {
    setProfile(profile => ({
      ...profile,
      socketId: socketId,
      skirmishId: socketId,
      gameId: socketId,
    }));
  }, [socketId]);

  const fetchPlayers = () => {
    var p = [];
    gun
      .get(GUNKEY)
      .get("chessLobby")
      .map()
      .on((ack, i) => {
        if (ack && ack.active === true) {
          Object.assign(ack, { key: i });
          let s = new Set(p);
          if (!s.has(ack)) {
            p.push(ack);
          }
        }
      })
      .then(() => {
        setPlayers(p);
      });
  };
  useEffect(() => {
    fetchPlayers();
  }, [joinedLobby]);

  useEffect(() => {
    socket && setSocket();
  }, [socket, socketId]);

  const joinLobby = () => {
    gun
      .get(GUNKEY)
      .get("chessLobby")
      .get(socketId)
      .put(profile)
      .once((ack, soul) => {
        setProfile({ ...profile, uuid: soul, socketId: socketId, gameId: socketId, skirmishId: socketId });
      });
    newSkirmish(profile, socketId);
    setPlayer(profile);
    setJoinedLobby(true);
    lobbyJoinEmit(profile);
  };

  const leaveLobby = () => {
    if (profile.active) {
      gun.get(GUNKEY).get("chessLobby").get(socketId).put({ active: false });
      endSkirmish(profile.gameId);
      setJoinedLobby(false);
      socket.emit("leftLobby", socketId, profile);
    }
  };

  return { fetchLobby, joinLobby, leaveLobby, joinedLobby, updateProfile, profile };
};

export default useLobby;
