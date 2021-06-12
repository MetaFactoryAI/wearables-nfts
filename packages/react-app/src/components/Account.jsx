import React from 'react'
import { Flex } from '@chakra-ui/react'
import Address from './Address'
import Balance from './Balance'

export default ({
  address, minimized, blockExplorer,
  injectedProvider, mainnetProvider,
  localProvider, blockieClick, ...props
}) => (
  minimized ? null : (
    <Flex {...props}>
      {!address ? (
        "Connecting…"
      ) : (
        <Address
          {...{
            address, blockExplorer,
            blockieClick,
          }}
          ensProvider={mainnetProvider}
          size="short"
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
)