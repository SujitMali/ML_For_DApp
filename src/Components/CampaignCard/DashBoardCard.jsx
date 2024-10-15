import React from "react";
import "./DashBoardCard.scss";
import { message } from "antd";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { ethToInr } from "../../utils/unitconvert";
import AntdProgress from "../ProgressBar/AntdProgress";
import { inPercentage } from './../../utils/percent';
import Button from "../Button/Button";
import { sharkblockABI } from "../../abi";

export default function DashboardCard({data}) {
  const navigate = useNavigate();
  const handleNavigate = () => {
    if(data.status == '0'){
    navigate(`/campaign/${data?.address}`);
    } else {
      message.info("Campaign is closed");
    }
  }

  const handleWithdraw = async () => {
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await web3Provider.getSigner();
    //const getGasprice = await signer.getGasPrice();
    const contract = new ethers.Contract(
      data.address,
      sharkblockABI,
      signer
    );
   const tx = await contract.tranferFromCampaign({
    gasLimit: 250000
    });
   tx.wait();
  }

  const handleClose = async () => {
    if(data.status == '0') {
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await web3Provider.getSigner();
    //const getGasprice = await signer.getGasPrice();
 const contract = new ethers.Contract(
      data.address,
      sharkblockABI,
      signer
    );
   const tx = await contract.closeCampaign({
    gasLimit: 250000
    });
   tx.wait();
  } else {
    message.info("Campaign is closed already !");
  }
}

  return (
    <div  className="dash_campaigncard_container">
      <div onClick={handleNavigate} className="img_container">
        <img src={data?.images[0] || 'https://bafybeievw2qrhzyqbvag64neneiumyttimldwzfuredqkg6zpexyroysxu.ipfs.infura-ipfs.io/'} alt="" />
      </div>
      <div>
    <AntdProgress percent={data?.goal && inPercentage(ethers.utils.formatUnits(data?.pledged),ethers.utils.formatUnits(data?.goal)) || 0} />
      </div>
      <div className="info_campaign">
        <a href="#">{data?.category}</a>
        <h3>
          {data?.title}
        </h3>
        <p>
          {data?.description}
        </p>
        <div className="financial_info">
          <span>
            <h4>Pledged</h4>
            <p>Eth {ethers.utils.formatUnits(data?.pledged)} <br /> Rs.{ethToInr(ethers.utils.formatUnits(data?.pledged))}</p>
          </span>
          <span>
            <h4>Goal</h4>
            <p>ETH {ethers.utils.formatUnits(data?.goal)} <br /> Rs.{ethToInr(ethers.utils.formatUnits(data?.goal))}</p>
          </span>
          <span>
            <h4>Sharks</h4>
            <p>{data?.transaction.length}</p>
          </span>
        </div>
        <div className="created_by">
        <Button style={{width: '120px', margin: '5px'}} onClick={handleWithdraw}> WITHDRAW </Button>
        <Button style={{width: '120px', margin: '5px 10px'}} onClick={handleClose}> CLOSE </Button>
        </div>
      </div>
    </div>
  );
}
