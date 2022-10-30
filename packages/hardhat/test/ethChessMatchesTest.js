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

    describe("newFee function test", function () {
      it("Should be able to set fee for admin only", async function () {
        const [, acct1] = await ethers.getSigners();
        await ethChessMatches.newFee(1000);
        expect(await ethChessMatches.fee()).to.equal(1000);
        await expect(
          ethChessMatches.connect(acct1).newFee(1337)
        ).to.be.rejectedWith("DOES NOT HAVE ADMIN ROLE");
      });
    });

    describe("newRFee function test", function () {
      it("Should be able to set a new rewardsFee for admin only", async function () {
        const [, acct1] = await ethers.getSigners();
        await ethChessMatches.newRFee(1000);
        expect(await ethChessMatches.rewardsFee()).to.equal(1000);
        await expect(
          ethChessMatches.connect(acct1).newRFee(1337)
        ).to.be.rejectedWith("DOES NOT HAVE ADMIN ROLE");
      });
    });

    describe("changeDelta function test", function () {
      it("Should be able to set a new delta for admin only", async function () {
        const [, acct1] = await ethers.getSigners();
        await ethChessMatches.newDelta(1000);
        expect(await ethChessMatches.delta()).to.equal(1000);
        await expect(
          ethChessMatches.connect(acct1).newDelta(1337)
        ).to.be.rejectedWith("DOES NOT HAVE ADMIN ROLE");
        await ethChessMatches.newDelta(7);
      });
    });

    describe("newNFTAddress test", function () {
      it("Should be able to set the NFT Address in the Matches contract", async function () {
        const [, acct1] = await ethers.getSigners();
        await ethChessMatches.newNFTAddress(ethChessNFTs.address);
        await expect(
          ethChessMatches.connect(acct1).newNFTAddress(ethChessNFTs.address)
        ).to.be.rejectedWith("DOES NOT HAVE ADMIN ROLE");
      });
      it("The ethChessNFTs address should be the same as the deployed NFT contract", async function () {
        expect(await ethChessMatches.ethChessNFTs()).to.equal(
          ethChessNFTs.address
        );
      });
    });

    describe("safeMint function test", function () {
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

    describe("Testing NFT functions", function () {
      it("Should interact with the NFT contract properly", async function () {
        const [, test4] = await ethers.getSigners();
        await expect(
          ethChessNFTs.connect(test4).setMintPrice(9)
        ).to.be.rejectedWith(
          "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x08c4e2e8a3d28b0812548a4a897f980fb868050b13d7a2400a7351cdca13889e"
        );
        await ethChessNFTs.setMintPrice(
          ethers.utils.parseUnits(".01", "ether")
        );
        await expect(
          ethChessNFTs.connect(test4).setSupply(9)
        ).to.be.rejectedWith(
          "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x08c4e2e8a3d28b0812548a4a897f980fb868050b13d7a2400a7351cdca13889e"
        );
        await ethChessNFTs.setSupply(60001);
        await expect(
          ethChessNFTs.connect(test4).setBaseUri("sneaky")
        ).to.be.rejectedWith(
          "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x08c4e2e8a3d28b0812548a4a897f980fb868050b13d7a2400a7351cdca13889e"
        );
        await ethChessNFTs.setBaseUri("https://authenticated.ipfs/");
        await expect(ethChessNFTs.connect(test4).withdraw()).to.be.rejectedWith(
          "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x08c4e2e8a3d28b0812548a4a897f980fb868050b13d7a2400a7351cdca13889e"
        );
        await ethChessNFTs.withdraw();
        expect(await ethChessNFTs.tokenURI(1)).to.equal(
          "https://authenticated.ipfs/1.json"
        );
        await ethChessNFTs.ids();
        await ethChessNFTs.supply();
        await ethChessNFTs.mintPrice();
        await ethChessNFTs.baseUri();
        const role = await ethChessNFTs.DEFAULT_ADMIN_ROLE();
        await expect(
          ethChessNFTs.connect(test4).grantRole(role, test4.address)
        ).to.be.rejectedWith(
          "AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        await expect(
          ethChessNFTs.connect(test4).safeMint(test4.address, 100)
        ).to.be.rejectedWith("Insufficient Value");
        await expect(
          ethChessNFTs.connect(test4).safeMint(test4.address, 100, {
            value: ethers.utils.parseUnits("1", "ether"),
          })
        ).to.be.rejectedWith("Amount must be <= 10");
      });
    });

    describe("initMatch(bool specific, address comp)", function () {
      it("Should be able to initialize a new match", async function () {
        // const matchId = 1;

        await expect(ethChessMatches.initMatch()).to.be.rejectedWith(
          "Insufficient amount"
        );
        await ethChessMatches.initMatch({
          value: ethers.utils.parseUnits("1", "ether"),
        });
      });
    });

    describe("startMatch(uint matchId, string ipfsHash)", function () {
      it("Should be able to start an initialized match", async function () {
        await expect(
          ethChessMatches.startMatch(1, "testIPFSString")
        ).to.be.rejectedWith("Insufficient amount");
        await ethChessMatches.startMatch(1, "testStartIPFSString", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await expect(
          ethChessMatches.startMatch(1, "testStartIPFSString", {
            value: ethers.utils.parseUnits("1", "ether"),
          })
        ).to.be.rejectedWith("Match already started!");
      });
    });

    describe("startClaim(uint matchId, string startIpfsHash, string endIpfsHash, uint security)", function () {
      it("Should start a winning claim, returns success", async function () {
        const { deployer } = await getNamedAccounts();
        const [, , penTester] = await ethers.getSigners();
        await expect(
          ethChessMatches.startClaim(
            1,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".1", "ether"),
            {
              value: ethers.utils.parseUnits(".1", "ether"),
            }
          )
        ).to.be.rejectedWith("Must enter security deposit = to wager");
        await expect(
          ethChessMatches.startClaim(
            1,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("1", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimStarted")
          .withArgs(
            deployer,
            1,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("1", "ether")
          );
        await expect(
          ethChessMatches
            .connect(penTester)
            .startClaim(
              1,
              "StartHash",
              "EndHash",
              ethers.utils.parseUnits("1", "ether"),
              {
                value: ethers.utils.parseUnits("1", "ether"),
              }
            )
        ).to.be.rejectedWith("Not a participant!");
      });
    });

    describe("disputeClaim(uint matchId, string startIpfsHash, string endIpfsHash, uint dSecurity)", function () {
      it("Should start a winning claim dispute process, returns success", async function () {
        const { deployer } = await getNamedAccounts();
        const [, , penTester] = await ethers.getSigners();
        await expect(
          ethChessMatches
            .connect(penTester)
            .disputeClaim(
              1,
              "StartHash",
              "DisputeHash",
              ethers.utils.parseUnits("2", "ether"),
              {
                value: ethers.utils.parseUnits("1", "ether"),
              }
            )
        ).to.be.rejectedWith("Not a participant!");
        await expect(
          ethChessMatches.disputeClaim(
            1,
            "StartHash",
            "DisputeHash",
            ethers.utils.parseUnits("2", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimContested")
          .withArgs(
            deployer,
            1,
            1,
            "StartHash",
            "DisputeHash",
            ethers.utils.parseUnits("2", "ether")
          );
        await expect(
          ethChessMatches.disputeClaim(
            1,
            "StartHash",
            "DisputeHash",
            ethers.utils.parseUnits("2", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          )
        ).to.be.rejectedWith("Claim already contested!");
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
      it("Should allow the initial account that started the match to end with the initial claim being false", async function () {
        await helpers.mine(13);
        // const [test2] = await ethers.getSigners();
        await ethChessMatches.endMatch(1, "TEST_END_IPFS_HASH");
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("Matches ", ethers.utils.formatEther(matchesHoldings));
      });
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
