import React, { useEffect, useState } from 'react'
import {
  Box, Button, chakra, Flex, Image, Spacer, Stack, Text, Tooltip,
  ButtonGroup, useColorMode, Wrap,
} from '@chakra-ui/react'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import ChainAlert from './ChainAlert'
import Account from './Account'
import logo from '../logo.svg'
import '@fontsource/crimson-text/600.css'

let NetworkMismatch = ({
  localChainId, selectedChainId, NETWORK,
}) => {
  if(
    localChainId && selectedChainId
    && localChainId !== selectedChainId
  ) {
    return (
      <ChainAlert
        {...{ NETWORK, selectedChainId, localChainId }}
        position="absolute" top={3} right={3} zIndex={2}
      />
    )
  }
  return null
}

const ConnectionButton = ({
  web3Modal, logoutOfWeb3Modal, loadWeb3Modal,
}) => {
  if(!web3Modal) return null

  if(web3Modal.cachedProvider) {
    return (
      <Tooltip hasArrow key="logout" placement="bottom" label="Logout">
        <Button
          onClick={logoutOfWeb3Modal}
        >
          <LogoutOutlined/>
        </Button>
      </Tooltip>
    )
  }
  return (
    <Tooltip hasArrow key="login" placement="bottom" label="Login">
      <Button
        onClick={loadWeb3Modal}
      >
        <LoginOutlined/>
      </Button>
    </Tooltip>
  )
}

const NetworkDisplay = ({
  injectedProvider, NETWORK, selectedChainId,
}) => (
  <Box mt="0 ! important" w="100%" textAlign="center">
    {!injectedProvider ? 'Disconnected' : (
      NETWORK(selectedChainId)?.name
      ?? `Unknown (${selectedChainId})`
    )}
  </Box>
)

const paths = {
  '/': 'List',
  '/new': 'Create',
  '/disburse': 'Distribute',
  '/edit': 'Edit',
  '/view': 'Display',
}
const links = {
  '/new': {
    title: 'Create a New NFT', icon: '➕',
  },
  '/': {
    title: 'List Existing NFTs', icon: '🗃️',
  },
  '/disburse': {
    title: 'Distribute Existing NFTs', icon: '⛲',
  },
  '/view': {
    title: 'View NFT', icon: '👁️',
  },
  '/edit': {
    title: 'Edit NFT Metadata', icon: '✏️',
  },
}

export default ({
  NETWORK, address, blockExplorer, targetNetwork,
  localProvider, injectedProvider, mainnetProvider,
  web3Modal, loadWeb3Modal, logoutOfWeb3Modal,
  ...props
}) => {
  const location = useLocation()
  const path = (
    location.pathname
    .replace(/^(\/[^/]*)(\/.+)?$/, (_, group) => group)
  ) 
  const title = paths[path]
  const { colorMode, toggleColorMode } = useColorMode()
  const localChainId = localProvider?._network?.chainId
  const [selectedChainId, setSelectedChainId] = useState(null)

  useEffect(() => {
    if(injectedProvider) {
      (async () => {
        setSelectedChainId(
          (await injectedProvider.getNetwork()).chainId
        )
      })()
    }
  }, [injectedProvider])
  
  return (
    <chakra.header
      {...props} bg={colorMode === 'light' ? 'white' : 'gray.800'}
      top={0} position={['inherit', 'sticky']} zIndex={2}
    >
      <Flex align="center" direction={['column', 'row']}>
        <Link to="/">
          <Flex>
            <Image src={logo} h="2rem"/>
            <Text ml={3} fontFamily="Crimson Text" fontSize={35}>
              Wearables NFT Manager{title ? `: ${title}` : ''}
            </Text>
          </Flex>
        </Link>
        <Spacer grow={1}/>
        <ButtonGroup isAttached variant="outline">
          <Wrap justify="center">
            {Object.entries(links).map(
              ([link, { title, icon }]) => (
                <Tooltip
                  hasArrow key={link}
                  placement="bottom" label={title}
                >
                  <Link to={link} style={{ margin: 0 }}>
                    <Button
                      title={title}
                      borderWidth={3}
                      colorScheme={link === path ? 'blue' : 'gray'}
                    >
                      {icon}
                    </Button>
                  </Link>
                </Tooltip>
              )
            )}
          </Wrap>
        </ButtonGroup>
        <Spacer grow={1}/>
        <Flex mt={[5, '-1rem']} ml={1.5}>
          <Flex>
            <Button onClick={toggleColorMode} mx={1} p={0}>
              {colorMode !== 'light' ? '🔆' : '🌛'}
            </Button>
            {address && (
              <Account {...{
                address,
                localProvider,
                injectedProvider,
                mainnetProvider,
                blockExplorer,
              }}/>
            )}
          </Flex>
          <Stack mr={5}>
            <ConnectionButton {...{
              web3Modal, logoutOfWeb3Modal, loadWeb3Modal,
            }}/>
            <NetworkDisplay {...{
              injectedProvider, NETWORK, selectedChainId,
            }}/>
          </Stack>
        </Flex>
        <NetworkMismatch {...{
          localChainId, selectedChainId, NETWORK,
        }}/>
      </Flex>
    </chakra.header>
  )
}