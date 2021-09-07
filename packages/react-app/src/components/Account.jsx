import React from 'react'
import { Flex } from '@chakra-ui/react'
import Address from './Address'
import Balance from './Balance'
import { useBreakpointValue } from '@chakra-ui/react'

export default ({
  address, minimized, blockExplorer,
  injectedProvider, mainnetProvider,
  localProvider, blockieClick, ...props
}) => {
  const size = useBreakpointValue({ base: 'shortest', lg: 'short' })

  return minimized ? null : (
    <Flex {...props}>
      {!address ? (
        "Connecting…"
      ) : (
        <Address
          {...{
            address,
            blockExplorer,
            blockieClick,
            size,
          }}
          ensProvider={mainnetProvider}
          SecondLine={
            <Balance
              mt="-5px" {...{ address }}
              provider={injectedProvider}
            />
          }
        />
      )}
    </Flex>
  )
}