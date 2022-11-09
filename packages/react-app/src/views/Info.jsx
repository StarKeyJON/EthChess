import { Card, Col, Divider, Image, Row, Space } from "antd";
import React from "react";
import "./styles/info.css";
import logic from "../assets/chessGirl.jpg";
import boy from "../assets/chessBoy.jpg";
import crypto from "../assets/cryptocurrencyChess.jpg";
import bitcoin from "../assets/bitcoin.jpg";
import justice from "../assets/justice.jpg";

const Info = () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("showInfo");
      } else {
        entry.target.classList.remove("showInfo");
      }
    });
  });
  const hiddenInfoElements = document.querySelectorAll(".hiddenInfo");
  hiddenInfoElements.forEach(element => observer.observe(element));
  return (
    <>
      <div>
        <div className="logic startcontainer">
          <h1>How Does ♘ ETH-Chess Work?</h1>
          <Row>
            <Col flex="auto">
              <Image
                preview={false}
                style={{ marginLeft: 40, width: "80%" }}
                src={logic}
                alt="Dreamtime landscape image of girl thinking about chess"
              />
            </Col>
            <Col flex="auto">
              <Space>
                <Card>
                  <h3>♖ Logic</h3>
                  <p>ETH-Chess allows for decentralized wagered chess matches and tournaments by cryptographic tooling.
                    <br/>
                  </p>
                  <h4>Technologies Used:</h4>
                  <p>
                    ETH-Chess uses the Ethereum blockchain as the initiation and settlement chain for all matches.
                    <br />
                    The chess gameplay is built around the{" "}
                    <a href="https://github.com/jhlywa/chess.js/blob/master/README.md">chess.js</a> library logic.
                    <br />
                    <a href="https://ipfs.io">IPFS </a>is used for an external immutable storage system.
                    <br />
                    <a href="https://gun.eco/docs/">Gun.js</a> is used for a p2p cryptographic database and
                    cyber-security system!
                  </p>
                  <Divider />
                </Card>
              </Space>
            </Col>
          </Row>
        </div>
        <div style={{ backgroundImage: `url(${crypto})` }} className="container">
          <Space>
            <Card style={{ margin: 100 }}>
              <h3>♗ Matches</h3>
              <p>- A Player Initiates a competition by entering an amount to wager.</p>
              <p>
                - Any player can Start the match by taking the first move and matching the wagered amount of Player1.
                <br /> The initial IPFS hash of the gameplay state is saved to the blockchain along with the players
                addresses.
              </p>
              <p>- Each move taken is saved to IPFS and each users P2P profile for continuity.</p>
              <p>
                - The winner of the match can initiate a claim process and supply the final IPFS hash with the wagered
                amount as a security deposit.
                <br />
              </p>
              <p>
                If a dispute is not raised within 7 ethereum blocks, the winner can then retrieve the rewards + security
                deposit.
              </p>
              <p>
                - If a dispute is raised, the disputer enters their IPFS hash + double the total amount of gameplay
                rewards.
                <br /> Holders of ETH-Chess NFTs can vote to settle the dispute by reviewing the imutable history of
                IPFS and gun.js.
                <br />
                If the dispute is false, the dispute fund security is slashed and sent to the rewards pot and to the
                voters.
                <br />
                If the dispute is true, the security deposit gets sent to the rewards pot and to the voters.
              </p>
              <Divider />
            </Card>
          </Space>
        </div>
        <div className="deathmatch container">
          <Row>
            <Col flex="auto">
              <Space>
                <Card>
                  <h3>♘ DeathMatches</h3>
                  <p>
                    Players can enter DeathMatch competitions vs random players from around the world.
                    <br /> - Any player can initiate a deathmatch competition by setting the wagered amount to enter.
                    <br /> - Competitors pay the entry wager per round and have 1 shot to win.
                    <br /> If the competitor wins, they become the new Reigning Champion.
                    <br /> - The first Reigning Champion to beat 3 straight opponents wins 50% of the Rewards pool + the
                    DeathMatch bets!
                  </p>
                </Card>
              </Space>
            </Col>
            <Col flex="auto">
              <Image
                preview={false}
                style={{ marginLeft: 40, width: "80%" }}
                src={boy}
                alt="Young chess prodigy facing multiple competitors"
              />
            </Col>
          </Row>
        </div>
        <div className="NFTs container">
          <div>
            <Image preview={false} alt="Bitcoin chess piece" src={bitcoin} />
          </div>
          <Space>
            <Card>
              <h3>♔ NFTs</h3>
              <p>
                ETH-Chess NFTs can be minted and used to resolve match dispute in exchange for settlements.
                <br /> - Majority portion of the mint proceeds goes to the Rewards pool for DeathMatch winners.
                <br /> Only holders of ETH-Chess NFTs can resolve disputes.
              </p>
              <Divider />
            </Card>
          </Space>
        </div>
        <div className="fee container">
          <Space>
            <Image style={{ width: 100 }} src={justice} preview={false} alt="Scales of justice" />
            <br />
            <Card>
              <h3>Fee Schedule</h3>
              <p>
                There is a 10% fee for all final settlements that goes to the DeathMatch rewards pool.
                <br />
                There is no fee charged on refunds and security deposits.
              </p>
            </Card>
          </Space>
        </div>
      </div>
    </>
  );
};

export default Info;
