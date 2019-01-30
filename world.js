const WORLD_WIDTH = 40;
const WORLD_HEIGHT = 60;
class World {
  constructor(powerups, enemies) {
    this.initTiles();
    this.drunkardsWalk();
    this.cleanupTiles();
    this.placeEnemies(enemies);
    this.placePowerups(powerups);
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
    this.floor = [];
    while (position.x > 5 && position.y > 15) {
      this.tiles[position.y][position.x] = 'F';
      this.floor.push({ x: position.x, y: position.y });
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
  placeEnemies(enemies) {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = 0; j < enemies[i].number; j++) {
        this.placeRandomTile(enemies[i].name);
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
  cleanupTiles() {
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
    this.tiles[WORLD_HEIGHT - 2][WORLD_WIDTH - 2] = 'Start';
    this.placeRandomTile('End');
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
    let pos = this.floor[randInt(this.floor.length)];
    this.tiles[pos.y][pos.x] = tile;
    removeFrom(pos, this.floor);
  }

  /*
   * Places the given enemy at a valid random floor location.
   */
  placeEnemy(enemy) {
    let pos = this.floor[randInt(this.floor.length)];
    this.tiles[pos.y][pos.x] = tile;
    removeFrom(pos, this.floor);
  }
}
