import React, { useState } from "react";
import "./tabs.scss";
// Reusable Tabs Component
const TabsComponent = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      {/* Tab Labels */}
      <div className='tabs'>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${activeTab === index ? "active" : ""}`}
            onClick={() => handleTabClick(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='tab-content'>{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default TabsComponent;
