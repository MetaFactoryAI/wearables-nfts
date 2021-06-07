import React, { useCallback, useEffect, useState } from "react"
import { BrowserRouter, Switch, Route, Link } from "react-router-dom"
import "antd/dist/antd.css"
import {
  StaticJsonRpcProvider, JsonRpcProvider, Web3Provider,
} from "@ethersproject/providers"
import "./App.css"
import { Row, Col, Button, Menu, Alert, Switch as SwitchD } from "antd"
import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { useUserAddress } from "eth-hooks"
import {
  useGasPrice, useUserProvider, useContractLoader,
  useContractReader, useEventListener, useBalance,
} from "./hooks"
import {
  Header, Account, Contract, GasGauge, ThemeSwitch,
} from "./components"
import { Transactor } from "./helpers"
import { formatEther, parseEther } from "@ethersproject/units"
import { INFURA_ID, NETWORK, NETWORKS } from "./constants"
import NFTCreator from "./views/NFTCreator"
import NewNFT from "./views/NewNFT"
import EditNFT from "./views/EditNFT"
import Token from "./views/Token"

/// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS['localhost'] // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const targetNetwork = NETWORKS['rinkeby'] // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum")
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const scaffoldEthProvider = (
  new StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
)
const mainnetInfura = (
  new StaticJsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)
)

let localProviderUrl = targetNetwork.rpcUrl
localProviderUrl = (
  process.env.REACT_APP_PROVIDER ?? localProviderUrl
)
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrl)
const localProvider = new StaticJsonRpcProvider(localProviderUrl)

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer

export default (props) => {
  const mainnetProvider = (
    (scaffoldEthProvider && scaffoldEthProvider._network) ? (
      scaffoldEthProvider
    ) : (
      mainnetInfura
    )
  )
  const [injectedProvider, setInjectedProvider] = useState()
  const gasPrice = useGasPrice(targetNetwork, "fast") // EtherGasStation
  const userProvider = useUserProvider(injectedProvider, localProvider)
  const address = useUserAddress(userProvider)
  let localChainId = localProvider?._network?.chainId
  let selectedChainId = userProvider?._network?.chainId
  const tx = Transactor(userProvider, gasPrice)
  const yourLocalBalance = useBalance(localProvider, address)
  const readContracts = useContractLoader(localProvider)
  const writeContracts = useContractLoader(userProvider)
  const faucetTx = Transactor(localProvider, gasPrice)

  // // If you want to call a function on a new block
  // useOnBlock(mainnetProvider, () => {
  //   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`)
  // })

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "WearablesNFTs", "purpose")

  const singleEvents = useEventListener({
    contracts: readContracts,
    name: "WearablesNFTs",
    event: "TransferSingle",
    provider: localProvider,
    startBlock: 1
  })
  const batchEvents = useEventListener({
    contracts: readContracts,
    name: "WearablesNFTs",
    event: "TransferBatch",
    provider: localProvider,
    startBlock: 1
  })

  useEffect(() => {
    if(DEBUG) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________")
      console.log("🌎 mainnetProvider", mainnetProvider)
      console.log("🏠 localChainId", localChainId)
      console.log("👩‍💼 selected address:", address)
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId)
      console.log(
        "💵 yourLocalBalance",
        yourLocalBalance ? formatEther(yourLocalBalance) : "…"
      )
      console.log("📝 readContracts", readContracts)
      console.log("🔐 writeContracts", writeContracts)
    }
  }, [
    mainnetProvider, address, selectedChainId,
    yourLocalBalance, readContracts, writeContracts
  ])

  let networkDisplay
  if(localChainId && selectedChainId && localChainId != selectedChainId) {
    networkDisplay = (
      <div style={{
        zIndex: 2, position: 'absolute', right: 0, top: 60, padding: 16,
      }}>
        <Alert
          message="⚠️ Wrong Network"
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId)?.name ?? "Unknown"}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    )
  } else {
    networkDisplay = (
      <div style={{
        zIndex: -1, position: 'absolute', right: 154, top: 28, padding: 16, color: targetNetwork.color
      }}>
        {targetNetwork.name}
      </div>
    )
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect()
    setInjectedProvider(new Web3Provider(provider))
  }, [setInjectedProvider])

  useEffect(() => {
    if(web3Modal.cachedProvider) {
      loadWeb3Modal()
    }
  }, [loadWeb3Modal])

  const [route, setRoute] = useState()
  useEffect(() => {
    setRoute(window.location.pathname)
  }, [setRoute])

  let faucetHint = null
  const [faucetClicked, setFaucetClicked] = useState(false)
  if(!faucetClicked && localProvider?._network?.chainId === 31337 && yourLocalBalance && formatEther(yourLocalBalance) <= 0) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button type="primary" onClick={() => {
          faucetTx({
            to: address,
            value: parseEther("0.01"),
          })
          setFaucetClicked(true)
        }}>
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    )
  }

  return (
    <div className="App">
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu
          style={{ textAlign: "center" }}
          selectedKeys={[route]}
          mode="horizontal"
        >
          <Menu.Item key="/">
            <Link onClick={() => setRoute("/")} to="/">
              📺 Consumers
            </Link>
          </Menu.Item>
          <Menu.Item key="/create">
            <Link onClick={() => setRoute("/create")} to="/create">
              🎨 Creators
            </Link>
          </Menu.Item>
          <Menu.Item key="/new">
            <Link onClick={() => setRoute("/new")} to="/new">
              ➕ New
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {writeContracts ? (
              <NFTCreator
                {...{ singleEvents, batchEvents }}
                ensProvider={mainnetProvider}
                contract={writeContracts?.WearablesNFTs}
              />
            ) : (
              <p>Unable to retrieve contracts. ¿Have they been created?</p>
            )}
          </Route>
          <Route exact path="/create">
            <Contract
              name="WearablesNFTs"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route exact path="/new">
            {writeContracts ? (
              <NewNFT
                contract={writeContracts?.WearablesNFTs}
                treasurer={address}
              />
            ) : (
              <p>Unable to retrieve contracts. ¿Have they been created?</p>
            )}
          </Route>
          <Route exact path="/edit/:id?">
            {readContracts ? (
              <EditNFT
                {...{ tx }}
                contract={readContracts?.WearablesNFTs}
              />
            ) : (
              <p>Unable to retrieve contracts. ¿Have they been created?</p>
            )}
          </Route>
          <Route exact path="/token/:id?">
            <Token ensProvider={mainnetProvider}/>
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{
        position: "fixed",
        textAlign: "right",
        right: 0,
        top: 0,
        padding: 10,
      }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      <div style={{
        position: "fixed", textAlign: "left",
        left: 0, bottom: 20, padding: 10,
      }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
        </Row>
      </div>
    </div>
  )
}

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider()
  setTimeout(() => window.location.reload(), 1)
}

let _ = window?.ethereum?.on('chainChanged', (chainId) => (
  web3Modal.cachedProvider && (
    setTimeout(() => window.location.reload(), 1)
  )
))

_ = window?.ethereum?.on('accountsChanged', (accounts) => (
  web3Modal.cachedProvider && (
    setTimeout(() => window.location.reload(), 1)
  )
))
