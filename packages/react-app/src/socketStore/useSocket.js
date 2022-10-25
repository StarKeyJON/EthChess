import { Chess } from "chess.js";
import { useContext, useState } from "react";
import { SocketContext } from "../socketContext/socketContext";

// import { socket, socketId } from "./socket";
const useSocket = () => {
  const socket = useContext(SocketContext);
  const [socketData, setSocketData] = useState({
    inGame: false, // controls rendering of the chessboard component
    passwordCreationInput: "", // input box for password creation
    gameJoinInput: "", // input box for game joining
    password: "", // when a socket event is received with this value, start the game
    userSocket: "", // the user's client socket object
    userSocketId: "", // the user's client socket ID
    opponentSocketId: "", // the opponent's socket ID
    userColor: "",
    opponentColor: "",
    turnToMove: "white", // used to determine if move events should trigger for the player
    currentPositionFen: "", // used to render the current chess position for the client
    userInfoMessage: "", // used to render info for the user
    chessGameObject: new Chess(), // the chess game object used to validate chess logic
    sourceSquare: "", // where the client's most recent mouse over event was (not holding down the mouse)
    targetSquare: "", // where the client's most recent drag over event was (holding down the mouse)
  });

  const updateSocketData = e => {
    setSocketData({ ...socketData, [e.target.name]: e.target.value });
  };

  // const emitter = (roomId, channel, payload, othersOnly) => {
  //   if (othersOnly) {
  //     socket.to(roomId).emit(channel, payload);
  //   } else {
  //     socket.in(roomId).emit(channel, payload);
  //   }
  // };

  //   socket.on("gameSend", joinObj => {
  //     console.log("message received from" + joinObj.senderId);

  //     // if the received password matches the host password -> start game
  //     if (socketData.inGame === false && socketData.password !== "") {
  //       console.log("message success from" + joinObj.senderId);

  //       setSocketData({ ...socketData, opponentSocketId: joinObj.senderId });
  //       let newObj = {
  //         usrId: socketData.userSocketId,
  //         ownerId: joinObj.senderId,
  //         recipientColor: socketData.opponentColor,
  //         opponentColor: socketData.userColor,
  //       };
  //       // this sends a final handshake to the person joining the host's game via password

  //       socket.emit("finalShake", newObj);
  //       updateSocketData({ target: "inGame", value: true });
  //       // this.setState({ inGame: true }); // renders the chessboard for the host
  //     }
  //   });

  //   socket.on("NewCurrentPosition", FENstring => {
  //     //updates the new current chess position
  //     this.setState({ currentPositionFen: FENstring });
  //   });
  //   socket.on(socketId, oppObj => {
  //     console.log("final shake ");
  //     this.setState({ opponentSocketId: oppObj.usrId }); // receives final handshake
  //     this.setState({ userColor: oppObj.recipientColor });
  //     this.setState({ opponentColor: oppObj.opponentColor });
  //     this.setState({ inGame: true });
  //     this.setState({ currentPositionFen: socketData.chessGameObject.fen() });
  //   });

  //   // when a new fen is received, (that is validated by the sender) : update the recipient fen
  //   socket.on("NewFenFromServer", FENobj => {
  //     // checks if the FEN is intended for the recipient
  //     if (socketData.userSocketId === FENobj.RecipientSocketID) {
  //       this.setState({
  //         currentPositionFen: FENobj.FEN,
  //       });
  //       socketData.chessGameObject.move(FENobj.move);

  //       // this means the game has ended
  //       if (socketData.chessGameObject.game_over() === true) {
  //         console.log("GAME OVER");
  //         //trigger modal and end the game
  //       }
  //     }
  //   });

  const lobbyJoinEmit = profile => {
    socket.emit("lobbyJoined", profile);
  };

  const lobbyLeaveEmit = profile => {
    socket.emit("lobbyLeft", profile);
  };

  const roomJoinEmit = (roomId, type) => {
    socket.emit("joinedRoom", roomId, type);
  };

  const roomLeaveEmit = (roomId, socketId) => {
    socket.emit("leftRoom", roomId, socketId);
  };

  const onMoveEmit = (roomId, socketId, move) => {
    socket.emit("onMove", roomId, socketId, move);
  };

  return {
    updateSocketData,
    lobbyJoinEmit,
    lobbyLeaveEmit,
    roomJoinEmit,
    roomLeaveEmit,
    onMoveEmit,
  };
};

export default useSocket;
