import { useState, useEffect } from "react"
import { getAddress, isAddress } from "@ethersproject/address"
import { useLocalStorage } from "."

// resolved if(name){} to not save "" into cache

/*
  ~ What it does? ~

  Gets ENS name from given address and provider

  ~ How can I use? ~

  const ensName = useLookupAddress(mainnetProvider, address);

  ~ Features ~

  - Provide address and get ENS name corresponding to given address
*/

const lookupAddress = async (provider, address) => {
  if(isAddress(address)) {
    try {
      // Accuracy of reverse resolution is not enforced.
      // We then manually ensure that the reported ens name resolves to address
      const reportedName = (
        await provider.lookupAddress(address)
      )
      const resolvedAddress = (
        await provider.resolveName(reportedName)
      )

      console.info('RR', reportedName, resolvedAddress)

      if(
        getAddress(address)
        === getAddress(resolvedAddress)
      ) {
        return reportedName
      }
      return getAddress(address)
    } catch(e) {
      return getAddress(address)
    }
  }
  return 0
}

const useLookupAddress = (provider, address) => {
  const [ensName, setEnsName] = useState(address)

  useEffect(() => {
    let cache = window.localStorage.getItem(
      `ensCache_${address}`
    )
    cache = cache && JSON.parse(cache)
    const cacheFor = 60 * 60 * 24 * 5 // 5 days

    if(cache?.created_at + cacheFor > Date.now()) {
      setEnsName(cache.name)
    } else {
      if(provider) {
        lookupAddress(provider, address).then(
          (name) => {
            if(name) {
              setEnsName(name)
              window.localStorage.setItem(
                `ensCache_${address}`,
                JSON.stringify({
                  created_at: Date.now(),
                  name: name,
                })
              )
            }
          }
        )
      }
    }
  }, [provider, address, setEnsName])

  return ensName
}

export default useLookupAddress