import { generateRandomNumber } from './helpers';

const DUNGEON_SIZE = 20;
const ROOM_ATTEMPTS = 50;
const MIN_ROOM_SIZE = 3;
const MAX_ROOM_SIZE = 8;

export const generateDungeon = (level) => {
  const dungeon = Array(DUNGEON_SIZE).fill().map(() => Array(DUNGEON_SIZE).fill('wall'));
  const rooms = [];

  // Generate rooms
  for (let i = 0; i < ROOM_ATTEMPTS; i++) {
    const roomWidth = generateRandomNumber(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const roomHeight = generateRandomNumber(MIN_ROOM_SIZE, MAX_ROOM_SIZE);
    const roomX = generateRandomNumber(1, DUNGEON_SIZE - roomWidth - 1);
    const roomY = generateRandomNumber(1, DUNGEON_SIZE - roomHeight - 1);

    if (doesRoomOverlap(rooms, roomX, roomY, roomWidth, roomHeight)) continue;

    const room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
    rooms.push(room);

    // Carve out the room
    for (let y = roomY; y < roomY + roomHeight; y++) {
      for (let x = roomX; x < roomX + roomWidth; x++) {
        dungeon[y][x] = 'floor';
      }
    }
  }

  // Connect rooms with corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const roomA = rooms[i];
    const roomB = rooms[i + 1];
    connectRooms(dungeon, roomA, roomB);
  }

  // Add stairs to next level
  if (level < 5) {
    const lastRoom = rooms[rooms.length - 1];
    dungeon[lastRoom.y + Math.floor(lastRoom.height / 2)][lastRoom.x + Math.floor(lastRoom.width / 2)] = 'stairs';
  }

  // Place items and enemies
  placeItemsAndEnemies(dungeon, rooms, level);

  // Add some neon "power lines"
  for (let i = 0; i < Math.floor(DUNGEON_SIZE / 5); i++) {
    const x = Math.floor(Math.random() * DUNGEON_SIZE);
    const y = Math.floor(Math.random() * DUNGEON_SIZE);
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

    if (direction === 'horizontal') {
      for (let j = 0; j < DUNGEON_SIZE; j++) {
        if (dungeon[y][j] === 'floor') dungeon[y][j] = 'neon-line';
      }
    } else {
      for (let j = 0; j < DUNGEON_SIZE; j++) {
        if (dungeon[j][x] === 'floor') dungeon[j][x] = 'neon-line';
      }
    }
  }

  return { dungeon, rooms };
};

const doesRoomOverlap = (rooms, x, y, width, height) => {
  return rooms.some(room => 
    x < room.x + room.width && 
    x + width > room.x && 
    y < room.y + room.height && 
    y + height > room.y
  );
};

const connectRooms = (dungeon, roomA, roomB) => {
  let x = Math.floor(roomA.x + roomA.width / 2);
  let y = Math.floor(roomA.y + roomA.height / 2);
  const targetX = Math.floor(roomB.x + roomB.width / 2);
  const targetY = Math.floor(roomB.y + roomB.height / 2);

  while (x !== targetX || y !== targetY) {
    if (x !== targetX) {
      x += x < targetX ? 1 : -1;
    } else if (y !== targetY) {
      y += y < targetY ? 1 : -1;
    }
    dungeon[y][x] = 'floor';
  }
};

const placeItemsAndEnemies = (dungeon, rooms, level) => {
  rooms.forEach(room => {
    if (Math.random() < 0.7) { // 70% chance to place an enemy
      const enemyType = getRandomEnemyType(level);
      const x = generateRandomNumber(room.x, room.x + room.width - 1);
      const y = generateRandomNumber(room.y, room.y + room.height - 1);
      dungeon[y][x] = enemyType;
    }
    if (Math.random() < 0.5) { // 50% chance to place an item
      const itemType = getRandomItemType();
      const x = generateRandomNumber(room.x, room.x + room.width - 1);
      const y = generateRandomNumber(room.y, room.y + room.height - 1);
      dungeon[y][x] = itemType;
    }
  });
};

