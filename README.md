<a name="readme-top"></a>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

<br/>

# ♘ ETHChess



<a name="about-the-project"></a>
> Decentralized Chess app allowing p2p wagered matches and deathmatch competitions
<br/><a href="https://eth-chess.surge.sh/">Link to test site</a>
<p>ETH-Chess enables decentralized 1v1 chess matches between random or specific opponents,
<br/> as well as competitive DeathMatch tournaments where the player that wins 3 consecutive match rounds, wins the Rewards Pot!
</p>

> Custom Solidity contracts for p2p wagered matches
<p>EthChessMatches.sol allows for 1v1 random or specific chess matches or DeathMatch tournaments.</p>
<p>EthChessNFTs.sol allows for rewarded dispute resolution processes.</p>
<br/>
<h3>Chess Matches</h3>
<p>1.) Matches are initiated with a wager amount specified by the player.</p>
<p>2.) Competitors start the Match by entering the equivalent wager amount, <br/>plus the hash of the IPFS object containing Match details and first move.</p>
<p>3.) The winner of the Match enters a winning claim with the final game state IPFS hash and a security deposit equal to the initial wager.</p>
<p>4a.) The opponent has a dispute claim period of n blocks(where n is an adjustable amount initially set at 7)
    <br/>   to enter their IPFS hash and a security deposit equal to twice the amount of the initial wager.
    <br/>4b.) If disputed, up to 20 EthChess NFT holders can vote on the dispute, 10 for initial Claim is True, 10 for initial Claim is False(Dispute is true).
    <br/>4c) If the amount of True votes is >= False votes(benefit of the doubt is favored to the claimant),
    <br/>   then the claimant wins the Match total + their initial Claim security deposit back - n fee(where n is an adjustable fee set at 10% that goes to the DeathMatch rewards pot).
    <br/>       Each voter that voted True receives (1/2 of the Dispute security deposit / amount of True voters).
    <br/>       The other 1/2 of the Dispute security deposit goes to the DeathMatch rewards pot.
    <br/>   If the Dispute is True, the disputer wins the Match total + their initial Dispute security deposit - n fee(where n is an adjustable fee set at 10% that goes to the DeathMatch rewards pot).
    <br/>       Each voter that voted False receives ( Claim security deposit / amount of False voters).
</p>
<h4>*The voters in the dispute resolution process receives the same amount of rewards whicever way they vote.
<br/>   1/2 of Dispute security deposit == Claim security deposit
<br/>   The only difference is if the Dispute is false, half of the security contributes to the DeathMatch rewards pot.*</h4>
<br/>
<h3>Chess DeathMatches</h3>
<p>DeathMatches consists of rounds containing Match structs and a reigning champion.
<br/>1.) Player initiates DeathMatch with round wager amount.
<br/>  Each player must enter this amount each round.
<br/>2.) Opponent starts DeathMatch round by cycling through the Matches claim/dispute resolution process.
<br/>3.) Match winners can advance the DeathMatch round, starting a new Match.
<br/>   Match rewards are accumulated in the DeathMatch rewards pot.
<br/>4.) The Reigning Champion that wins 3 Rounds in a row wins the DeathMatch rewards pot + (platform rewards pot / n (where n is an adjustable fee set at 50%))
</p>

<br/>

<a name="built-with"></a>
# Technologies Used

# IPFS

<p>
<a href="https://www.npmjs.com/package/ipfs-http-client">IPFS-http-client Github Repo</a> IPFS-http-client is used for storage and content-addressing services.
</p>
<p>Each on-chain Match gameplay state is preserved with each move to IPFS, and each previous hash appended to the next IPFS object.</p>
<p>Each player will have a chain of IPFS CID's that can be submitted at the end of the match, either to cliam vicotry or to dispute the results.</p>
<p>This allows for an immutable chain of events that contributes to the Dispute resolution process where holders of EthChess NFTs an vote on the outcome by reviewing the IPFS CID chained history.</p>
<a href="https://github.com/StarKeyJON/EthChess/blob/main/packages/react-app/src/helpers/ipfs.js"> Link to IPFS instance hook.</a><br/>
<a href="https://github.com/StarKeyJON/EthChess/blob/f8195322b9643680cc3c457c6f911a9db0b6b5a8/packages/react-app/src/components/ChessComponents/ChessGrounds/ETHMatch.js#L201">Link to usage.</a><br/>
<a href="https://github.com/StarKeyJON/EthChess/blob/f8195322b9643680cc3c457c6f911a9db0b6b5a8/packages/react-app/src/components/ChessComponents/ChessGrounds/ETHMatch.js#L253">Link to usage</a><br/>

# Gun.js

