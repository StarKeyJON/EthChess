import React from "react";
import { Chess } from "chess.js";
import "./game.css";
import BlackKing from "../../../assets/images/BlackKing.png";
import BlackBishop from "../../../assets/images/BlackBishop.png";
import WhiteKing from "../../../assets/images/WhiteKing.png";
import WhiteBishop from "../../../assets/images/WhiteBishop.png";
import BlackPawn from "../../../assets/images/BlackPawn.png";
import BlackQueen from "../../../assets/images/BlackQueen.png";
import BlackKnight from "../../../assets/images/BlackKnight.png";
import WhitePawn from "../../../assets/images/WhitePawn.png";
import WhiteQueen from "../../../assets/images/WhiteQueen.png";
import WhiteKnight from "../../../assets/images/WhiteKnight.png";
import BlackRook from "../../../assets/images/BlackRook.png";
import WhiteRook from "../../../assets/images/WhiteRook.png";
import Empty from "../../../assets/images/Empty.png";
import Text from "antd/lib/typography/Text";

class Square extends React.Component {
  calculateColor() {
    var color = "#a1601b";
    if ((this.props.row + this.props.col) % 2 === 0) {
      color = "#c09567";
    }
    return color;
  }

  onDragOver(ev) {
    ev.preventDefault();
  }

  onDragStart(ev, id) {
    ev.dataTransfer.setData("id", id);
    ev.dataTransfer.setData("row", this.props.row);
    ev.dataTransfer.setData("col", this.props.col);
  }

  constructor(props) {
    super(props);
    this.state = {
      color: this.calculateColor(),
    };
  }

  render() {
    return (
      <button
        className="square"
        style={{ backgroundColor: this.state.color }}
        onClick={() => this.props.onClick()}
        onDragOver={ev => this.onDragOver(ev)}
        onDrop={ev => this.props.onDrop(ev)}
      >
        <img
          draggable="true"
          style={{ height: "80px", width: "80px" }}
          onDragStart={ev => this.onDragStart(ev, this.props.value)}
          src={this.props.value}
          alt="Chess piece"
        ></img>
      </button>
    );
  }
}

class Row extends React.Component {
  renderSquare(i) {
    return (
      <Square
        row={this.state.num}
        col={i}
        value={this.state.value[i]}
        onClick={() => this.props.onClick(this.state.num, i)}
        onDrop={ev => this.props.onDrop(this.state.num, i, ev)}
      />
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      num: this.props.num,
      value: this.props.value,
    };
  }

  render() {
    return (
      <div className="row">
        {this.renderSquare(0)}
        {this.renderSquare(1)}
        {this.renderSquare(2)}
        {this.renderSquare(3)}
        {this.renderSquare(4)}
        {this.renderSquare(5)}
        {this.renderSquare(6)}
        {this.renderSquare(7)}
      </div>
    );
  }
}

class Board extends React.Component {
  renderRow(i) {
    return (
      <Row
        num={i}
        value={this.state.board[i]}
        onClick={(k, j) => this.handleClick(k, j)}
        onDrop={(k, j, ev) => this.handleDrop(k, j, ev)}
      />
    );
  }

  constructor(props) {
    super(props);
    console.log(props);
    var board = JSON.parse(props.state);
    this.state = {
      loc: [0, 1, 2, 3, 4, 5, 6, 7],
      col: [8, 7, 6, 5, 4, 3, 2, 1],
      row: ["a", "b", "c", "d", "e", "f", "g", "h"],
      lastMove: board.lastMove,
      chess: new Chess(),
      board: board.board,
      clicked: 0,
      clickedLocation: [0, 0],
      selected: [0, 0],
      turn: "Black",
      nonce: 1,
      hasKingMoved: [false, false],
      haveRooksMoved: [false, false, false, false],
      isInCheck: [false, null],
      FEN: board.FEN,
      PGN: null,
      gameOver: false,
      gameStore: this.state?.gun.get("best-of-chess").get(props.gameId),
      startTime: board.startTime,
      gun: props.gun,
      player1: board.player1,
      player2: props.address,
      gameId: board.gameId,
    };
  }

