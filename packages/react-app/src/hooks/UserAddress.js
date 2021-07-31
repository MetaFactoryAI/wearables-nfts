import { useState, useEffect } from 'react'

export default (provider) => {
  const [userAddress, setUserAddress] = useState(null)

  useEffect(() => {
    (async () => {
      setUserAddress(await provider?.getSigner().getAddress())
    })()
  }, [provider])

  return userAddress
}