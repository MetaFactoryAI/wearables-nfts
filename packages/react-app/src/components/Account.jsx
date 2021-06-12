import React from "react"
import { Flex } from '@chakra-ui/react'
import Address from './Address'
import Balance from './Balance'

export default ({
  address,
  localProvider,
  mainnetProvider,
  minimized,
  blockExplorer,
}) => {
  const display = minimized ? null : (
    <Flex ml={2}>
      {address ? (
        <Address
          {...{ address, blockExplorer }}
          ensProvider={mainnetProvider}
          size="short"
          SecondLine={
            <Balance mt="-5px" {...{ address }} provider={localProvider}/>
          }
        />
      ) : (
        "Connecting…"
      )}
    </Flex>
  )

  return (
    <Flex>
      {display}
    </Flex>
  )
}
