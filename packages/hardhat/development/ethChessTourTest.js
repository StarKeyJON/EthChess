const { ethers, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");

describe("ETH Chess Tournaments", function () {
  let ethChessMatches;
  let ethChessNFTs;
  let ethChessLeagues;
  let ethChessTours;
  let ethChessTreasury;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("ETHChess", function () {
    it("Should deploy ETHCHess", async function () {
      const { deployer } = await getNamedAccounts();
      const ETHChess = await ethers.getContractFactory("ETHChessMatches");

      console.log(deployer);
      ethChessMatches = await ETHChess.deploy(deployer, deployer);
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
    it("Should deploy ETHCHess Leagues", async function () {
      const ETHChessLeagues = await ethers.getContractFactory(
        "ETHChessLeagues"
      );

      ethChessLeagues = await ETHChessLeagues.deploy(ethChessNFTs.address);
    });
    it("Should deploy ETHChessTournaments", async function () {
      const { deployer } = await getNamedAccounts();
      const ETHChessTours = await ethers.getContractFactory(
        "ETHChessTournaments"
      );
      ethChessTours = await ETHChessTours.deploy(
        deployer,
        ethChessNFTs.address
      );
    });
    it("Should deploy ETHChessTreasury", async function () {
      const { deployer } = await getNamedAccounts();
      const ETHChessTreasury = await ethers.getContractFactory(
        "ETHChessTreasury"
      );
      ethChessTreasury = await ETHChessTreasury.deploy(
        deployer,
        ethChessMatches.address,
        ethChessTours.address
      );
    });

    // Set the Treasury address to the Tournament and Matches contracts
    describe("newTreasuryAddress", function () {
      it("Should set the Treasury Address in the Matches contract", async function () {
        expect(
          await ethChessMatches.newTreasuryAddress(ethChessTreasury.address)
        ).to.emit(true);
      });
      it("Should set the Treasury Address in the Tournament contract", async function () {
        await ethChessTours.newTreasuryAddress(ethChessTreasury.address);
      });
    });

    // Set the Leagues address to the Tournament contract
    describe("newLeagueAddress", function () {
      it("Should be able to set the League address in the Tournament contract", async function () {
        await ethChessTours.newLeagueAddress(ethChessLeagues.address);
      });
    });

    // Mint NFTs
    describe("safeMint", function () {
      it("Should be able to mint 6 ETH Chess NFTs for 8 accounts", async function () {
        const [test1, test2, test3, test4, test5, test6, test7, test8] =
          await ethers.getSigners();
        // const ETHChessNFTs = await ethers.getContractFactory("ETHChessNFTs");
        await ethChessNFTs.connect(test1).safeMint(test1.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test2).safeMint(test2.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test3).safeMint(test3.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test4).safeMint(test4.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test5).safeMint(test5.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test6).safeMint(test6.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test7).safeMint(test7.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
        await ethChessNFTs.connect(test8).safeMint(test8.address, 6, {
          value: ethers.utils.parseUnits(".06", "ether"),
        });
      });
    });

    // Create a new Leagues to enter into Tour
    describe("createLeague", function () {
      it("Should be able to create 8 new ETH Chess Leagues", async function () {
        const [test1, test2, test3, test4, test5, test6, test7, test8] =
          await ethers.getSigners();
        await ethChessLeagues
          .connect(test1)
          .createLeague("Test-League1", 4, true, [], [test1.address]);
        await ethChessLeagues
          .connect(test2)
          .createLeague("Test-League2", 4, true, [], [test2.address]);
        await ethChessLeagues
          .connect(test3)
          .createLeague("Test-League3", 4, true, [], [test3.address]);
        await ethChessLeagues
          .connect(test4)
          .createLeague("Test-League4", 4, true, [], [test4.address]);
        await ethChessLeagues
          .connect(test5)
          .createLeague("Test-League5", 4, true, [], [test5.address]);
        await ethChessLeagues
          .connect(test6)
          .createLeague("Test-League6", 4, true, [], [test6.address]);
        await ethChessLeagues
          .connect(test7)
          .createLeague("Test-League7", 4, true, [], [test7.address]);
        await ethChessLeagues
          .connect(test8)
          .createLeague("Test-League8", 4, true, [], [test8.address]);
      });
    });
    describe("initTournament", function () {
      it("Should be able to initiate a new Tournament of 8 leagues", async function () {
        const [test1] = await ethers.getSigners();
        await ethChessTours
          .connect(test1)
          .initTournament(1, ethers.utils.parseUnits(".1", "ether"), 8, {
            value: ethers.utils.parseUnits(".1", "ether"),
          });
      });
    });
    describe("joinTournament", function () {
      it("Should be able to allow the remaining 7 accounts to join the tour", async function () {
        const [, test2, test3, test4, test5, test6, test7, test8] =
          await ethers.getSigners();
        await ethChessTours.connect(test2).joinTour(1, 2, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
        await ethChessTours.connect(test3).joinTour(1, 3, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
        await ethChessTours.connect(test4).joinTour(1, 4, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
        await ethChessTours.connect(test5).joinTour(1, 5, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
        await ethChessTours.connect(test6).joinTour(1, 6, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
        await ethChessTours.connect(test7).joinTour(1, 7, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
        await ethChessTours.connect(test8).joinTour(1, 8, {
          value: ethers.utils.parseUnits(".1", "ether"),
        });
      });
    });
    describe("startTour", function () {
      it("Should be able to start the initiated tour", async function () {
        const [test1] = await ethers.getSigners();
        await ethChessTours.connect(test1).startTour(1);
      });
    });
  });
});
