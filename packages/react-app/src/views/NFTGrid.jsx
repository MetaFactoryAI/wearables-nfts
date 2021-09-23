import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert, AlertIcon, Button, Spinner, Image, Tooltip,
  Wrap, Container, Box, useColorMode, Stack, Text,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Link, useHistory } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import demarkdown from 'remove-markdown'
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

export default ({ action = null }) => {
  const { loading, error, data } = useQuery(TOKENS)
  const [tokens, setTokens] = useState(null)
  const { colorMode } = useColorMode()
  const history = useHistory()
  const load = useCallback(async () => {
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
                return {
                  ...tkn,
                  loading: false,
                }
              } else {
                return {
                  ...tkn,
                  loading: false,
                  name: meta.name,
                  description: demarkdown(meta.description),
                  image: httpURL(meta.image),
                }
              }
            })
          })
        }
      }))
    }
  }, [data])

  useEffect(() => { load() }, [load])

  if(error) {
    return (
      <Container mt={10}><Alert status="error">
        <AlertIcon />
        {error}
      </Alert></Container>
    )
  }

  if(!tokens || loading) {
    return (
      <Box align="center" my={10}>
        <Spinner/>
      </Box>
    )
  }

  if(tokens.length === 0) {
    return (
      <Container align="center" mt={30}>
        <h2>No Tokens Have Been Created Yet</h2>
        <h2><em>(If you just minted a token, it may take several seconds for The Graph to add the new token to its index.)</em></h2>
        <Link to="/new"><Button>Create One</Button></Link>
      </Container>
    )
  }

  return (
    <Wrap>
      {tokens.map((token) => (
        <Stack>
          <Image src={token.image} alt={token.name}/>
          <Text textAlign="center" alt={token.description}>
            {token.name}
          </Text>
        </Stack>
      ))}
    </Wrap>
  )
}
