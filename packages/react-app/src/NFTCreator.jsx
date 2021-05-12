import React, { useState } from "react"
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd"
import { SyncOutlined } from '@ant-design/icons'
import { Address, Balance } from "../components"
import { parseEther, formatEther } from "@ethersproject/units"


export default ({ setPurposeEvents }) => (
  <List
    bordered
    dataSource={setPurposeEvents}
    renderItem={(item) => {
      return (
        <List.Item key={item.blockNumber + "_" + item.sender + "_" + item.purpose}>
          <Address
            address={item[0]}
            ensProvider={mainnetProvider}
            fontSize={16}
          /> →
          {item[1]}
        </List.Item>
      )
    }}
  />
)
