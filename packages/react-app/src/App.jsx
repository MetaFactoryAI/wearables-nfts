import React, { useCallback, useEffect, useState } from 'react'
import {
  HashRouter as Router, Switch, Route,
} from 'react-router-dom'
import {
  StaticJsonRpcProvider, Web3Provider,
} from '@ethersproject/providers'
import { Box } from '@chakra-ui/react'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { useUserAddress } from 'eth-hooks'
import { useContractLoader } from './hooks'
import { Header } from './components'
import { INFURA_ID, NETWORK, NETWORKS } from './constants'
import ExistingNFTs from './views/ExistingNFTs'
import CreateNFT from './views/CreateNFT'
import DisburseOrList from './views/DisburseOrList'
import EditOrList from './views/EditOrList'
import ViewOrList from './views/ViewOrList'

const targetNetwork = NETWORKS['rinkeby'] // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
const mainnetInfura = (
  new StaticJsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)
)
const mainnetProvider = mainnetInfura

let localProviderUrl = targetNetwork.rpcUrl
localProviderUrl = (
  process.env.REACT_APP_PROVIDER ?? localProviderUrl
)
const localProvider = new StaticJsonRpcProvider(localProviderUrl)
const blockExplorer = targetNetwork.blockExplorer

export default (props) => {
  const [injectedProvider, setInjectedProvider] = useState()
  const address = useUserAddress(injectedProvider)
  const writeContracts = useContractLoader(injectedProvider)
  const [validNetwork, setValidNetwork] = useState(false)

  useEffect(() => {
    (async () => {
      if(injectedProvider) {
        const chainId = (await injectedProvider.getNetwork()).chainId
        setValidNetwork(chainId === targetNetwork.chainId)
      }
    })()
  }, [injectedProvider])

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect()
    setInjectedProvider(new Web3Provider(provider))
  }, [setInjectedProvider])

  useEffect(() => {
    if(web3Modal.cachedProvider) {
      loadWeb3Modal()
    }
  }, [loadWeb3Modal])

  return (
    <Box className="App">
      <Router>
        <Header
          minH="4em" pl={10} pt={5}
          {...{
            NETWORK,
            targetNetwork,
            address,
            localProvider,
            injectedProvider,
            mainnetProvider,
            web3Modal,
            loadWeb3Modal,
            logoutOfWeb3Modal,
            blockExplorer,
          }}
        />

        <Switch>
          <Route path='/new'>
            <CreateNFT
              contract={writeContracts?.WearablesNFTs}
              treasurer={address}
              {...{ validNetwork }}
            />
          </Route>
          <Route path='/edit/:id?'>
            <EditOrList
              {...{ validNetwork }}
              contract={writeContracts?.WearablesNFTs}
            />
          </Route>
          <Route path='/view/:id?' component={ViewOrList}/>
          <Route path='/disburse/:id?'>
            <DisburseOrList
              {...{ address, validNetwork }}
              ensProvider={mainnetProvider}
              contract={writeContracts?.WearablesNFTs}
            />
          </Route>
          <Route path='/'>
            <ExistingNFTs ensProvider={mainnetProvider}/>
          </Route>
        </Switch>
      </Router>
    </Box>
  )
}

const web3Modal = new Web3Modal({
  // network: 'mainnet', // optional
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
