import React, { useEffect, useState } from "react"
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin, Table } from "antd"
import { SyncOutlined } from '@ant-design/icons'
import { Address, Balance } from "../components"
import { parseEther, formatEther } from "@ethersproject/units"
import { Link } from "react-router-dom"
import { useLookupAddress } from "../hooks"


export default ({
  singleEvents, batchEvents, ensProvider
}) => {
  // <List
  //   bordered
  //   dataSource={setPurposeEvents}
  //   renderItem={(item) => {
  //     return (
  //       <List.Item key={item.blockNumber + "_" + item.sender + "_" + item.purpose}>
  //         <Address
  //           address={item[0]}
  //           ensProvider={mainnetProvider}
  //           fontSize={16}
  //         /> →
  //         {item[1]}
  //       </List.Item>
  //     )
  //   }}
  // />

  if(Math.max(singleEvents?.length, batchEvents?.length) === 0) {
    return (
      <>
        <h2>No Tokens Have Been Created Yet</h2>
        <Link to="/new"><Button>Create One</Button></Link>
      </>
    )
  }

  const [data, setData] = useState([])
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (address) => (
        <Address
          {...{ address, ensProvider }}
          size="short"
        />
      ),
    },
    {
      title: 'Block Created',
      dataIndex: 'created_at_block',
      key: 'created_at_block',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Treasurer',
      dataIndex: 'treasurer',
      key: 'treasurer',
      render: (address) => (
        <Address
          {...{ address, ensProvider }}
          size="short"
        />
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => (
        <Link to={`/edit/${record.id}`}>Edit</Link>
      ),
    },
  ]

  useEffect(() => {
    const data = []
    singleEvents.forEach((evt) => {
      if(/^0x0+$/.test(evt.from)) { // minting event
        data.push({
          id: evt.id.toString(),
          creator: evt.operator,
          created_at_block: evt.blockNumber,
          quantity: evt.value.toString(),
          treasurer: evt.to,
        })
      }
    })
    setData(data)
  }, [singleEvents])

  return (
    <Table dataSource={data} {...{ columns }}/>
  )
}
