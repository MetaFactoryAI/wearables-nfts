import {
  Spinner, Container, UnorderedList, ListItem, Box,
  Image, Heading, Alert, AlertIcon, useToast,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import contractAddress from '../contracts/WearablesNFTs.address'
import { httpURL } from '../helpers'
import EditOrList from './EditOrList'
import { useHistory } from 'react-router-dom'

const TOKEN = gql(`
  query GetToken($id: String!) {
    token(id: $id) {
      identifier
      URI
    }
  }
`)

export default (props) => {
  const [metadata, setMetadata] = useState()
  const [tokenId, setTokenId] = useState()
  const homepage = metadata?.external_url
  const wearables = metadata?.properties?.wearables ?? {}
  const history = useHistory()
  const params = useParams()
  const toast = useToast()

  let id = params.id?.toLowerCase()
  if(!id.includes('-')) {
    if(!id.startsWith('0x')) id = `0x${id}`
    id = `${contractAddress.toLowerCase()}-${id}`
  }

  let { loading, error: qError, data } = useQuery(
    TOKEN, { variables: { id } },
  )
  const [error, setError] = useState(qError)

  useEffect(() => {
    if(data) {
      if(!data.token) {
        let msg = `No data returned for the token ${id}.`
        if(props.desiredNetwork) {
          msg += ` You are not connected to the ${props.desiredNetwork} network…`
        }
        setError(msg)
      } else {
        setError(null)
        setTokenId(data.token.identifier)

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
            toast({
              title: 'Query Error',
              description: res.error,
              status: 'error',
              duration: null,
              isClosable: true,
            })
          }
        })()
      }
    }
  }, [data, id, props.desiredNetwork, toast])

  if(id === undefined) {
    return (
      <EditOrList {...props}/>
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
      <Box align="center" my={10}>
        <Spinner size="lg"/>
      </Box>
    )
  }

  if(metadata === null) {
    history.push(`/edit/${id}`)
  }

  return (
    <Container sx={{ a: { textDecoration: 'underline' } }}>
      <Heading size="md" my={5} align="center">
        {metadata.name}
      </Heading>
      <UnorderedList>
        <ListItem>Token ID: {tokenId}</ListItem>
        <ListItem>Description:
          <Box ml={5}>
            <ReactMarkdown linkTarget="_blank">
              {metadata.description}
            </ReactMarkdown>
          </Box>
        </ListItem>
        <ListItem>Homepage:{' '}
          {homepage ? (
            <a href={homepage} target="_blank" rel="noopener noreferrer">
              {homepage}
            </a>
          ) : <em>None</em>}
        </ListItem>
        <ListItem>Image:
          <Image src={httpURL(metadata.image)} maxH="15em"/>
        </ListItem>
        <ListItem>Models:{' '}
          {Object.keys(wearables).length === 0 ? (
            <em>None</em>
          ) : (
            <UnorderedList>
              {Object.entries(wearables).map(
                ([mimetype, model]) => (
                  <ListItem key={mimetype}>
                    <a href={httpURL(model)}>{mimetype}</a>
                  </ListItem>
                )
              )}
            </UnorderedList>
          )}
        </ListItem>
      </UnorderedList>
    </Container>
  )
}