# ♘ ETHChess

> Decentralized Chess app allowing p2p wagered matches and deathmatch competitions
<p>ETH-Chess enables decentralized 1v1 chess matches between random or specific opponents, 
</br> as well as competitive DeathMatch tournaments where the best of 3 wins the Rewards Pot!
</p>

> Custom Solidity contracts for p2p wagered matches
<p>EthChessMatches.sol allows for 1v1 random or specific chess matches or DeathMatch tournaments.</p>
<p>EthChessNFTs.sol allows for rewarded dispute resolution processes.</p>
</br>
<h3>Chess Matches</h3>
<p>1.) Matches are initiated with a wager amount specified by the player.</p>
<p>2.) Competitors start the Match by entering the equivalent wager amount, </br>plus the hash of the IPFS object containing Match details and first move.</p>
<p>3.) The winner of the Match enters a winning claim with the final game state IPFS hash and a security deposit equal to the initial wager.</p>
<p>4a.) The opponent has a dispute claim period of n blocks(where n is an adjustable amount initially set at 7) 
    </br>   to enter their IPFS hash and and a security deposit equal to twice the amount of the initial wager.
    </br>4b.) If disputed, up to 20 EthChess NFT holders can vote on the dispute, 10 for initial Claim is True, 10 for initial Claim is False(Dispute is true).
    </br>4c) If the amount of True votes is >= False votes(benefit of the doubt is favored to the claimant), 
    </br>   then the claimant wins the Match total + their initial Claim security deposit back - n fee(where n is an adjustable fee set at 10% that goes to the DeathMatch rewards pot). 
    </br>       Each voter that voted True receives (1/2 of the Dispute security deposit / amount of True voters).
    </br>       The other 1/2 of the Dispute security deposit goes to the DeathMatch rewards pot.
    </br>   If the Dispute is True, the disputer wins the Match total + their initial Dispute security deposit - n fee(where n is an adjustable fee set at 10% that goes to the DeathMatch rewards pot). 
    </br>       Each voter that voted False receives ( Claim security deposit / amount of False voters).
</p>
<h4>*The voters in the dispute resolution process receies the same amount of rewards whicever way they vote.
</br>   1/2 of Dispute security deposit == Claim security deposit
</br>   The only difference is if the Dispute is false, half of the security contributes to the DeathMatch rewards pot.*</h4>
</br>
<h3>Chess DeathMatches</h3>
<p>DeathMatches consists of rounds containing Match structs and a reigning champion.
</br>1.) Player initiates DeathMatch with round wager amount.
</br>  Each player must enter this amount each round.
</br>2.) Opponent starts DeathMatch round by cycling through the Matches claim/dispute resolution process.
</br>3.) Match winners can advance the DeathMatch round, starting a new Match.
</br>   Match rewards are accumulated in the DeathMatch rewards pot.
</br>4.) The Reigning Champion that wins 3 Rounds in a row wins the DeathMatch rewards pot + (platform rewards pot / n (where n is an adjustable fee set at 50%))
</p>

> GraphQL subgraph for decentralized indexing

> IPFS used for immutable storage to preserve chess board state

> Gun.js used for decentralized database and cryptographic security/utilities

[![](https://data.jsdelivr.com/v1/package/gh/amark/gun/badge?style=rounded)](https://data.jsdelivr.com/v1/package/gh/amark/gun/stats)
![Build](https://github.com/amark/gun/actions/workflows/ci.yml/badge.svg)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.js.svg)](http://chat.gun.eco)

**GUN** is an [ecosystem](https://gun.eco/docs/Ecosystem) of **tools** that let you build [community run](https://www.nbcnews.com/tech/tech-news/these-technologists-think-internet-broken-so-they-re-building-another-n1030136) and [encrypted applications](https://gun.eco/docs/Cartoon-Cryptography) - like an Open Source Firebase or a Decentralized Dropbox.

The [Internet Archive](https://news.ycombinator.com/item?id=17685682) and [100s of other apps](https://github.com/amark/gun/wiki/awesome-gun) run GUN in-production. GUN is also part of [Twitter's Bluesky](https://blueskycommunity.net/) initiative!

 + Multiplayer by default with realtime p2p state synchronization!
 + Graph data lets you use key/value, tables, documents, videos, & more!
 + Local-first, offline, and decentralized with end-to-end encryption.



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

You need to create a .env file for packages/server. Place in your s3 bucket details to enable gun.js s3, and uncomment the s3 imports in packages/server/config.js .

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/StarKeyJON/EthChess.git)
