import { Button, Card, Divider, Drawer, Layout, Menu, Space } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import {
  useBalance,
  useContractLoader,
  // useContractReader,
  useGasPrice,
  // useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import CookieConsent from "react-cookie-consent";
import { FaChessBoard, FaChess, FaInfo, FaVoteYea, FaChessKing } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import { GiTakeMyMoney } from "react-icons/gi";
import { TbCurrencyEthereum } from "react-icons/tb";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import { Account, Contract, Header, NetworkDisplay, PieceBouncer, ThemeSwitch } from "./components";
import { NETWORKS, ALCHEMY_KEY, peers, appStage } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, Subgraph, Info, Mint, Lobby, FourOFour } from "./views";
import { useStaticJsonRPC } from "./hooks";

import LinkFooter from "./components/LinkFooter";
import { ProfilePage, Profile } from "./components/ProfileComponents";
import Disputes from "./components/NFTHolders/Disputes";
import {
  ChessViewer,
  ChessMatch,
  ChessSkirmishes,
  ETHMatch,
  ETHDeathMatch,
} from "./components/ChessComponents/ChessGrounds";
import { Content } from "antd/lib/layout/layout";
import useProfile from "./components/StateComponents/useProfile";
import Voting from "./views/Voting";
import { useGun } from "./hooks/useGunRelay";
import { NotifyDeathMatch, NotifyMatch } from "./components/NotificationComponents";
import { NotifyDispute } from "./components/NotificationComponents/NotifyMatch";
import ProfileModal from "./components/ProfileComponents/ProfileModal";
import Modal from "antd/lib/modal/Modal";

