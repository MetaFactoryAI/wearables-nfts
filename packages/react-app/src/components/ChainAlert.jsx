import {
  Alert, AlertDescription, AlertIcon, AlertTitle, CloseButton,
} from '@chakra-ui/react'
import React, { useState } from 'react'

export default ({ NETWORK, selectedChainId, localChainId }) => {
  const [show, setShow] = useState(true)

  if(!show) return null

  return (
    <Alert status="error" maxW="20em" flexDirection="column">
      <AlertIcon />
      <AlertTitle mr={2}>⚠️ Wrong Network</AlertTitle>
      <AlertDescription align="center">
        You have <b>{NETWORK(selectedChainId)?.name ?? 'Unknown'}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
      </AlertDescription>
      <CloseButton
        position="absolute" right={2} top={2}
        onClick={() => setShow(false)}
      />
    </Alert>
  )
}
