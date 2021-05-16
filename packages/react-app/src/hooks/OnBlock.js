import { useEffect, useRef } from "react"

// helper hook to call a function regularly in time intervals
let DEBUG = false

export default (provider, fn, args = []) => {
  const savedCallback = useRef()

  // Remember the latest fn.
  useEffect(() => {
    savedCallback.current = fn
  }, [fn])

  // Turn on the listener if we have a function & a provider
  useEffect(() => {
    if(fn && provider) {
      const listener = (blockNumber) => {
        if(DEBUG) console.log(blockNumber, fn, args, provider.listeners())
        savedCallback.current(...args)
      }

      provider.on("block", listener)

      return () => {
        provider.off("block", listener)
      }
    }
  }, [provider])
}