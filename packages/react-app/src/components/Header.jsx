import React, { useEffect, useState } from 'react'
import {
  Box, Button, chakra, Flex, Image, Spacer, Stack, Text, Tooltip,
  ButtonGroup, useColorMode, Wrap, Grid,
} from '@chakra-ui/react'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import ChainAlert from './ChainAlert'
import Account from './Account'
import logo from '../logo.svg'
import '@fontsource/crimson-text/600.css'

const NetworkMismatch = ({
  targetChainId, selectedChainId, NETWORK,
}) => {
  if(
    targetChainId && selectedChainId
    && targetChainId !== selectedChainId
  ) {
    return (
      <ChainAlert
        {...{ NETWORK, selectedChainId, targetChainId }}
        position="absolute" top={3} right={0} zIndex={2}
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

const Links = ({ links, path }) => (
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
)

const Title = ({ title, ...props }) => (
  <Link to="/">
    <Flex {...props}>
      <Image src={logo} h="2rem"/>
      <Text ml={3} fontFamily="Crimson Text" fontSize={35}>
        Wearables NFT Manager{title ? `: ${title}` : ''}
      </Text>
    </Flex>
  </Link>
)

const Network = ({
  toggleColorMode, colorMode, address,
  injectedProvider, mainnetProvider, blockExplorer,
  web3Modal, loadWeb3Modal, logoutOfWeb3Modal,
  targetChainId, NETWORK, path,
}) => {
  const [selectedChainId, setSelectedChainId] = useState(null)

  useEffect(() => {
    (async () => {
      setSelectedChainId(
        (await injectedProvider?.getNetwork())?.chainId ?? null
      )
    })()
  }, [injectedProvider])

  return (
    <Grid
      gridTemplateColumns={{
        base: '1fr 1fr [end]', sm: (
          `${address ? '0fr 1fr 0fr' : '0fr 0fr'} [end]`
        )
      }}
      alignSelf={{ base: 'center', sm: 'start' }}
      mt={[2, '-1rem']} ml={1.5}
    >
      <Button
        gridColumn={1}
        gridRow={{ base: 2, sm: 1 }}
        onClick={toggleColorMode}
        mx={1} p={0}
      >
        {colorMode !== 'light' ? '🔆' : '🌛'}
      </Button>
      {address && (
        <Account
          gridColumn={{ base: '1 / span 3', sm: 2 }}
          gridRow={1}
          {...{
            address,
            injectedProvider,
            mainnetProvider,
            blockExplorer,
          }}
        />
      )}
      <Stack
        gridColumn="end"
        gridRow={{ base: 2, sm: 1 }}
        mr={5}
      >
        <ConnectionButton {...{
          web3Modal, loadWeb3Modal, logoutOfWeb3Modal,
        }}/>
        <NetworkDisplay {...{
          injectedProvider, NETWORK, selectedChainId,
        }}/>
      </Stack>
      {!['/view', '/'].includes(path) && (
        <NetworkMismatch
          {...{
            targetChainId, selectedChainId, NETWORK,
          }}
        />
      )}
    </Grid>
  )
}

export default ({
  ...props
}) => {
  const location = useLocation()
  const path = (
    location.pathname
    .replace(/^(\/[^/]*)(\/.+)?$/, (_, group) => group)
  ) 
  const title = paths[path]
  const { colorMode, toggleColorMode } = useColorMode()
  const uiProps = {...props}
  const netProps = {...props}

  ;([
    'NETWORK', 'targetNetwork', 'address', 'injectedProvider',
    'mainnetProvider', 'web3Modal', 'loadWeb3Modal',
    'logoutOfWeb3Modal', 'blockExplorer', 'targetChainId'
  ])
  .forEach((prop) => delete uiProps[prop])

  Object.keys(uiProps).forEach((prop) => delete netProps[prop])

  return (
    <chakra.header
      {...uiProps} bg={colorMode === 'light' ? 'white' : 'gray.800'}
      top={0} position={['inherit', 'sticky']} zIndex={2}
    >
      <Flex align="center" direction={['column', 'row']}>
        <Links {...{ links, path }}/>
        <Spacer grow={1}/>
        <Title {...{ title }} mt={{ base: 2, sm: 0 }}/>
        <Spacer grow={1}/>
        <Network {...netProps} {...{ toggleColorMode, path }}/>
      </Flex>
      <NetworkMismatch

      />
    </chakra.header>
  )
}