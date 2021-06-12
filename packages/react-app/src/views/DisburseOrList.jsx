import React from 'react'
import { Heading } from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import DisburseNFTs from "./DisburseNFTs"
import ExistingNFTs from "./ExistingNFTs"

export default ({
  address, ensProvider, contract, validNetwork,
}) => {
  const params = useParams()

  if(params.id) {
    return (
      <DisburseNFTs
        {...{ address, ensProvider, contract, validNetwork }}
      />
    )
  } else {
    return (
      <>
        <Heading align="center" m={8}>Select Which NFT To Distribute</Heading>
        <ExistingNFTs {...{ ensProvider, validNetwork }} action="disburse"/>
      </>
    )
  }
}