const getRandomEnemyType = (level) => {
  const enemies = ['goblin', 'skeleton', 'orc', 'troll'];
  if (level === 5) return 'dragon'; // Boss on level 5
  return enemies[Math.floor(Math.random() * enemies.length)];
};

const getRandomItemType = () => {
  const items = ['healthSmall', 'healthLarge', 'sword', 'bow', 'shield', 'helmet', 'scroll'];
  return items[Math.floor(Math.random() * items.length)];
};

export const movePlayer = (state, direction) => {
  const { player, dungeon } = state;
  let newX = player.x;
  let newY = player.y;

  switch (direction) {
    case 'up': newY--; break;
    case 'down': newY++; break;
    case 'left': newX--; break;
    case 'right': newX++; break;
    default: break;
  }

  if (newX < 0 || newX >= DUNGEON_SIZE || newY < 0 || newY >= DUNGEON_SIZE) {
    return state; // Out of bounds
  }

  const targetCell = dungeon[newY][newX];

  if (targetCell === 'wall') {
    return state; // Can't move into walls
  }

  if (targetCell === 'stairs') {
    return nextLevel(state);
  }

  if (['goblin', 'skeleton', 'orc', 'troll', 'dragon'].includes(targetCell)) {
    return initiateCombat(state, targetCell, newX, newY);
  }

  if (['healthSmall', 'healthLarge', 'sword', 'bow', 'shield', 'helmet', 'scroll'].includes(targetCell)) {
    return pickupItem(state, targetCell, newX, newY);
  }

  // Move player
  return {
    ...state,
    player: { ...state.player, x: newX, y: newY }
  };
};

const nextLevel = (state) => {
  const newLevel = state.currentLevel + 1;
  const { dungeon, rooms } = generateDungeon(newLevel);
  const startRoom = rooms[0];
  return {
    ...state,
    dungeon,
    currentLevel: newLevel,
    player: {
      ...state.player,
      x: startRoom.x + Math.floor(startRoom.width / 2),
      y: startRoom.y + Math.floor(startRoom.height / 2)
    }
  };
};

const initiateCombat = (state, enemyType, enemyX, enemyY) => {
  const enemy = createEnemy(enemyType, state.currentLevel);
  return {
    ...state,
    gameStatus: 'combat',
    currentEnemy: { ...enemy, x: enemyX, y: enemyY }
  };
};

const createEnemy = (type, level) => {
  const baseStats = {
    goblin: { health: 20, attack: 5, defense: 2, speed: 3 },
    skeleton: { health: 25, attack: 6, defense: 3, speed: 2 },
    orc: { health: 35, attack: 8, defense: 4, speed: 1 },
    troll: { health: 50, attack: 10, defense: 6, speed: 1 },
    dragon: { health: 100, attack: 15, defense: 10, speed: 5 }
  };

  const stats = baseStats[type];
  const scalingFactor = type === 'dragon' ? 2 : 1;

  return {
    type,
    health: stats.health + (level - 1) * 5 * scalingFactor,
    attack: stats.attack + (level - 1) * scalingFactor,
    defense: stats.defense + (level - 1) * scalingFactor,
    speed: stats.speed
  };
};

const pickupItem = (state, itemType, itemX, itemY) => {
  const newInventory = [...state.player.inventory];
  if (newInventory.length >= 10) {
    return state; // Inventory full
  }

  const item = createItem(itemType);
  newInventory.push(item);

  const newDungeon = state.dungeon.map(row => [...row]);
  newDungeon[itemY][itemX] = 'floor';

  return {
    ...state,
    dungeon: newDungeon,
    player: {
      ...state.player,
      inventory: newInventory
    }
  };
};

