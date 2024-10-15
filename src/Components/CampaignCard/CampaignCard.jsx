import React from "react";
import "./campaign.scss";
import { Avatar, message } from "antd";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { ethToInr } from "../../utils/unitconvert";
import AntdProgress from "../ProgressBar/AntdProgress";
import { inPercentage } from "./../../utils/percent";
import campaignImg from "../../assets/images/campaign.png";
import useAccount from "../../utils/useAccount";
export default function CampaignCard({ data }) {
  const navigate = useNavigate();
  const { account } = useAccount();
  const handleNavigate = () => {
    if (account) {
      navigate(`/campaign/${data?.campaignAddress}`);
    } else {
      message.error("Please connect your wallet");
    }
  };

  return (
    <div onClick={handleNavigate} className='campaigncard_container'>
      <div className='img_container'>
        <img src={data?.images[0] || campaignImg} alt='' />
      </div>
      {/* <div>
        <AntdProgress
          percent={
            (data?.goal &&
              inPercentage(
                ethers.utils.formatUnits(data?.pledged),
                ethers.utils.formatUnits(data?.goal)
              )) ||
            0
          }
        />
      </div> */}
      <div className='info_campaign'>
        <a href='#'>{data?.category}</a>
        <h3>{data?.title}</h3>
        <p>{data?.description}</p>
        <div className='financial_info'>
          {/* <span>
            <h4>Pledged</h4>
            <p>
              Eth {ethers.utils.formatUnits(data?.pledged)} <br /> Rs.
              {ethToInr(ethers.utils.formatUnits(data?.pledged))}
            </p>
          </span> */}
          <span>
            <h4>Goal</h4>
            <p>
              ETH {ethers.utils.formatUnits(data?.goal)} <br /> Rs.
              {ethToInr(ethers.utils.formatUnits(data?.goal))}
            </p>
          </span>
          {/* <span>
            <h4>Sharks</h4>
            <p>{data?.transaction.length}</p>
          </span> */}
        </div>
        <div className='created_by'>
          <Avatar
            style={{ backgroundColor: "#4cc899", margin: "20px 5px" }}
            size='large'
            icon={<UserOutlined />}
          />
          <div>
            <h6>Created For</h6>
            <p>Crowdfunding</p>
          </div>
        </div>
      </div>
    </div>
  );
}
