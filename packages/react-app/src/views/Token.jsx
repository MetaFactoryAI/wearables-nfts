import React from 'react'
import {
  Alert, AlertIcon, Spinner,
  Table, Thead, Tbody, Tr, Th, Td,
} from '@chakra-ui/react'
import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router'
import Address from '../components/Address'

const TOKEN = gql(`
  query GetToken($id: String!) {
    token(id: $id) {
      id
      balances {
        account { id }
        value
      }
    }
  }
`)

export default ({ ensProvider }) => {
  const params = useParams()
  const id = params.id
  const { loading, error, data } = useQuery(
    TOKEN,
    { variables: { id } },
  )

  console.info('ID', id, data, error)

  if(loading) {
    return <Spinner/>
  }

  if(error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  const balances = data.token.balances

  if(!balances || balances.length === 0) {
    return (
      <Alert status="error">
        <AlertIcon />
        Couldn't find any balances.
      </Alert>
    )
  }

  return (
    <Stack>
      <Table>
        <Thead>
          <Tr><Th>Quantity</Th><Th>Owner</Th></Tr>
        </Thead>
        <Tbody>
          {balances.map((bal) => (
            <Tr key={bal.account.id}>
              <Td>{bal.value}</Td>
              <Td><Address
                value={bal.account.id} size="short"
                {...{ ensProvider }}
              /></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button>Distribute Tokens</Button>
    </Stack>
  )
}