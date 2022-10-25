import { useEffect, useState } from "react";
const useGetGames = ({ gun, address }) => {
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    address &&
      gun
        .get("best-of-chess-")
        .get("live-players-")
        .get(address)
        .put({
          live: true,
          time: Math.floor(Date.now() / 1000),
        });
    setPlayers([]);
    gun
      .get("best-of-chess-")
      .get("live-players-")
      .map()
      .once(ack => {
        // console.log(ack);
        if (ack.live) {
          setPlayers([...players, ack]);
        }
      });
    setReady(true);
    return () => {
      // Clean up the subscription
      gun && address && gun.get("best-of-chess-").get("live-players-").get(address).get("live").put(false);
    };
  }, [gun, address]);

  useEffect(() => {
    if (gun) {
      setPlayers([]);
      gun
        .get("best-of-chess-")
        .get("live-players-")
        .map()
        .once(ack => {
          if (ack.live) {
            setPlayers([...players, ack]);
          }
        });
      setReady(true);
    }
  }, [gun]);

  if (ready) {
    return players;
  }
};

export default useGetGames;
