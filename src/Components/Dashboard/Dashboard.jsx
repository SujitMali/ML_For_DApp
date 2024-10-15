import React from "react";
import { Layout, Menu, message } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./Dashboard.scss";
import { ethers } from "ethers";
import { sharkblockABI } from "../../abi";
import DashboardCard from "../CampaignCard/DashBoardCard";
import Loader from './../loader/Loader';
import useAccount from "../../utils/useAccount";


export default function Dashboard({ contract }) {
  const { Sider } = Layout;
  const {isAuthenticated, account} = useAccount()
  const [allCampainAddr, setAllCampainAddr] = React.useState([]);
  const [allcampaigndetailsArray, setAllcampaigndetailsArray] = React.useState(
    []
  );
  const [loading, setloading] = React.useState(false);


  // React.useEffect(() => {
  //   (async () => {
  //     const allCampaignAddr = await contract.getAllCampaignAddress();
  //     setAllCampainAddr(allCampaignAddr);
  //   })();
  // }, [contract]);

  React.useEffect(() => {
    const provider = ethers.getDefaultProvider("rinkeby");
    setloading(true);
    if (isAuthenticated) {
      (async () => {
        const detailArray = [];
        const userAddr = account;
        for (const addr of allCampainAddr) {
        
            const sharkcontract = new ethers.Contract(
              addr,
              sharkblockABI,
              provider
            );
            // let sharkblock = await sharkcontract.getCampaignDetails();
            // let owner = await sharkcontract.owner();
            // let images = await sharkcontract.getImages();
            // let _balance = await sharkcontract.getMyCampaignFund();
            // let transaction = await sharkcontract.getTransactions();
            // let status = await sharkcontract.status();
            let [sharkblock, owner, images, _balance, transaction, status] = await Promise.all([sharkcontract.getCampaignDetails(),sharkcontract.owner(),  sharkcontract.getImages(), sharkcontract.getMyCampaignFund(), sharkcontract.getTransactions(), sharkcontract.status()]);
            console.log(String(owner).toLocaleLowerCase(), userAddr, String(owner).toLocaleLowerCase() === userAddr);
            if (String(owner).toLocaleLowerCase() === userAddr) {
            
            let obj = {
              ...sharkblock,
              images: images,
              pledged: _balance,
              transaction,
              owner,
              status,
              address: sharkcontract.address,
            };
            console.log("obj", obj);
            detailArray.push(obj);
          } else {
            
          }
        }
        setAllcampaigndetailsArray(detailArray);
        setloading(false);
      })();
    } else {
     //message.error("Please login to view your campaigns");
    }
  }, [allCampainAddr]);

  return (<>
    { loading && <Loader />}
    <div className="dashboard_container">
      <div className="sidebar">
        <Sider trigger={null} collapsible collapsed={false}>
          <div className="logo" />
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{ height: "100vh" }}
          >
            <Menu.Item key="1" icon={<UserOutlined />}>
              DASHBOARD
            </Menu.Item>
            <Menu.Item key="2" icon={<VideoCameraOutlined />}>
              CAMPAIGNS
            </Menu.Item>
            <Menu.Item key="3" icon={<UploadOutlined />}>
              CREATE CAMPAIGN
            </Menu.Item>
          </Menu>
        </Sider>
      </div>
      <div className="dash_cam_container">
          {
              allcampaigndetailsArray.length > 0 && allcampaigndetailsArray.map((item, i) => <DashboardCard key={i} data={item} /> )

          }
      </div>
    </div>
    </>
  );
}
