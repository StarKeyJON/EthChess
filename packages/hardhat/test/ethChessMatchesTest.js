const { ethers, getNamedAccounts } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("ETH Chess Matches Test", function () {
  let ethChessMatches;
  let ethChessNFTs;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("ETHChessMatches", function () {
    it("Should deploy ETHCHess", async function () {
      const { deployer } = await getNamedAccounts();
      const ETHChess = await ethers.getContractFactory("ETHChessMatches");

      ethChessMatches = await ETHChess.deploy(deployer);
    });
    it("Should deploy ETHCHessNFTs", async function () {
      const { deployer } = await getNamedAccounts();
      const ETHChessNFTs = await ethers.getContractFactory("ETHChessNFTs");

      ethChessNFTs = await ETHChessNFTs.deploy(
        deployer,
        deployer,
        "TESTBASEURI"
      );
    });

    describe("newNFTAddress", function () {
      it("Should be able to set the NFT Address in the Matches contract", async function () {
        await ethChessMatches.newNFTAddress(ethChessNFTs.address);
      });
    });

    describe("safeMint", function () {
      it("Should be able to mint ETH Chess NFTs", async function () {
        const [test3, test4, test5] = await ethers.getSigners();
        // const ETHChessNFTs = await ethers.getContractFactory("ETHChessNFTs");
        await ethChessNFTs.connect(test3).safeMint(test3.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test4).safeMint(test4.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test5).safeMint(test5.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
      });
    });

    describe("initMatch(bool specific, address comp)", function () {
      it("Should be able to initialize a new match", async function () {
        // const matchId = 1;

        await ethChessMatches.initMatch({
          value: ethers.utils.parseUnits(".1", "ether"),
        });
      });
    });

    describe("startMatch(uint matchId, string ipfsHash)", function () {
      it("Should be able to start an initialized match", async function () {
        // const matchId = 1;

        await ethChessMatches.startMatch(1, "testStartIPFSString", {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
      });
    });

    describe("startClaim(uint matchId, string startIpfsHash, string endIpfsHash, uint security)", function () {
      it("Should start a winning claim, returns success", async function () {
        const { deployer } = await getNamedAccounts();
        expect(
          await ethChessMatches.startClaim(
            1,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".1", "ether"),
            {
              value: ethers.utils.parseUnits(".1", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimStarted")
          .withArgs(deployer, 1, "StartHash", "EndHash", 0.1);
      });
    });

    describe("disputeClaim(uint matchId, string startIpfsHash, string endIpfsHash, uint dSecurity)", function () {
      it("Should start a winning claim dispute process, returns success", async function () {
        const { deployer } = await getNamedAccounts();

        expect(
          await ethChessMatches.disputeClaim(
            1,
            "StartHash",
            "DisputeHash",
            ethers.utils.parseUnits(".2", "ether"),
            {
              value: ethers.utils.parseUnits(".1", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimContested")
          .withArgs(deployer, 1, 1, "StartHash", "DisputeHash");
      });
    });

    describe("resolveDispute", function () {
      it("Should allow for voting on a disputed claim", async function () {
        const [test3, test4, test5] = await ethers.getSigners();
        await ethChessMatches.connect(test3).resolveDispute(1, false);
        await ethChessMatches.connect(test4).resolveDispute(1, false);
        await ethChessMatches.connect(test5).resolveDispute(1, true);
      });
    });

    describe("endMatch", function () {
      it("Should allow the second account that disputed the match to end with the initial claim being false", async function () {
        await helpers.mine(3);
        const [test2] = await ethers.getSigners();
        await ethChessMatches.connect(test2).endMatch(1, "TEST_END_IPFS_HASH");
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("Matches ", ethers.utils.formatEther(matchesHoldings));
      });
      // expect(
      //   await ethChessTreasury.viewHoldings()
      // )
    });

    describe("initDeathMatch(uint entranceFee)", function () {
      it("Should start a new DeathMatch competition, returns(success)", async function () {
        const { deployer } = await getNamedAccounts();
        expect(
          await ethChessMatches.initDeathMatch(
            ethers.utils.parseUnits(".5", "ether"),
            {
              value: ethers.utils.parseUnits(".5", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimContested")
          .withArgs(2, deployer);
      });
      it("Should start a winning claim for DeathMatch, returns success", async function () {
        const { deployer } = await getNamedAccounts();
        expect(
          await ethChessMatches.startClaim(
            2,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".5", "ether"),
            {
              value: ethers.utils.parseUnits(".5", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimStarted")
          .withArgs(deployer, 2, "StartHash", "EndHash", 0.5);
      });
    });

    describe("advanceDeathMatch(uint matchId, string ipfsHash)", function () {
      it("Should end the first DeathMatch matchround , returns success", async function () {
        // const { deployer } = await getNamedAccounts();

        await ethChessMatches.advanceDeathMatch(1, "EndHash", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should start a winning claim for DeathMatch second round", async function () {
        const { deployer } = await getNamedAccounts();
        expect(
          await ethChessMatches.startClaim(
            3,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".5", "ether"),
            {
              value: ethers.utils.parseUnits(".5", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimStarted")
          .withArgs(deployer, 3, "StartHash", "EndHash", 0.5);
      });
      it("Should end the second DeathMatch match round", async function () {
        // const { deployer } = await getNamedAccounts();

        await ethChessMatches.advanceDeathMatch(1, "EndHash", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should start a winning claim for the final DeathMatch round", async function () {
        const { deployer } = await getNamedAccounts();
        expect(
          await ethChessMatches.startClaim(
            4,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".5", "ether"),
            {
              value: ethers.utils.parseUnits(".5", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimStarted")
          .withArgs(deployer, 4, "StartHash", "EndHash", 0.5);
      });
      it("Should end the final DeathMatch match round", async function () {
        // const { deployer } = await getNamedAccounts();

        await ethChessMatches.advanceDeathMatch(1, "EndHash", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should display the final holdings of the contracts", async function () {
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("Matches ", ethers.utils.formatEther(matchesHoldings));
      });
    });
  });
});
