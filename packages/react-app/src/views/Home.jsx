import { Card, Button, Row, Col, Image, Avatar, Space } from "antd";
import { LeaderBoard } from "../components/HomeComponents/LeaderBoard";
import monkey from "../assets/monkey-chess.jpg";
import { Link } from "react-router-dom";
import "./styles/home.css";
import "./styles/animated.css";
import { Jackpot } from "../components";
import { Tournaments } from "../components/TournamentComponents";
import ethlogo from "../assets/ethereumLogo.png";
import bitcoin from "../assets/bitcoin.jpg";
import security from "../assets/cyber-security.jpg";
import { TbCurrencyEthereum } from "react-icons/tb";

/**
 * @param {*} address address of player connected
 * @param {*} players array of active players
 * @returns react component
 **/
function Home({ gun, address, timeStamp }) {
  const styles = {
    NFTs: {
      margin: "10px",
      maxWidth: "500px",
      gap: "10px",
    },
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show");
      }
    });
  });
  const hiddenElements = document.querySelectorAll(".hidden");
  hiddenElements.forEach(element => observer.observe(element));

  return (
    <div>
      <div>
        <div style={{ marginTop: 32 }}>
          <h1>
            <span
              className="highlight"
              style={{
                marginLeft: 4,
                /* backgroundColor: "#f9f9f9", */ padding: 4,
                borderRadius: 4,
                fontWeight: "bolder",
              }}
            >
              <span style={{ marginRight: 8 }}>♖</span>
              Welcome to
              <TbCurrencyEthereum /> ETH Chess!
              <span style={{ marginLeft: 8 }}>♖</span>
            </span>
          </h1>
          <div style={{ fontSize: "16px" }}>
            <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} />
            An Ethereum settled chess tournament platform!
            <Avatar src={<Image preview={false} style={{ width: 10 }} src={ethlogo} />} />
          </div>
        </div>
        <Row>
          <Col flex="auto">
            <Image
              style={{ marginTop: 40 }}
              preview={false}
              alt="Monkey playing chess with frustrated gentleman"
              src={monkey}
            />
          </Col>
          <Col flex="auto">
            <div style={{ marginTop: 90 }} className="hidden">
              <div style={{ margin: 30 }}>
                <h4>Practice against a naive AI!</h4>
                <Link to="/match/ai">
                  <Button type="primary" size="large">
                    ♙
                  </Button>
                </Link>
              </div>
              <div style={{ margin: 30 }}>
                <h4>Play against competitors from around the world!</h4>
                <Link to={"/lobby"}>
                  <Button type="primary" size="large">
                    ♙
                  </Button>
                </Link>
              </div>
              <div style={{ margin: 30 }}>
                <h4>Connect your crypto wallet and create a profile to compete!</h4>
                <Link to="/profile">
                  <Button type="primary" size="large">
                    ♘
                  </Button>
                </Link>
              </div>
              <p>
                Compete against players from around the world in unwagered skirmishes
                <br />
                wagered matches and competitive deathmatches.
              </p>
            </div>
          </Col>
        </Row>
      </div>
      <div className="jackpot">
        <Card style={{ color: "white", backgroundImage: `url(${bitcoin})` }}>
          <h1 style={{ color: "white" }}>🏆 Total DeathMatch Rewards Pot! 🏆</h1>
          <p>**current stats are placeholders**</p>
          <Jackpot />
        </Card>
      </div>
      {/* <div className="tournaments">
        <Tournaments address={address} />
      </div> */}
      <div className="leaderboard">
        <LeaderBoard address={address} />
      </div>
      <div style={{ marginTop: 200 }}></div>
      <div className="hidden">
        <Space>
          <Card>
            <h1>⚔️ Challenge the World in Chess</h1>
            <h5>
              Connect an ETH wallet.
              <br />
              Initiate a new Match + set entry fee.
              <br />
              Compete against a random opponent!
            </h5>
          </Card>
        </Space>
      </div>
      <div style={{ marginTop: 200 }}></div>
      <div className="hidden">
        <Space>
          <Card>
            <h1>💀 Compete in DeathMatch Competitions</h1>
            <h5>
              Initiate a new DeathMatch + set entry fee.
              <br />
              Compete against a random opponent!
              <br />
              Beat three opponents in a row and win!
            </h5>
          </Card>
        </Space>
      </div>
      <div style={{ marginTop: 200 }}></div>
      <div>
        <Space>
          <div className="hidden">
            <Card>
              <h3>Mint ETH-Chess NFTs to settle Match Disputes and receive settlement funding for voting!</h3>
              <div style={styles.NFTs}>
                <Card>
                  <Image preview={false} sizes="small" src={bitcoin} alt="Bitcoin chess piece" />
                </Card>
              </div>
              <Link to="/mint">
                Mint now for .01 ETH <Button>Mint!</Button>
              </Link>
            </Card>
          </div>
        </Space>
      </div>
      <div style={{ marginTop: 200 }}></div>
      <div>
        <Space>
          <div className="hidden">
            <Card>
              <Image preview={false} sizes="large" src={security} alt="Cyber Security image" />
              <p>
                Your security and privacy is paramount in this age of information.
                <br /> Only an ETH address is needed to create a profile. Disclose only the information that you feel
                necessary.
              </p>
              <p>
                Gameplay state across players is secured using advanced offchain cryptographic protocols.
                <br />
                Each move is saved immutably to each users space, as well as to IPFS for future review.
              </p>
              <p>Be assured of the security by the time tested use of cryptographic protocols.</p>
            </Card>
          </div>
        </Space>
      </div>
      <div style={{ marginTop: 200 }}></div>
    </div>
  );
}

export default Home;
