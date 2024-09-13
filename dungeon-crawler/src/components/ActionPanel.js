import React from 'react';

const ActionPanel = ({ onMove }) => {
  return (
    <div className="action-panel">
      <button onClick={() => onMove('up')}>Up</button>
      <button onClick={() => onMove('down')}>Down</button>
      <button onClick={() => onMove('left')}>Left</button>
      <button onClick={() => onMove('right')}>Right</button>
    </div>
  );
};

export default ActionPanel;