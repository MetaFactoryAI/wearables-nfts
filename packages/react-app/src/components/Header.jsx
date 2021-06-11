import React from "react"
import { chakra, Flex, Image, Text } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import "@fontsource/crimson-text/600.css"
import logo from '../logo.svg'

export default (props) => (
  <Link to="/">
    <chakra.header fontFamily="Crimson Text" fontSize={35} {...props}>
      <Flex align="center">
        <Image src={logo} h="2rem"/>
        <Text ml={3}>MetaFactory Wearables NFT Manager</Text>
      </Flex>
    </chakra.header>
  </Link>
)