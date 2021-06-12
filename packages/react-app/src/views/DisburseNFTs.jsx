import React, { useEffect , useState} from 'react'
import {
  Alert, AlertIcon, Spinner, Stack, Button,
  Table, Thead, Tbody, Tr, Th, Td, useDisclosure,
  Box, Image, Flex, Heading, useToast,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router'
import Address from '../components/Address'
import Distribute from './DistributeModal'
import { httpURL } from '../helpers'

const TOKEN = gql(`
  query GetToken($id: String!) {
    token(id: $id) {
      identifier
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const params = useParams()
  const id = params.id
  let { loading, error, data } = useQuery(
    TOKEN, { variables: { id } },
  )
  const config = () => {
    setQuantity(balances[address.toLowerCase()])
    onOpen()
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
        duration: 9000,
        isClosable: true,
      })
      throw cause
    }
  }

  useEffect(() => {
    if(data?.token.balances) {
      const quantities = Object.fromEntries(
        data.token.balances.map((bal) => [
          bal.account.id,
          parseInt(bal.value, 10),
        ])
      )
      setBalances(quantities)
      setTotal(
        Object.values(quantities)
        .reduce((a, b) => a + b, 0)
      )
    }
    if(data?.token.identifier) {
      setTokenID(data.token.identifier)
    }
    if(data?.token.URI) {
      fetch(httpURL(data.token.URI))
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
  }, [data?.token?.balances])

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
      <Table>
        <Thead position="sticky" top="5rem" bg="white" zIndex={9}>
          <Tr>
            <Th>Quantity{total && `(${total})`}</Th>
            <Th>Owner</Th><Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(balances).map(([account, amount]) => (
            <Tr key={account}>
              <Td>{amount}</Td>
              <Td><Address
                value={account} size="medium"
                {...{ ensProvider }}
              /></Td>
              <Td>
                {account.toLowerCase() === address.toLowerCase() && (
                  <Button
                    onClick={config} isDisabled={!validNetwork}
                    title={
                      validNetwork ? 'Drop NFTs' : 'Connect to the correct network.'
                    }
                  >
                    Distribute
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}