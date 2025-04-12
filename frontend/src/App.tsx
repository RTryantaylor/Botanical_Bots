import React from 'react';
import { useState, useEffect } from 'react';
import axios from "axios";

import NavHeader from "./NavHeader";
import HomeScreen from './HomeScreenComps/HomeScreen';
import InformationScreen from './InformationScreenComps/InformationScreen';
import GraphScreen from './GraphScreenComps/GraphScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState("Home");
  const renderScreen = () => {
    switch (currentScreen) {
      case "Home":
        return <HomeScreen />;
      case "Graphs":
        return <GraphScreen />;
      case "Information":
        return <InformationScreen />;
      default:
        return <h2>Page Not Found</h2>;
    }
  };

  const [sensorData, setSensorData] = useState({
    temp: 0,
    ph: 0,
    moisture: 0,
    light: 0,
  })
  
  useEffect(() => {
    const fetchData = () => {
      axios.get("http://192.168.1.197:8085/get_sensor_data")
        .then(res => setSensorData(res.data))
        .catch(err => console.error("Error fetching sensor data:", err));
    };

    fetchData(); // Get immediately on mount
    const interval = setInterval(fetchData, 5000); // Every 5s

    return () => clearInterval(interval); // Cleanup on unmount
  }, [])

  return (
    <div>
      <NavHeader onNavigate={setCurrentScreen} />
      <div style={{ padding: "2rem" }}>{renderScreen()}</div>
    </div>
  );
}

export default App;
