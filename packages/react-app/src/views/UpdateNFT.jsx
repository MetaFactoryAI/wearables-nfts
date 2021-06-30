import {
  Spinner, Container, Box, Alert, AlertIcon,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useLocation } from 'react-router-dom'
import contractAddress from '../contracts/WearablesNFTs.address'
import { httpURL } from '../helpers'
import EditOrList from './EditOrList'
import NFTForm from '../components/NFTForm'

const TOKEN = gql(`
  query GetToken($id: String!) {
    token(id: $id) {
      identifier
      URI
    }
  }
`)

const useQueryParams = () => (
  new URLSearchParams(useLocation().search)
)

export default ({ contract, desiredNetwork }) => {
  const [metadata, setMetadata] = useState()
  
  const params = useParams()
  let id = params.id?.toLowerCase()
  if(!id.includes('-')) {
    if(!id.startsWith('0x')) id = `0x${id}`
    id = `${contractAddress.toLowerCase()}-${id}`
  }

  let { loading, error, data } = useQuery(
    TOKEN, { variables: { id } },
  )

  useEffect(() => {
    if(data?.token) {
      ;(async () => {
        const res = await fetch(httpURL(data.token.URI))
        if(res.ok) {
          try {
            const metadata = await res.json()
            setMetadata(metadata)
          } catch(err) { // invalid JSON
            setMetadata(null)
          }
        } else {
          console.error('Metadata Response', res)
        }
      })()
    }
  }, [data])

  if(id === undefined) {
    return (
      <EditOrList {...{ contract, desiredNetwork }}/>
    )
  }

  if(error) {
    return (
      <Container mt={10}><Alert status="error">
        <AlertIcon />
        {error}
      </Alert></Container>
    )
  }

  if(metadata === undefined || loading) {
    return (
      <Box align="center" mt={10}>
        <Spinner size="lg"/>
      </Box>
    )
  }

  return (
    <NFTForm
      purpose="update" {...{ metadata }}
      {...{ contract, desiredNetwork }}
    />
  )
}