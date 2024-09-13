import React from 'react';

const CharacterPanel = ({ player }) => {
  return (
    <div className="character-panel">
      <h2>{player.name} the {player.class}</h2>
      <p>Level: {player.level}</p>
      <p>HP: {player.health}</p>
      <p>Attack: {player.attack}</p>
      <p>Defense: {player.defense}</p>
      <p>Speed: {player.speed}</p>
      <p>XP: {player.experience}/{player.level * 100}</p>
    </div>
  );
};

export default CharacterPanel;