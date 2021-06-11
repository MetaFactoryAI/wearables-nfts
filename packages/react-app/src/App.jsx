import React, { useCallback, useEffect, useState } from "react"
import { BrowserRouter, Switch, Route, Link } from "react-router-dom"
import {
  StaticJsonRpcProvider, JsonRpcProvider, Web3Provider,
} from "@ethersproject/providers"
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
import ExistingNFTs from "./views/ExistingNFTs"
import CreateNFT from "./views/CreateNFT"
import NFTProperties from "./views/NFTProperties"
import DisburseNFTs from "./views/DisburseNFTs"
import ChainAlert from "./components/ChainAlert"

/// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS['localhost'] // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const targetNetwork = NETWORKS['rinkeby'] // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum")
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
  const mainnetProvider = mainnetInfura
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
  console.info('CHAINS', userProvider?._network, localChainId, selectedChainId)
  if(localChainId && selectedChainId && localChainId != selectedChainId) {
    NetworkDisplay = () => (
      <Box
        zIndex={2} position="absolute"
        right={2} top={5}
      >
        <ChainAlert {...{ NETWORK, selectedChainId, localChainId }}/>
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
    <Box className="App">
      <Box
        position="fixed" textAlign="right"
        right={2} top={2}
      >
        <Account
          {...{
            address,
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
      <NetworkDisplay/>

      <BrowserRouter>
        <Header minH="4em" pl={10} pt={5}/>

        <Switch>
          <Route path='/'>
            <ExistingNFTs
              ensProvider={mainnetProvider}
            />
          </Route>
          <Route path='/new'>
            <CreateNFT
              contract={writeContracts?.WearablesNFTs}
              treasurer={address}
            />
          </Route>
          <Route path='/edit/:id?' component={NFTProperties}/>
          {/* <Route path='/view/:id?' component={NFTDetails}/> */}
          <Route path='/disburse/:id?'>
            <DisburseNFTs
              {...{ address }}
              ensProvider={mainnetProvider}
              contract={writeContracts?.WearablesNFTs}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <Box
        position="fixed" textAlign="left"
        left={0} bottom={0} padding={10}
      >
        <GasGauge gasPrice={gasPrice} />
      </Box>
    </Box>
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
