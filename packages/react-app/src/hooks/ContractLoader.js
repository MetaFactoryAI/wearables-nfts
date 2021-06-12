/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { Contract } from '@ethersproject/contracts'
import { useState, useEffect } from 'react'

const loadContract = (contractName, signer) => {
  const newContract = new Contract(
    require(`../contracts/${contractName}.address.js`),
    require(`../contracts/${contractName}.abi.js`),
    signer,
  );
  try {
    newContract.bytecode = require(`../contracts/${contractName}.bytecode.js`)
  } catch(e) {
    console.error('loadContract', e)
  }
  return newContract
}

export default (providerOrSigner) => {
  const [contracts, setContracts] = useState()

  useEffect(() => {
    const loadContracts = async () => {
      if(providerOrSigner !== undefined) {
        try {
          let accounts
          if(typeof providerOrSigner?.listAccounts === 'function') {
            accounts = await providerOrSigner.listAccounts()
          }

          let signer
          if(accounts && accounts.length > 0) {
            signer = providerOrSigner.getSigner()
          } else {
            signer = providerOrSigner
          }

          const contractList = require('../contracts/contracts.js')

          const newContracts = Object.fromEntries(
            contractList.map((contractName) => (
              [contractName, loadContract(contractName, signer)]
            ))
          )

          setContracts(newContracts)
        } catch(e) {
          console.error('ERROR LOADING CONTRACTS!!', e);
        }
      }
    }
    loadContracts()
  }, [providerOrSigner])

  return contracts
}