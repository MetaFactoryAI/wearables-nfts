import React, { useState } from 'react'
import { Form, Input, Layout } from 'antd'

export default ({ contract, treasurer: treasurerParam }) => {
  const [quantity, setQuantity] = useState(1)
  const [treasurer, setTreasurer] = useState(treasurerParam)
  const [metadata, setMetadata] = useState('')

  const create = (evt) => {
    //evt.preventDefault()
    const enact = (
      window.confirm(`¿Mint ${quantity} token${quantity === 1 ? '' : 's'} to ${treasurer}?`)
    )
    if(enact) {
      contract.mint(treasurer, quantity, metadata, [])
    }
  }

  return (
    <Layout style={{ maxWidth: '40rem', margin: 'auto' }}>
      <Form onFinish={create}>
        <Form.Item
          label="Quantity"
          rules={[{ required: true, message: 'Specify a quantity to create.' }]}
        >
          <Input
            type="number"
            value={quantity}
            onChange={(evt) => {
              const val = evt.target.value
              setQuantity(val && parseInt(val))
            }}
          />
        </Form.Item>
        <Form.Item
          label="Treasurer"
          rules={[{ required: true, message: 'Specify the recipient of the new tokens.' }]}
        >
          <Input
            type="text"
            value={treasurer}
            onChange={(evt) => {
              const val = evt.target.value
              setTreasurer(val)
            }}
          />
        </Form.Item>
        <Form.Item
          label="Metadata"
          rules={[{ required: true, message: 'Token metadata.' }]}
        >
          <Input
            value={metadata}
            onChange={(evt) => setMetadata(evt.target.value)}
          />
        </Form.Item>
       <Input type="submit" value="Create"/>
      </Form>
    </Layout>
  )
}