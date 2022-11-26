import { message, notification } from "antd";
import Text from "antd/lib/typography/Text";
import { utils } from "ethers";
import { appStage, beginningFEN, GUNKEY } from "../../../../constants";

const executeNewMatch = (tx, writeContracts, wageredAmount, fen, address, gun, gunUser) => {
  tx(
    writeContracts.ETHChessMatches.initMatch(fen, {
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
          message: <Text>{"New Match Initiated!"}</Text>,
        });
        if (appStage === "production") {
          let color = "white";
          if (fen === beginningFEN) {
            color = "black";
          }
          var pub = gunUser.is.pub;
          gun.get(GUNKEY).get(address).get("matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            p1Color: color,
          });
          gun.get(GUNKEY).get("pending_matches").get(update.hash).set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            player1: address,
            player1Pub: pub,
            p1Color: color,
          });
        }
        return true;
      }
    },
  );
};

const executeNewChallengeMatch = (tx, writeContracts, wageredAmount, challenger, fen, address, gun, gunUser) => {
  tx(
    writeContracts.ETHChessMatches.initChallengeMatch(challenger, fen, {
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
          message: <Text>{"New Match Initiated with Challenger " + challenger + "!"}</Text>,
        });
        if (appStage === "production") {
          let color = "white";
          if (fen === beginningFEN) {
            color = "black";
          }
          var pub = gunUser.is.pub;
          gun.get(GUNKEY).get(address).get("matches").set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            challenger: challenger,
            fen: fen,
            p1Color: color,
          });
          gun.get(GUNKEY).get("pending_matches").get(update.hash).set({
            txnHash: update.hash,
            wageredAmount: wageredAmount,
            fen: fen,
            p1Color: color,
            player1: address,
            player1Pub: pub,
            player2: challenger,
          });
        }
      }
    },
  );
};

export const handleChallenge = (tx, writeContracts, wageredAmount, challenger, fen, address, gun, gunUser) => {
  if (!challenger) {
    return executeNewMatch(tx, writeContracts, wageredAmount, fen, address, gun, gunUser);
  } else if (challenger && challenger.length === 42 && challenger.slice(0, 2) === "0x") {
    return executeNewChallengeMatch(tx, writeContracts, wageredAmount, challenger, fen, address, gun, gunUser);
  } else {
    notification.open({ message: "Please fill out match info..." });
    return false;
  }
};

export default handleChallenge;