const createItem = (type) => {
  const items = {
    healthSmall: { name: 'Small Health Potion', effect: { health: 20 } },
    healthLarge: { name: 'Large Health Potion', effect: { health: 50 } },
    sword: { name: 'Sword', effect: { attack: 5 } },
    bow: { name: 'Bow', effect: { attack: 3, speed: 2 } },
    shield: { name: 'Shield', effect: { defense: 5 } },
    helmet: { name: 'Helmet', effect: { defense: 3 } },
    scroll: { name: 'Magic Scroll', effect: { special: 'aoe' } }
  };

  return items[type];
};

export const combat = (state, action) => {
  const { player, currentEnemy } = state;
  let newPlayerHealth = player.health;
  let newEnemyHealth = currentEnemy.health;

  if (action === 'attack') {
    const playerDamage = Math.max(0, player.attack - currentEnemy.defense);
    const enemyDamage = Math.max(0, currentEnemy.attack - player.defense);

    if (Math.random() < 0.1) { // 10% chance for critical hit
      newEnemyHealth -= Math.floor(playerDamage * 1.5);
    } else {
      newEnemyHealth -= playerDamage;
    }

    newPlayerHealth -= enemyDamage;
  } else if (action === 'defend') {
    const enemyDamage = Math.max(0, Math.floor((currentEnemy.attack - player.defense) / 2));
    newPlayerHealth -= enemyDamage;
  } else if (action === 'flee') {
    if (Math.random() < 0.5) { // 50% chance to flee successfully
      return {
        ...state,
        gameStatus: 'playing',
        currentEnemy: null
      };
    } else {
      const enemyDamage = Math.max(0, currentEnemy.attack - player.defense);
      newPlayerHealth -= enemyDamage;
    }
  }

  if (newPlayerHealth <= 0) {
    return { ...state, gameStatus: 'gameOver' };
  }

  if (newEnemyHealth <= 0) {
    const expGain = currentEnemy.type === 'dragon' ? 100 : 20;
    const newExp = player.experience + expGain;
    const newLevel = Math.floor(newExp / 100) + 1;

    return {
      ...state,
      gameStatus: 'playing',
      currentEnemy: null,
      player: {
        ...player,
        health: newPlayerHealth,
        experience: newExp,
        level: newLevel
      },
      dungeon: state.dungeon.map(row => row.map(cell => 
        cell === currentEnemy.type ? 'floor' : cell
      ))
    };
  }

  return {
    ...state,
    player: { ...player, health: newPlayerHealth },
    currentEnemy: { ...currentEnemy, health: newEnemyHealth }
  };
};

export const applyItemEffect = (state, itemIndex) => {
  const { player } = state;
  const item = player.inventory[itemIndex];
  const newInventory = player.inventory.filter((_, index) => index !== itemIndex);

  let newPlayerStats = { ...player };

  if (item.effect.health) {
    newPlayerStats.health = Math.min(100, player.health + item.effect.health);
  }
  if (item.effect.attack) {
    newPlayerStats.attack += item.effect.attack;
  }
  if (item.effect.defense) {
    newPlayerStats.defense += item.effect.defense;
  }
  if (item.effect.speed) {
    newPlayerStats.speed += item.effect.speed;
  }
  if (item.effect.special === 'aoe') {
    // Implement AOE damage to all enemies in the room
    // This would require keeping track of all enemies in the current room
  }

  return {
    ...state,
    player: {
      ...newPlayerStats,
      inventory: newInventory
    }
  };
};

export const levelUp = (state, attribute) => {
  const { player } = state;
  const newStats = { ...player };

  switch (attribute) {
    case 'health':
      newStats.health += 20;
      break;
    case 'attack':
      newStats.attack += 2;
      break;
    case 'defense':
      newStats.defense += 2;
      break;
    case 'speed':
      newStats.speed += 1;
      break;
    default:
      console.warn(`Unknown attribute: ${attribute}`);
      break;
  }

  newStats.experience -= player.level * 100;
  newStats.level += 1;

  return {
    ...state,
    player: newStats
  };
};