import React from "react"
import Blockies from "react-blockies"
import { Typography, Skeleton } from "antd"
import { Flex, Box, Text } from '@chakra-ui/react'
import { useLookupAddress } from "../hooks"
import { useThemeSwitcher } from "react-css-theme-switcher"

const blockExplorerLink = (
  (address, blockExplorer) => (
    `${blockExplorer ?? "https://etherscan.io/"}address/${address}`
  )
)

export default (props) => {
  const address = props.value ?? props.address
  const ens = useLookupAddress(props.ensProvider, address)
  const { currentTheme } = useThemeSwitcher()

  if(!address) {
    return (
      <span>
        <Skeleton avatar paragraph={{ rows: 1 }} />
      </span>
    )
  }

  let displayAddress = address.substr(0, 6)

  if(ens && !ens.startsWith("0x")) {
    displayAddress = ens
  } else if(props.size === "short") {
    displayAddress += `…${address.substr(-4)}`
  } else if(props.size === "long") {
    displayAddress = address
  }

  const etherscanLink = (
    blockExplorerLink(address, props.blockExplorer)
  )

  const textProps = { copyable: { text: address } }
  if(props.onChange) {
    textProps.editable = { onChange: props.onChange }
  }

  return (
    <Flex>
      <Box verticalAlign="middle">
        <Blockies
          seed={address.toLowerCase()}
          size={8}
          scale={props.fontSize ? props.fontSize / 7 : 4}
        />
      </Box>
      <Box
        verticalAlign="middle"
        paddingLeft={2}
      >
        <Text {...textProps}>
          <a
            style={{
              color: currentTheme === "light" ? "#222" : "#DDD"
            }}
            href={etherscanLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayAddress}
          </a>
        </Text>
      </Box>
    </Flex>
  )
}