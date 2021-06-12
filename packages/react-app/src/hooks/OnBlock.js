import { useEffect, useRef } from 'react'

export default (provider, fn, args = []) => {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = fn
  }, [fn])

  useEffect(() => {
    if(fn && provider) {
      const listener = (blockNumber) => {
        savedCallback.current(...args)
      }

      provider.on('block', listener)

      return () => {
        provider.off('block', listener)
      }
    }
  }, [provider, fn, args])
}