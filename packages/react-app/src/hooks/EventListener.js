import { useState, useEffect } from "react";

export default ({
  contracts, name, event, provider, startBlock,
}) => {
  const [updates, setUpdates] = useState([])

  useEffect(() => {
    if(provider && startBlock !== undefined) {
      provider.resetEventsBlock(startBlock)
    }
    if(contracts?.[name]) {
      try {
        contracts[name].on(event, (...args) => {
          let blockNumber = args[args.length - 1].blockNumber
          setUpdates((messages) => ([
            Object.assign({ blockNumber }, args.pop().args),
            ...messages,
          ]))
        })
        return () => {
          contracts[name].removeListener(event)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [
    provider, startBlock, contracts, name, event,
  ])

  return updates
}