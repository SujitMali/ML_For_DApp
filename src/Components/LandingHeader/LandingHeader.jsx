import React from "react";
import { ethers } from "ethers";
import { HeartFilled } from "@ant-design/icons";
import { Modal, Input, message } from "antd";
import "./landingheader.scss";
import Button from "../Button/Button";
import robot from "../../assets/images/robot.png";
import Header from "./../Header/Header";
import AntdProgress from "./../ProgressBar/AntdProgress";
import dateinSec from "../../utils/dateinSec";
import { factoryABI } from "./../../abi";
import useAccount from "../../utils/useAccount";
import { create } from "ipfs-http-client";

const client = create("https://ipfs.infura.io:5001/api/v0");

export default function LandingHeader() {
  const [isModelvisible, setIsModelVisible] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [uploaded, setFileuploaded] = React.useState(false);
  const [loading, setIsloading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [fileUrls, setFileUrls] = React.useState([]);
  const [form, setForm] = React.useState({
    category: "",
    title: "",
    description: "",
    goal: "1",
    startDate: "",
    endDate: "",
  });
  const allfields =
    form.category &&
    form.title &&
    form.description &&
    form.goal &&
    form.startDate &&
    form.endDate;
  const { account } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    let obj = {
      ...form,
      file: file,
      [name]: value,
    };
    setForm(obj);
  };

  const handleUpload = async (file) => {
    message.loading("File is uploading..");
    setIsloading(true);
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log("fileURL", url);
      message.success("File uploaded successfully");
      setFileuploaded(true);
      setFileUrls([...fileUrls, url]);
      setIsloading(false);
    } catch (error) {
      console.error(error);
      setIsloading(false);
      message.error("File upload failed");
    }
  };

  const handleCreate = async () => {
    setIsloading(true);
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const contract = new ethers.Contract(
        process.env.REACT_APP_FACTORY_CONTRACT_ADD,
        factoryABI,
        signer
      );
      const tx = await contract.createCampaign(
        form.category,
        form.title,
        form.description,
        ethers.utils.parseEther(`${form.goal || 0}`),
        dateinSec(new Date(form.startDate)),
        dateinSec(new Date(form.endDate)),
        fileUrls,
        account ? account : "0x0",
        { gasLimit: 1000000 }
      );
      await tx.wait();
      setIsloading(false);
      handleModal(false);
    } catch (error) {
      setIsloading(false);
      handleModal(false);
    }
  };

  const handleModal = (bool) => {
    if (localStorage.getItem("isAuthenticated") == "true") {
      setIsModelVisible(bool);
    } else {
      message.error("Please login to create a campaign");
    }
  };

  const handleSroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };




  //===================================================================
  // const handleSubmit = async (e) => {
  //   handleCreate();
  // };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    await handleCreate(); // Call to create campaign on the blockchain
    await sendToAPI(); // Call to send data to your API
  };
  //===================================================================


  //==================================================================
  // New function to send data to the API
const sendToAPI = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/campaign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: form.category,
        title: form.title,
        description: form.description,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("API Response:", data); // Log the response from your API
  } catch (error) {
    console.error("Error sending to API:", error);
  }
};

  //==================================================================





  React.useEffect(() => {
    setIsAuthenticated(localStorage.getItem("isAuthenticated"));
  }, [localStorage.getItem("isAuthenticated")]);
  return (
    <>
      <div className="landing_container">
        <div className="welcome_container">
          <div className="welcome_content">
            <h1>Crowdfunding DApp</h1>
            <AntdProgress
              percent={53}
              status="active"
              style={{ width: "80%", marginLeft: "60px" }}
            />
            <div className="offer">
              <h2>Welcome !</h2>
              <p>
                Empower creators with the transformative power of Ether - your
                donation paves the way for tomorrow's success stories!{" "}
              </p>
              <br />
              <h2></h2>
              <p></p>
            </div>
            <div className="buttons">
              <Button
                onClick={handleSroll}
                style={{
                  backgroundColor: "#041d57",
                  height: "50px",
                  width: "200px",
                }}
                icon={<HeartFilled />}
              >
                Search For Campaign
              </Button>

              <Button
                style={{
                  backgroundColor: "#3e5a97",
                  width: "250px",
                  height: "50px",
                }}
                onClick={() => handleModal(true)}
              >
                Start a Campaign
              </Button>
            </div>
          </div>
          <div className="welcome_img">
            <img src={robot} alt="welcome" />
          </div>
        </div>
      </div>
      <Modal
        visible={isModelvisible}
        onCancel={() => handleModal(false)}
        footer={null}
      >
        <div className="input_class_container">
          <div>
            <Input
              required
              onChange={handleInput}
              type="text"
              name="category"
              className="input_class"
              placeholder="Enter Category"
            />
            <Input
              required
              onChange={handleInput}
              type="text"
              name="title"
              className="input_class"
              placeholder="Enter Title"
            />
            <Input
              required
              onChange={handleInput}
              type="number"
              name="goal"
              className="input_class"
              placeholder="Your Investment Goal"
            />
          </div>
          <Input.TextArea
            required
            onChange={handleInput}
            name="description"
            className="input_class_text_area"
            placeholder="Enter Description"
          />
        </div>
        <div className="input_class_container">
          <Input
            required
            onChange={handleInput}
            type="date"
            name="startDate"
            className="input_class"
          />
          <Input
            required
            onChange={handleInput}
            type="date"
            name="endDate"
            className="input_class"
            placeholder="End Date"
          />
        </div>

        <Button loading={loading} onClick={handleSubmit} disabled={!allfields}>
          SUBMIT
        </Button>
        <span></span>
      </Modal>
    </>
  );
}
