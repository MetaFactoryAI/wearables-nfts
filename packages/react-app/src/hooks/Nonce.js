import { useState } from 'react'

export default (mainnetProvider, address) => {
  const [nonce, setNonce] = useState(0)

  const Nonce = () => {
    const getNonce = async () => {
      setNonce(await mainnetProvider.getTransactionCount(address))
    }
    if(address) getNonce()
  }
  Nonce()

  return nonce
}
