import React from 'react'
import { Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import NFTDetails from './NFTDetails'
import NFTGrid from './NFTGrid'

export default (props) => {
  const params = useParams()

  if(params.id) {
    return <NFTDetails {...props}/>
  }
  return <NFTGrid action="view"/>
}