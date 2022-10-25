import React from "react";

const Jackpot = ({ firstPlace = "$100,000.00", secondPlace = "$50,000.00", thirdPlace = "$10,000.00" }) => {
  return (
    <>
      <div>🥇 - {firstPlace} - 🥇</div>
    </>
  );
};

export default Jackpot;
