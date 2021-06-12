import React from "react"
import {
  Box, Button, chakra, Flex, Image, Spacer, Stack, Text, Tooltip,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import "@fontsource/crimson-text/600.css"
import logo from '../logo.svg'
import ChainAlert from "./ChainAlert"
import Account from "./Account"
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons"

export default ({
  NETWORK, address, blockExplorer, targetNetwork,
  localProvider, injectedProvider, mainnetProvider,
  web3Modal, loadWeb3Modal, logoutOfWeb3Modal,
  ...props
}) => {
  let localChainId = localProvider?._network?.chainId
  let selectedChainId = injectedProvider?._network?.chainId

  let NetworkDisplay = () => (
    <Box mt="0 ! important">
      {targetNetwork.name}
    </Box>
  )
  console.info('CHAINS', injectedProvider?._network, localChainId, selectedChainId)
  if(localChainId && selectedChainId && localChainId != selectedChainId) {
    NetworkDisplay = () => (
      <Box>
        <ChainAlert {...{ NETWORK, selectedChainId, localChainId }}/>
      </Box>
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
      top={0} position="sticky" zIndex={10}
    >
      <Flex align="center">
        <Link to="/">
          <Flex>
            <Image src={logo} h="2rem"/>
            <Text ml={3} fontFamily="Crimson Text" fontSize={35}>
              MetaFactory Wearables NFT Manager
            </Text>
          </Flex>
        </Link>
        <Spacer grow={1}/>
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
    </chakra.header>
  )
}