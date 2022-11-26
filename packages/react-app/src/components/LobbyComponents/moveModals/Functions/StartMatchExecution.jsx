import { message, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { utils } from "ethers";
import { appStage, GUNKEY } from "../../../../constants";

const executeStartMatch = (tx, txnHash, writeContracts, wageredAmount, fen, gameId, gun, address, player1, gunUser) => {
  tx(
    writeContracts.ETHChessMatches.startMatch(gameId, fen, {
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
          message: <Text>{"Match Started!"}</Text>,
        });
        if (appStage === "production") {
          var pub = gunUser.is.pub;
          gun.get(GUNKEY).get(address).get("matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            gameId: gameId,
          });
          gun
            .get(GUNKEY)
            .get("pending_matches")
            .get(txnHash)
            .once(ack => {
              gun.get(GUNKEY).get("matches").get(gameId).get("meta").put({
                txnHash: update.hash,
                wageredAmount: wageredAmount,
                fen: fen,
                p1Color: ack.p1Color,
                player1: player1,
                player1PubKey: ack.player1Pub,
                player2: address,
                player2PubKey: pub,
              });
            });
          gun.get(GUNKEY).get("pending_matches").get(txnHash).put(null);
        }
      }
    },
  );
};

export default executeStartMatch;
