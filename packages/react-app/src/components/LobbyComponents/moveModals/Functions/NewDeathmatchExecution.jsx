import { message, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { utils } from "ethers";
import { GUNKEY, appStage } from "../../../../constants";

const executeNewDeathMatch = (tx, writeContracts, wageredAmount, address, gun, gunUser) => {
  tx(
    writeContracts.ETHChessMatches.initDeathMatch({
      value: utils.parseEther(wageredAmount.toString()),
    }),
    update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        message.info(" 🍾 Transaction " + update.hash + " finished!");
        message.info(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        notification.open({
          message: <Text>{"DeathMatch Initiated!"}</Text>,
        });
        if (appStage === "production") {
          let pub = gunUser.is.pub;
          gun.get(GUNKEY).get("deathMatches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            initiator: address,
          });
          gun.get(GUNKEY).get("pending_matches").get(update.hash).set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            player1: address,
            player1Pub: pub,
            p1Color: "black",
          });
        }
      }
    },
  );
};

export default executeNewDeathMatch;