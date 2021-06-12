import React, { useEffect, useState } from 'react'
import {
  Alert, AlertIcon, Button, Spinner, Image,
  Table, Thead, Tbody, Tr, Th, Td, Container,
} from '@chakra-ui/react'
import { ExternalLinkIcon, ViewIcon } from '@chakra-ui/icons'
import { Link, useHistory } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import registryAddress from '../contracts/WearablesNFTs.address'
import { httpURL } from '../helpers'

const TOKENS = gql(`
  query GetTokens {
    tokenRegistry(id: "${registryAddress.toLowerCase()}") {
      id
      tokens {
        id
        URI
        totalSupply
      }
    }
  }
`)

export default ({ ensProvider, action = null }) => {
  const { loading, error, data } = useQuery(TOKENS)
  const [tokens, setTokens] = useState(null) 
  const history = useHistory()
  const load = async () => {
    if(data) {
      const tokenData = data?.tokenRegistry?.tokens
      if(!tokenData) {
        return setTokens([])
      }

      const tokens = tokenData.map((token) => ({
        loading: true,
        id: token.id,
        supply: token.totalSupply,
        metadata: token.URI,
      }))
      setTokens(tokens)
      const uris = [...new Set([...tokens.map(t => t.metadata)])]
      await Promise.all(uris.map(async (uri) => {
        const response = await fetch(httpURL(uri))
        if(response.ok) {
          const meta = await response.json()
          setTokens((tokens) => {
            return tokens.map((tkn) => {
              if(tkn.metadata !== uri) {
                return tkn
              } else {
                return {
                  ...tkn,
                  loading: false,
                  name: meta.name,
                  description: meta.description,
                  image: httpURL(meta.image),
                }
              }
            })
          })
        }
      }))
    }
  }

  useEffect(() => { load() }, [data])
  
  if(error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  if(!tokens || loading) {
    return <Spinner/>
  }

  if(tokens.length === 0) {
    return (
      <Container align="center">
        <h2>No Tokens Have Been Created Yet</h2>
        <h2><em>(If you just minted a token, it may take several seconds for The Graph to add the new token to its index.)</em></h2>
        <Link to="/new"><Button>Create One</Button></Link>
      </Container>
    )
  }

  return (
    <Table
      sx={{
        'th, td': { textAlign: 'center' },
      }}
    >
      <Thead>
        <Tr position="sticky" top="5rem" bg="white" zIndex={2}>
          <Th>Name</Th>
          <Th>Image</Th>
          <Th>Description</Th>
          <Th>Supply</Th>
          <Th>Metadata</Th>
          {!action && <Th>Actions</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {tokens.map((token, idx) => {
          const redirect = () => {
            if(action) {
              history.push(`/${action}/${token.id}`)
            }
          }
          return (
            <Tr
              key={idx} onClick={redirect}
              _hover={{ bg: action ? '#F3FF0033' : '#0000FF11' }}
            >
              <Td>{token.loading ? <Spinner/> : (
                token.name ?? <em>Unnamed</em>
              )}</Td>
              <Td>{token.loading ? <Spinner/> : (
                <a href={token.image} target="_blank">
                  <Image maxH="5rem" m="auto" src={token.image}/>
                </a>
                ?? <em>No Image</em>
              )}</Td>
              <Td>{token.loading ? <Spinner/> : (
                token.description ? (
                  `${token.description.split('.')[0]}…`
                ) : (
                  <em>No Description</em>
                )
              )}</Td>
              <Td>{token.supply}</Td>
              <Td><a href={token.metadata}><ExternalLinkIcon/></a></Td>
              {!action && (
                <Td>
                  <Link to={`/disburse/${token.id}`} title="Distribute">
                    <Button>⛲</Button>
                  </Link>
                  <Link to={`/edit/${token.id}`} title="Edit">
                    <Button>🖊</Button>
                  </Link>
                </Td>
              )}
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}
