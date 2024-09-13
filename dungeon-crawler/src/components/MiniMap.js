import React from 'react';

const MiniMap = ({ dungeon, player }) => {
  return (
    <div className="mini-map">
      {dungeon.map((row, y) => 
        row.map((cell, x) => (
          <div 
            key={`${x}-${y}`} 
            className={`mini-cell ${cell} ${player.x === x && player.y === y ? 'player' : ''}`}
          />
        ))
      )}
    </div>
  );
};

export default MiniMap;