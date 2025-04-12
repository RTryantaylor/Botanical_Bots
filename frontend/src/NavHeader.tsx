import React from "react";
import "./NavHeader.css";

const NavHeader = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  return (
    <header className="nav-header">
      <nav className="nav-left">
        <strong>Botanical Bots</strong>
      </nav>
      <div className="nav-right">
        <span className="nav-item" onClick={() => onNavigate("Home")}>Home</span>
        <span className="nav-item" onClick={() => onNavigate("Graphs")}>Graphs</span>
        <span className="nav-item" onClick={() => onNavigate("Information")}>Information</span>
      </div>
    </header>
  );
};

export default NavHeader;
