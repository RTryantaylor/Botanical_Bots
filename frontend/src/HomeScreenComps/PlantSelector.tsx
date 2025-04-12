import React from 'react'
import Select from 'react-select'

import "./HomeScreen.css"

const options = [
    { value: 'bamboo', label: 'Bamboo' },
    { value: 'cactus', label: 'Cactus' },
    { value: 'eucalyptus', label: 'Eucalyptus' },
    { value: 'fiddle-leaf fig', label: 'Fiddle-Leaf Fig'},
    { value: 'orchid', label: 'Orchid'},
    { value: 'philodendron', label: 'Philodendron'},
    { value: 'snake plant', label: 'Snake Plant'},
    { value: 'split-leaf philodendron', label: 'Split-Leaf Philodendron'}
]

function PlantSelector() {
    return (
        <div className="plant-selector">
            <Select options={options} />
        </div>
    )
}

export default PlantSelector;
