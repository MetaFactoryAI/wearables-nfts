import React from 'react'
import { Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import NFTDetails from './NFTDetails'
import ExistingNFTs from './ExistingNFTs'

export default ({ validNetwork }) => {
  const params = useParams()

  if(params.id) {
    return (
      <NFTDetails {...{ validNetwork }}/>
    )
  } else {
    return (
      <>
        <Heading align="center" m={8}>
          Select Which NFT To View
        </Heading>
        <ExistingNFTs action="view"/>
      </>
    )
  }
}