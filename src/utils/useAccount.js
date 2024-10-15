import { useState, useEffect } from "react";

export default function useAccount() {
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isError, setAuthError] = useState("");

  const handleConnect = async () => {
    console.log("windows", window);
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async (accounts) => {
          accountChangedHandler(accounts[0]);
        });
    } else {
      setAuthError("Please Install MetaMask");
    }
  };

  const accountChangedHandler = (account) => {
    console.log("account", account);
    if (account) {
      localStorage.setItem("account", account);
      localStorage.setItem("isAuthenticated", true);
      setIsAuthenticated(true);
      setAccount(account);
    }
  };

  const handleLogout = () => {
    localStorage.setItem("isAuthenticated", false);
    localStorage.removeItem("account");

    setIsAuthenticated(false);
    setAccount(null);
  };

 
  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated") === "true";

    setIsAuthenticated(auth ? true : false);
    setAccount(localStorage.getItem("account"));
  }, [localStorage.getItem("isAuthenticated")]);

  return { account, isAuthenticated, isError, handleConnect, handleLogout };
}
