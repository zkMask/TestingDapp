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
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
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

  // function handleSlippageChange(e) {
  //   setSlippage(e.target.value);
  // }
  
const contractAddress = "0x077E2d6Eba901F677137dd90576c8fB399eF5D87";

  function changeAmount2(e) {
    setValue(e.target.value);
  
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
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
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
    } else {
      setTokenTwo(tokenList[i]);
      
    }
    setIsOpen(false);
  }

  function changeAddress1(e) {
    setTokenOneAmount(e.target.value);
   
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

  // [signer] = await ethers.getSigners();
  //       let transfer = await ethers.getContractAt(
  //         "Transfer",
  //         contractAddress,
  //         signer
  //       );
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const account = accounts[0];
  const owner = provider.getSigner(account);
  const Abi =  [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_tokenAddress",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"stateMutability": "payable",
			"type": "fallback"
		},
		{
			"inputs": [],
			"name": "getContractBalance",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getContractOwner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "token",
			"outputs": [
				{
					"internalType": "contract IERC20",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address payable",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "transferTokens",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"stateMutability": "payable",
			"type": "receive"
		}
	];
  let contract = new ethers.Contract(contractAddress, Abi, owner);
  // console.log("Before ----",balanceOf("0x3af37FB1959EC82007d2DDAb6058c394275EB513"));
    console.log(await contract.connect(owner).transferTokens(tokenOneAmount, ethers.utils.parseEther(value))); // to: value and amount in the buttons 
    // console.log("Before ----", balanceOf("0xb5Cf06445a76f3Af72ff0c3b375746bc5b63bE95"));

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
            value={tokenOneAmount}
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
        <div className="swapButton" disabled={!tokenOneAmount && !isConnected} onClick={onTransfer} >Transfer</div>
      </div>
    </>
  );
}

export default Swap;
