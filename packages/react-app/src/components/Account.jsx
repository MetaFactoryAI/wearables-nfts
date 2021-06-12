import React from 'react'
import { Flex } from '@chakra-ui/react'
import Address from './Address'
import Balance from './Balance'

export default ({
  address, minimized,
  injectedProvider, mainnetProvider, blockExplorer,
  ...props
}) => (
  minimized ? null : (
    <Flex {...props}>
      {!address ? (
        "Connecting…"
      ) : (
        <Address
          {...{ address, blockExplorer }}
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