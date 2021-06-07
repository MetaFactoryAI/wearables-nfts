import React, { useEffect, useState } from 'react'
import {
  Alert, AlertIcon, Button, Spinner, Image,
  Table, Thead, Tbody, Tr, Th, Td,
} from '@chakra-ui/react'
import { ExternalLinkIcon, ViewIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import registryAddress from '../contracts/WearablesNFTs.address'

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

const httpURL = (uri) => {
  const match = uri.match(/^(ip[nf]s):\/\/(.+)$/)
  if(!match) {
    return uri
  } else {
    return `https://ipfs.io/${match[1]}/${match[2]}`
  }
}

export default ({ ensProvider }) => {
  const { loading, error, data } = useQuery(TOKENS)
  const [tokens, setTokens] = useState(null) 
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
                  id: tkn.id,
                  name: meta.name,
                  description: meta.description,
                  image: httpURL(meta.image),
                  supply: tkn.supply,
                  metadata: tkn.metadata,
                  loading: false,
                }
              }
            })
          })
          console.info(meta)
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
      <>
        <h2>No Tokens Have Been Created Yet</h2>
        <h2><em>(If you just minted a token, it may take several seconds for The Graph to add the new token to its index.)</em></h2>
        <Link to="/new"><Button>Create One</Button></Link>
      </>
    )
  }

  return (
    <Table
      sx={{
        'th, td': { textAlign: 'center' },
      }}
    >
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Image</Th>
          <Th>Description</Th>
          <Th>Supply</Th>
          <Th>Metadata</Th>
          <Th>Distribution</Th>
        </Tr>
      </Thead>
      <Tbody>
        {tokens.map((token, idx) => (
          <Tr key={idx}>
            <Td>{token.loading ? <Spinner/> : (
              token.name ?? <em>Unnamed</em>
            )}</Td>
            <Td>{token.loading ? <Spinner/> : (
              <a href={token.image}>
                <Image maxH="5rem" m="auto" src={token.image}/>
              </a>
              ?? <em>No Image</em>
            )}</Td>
            <Td>{token.loading ? <Spinner/> : (
              token.description ?? <em>No Description</em>
            )}</Td>
            <Td>{token.supply}</Td>
            <Td><a href={token.metadata}><ExternalLinkIcon/></a></Td>
            <Td><Link to={`/token/${token.id}`}><ViewIcon/></Link></Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
