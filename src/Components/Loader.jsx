import React from "react";

const LoaderComponent = ({
  loaderId,
  percentageId,
  percentageValue,
  color,
  value,
}) => {
  const loaderStyle = {
    background: `conic-gradient(${color} ${percentageValue}%, #ccc ${percentageValue}% 100%)`,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h6>{value}</h6>
      <div
        className="progress"
        role="progressbar"
        aria-label="Example with label"
        aria-valuenow={percentageValue}
        aria-valuemin="0"
        aria-valuemax="100"
        style={loaderStyle}
      >
        <div
          className="progress-bar"
          style={{ width: percentageValue, backgroundColor: color }}
        >
          {percentageValue}%
        </div>
      </div>
    </div>
  );
};

export default LoaderComponent;
