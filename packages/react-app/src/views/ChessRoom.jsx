import { Button, Col, Row } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import Game from "../components/ChessComponents/ChessBoard/ChessBoard";



const ChessRoom = ({ startTime, address, userSigner, price, tx, writeContracts, readContracts, gun }) => {
  return (
    <>
      <div style={{ marginTop: 40 }}>
        <div>
          <h3>Practice against naive AI</h3>
          <Link to="/match/ai"><Button size="large">♖</Button></Link>
        </div>
        <Row>
          <Col flex="auto">
            <Game
              startTime={startTime}
              address={address}
              userSigner={userSigner}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              gun={gun}
            />
          </Col>
          <Col flex="auto">
            {/* <PvP
              startTime={startTime}
              address={address}
              userSigner={userSigner}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              gun={gun}
            /> */}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ChessRoom;
