import React, { useCallback, useEffect, useState } from "react"
import { BrowserRouter, Switch, Route, Link } from "react-router-dom"
import "antd/dist/antd.css"
import {
  StaticJsonRpcProvider, JsonRpcProvider, Web3Provider,
} from "@ethersproject/providers"
import "./App.css"
import { Row, Col, Button, Menu, Switch as SwitchD } from "antd"
import {
  Box, Alert, AlertIcon, AlertTitle, AlertDescription,
  CloseButton, Tabs, TabList, TabPanels, Tab, TabPanel,
} from '@chakra-ui/react'
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
  const gasPrice = useGasPrice(targetNetwork, 'fast') // EtherGasStation
  const userProvider = useUserProvider(injectedProvider, localProvider)
  const address = useUserAddress(userProvider)
  let localChainId = localProvider?._network?.chainId
  let selectedChainId = userProvider?._network?.chainId
  const tx = Transactor(userProvider, gasPrice)
  const readContracts = useContractLoader(localProvider)
  const writeContracts = useContractLoader(userProvider)

  let NetworkDisplay = () => (
    <Box
      zIndex={1} position="absolute"
      right="13em" top={5}
      color={targetNetwork.color}
    >
      {targetNetwork.name}
    </Box>
  )
  if(localChainId && selectedChainId && localChainId != selectedChainId) {
    NetworkDisplay = () => (
      <Box
        zIndex={2} position="absolute"
        right={0} top={5}
      >
        <Alert status="error" maxW="6em">
          <AlertIcon />
          <AlertTitle mr={2}>⚠️ Wrong Network:</AlertTitle>
          <AlertDescription>
            You have <b>{NETWORK(selectedChainId)?.name ?? "Unknown"}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
          </AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      </Box>
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

  return (
    <div className="App">
      <Header />
      <NetworkDisplay/>
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
          <Route exact path="/token/:id">
            <Token
              {...{ address }}
              ensProvider={mainnetProvider}
              contract={writeContracts?.WearablesNFTs}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      <Box
        position="fixed"
        textAlign="right"
        right={0} top={0}
        padding={10}
      >
        <Account
          {...{ address,
            localProvider,
            userProvider,
            mainnetProvider,
            web3Modal,
            loadWeb3Modal,
            logoutOfWeb3Modal,
            blockExplorer,
          }}
        />
      </Box>

      <Box
        position="fixed" textAlign="left"
        left={0} bottom={0} padding={10}
      >
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
        </Row>
      </Box>
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
