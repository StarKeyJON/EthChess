import { message, notification } from "antd";
import Text from "antd/lib/typography/Text";

const executeWin = ({ tx, writeContracts, ipfsHistory }) => {
  tx(writeContracts.ETHChess.startClaim(ipfsHistory), update => {
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
        message: <Text>{"Claim Started! Please wait 7 blocks for the dispute period to end."}</Text>,
      });
    }
  });
};

const executeDispute = ({ tx, writeContracts, ipfsHistory }) => {
  tx(writeContracts.ETHChess.startDispute(ipfsHistory), update => {
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
        message: <Text>{"Dispute Started! Please allow time for the dispute resolution process."}</Text>,
      });
    }
  });
};


export { executeDispute, executeWin };