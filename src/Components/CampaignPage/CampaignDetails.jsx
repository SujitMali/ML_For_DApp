import React, { useEffect, useRef } from "react";
import { Input, Button, Avatar, Tabs, Select, message, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { BigNumber, ethers } from "ethers";
import AntdProgress from "../ProgressBar/AntdProgress";
import { sharkblockABI } from "../../abi";
import "./CampaignDetails.scss";
import { useParams } from "react-router-dom";
import { ethToInr, weiToGwei } from "../../utils/unitconvert";
import { inPercentage } from "./../../utils/percent";
import { weiToEth } from "./../../utils/unitconvert";
import Loader from "./../loader/Loader";
import campaignImg from "../../assets/images/campaign.png";
import ethlogo from "../../assets/images/ethereum1.png";
import TabsComponent from "../Tabs/Tabs";
import useAccount from "../../utils/useAccount";
import { useState } from "react";
import LoaderComponent from "../Loader";

function toDateTime(secs) {
  var t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs).toString();
  let news = new Date(t);
  return news.toDateString();
}

export default function CampaignDetails() {
  const { TabPane } = Tabs;
  const [campaignDetails, setCampaignDetails] = React.useState({});
  const [isAuthenticated, setIAuthenticate] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [select, setSelect] = React.useState("ETH");
  const [analysis, setAnalysis] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { addr } = useParams();
  const { account } = useAccount();
  const [address, setAddress] = useState(account);
  const inputValue = {
    ETH: weiToEth(input),
    GWEI: weiToGwei(input),
    WEI: input,
  };

  const handleInvestFetch = async () => {
    try {
      const isEnded = isDateEnded(campaignDetails?.endDate);
      if (campaignDetails.status == "0" && !isEnded) {
        setIsLoading(true);
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const contract = new ethers.Contract(addr, sharkblockABI, signer);
        const tx = await contract.investNow({
          gasLimit: 210000,
          value: inputValue[select],
        });
        await tx.wait();
        setIsLoading(false);
      } else {
        message.info("Campaign is closed already !");
      }
    } catch (error) {
      console.log("Error", error);
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    try {
      if (address) {
        setIsLoading(true);
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const contract = new ethers.Contract(addr, sharkblockABI, signer);
        console.log("contractshark", contract);
        const tx = await contract.spendApproval({
          gasLimit: 210000,
        });
        await tx.wait();
        await getCampagings();
        setIsLoading(false);
      } else {
        message.error("Please connect to wallet");
      }
    } catch (error) {}
  };

  //===================================================================================
  const handleAnalyseButton = async () => {
    try {
      const dataToAnalyze = {
        title: campaignDetails.title,
        text: campaignDetails.description,
      };
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToAnalyze),
      });
      const result = await response.json();
      if (response.ok) {
        message.success("Campaign data analyzed successfully!");
        setAnalysis(result.data);
      } else {
        message.error(result.error || "Failed to analyze campaign data");
      }
    } catch (error) {
      console.error("Error analyzing campaign data:", error);
      message.error("Failed to analyze campaign data");
    }
  };

  const handleSaveToMongoDB = async () => {
    try {
      const dataToSave = {
        title: campaignDetails.title,
        description: campaignDetails.description,
        goal: ethers.utils.formatUnits(campaignDetails?.goal), // Convert to Ether string
        pledged: ethers.utils.formatUnits(campaignDetails?.pledged), // Convert to Ether string
        startDate: new Date(campaignDetails.startDate.toNumber() * 1000)
          .toISOString()
          .split("T")[0],
        endDate: new Date(campaignDetails.endDate.toNumber() * 1000)
          .toISOString()
          .split("T")[0],
        owner: campaignDetails.owner,
        status: campaignDetails.status,
      };

      // Send the data to your backend
      const response = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      // Check if response is in JSON format
      const result = await response.json();

      if (response.ok) {
        message.success("Campaign saved successfully!"); // Notify success
      } else {
        message.error(result.error || "Failed to save campaign data"); // Notify error
      }
    } catch (error) {
      console.error("Error saving campaign data:", error);
      message.error("Failed to save campaign data"); // Notify error
    }
  };

  //===================================================================================

  const handleWithdraw = async () => {
    setIsLoading(true);
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await web3Provider.getSigner();
    const contract = new ethers.Contract(addr, sharkblockABI, signer);
    const tx = await contract.tranferFromCampaign({
      gasLimit: 250000,
    });
    await tx.wait();
    await getCampagings();
    setIsLoading(false);
  };

  const handleClose = async () => {
    if (campaignDetails.status == "0") {
      setIsLoading(true);
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const contract = new ethers.Contract(addr, sharkblockABI, signer);
      const tx = await contract.closeCampaign({
        gasLimit: 250000,
      });
      await tx.wait();
      await getCampagings();
      setIsLoading(false);
    } else {
      message.info("Campaign is closed already !");
    }
  };

  const { Option } = Select;

  const handleInvest = () => {
    if (isAuthenticated == "true") {
      handleInvestFetch();
    } else {
      message.info("Please login to invest");
    }
  };

  const isDateEnded = (date) => {
    if (date) {
      var t = new Date(1970, 0, 1); // Epoch
      t.setSeconds(ethers.utils.formatUnits(date, "wei")).toString();
      const endDate = new Date(t).toDateString();
      const presentDate = Date.now();
      const dateObj = new Date(endDate);
      const milliseconds = dateObj.getTime();
      return presentDate > milliseconds;
    }
  };

  React.useEffect(() => {
    setIAuthenticate(localStorage.getItem("isAuthenticated"));
    const isEnded = isDateEnded(campaignDetails?.endDate);

    if (campaignDetails?.status == "1" || isEnded) {
      message.error("Campaign is already Closed");
    }
  }, [localStorage.getItem("isAuthenticated"), campaignDetails]);

  React.useEffect(() => {
    if (!isLoading) {
      setCampaignDetails({});
      getCampagings();
    }
  }, [addr, isLoading, address]);

  useEffect(() => {
    console.log("account", account);

    if (account) {
      getCampagings();
      setAddress(account);
    }
  }, [account]);

  const getCampagings = async () => {
    let provider = ethers.getDefaultProvider("sepolia");
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    if (account) {
      provider = web3Provider.getSigner();
    }

    console.log("getCampagings", address, provider);
    if (addr) {
      const sharkcontract = new ethers.Contract(
        addr,
        sharkblockABI,
        web3Provider.getSigner() || provider
      );

      (async () => {
        let [sharkblock, transaction, status, investor] = await Promise.all([
          sharkcontract.getCampaignDetails(),
          sharkcontract.getTransactions(),
          sharkcontract.status(),
          sharkcontract.getMyinvestment(),
        ]);
        console.log(
          "sharkcontract",
          address,
          provider,
          sharkcontract,
          investor
        );
        let obj = {
          ...sharkblock,
          category: sharkblock[0],
          title: sharkblock[1],
          description: sharkblock[2],
          startDate: sharkblock[4],
          endDate: sharkblock[5],
          images: sharkblock[6],
          goal: sharkblock[3],
          votes: Number(ethers.utils.formatUnits(sharkblock[9])) * 10 ** 18,
          votesInPer:
            (ethers.utils.formatEther(sharkblock[9]) /
              ethers.utils.formatEther(sharkblock[8])) *
            100,
          owner:
            String(sharkblock[7]).toLocaleLowerCase() ==
            String(address).toLocaleLowerCase(),
          investors: sharkblock[8],
          pledged: sharkblock[10],
          transaction,
          status,
          address: sharkcontract.address,
          Shark:
            String(investor.addr).toLocaleLowerCase() ==
            String(address).toLocaleLowerCase()
              ? investor
              : false,
        };
        console.log("cm", obj);
        setCampaignDetails(obj);
      })();
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      {!campaignDetails?.address && <Loader />}
      <div className="campaign_container">
        <div className="campaign_brif">
          <div className="img_container">
            {campaignDetails?.images && (
              <img src={campaignDetails?.images?.[0] || campaignImg} alt="" />
            )}
            <div>
              {campaignDetails?.images?.length > 0 &&
                campaignDetails?.images?.map((img, i) => (
                  <img key={i} src={img} alt="" />
                ))}
            </div>
          </div>
          <div className="info_campaign">
            <div className="canpaign_account">
              <div>
                <h2>Raised</h2>
                <p>
                  {campaignDetails?.pledged &&
                    inPercentage(
                      ethers.utils.formatUnits(campaignDetails?.pledged),
                      ethers.utils.formatUnits(campaignDetails?.goal)
                    ).toFixed(2)}
                  %
                </p>
              </div>
              <div>
                <h2>Goal</h2>
                <p>
                  {" "}
                  ETH{" "}
                  {campaignDetails?.goal &&
                    ethers.utils.formatUnits(campaignDetails?.goal)}{" "}
                  (Rs.
                  {(campaignDetails?.goal &&
                    ethToInr(
                      ethers.utils.formatUnits(campaignDetails?.goal)
                    )) ||
                    0}
                  )
                </p>
              </div>
            </div>
            <div className="progress_bar">
              <AntdProgress
                percent={
                  (campaignDetails?.goal &&
                    inPercentage(
                      ethers.utils.formatUnits(campaignDetails?.pledged),
                      ethers.utils.formatUnits(campaignDetails?.goal)
                    )) ||
                  0
                }
              />
            </div>
            <div className="pledged">
              <p>Pledged</p>
              <h1>
                ETH{" "}
                {campaignDetails?.pledged &&
                  ethers.utils.formatUnits(campaignDetails?.pledged)}{" "}
                <span>
                  (Rs.
                  {campaignDetails?.pledged &&
                    ethToInr(
                      ethers.utils.formatUnits(campaignDetails?.pledged)
                    )}
                  )
                </span>{" "}
              </h1>
            </div>
            <div className="investors_sharks">
              <p>Sharks</p>
              <h1>{campaignDetails?.transaction?.length}</h1>
            </div>
            {campaignDetails.owner ? (
              ethers.utils.formatUnits(campaignDetails?.pledged) > 0 && (
                <div className="withdraw">
                  {campaignDetails.status ? (
                    <Tooltip
                      title={
                        campaignDetails.votesInPer > 50
                          ? "You can withdraw"
                          : "Need votes more than 50%"
                      }
                    >
                      {" "}
                      <Button
                        onClick={handleWithdraw}
                        disabled={
                          campaignDetails.votesInPer > 50 ? false : true
                        }
                      >
                        Withdraw Funds
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="close campaign to withdraw">
                      {" "}
                      <Button onClick={handleClose}>Close the campaign</Button>
                    </Tooltip>
                  )}
                </div>
              )
            ) : (
              <div className="transaction_container">
                <div>
                  <Input
                    type="number"
                    disabled={campaignDetails?.status == "1"}
                    onChange={(e) => setInput(e.target.value)}
                    prefix={
                      <img src={ethlogo} className="ethereum_icon" alt="" />
                    }
                  />
                  <Select
                    className="select_value"
                    defaultValue="ETH"
                    onChange={(e) => setSelect(e)}
                    style={{ width: "80px" }}
                    bordered={false}
                  >
                    <Option value="ETH">ETH</Option>
                    <Option value="GWEI">GWEI</Option>
                    <Option value="WEI">WEI</Option>
                  </Select>
                </div>
                <div>
                  <Button
                    onClick={handleInvest}
                    disabled={
                      campaignDetails?.status == "1" ||
                      isDateEnded(campaignDetails?.endDate)
                    }
                    className="invest_button"
                    type="primary"
                  >
                    INVEST
                  </Button>
                </div>
              </div>
            )}

            {/* =================================================================================== */}

            <div className="flex items-center">
              <Button
                className="antd_button"
                onClick={handleAnalyseButton}
                type="ant-btn-primary"
              >
                Analyze
              </Button>
              {analysis !== "" && (
                <div className="loader-container">
                  <LoaderComponent
                    loaderId="loader-not-genuine"
                    percentageId="percentage-not-genuine"
                    percentageValue={Math.round(analysis.ng)}
                    color="#f44336"
                    value={"Not Genuine"}
                  />
                  <LoaderComponent
                    loaderId="loader-potentially-genuine"
                    percentageId="percentage-potentially-genuine"
                    percentageValue={Math.round(analysis.pg)}
                    color="#ff9800"
                    value={"Potentially Genuine"}
                  />
                  <LoaderComponent
                    loaderId="loader-genuine"
                    percentageId="percentage-genuine"
                    percentageValue={Math.round(analysis.g)}
                    color="#4caf50"
                    value={"Genuine"}
                  />
                </div>
              )}
            </div>

            {/* =================================================================================== */}

            <div className="created_by">
              <Avatar
                style={{ backgroundColor: "#4cc899", margin: "20px 5px" }}
                size="large"
                icon={<UserOutlined />}
              />
              <div>
                <h6>Created for</h6>
                <p>Crowdfunding</p>
              </div>
            </div>
          </div>
        </div>
        <div className="campaign_description">
          <div className="comapign_tabs">
            <TabsComponent
              tabs={[
                {
                  key: "1",
                  label: "Description",
                  content: (
                    <p>
                      {campaignDetails?.description &&
                        campaignDetails?.description}
                    </p>
                  ),
                },
                {
                  key: "2",
                  label: "Vote",
                  content: (
                    <div className="votes">
                      <div className=" header">
                        <p>
                          <span>Votes: {campaignDetails.votes}</span>
                          <span>
                            Votes in Percentage:{" "}
                            {Number(campaignDetails.votesInPer).toFixed(2)} %
                          </span>
                        </p>
                        <Button
                          disabled={
                            !campaignDetails.Shark ||
                            campaignDetails.Shark.hasVoted
                          }
                          onClick={handleVote}
                        >
                          {campaignDetails.Shark?.hasVoted ? "Voted" : "Vote"}
                        </Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "3",
                  label: "Transactions",
                  content: (
                    <>
                      {campaignDetails?.transaction?.length > 0 ? (
                        <div className="transaction_container">
                          {campaignDetails?.transaction?.map(
                            (transaction, i) => (
                              <Transaction key={i} transaction={transaction} />
                            )
                          )}
                        </div>
                      ) : (
                        <div>No recent funds yet!</div>
                      )}
                    </>
                  ),
                },
              ]}
            />
          </div>
          <div className="campaign_other_details">
            {campaignDetails?.startDate && (
              <div>
                <h2>Other Details</h2>
                <h3>Start Date -</h3>
                <p>
                  {toDateTime(
                    ethers.utils.formatUnits(campaignDetails?.startDate, "wei")
                  )}
                </p>
                <h3>End Date -</h3>
                <p>
                  {toDateTime(
                    ethers.utils.formatUnits(campaignDetails?.endDate, "wei")
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Transaction({ transaction }) {
  return (
    <div className="transaction_record">
      <h6>{transaction.addr}</h6>{" "}
      <p>{ethers.utils.formatUnits(transaction.amount)}</p>{" "}
      <p>
        {toDateTime(
          ethers.utils.formatUnits(transaction.date, "wei").toString()
        )}
      </p>
    </div>
  );
}
