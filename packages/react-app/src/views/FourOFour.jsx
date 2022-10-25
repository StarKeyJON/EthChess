import React from "react";
import chessPicture from "../assets/monkey-chess.jpg";

const FourOFour = () => {
  return (
    <>
      <h2 style={{ margin: "1.7rem", marginTop: 100 }}>Oh snap! Page doesn't exist!</h2>

      <div className="picture" style={{marginBottom: 300}}>
        <img className="cover" src={chessPicture} style={{ width: "20rem" }} alt="404" />
      </div>
    </>
  );
};

export default FourOFour;
