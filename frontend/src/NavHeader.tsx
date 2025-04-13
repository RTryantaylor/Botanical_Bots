import React from "react";
import "./NavHeader.css";

const NavHeader = ({ onNavigate }: { onNavigate: (screen: string) => void }) => {
  return (
    <header className="nav-header">
      <nav className="nav-left">
        <strong>Botanical Bots</strong>
      </nav>
      <div className="nav-right">
        <span className="nav-item" onClick={() => onNavigate("Home")}><b>Home</b></span>
        <span className="nav-item" onClick={() => onNavigate("Graphs")}><b>Graphs</b></span>
        <span className="nav-item" onClick={() => onNavigate("AboutUs")}><b>About Us</b></span>
      </div>
    </header>
  );
};

export default NavHeader;
