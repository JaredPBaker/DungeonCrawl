import React from 'react';

const CombatPanel = ({ onCombatAction, enemy }) => {
  return (
    <div className="combat-panel">
      <h3>Combat!</h3>
      <p>Enemy: {enemy.type} (HP: {enemy.health})</p>
      <button onClick={() => onCombatAction('attack')}>Attack</button>
      <button onClick={() => onCombatAction('defend')}>Defend</button>
      <button onClick={() => onCombatAction('flee')}>Flee</button>
    </div>
  );
};

export default CombatPanel;