/* eslint-disable prettier/prettier */
require('dotenv').config();
const http = require("http");
const express = require("express");
const GUN = require("gun");
const { Chess } = require('chess.js');

const app = express(); // creating instance of express
const server = http.createServer(app); // creating http server from express instance & enabling cross access origin resource sharing

const awsKey = process.env.SERVER_ACCESS_KEY_ID;
const awsSecret = process.env.SERVER_SECRET_ACCESS_KEY;
const awsBucket = process.env.SERVER_BUCKET;

const GUNKEY = "eth-chess-v0.1.15";

const gun = new GUN({
  peers: [
    "https://phunky-gun-db.herokuapp.com/gun",
    "https://gun-ckx8k.ondigitalocean.app/gun",
  ],
  axe: false,
  rad: false,
  localStorage: false,
  s3: {
    key: awsKey, // AWS Access Key
    secret: awsSecret, // AWS Secret Token
    bucket: awsBucket, // The bucket you want to save into
  },
});

let game = new Chess();

const URLfrontEnd = process.env.URL_FRONTEND;
const io = require("socket.io")(server, {
  cors: {
    // this is required or else you will receive a CORS error, if you are using v3 of socket.io
    origin: URLfrontEnd,
    methods: ["GET", "POST"],
  },
}); // creating socketio server side with express http server

