import React from "react";
import MainSidebar from "./main";
import HistorySidebar from "./history";

const Sidebars = () => {
  return (
    <div className="flex-1 flex gap-[15px] overflow-hidden">
      <MainSidebar />
      <HistorySidebar />
    </div>
  );
};

export default Sidebars;
