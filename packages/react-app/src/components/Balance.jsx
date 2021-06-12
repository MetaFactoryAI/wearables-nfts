import React from 'react'
import { formatEther } from '@ethersproject/units'
import { Flex, Image } from '@chakra-ui/react'
import { useBalance } from '../hooks'
import eth from '../eth.svg'

export default ({
  provider, address, balance: input, value, size, ...props
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
    <Flex title={`${floatBalance} ETH`} {...props}>
      {displayBalance}
      <Image src={eth} alt="ETH" h="0.9em" mt="4px" ml="2px"/>
    </Flex>
  )
}