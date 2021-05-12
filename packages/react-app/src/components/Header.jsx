import React from "react"
import { PageHeader } from "antd"

export default function Header() {
  return (
    <a href="https://github.com/dysbulic/nft-wearable" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Wearable NFTs"
        subTitle="Ceramic-updatable ERC-1155 creating a virtual analogue of MetaMerch"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