let lobbyObject = {
    players: {},
    skirmishes: {},
    matches: {},
    deathmatches: {},
    tournaments: {},
    rooms: {},
}

  io.on("connection", socket => {
    if(lobbyObject.players[socket.id] === undefined) {
        lobbyObject.players[socket.id] = {
            active: false,
            rooms: { 
              [socket.id]: {
                connected: true,
            },
          }
        };
    }

    
  const emitter = (roomId, channel, payload, othersOnly) => {
    if (othersOnly) {
      socket.to(roomId).emit(channel, payload);
    } else {
      io.in(roomId).emit(channel, payload);
    }
  };

  // Register profile, find game or create new game if none
  socket.on("lobbyJoined", (playerInfo) => {
    if(playerInfo){
        lobbyObject.players[socket.id] = { 
          active: true, 
          profile: playerInfo, 
          socketId: socket.id, 
          gunKey: playerInfo.uuid, 
          rooms: {
            [socket.id]: {
              connected: true,
            },
          }, 
        };
        lobbyObject.skirmishes[socket.id] = { 
          active: true, 
          player1: socket.id, 
          players: 1 
        };
    }
  });

  socket.on("leftLobby", () => {
    let k = lobbyObject.players[socket.id];
    if(k){
          gun.get(GUNKEY).get("chessLobby").get(socket.id).put({ active: false });
          gun.get(GUNKEY).get("skirmishes").get(socket.id).put({ active: false });
        }
    k.rooms = { 
      [socket.id]: {
        connected: true,
      }, };
    k.active = false;
    
  });

  socket.on("newRoom", (roomId, type, state) => {
    socket.join(roomId);
    lobbyObject.players[socket.id].rooms[roomId] = {connected: true};
    lobbyObject.rooms[roomId] = { 
      players: 1, 
      player1: socket.id, 
      player2: "",
      state: state,
      type: type,
    };
  })

  socket.on("joinedRoom", (roomId, type) => {
    let room = lobbyObject.rooms[roomId];
    let joined = lobbyObject.players[socket.id].rooms[roomId];
    socket.join(roomId);
    if(!room) {
        room = lobbyObject.rooms[roomId] = { players: 1, player1: socket.id, player2: "", state: {} };
     };
    if(room.players < 2){
      if (!joined){
        lobbyObject.players[socket.id] = {
          rooms: { [roomId]: {
            connected: true,
        }, }
      };
      } else if(!joined.connected) {
        socket.join(roomId);
        lobbyObject.players[socket.id].rooms[roomId].connected = true;
      }
        if(socket.id !== roomId){
          room.player2 = socket.id;
          room.players = room.players + 1;
          room.state.player2 = socket.id;
          gun.get(GUNKEY).get("skirmishes").get(roomId).put({player2: socket.id});
            emitter(roomId, "setOpponent", socket.id, false);
        } else {
          emitter(roomId, "playerJoined", socket.id, true);
        }
    } else {
        io.in(roomId).emit("roomFull", socket.id);
    };
  });

  socket.on("leftRoom", (roomId, type) => {
    let room = lobbyObject[type]?.[roomId];
    if(room?.player1 === roomId) {
        room = null;
        gun.get(GUNKEY).get("skirmishes").get(roomId).put({active: false});
        gun.get(GUNKEY).get("chessLobby").get(roomId).put({ active: false });
    } else if(room?.player2 === socket.id){
        room.player2 = "";
    }
    if(lobbyObject.players[socket.id].rooms[roomId]){
      lobbyObject.players[socket.id].rooms[roomId].connected = false;
    }
    socket.leave(roomId);
  });

  socket.on("handShake", (roomId, type, ack) => {
    let room = lobbyObject.rooms[roomId];
    if (room){
      if(room.player1 === ack) {
        io.in(roomId).emit("handShaken", socket.id, "p1");
      }
      if(room.player2 === ack) {
        io.in(roomId).emit("handShaken", socket.id, "p2");
      }
    }
    if (room === undefined){
        return
    }
  });

  /**
   * roomId: Id of the initial room
   * player: socket.id of the player connecting
   * type: type of match
   */
  socket.on("opponentSet", (roomId, player, type) => {
    let room = lobbyObject.rooms[roomId];
    socket.join(roomId);
    if (!room) {
      lobbyObject.rooms[roomId] = { players: 1, player1: roomId, player2: socket.id, state: { player1: roomId, player2: socket.id } };
      emitter(roomId, "playerJoined", socket.id, false);
    } else {
      if(player !== roomId || player !== room.player1) {
        room.player2 = player;
        room.state.player1 = roomId;
        room.state.player2 = player;
        gun.get(GUNKEY).get("skirmishes").get(roomId).put({ player2: player });
        io.in(roomId).emit("setOpponent", roomId, player);
      }
    }
});

// socket.on("gameCanceled", (gameId) => {
//   console.log("game canceled!")
// })


  socket.on("onMove", (gameId, profile, move) => {
    if (move.lastFen) {
      game.load(move.lastFen);
    } else {
        game = new Chess();
    }
    let sMove = JSON.parse(move.move);
    let theMove;
    if (sMove[2]){
        theMove = game.move({from: sMove[0], to: sMove[1], promotion: sMove[2]});
    } else {
        theMove = game.move({from: sMove[0], to: sMove[1]});
    }
    if(theMove === null){
      socket.to(profile).emit("illegalMove", profile, move);
    } else {
      gun.get(GUNKEY).get("skirmishes").get(gameId).get("move").put(move);
      gun.get(GUNKEY).get("skirmishHistory").get(gameId).set(move);
      io.in(gameId).emit("playerMoved", { profile: profile, move: move });
    }
  });

  // socket.on('message', messageObj => {
  //   messageObj.timestamp = new Date().toLocaleTimeString();
    // emitter(roomId, 'message', messageObj);
  // });

  socket.on('disconnect', () => {
    gun.get(GUNKEY).get("skirmishes").get(socket.id).get("active").put( false );
    gun.get(GUNKEY).get("chessLobby").get(socket.id).get("active").put( false );
    lobbyObject.skirmishes[socket.id] = null;
    lobbyObject.players[socket.id] = null;
  });

  socket.on("finalShake", Object => {
    socket.broadcast.emit(Object.ownerId, Object);
  });

  socket.on("JoinGame", joinObject => {
    socket.broadcast.emit("gameSend", joinObject);
  });
  socket.on("PositionSend", FENinfo => {
    socket.broadcast.emit("NewFenFromServer", FENinfo);
  });

});
const PORT = 8080;

server.listen(PORT, () => console.log(`Server running on port:${PORT}`));
