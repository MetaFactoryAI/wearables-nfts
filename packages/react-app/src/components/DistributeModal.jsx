import React, { useRef, useState } from 'react'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter,
  Button, Tabs, TabList, TabPanels, Tab, TabPanel,
  FormControl, FormLabel, FormHelperText, Textarea,
  OrderedList, ListItem,
} from '@chakra-ui/react'
import Address from './Address'

const InputTabs = ({
  text, raw, update, addresses, ensProvider,
}) => (
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
            ref={text} value={raw} minH="6em"
            onChange={(evt) => update(evt.target.value)}
          />
          <FormHelperText>Each address will get one token.</FormHelperText>
        </FormControl>
      </TabPanel>
      <TabPanel>
        <OrderedList>
          {addresses.map((addr) => (
            <ListItem key={addr} justifyContent="center">
              <Address
                value={addr} size="medium" {...{ ensProvider }}
              />
            </ListItem>
          ))}
        </OrderedList>
      </TabPanel>
    </TabPanels>
  </Tabs>
)

export default ({
  isOpen = false, onClose, quantity, ensProvider,
  distribute,
}) => {
  const [raw, setRaw] = useState('')
  const [addresses, setAddresses] = useState([])
  const text = useRef()
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
      onClose()
    } catch(err) {
      console.error('Distribution Error', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={text}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Distribute {addresses.length} / {quantity} Tokens
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputTabs {...{
            text,
            raw,
            update,
            addresses,
            ensProvider,
          }}/>
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