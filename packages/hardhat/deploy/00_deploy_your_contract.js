// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

// const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("ETHChessMatches", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [deployer],
    log: true,
    waitConfirmations: 1,
    LibraryName: "./node_modules/@openzeppelin",
  });
  // const ETHChess = await ethers.getContract("ETHChessMatches", deployer);

  await deploy("ETHChessNFTs", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [deployer, deployer, "ipfs.io"],
    log: true,
    waitConfirmations: 1,
    LibraryName: "./node_modules/@openzeppelin",
  });
  // const ETHChessNFTs = await ethers.getContract("ETHChessNFTs", deployer);

  // await deploy("ETHChessTournaments", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   args: [deployer, ETHChessNFTs.address],
  //   log: true,
  //   waitConfirmations: 5,
  //   LibraryName: "./node_modules/@openzeppelin",
  // });
  // const ETHChessTours = await ethers.getContract("ETHChessTour", deployer);

  // await deploy("ETHChessTreasury", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   args: [deployer, ETHChess.address, ETHChessTours.address],
  //   log: true,
  //   waitConfirmations: 5,
  //   LibraryName: "./node_modules/@openzeppelin",
  // });

  // Getting a previously deployed contract
  // const ETHChessTreasury = await ethers.getContract(
  //   "ETHChessTreasury",
  //   deployer
  // );
  /*  await YourContract.setPurpose("Hello");
  
    // To take ownership of yourContract using the ownable library uncomment next line and add the 
    // address you want to be the owner. 
    
    await YourContract.transferOwnership(
      "ADDRESS_HERE"
    );

    //const YourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  // try {
  //   if (chainId !== localChainId) {
  //     await run("verify:verify", {
  //       address: YourContract.address,
  //       contract: "contracts/YourContract.sol:YourContract",
  //       constructorArguments: [],
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
};
module.exports.tags = ["ETHChessMatches", "ETHChessNFTs"];
