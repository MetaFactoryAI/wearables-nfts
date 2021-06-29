import { useState, useEffect } from 'react'
import usePoller from './Poller'
import useOnBlock from './OnBlock'

const DEBUG = false

/*
  ~ What it does? ~

  Enables you to read values from contracts and keep track of them in the local React states

  ~ How can I use? ~

  const purpose = useContractReader(readContracts,'YourContract', 'purpose')

  ~ Features ~

  - Provide readContracts by loading contracts (see more on ContractLoader.js)
  - Specify the name of the contract, in this case it is "YourContract"
  - Specify the name of the variable in the contract, in this case we keep track of "purpose" variable
  - Pass an args array if the function requires
  - Pass pollTime - if no pollTime is specified, the function will update on every new block
*/

export default (
  contracts, contractName, functionName, args,
  pollTime, formatter, onChange,
) => {
  let adjustPollTime = 0

  if(pollTime) {
    adjustPollTime = pollTime
  } else if(!pollTime && typeof args === 'number') {
    // it's okay to pass poll time as last argument without args for the call
    adjustPollTime = args
  }

  const [value, setValue] = useState()
  useEffect(() => {
    if(onChange instanceof Function) {
      setTimeout(onChange.bind(this, value), 1)
    }
  }, [value, onChange])

  const updateValue = async () => {
    try {
      let newValue
      if(DEBUG) console.log('CALLING ', contractName, functionName, 'with args', args)
      if(args && args.length > 0) {
        newValue = await contracts[contractName][functionName](...args)
        if(DEBUG) {
          console.log('contractName', contractName, 'functionName', functionName, 'args', args, 'RESULT:', newValue)
        }
      } else {
        newValue = await contracts[contractName][functionName]()
      }
      if(formatter instanceof Function) {
        newValue = formatter(newValue)
      }
      if(newValue !== value) {
        setValue(newValue)
      }
    } catch(e) {
      console.error(e)
    }
  }

// Only pass a provider to watch on a block if we have a contract and no PollTime
  useOnBlock(
    (
      (contracts?.[contractName] && adjustPollTime === 0)
      && contracts[contractName].provider
    ),
    () => {
      if(contracts?.[contractName] && adjustPollTime === 0) {
        updateValue()
      }
    }
  )

  // Use a poller if a pollTime is provided
  usePoller(async () => {
    if(contracts?.[contractName] && adjustPollTime > 0) {
      if(DEBUG) console.log('polling!', contractName, functionName)
      updateValue()
    }
  }, adjustPollTime, contracts?.[contractName])

  return value
}
