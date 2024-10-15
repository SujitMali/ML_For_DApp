import React, { useEffect, useState } from "react";
import "./App.css";
import "antd/dist/antd.css";
import Router from "./routes/Router";
import { factoryABI } from "./abi";
import { ethers } from "ethers";
function App() {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const provider = ethers.getDefaultProvider("sepolia");

    const contract = new ethers.Contract(
      "0xd8e1dA4F2447Ce548A0E76374A0eFE625B48840B",
      factoryABI,
      provider
    );
    setContract(contract);
  }, []);

  return (
    <div className='App'>
      {/* <button onClick={fetch}>setmaster</button> */}
      <Router contract={contract} />
    </div>
  );
}

export default App;
