import {
  chakra, Button, FormControl, Container, Input,
  FormLabel, UnorderedList, ListItem, Box, Image,
  Tabs, Tab, TabList, TabPanels, TabPanel, Textarea, Flex,
  Text, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, Select, ModalFooter, Modal,
  useDisclosure, Table, Thead, Tbody, Tr, Th, Td, Tooltip, useToast,
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory, useParams, Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { AddIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { httpURL, capitalize } from '../helpers'

const ModelModal = ({
  isOpen, onClose, setWearables,
}) => {
  const [type, setType] = useState('model/gltf-binary')
  const [specifiedType, setSpecifiedType] = useState('')
  const addModel = (type, file) => {
    setWearables((ws) => {
      if(!ws[type] || window.confirm(`¿Replace ${type}?`)) {
        return { ...ws, [type]: file }
      } else {
        return ws
      }
    })
  }
  
  return (
    <Modal {...{ isOpen, onClose }}>
      <ModalOverlay/>
      <ModalContent
        onSubmit={(evt) => {
          evt.preventDefault()
          evt.stopPropagation()
          addModel(
            type !== 'other' ? type : specifiedType,
            evt.target['file'].files[0],
          )
          onClose()
        }}
        as="form"
      >
        <ModalHeader>Add Model</ModalHeader>
        <ModalCloseButton/>
        <ModalBody>
          <FormControl id="mimetype">
            <FormLabel>Model Type:</FormLabel>
            <Select
              ml={5} w="calc(100% - 2rem)"
              value={type}
              onChange={({ target: { value } }) => setType(value)}
            >
              <optgroup style={{ padding: 0 }}>
                <option value="model/gltf-binary">Binary glTF</option>
                <option value="model/gltf+json">glTF</option>
                <option value="model/fbx">FBX</option>
                <option value="application/x-blender">Blender</option>
                <option value="model/vox">VOX</option>
                <option value="model/vrm">VRM</option>
              </optgroup>
              <optgroup>
                <option value="other" style={{ fontStyle: 'italic' }}>
                  Other
                </option>
              </optgroup>
            </Select>
            {type === 'other' && (
              <Input
                ml={5} mt={3} w="calc(100% - 2rem)" placeholder="Mime Type"
                required={true} value={specifiedType}
                onChange={({ target: { value } }) => (
                  setSpecifiedType(value)
                )}
              />
            )}
          </FormControl>
          <FormControl id="model" mt={5}>
            <FormLabel>Model File:</FormLabel>
            <Input
              id="file" required={true} type="file"
              ml={5} w="calc(100% - 2rem)" h="auto"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" ml={3} type="submit">
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const Anchor = ({ name, box }) => {
  const anchor = name.toLowerCase().replace(/\s+/g, '-')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const elem = box?.current
    if(elem) {
      const over = () => setVisible(true)
      elem.addEventListener(
        'mouseover', over
      )
      const out = () => setVisible(false)
      elem.addEventListener(
        'mouseout', out
      )
      return () => {
        elem.removeEventListener(
          'mouseover', over
        )
        elem.removeEventListener(
          'mouseout', out
        )
      }
    }
  }, [box])

  return (
    <Link
      id={anchor}
      to={{ hash: `#${anchor}` }}
      style={{
        textDecoration: 'none',
        visibility: visible ? 'visible' : 'hidden'
      }}
    >
      <span role="img" aria-label="Link">🔗</span>
    </Link>
  )
}

const Label = ({ name, box }) => (
  <Flex ml="-2.75em" mt={-1.5}>
    <Anchor {...{ name, box }}/>
    <Text ml={3} mr={2}>■</Text>
    <FormLabel whiteSpace="pre">{name}:</FormLabel>
  </Flex>
)

const ExpandShow = ({ name, button = null, children }) => {
  const [hide, setHide] = useState({})
  const toggle = useCallback((prop) => {
    setHide(h => ({ ...h, [prop]: !h[prop] }))
  }, [])
  const box = useRef()

  return (
    <Box ref={box}>
      <Flex ml="-3em" mt={3} align="center">
        <Anchor {...{ name, box }}/>
        <Text
          ml={3}
          cursor={hide[name] ? 'zoom-in' : 'zoom-out'}
          onClick={() => toggle(name)}
        >
          {hide[name] ? '▸' : '▾'}
          {` ${name}:`}
        </Text>
        {!hide[name] && button}
      </Flex>
      {!hide[name] && children}
    </Box>
  )
}              

const AttrRow = ({ attributes, setAttributes, index }) => {
  const { name, value, type } = attributes[index]
  const setter = useCallback(
    (prop) => (
      (value) => setAttributes(
        (attrs) => ([
          ...attrs.slice(0, index),
          {...attrs[index], [prop]: value },
          ...attrs.slice(index + 1)
        ])
      )
    ), [setAttributes, index]
  )
  const setName = setter('name')
  const setValue = setter('value')
  const setType = setter('type')

  return (
    <Tr>
      <Td><Input
        value={name}
        onChange={({ target: { value } }) => setName(value)}
      /></Td>
      <Td>{(() => {
        switch(type) {
        case 'date':
          return (
            <Input
              type="date"
              value={(new Date(value)).toISOString().split('T')[0]}
              onChange={({ target: { value } }) => (
                setValue((new Date(value)).getTime())
              )}
            />
          )
        case 'string':
          return (
            <Input
              {...{ value }}
              onChange={({ target: { value } }) => (
                setValue(value)
              )}
            />
          )
        default:
          return (
            <Input
              type="number"
              {...{ value }}
              onChange={({ target: { value } }) => (
                setValue(!!value ? parseInt(value, 10) : '')
              )}
            />
          )
        }
      })()}</Td>
      <Td>
        <Select
          value={type}
          onChange={({ target: { value }}) => (
            setType(value)
          )}>
          <option value="string">String</option>
          <option value="date">Date</option>
          <option value="number">Number</option>
          <option value="boost_percentage">
            Boost Percentage
          </option>
          <option value="boost_number">
            Boost Number
          </option>
        </Select>
      </Td>
      <Td><Tooltip label="Remove" hasArrow>
        <Button
          size="sm" ml={2}
          onClick={() => setAttributes(
            (attrs) => ([
              ...attrs.slice(0, index),
              ...attrs.slice(index + 1)
            ])
          )}
        >
          <CloseIcon/>
        </Button>
      </Tooltip></Td>
    </Tr>
  )
}

const Submit = ({ purpose, desiredNetwork }) => (
  <Input
    mt={3} variant="filled" type="submit"
    value={capitalize(purpose)}
    title={
      !desiredNetwork ? `${capitalize(purpose)} NFT` : (
        `Connect to the ${desiredNetwork} network.`
      )
    }
    isDisabled={!!desiredNetwork}
  />
)

const hasValue = (val) => {
  if(Array.isArray(val)) {
    return val.length > 0
  }
  if(val instanceof Object) {
    return Object.keys(val).length > 0
  }
  return Boolean(val)
}

export default ({
  contract, purpose = 'create', onSubmit, desiredNetwork,
  ensProvider, metadata,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [homepage, setHomepage] = useState('')
  const [image, setImage] = useState()
  const imageRef = useRef()
  const [animation, setAnimation] = useState()
  const [wearables, setWearables] = useState({})
  const [attributes, setAttributes] = useState([])
  const [color, setColor] = useState('#FFFFFF')
  const [quantity, setQuantity] = useState(1)
  const [treasurer, setTreasurer] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ipfsURI] = useState(
    process.env.REACT_APP_IPFS_URI ?? '/ip4/127.0.0.1/tcp/5001'
  )
  const ipfs = ipfsHttpClient(ipfsURI)
  const history = useHistory()
  const params = useParams()
  const location = useLocation()
  const toast = useToast()
  const refs = Object.fromEntries(
    ['quantity', 'treasurer', 'name', 'homepage', 'background']
    .map((attr) => [attr, useRef()])
  )

  useEffect(() => {
    if(metadata) {
      Object.entries({
        name: setName, description: setDescription,
        external_url: setHomepage, animation_url: setAnimation,
        image: setImage, treasurer: setTreasurer,
        attributes: setAttributes,
      })
      .forEach(([prop, setter]) => {
        setter(metadata[prop])
      })

      const attrs = metadata.attributes
      if(hasValue(attrs)) {
        setAttributes(attrs.map(({
          trait_type: name, value, display_type: type = 'string',
        }) => ({ name, value, type })))
      }

      setWearables(metadata.properties?.wearables ?? {})

      const bg = metadata.background_color
      setColor(prev => bg ? `#${bg}` : prev)
    }
  }, [metadata])

  useEffect(() => {
    ((async () => {
      if(!!contract && purpose === 'create' && !homepage) {
        const nextId = (
          (parseInt(await contract.tokenCount(), 16) + 1)
          .toString(16)
        )
        setHomepage(
          `https://dysbulic.github.io/nft-wearable/#/view/0x${nextId}`
        ) 
      }
    })())
  }, [contract, purpose, homepage])

  useEffect(() => {
    if(location.hash) {
      const elem = document.getElementById(
        location.hash.substring(1)
      )
      window.scroll({
        top: elem.offsetTop - 120,
        behavior: 'smooth',
      })
    }
  }, [location])

  const configImage = ({ target: { files }}) => {
    if(files.length === 1) {
      setImage(files[0])
    } else {
      setImage(null)
    }
  }

  const configAnimation = (evt) => {
    const { target: { files }} = evt
    if(files.length === 1) {
      setAnimation(files[0])
    } else {
      setAnimation(null)
    }
    evt.preventDefault()
  }

  const addRow = () => {
    setAttributes(attrs => [...attrs, {}])
  }

  const ipfsify = async (fileOrURL) => {
    if(fileOrURL.startsWith?.('ipfs://')) return fileOrURL

    const name = fileOrURL.name
    const result = await ipfs.add(
      { path: name, content: fileOrURL.content ?? fileOrURL },
      { pin: true, wrapWithDirectory: true }
    )
    return `ipfs://${result.cid.toString()}/${name}`
  }

  const enact = useCallback(async (metadata) => {
    try {
      if(purpose === 'create') {
        const enact = (
          window.confirm(
            `¿Mint ${quantity} token${
              quantity === 1 ? '' : 's'
            } to ${treasurer}?`
          )
        )
        if(enact) {
          const address = ensProvider.resolveName(treasurer)
          await contract.mint(address, quantity, metadata, [])
          history.push('/')
        }
      } else if(purpose === 'update') {
        const [tokenId] = params.id.split('-').slice(-1)
        await contract.setURI(metadata, parseInt(tokenId, 16))
      }
    } catch(err) {
      toast({
        title: 'Contract Error',
        description: err.message,
        status: 'error',
        isClosable: true,
        duration: 10000
      })
    }
  }, [
    purpose, contract, quantity, history, params.id,
    treasurer, ensProvider, toast,
  ])

  const submit = async (evt) => {
    evt.preventDefault()

    const metadata = {
      name: name ?? 'Untitled', description, decimals: 0,
    }

    if(!!homepage) {
      metadata.external_url = homepage
    }

    if(image instanceof File) {
      metadata.image = await ipfsify(image)
    } else if(typeof image === 'string') {
      metadata.image = image
    } else if(image !== undefined) {
      console.warn(`Unknown Image Type: ${typeof image}`)
    }

    if(animation instanceof File) {
      metadata.animation_url = await ipfsify(animation)
    } else if(typeof animation === 'string') {
      metadata.animation_url = animation
    } else if(animation !== undefined) {
      console.warn(`Unknown Animation Type: ${typeof animation}`)
    }

    if(color.startsWith('#')) {
      metadata.background_color = (
        color.substring(1).toUpperCase()
      )
    }

    metadata.properties = {}

    if(Object.keys(wearables).length > 0) {
      metadata.properties.wearables = (
        Object.fromEntries(
          await Promise.all(
            Object.entries(wearables).map(
              async ([type, value]) => (
                [type, await ipfsify(value)]
              )
            )
          )
        )
      )
    }

    if(attributes.length > 0) {
      metadata.attributes = (
        attributes.map(({ name, value, type }) => {
          const attr = {
            trait_type: name, 
            value,
          }
          // including a string type causes nothing to render
          if(type !== 'string') {
            attr.display_type = type
          }
          return attr
        })
      )
    }

    const dataURI = await ipfsify({
      name: `metadata.${(new Date()).toISOString()}.json`,
      content: JSON.stringify(metadata, null, '  '),
    })

    await enact(dataURI)
  }

  return (
    <Container
      as="form" onSubmit={submit}
      mt={10} maxW={['100%', 'min(85vw, 50em)']}
      sx={{ a: { textDecoration: 'underline' } }}
    >
      <Submit {...{ purpose, desiredNetwork }}/>
      <UnorderedList listStyleType="none">
        {purpose === 'create' && (
          <ListItem ref={refs.quantity}>
            <FormControl isRequired>
              <Flex align="center">
                <Label name="Quantity to Mint" box={refs.quantity}/>
                <Input
                  type="number" autoFocus
                  value={quantity}
                  onChange={({ target: { value } }) => {
                    setQuantity(value ? parseInt(value, 10) : '')
                  }}
                  placeholder="¿How many tokens to mint?"
                />
              </Flex>
            </FormControl>
          </ListItem>
        )}
        {purpose === 'create' && (
          <ListItem ref={refs.treasurer}>
            <FormControl isRequired mt={3}>
              <Flex align="center">
                <Label name="Treasurer" box={refs.treasurer}/>
                <Input
                  type="text"
                  value={treasurer}
                  onChange={({ target: { value } }) => (
                    setTreasurer(value)
                  )}
                  placeholder="¿Who should receive the new tokens?"
                />
              </Flex>
            </FormControl>
          </ListItem>
        )}
        <ListItem ref={refs.name}>
          <FormControl mt={3}>
            <Flex align="center">
              <Label name="Name" box={refs.name}/>
              <Input
                value={name} autoFocus={purpose !== 'create'}
                onChange={({ target: { value } }) => setName(value)}
              />
            </Flex>
          </FormControl>
        </ListItem>
        <ListItem>
          <ExpandShow name="Image">
            <Box m={3}>
              <Input
                type="file" accept="image/*"
                ref={imageRef} onChange={configImage}
                display={image ? 'none' : 'inherit'}
                h="auto"
              />
              {image && (<Image
                src={
                  (image instanceof File) ? (
                    URL.createObjectURL(image)
                  ) : (
                    httpURL(image)
                  )
                }
                maxH={60} mt={0} bg={color}
                onClick={() => imageRef.current?.click()}
              />)}
            </Box>
          </ExpandShow>
        </ListItem>
        <ListItem ref={refs.background}>
          <FormControl mt={3}>
            <Flex align="center">
              <Label name="Background Color" box={refs.background}/>
              <Input
                type="color" value={color}
                onChange={({ target: { value }}) => setColor(value)}
              />
            </Flex>
          </FormControl>
        </ListItem>
        <ListItem ref={refs.homepage}>
          <FormControl mt={3}>
            <Flex align="center">
              <Label name="Homepage" box={refs.homepage}/>
              <Input
                value={homepage}
                onChange={({ target: { value } }) => (
                  setHomepage(value)
                )}
              />
              {homepage?.length > 0 && (
                <chakra.a ml={2} href={homepage} target="_blank">
                  <ExternalLinkIcon/>
                </chakra.a>
              )}
            </Flex>
          </FormControl>
        </ListItem>
        <ListItem>
          <ExpandShow name="Description">
            <Tabs ml={5} isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Markdown</Tab>
                <Tab>Preview</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Textarea
                    placeholder="Enter a markdown formatted description."
                    value={description} minH={32}
                    onChange={({ target: { value } }) => (
                      setDescription(value)
                    )}
                  />
                </TabPanel>
                <TabPanel>
                  <ReactMarkdown>
                    {description}
                  </ReactMarkdown>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ExpandShow>
        </ListItem>
        <ListItem>
          <ExpandShow name="Animation">
            <Box m={3}>
              {typeof animation === 'string' && (
                <Flex>
                  <Text>
                    {decodeURI(animation.replace(
                      /^ipfs:\/\/[^/]+\//, ''
                    ))}
                  </Text>
                  <chakra.a href={httpURL(animation)} ml={3} mb={5}>
                    <ExternalLinkIcon/>
                  </chakra.a>
                </Flex>
              )}
              {animation instanceof File && (
                <Flex>
                  <Text>{animation.name}</Text>
                  <chakra.a
                    href={URL.createObjectURL(animation)}
                    target="_blank" ml={3} mb={5}
                  >
                    <ExternalLinkIcon/>
                  </chakra.a>
                </Flex>
              )}
              <Input
                type="file"
                accept="model/gltf+json,model/gltf-binary,video/*,.gltf,.glb"
                onChange={configAnimation}
                h="auto"
              />
            </Box>
          </ExpandShow>
        </ListItem>
        <ListItem id="attributes">
          <ExpandShow
            name="Attributes"
            button={<Button ml={2} onClick={addRow} size="xs">
              <AddIcon/>
            </Button>}
          >
            {attributes.length > 0 && (
              <Table
                sx={{ 'th, td': { textAlign: 'center' } }}
              >
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Value</Th>
                    <Th>Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {attributes.map((_, index) => (
                    <AttrRow {...{
                      attributes, setAttributes,
                      index, key: index,
                    }}/>
                  ))}
                </Tbody>
              </Table>
            )}
          </ExpandShow>
        </ListItem>
        <ListItem>
          <ExpandShow
            name="Models"
            button={<Button ml={2} onClick={onOpen} size="xs">
              <AddIcon/>
            </Button>}
          >
            {Object.keys(wearables).length === 0 ? (
              <em>None</em>
            ) : (
              <UnorderedList>
                {Object.entries(wearables).map(
                  ([mimetype, model], idx) => (
                    <ListItem key={idx}>
                      <a href={httpURL(model)}>{mimetype}</a>
                    </ListItem>
                  )
                )}
              </UnorderedList>
            )}
            <ModelModal
              {...{
                isOpen, onClose, setWearables,
              }}
            />
          </ExpandShow>
        </ListItem>
      </UnorderedList>
      <Submit {...{ purpose, desiredNetwork }}/>
    </Container>
  )
}