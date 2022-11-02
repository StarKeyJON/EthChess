import { useCallback, useContext, useEffect, useState } from "react";
import { GUNKEY } from "../../constants";
import { SocketContext } from "../../socketContext/socketContext";

const useLobby = ({ gun, address, startTime, player, setPlayer, newSkirmish, endSkirmish, lobbyJoinEmit }) => {
  const socket = useContext(SocketContext);
  let socketId = socket.id;
  const [age, setAge] = useState(player?.age ?? Math.ceil(Math.random() * 100));
  const [joinedLobby, setJoinedLobby] = useState(false);
  const [players, setPlayers] = useState([]);
  const [profile, setProfile] = useState({
    name: `Player_${startTime}`,
    age: age,
    location: "web3",
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
        if (ack && ack.active) {
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
    gun && fetchPlayers();
  }, [gun, joinedLobby]);

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
      setAge(Math.ceil(Math.random() * 100));
      endSkirmish(profile.gameId);
      setJoinedLobby(false);
      socket.emit("leftLobby", socketId, profile);
    }
  };

  return { fetchLobby, joinLobby, leaveLobby, joinedLobby, updateProfile, profile };
};

export default useLobby;
