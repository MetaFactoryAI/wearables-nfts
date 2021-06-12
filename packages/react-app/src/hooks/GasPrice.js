import { useState } from 'react'
import { usePoller } from 'eth-hooks'

export default function useGasPrice(targetNetwork, speed) {
  const [gasPrice, setGasPrice] = useState()
  const loadGasPrice = async () => {
    if(targetNetwork.gasPrice) {
      setGasPrice(targetNetwork.gasPrice)
    } else {
        fetch('https://ethgasstation.info/json/ethgasAPI.json')
        .then((res) => {
          if(!res.ok) throw new Error(res.status)
          return res.json()
        })
        .then((data) => {
          const newGasPrice = data[speed ?? 'fast'] * 100000000
          if(newGasPrice !== gasPrice) {
            setGasPrice(newGasPrice)
          }
        })
        .catch(error => console.log(error))
    }
  };

  usePoller(loadGasPrice, 39999)
  return gasPrice
}
