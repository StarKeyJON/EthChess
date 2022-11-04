# ♘ ETHChess

> Decentralized Chess app allowing p2p wagered matches and deathmatch competitions
<p>ETH-Chess enables decentralized 1v1 chess matches between random or specific opponents, 
</br> as well as competitive DeathMatch tournaments where the best of 3 wins the Rewards Pot!
</p>

> Custom Solidity contracts for p2p wagered matches
<p>EthChessMatches.sol allows for 1v1 random or specific chess matches or DeathMatch tournaments.</p>
<p>EthChessNFTs.sol allows for rewarded dispute resolution processes.</p>
<p>1.) Matches are initiated with a wager amount specified by the player.</p>
<p>2.) </p>

> Full unit testing

> GraphQL subgraph for decentralized indexing

> IPFS used for immutable storage to preserve chess board state

> Gun.js used for decentralized database and cryptographic security/utilities



# 🏄‍♂️ ETH-Chess Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork ♞ EthChess:

```bash
git clone https://github.com/StarKeyJON/EthChess.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd EthChess
yarn install
yarn chain
```

> in a second terminal window, start your 🗄️ server:

```bash
cd EthChess
yarn server
```

> in a third terminal window, start your 📱 frontend:

```bash
cd EthChess
yarn start
```

> in a fourth terminal window, 🛰 deploy your contract:

```bash
cd EthChess
yarn deploy
```


> CRA platform scaffolded using Scaffold-ETH(more info found below)


# 🏗 Scaffold-ETH

> everything you need to build on Ethereum! 🚀

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)


📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)


# 🍦 Other Flavors
- [scaffold-eth-typescript](https://github.com/scaffold-eth/scaffold-eth-typescript)
- [scaffold-eth-tailwind](https://github.com/stevenpslade/scaffold-eth-tailwind)
- [scaffold-nextjs](https://github.com/scaffold-eth/scaffold-eth/tree/scaffold-nextjs)
- [scaffold-chakra](https://github.com/scaffold-eth/scaffold-eth/tree/chakra-ui)
- [eth-hooks](https://github.com/scaffold-eth/eth-hooks)
- [eth-components](https://github.com/scaffold-eth/eth-components)
- [scaffold-eth-expo](https://github.com/scaffold-eth/scaffold-eth-expo)
- [scaffold-eth-truffle](https://github.com/trufflesuite/scaffold-eth)

...

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
