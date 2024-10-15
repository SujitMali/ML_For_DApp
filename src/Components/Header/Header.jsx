import React from "react";
import { Tooltip, Popover } from "antd";
import Button from "../Button/Button";
import { WalletFilled, UserOutlined } from "@ant-design/icons";
import logo from "../../assets/images/logo.jpg";
import metamaskicon from "../../assets/images/metamask.webp";
import "./Header.scss";
import { useNavigate } from "react-router-dom";

import useAccount from "../../utils/useAccount";
export default function Header() {
  const { handleConnect, isAuthenticated, account, handleLogout } =
    useAccount();
  const navigate = useNavigate();

  const handleAuthentication = (action) => {
    if (action) {
      //authenticate({ signingMessage: "Authenticate" });
      handleConnect();
    } else {
      handleLogout();
      localStorage.setItem("isAuthenticated", false);
    }
  };

  const handleNavigate = () => {
    navigate(`/dashboard`);
  };

  const content = (
    <div>
      <p onClick={() => handleLogout()}>LOG OUT</p>
    </div>
  );

  return (
    <div className='header_container'>
      <div>
        <div className='logo_container'>
          <img src={logo} alt='logo' />
        </div>
      </div>
      <div>
        {isAuthenticated && account && (
          <Tooltip title={account}>
            {" "}
            <Button
              style={{
                backgroundColor: "transparent",
                color: "#4cc899",
                width: "250px",
                border: "0px",
              }}
              icon={
                <img
                  className='metamask_icon'
                  src={metamaskicon}
                  alt='metamask_icon'
                />
              }
              type='text'
            >
              CONNECTED TO WALLET
            </Button>
          </Tooltip>
        )}

        {isAuthenticated && account ? (
          <Popover content={content}>
            <UserOutlined
              size='large'
              style={{
                fontSize: "20px",
                border: "1px solid #4cc899",
                padding: "10px",
                margin: "10px",
                borderRadius: "50%",
              }}
            />
          </Popover>
        ) : (
          <Button
            onClick={() => handleAuthentication(true)}
            style={{
              backgroundColor: "transparent",
              color: "black",
              width: "180px",
            }}
            icon={<WalletFilled style={{ color: "#4cc899" }} />}
            type='text'
          >
            {"CONNECT WALLET"}
          </Button>
        )}
      </div>
    </div>
  );
}
