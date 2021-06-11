import React from "react"
import { Button, Tooltip, Flex, Box, Image } from '@chakra-ui/react'
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { useThemeSwitcher } from "react-css-theme-switcher"
import Address from './Address'
import Balance from './Balance'
import Wallet from './Wallet'

/*
  ~ What it does? ~

  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

  ~ How can I use? ~

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

  ~ Features ~

  - Provide address={address} and get balance corresponding to the given address
  - Provide localProvider={localProvider} to access balance on local network
  - Provide userProvider={userProvider} to display a wallet
  - Provide mainnetProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
*/

export default ({
  address,
  userProvider,
  localProvider,
  mainnetProvider,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
}) => {
  const modalButtons = []
  
  if(web3Modal) {
    if(web3Modal.cachedProvider) {
      modalButtons.push(
        <Tooltip key="logout" placement="bottom" label="Logout">
          <Button
            onClick={logoutOfWeb3Modal}
          >
            <LogoutOutlined />
          </Button>
        </Tooltip>
      )
    } else {
      modalButtons.push(
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

  const display = minimized ? null : (
    <Flex ml={2}>
      {address ? (
        <Address
          {...{ address, blockExplorer }}
          ensProvider={mainnetProvider}
          size="short"
          SecondLine={() => (
            <Balance {...{ address }} provider={localProvider}/>
          )}
        />
      ) : (
        "Connecting…"
      )}
    </Flex>
  )

  return (
    <Flex>
      {display}
      {modalButtons}
    </Flex>
  )
}
