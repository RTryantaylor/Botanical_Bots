import React from 'react';
import { useState, useEffect } from 'react';
import axios from "axios";

import "./HomeScreen.css"
import PlantSelector from './PlantSelector';
import { PlantOption } from './PlantSelector';

function HomeScreen() {
  const [plantTypes, setPlantTypes] = useState({});
  const [selectedPlant, setSelectedPlant] = useState<PlantOption | null>(null);

  const plantImageMap: { [key: string]: string } = {
    chives: "/plant_images/chives.png",
    jade_plant_mini: "/plant_images/jade_plant_mini.png",
    parsley: "/plant_images/parsley.png",
    thyme: "/plant_images/thyme.png",
    african_violet: "/plant_images/african_violet.png",
    basil: "/plant_images/basil.png",
    begonia: "/plant_images/begonia.png",
    echeveria: "/plant_images/echeveria.png",
    haworthia: "/plant_images/haworthia.png",
    kalanchoe: "/plant_images/kalanchoe.png",
  };

  const [sensorData, setSensorData] = useState({
    temp: 0,
    ph: 0,
    moisture: 0,
    light: 0,
  });

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://192.168.1.159:8085/get_plant_types")
        .then(res => {
          const data = res.data;
  
          // Format plant types with display-friendly labels
          const formattedTypes: { [key: string]: { 
            label: string; 
            moisture: number; 
            ideal_min_temp: number;
            ideal_max_temp: number;
            description: string;
            ideal_sunlight: string;
            ideal_water: number;
            ideal_min_ph: number;
            ideal_max_ph: number; } } = {};
          Object.keys(data.types).forEach((plantName) => {
            formattedTypes[plantName] = {
              label: plantName.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
              moisture: data.types[plantName].moisture,
              ideal_min_temp: data.types[plantName].ideal_min_temp,
              ideal_max_temp: data.types[plantName].ideal_max_temp,
              description: data.types[plantName].description,
              ideal_sunlight: data.types[plantName].ideal_sunlight,
              ideal_water: data.types[plantName].ideal_water,
              ideal_min_ph: data.types[plantName].ideal_min_ph,
              ideal_max_ph: data.types[plantName].ideal_max_ph
            };
          });
  
          setPlantTypes(formattedTypes);
  
          // Set selected plant if it exists
          const selectedName = data.curr_selected;
          const selected = formattedTypes[selectedName];
          if (selected) {
            setSelectedPlant({
              value: selectedName,
              label: selected.label,
              moisture: selected.moisture,
              ideal_min_temp: selected.ideal_min_temp,
              ideal_max_temp: selected.ideal_max_temp,
              description: selected.description,
              ideal_sunlight: selected.ideal_sunlight,
              ideal_water: selected.ideal_water,
              ideal_min_ph: selected.ideal_min_ph,
              ideal_max_ph: selected.ideal_max_ph,
            });
          }
        })
        .catch(err => console.error("Error fetching plant types:", err));
  
      axios.get("http://192.168.1.159:8085/get_sensor_data")
        .then(res => setSensorData(res.data))
        .catch(err => console.error("Error fetching sensor data:", err));
    };
  
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  
  

  const handlePlantSelect = (plant: PlantOption) => {
    console.log("Selected plant:", plant.value);
    console.log("Its moisture requirement:", plant.moisture);

    setSelectedPlant(plant);

    // Send PUT request to backend
    axios.put("http://192.168.1.159:8085/set_selected_plant", {
      plant: plant.value,
    }).then(res => {
      console.log("Plant selection updated:", res.data);
    }).catch(err => {
      console.error("Failed to update selected plant:", err);
    });
  };

  return (
    <div className="whole-screen-flex">
      <div className="left-screen-flex">
        <div>
          <img 
            src={selectedPlant ? plantImageMap[selectedPlant.value] : "/plant_images/default_plant.webp"} 
            alt="Plant" 
            width="300" 
            height="400"
            style={{ border: "2px solid #885920", borderRadius: "8px" }} 
          />
          <div style={{ width: "300px", textAlign: "center" }}>
            {selectedPlant && (
              <div>{selectedPlant.description}</div>
            )}
          </div>
        </div>
        <PlantSelector
          plantTypes={plantTypes}
          onSelect={handlePlantSelect}
          selected={selectedPlant}
        />

      </div>
      <div className="right-screen-flex">
        <div className="tooltip-wrapper">
          <span className="info-button">i</span>
          <div className="tooltip-box">
            These sensor readings are being sent from our microcontroller<br />
            that reads from a multitude of sensors gathering data from our<br />
            Plant Buddy.
          </div>
        </div>
        <div className="individual-description-flex">
          <div><b>Sensor Temperature:</b> {sensorData.temp.toFixed(1)} °F</div>
          <div><b>Sensor PH:</b> {sensorData.ph}</div>
          <div><b>Sensor Moisture:</b> {sensorData.moisture}% VWC</div>
          <div><b>Sensor Light:</b> {sensorData.light} lux</div>
        </div>

        <div className="separator" />

        <div className="individual-description-flex">
          {selectedPlant && (
            <div><b>Ideal Temperature: </b>{selectedPlant.ideal_min_temp}°F–{selectedPlant.ideal_max_temp}°F</div>
          )}
          {selectedPlant && (
            <div><b>Ideal PH: </b>{selectedPlant.ideal_min_ph}–{selectedPlant.ideal_max_ph}</div>
          )}
          {selectedPlant && (
            <div><b>Ideal Water: </b>{selectedPlant.ideal_water}mL per day</div>
          )}
          {selectedPlant && (
            <div><b>Ideal Sunlight: </b>{selectedPlant.ideal_sunlight}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;