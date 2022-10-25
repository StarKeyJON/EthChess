const { ethers, getNamedAccounts } = require("hardhat");
// const { expect } = require("chai");

describe("ETH Chess Leagues", function () {
  let ethChessLeagues;
  let ethChessNFTs;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("ETHChessLeagues Test Deploying", function () {
    it("Should deploy ETHCHessNFTs", async function () {
      const { deployer } = await getNamedAccounts();
      const ETHChessNFTs = await ethers.getContractFactory("ETHChessNFTs");

      ethChessNFTs = await ETHChessNFTs.deploy(
        deployer,
        deployer,
        "TESTBASEURI"
      );
    });
    it("Should deploy ETHCHess Leagues", async function () {
      const ETHChessLeagues = await ethers.getContractFactory(
        "ETHChessLeagues"
      );

      ethChessLeagues = await ETHChessLeagues.deploy(ethChessNFTs.address);
    });
  });
  describe("safeMint", function () {
    it("Should be able to mint ETH Chess NFTs", async function () {
      const [test1] = await ethers.getSigners();
      // const ETHChessNFTs = await ethers.getContractFactory("ETHChessNFTs");
      await ethChessNFTs.connect(test1).safeMint(test1.address, 6, {
        value: ethers.utils.parseUnits(".06", "ether"),
      });
    });
  });

  describe("createLeague", function () {
    it("Should be able to create a new ETH Chess League", async function () {
      const [test1] = await ethers.getSigners();
      await ethChessLeagues
        .connect(test1)
        .createLeague("Test-League", 4, true, [], [test1.address]);
    });
  });
});
