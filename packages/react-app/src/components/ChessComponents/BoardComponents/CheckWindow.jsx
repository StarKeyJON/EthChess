const CheckWindow = ({ inCheck, socketId }) => {
  if (inCheck[1] === socketId) {
    return <h1>You are in Check! </h1>;
  } else {
    return <h1>Opponent in check!</h1>;
  }
};

export default CheckWindow;
