import {
  Spinner, Container, UnorderedList, ListItem, Box,
  Image, Heading, Alert, AlertIcon,
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

export default ({ contract, validNetwork }) => {
  const [metadata, setMetadata] = useState()
  const [tokenId, setTokenId] = useState()
  const homepage = metadata?.properties?.external_url
  const wearables = metadata?.properties?.wearables ?? {}
  const history = useHistory()
  const params = useParams()

  let id = params.id
  if(!id.includes('-')) {
    if(!id.startsWith('0x')) id = `0x${id}`
    id = `${contractAddress}-${id}`
  }
  let { loading, error, data } = useQuery(
    TOKEN, { variables: { id } },
  )

  useEffect(() => {
    if(data?.token) {
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
        }
      })()
    }
  }, [data])

  if(id === undefined) {
    return (
      <EditOrList {...{ contract, validNetwork }}/>
    )
  }

  if(error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
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
      <Heading size="md" my={5}>Name: {metadata.name}</Heading>
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
          {homepage ? <a href={homepage}>{homepage}</a> : <em>None</em>}
        </ListItem>
        <ListItem>Image:
          <Image src={httpURL(metadata.image)} maxH="15em"/>
        </ListItem>
        <ListItem>Models:{' '}
          {Object.keys(wearables).length === 0 ? (
            <em>None</em>
          ) : (
            <UnorderedList>
              {Object.entries(wearables).map(([mimetype, model]) => (
                <ListItem><a href={httpURL(model)}>{mimetype}</a></ListItem>
              ))}
            </UnorderedList>
          )}
        </ListItem>
      </UnorderedList>
    </Container>
  )
}