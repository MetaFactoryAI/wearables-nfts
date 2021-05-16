import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

export default ({ contract }) => {
  const [metadata, setMetadata] = useState(null)
  const params = useParams()
  let id = params.id

  if(id === undefined) {
    return <p>Missing <code>id</code> of the NFT to edit.</p>
  }

  useEffect(() => {
    (async () => {
      setMetadata(await contract?.uri(id) ?? null)
    })()
  }, [contract, id])

  if(metadata) {
    return (
      <ul>
        <li>ID: {id.toString()}</li>
        <li>Metadata: {metadata}</li>
      </ul>
    )
  } else {
    return JSON.stringify(params)
  }
}