  handleClick(k, j) {
    const clicked = this.state.clicked;
    if (!this.state.chess.isGameOver()) {
      if (!this.state.turn === "White") {
        return;
      }
      if (this.state.clicked % 2 === 0) {
        this.setState({ clickedLocation: [k, j] });
        this.setState({ clicked: clicked + 1 });
      } else {
        var [row, col] = this.state.clickedLocation;
        var piece = this.state.board[row][col];
        var fenC = this.state.row[col];
        var fenR = this.state.col[row];
        var from = fenC + fenR;
        var to = this.state.row[j] + this.state.col[k];
        if (!this.state.chess.isGameOver()) {
          if (this.state.board[k][j] === piece) {
            this.setState({ clickedLocation: [k, j] });
            this.setState({ clicked: clicked + 1 });
          } else if (this.isLegal(row, col, k, j, piece, this.state.board)) {
            var move;
            if (k === 0 || k === 7) {
              if (piece === WhitePawn || piece === BlackPawn) {
                move = this.state.chess.move({ from: from, to: to, promotion: "q" });
              } else {
                move = this.state.chess.move({ from: from, to: to });
              }
            } else {
              move = this.state.chess.move({ from: from, to: to });
            }
            if (move === null) return;
            console.log(this.state.chess.ascii());
            this.movePiece(k, j, row, col, piece);
            var thefen = this.state.chess.fen();
            this.gameStore.get(this.state.nonce).put({
              nonce: this.state.nonce,
              k: k,
              j: j,
              row: row,
              col: col,
              piece: piece,
              FEN: thefen,
              board: JSON.stringify(this.state.board),
              player: this.state.player2,
              gameId: this.state.gameId,
            });
            if (k === 0 || k === 7) {
              if (piece === WhitePawn || piece === BlackPawn) {
                const newBoard = this.state.board.slice();
                let newPiece = this.isBlackPiece(piece) ? BlackQueen : WhiteQueen;
                newBoard[k][j] = newPiece;
                this.setState({ board: newBoard });
              }
            }
            this.setState({ FEN: thefen });
            this.setState({ clicked: clicked + 1 });
            this.state.isInCheck[0] && !this.state.chess.inCheck() && this.setState({ isInCheck: [false, null] });
            this.state.chess.inCheck() && this.setState({ isInCheck: [true, "Black"] });
            this.setState({ nonce: this.state.nonce + 1 });
            setTimeout(
              function () {
                // console.log("Rest")
                this.moveAi();
              }.bind(this),
              100,
            );
          }
        }
      }
    } else {
      this.setState({ gameOver: true });
    }
  }

  handleDrop(k, j, ev) {
    // console.log(k,j)
    var row = Number(ev.dataTransfer.getData("row"));
    var col = Number(ev.dataTransfer.getData("col"));
    var fenC = this.state.row[col];
    var fenR = this.state.col[row];
    var from = fenC + fenR;
    var to = this.state.row[j] + this.state.col[k];
    // console.log(from, to);
    // console.log(col, row)

    var piece = ev.dataTransfer.getData("id");
    if (!this.state.chess.isGameOver()) {
      // var moves = this.state.chess.moves({ verbose: true })
      // let {from: fromAI, to: toAI} = moves[0];
      // console.log("Moves: ",fromAI, toAI);

      var move;
      if (k === 0 || k === 7) {
        if (piece === WhitePawn || piece === BlackPawn) {
          move = this.state.chess.move({ from: from, to: to, promotion: "q" });
        } else {
          move = this.state.chess.move({ from: from, to: to });
        }
      } else {
        move = this.state.chess.move({ from: from, to: to });
      }
      console.log(this.state.chess.ascii());
      if (move === null) return;
      //   console.log(moves);
      if (this.isLegal(row, col, k, j, piece, this.state.board)) {
        this.movePiece(k, j, row, col, piece);
        var thefen = this.state.chess.fen();
        this.gameStore.get(this.state.nonce).put({
          nonce: this.state.nonce,
          k: k,
          j: j,
          row: row,
          col: col,
          piece: piece,
          FEN: thefen,
          board: JSON.stringify(this.state.board),
          player: this.state.player2,
          gameId: this.state.gameId,
        });
        if (k === 0 || k === 7) {
          if (piece === WhitePawn || piece === BlackPawn) {
            const newBoard = this.state.board.slice();
            let newPiece = this.isBlackPiece(piece) ? BlackQueen : WhiteQueen;
            newBoard[k][j] = newPiece;
            this.setState({ board: newBoard });
          }
        }
        this.setState({ FEN: thefen });
        this.state.isInCheck[0] && !this.state.chess.inCheck() && this.setState({ isInCheck: [false, null] });
        this.state.chess.inCheck() && this.setState({ isInCheck: [true, "Black"] });
        this.setState({ nonce: this.state.nonce + 1 });
        // console.log(k, j, row, col, piece)
        setTimeout(
          function () {
            //   console.log("Rest")
            this.moveAi();
          }.bind(this),
          100,
        );
      }
    } else {
      this.setState({ gameOver: true });
    }
  }

