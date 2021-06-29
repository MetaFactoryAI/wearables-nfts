import { Container } from '@chakra-ui/react'
import React from 'react'
import NFTForm from '../components/NFTForm'

export default (props) => {
  if (!props.contract) {
    return (
      <Container align="center" mt={10}>
        ¡Missing Contract! ¿Are you connected?
      </Container>
    )
  }

  return (
    <NFTForm purpose="create" {...props}/>
  )
}