export const saveGame = (gameState) => {
    localStorage.setItem('dungeonCrawlerSave', JSON.stringify(gameState));
  };
  
  export const loadGame = () => {
    const savedGame = localStorage.getItem('dungeonCrawlerSave');
    return savedGame ? JSON.parse(savedGame) : null;
  };