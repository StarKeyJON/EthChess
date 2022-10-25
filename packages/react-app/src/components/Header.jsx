import React, { useEffect, useRef } from "react";
import { Avatar, Image, Typography } from "antd";
import Horse from "../assets/WhiteKnight.png";
import ethlogo from "../assets/ethereumLogo.png";

const { Title, Text } = Typography;

// displays a page header

export default function Header({ link, title, subTitle, ...props }) {


  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "start" }}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Title level={4} style={{ margin: "0 0.5rem 0 0" }}>
            <Image
              preview={false}
              alt="Ethereum Logo"
              style={{ width: 20, marginTop: 15, marginBottom: -5 }}
              src={ethlogo}
            />
            ETH-Chess
            <Image
              preview={false}
              alt="ETH-Chess horse piece header image"
              style={{ height: 30, width: 30, marginTop: 15, marginBottom: -5 }}
              src={Horse}
            />
          </Title>
        </a>
        <Text type="secondary" style={{ textAlign: "left" }}>
          {subTitle}
        </Text>
      </div>
      {props.children}
    </div>
  );
}

Header.defaultProps = {
  link: "https://ethchess.com",
  subTitle: "Chess tournaments and competitions settled on chain",
};
