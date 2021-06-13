import React, { useEffect , useState} from 'react'
import {
  Alert, AlertIcon, Spinner, Button, Tooltip,
  Table, Thead, Tbody, Tr, Th, Td, useDisclosure,
  Box, Image, Flex, Heading, useToast,
  useBreakpointValue, useColorMode,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router'
import Address from '../components/Address'
import Distribute from '../components/DistributeModal'
import { httpURL } from '../helpers'
import contractAddress from '../contracts/WearablesNFTs.address'

const TOKEN = gql(`
  query GetToken($id: String!) {
    token(id: $id) {
      identifier
      totalSupply
      balances {
        account { id }
        value
      }
      URI
    }
  }
`)

export default ({
  ensProvider, address, contract, validNetwork,
}) => {
  const [balances, setBalances] = useState(null)
  const [quantity, setQuantity] = useState(null)
  const [tokenID, setTokenID] = useState(null)
  const [total, setTotal] = useState(null)
  const [meta, setMeta] = useState(<Spinner/>)
  const { colorMode }= useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const params = useParams()
  const addrSize = (
    useBreakpointValue(['shortest', 'medium'])
  )
  const threeCol = useBreakpointValue([false, true])

  let id = params.id?.toLowerCase()
  if(!id.includes('-')) {
    if(!id.startsWith('0x')) id = `0x${id}`
    id = `${contractAddress.toLowerCase()}-${id}`
  }

  let { loading, error, data } = useQuery(
    TOKEN, { variables: { id } },
  )
  const config = () => {
    if(!validNetwork) {
      toast({
        title: 'Connection Error',
        description: 'Connect to the correct network to distribute.',
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
    } else {
      setQuantity(balances[address.toLowerCase()])
      onOpen()
    }
  }
  const distribute = async (recipients) => {
    try {
      await contract.distributeSingles(
        address, recipients, tokenID, []
      )
    } catch(err) {
      const cause = err.error
      console.error('Error Distributing', err)
      toast({
        title: "Couldn't Distribute",
        description: cause.message,
        status: 'error',
        duration: null,
        isClosable: true,
      })
      throw cause
    }
  }

  useEffect(() => {
    if(data?.token) {
      const { balances, totalSupply, identifier, URI } = (
        data.token
      )
      const quantities = Object.fromEntries(
        balances.map((bal) => [
          bal.account.id,
          parseInt(bal.value, 10),
        ])
      )
      setBalances(quantities)
      setTotal(totalSupply)
      setTokenID(identifier)

      fetch(httpURL(URI))
      .then(res => res.json())
      .then((meta) => {
        setMeta(
          <Flex justify="center" m={8}>
            <Image
              src={httpURL(meta.image)}
              maxH="3rem" mr={5} ml={5}
            />
            <Heading size="lg">{meta.name}</Heading>
          </Flex>
        )
      })
    }
  }, [data])

  if(loading) {
    return <Spinner/>
  }

  if(!balances || balances.length === 0) {
    error = error ?? "Couldn't find any balances."
  }

  if(error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Distribute {...{ isOpen, onClose, quantity, distribute }}/>
      {meta}
      <Table sx={{ 'th, td': { textAlign: 'center' } }}>
        <Thead
          position="sticky" top={[0, 14]} zIndex={1}
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        >
          <Tr>
            {threeCol ? (
              <>
                <Th textAlign="center">
                  Quantity {total && `(${total})`}
                </Th>
                <Th>Owner</Th>
              </>
            ) : (
              <Th>Owner {total && `(${total})`}</Th>
            )}
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(balances).map(([account, amount]) => (
            <Tr key={account}>
              {threeCol && <Td>{amount}</Td>}
              <Td>
                {threeCol || `(${amount})`}
                <Address
                  value={account} size={addrSize}
                  {...{ ensProvider }}
                />
              </Td>
              <Td>
                {account?.localeCompare(
                  address, undefined, { sensitivity: 'base' }
                ) === 0 && (
                  <Tooltip hasArrow label="Distribute">
                    <Button onClick={config}>
                      <span role="img" aria-label="Distribute">
                        ⛲
                      </span>
                    </Button>
                  </Tooltip>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}