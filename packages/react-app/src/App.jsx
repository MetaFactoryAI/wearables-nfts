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
import { Helmet } from 'react-helmet'
import {
  useContractLoader, useLookupAddress, useUserAddress,
} from './hooks'
import { Header } from './components'
import { INFURA_ID, NETWORK, NETWORKS } from './constants'
import ExistingNFTs from './views/ExistingNFTs'
import CreateNFT from './views/CreateNFT'
import DisburseOrList from './views/DisburseOrList'
import EditOrList from './views/EditOrList'
import ViewOrList from './views/ViewOrList'
import { capitalize } from './helpers'

const targetNetwork = NETWORKS['rinkeby']
const mainnetInfura = (
  new StaticJsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)
)
const mainnetProvider = mainnetInfura

// let localProviderUrl = targetNetwork.rpcUrl
// localProviderUrl = (
//   process.env.REACT_APP_PROVIDER ?? localProviderUrl
// )
// const localProvider = new StaticJsonRpcProvider(localProviderUrl)

const blockExplorer = targetNetwork.blockExplorer

const web3Modal = new Web3Modal({
  network: targetNetwork.name, // optional
  cacheProvider: true,         // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
})

export default () => {
  const [injectedProvider, setInjectedProvider] = useState()
  const address = useUserAddress(injectedProvider)
  const ensName = useLookupAddress(mainnetProvider, address)
  const writeContracts = useContractLoader(injectedProvider)
  const [desiredNetwork, setDesiredNetwork] = (
    useState(targetNetwork.name)
  )

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect()
    setInjectedProvider(new Web3Provider(provider))
  }, [setInjectedProvider])

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider()
    setInjectedProvider(null)
  }

  useEffect(() => {
    const chainSub = window.ethereum?.on(
      'chainChanged', loadWeb3Modal
    )
    const accountSub = window.ethereum?.on(
      'accountsChanged', loadWeb3Modal
    )
    return () => {
      let _ = window.ethereum?.unsubscribe?.(chainSub)
      _ = window.ethereum?.unsubscribe?.(accountSub)
    }
  }, [loadWeb3Modal])

  useEffect(() => {
    (async () => {
      const chainId = (await injectedProvider?.getNetwork())?.chainId
      setDesiredNetwork(
        chainId !== targetNetwork.chainId ? (
          capitalize(targetNetwork.name)
        ) : (
          null
        )
      )
    })()
  }, [injectedProvider])

  useEffect(() => {
    if(web3Modal.cachedProvider) {
      loadWeb3Modal()
    }
  }, [loadWeb3Modal])

  return (
    <Box className="App">
      <Helmet>
        <title>MetaFactory Wearables</title>
      </Helmet>
      <Router>
        <Header
          minH={16} pl={10} pt={5}
          {...{
            NETWORK,
            targetNetwork,
            address,
            injectedProvider,
            mainnetProvider,
            web3Modal,
            loadWeb3Modal,
            logoutOfWeb3Modal,
            blockExplorer,
            targetChainId: targetNetwork.chainId,
          }}
        />

        <Switch>
          <Route path='/new'>
            <CreateNFT
              {...{ desiredNetwork }}
              contract={writeContracts?.WearablesNFTs}
              ensProvider={mainnetProvider}
              treasurer={ensName}
            />
          </Route>
          <Route path='/edit/:id?'>
            <EditOrList
              {...{ desiredNetwork }}
              contract={writeContracts?.WearablesNFTs}
            />
          </Route>
          <Route path='/view/:id?'>
            <ViewOrList {...{ desiredNetwork }}/>
          </Route>
          <Route path='/disburse/:id?'>
            <DisburseOrList
              {...{ address, desiredNetwork }}
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