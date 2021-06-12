import { Container, FormControl, FormLabel, Input } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

export default ({
  contract, treasurer: treasurerParam, validNetwork
}) => {
  const [quantity, setQuantity] = useState(1)
  const [treasurer, setTreasurer] = useState(treasurerParam)
  const [metadata, setMetadata] = useState('')
  const history = useHistory()

  // ToDo: Fix this. The value is initially unset & later values are
  // ignored as a default value
  useEffect(() => {
    if(treasurerParam && !treasurer) {
      setTreasurer(treasurerParam)
    }
  }, [treasurerParam])

  const create = async (evt) => {
    evt.preventDefault()
    const enact = (
      window.confirm(`¿Mint ${quantity} token${quantity === 1 ? '' : 's'} to ${treasurer}?`)
    )
    if(enact) {
      await contract.mint(treasurer, quantity, metadata, [])
      history.push('/')
    }
  }

  if(!contract) {
    return (
      <Container>¡Missing Contract!</Container>
    )
  }

  return (
    <Container as="form" onSubmit={create}>
      <FormControl isRequired>
        <FormLabel>Quantity:</FormLabel>
        <Input
          type="number"
          value={quantity}
          onChange={(evt) => {
            const val = evt.target.value
            setQuantity(val && parseInt(val))
          }}
          placeholder="¿How many tokens to mint?"
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Treasurer:</FormLabel>
        <Input
          type="text"
          value={treasurer}
          onChange={(evt) => setTreasurer(evt.target.value)}
          placeholder="¿Who should receive the new tokens?"
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Metadata:</FormLabel>
        <Input
          value={metadata}
          onChange={(evt) => setMetadata(evt.target.value)}
          placeholder="ToDo: Automatically generate this…"
        />
      </FormControl>
      <Input
        mt={2} variant="filled" type="submit" value="Create"
        title={
          validNetwork ? 'Create NFTs' : 'Connect to the correct network.'
        }
        isDisabled={!validNetwork}
      />
    </Container>
  )
}