import React, { useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter,
  Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, FormHelperText, Textarea,
  UnorderedList, ListItem,
} from '@chakra-ui/react'
import Address from '../components/Address'

export default ({
  isOpen = false, onClose, quantity, ensProvider,
  distribute,
}) => {
  const [raw, setRaw] = useState('')
  const [addresses, setAddresses] = useState([])
  const update = (input) => {
    setRaw(input)
    setAddresses(
      input.split(/\s*([;,]|\s)\s*/)
      .filter(addr => !(/^([;,]|\s)?$/.test(addr)))
    )
  }
  const cancel = () => {
    update('')
    onClose()
  }
  const process = async () => {
    try {
      await distribute(addresses)
    } catch(err) {
      console.error(err)
    }
    onClose()
  }

  const InputTabs = () => (
    <Tabs isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab>CSV</Tab>
        <Tab>Parsed</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <FormControl>
            <FormLabel>Comma Separated ETH Addresses</FormLabel>
            <Textarea
              placeholder="Enter space, semicolon, or comma separated eth addresses."
              value={raw} minH="6em"
              onChange={evt => update(evt.target.value)}
            />
            <FormHelperText>Each address will get one token.</FormHelperText>
          </FormControl>
        </TabPanel>
        <TabPanel>
          <UnorderedList>
            {addresses.map((addr) => (
              <ListItem key={addr}>
                <Address
                  value={addr} size="short" {...{ ensProvider }}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Distribute {addresses.length} / {quantity} Tokens</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputTabs/>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue" mr={3}
            onClick={process}
          >
            Distribute
          </Button>
          <Button variant="ghost" onClick={cancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}