import { Button, Card, Image } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import bitcoin from "../assets/bitcoin.jpg";
import { LeaguesTable } from "../components/NFTHolders/LeagueComponents";
import "./styles/leagues.css";
const Leagues = () => {
  const styles = {
    NFTs: {
      margin: "10px",
      maxWidth: "500px",
      gap: "10px",
    },
  };

  return (
    <>
      <div style={{ marginTop: "100px"}}>
        <LeaguesTable />
      </div>
      <div className="mint">
        <Card>
          <h3>Mint an ETH-Chess NFT to create Leagues & enter League Tournaments!</h3>
          <div style={styles.NFTs}>
            <Card>
              <Image preview={false} sizes="small" src={bitcoin} alt="ETH-Chess NFT" />
            </Card>
          </div>
          <Link to="/mint">
            Mint now for .01 ETH <Button>Mint!</Button>
          </Link>
        </Card>
      </div>
      <div style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
        <Card>
          <p>
            By holding an ETH-Chess NFT you are eligible to vote in disputed claims and community decisions,
            <br />
            create new leagues and tournaments as well as compete in top prizes!
          </p>
        </Card>
      </div>
    </>
  );
};

export default Leagues;
