import React, { useMemo } from 'react'
import { Flex } from '@chakra-ui/react'
import Address from './Address'
import Balance from './Balance'

export default ({
  address,
  injectedProvider,
  mainnetProvider,
  minimized,
  blockExplorer,
}) => (
  minimized ? null : (
    <Flex ml={2} mt="-1.5rem">
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