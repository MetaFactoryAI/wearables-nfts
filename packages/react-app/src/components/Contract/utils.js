import React from "react";
import { formatUnits } from "@ethersproject/units";
import { isAddress } from "@ethersproject/address";
import { Address } from "../../components";

const tryToDisplay = (thing) => {
  if(thing?.toNumber) {
    try {
      return thing.toNumber()
    } catch (e) {
      return `Ξ${formatUnits(thing, 'ether')}`
    }
  }
  if(thing?.startsWith?.('0x') && thing.length === 42) {
    return (
      <Address address={thing} fontSize={22}/>
    )
  }
  return JSON.stringify(thing)
}

export default tryToDisplay
