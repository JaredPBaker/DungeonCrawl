import React from 'react';

const enemySprites = {
  goblin: '/assets/images/enemies/enemy-goblin.jpg',
  skeleton: '/assets/images/enemies/enemy-skeleton.jpg',
  orc: '/assets/images/enemies/enemy-orc.jpg',
  troll: '/assets/images/enemies/enemy-troll.jpg',
  dragon: '/assets/images/enemies/enemy-dragon.jpg',
};

const GameBoard = ({ dungeon, player, currentEnemy }) => {
  return (
    <div className="game-board">
      {dungeon.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => (
            <div key={`${x}-${y}`} className={`cell ${cell}`}>
              {player.x === x && player.y === y && (
                <img 
                  src={`${process.env.PUBLIC_URL}/assets/images/characters/player-sprite.jpg`} 
                  alt="Player" 
                  className="sprite player-sprite" 
                />
              )}
              {currentEnemy && currentEnemy.x === x && currentEnemy.y === y && (
                <img 
                  src={`${process.env.PUBLIC_URL}${enemySprites[currentEnemy.type]}`} 
                  alt={currentEnemy.type} 
                  className="sprite enemy-sprite" 
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;