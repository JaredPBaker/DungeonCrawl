import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import CharacterPanel from './components/CharacterPanel';
import InventoryPanel from './components/InventoryPanel';
import ActionPanel from './components/ActionPanel';
import CombatPanel from './components/CombatPanel';
import MiniMap from './components/MiniMap';
import { generateDungeon, movePlayer, combat, applyItemEffect, levelUp } from './utils/gameLogic';
import { saveGame, loadGame } from './utils/saveLoad';
import './styles/App.css';

const initialState = {
  player: {
    name: '',
    class: '',
    health: 100,
    attack: 10,
    defense: 5,
    speed: 5,
    inventory: [],
    experience: 0,
    level: 1,
    x: 0,
    y: 0
  },
  dungeon: null,
  currentLevel: 1,
  currentEnemy: null,
  gameStatus: 'setup'
};

const App = () => {
  const [gameState, setGameState] = useState(initialState);

  useEffect(() => {
    const audio = new Audio('/public/assets/audio/Into the Dungeon - Instrument.mp3');
    audio.loop = true;
    try {
      audio.play().catch(error => console.log('Audio play failed:', error));
    } catch (error) {
      console.log('Audio setup failed:', error);
    }
    return () => audio.pause();
  }, []);

  const startGame = (playerName, playerClass) => {
    const { dungeon, rooms } = generateDungeon(1);
    const startRoom = rooms[0];
    setGameState(prevState => ({
      ...prevState,
      player: {
        ...prevState.player,
        name: playerName,
        class: playerClass,
        x: startRoom.x + Math.floor(startRoom.width / 2),
        y: startRoom.y + Math.floor(startRoom.height / 2)
      },
      dungeon,
      gameStatus: 'playing'
    }));
  };

  const handleMove = (direction) => {
    const newState = movePlayer(gameState, direction);
    setGameState(newState);
    if (newState.gameStatus === 'combat') {
      new Audio('/assets/audio/combat-start.mp3').play();
    }
  };

  const handleCombatAction = (action) => {
    const newState = combat(gameState, action);
    setGameState(newState);
    if (newState.gameStatus === 'playing') {
      new Audio('/assets/audio/victory.mp3').play();
    }
  };

  const handleItemUse = (itemIndex) => {
    const newState = applyItemEffect(gameState, itemIndex);
    setGameState(newState);
    new Audio('/assets/audio/item-use.mp3').play();
  };

  const handleLevelUp = (attribute) => {
    const newState = levelUp(gameState, attribute);
    setGameState(newState);
    new Audio('/assets/audio/level-up.mp3').play();
  };

  const handleSave = () => {
    saveGame(gameState);
    alert('Game saved successfully!');
  };

  const handleLoad = () => {
    const loadedState = loadGame();
    if (loadedState) {
      setGameState(loadedState);
      alert('Game loaded successfully!');
    } else {
      alert('No saved game found.');
    }
  };

  return (
    <div className="app">
      {gameState.gameStatus === 'setup' && (
        <div className="setup-screen">
          <h1>Synth Dungeon Crawler</h1>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setGameState(prevState => ({
              ...prevState,
              player: { ...prevState.player, name: e.target.value }
            }))}
          />
          <select
            onChange={(e) => setGameState(prevState => ({
              ...prevState,
              player: { ...prevState.player, class: e.target.value }
            }))}
          >
            <option value="">Select a class</option>
            <option value="Warrior">Warrior</option>
            <option value="Mage">Mage</option>
            <option value="Rogue">Rogue</option>
          </select>
          <button onClick={() => startGame(gameState.player.name, gameState.player.class)}>
            Start Game
          </button>
          <button onClick={handleLoad}>Load Game</button>
        </div>
      )}
      {gameState.gameStatus !== 'setup' && (
        <div className="game-container">
          <div className="game-board-container">
            <GameBoard dungeon={gameState.dungeon} player={gameState.player} currentEnemy={gameState.currentEnemy} />
          </div>
          <div className="side-panel">
            <CharacterPanel player={gameState.player} />
            <InventoryPanel inventory={gameState.player.inventory} onItemUse={handleItemUse} />
            <ActionPanel onMove={handleMove} />
            <MiniMap dungeon={gameState.dungeon} player={gameState.player} />
            <button className="save-button" onClick={handleSave}>Save Game</button>
          </div>
        </div>
      )}
      {gameState.gameStatus === 'combat' && (
        <div className="combat-overlay">
          <CombatPanel onCombatAction={handleCombatAction} enemy={gameState.currentEnemy} />
        </div>
      )}
      {gameState.player.experience >= gameState.player.level * 100 && (
        <div className="level-up-modal">
          <h2>Level Up!</h2>
          <p>Choose an attribute to increase:</p>
          <button onClick={() => handleLevelUp('health')}>Health</button>
          <button onClick={() => handleLevelUp('attack')}>Attack</button>
          <button onClick={() => handleLevelUp('defense')}>Defense</button>
          <button onClick={() => handleLevelUp('speed')}>Speed</button>
        </div>
      )}
      {gameState.gameStatus === 'gameOver' && (
        <div className="game-over-screen">
          <h2>Game Over</h2>
          <p>You reached level {gameState.currentLevel}</p>
          <button onClick={() => setGameState({ ...initialState, gameStatus: 'setup' })}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default App;