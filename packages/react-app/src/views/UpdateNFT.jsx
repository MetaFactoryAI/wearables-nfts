import {
  chakra, Button, Spinner, FormControl, Container, Input,
  FormLabel, UnorderedList, ListItem, Box, Image, Tooltip,
  Tabs, Tab, TabList, TabPanels, TabPanel, Textarea, Flex,
  Alert, AlertIcon, IconButton, Text, useBreakpointValue,
  ButtonGroup,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import { useLocation } from 'react-router-dom'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { SaveOutlined } from '@ant-design/icons'
import contractAddress from '../contracts/WearablesNFTs.address'
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
  const saveLabel = useBreakpointValue(['Save', ''])
  
  const [hide, setHide] = useState({})
  const toggle = useCallback((prop) => {
    setHide(h => ({ ...h, [prop]: !h[prop] }))
  }, [])

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

  const overwrite = async (evt) => {
    evt.preventDefault()
    const res = await fetch(httpURL(newMetadata))
    const metadata = res.json()
    await contract.setURI(newMetadata, tokenId)
    setMetadata(metadata)
  }

  if(metadata === null || query.get('overwrite')) {
    return (
      <Container as="form" onSubmit={overwrite} mt={10}>
        <FormControl isRequired>
          <FormLabel>New Metadata</FormLabel>
          <Input
            value={newMetadata}
            onChange={(evt) => (
              setNewMetadata(evt.target.value)
            )}
            placeholder={(() => {
              let msg = ((metadata === null) ? (
                "Metadata is corrupt."
              ) : (
                "Metadata override specified."
              ))
              return `${msg} Provide a replacement.`
            })}
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

  const save = () => {
    console.info("Saving…")
  }

  return (
    <Flex
      direction={['column-reverse', 'row-reverse']}
      align="center" justify="center" mt={10}
    >
      <Tooltip hasArrow placement="top" label="Save">
        <ButtonGroup
          isAttached variant="outline" mt={5} onClick={save}
        >
          <IconButton
            aria-label="Save" title="Save" icon={<SaveOutlined/>}
          />
          {saveLabel && <Button>{saveLabel}</Button>}
        </ButtonGroup>
      </Tooltip>
      <Container m={0} sx={{ a: { textDecoration: 'underline' } }}>
        <UnorderedList>
          <ListItem listStyleType="square">
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
          <ListItem
            listStyleType={
              `disclosure-${hide['desc'] ? 'closed' : 'open'}`
            }
          >
            <Text onClick={() => toggle('desc')}>
              Description:
            </Text>
            {!hide['desc'] && (
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
            )}
          </ListItem>
          <ListItem listStyleType="square">
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
          <ListItem
            listStyleType={
              `disclosure-${hide['img'] ? 'closed' : 'open'}`
            }
          >
            <Text onClick={() => toggle('img')}>
              Image:
            </Text>
            {!hide['img'] && (
              <Image src={httpURL(metadata.image)} maxH={60}/>
            )}
          </ListItem>
          <ListItem>Models:{' '}
            {Object.keys(wearables).length === 0 ? (
              <em>None</em>
            ) : (
              <UnorderedList>
                {Object.entries(wearables).map(
                  ([mimetype, model]) => (
                    <ListItem>
                      <a href={httpURL(model)}>{mimetype}</a>
                    </ListItem>
                  )
                )}
              </UnorderedList>
            )}
          </ListItem>
        </UnorderedList>
      </Container>
    </Flex>
  )
}