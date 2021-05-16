import React from "react"
import { Button, Tooltip } from "antd"
import { LogoutOutlined } from "@ant-design/icons"
import { useThemeSwitcher } from "react-css-theme-switcher"
import Address from "./Address"
import Balance from "./Balance"
import Wallet from "./Wallet"

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
        <Tooltip key="logoutbutton" placement="bottom" title="Logout">
          <Button
            style={{
              verticalAlign: "top",
              marginLeft: 8,
              marginTop: 4,
            }}
            shape="round"
            size="large"
            onClick={logoutOfWeb3Modal}
          >
            <LogoutOutlined />
          </Button>
        </Tooltip>
      )
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{
            verticalAlign: "top",
            marginLeft: 8,
            marginTop: 4,
          }}
          shape="round"
          size="large"
          onClick={loadWeb3Modal}
        >
          connect
        </Button>
      )
    }
  }

  const { currentTheme } = useThemeSwitcher()

  const display = minimized ? null : (
    <span>
      {address ? (
        <Address
          address={address}
          ensProvider={mainnetProvider}
          blockExplorer={blockExplorer}
          size="short"
        />
      ) : (
        "Connecting…"
      )}
      <Balance address={address} provider={localProvider}/>
      <Wallet
        address={address}
        provider={userProvider}
        ensProvider={mainnetProvider}
        color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
      />
    </span>
  )

  return (
    <div>
      {display}
      {modalButtons}
    </div>
  )
}
