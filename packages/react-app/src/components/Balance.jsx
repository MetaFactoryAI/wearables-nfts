import React, { useState } from 'react'
import { formatEther } from '@ethersproject/units'
import { Text, Box, Flex, Image } from '@chakra-ui/react'
import { useBalance } from '../hooks'
import eth from '../eth.svg'


/*
  ~ What it does? ~

  Displays a balance of given address in ether & dollar

  ~ How can I use? ~

  <Balance
    address={address}
    provider={mainnetProvider}
    price={price}
  />

  ~ If you already have the balance as a bignumber ~
  <Balance
    balance={balance}
    price={price}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to given address
  - Provide provider={mainnetProvider} to access balance on mainnet or any other network (ex. localProvider)
  - Provide price={price} of ether and get your balance converted to dollars
*/

export default ({
  provider, address, balance: input, value, size,
}) => {
  const balance = useBalance(provider, address)
  let floatBalance = 0
  let usingBalance = balance

  if(input !== undefined) {
    usingBalance = input
  }
  if(value !== undefined) {
    usingBalance = value
  }

  if(usingBalance) {
    const etherBalance = formatEther(usingBalance)
    parseFloat(etherBalance).toFixed(2)
    floatBalance = parseFloat(etherBalance)
  }

  let displayBalance = (
    floatBalance.toFixed(4)
  )

  return (
    <Flex title={`${floatBalance} ETH`}>
      {displayBalance}
      <Image src={eth} alt="ETH" h="0.9em" mt="4px" ml="2px"/>
    </Flex>
  )
}