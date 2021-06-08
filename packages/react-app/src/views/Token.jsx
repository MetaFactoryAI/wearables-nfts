import React, { useEffect , useState} from 'react'
import {
  Alert, AlertIcon, Spinner, Stack, Button,
  Table, Thead, Tbody, Tr, Th, Td, useDisclosure,
  Box, Image,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router'
import Address from '../components/Address'
import Distribute from './Distribute'
import sprinkler from '../sprinkler.svg'

const TOKEN = gql(`
  query GetToken($id: String!) {
    token(id: $id) {
      identifier
      balances {
        account { id }
        value
      }
    }
  }
`)

export default ({ ensProvider, address, contract }) => {
  const [balances, setBalances] = useState(null)
  const [quantity, setQuantity] = useState(null)
  const [tokenID, setTokenID] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const params = useParams()
  const id = params.id
  let { loading, error, data } = useQuery(
    TOKEN,
    { variables: { id } },
  )
  const config = () => {
    setQuantity(balances[address.toLowerCase()])
    onOpen()
  }
  const distribute = async (recipients) => {
    await Promise.all(
      recipients.map(async (recipient) => {
        await contract.safeTransferFrom(
          address, recipient, tokenID, 1, []
        )
      })
    )
  }

  useEffect(() => {
    if(data?.token.balances) {
      setBalances(
        Object.fromEntries(
          data.token.balances.map((bal) => [
            bal.account.id,
            bal.value,
          ])
        )
      )
    }
    if(data?.token.identifier) {
      setTokenID(data.token.identifier)
    }
  }, [data?.token.balances])

  if(loading) {
    return <Spinner/>
  }

  if(!balances || balances.length === 0) {
    error = error ?? "Couldn't find any balances."
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
    <Stack>
      <Distribute {...{ isOpen, onClose, quantity, distribute }}/>
      <Table>
        <Thead>
          <Tr><Th>Quantity</Th><Th>Owner</Th><Th>Actions</Th></Tr>
        </Thead>
        <Tbody>
          {Object.entries(balances).map(([account, amount]) => (
            <Tr key={account}>
              <Td>{amount}</Td>
              <Td><Address
                value={account} size="short"
                {...{ ensProvider }}
              /></Td>
              <Td>
                {account.toLowerCase() === address.toLowerCase() && (
                  <Box onClick={config} title="Distribute">
                    <Image src={sprinkler} alt="Dist"/>
                  </Box>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button onClick={config}>Distribute Tokens</Button>
    </Stack>
  )
}