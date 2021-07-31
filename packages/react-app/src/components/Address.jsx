import React from 'react'
import Blockies from 'react-blockies'
import {
  Flex, Box, SkeletonText, SkeletonCircle,
} from '@chakra-ui/react'
import { useLookupAddress } from '../hooks'

const blockExplorerLink = (
  (address, blockExplorer) => (
    `${blockExplorer ?? "https://etherscan.io/"}address/${address}`
  )
)

export default (props) => {
  const { SecondLine = null } = props
  const address = props.value ?? props.address
  const ens = useLookupAddress({
    provider: props.ensProvider, address
  })

  if(!address) {
    return (
      <Flex>
        <SkeletonCircle size={7} />
        <SkeletonText w={20} mt={1} ml={1} noOfLines={2} spacing={1} />
      </Flex>
    )
  }

  let displayAddress = `${address.substr(0, 6)}…`

  if(ens && !/^0x[0-9a-f]{40}$/i.test(ens)) {
    displayAddress = ens
  } else if(props.size === 'short') {
    displayAddress += address.substr(-4)
  } else if(props.size === 'medium') {
    displayAddress += address.substr(-9)
  } else if(props.size === 'long') {
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
    <Flex title={address}>
      <Box onClick={() => props.blockieClick?.()}>
        <Blockies
          seed={address.toLowerCase()}
          size={SecondLine ? 15 : 8}
          scale={props.fontSize ? props.fontSize / 7 : 4}
        />
      </Box>
      <Box ml={2} mr={2}>
        <Box {...textProps}>
          <a
            href={etherscanLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayAddress}
          </a>
        </Box>
        {SecondLine}
      </Box>
    </Flex>
  )
}