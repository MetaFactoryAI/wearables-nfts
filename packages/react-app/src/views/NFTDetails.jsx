import {
  Spinner, Container, UnorderedList, ListItem, Box,
  Image, Heading, Alert, AlertIcon, useToast, Flex, Text, Link,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import React, { useEffect, useState, Suspense } from 'react'
import { useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import contractAddress from '../contracts/WearablesNFTs.address'
import { httpURL } from '../helpers'
import EditOrList from './EditOrList'
import { useHistory } from 'react-router-dom'
import { Box3, Vector3, Color } from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Environment } from '@react-three/drei'
import { Helmet } from 'react-helmet'

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

  const Scene = ({ source }) => {
    const { scene } = useGLTF(source)
    const bBox = new Box3()
    bBox.setFromObject(scene)
    const size = bBox.getSize(new Vector3()).length();
    const fov = 50
    const near = size / 100;
    const far = size * 100;
    const position = [0, 0, size]
    const lights = [[0, 0, size], [0, 0, -size]]
    return (
      <Canvas
        style={{ height: '100%' }}
        camera={{ position, fov, near, far }}
      >
        {metadata?.background_color && (
          <color attach="background" args={[`#${metadata.background_color}`]}/>
        )}
        <Center>
          <primitive object={scene}/>
        </Center>
        <ambientLight intensity={0.1} />
        {lights.map((light, idx) => (
          <directionalLight key={idx} position={light} intensity={0.75}/>
        ))}
        <OrbitControls />
      </Canvas>
    )
  }

  const Model = ({ source }) => {
    if(!wearables?.['model/gltf-binary']) return null
    return (
      <Suspense fallback={null}>
        <Scene source={httpURL(wearables['model/gltf-binary'])}/>
      </Suspense>
    )
  }

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
              metadata.uri = httpURL(data.token.URI)
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
    <>
      <Helmet>
        {/* This won't work, more than likely… */}
        {metadata.image && (
          <meta property="og:image" content={httpURL(metadata.image)}></meta>
        )}
        {metadata.name && (
          <meta property="og:title" content={metadata.name}></meta>
        )}
      </Helmet>
      <Container sx={{ a: { textDecoration: 'underline' } }}>
        <Heading size="lg" my={5} align="center">
          {metadata.name}
        </Heading>
        <Flex direction={{ base: 'column', sm: 'row' }} align="center">
          <Box
            minW={["100vmin", "50%"]}
            paddingTop={['100vmin', "50%"]}
            position="relative" border="2px solid black"
            alignSelf={['center', 'start']} justifySelf="center"
          >
            <Box
              position="absolute"
              top={0} bottom={0} left={0} right={0}>
              {wearables['model/gltf-binary'] ? (
                <Model/>
              ) : (
                <Image src={httpURL(metadata.image)}/>
              )}
            </Box>
          </Box>
          <Box
            ml={5} sx={{
              hr: { my: 3 },
              'p, li': { mb: 3, textAlign: 'justify' },
            }}>
            <ReactMarkdown linkTarget="_blank">
              {metadata.description}
            </ReactMarkdown>
          </Box>
        </Flex>
        {homepage && (
          <Link href={homepage} isExternal title="Homepage">
            🏡
          </Link>
        )}
        {metadata?.uri && (
          <Link href={metadata.uri} ml={3} isExternal title="Metadata">
            🗄
          </Link>
        )}
        <Heading size="sm">Models:</Heading>
        {Object.keys(wearables).length === 0 ? (
          <Text><em>None</em></Text>
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
      </Container>
    </>
  )
}