const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
const initialNetwork = appStage === "development" ? NETWORKS.localhost : NETWORKS.goerli; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = false; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = true;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  // "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  const awsKey = process.env.REACT_APP_ACCESS_KEY_ID;
  const awsSecret = process.env.REACT_APP_SECRET_ACCESS_KEY;
  const awsBucket = process.env.REACT_APP_BUCKET;
  const gunOptions = {
    axe: false,
    localStorage: false,
    s3: {
      key: awsKey, // AWS Access Key
      secret: awsSecret, // AWS Secret Token
      bucket: awsBucket, // The bucket you want to save into
    },
  };
  const [gun] = useState(useGun(peers, gunOptions));

  let startTime = Math.round(new Date().getTime() / 1000);
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [showNotifyMatch, setShowNotifyMatch] = useState(false);
  const [showNotifyDeathMatch, setShowNotifyDeathMatch] = useState(false);
  const [showNotifyDispute, setShowNotifyDispute] = useState(false);
  const [newMatchId, setNewMatchId] = useState(0);

  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    targetNetwork.rpcUrl ? targetNetwork.rpcUrl : process.env.REACT_APP_PROVIDER,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  const [gunUser, setGunUser] = useState("");

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  // const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  // useOnBlock(mainnetProvider, () => {
  //   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  // });

  // // Then read your DAI balance like:
  // const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
  //   "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  // ]);

  // keep track of a variable from the contract in the local React state:
  // const purpose = useContractReader(readContracts, "YourContract", "purpose");

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const updateGunUser = useCallback(() => {
    setGunUser(gun.user().recall({ sessionStorage: true }));
  }, [gun]);

  useEffect(() => {
    updateGunUser();
  }, []);

  const { loggedIn, loginModal, setLoginModal, loginProfile, createProfile, logoutProfile, player, setPlayer } =
    useProfile({
      gun,
      address,
      gunUser,
      setGunUser,
    });

  return gun ? (
    <div className="App">
      <Layout>
        {/* ✏️ Edit the header and change the title to your project name */}
        <Header>
          <CookieConsent
            location="bottom"
            buttonText="OK!"
            cookieName="ethChessCookies"
            style={{ background: "#2B373B" }}
            buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
            expires={150}
            acceptOnScroll
          >
            This website uses 🍪 cookies 🍪 to enhance user experience, to enable p2p gameplay and recall user
            preferences.
            <br />
            <span style={{ fontSize: "10px" }}>
              This website DOES NOT use third-party tracking, advertising or analytic services.
            </span>
          </CookieConsent>
          {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flex: 1 }}>
              {/* {USE_NETWORK_SELECTOR && (
            <div style={{ marginRight: 20 }}>
              <NetworkSwitch
                networkOptions={networkOptions}
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
              />
            </div>
          )} */}
              <Account
                useBurner={USE_BURNER_WALLET}
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />
            </div>
            {loggedIn ? (
              <Button
                onClick={() => {
                  logoutProfile();
                }}
              >
                ♛ Log-Out
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setLoginModal(true);
                }}
              >
                ♛ Log-In
              </Button>
            )}
          </div>
        </Header>
        <Layout>
          <Space>
            <Modal
              visible={loginModal}
              onOk={() => {
                setLoginModal(false);
              }}
              onCancel={() => {
                setLoginModal(false);
              }}
            >
              <ProfileModal
                address={address}
                loginProfile={loginProfile}
                createProfile={createProfile}
                logoutProfile={logoutProfile}
              />
            </Modal>
            <Button
              type="primary"
              key="meun-open-button"
              onClick={() => {
                setDrawerCollapsed(true);
              }}
              style={{ marginLeft: 20 }}
            >
              Menu
            </Button>
          </Space>
          <Drawer
            title={
              <h4>
                <TbCurrencyEthereum />
                ETHChess ♘
              </h4>
            }
            key="menu-drawer"
            placement="left"
            width={"auto"}
            onClose={() => {
              setDrawerCollapsed(false);
            }}
            tabIndex={0}
            visible={drawerCollapsed}
            bodyStyle={{ paddingBottom: 80 }}
            footer={false}
          >
            <div
              style={{
                width: 256,
              }}
            >
              <Menu
                style={{ textAlign: "center", marginTop: 20, fontSize: 20 }}
                selectedKeys={[location.pathname]}
                mode="inline"
                // inlineCollapsed={collapsed}
                // onSelect={toggleCollapsed}
                defaultSelectedKeys={["/"]}
              >
                {/* <Button
                  type="primary"
                  onClick={toggleCollapsed}
                  style={{
                    marginBottom: 16,
                  }}
                >
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </Button> */}
                <Menu.Item icon={<FaChessBoard />} key="/">
                  <Link to="/">Home</Link>
                </Menu.Item>
                <Menu.Item icon={<FaChess />} key="/lobby">
                  <Link to="/lobby">Lobby</Link>
                </Menu.Item>
                <Menu.Item icon={<FaVoteYea />} key="/disputes">
                  <Link to="/disputes">Voting</Link>
                </Menu.Item>
                <Menu.Item icon={<FaChessKing />} key="/profile">
                  <Link to="/profile">Profile</Link>
                </Menu.Item>
                <Menu.Item icon={<FaInfo />} key="/info">
                  <Link to="/info">Info</Link>
                </Menu.Item>
                <Divider />
                <Card>
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <Space>
                      <h5>
                        <BsPersonFill /> Live Players: 22
                      </h5>
                    </Space>
                  </div>
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <Space>
                      <h5>
                        <FaChess /> Games Played(24hrs): 204
                      </h5>
                    </Space>
                  </div>
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <Space>
                      <h5>
                        <TbCurrencyEthereum /> ETH Wagered(24hrs): 128
                      </h5>
                    </Space>
                  </div>
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <Space>
                      <h5>
                        <GiTakeMyMoney />
                        Rewards Pot: $106,743.32
                      </h5>
                    </Space>
                  </div>
                  <p style={{ fontSize: 10 }}>*stats are temporary placeholders*</p>
                </Card>
              </Menu>
            </div>
          </Drawer>
          <Content>
            <NetworkDisplay
              style={{ marginTop: 60 }}
              NETWORKCHECK={NETWORKCHECK}
              localChainId={localChainId}
              selectedChainId={selectedChainId}
              targetNetwork={targetNetwork}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
            />

            <h1>Currently In Development Stage!</h1>
            <Switch>
              <Route exact path="/">
                <Home gun={gun} address={address} readContracts={readContracts} timeStamp={startTime} />
              </Route>
              <Route exact path="/lobby">
                <Lobby
                  gun={gun}
                  address={address}
                  player={player}
                  setPlayer={setPlayer}
                  tx={tx}
                  readContracts={readContracts}
                  writeContracts={writeContracts}
                  startTime={startTime}
                  loggedIn={loggedIn}
                  setLoginModal={setLoginModal}
                  mainnetProvider={mainnetProvider}
                />
              </Route>
              <Route exact path="/match">
                <ChessMatch
                  startTime={startTime}
                  address={address}
                  userSigner={userSigner}
                  mainnetProvider={mainnetProvider}
                  localProvider={localProvider}
                  yourLocalBalance={yourLocalBalance}
                  price={price}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  gun={gun}
                />
              </Route>
              <Route exact path="/skirmish/room/:gameId">
                <ChessSkirmishes gun={gun} />
              </Route>
              <Route exact path="/skirmish/view/:gameId">
                <ChessViewer gun={gun} />
              </Route>
              <Route exact path="/match/ai">
                <ChessMatch />
              </Route>
              <Route exact path="/match/room/:gameId">
                <ETHMatch tx={tx} writeContracts={writeContracts} gun={gun} />
              </Route>
              <Route exact path="/deathmatch/room/:gameId">
                <ETHDeathMatch tx={tx} writeContracts={writeContracts} gun={gun} />
              </Route>
              <Route exact path="/deathmatch/view/:gameId">
                <ChessViewer gun={gun} />
              </Route>
              <Route exact path="/match/view/:gameId">
                <ChessViewer gun={gun} />
              </Route>
              <Route exact path="/disputes">
                <Voting
                  address={address}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  gun={gun}
                />
              </Route>
              <Route exact path="/disputes/:disputeId">
                <Disputes />
              </Route>
              <Route exact path="/profile">
                <Profile
                  address={address}
                  gunUser={gunUser}
                  setGunUser={setGunUser}
                  loggedIn={loggedIn}
                  startTime={startTime}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  gun={gun}
                  loginProfile={loginProfile}
                  createProfile={createProfile}
                  logoutProfile={logoutProfile}
                />
              </Route>
              <Route exact path="/profile/:account">
                <ProfilePage address={address} gun={gun} />
              </Route>
              <Route exact path="/mint">
                <Mint
                  address={address}
                  userSigner={userSigner}
                  localProvider={localProvider}
                  yourLocalBalance={yourLocalBalance}
                  price={price}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  gun={gun}
                />
              </Route>
              <Route exact path="/info">
                <Info />
              </Route>
              <Route exact path="/developer">
                {/*
          🎛 this scaffolding is full of commonly used components
          this <Contract/> component will automatically parse your ABI
          and give you a form to interact with it locally
      */}

                <Contract
                  name="ETHChess"
                  price={price}
                  signer={userSigner}
                  provider={localProvider}
                  address={address}
                  blockExplorer={blockExplorer}
                  contractConfig={contractConfig}
                />
              </Route>
              <Route path="/subgraph">
                <Subgraph
                  subgraphUri={props.subgraphUri}
                  tx={tx}
                  writeContracts={writeContracts}
                  mainnetProvider={mainnetProvider}
                />
              </Route>
              <Route path="/*" component={() => <FourOFour gun={gun} />} />
            </Switch>
            <NotifyMatch
              showNotifyMatch={showNotifyMatch}
              setShowNotifyMatch={setShowNotifyMatch}
              matchId={newMatchId}
            />
            <NotifyDeathMatch
              showNotifyDeathMatch={showNotifyDeathMatch}
              setShowNotifyDeathMatch={setShowNotifyDeathMatch}
              matchId={newMatchId}
            />
            <NotifyDispute
              showNotifyDispute={showNotifyDispute}
              setShowNotifyDispute={setShowNotifyDispute}
              matchId={newMatchId}
            />
            <ThemeSwitch />
            <LinkFooter />
          </Content>
        </Layout>
      </Layout>
    </div>
  ) : (
    <div className="App">
      <div style={{ marginTop: 200, marginBottom: 200 }}>
        <PieceBouncer />
      </div>
    </div>
  );
}

export default App;
