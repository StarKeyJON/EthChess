import { message, notification } from "antd";
import { useState } from "react";
import { GUNKEY } from "../../constants";
// import { SocketContext } from "../../socketContext/socketContext";

const useProfile = ({ gun, address, gunUser, setGunUser }) => {
  // const socket = useContext(SocketContext);
  // let socketId = socket.id;
  const [loggedIn, setLoggedIn] = useState(false);
  const [player, setPlayer] = useState();
  const loginProfile = passphrase => {
    if (address) {
      gunUser.auth(`ETHCHESS_USER_${address}`, passphrase, ack => {
        if (!ack.err) {
          message.info("Logged In!", 4);
          gun.get(GUNKEY).get("user_profiles").get(gunUser.is.pub).put({ isLoggedOn: true });
          gun.get(GUNKEY).get("user_alias_profiles").get(address).put({ pub: gunUser.is.pub });
          gun
            .get(GUNKEY)
            .get("user_profiles")
            .get(gunUser.is.pub)
            .once(ack => {
              setPlayer(ack);
            });
          setGunUser(gun.user().is);
        } else {
          message.info("Error: Wrong Password!", 4);
        }
      });
    } else {
      notification.open({ message: "Connect an ETH wallet!" });
    }
    gun.on("auth", ack => {
      if (!ack.err) {
        //   console.log(ack);
        message.info("Logged In!", 4);
        setLoggedIn(true);
      } else {
        message.info("Error: Wrong Password!", 4);
      }
    });
  };

  const createProfile = passphrase => {
    if (address) {
      let theDate = Date.now();
      gunUser.create(`ETHCHESS_USER_${address}`, passphrase, function () {
        gunUser.auth(`ETHCHESS_USER_${address}`, passphrase, ack => {
          if (!ack.err) {
            gun
              .get(GUNKEY)
              .get("user_profiles")
              .get(gunUser.is.pub)
              .put({ alias: address, pub: gunUser.is.pub, dateCreated: theDate, isLoggedOn: true });
            gun.get(GUNKEY).get("user_alias_profiles").get(address).put({ pub: gunUser.is.pub });
            message.info("Logged In!", 4);
            setLoggedIn(true);
          } else {
            message.info("Please contact the Dev team with the following message: " + ack.err, 4);
          }
        });
      });
    } else {
      notification.open({ message: "Connect an ETH wallet!" });
    }
  };

  const logoutProfile = () => {
    gunUser.leave();
    setLoggedIn(false);
    setPlayer({});
  };

  return { loggedIn, createProfile, loginProfile, logoutProfile, player, setPlayer };
};

export default useProfile;
