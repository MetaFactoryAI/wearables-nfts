import React from 'react'
import { formatEther } from '@ethersproject/units'
import { Flex, Image } from '@chakra-ui/react'
import { useBalance } from '../hooks'
import eth from '../ethereum.svg'

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
    floatBalance = parseFloat(etherBalance)
  }

  return (
    <Flex title={`${floatBalance} ETH`} {...props}>
      {floatBalance.toFixed(4)}
      <Image src={eth} alt="ETH" h="0.9em" mt="4px" ml="2px"/>
    </Flex>
  )
}