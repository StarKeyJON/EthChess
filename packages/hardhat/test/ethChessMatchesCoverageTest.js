const { ethers, getNamedAccounts } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("ETH Chess Matches Coverage Test", function () {
  let ethChessMatches;
  let ethChessNFTs;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  async function getEtherBalance(address) {
    return ethers.utils.formatEther(await address.getBalance());
  }

  async function getSignersBalance() {
    const [test, test2, test3, test4, test5, test6] = await ethers.getSigners();
    console.log(
      "Test Balance: ",
      await getEtherBalance(test),
      "\nTest2 Balance: ",
      await getEtherBalance(test2),
      "\nTest3 Balance:  ",
      await getEtherBalance(test3),
      "\nTest4 Balance: ",
      await getEtherBalance(test4),
      "\nTest5 Balance:  ",
      await getEtherBalance(test5),
      "\nTest6 Balance: ",
      await getEtherBalance(test6)
    );
  }

  describe("ETHChessMatches", function () {
    it("Should deploy ETHCHess", async function () {
      await getSignersBalance();
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
        await ethChessMatches.newRFee(5000);
        expect(await ethChessMatches.rewardsFee()).to.equal(5000);
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
        expect(await ethChessMatches.delta()).to.equal(7);
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
    describe("newAdmin test", function () {
      it("Should be able to set a new Admin address", async function () {
        const { deployer } = await getNamedAccounts();
        const [acct, acct1] = await ethers.getSigners();
        await expect(
          ethChessMatches.connect(acct1).newAdmin(acct1.address)
        ).to.be.rejectedWith("DOES NOT HAVE ADMIN ROLE");
        await ethChessMatches.connect(acct).newAdmin(acct1.address);
        await ethChessMatches.connect(acct1).newAdmin(deployer);
      });
    });
    it("Should be able to set a new minWager amount", async function () {
      const [acct, acct1] = await ethers.getSigners();
      await expect(
        ethChessMatches
          .connect(acct1)
          .newMinWager(ethers.utils.parseUnits(".0001", "ether"))
      ).to.be.rejectedWith("DOES NOT HAVE ADMIN ROLE");
      await ethChessMatches
        .connect(acct)
        .newMinWager(ethers.utils.parseUnits(".00001", "ether"));
    });

    describe("safeMint function test", function () {
      it("Should be able to mint ETH Chess NFTs", async function () {
        const { deployer } = await getNamedAccounts();
        const [test1, test2, test3, test4, test5, test6] =
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
        await expect(
          ethChessNFTs.safeMint(test1.address, 6, {
            value: ethers.utils.parseUnits(".03", "ether"),
          })
        ).to.be.rejectedWith("Insufficient Value");
        await ethChessNFTs.safeMint(deployer, 6, {
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
        await ethChessNFTs.withdraw();
      });
    });

    describe("initMatch(bool specific, address comp)", function () {
      it("Should be able to initialize a new match", async function () {
        // const matchId = 1;
        await getSignersBalance();

        await expect(ethChessMatches.initMatch()).to.be.rejectedWith(
          "Insufficient amount"
        );
        await ethChessMatches.initMatch({
          value: ethers.utils.parseUnits("10", "ether"),
        });
      });
    });

    describe("startMatch(uint matchId, string ipfsHash)", function () {
      it("Should be able to start an initialized match", async function () {
        const [, test2] = await ethers.getSigners();
        await expect(
          ethChessMatches.connect(test2).startMatch(1, "testIPFSString")
        ).to.be.rejectedWith("Insufficient amount");
        await ethChessMatches
          .connect(test2)
          .startMatch(1, "testStartIPFSString", {
            value: ethers.utils.parseUnits("10", "ether"),
          });
        await expect(
          ethChessMatches.connect(test2).startMatch(1, "testStartIPFSString", {
            value: ethers.utils.parseUnits("10", "ether"),
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
          ethChessMatches
            .connect(penTester)
            .startClaim(
              1,
              "StartHash",
              "EndHash",
              ethers.utils.parseUnits("10", "ether"),
              {
                value: ethers.utils.parseUnits("10", "ether"),
              }
            )
        ).to.be.rejectedWith("Not a participant!");
        await expect(
          ethChessMatches.startClaim(
            1,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("10", "ether"),
            {
              value: ethers.utils.parseUnits("10", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "ClaimStarted")
          .withArgs(
            deployer,
            1,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("10", "ether")
          );
      });
    });

    describe("disputeClaim(uint matchId, string startIpfsHash, string endIpfsHash, uint dSecurity)", function () {
      it("Should start a winning claim dispute process, returns success", async function () {
        const [, test2, penTester] = await ethers.getSigners();
        await expect(
          ethChessMatches
            .connect(penTester)
            .disputeClaim(
              1,
              "StartHash",
              "DisputeHash",
              ethers.utils.parseUnits("20", "ether"),
              {
                value: ethers.utils.parseUnits("10", "ether"),
              }
            )
        ).to.be.rejectedWith("Not a participant!");
        await expect(
          ethChessMatches
            .connect(test2)
            .disputeClaim(
              1,
              "StartHash",
              "DisputeHash",
              ethers.utils.parseUnits(".1", "ether")
            )
        ).to.be.rejectedWith("Insufficient amount");
        await expect(
          ethChessMatches
            .connect(test2)
            .disputeClaim(
              1,
              "StartHash",
              "DisputeHash",
              ethers.utils.parseUnits("20", "ether"),
              {
                value: ethers.utils.parseUnits("20", "ether"),
              }
            )
        )
          .to.emit(ethChessMatches, "ClaimContested")
          .withArgs(
            test2.address,
            1,
            1,
            "StartHash",
            "DisputeHash",
            ethers.utils.parseUnits("20", "ether")
          );
        await expect(
          ethChessMatches
            .connect(test2)
            .disputeClaim(
              1,
              "StartHash",
              "DisputeHash",
              ethers.utils.parseUnits("20", "ether"),
              {
                value: ethers.utils.parseUnits("20", "ether"),
              }
            )
        ).to.be.rejectedWith("Claim already contested!");
      });
    });

    describe("resolveDispute", function () {
      it("Should allow for voting on a disputed claim", async function () {
        const [, , , test3, test4, test5] = await ethers.getSigners();
        await ethChessMatches.connect(test3).resolveDispute(1, false);
        await ethChessMatches.connect(test4).resolveDispute(1, true);
        await ethChessMatches.connect(test5).resolveDispute(1, true);
      });
    });

    describe("endMatch", function () {
      it("Should allow the initial account that started the match to end with the initial claim being false", async function () {
        await helpers.mine(13);
        // const [test3] = await ethers.getSigners();
        const matchesBeforeHoldings = await ethChessMatches.viewHoldings();
        await getSignersBalance();
        console.log(
          "MatchesBefore ",
          ethers.utils.formatEther(matchesBeforeHoldings)
        );
        await ethChessMatches.endMatch(1, "TEST_END_IPFS_HASH");
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("MatchesAfter ", ethers.utils.formatEther(matchesHoldings));
        await getSignersBalance();
      });
    });

    describe("initDeathMatch(uint entranceFee)", function () {
      it("Should start a new DeathMatch competition, returns(success)", async function () {
        const { deployer } = await getNamedAccounts();
        const [, test2] = await ethers.getSigners();
        await expect(
          ethChessMatches.initDeathMatch(
            ethers.utils.parseUnits(".5", "ether"),
            {
              value: ethers.utils.parseUnits(".5", "ether"),
            }
          )
        )
          .to.emit(ethChessMatches, "DeathMatchStarted")
          .withArgs(1, deployer, ethers.utils.parseUnits(".5", "ether"));
        await ethChessMatches.connect(test2).startMatch(2, "IPFSHASH", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should start a winning claim for DeathMatch, returns success", async function () {
        const { deployer } = await getNamedAccounts();
        await expect(
          ethChessMatches.startClaim(
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
          .withArgs(
            deployer,
            2,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".5", "ether")
          );
      });
    });

    describe("advanceDeathMatch(uint matchId, string ipfsHash)", function () {
      it("Should end the first DeathMatch matchround , returns success", async function () {
        // const { deployer } = await getNamedAccounts();
        await helpers.mine(7);
        await ethChessMatches.endMatch(2, "TEST_END_IPFS_HASH");
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("DeathMatches ", ethers.utils.formatEther(matchesHoldings));
        await ethChessMatches.advanceDeathMatch(1, "EndHash", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should start a winning claim for DeathMatch second round", async function () {
        const { deployer } = await getNamedAccounts();
        const [, test2] = await ethers.getSigners();
        await ethChessMatches.connect(test2).startMatch(3, "IPFSHASH", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
        await expect(
          ethChessMatches.startClaim(
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
          .withArgs(
            deployer,
            3,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".5", "ether")
          );
      });
      it("Should end the second DeathMatch match round", async function () {
        // const { deployer } = await getNamedAccounts();
        await helpers.mine(7);
        await ethChessMatches.endMatch(3, "TEST_END_IPFS_HASH");
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("DeathMatches ", ethers.utils.formatEther(matchesHoldings));
        await ethChessMatches.advanceDeathMatch(1, "EndHash", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should start a winning claim for the final DeathMatch round", async function () {
        const { deployer } = await getNamedAccounts();
        const [, test2] = await ethers.getSigners();
        console.log(ethers.utils.formatEther(await test2.getBalance()));
        await ethChessMatches.connect(test2).startMatch(4, "IPFSHASH", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
        await expect(
          ethChessMatches.startClaim(
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
          .withArgs(
            deployer,
            4,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".5", "ether")
          );
      });
      it("Should end the final DeathMatch match round", async function () {
        // const { deployer } = await getNamedAccounts();
        await helpers.mine(7);
        await ethChessMatches.endMatch(4, "TEST_END_IPFS_HASH");
        await ethChessMatches.advanceDeathMatch(1, "EndHash", {
          value: ethers.utils.parseUnits(".5", "ether"),
        });
      });
      it("Should display the final holdings of the contracts", async function () {
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("Matches ", ethers.utils.formatEther(matchesHoldings));
      });
    });
    describe("initChallengeMatch(address comp)", function () {
      it("Should be able to initialize a new challenge match", async function () {
        const [test3, test4] = await ethers.getSigners();
        await expect(
          ethChessMatches.connect(test3).initChallengeMatch(test4.address)
        ).to.be.rejectedWith("Insufficient amount");
        await ethChessMatches.connect(test3).initChallengeMatch(test4.address, {
          value: ethers.utils.parseUnits("1", "ether"),
        });
      });
    });
    describe("Challenge match tests", function () {
      it("Should be able to cycle through the challenger match branches", async function () {
        const [, test4, test5] = await ethers.getSigners();
        await expect(
          ethChessMatches.connect(test5).startMatch(5, "TESTIPFSHASH", {
            value: ethers.utils.parseUnits("1", "ether"),
          })
        ).to.be.rejectedWith("Not the Challenger!");
        await ethChessMatches.connect(test4).startMatch(5, "TestIPFSHash", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
      });
    });
    describe("startClaim(uint matchId, string startIpfsHash, string endIpfsHash, uint security)", function () {
      it("Should start a winning claim, returns success", async function () {
        const { deployer } = await getNamedAccounts();
        const [test, , penTester] = await ethers.getSigners();
        await expect(
          ethChessMatches.startClaim(
            5,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits(".1", "ether"),
            {
              value: ethers.utils.parseUnits(".1", "ether"),
            }
          )
        ).to.be.rejectedWith("Must enter security deposit = to wager");
        await expect(
          ethChessMatches
            .connect(penTester)
            .startClaim(
              5,
              "StartHash",
              "EndHash",
              ethers.utils.parseUnits("1", "ether"),
              {
                value: ethers.utils.parseUnits("1", "ether"),
              }
            )
        ).to.be.rejectedWith("Not a participant!");
        await expect(
          ethChessMatches
            .connect(test)
            .startClaim(
              5,
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
            5,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("1", "ether")
          );
        await helpers.mine(13);
        await ethChessMatches.endMatch(5, "EndChallengeMatch");
      });
    });
    describe("Testing deathmatch function branches", function () {
      it("Should cycle through deathmatch competitors", async function () {
        const [test, test2] = await ethers.getSigners();
        await ethChessMatches
          .connect(test)
          .initDeathMatch(ethers.utils.parseUnits("1", "ether"), {
            value: ethers.utils.parseUnits("1", "ether"),
          });
        await ethChessMatches.connect(test2).startMatch(6, "StartHash", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await ethChessMatches
          .connect(test)
          .startClaim(
            6,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("1", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          );
        await helpers.mine(7);
        await ethChessMatches.connect(test).advanceDeathMatch(2, "IPFSHASH", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await ethChessMatches.connect(test2).startMatch(7, "StartHash", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await ethChessMatches
          .connect(test2)
          .startClaim(
            7,
            "StartHash",
            "EndHash",
            ethers.utils.parseUnits("1", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          );
        await ethChessMatches
          .connect(test)
          .disputeClaim(
            7,
            "StartIPFSHASh",
            "EndIPFSHash",
            ethers.utils.parseUnits("2", "ether")
          );
      });
      it("Should allow for voting on a disputed claim", async function () {
        const [test, test2, test3] = await ethers.getSigners();
        await ethChessMatches.connect(test).resolveDispute(7, false);
        await ethChessMatches.connect(test2).resolveDispute(7, true);
        await ethChessMatches.connect(test3).resolveDispute(7, false);
        await helpers.mine(7);
        await ethChessMatches.connect(test).endMatch(7, "EndIPFSHash");
        await helpers.mine(7);
        await ethChessMatches.connect(test).advanceDeathMatch(2, "IPFSHASH", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
      });
    });
    describe("ClaimRefund function test", function () {
      it("Should be able to start a match and claim a refund by both participants", async function () {
        const [test, test2] = await ethers.getSigners();
        await ethChessMatches
          .connect(test)
          .initMatch({ value: ethers.utils.parseUnits("1", "ether") });
        await ethChessMatches.connect(test2).startMatch(9, "StartHash", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await ethChessMatches.connect(test).claimRefund(9);
        await ethChessMatches.connect(test2).claimRefund(9);
        await ethChessMatches.connect(test).claimRefund(9);
        await ethChessMatches.connect(test2).claimRefund(9);
      });
    });
    describe("Uncontested match branch test", function () {
      it("Should be able to start and end an uncontested match", async function () {
        const [test, test2] = await ethers.getSigners();
        await ethChessMatches
          .connect(test)
          .initMatch({ value: ethers.utils.parseUnits("1", "ether") });
        await ethChessMatches.connect(test2).startMatch(10, "StartHash", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await ethChessMatches
          .connect(test)
          .startClaim(
            10,
            "StartIPFSHash",
            "EndhHash",
            ethers.utils.parseUnits("1", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          );
        await helpers.mine(7);
        await ethChessMatches.connect(test).endMatch(10, "EndIPFSHash");
      });
    });
    describe("Testing endMatch function branch", function () {
      it("Should end match to favor the disputer", async function () {
        const [test, test2, test3] = await ethers.getSigners();
        await ethChessMatches.connect(test2).startMatch(8, "StartHash", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await ethChessMatches
          .connect(test)
          .startClaim(
            8,
            "Start",
            "End",
            ethers.utils.parseUnits("1", "ether"),
            {
              value: ethers.utils.parseUnits("1", "ether"),
            }
          );
        await ethChessMatches
          .connect(test2)
          .disputeClaim(
            8,
            "Start",
            "End",
            ethers.utils.parseUnits("2", "ether"),
            {
              value: ethers.utils.parseUnits("2", "ether"),
            }
          );
        await ethChessMatches.connect(test).resolveDispute(8, true);
        await ethChessMatches.connect(test2).resolveDispute(8, true);
        await ethChessMatches.connect(test3).resolveDispute(8, false);
        await helpers.mine(7);
        await ethChessMatches.connect(test).endMatch(8, "EndIPFSHash");
        await helpers.mine(7);
        await ethChessMatches.connect(test).advanceDeathMatch(2, "IPFSHASH", {
          value: ethers.utils.parseUnits("1", "ether"),
        });
        await getSignersBalance();
        const matchesHoldings = await ethChessMatches.viewHoldings();
        console.log("MatchesAfter ", ethers.utils.formatEther(matchesHoldings));
      });
    });
  });
});
