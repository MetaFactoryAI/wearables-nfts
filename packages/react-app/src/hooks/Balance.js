import { useState, useEffect, useCallback } from 'react'
import usePoller from './Poller'
import useOnBlock from './OnBlock'

export default (provider, address, pollTime = 0) => {
  const [balance, setBalance] = useState()

  const pollBalance = useCallback(
    async (provider, address) => {
      if(provider && address) {
        const newBalance = (
          await provider.getBalance(address)
        )
        if(!newBalance?.eq(balance ?? 0n)) {
          setBalance(newBalance)
        }
      }
    },
    [balance],
  )

  useEffect(
    () => { pollBalance(provider, address) },
    [pollBalance, provider, address],
  )

  useOnBlock(
    (pollTime === 0) && provider, // disable if poll time is 0
    () => {
      if(provider && address && pollTime === 0) {
        pollBalance(provider, address)
      }
    }
  )

  usePoller(
    async () => {
      if(provider && address && pollTime > 0) {
        pollBalance()
      }
    },
    pollTime,
    provider && address,
  )

  return balance
}