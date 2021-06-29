import React from 'react'
import { Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import DisburseNFTs from './DisburseNFTs'
import ExistingNFTs from './ExistingNFTs'

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
      <ExistingNFTs {...props} action="disburse"/>
    </>
  )
}