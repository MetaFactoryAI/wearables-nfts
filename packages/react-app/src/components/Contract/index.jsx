import React, { useMemo, useState } from "react"
import { Card } from "antd"
import { useContractLoader, useContractExistsAtAddress } from "../../hooks"
import Account from "../Account"
import DisplayVariable from "./DisplayVariable"
import FunctionForm from "./FunctionForm"

const noContractDisplay = (
  <div>
    Loading…{" "}
    <div style={{ padding: 32 }}>
      You need to run{" "}
      <code>yarn run chain</code>
      {" "}and{" "}
      <code>yarn run deploy</code>
      {" "}to see your contract here.
    </div>
    <div style={{ padding: 32 }}>
      <span style={{ marginRight: 4 }} role="img" aria-label="warning">
        ☢️
      </span>
      Warning: You might need to run
      <code>yarn run deploy</code>
      {" "}<em>again</em> after the frontend comes up!
    </div>
  </div>
);

const isQueryable = fn => (
  ["view", "pure"].includes(fn.stateMutability)
  && fn.inputs.length === 0
)

export default ({
  customContract, account, gasPrice, signer,
  provider, name, show, price, blockExplorer,
}) => {
  const contracts = useContractLoader(provider)
  const contract = customContract ?? contracts?.[name] ?? null
  const address = contract?.address ?? null
  const contractIsDeployed = (
    useContractExistsAtAddress(provider, address)
  )

  const displayedContractFunctions = useMemo(
    () => (
      contract ? (
        Object.values(contract.interface.functions).filter(
          (fn) => (
            fn.type === "function"
            && (!show || show?.includes(fn.name))
          )
        )
      ) : ([])
    ),
    [contract, show],
  )

  const [refreshRequired, triggerRefresh] = useState(false)
  const contractDisplay = displayedContractFunctions.map(
    (fn) => {
      if(isQueryable(fn)) {
        return (
          <DisplayVariable
            key={fn.name}
            contractFunction={contract[fn.name]}
            functionInfo={fn}
            refreshRequired={refreshRequired}
            triggerRefresh={triggerRefresh}
          />
        )
      }
      return (
        <FunctionForm
          key={"FF" + fn.name}
          contractFunction={
            ["view", "pure"].includes(fn.stateMutability) ? (
              contract[fn.name]
            ) : (
              contract.connect(signer)[fn.name]
            )
          }
          functionInfo={fn}
          provider={provider}
          gasPrice={gasPrice}
          triggerRefresh={triggerRefresh}
        />
      )
    }
  )

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        title={
          <div>
            {name}
            <div style={{ float: "right" }}>
              <Account
                address={address}
                localProvider={provider}
                injectedProvider={provider}
                mainnetProvider={provider}
                price={price}
                blockExplorer={blockExplorer}
              />
              {account}
            </div>
          </div>
        }
        size="large"
        style={{ marginTop: 25, width: "100%" }}
        loading={contractDisplay?.length <= 0}
      >
        {contractIsDeployed ? contractDisplay : noContractDisplay}
      </Card>
    </div>
  );
}
