import { useEffect, useState } from "react";
import { GUNKEY } from "../constants";
const useGetPlayers = ({ gun }) => {
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    if (gun) {
      // setPlayers([]);
      gun
        .get(GUNKEY)
        .get("live-players")
        .map()
        // .map()
        .once(ack => {
          console.log(ack);
          if (ack.active) {
            setPlayers([...players, ack]);
          }
        });
      setReady(true);
    }
    gun.get(GUNKEY).get("live-players").on(function tellMe(e){
      console.log(e);
    })
  }, [gun]);

  if (ready) {
  }
  return players;
};

export default useGetPlayers;
