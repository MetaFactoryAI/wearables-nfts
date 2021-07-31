import {
  Alert, AlertDescription, AlertIcon, AlertTitle, Button, CloseButton,
} from '@chakra-ui/react'
import React, { useState } from 'react'

export default ({
  NETWORK, selectedChainId, targetChainId, ...props
}) => {
  const [show, setShow] = useState(true)

  if(!show) return null

  const switchChain = async () => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{
        chainId: (
          `0x${NETWORK(targetChainId).chainId.toString(16)}`
        )
      }],
    });
  }

  return (
    <Alert
      status="error" maxW={80} bg="red.600"
      flexDirection="column" {...props}
    >
      <AlertIcon />
      <AlertTitle>Wrong Network</AlertTitle>
      <AlertDescription align="center">
        You have{' '}
        <b>{NETWORK(selectedChainId)?.name ?? 'Unknown'}</b>
        {' '}selected and you need to be on{' '}
        <b>{NETWORK(targetChainId).name}</b>.
        {window.ethereum && (
          <Button onClick={switchChain}>
            Switch to {NETWORK(targetChainId).name}
          </Button>
        )}
      </AlertDescription>
      <CloseButton
        position="absolute" right={2} top={2}
        onClick={() => setShow(false)}
      />
    </Alert>
  )
}