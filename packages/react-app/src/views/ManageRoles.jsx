import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import { Container, Input, Stack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { WearablesNFTs } from '../contracts/contracts'

export default () => null

// const MintToggle = ({ address }) => {
//   const [loading, setLoading] = useState(true)
//   const [able, setAble] = useState(null)
//   const role = useMemo(
//     () => web3.utils.soliditySha3('MINTER_ROLE'),
//     [],
//   )

//   if(loading) {
//     return <Spinner/>
//   }

//   useEffect(() => {
//     (async () => {
//       setAble(
//         await contract.hasRole(address, role)
//       )
//       setLoading(false)
//     })()
//   }, [address, role])

//   const onClick = (evt) => {
//     setLoading(true)
//     const makeAble = evt.target.checked
//     try {
//       if(makeAble) {
//         contract.grantRole(address, role)
//       } else {
//         contract.revokeRole(address, role)
//       }
//       setAble(makeAble)
//     } catch(err) {
//       alert(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Button
//       {...{ onClick }}
//     >
//       {able ? '❌' : '✔'}
//     </Button>
//   )
// }
// const MetadataToggle = ({ address }) => (
//   null
// )

// export default (props) => {
//   const [addrs, setAddrs] = useState([])
//   const [addr, setAddr] = useState('')

//   const onSubmit = (evt) => {
//     evt.preventDefault()
//     if(/^(0x)?[a-z0-9]{40}$/i.test(addr)) {
//       console.info('Adding:', addr, [...new Set([...addrs, addr])])
//       setAddrs((addrs) => (
//         [...new Set([...addrs, addr])]
//       ))
//     } else {
//       console.info('Skipping:', addr)
//     }
//   }

//   const onChange = (evt) => {
//     setAddr(evt.target.value)
//   }

//   return (
//     <Stack>
//       <Container as="form" {...{ onSubmit }}>
//         <Input
//           name="address"
//           placeholder="ETH Address To Manage"
//           value={addr} {...{ onChange }}
//         />
//         <Input type="submit" value="Add"/>
//       </Container>
//       <Table>
//         <Thead><Tr>
//           <Th>Address</Th>
//           <Th>Can mint?</Th>
//           <Th>Manages metadata?</Th>
//         </Tr></Thead>
//         <Tbody>
//           {addrs.map((addr) => (
//             <Tr key={addr}>
//               <Td>{addr}</Td>
//               <Td><MintToggle address={addr}/></Td>
//               <Td><MetadataToggle address={addr}/></Td>
//             </Tr>
//           ))}
//         </Tbody>
//       </Table>
//     </Stack>
//   )
// }