const WORLD_WIDTH = 40;
const WORLD_HEIGHT = 60;

const SIZE = 32;

class World {
  constructor(numLevels, powerups, enemies, AM) {
    this.powerups = powerups;
    this.enemies = enemies;
    this.AM = AM;
    this.levels = [];
    this.levelEntities = [];
    this.levelWalls = [];
    for (let i = 0; i < numLevels; i++) {
      let level = new Level(powerups, enemies, i);
      while (!level.valid) {
        console.log('[World] Failed to make a valid world. Trying again.');
        level = new Level(powerups, enemies, i);
      }
      this.levels.push(level);
    }
    this.level = 0;
  }

  setLevel(game, levelIndex) {
    let levelChange = this.level - levelIndex;
    this.level = levelIndex;
    console.log('[World] Switching to level', levelIndex);
    let level = this.levels[levelIndex];
    let tiles = [];
    let enemyEntities = [];
    let powerupEntities = [];
    let stationary = [];

    let don = game.player;
    if (!don) {
      don = new DonJon(game, this.AM.getAsset('./img/main_dude.png'),
        0, 0, SIZE, SIZE * 2);
      game.setPlayer(don);
    }
    if (!game.camera) {
      let camera = new Camera(don);
      game.setCamera(camera);
    }

    if (!this.levelEntities[levelIndex]) {
      let levelEntities = new LinkedList();
      let levelWalls = new LinkedList();
      for (let i = 0; i < level.tiles[0].length; i++) {
        for (let j = 0; j < level.tiles.length; j++) {
          let pos = { x: i * SIZE, y: j * SIZE };
          switch (level.tiles[j][i]) {
            case 'W':
              let wall = new Wall(game, this.AM.getAsset('./img/map.png'),
                pos.x, pos.y, SIZE, SIZE);
              stationary.push(wall);
              levelWalls.add(wall);
              break;
            case 'F': tiles.push(new Dirt(game,
              this.AM.getAsset('./img/map.png'), pos.x, pos.y, SIZE, SIZE));
              break;
            case 'End': stationary.push(new Hole(game,
              this.AM.getAsset('./img/map.png'), pos.x, pos.y, SIZE, SIZE));
              // Place at hole if going up to previous level
              if (levelChange > 0) {
                don.moveTo(pos.x, pos.y - SIZE);
              }
              break;
            case 'Start':
              let ladder = new Ladder(game, this.AM.getAsset('./img/map.png'),
                pos.x, pos.y, SIZE, SIZE);
              stationary.push(ladder);
              // If setting level to 0 then place DonJon at start,
              // or place at ladder if going down to next level
              if (levelChange <= 0) {
                don.moveTo(pos.x, pos.y - SIZE);
              }
              break;
          }
          for (let k = 0; k < this.powerups.length; k++) {
            if (level.tiles[j][i] === this.powerups[k].name) {
              tiles.push(new Dirt(game, this.AM.getAsset('./img/map.png'),
                pos.x, pos.y, SIZE, SIZE));
              powerupEntities.push(this.powerups[k].constructor(pos.x, pos.y));
            }
          }
          for (let k = 0; k < this.enemies.length; k++) {
            if (level.tiles[j][i] === this.enemies[k].name) {
              tiles.push(new Dirt(game, this.AM.getAsset('./img/map.png'),
                pos.x, pos.y, SIZE, SIZE));
              enemyEntities.push(this.enemies[k].constructor(pos.x, pos.y));
            }
          }
        }
      }

      for (let i = 0; i < tiles.length; i++) {
        levelEntities.add(tiles[i]);
      }
      for (let i = 0; i < stationary.length; i++) {
        levelEntities.add(stationary[i]);
      }
      for (let i = 0; i < powerupEntities.length; i++) {
        levelEntities.add(powerupEntities[i]);
      }
      for (let i = 0; i < enemyEntities.length; i++) {
        levelEntities.add(enemyEntities[i]);
      }
      this.levelEntities[levelIndex] = levelEntities;
      this.levelWalls[levelIndex] = levelWalls;
    } else {
      for (let i = 0; i < level.tiles[0].length; i++) {
        for (let j = 0; j < level.tiles.length; j++) {
          let pos = { x: i * SIZE, y: j * SIZE };
          switch (level.tiles[j][i]) {
            case 'End':
              if (levelChange > 0) {
                don.moveTo(pos.x, pos.y - SIZE);
              }
              break;
            case 'Start':
              // If setting level to 0 then place DonJon at start,
              // or place at ladder if going down to next level
              if (levelChange <= 0) {
                don.moveTo(pos.x, pos.y - SIZE);
              }
              break;
          }
        }
      }
    }
    game.setEntities(this.levelEntities[levelIndex]);
    game.walls = this.levelWalls[levelIndex];
    console.log('[World] Switched to level', levelIndex);
  }
}

class Level {
  constructor(powerups, enemies, levelIndex) {
    this.valid = true;
    this.initTiles();
    this.drunkardsWalk();
    this.cleanupTiles(levelIndex);
    this.placePowerups(powerups);
    this.placeEnemies(enemies, levelIndex);
  }

  /*
   * Initializes the tiles for the level.
   */
  initTiles() {
    this.tiles = [];
    for (let i = 0; i < WORLD_HEIGHT; i++) {
      this.tiles.push(new Array(WORLD_WIDTH).fill('E'));
    }
    console.log('[World] Initialized tiles');
  }