  moveAi() {
    if (!this.state.chess.isGameOver()) {
      var nonce = this.state.nonce + 1;
      this.gameStore.get(nonce).on(ack => {
        if (ack !== undefined) {
          if (ack.nonce === nonce) {
            var move;
            if (ack.k === 0 || ack.k === 7) {
              if (ack.piece === WhitePawn || ack.piece === BlackPawn) {
                move = this.state.chess.move({ from: ack.from, to: ack.to, promotion: "q" });
              } else {
                move = this.state.chess.move({ from: ack.from, to: ack.to });
              }
            } else {
              move = this.state.chess.move({ from: ack.from, to: ack.to });
            }
            if (move === null) return;
            this.movePiece(ack.k, ack.j, ack.row, ack.col, ack.piece);
            if (ack.k === 0 || ack.k === 7) {
              if (ack.piece === WhitePawn || ack.piece === BlackPawn) {
                const newBoard = this.state.board.slice();
                let newPiece = this.isBlackPiece(ack.piece) ? BlackQueen : WhiteQueen;
                newBoard[ack.k][ack.j] = newPiece;
                this.setState({ board: newBoard });
              }
            }
            this.setState({ FEN: this.state.chess.fen() });
            this.state.isInCheck[0] && !this.state.chess.inCheck() && this.setState({ isInCheck: [false, null] });
            this.state.chess.inCheck() && this.setState({ isInCheck: [true, "White"] });
            this.setState({ nonce: nonce });
          }
        }
      });
    } else {
      this.setState({ gameOver: true });
    }
  }

  movePiece(k, j, row, col, piece) {
    this.setState({ turn: this.isBlackPiece(piece) ? "White" : "Black" });
    const board = this.state.board.slice();
    board[k][j] = piece;
    board[row][col] = Empty;
    this.setState({ board: board });
  }

  isLegal(initRow, initCol, endRow, endCol, piece, board) {
    if (this.isBlackPiece(piece) !== (this.state.turn === "Black")) {
      return false;
    }
    if (piece === WhitePawn) {
      return this.checkWhitePawn(initRow, initCol, endRow, endCol, board);
    } else if (piece === BlackPawn) {
      return this.checkBlackPawn(initRow, initCol, endRow, endCol, board);
    } else if (piece === BlackBishop || piece === WhiteBishop) {
      return this.checkBishop(initRow, initCol, endRow, endCol, board, this.isBlackPiece(piece));
    } else if (piece === BlackKnight || piece === WhiteKnight) {
      return this.checkKnight(initRow, initCol, endRow, endCol, board, this.isBlackPiece(piece));
    } else if (piece === BlackQueen || piece === WhiteQueen) {
      return this.checkQueen(initRow, initCol, endRow, endCol, board, this.isBlackPiece(piece));
    } else if (piece === BlackRook || piece === WhiteRook) {
      return this.checkRook(initRow, initCol, endRow, endCol, board, this.isBlackPiece(piece));
    } else if (piece === BlackKing || piece === WhiteKing) {
      return this.checkKing(initRow, initCol, endRow, endCol, board, this.isBlackPiece(piece));
    }
  }

  checkWhitePawn(initRow, initCol, endRow, endCol, board) {
    if (initCol === endCol) {
      if (board[endRow][endCol] === Empty) {
        if (initRow === 6) {
          if (endRow === 5 || endRow === 4) {
            return true;
          }
        } else {
          if (endRow === initRow - 1) {
            return true;
          }
        }
      }
    } else if (endCol === initCol - 1 || endCol === initCol + 1) {
      if (endRow === initRow - 1 && this.isBlackPiece(board[endRow][endCol])) {
        return true;
      }
    }
    return false;
  }

