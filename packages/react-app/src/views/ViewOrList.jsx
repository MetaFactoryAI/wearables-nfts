import React from 'react'
import { Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import NFTDetails from './NFTDetails'
import ExistingNFTs from './ExistingNFTs'

export default (props) => {
  const params = useParams()

  if(params.id) {
    return (
      <NFTDetails {...props}/>
    )
  }
  return (
    <>
      <Heading align="center" m={8}>
        Select A NFT To View
      </Heading>
      <ExistingNFTs action="view"/>
    </>
  )
}