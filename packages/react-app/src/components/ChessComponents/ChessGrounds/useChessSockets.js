import { useCallback, useContext, useEffect } from "react";
import { SocketContext } from "../../../socketContext/socketContext";

const useChessSockets = ({
  handleJoin,
  handleHand,
  handleMove,
  handleIllMove,
  handleOpp,
  handleOppJoin,
  handlePlayerLeftModal,
  socket,
}) => {

  useEffect(() => {
    socket.on("playerJoined", ack => {
      handleJoin(ack);
      // fetchGunState();
    });

    socket.on("opponentJoined", ack => {
      handleOppJoin(ack);
    })

    socket.on("handShaken", (add, pl) => {
      handleHand(add, pl);
    });

    socket.on("setOpponent", opponent => {
      handleOpp(opponent);
    });

    // socket.on("gameStart", (prof, ack) => {
    //   console.log("Game Start ", prof, ack)
    //   if (!gameInProgress) {
    //     updateState("gameState", ack.gameState);
    //     if (ack.player1 === socketId) {
    //       setSkirmishState({
    //         ...skirmishState,
    //         pla: socketId,
    //         opp: ack.player2,
    //       });
    //     } else {
    //       setSkirmishState({
    //         ...skirmishState,
    //         pla: ack.player2,
    //         opp: socketId,
    //       });
    //     }
    //     fetchGunState();
    //     setGameInProgress(true);
    //   }
    // });

    socket.on("playerMoved", (prof, ack) => {
      handleMove(prof, ack);
    });

    socket.on("leftRoom", ack => {
      handlePlayerLeftModal();
    });

    socket.on("illegalMove", ack => {
      handleIllMove(ack);
    });
  }, [socket]);
};

export default useChessSockets;
