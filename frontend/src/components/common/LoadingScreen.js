import React from "react";

export default function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "24px",
        fontWeight: "bold",
      }}
    >
      Loading...
    </div>
  );
}