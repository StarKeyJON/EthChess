import { Divider } from "antd";
import { FaChess, FaChessBoard, FaChessKing, FaInfo, FaVoteYea } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { FaDiscord, FaTelegramPlane, FaTwitter, FaMediumM, FaSatelliteDish } from "react-icons/fa";
import image from "../assets/img.jpg";
function LinkFooter({ gun }) {
  return (
    <div style={{ marginBottom: 60, backgroundImage: `url(${image})`, color: "white" }}>
      <Divider />
      <div style={{ justifyContent: "left", alignItems: "left", display: "flex" }}>
        <ul>
          <li>
            <Link to="/">
              <FaChessBoard /> Home
            </Link>
          </li>
          <li>
            <Link to="/lobby">
              <FaChess /> Lobby
            </Link>
          </li>
          <li>
            <Link to="/disputes">
              <FaVoteYea /> Voting
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <FaChessKing /> Profile
            </Link>
          </li>
          <li>
            <Link to="/info">
              <FaInfo /> Info
            </Link>
          </li>
          <br />
        </ul>
      </div>
      <div>
        ETH-Chess 2022 <br />
      </div>
      <p>Thank you for visiting!</p>
      <p>Email ETHChess Developer: email@jonthedev.com</p>
      <p>This site does not contain 3rd party trackers. It does not collect your personal information.</p>
      <div>
        <br />
        Version: 0.0.175 (last updated: 9:50 PM Tuesday, September 20th, 2022 Coordinated Universal Time (UTC))
        <br />
        Soli Deo Gloria
      </div>
    </div>
  );
}

export default LinkFooter;
