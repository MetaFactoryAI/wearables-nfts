import React from 'react'
import { Button } from '@chakra-ui/react'

export default ({ price }) => (
  <Button
    onClick={() => {
      window.open('https://ethgasstation.info/')
    }}
    size="lg" leftIcon="⛽️" borderRadius="50%"
    variant="outline" colorScheme="orange"
    title="Fast Gas Price"
  >
    {price === undefined ? 0 : parseInt(price, 10) / 10 ** 9}g
  </Button>
)