import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";


function Swap(props) {
  const { address, isConnected } = props;
  const [messageApi, contextHolder] = message.useMessage();
  // const [slippage, setSlippage] = useState(2.5);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [addressTo, setAddressTo] = useState(null);
  const [value, setValue] = useState(null);

  const [txDetails, setTxDetails] = useState({
    to:null,
    data: null,
    value: null,
  }); 

  const {data, sendTransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    }
  })

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

const contractAddress = "0x8D99163c2C04Df214b0546A7a40F8427b0F70C97";

  function changeAmount2(e) {
    setValue(e.target.value);
  
  }

  function switchTokens() {
    setPrices(null);
    setAddressTo(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    // fetchPrices(two.address, one.address);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i){
    setPrices(null);
    setAddressTo(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
    } else {
      setTokenTwo(tokenList[i]);
      
    }
    setIsOpen(false);
  }

  function changeAddress1(e) {
    setAddressTo(e.target.value);
   
  }

 
  useEffect(()=>{

      if(txDetails.to && isConnected){
        sendTransaction();
      }
  }, [txDetails])

  useEffect(()=>{

    messageApi.destroy();

    if(isLoading){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    

  },[isLoading])

  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    }else if(txDetails.to){
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }

  },[isSuccess])
  async function onTransfer(){

  [signer] = await ethers.getSigners();
        let transfer = await ethers.getContractAt(
          "Transfer",
          contractAddress,
          signer
        );
      
        transfer.transferTokens(addressTo,value); // to: value and amount in the buttons 

}

 
  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
      
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Transfer</h4>
          <Popover
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="Enter Address"
            value={addressTo}
            onChange= {changeAddress1}
          />
          <Input placeholder="Enter Amount" value={value} onChange={changeAmount2} />
          <div className="switchButton" >
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" >
          
          </div>
          <div className="assetTwo" >
        
          </div>
        </div>
        <div className="swapButton" disabled={!addressTo && !isConnected} onClick={onTransfer} >Transfer</div>
      </div>
    </>
  );
}

export default Swap;
