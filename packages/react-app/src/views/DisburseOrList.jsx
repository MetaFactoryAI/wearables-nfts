import React from 'react'
import { Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import DisburseNFTs from './DisburseNFTs'
import NFTList from './NFTList'

export default (props) => {
  const params = useParams()

  if(params.id) {
    return <DisburseNFTs {...props}/>
  }
  return (
    <>
      <Heading align="center" m={8}>
        Select A NFT To Distribute
      </Heading>
      <NFTList {...props} action="disburse"/>
    </>
  )
}