  checkBlackPawn(initRow, initCol, endRow, endCol, board) {
    if (initCol === endCol) {
      if (this.isEmpty(board[endRow][endCol])) {
        if (initRow === 1) {
          if (endRow === 2 || endRow === 3) {
            return true;
          }
        } else {
          if (endRow === initRow + 1) {
            return true;
          }
        }
      }
    } else if (endCol === initCol - 1 || endCol === initCol + 1) {
      if (endRow === initRow + 1 && !this.isBlackPiece(board[endRow][endCol]) && !this.isEmpty(board[endRow][endCol])) {
        return true;
      }
    }
    return false;
  }

  checkBishop(initRow, initCol, endRow, endCol, board, color) {
    if (endRow > initRow) {
      if (endCol > initCol) {
        for (let i = 1; i <= 7 - Math.max(initRow, initCol); i++) {
          if (initRow + i === endRow && initCol + i === endCol) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow + i][initCol + i])) {
            return false;
          }
        }
      } else {
        for (let i = 1; i <= Math.min(7 - initRow, initCol); i++) {
          if (initRow + i === endRow && initCol - i === endCol) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow + i][initCol - i])) {
            return false;
          }
        }
      }
    } else {
      if (endCol > initCol) {
        for (let i = 1; i <= Math.min(initRow, 7 - initCol); i++) {
          if (initRow - i === endRow && initCol + i === endCol) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow - i][initCol + i])) {
            return false;
          }
        }
      } else {
        for (let i = 1; i <= Math.min(initRow, initCol); i++) {
          if (initRow - i === endRow && initCol - i === endCol) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow - i][initCol - i])) {
            return false;
          }
        }
        return false;
      }
    }
  }

  checkKnight(initRow, initCol, endRow, endCol, board, color) {
    if (
      (endRow === initRow + 2 && endCol === initCol + 1) ||
      (endRow === initRow + 2 && endCol === initCol - 1) ||
      (endRow === initRow - 2 && endCol === initCol + 1) ||
      (endRow === initRow - 2 && endCol === initCol - 1) ||
      (endRow === initRow + 1 && endCol === initCol + 2) ||
      (endRow === initRow + 1 && endCol === initCol - 2) ||
      (endRow === initRow - 1 && endCol === initCol + 2) ||
      (endRow === initRow - 1 && endCol === initCol - 2)
    ) {
      var endPos = board[endRow][endCol];
      if (!this.isEmpty(endPos)) {
        if (color !== this.isBlackPiece(endPos)) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }

  checkRook(initRow, initCol, endRow, endCol, board, color) {
    if (endCol === initCol) {
      if (endRow > initRow) {
        for (let i = 1; i <= endRow - initRow; i++) {
          // console.log(initRow+":"+initCol+":"+endRow+":"+endCol);
          if (initRow + i === endRow) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow + i][initCol])) {
            return false;
          }
        }
      } else {
        for (let i = 1; i <= initRow - endRow; i++) {
          if (initRow - i === endRow) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow - i][initCol])) {
            return false;
          }
        }
      }
    } else if (endRow === initRow) {
      if (endCol > initCol) {
        for (let i = 1; i <= endCol - initCol; i++) {
          if (initCol + i === endCol) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow][initCol + i])) {
            return false;
          }
        }
      } else {
        for (let i = 1; i <= initCol - endCol; i++) {
          if (initCol - i === endCol) {
            let endPos = board[endRow][endCol];
            return this.isSameColor(endPos, color);
          } else if (!this.isEmpty(board[initRow][initCol - i])) {
            return false;
          }
        }
      }
    }
    return false;
  }

  checkQueen(initRow, initCol, endRow, endCol, board, color) {
    if (
      this.checkRook(initRow, initCol, endRow, endCol, board, color) ||
      this.checkBishop(initRow, initCol, endRow, endCol, board, color)
    ) {
      return true;
    }
    return false;
  }

  checkKing(initRow, initCol, endRow, endCol, board, color) {
    if (
      (endRow === initRow + 1 && endCol === initCol + 1) ||
      (endRow === initRow + 1 && endCol === initCol) ||
      (endRow === initRow + 1 && endCol === initCol - 1) ||
      (endRow === initRow && endCol === initCol + 1) ||
      (endRow === initRow && endCol === initCol - 1) ||
      (endRow === initRow - 1 && endCol === initCol + 1) ||
      (endRow === initRow - 1 && endCol === initCol) ||
      (endRow === initRow - 1 && endCol === initCol - 1)
    ) {
      var endPos = board[endRow][endCol];
      if (!this.isEmpty(endPos)) {
        if (color !== this.isBlackPiece(endPos)) {
          this.setState({
            hasKingMoved: !color ? [true, this.state.hasKingMoved[1]] : [this.state.hasKingMoved[0], true],
          });
          return true;
        }
        return false;
      }
      this.setState({ hasKingMoved: !color ? [true, this.state.hasKingMoved[1]] : [this.state.hasKingMoved[0], true] });
      return true;
    } else if (
      endRow === initRow &&
      endCol === initCol + 2 &&
      !(color ? this.state.hasKingMoved[1] : this.state.hasKingMoved[0]) &&
      this.isEmpty(board[initRow][initCol + 1]) &&
      this.isEmpty(board[initRow][initCol + 2]) &&
      !(color ? this.state.haveRooksMoved[3] : this.state.haveRooksMoved[1])
    ) {
      this.setState({ hasKingMoved: !color ? [true, this.state.hasKingMoved[1]] : [this.state.hasKingMoved[0], true] });
      this.movePiece(endRow, endCol - 1, initRow, endCol + 1, color ? BlackRook : WhiteRook);
      return true;
    } else if (
      endRow === initRow &&
      endCol === initCol - 2 &&
      !(color ? this.state.hasKingMoved[1] : this.state.hasKingMoved[0]) &&
      this.isEmpty(board[initRow][initCol - 1]) &&
      this.isEmpty(board[initRow][initCol - 2]) &&
      this.isEmpty(board[initRow][initCol - 3]) &&
      !(color ? this.state.haveRooksMoved[2] : this.state.haveRooksMoved[0])
    ) {
      this.setState({ hasKingMoved: !color ? [true, this.state.hasKingMoved[1]] : [this.state.hasKingMoved[0], true] });
      this.movePiece(endRow, endCol + 1, initRow, endCol - 2, color ? BlackRook : WhiteRook);
      return true;
    }
    return false;
  }

  isBlackPiece(piece) {
    if (
      piece === BlackKing ||
      piece === BlackQueen ||
      piece === BlackKnight ||
      piece === BlackPawn ||
      piece === BlackRook ||
      piece === BlackBishop
    ) {
      return true;
    }
    return false;
  }

  isEmpty(piece) {
    return piece === Empty;
  }

  isSameColor(endPos, color) {
    if (!this.isEmpty(endPos)) {
      if (color !== this.isBlackPiece(endPos)) {
        return true;
      }
      return false;
    }
    return true;
  }

  render() {
    return (
      <div className="fullBoard">
        <div className="center">
          {this.renderRow(0)}
          {this.renderRow(1)}
          {this.renderRow(2)}
          {this.renderRow(3)}
          {this.renderRow(4)}
          {this.renderRow(5)}
          {this.renderRow(6)}
          {this.renderRow(7)}

          <h1 className="check">
            <br></br>
            {this.state.gameOver && "Game Over!"}
            {this.state.isInCheck[0] && <>{this.state.isInCheck[1]} is in Check!</>}
          </h1>
          <p className="turn">
            <br></br>
            {!this.state.gameOver && this.state.turn + "'s Turn"}
          </p>
          <p className="fen">
            <br></br>
            {this.state.FEN && (
              <>
                FEN: <Text copyable={true}>{this.state.FEN}</Text>
              </>
            )}
          </p>
          <div className="gameTime">
            Game:
            <br></br>
            <p style={{ fontStyle: "italic" }}>{this.state.gameId}</p>
            <br></br>
            Player1: {this.state.player1}
            <br></br>
            vs.
            <br></br>
            Player2: {this.state.player2}
          </div>
        </div>
      </div>
    );
  }
}

class Opponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gun: props.gun,
      gameId: props.gameId,
      board: props.board,
      address: props.address,
      time: props.startTime,
      contestant: props.contestant,
    };
  }
  render() {
    // console.log(gun);
    return (
      <Board
        gun={this.state.gun}
        gameId={this.gameId}
        board={this.state.board}
        startTime={this.state.time}
        address={this.state.address}
        contestant={this.state.contestant}
      />
    );
  }
}

export default Opponent;
// ReactDOM.render(
//     <Game />,
//     document.getElementById('root')
// );