  /*
   * Randomly place the floor tiles using the drunkard's walk algorithm.
   */
  drunkardsWalk() {
    let position = { x: WORLD_WIDTH - 2, y: WORLD_HEIGHT - 2 };
    let direction = 'N';
    let possDirection = ['N', 'W'];
    this.floor = new LinkedList();
    while (position.x > 5 && position.y > 15) {
      this.tiles[position.y][position.x] = 'F';
      this.floor.add({ x: position.x, y: position.y });
      switch (direction) {
        case 'N': position.y--; break;
        case 'E': position.x++; break;
        case 'S': position.y++; break;
        case 'W': position.x--; break;
      }
      possDirection = [];
      if (position.y > 2) {
        possDirection.push('N');
      }
      if (position.x < WORLD_WIDTH - 2) {
        possDirection.push('E');
      }
      if (position.y < WORLD_HEIGHT - 2) {
        possDirection.push('S');
      }
      if (position.x > 2) {
        possDirection.push('W');
      }
      direction = possDirection[randInt(possDirection.length)];
    }
    console.log('[World] Finished Drunkard\'s Walk');
  }

  /*
   * Randomly places the enemies in the given list.
   */
  placeEnemies(enemies, level) {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = 0; j < enemies[i].number[level]; j++) {
        if (!this.placeEnemy(enemies[i])) {
          this.valid = false;
        }
      }
    }
    console.log('[World] Placed enemies');
  }

  /*
   * Randomly places the powerups from the given list.
   */
  placePowerups(powerups) {
    for (let i = 0; i < powerups.length; i++) {
      for (let j = 0; j < powerups[i].number; j++) {
        this.placeRandomTile(powerups[i].name);
      }
    }
    console.log('[World] Placed powerups');
  }

  /*
   * Cleans up the level by placing walls and the start/end points.
   */
  cleanupTiles(levelIndex) {
    // Place walls around floor
    for (let j = 0; j < this.tiles.length; j++) {
      for (let i = 0; i < this.tiles[0].length; i++) {
        if (this.tiles[j][i] === 'F') {
          for (let k = -1; k <= 1; k++) {
            this.tryWall(k + i, j - 1);
            this.tryWall(k + i, j);
            this.tryWall(k + i, j + 1);
          }
        }
      }
    }
    // Place start and end points
    if (levelIndex % 2 === 0) {
      this.tiles[WORLD_HEIGHT - 2][WORLD_WIDTH - 2] = 'Start';
    } else {
      this.tiles[WORLD_HEIGHT - 2][WORLD_WIDTH - 2] = 'End';
    }
    for (let j = WORLD_HEIGHT - 2; j >= WORLD_HEIGHT - 2 - 5; j--) {
      for (let i = WORLD_WIDTH - 2; i >= WORLD_WIDTH - 2 - 5; i--) {
        this.floor.remove({ x: i, y: j });
      }
    }
    this.placeEnd(levelIndex);
    console.log('[World] Cleaned up tiles');
  }

  /*
   * Attempts to place wall at the given coordinates, if the tile is empty.
   */
  tryWall(x, y) {
    if (x >= 0 && x < this.tiles[0].length && y >= 0 && y < this.tiles.length &&
        this.tiles[y][x] === 'E') {
      this.tiles[y][x] = 'W';
    }
  }

  /*
   * Places the given tile at a random floor location.
   */
  placeRandomTile(tile) {
    let pos = this.floor.get(randInt(this.floor.length));
    this.tiles[pos.y][pos.x] = tile;
    this.removeRadius(pos.x, pos.y, 3);
  }

  removeRadius(x, y, radius) {
    for (let i = x - radius; i <= x + radius; i++) {
      for (let j = y - radius; j <= y + radius; j++) {
        this.floor.remove({ x: i, y: j });
      }
    }
  }

  /*
   * Places the exit at the tile furthest from the start.
   */
  placeEnd(levelIndex) {
    let values = [];
    for (let i = 0; i < WORLD_HEIGHT; i++) {
      values.push(new Array(WORLD_WIDTH).fill(0));
    }
    for (let j = this.tiles.length - 2; j >= 0; j--) {
      for (let i = this.tiles[0].length - 2; i >= 0; i--) {
        if (this.tiles[j][i] === 'F') {
          values[j][i] = Math.max(
            values[j][i - 1],
            values[j][i + 1],
            values[j - 1][i],
            values[j + 1][i]
          ) + 1;
        }
      }
    }
    let pos = { x: WORLD_WIDTH - 2, y: WORLD_HEIGHT -2 };
    let distance = 0;
    for (let j = this.tiles.length - 2; j >= 0; j--) {
      for (let i = this.tiles[0].length - 2; i >= 0; i--) {
        if (values[j][i] > distance) {
          distance = values[j][i];
          pos.x = i;
          pos.y = j;
        }
      }
    }
    for (let j = pos.y + 5; j >= pos.y - 5; j--) {
      for (let i = pos.x + 5; i >= pos.x - 5; i--) {
        this.floor.remove({ x: i, y: j });
      }
    }
    if (levelIndex % 2 === 0) {
      this.tiles[pos.y][pos.x] = 'End';
    } else {
      this.tiles[pos.y][pos.x] = 'Start';
    }
  }

  /*
   * Places the given enemy at a valid random floor location.
   */
  placeEnemy(enemy) {
    let pos = null;
    let validSpot = false;
    do {
      pos = this.floor.get(randInt(this.floor.length));
      if (!pos) {
        return false;
      }
      validSpot = true;
      for (let i = pos.x; i < pos.x + enemy.width; i++) {
        for (let j = pos.y; j < pos.y + enemy.height; j++) {
          if (!this.floor.contains({ x: i, y: j })) {
            validSpot = false;
            break;
          }
        }
      }
      if (!validSpot) {
        this.floor.remove(pos);
      }
    }  while (!validSpot);
    this.tiles[pos.y][pos.x] = enemy.name;
    this.removeRadius(pos.x, pos.y, 2 + enemy.width);
    return true;
  }
}
