import React from 'react';

const InventoryPanel = ({ inventory, onItemUse }) => {
  return (
    <div className="inventory-panel">
      <h3>Inventory</h3>
      {inventory.map((item, index) => (
        <button key={index} onClick={() => onItemUse(index)} className="item-button">
          <img src={require(`/public/assets/images/item-${item.name.toLowerCase().replace(' ', '-')}.png`)} alt={item.name} />
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default InventoryPanel;