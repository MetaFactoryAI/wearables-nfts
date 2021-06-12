import {
  chakra, Button, Spinner, FormControl, Container, Input,
  FormLabel, UnorderedList, ListItem, Box, Image,
  Tabs, Tab, TabList, TabPanels, TabPanel, Textarea, Flex, Alert, AlertIcon, IconButton,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import { useLocation } from 'react-router-dom'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { SaveOutlined } from '@ant-design/icons'
import { httpURL } from '../helpers'
import EditOrList from './EditOrList'

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

export default ({ contract, validNetwork }) => {
  const [metadata, setMetadata] = useState()
  const [newMetadata, setNewMetadata] = useState('')
  const [tokenId, setTokenId] = useState()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [homepage, setHomepage] = useState('')
  const [wearables, setWearables] = useState({})
  const query = useQueryParams()
  const params = useParams()
  let id = params.id
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
            setName(metadata.name ?? '')
            setDescription(metadata.description ?? '')
            setHomepage(metadata.external_url ?? '')
            setWearables(metadata.properties?.wearables ?? {})
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
      <Box align="center" mt={10}>
        <Spinner size="lg"/>
      </Box>
    )
  }

  const overwrite = async (evt) => {
    evt.preventDefault()
    const res = await fetch(httpURL(newMetadata))
    const metadata = res.json()
    await contract.setURI(newMetadata, tokenId)
    setMetadata(metadata)
  }

  if(metadata === null || query.get('overwrite')) {
    return (
      <Container as="form" onSubmit={overwrite}>
        <FormControl isRequired>
          <FormLabel>New Metadata</FormLabel>
          <Input
            value={newMetadata}
            onChange={(evt) => (
              setNewMetadata(evt.target.value)
            )}
            placeholder="Metadata is corrupt. Provide a replacement."
          />
        </FormControl>
        <Button
          type="submit" isDisabled={!validNetwork} mt={5}
          title={validNetwork ? 'Replace Metadata' : (
            'Connect to the correct network.'
          )}
        >
          Overwrite Metadata
        </Button>
      </Container>
    )
  }

  return (
    <Flex direction="row-reverse" align="center">
      <IconButton aria-label="Save" title="Save" icon={<SaveOutlined/>}/>
      <Container sx={{ a: { textDecoration: 'underline' } }}>
        <UnorderedList listStyleType="disclosure-closed">
          <ListItem>
            <FormControl>
              <Flex align="center">
                <FormLabel>Name:</FormLabel>
                <Input
                  value={name}
                  onChange={evt => setName(evt.target.value)}
                />
              </Flex>
            </FormControl>
          </ListItem>
          <ListItem>Description:
            <Tabs ml={5} isFitted variant="enclosed"  minH="15em">
              <TabList mb="1em">
                <Tab>Markdown</Tab>
                <Tab>Preview</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Textarea
                    placeholder="Enter a markdown formatted description."
                    value={description} minH="8em"
                    onChange={evt => setDescription(evt.target.value)}
                  />
                </TabPanel>
                <TabPanel>
                  <ReactMarkdown>
                    {description}
                  </ReactMarkdown>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ListItem>
          <ListItem>
            <FormControl>
              <Flex align="center">
                <FormLabel>Homepage:</FormLabel>
                <Input
                  value={homepage}
                  onChange={evt => setHomepage(evt.target.value)}
                />
                {homepage.length > 0 && (
                  <chakra.a ml={3} href={homepage} target="_blank">
                    <ExternalLinkIcon/>
                  </chakra.a>
                )}
              </Flex>
            </FormControl>
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
    </Flex>
  )
}