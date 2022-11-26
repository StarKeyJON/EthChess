import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import knightImg from "../assets/images/WhiteKnight.png";
import pawnImg from "../assets/images/WhitePawn.png";
import rookImg from "../assets/images/BlackRook.png";
import queenImg from "../assets/images/BlackQueen.png";
import { Avatar, Image } from "antd";

const usePieceBouncer = () => {
  const pawn = useRef(null);
  const rook = useRef(null);
  const knight = useRef(null);
  const queen = useRef(null);
  useEffect(() => {
    gsap.fromTo([rook.current], 0.5, { y: 18 }, { y: -18, yoyo: true, repeat: -1 });
    gsap.fromTo([pawn.current], 0.2, { y: 18 }, { y: -18, yoyo: true, repeat: -1 });
    gsap.fromTo([knight.current], 0.3, { y: -18 }, { y: 18, repeat: -1, yoyo: true });
    gsap.fromTo([queen.current], 0.9, { y: 18 }, { y: -18, yoyo: true, repeat: -1 });
  }, []);
  return (
    <>
      <h1 style={{ margin: 50 }}>
        Enabling Decentralized Database and Cryptographic Keypair for ETH-Chess Gameplay...
      </h1>
      <Avatar ref={pawn} size="small" src={<Image preview={false} src={pawnImg} />} />
      <Avatar ref={knight} size="small" src={<Image preview={false} src={knightImg} />} />
      <Avatar ref={rook} size="small" src={<Image preview={false} src={rookImg} />} />
      <Avatar ref={queen} size="small" src={<Image preview={false} src={queenImg} />} />
    </>
  );
};

export default usePieceBouncer;
