import React, { useEffect, useState } from 'react'
import {
  Box, Button, chakra, Flex, Image, Spacer, Stack, Text, Tooltip,
  ButtonGroup,
} from '@chakra-ui/react'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import ChainAlert from './ChainAlert'
import Account from './Account'
import logo from '../logo.svg'
import '@fontsource/crimson-text/600.css'

export default ({
  NETWORK, address, blockExplorer, targetNetwork,
  localProvider, injectedProvider, mainnetProvider,
  web3Modal, loadWeb3Modal, logoutOfWeb3Modal,
  ...props
}) => {
  const location = useLocation()
  const paths = {
    '/': 'List',
    '/new': 'Create',
    '/disburse': 'Distribute',
    '/edit': 'Edit',
    '/view': 'Display',
  }
  const links = {
    '/': {
      title: 'List Existing NFTs', icon: '🗃️',
    },
    '/new': {
      title: 'Create a New NFT', icon: '➕',
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
  const path = (
    location.pathname
    .replace(/^(\/[^/]*)(\/.+)?$/, (str, group) => group)
  ) 
  const title = paths[path]
  const localChainId = localProvider?._network?.chainId
  const [selectedChainId, setSelectedChainId] = useState(null)
  const NetworkDisplay = () => (
    <Box mt="0 ! important" w="100%" textAlign="center">
      {!injectedProvider ? 'Disconnected' : (
        NETWORK(selectedChainId)?.name ?? `Unknown (${selectedChainId})`
      )}
    </Box>
  )

  useEffect(() => {
    if(injectedProvider) {
      (async () => {
        setSelectedChainId(
          (await injectedProvider.getNetwork()).chainId
        )
      })()
    }
  }, [injectedProvider])
  
  let NetworkMismatch = null
  if(localChainId && selectedChainId && localChainId !== selectedChainId) {
    NetworkMismatch = () => (
      <ChainAlert
        {...{ NETWORK, selectedChainId, localChainId }}
        position="absolute" top={3} right={3} zIndex={2}
      />
    )
  }

  const ConnectionButton = () => {
    if(!web3Modal) return null
  
    if(web3Modal.cachedProvider) {
      return (
        <Tooltip key="logout" placement="bottom" label="Logout">
          <Button
            onClick={logoutOfWeb3Modal}
          >
            <LogoutOutlined/>
          </Button>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip key="login" placement="bottom" label="Login">
          <Button
            onClick={loadWeb3Modal}
          >
            <LoginOutlined/>
          </Button>
        </Tooltip>
      )
    }
  }

  return (
    <chakra.header
      {...props} bg="white" // brittle
      top={0} position={['inherit', 'sticky']} zIndex={2}
    >
      <Flex align="center" direction={['column', 'row']}>
        <Link to="/">
          <Flex>
            <Image src={logo} h="2rem"/>
            <Text ml={3} fontFamily="Crimson Text" fontSize={35}>
              MetaFactory Wearables NFT Manager{title ? `: ${title}` : ''}
            </Text>
          </Flex>
        </Link>
        <Spacer grow={1}/>
        <ButtonGroup isAttached variant="outline">
          {Object.entries(links).map(([link, { title, icon }]) => (
            <Link to={link} key={link}>
              <Button
                title={title}
                borderWidth={3}
                colorScheme={link === path ? 'blue' : 'gray'}
              >
                {icon}
              </Button>
            </Link>
          ))}
        </ButtonGroup>
        <Spacer grow={1}/>
        <Flex mt={[5, '-1rem']}>
          {address && (
            <Account
              {...{
                address,
                localProvider,
                injectedProvider,
                mainnetProvider,
                blockExplorer,
              }}
            />
          )}
          <Stack mr={5}>
            <ConnectionButton/>
            <NetworkDisplay/>
          </Stack>
        </Flex>
        {NetworkMismatch && <NetworkMismatch/>}
      </Flex>
    </chakra.header>
  )
}