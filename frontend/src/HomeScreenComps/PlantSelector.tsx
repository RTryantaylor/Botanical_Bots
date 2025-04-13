import React from 'react';
import Select, { SingleValue } from 'react-select';

export type PlantOption = {
    value: string;
    label: string;
    moisture: number;
    ideal_min_temp: number;
    ideal_max_temp: number;
    description: string;
    ideal_sunlight: string;
    ideal_water: number;
    ideal_min_ph: number;
    ideal_max_ph: number;
};

type Props = {
    plantTypes: { [key: string]: { 
        label: string; 
        moisture: number; 
        ideal_min_temp: number;
        ideal_max_temp: number;
        description: string;
        ideal_sunlight: string;
        ideal_water: number;
        ideal_min_ph: number;
        ideal_max_ph: number; } };
    onSelect?: (option: PlantOption) => void;
    selected: PlantOption | null;
};

function PlantSelector({ plantTypes, onSelect, selected }: Props) {
    const options: PlantOption[] = Object.keys(plantTypes).map(plantName => ({
        value: plantName,
        label: plantTypes[plantName].label,
        moisture: plantTypes[plantName].moisture,
        ideal_min_temp: plantTypes[plantName].ideal_min_temp,
        ideal_max_temp: plantTypes[plantName].ideal_max_temp,
        description: plantTypes[plantName].description,
        ideal_sunlight: plantTypes[plantName].ideal_sunlight,
        ideal_water: plantTypes[plantName].ideal_water,
        ideal_min_ph: plantTypes[plantName].ideal_min_ph,
        ideal_max_ph: plantTypes[plantName].ideal_max_ph,
    }));

    const handleChange = (selectedOption: SingleValue<PlantOption>) => {
        if (selectedOption && onSelect) {
            onSelect(selectedOption);
        }
    };

    return (
        <div className="plant-selector">
            <Select
                options={options}
                value={selected}
                onChange={handleChange}
                styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '30px',
                      fontSize: '14px',
                    }),
                    menu: (provided) => ({
                      ...provided,
                      maxHeight: '100px',
                      overflow: 'hidden', // important: avoid scroll conflict
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '100px', // THIS is what makes it scrollable
                      overflowY: 'auto',
                    }),
                    option: (provided) => ({
                      ...provided,
                      fontSize: '14px',
                      padding: '6px 10px',
                    }),
                }}                  
            />
        </div>
    );
}

export default PlantSelector;
