/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify } from "@ethersproject/bytes";
import { Row, Col, Input, Divider, Tooltip, Button } from "antd";
import { Transactor } from "../../helpers";
import tryToDisplay from "./utils";
import Blockies from "react-blockies";
const { utils } = require("ethers");


export default function FunctionForm({ contractFunction, functionInfo, provider, gasPrice, triggerRefresh }) {
  const [form, setForm] = useState({});
  const [txValue, setTxValue] = useState();
  const [returnValue, setReturnValue] = useState();

  const tx = Transactor(provider, gasPrice);

  let inputIndex = 0;
  const inputs = functionInfo.inputs.map(input => {
    const key = functionInfo.name + "_" + input.name + "_" + input.type + "_" + inputIndex++

    let buttons = ""
    if(input.type === "bytes32") {
      buttons = (
        <Tooltip placement="right" title={"to bytes32"}>
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if(utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.parseBytes32String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.formatBytes32String(form[key]);
                setForm(formUpdate);
              }
            }}
          >
            #️⃣
          </div>
        </Tooltip>
      )
    } else if(input.type === "bytes") {
      buttons = (
        <Tooltip placement="right" title="to hex">
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              if(utils.isHexString(form[key])) {
                const formUpdate = { ...form };
                formUpdate[key] = utils.toUtf8String(form[key]);
                setForm(formUpdate);
              } else {
                const formUpdate = { ...form };
                formUpdate[key] = utils.hexlify(utils.toUtf8Bytes(form[key] ?? ''))
                setForm(formUpdate);
              }
            }}
          >
            #️⃣
            </div>
        </Tooltip>
      )
    } else if(input.type === "uint256") {
      buttons = (
        <Tooltip placement="right" title="⨯ 10¹⁸">
          <div
            type="dashed"
            style={{ cursor: "pointer" }}
            onClick={async () => {
              const formUpdate = { ...form }
              formUpdate[key] = utils.parseEther(form[key])
              setForm(formUpdate)
            }}
          >
            ✴️
            </div>
        </Tooltip>
      )
    } else if(input.type === "address") {
      const possibleAddress = form[key]?.toLowerCase().trim()
      if(possibleAddress && possibleAddress.length === 42) {
        buttons = (
          <Tooltip placement="right" title="blockie">
            <Blockies seed={possibleAddress} scale={3} />
          </Tooltip>
        )
      }
    }

    return (
      <div style={{ margin: 2 }} key={key}>
        <Input
          size="large"
          placeholder={input.name ? input.type + " " + input.name : input.type}
          autoComplete="off"
          value={form[key]}
          name={key}
          onChange={(event) => {
            const formUpdate = { ...form };
            formUpdate[event.target.name] = event.target.value;
            setForm(formUpdate);
          }}
          suffix={buttons}
        />
      </div>
    )
  });

  const txValueInput = (
    <div style={{ margin: 2 }} key="txValueInput">
      <Input
        placeholder="transaction value"
        onChange={(e) => setTxValue(e.target.value)}
        value={txValue}
        addonAfter={
          <div>
            <Row>
              <Col span={16}>
                <Tooltip placement="right" title={" * 10^18 "}>
                  <div
                    type="dashed"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      let floatValue = parseFloat(txValue)
                      if(floatValue) setTxValue("" + floatValue * 10 ** 18);
                    }}
                  >
                    ✳️
                  </div>
                </Tooltip>
              </Col>
              <Col span={16}>
                <Tooltip placement="right" title="number to hex">
                  <div
                    type="dashed"
                    style={{ cursor: "pointer" }}
                    onClick={async () => {
                      setTxValue(BigNumber.from(txValue ?? 0).toHexString());
                    }}
                  >
                    #️⃣
                </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        }
      />
    </div>
  );

  if (functionInfo.payable) {
    inputs.push(txValueInput);
  }

  const buttonIcon = (
    <Button style={{ marginLeft: -32 }}>
      {functionInfo.type === 'call' ? (
        'Read 📡'
      ) : (
        'Send 💸'
      )}
    </Button>
  )
  inputs.push(
    <div style={{ cursor: "pointer", margin: 2 }} key="goButton">
      <Input
        onChange={(e) => setReturnValue(e.target.value)}
        defaultValue=""
        bordered={false}
        disabled={true}
        value={returnValue}
        suffix={
          <div
            style={{ width: 50, height: 30, margin: 0 }}
            type="default"
            onClick={async () => {
              let innerIndex = 0
              const args = functionInfo.inputs.map((input) => {
                const key = functionInfo.name + "_" + input.name + "_" + input.type + "_" + innerIndex++
                let value = form[key]
                if(input.baseType === "array"){
                  value = JSON.parse(value)
                } else if(input.type === "bool"){
                  if(value === 'true' || value === '1' || /^0x0*1$/.test(value)) {
                    value = 1
                  } else {
                    value = 0
                  }
                } else if(!value && input.type === 'bytes') {
                  value = []
                }
                return value
              })

              let result
              if(['view', 'pure'].includes(
                functionInfo.stateMutability
              )) {
                const returned = await contractFunction(...args)
                result = tryToDisplay(returned)
              } else {
                const overrides = {}
                if(txValue) {
                  overrides.value = txValue // ethers.utils.parseEther()
                }
                // Uncomment this if you want to skip the gas estimation for each transaction
                // overrides.gasLimit = hexlify(1200000);

                // console.log("Running with extras",extras)
                const returned = await tx(contractFunction(...args, overrides))
                result = tryToDisplay(returned)
              }

              console.log("SETTING RESULT:", result);
              setReturnValue(result);
              triggerRefresh(true);
            }}
          >
            {buttonIcon}
          </div>
        }
      />
    </div>,
  );

  return (
    <div>
      <Row>
        <Col
          span={8}
          style={{
            textAlign: "right",
            opacity: 0.333,
            paddingRight: 6,
            fontSize: 24,
          }}
        >
          {functionInfo.name}
        </Col>
        <Col span={16}>{inputs}</Col>
      </Row>
      <Divider />
    </div>
  );
}