<p>Gun.js is used in both the frontend and the backend applications for decentralized storage and cryptographic verification processes for user profiles.</p>
<br/>
**GUN** is an [ecosystem](https://gun.eco/docs/Ecosystem) of **tools** that let you build [community run](https://www.nbcnews.com/tech/tech-news/these-technologists-think-internet-broken-so-they-re-building-another-n1030136) and [encrypted applications](https://gun.eco/docs/Cartoon-Cryptography) - like an Open Source Firebase or a Decentralized Dropbox.

The [Internet Archive](https://news.ycombinator.com/item?id=17685682) and [100s of other apps](https://github.com/amark/gun/wiki/awesome-gun) run GUN in-production. GUN is also part of [Twitter's Bluesky](https://blueskycommunity.net/) initiative!

+ Multiplayer by default with realtime p2p state synchronization!
+ Graph data lets you use key/value, tables, documents, videos, & more!
+ Local-first, offline, and decentralized with end-to-end encryption.

<h3>About</h3>
First & foremost, GUN is **a community of the nicest and most helpful people** out there. So [I want to invite you](http://chat.gun.eco) to come tell us about what **you** are working on & wanting to build (new or old school alike! Just be nice as well.) and ask us your questions directly. :)

<p align="center"><a href="https://www.youtube.com/watch?v=oTQXzhm8w_8"><img width="250" src="https://img.youtube.com/vi/oTQXzhm8w_8/0.jpg"><br/>Watch the 100 second intro!</a></p>

The GUN ecosystem stack is a collection of independent and modular tools covering everything from [CRDT](https://crdt.tech/) [conflict resolution](https://gun.eco/distributed/matters.html), [cryptographic security](https://gun.eco/docs/Cartoon-Cryptography) & [encryption](https://gun.eco/docs/SEA), [radix storage serialization](https://gun.eco/docs/RAD), [mesh networking](https://gun.eco/docs/DAM) & [routing algorithms](https://gun.eco/docs/Routing), to distributed systems [correctness & load testing](https://github.com/gundb/panic-server), CPU scheduled [JSON parser](https://github.com/amark/gun/blob/master/lib/yson.js) to prevent UI lag, and more!

<div><img width="48%" src="https://gun.eco/see/stack.png"/>
<img width="48%" align="right" src="https://gun.eco/see/layers.png"/></div>

# Chess.js

<a href="https://github.com/jhlywa/chess.js">Chess.js Github Repo</a>
<p>chess.js is a Javascript chess library that is used for chess move generation/validation, piece placement/movement,<br/> and check/checkmate/stalemate detection - basically everything but the AI.
</p>

# ChessGround

<a href="https://github.com/lichess-org/chessground">ChessGround Github Repo</a>
<p>Chessground is a free/libre open source chess UI developed for lichess.org. It targets modern browsers, as well as mobile development using Cordova.</p>

<p>This project code has been made public in condition with this repo GPL-3.0 license.</p>
<br/>


# 🏗 Scaffold-ETH

<a href="https://github.com/scaffold-eth/scaffold-eth">Scaffold-Eth GitHub repo</a>
<p>CRA platform scaffolded using Scaffold-ETH(more info found below)</p>

> everything you need to build on Ethereum! 🚀

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

<h3> 🍦 Other Flavors </h3>

- [scaffold-eth-typescript](https://github.com/scaffold-eth/scaffold-eth-typescript)
+ [scaffold-eth-tailwind](https://github.com/stevenpslade/scaffold-eth-tailwind)
+ [scaffold-nextjs](https://github.com/scaffold-eth/scaffold-eth/tree/scaffold-nextjs)
+ [scaffold-chakra](https://github.com/scaffold-eth/scaffold-eth/tree/chakra-ui)
+ [eth-hooks](https://github.com/scaffold-eth/eth-hooks)
+ [eth-components](https://github.com/scaffold-eth/eth-components)
+ [scaffold-eth-expo](https://github.com/scaffold-eth/scaffold-eth-expo)
+ [scaffold-eth-truffle](https://github.com/trufflesuite/scaffold-eth)

<br />

<a name="getting-started"></a>
# 🏄‍♂️ ETH-Chess Quick Start
<a name="prerequisites"></a>
Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork ♞ EthChess:

```bash
git clone https://github.com/StarKeyJON/EthChess.git
```
<a name="installation"></a>
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

<br/>

...

# 💌 P.S
<a name="usage"></a>

🔑 You need to create a .env file for packages/server from the example.env, file as well as in packages/react-app. If you would like to persist data to s3 storage, place in your s3 bucket details to enable gun.js s3, and uncomment the s3 imports in packages/server/config.js .

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

---

<h3> Automated with Gitpod </h3>

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/StarKeyJON/EthChess.git)

<a name="roadmap"></a>

<!-- ROADMAP -->
## Roadmap

- [x] Add README
- [ ] Solidity
    - [x] Develop EthChess Matches Contract
    - [x] Develop EthChess NFT Contract
    - [ ] Unit tests for smart contracts
        - [x] Statements Coverage > 90%
        - [ ] Branch Coverage > 90%
        - [x] Function Coverage > 90%
        - [x] Lines Coverage > 90%
    - [ ] Develop secondary contracts
        - [x] EthChess Leagues
        - [ ] EthChess Tournaments
        - [x] EthChess Treasury
- [x] The Graph
    - [x] Develop mono subgraph
    - [ ] refactor subgraph against final contracts
- [ ] Front-End
    - [ ] App
    - [x] Home
    - [ ] Lobby
        - [x] P vs. Comp Skirmish
        - [x] PvP Skirmish
        - [ ] Wagered Match
        - [ ] Wagered DeathMatch
    - [ ] Voting
    - [ ] Mint
    - [x] Info
- [x] Back-End
    - [x] Express server
    - [x] Gun.js relay node

<a name="contributing"></a>

See the [ISSUE TEMPLATE](https://github.com/StarKeyJON/EthChess/tree/main/ISSUE_TEMPLATE) for how to propose features and issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
