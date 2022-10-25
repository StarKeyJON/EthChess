import { Image } from "antd";
import React from "react";
import bitcoin from "../assets/bitcoin.jpg";

const Mint = () => {
  return (
    <>
      <h1>Mint</h1>
      <div>
        <Image src={bitcoin} alt=""/>
      </div>
    </>
  );
};

export default Mint;
