const ROOMS = [
  { name: 'square',
    tiles: [['E', 'E', 'E', 'C', 'E', 'E', 'E'],
            ['W', 'W', 'W', 'D', 'W', 'W', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'D', 'D', 'W'],
            ['W', 'W', 'W', 'D', 'W', 'W', 'W'],
            ['E', 'E', 'E', 'C', 'E', 'E', 'E']]
  },
  { name: 'long',
    tiles: [['E', 'E', 'C', 'E', 'E'],
            ['W', 'W', 'D', 'W', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'D', 'D', 'D', 'W'],
            ['W', 'W', 'D', 'W', 'W'],
            ['E', 'E', 'C', 'E', 'E']]
  }
];

const START_ROOM = {
  name: 'start',
  tiles: [['E', 'E', 'C', 'E', 'E', 'E'],
          ['W', 'W', 'D', 'W', 'W', 'W'],
          ['W', 'D', 'D', 'D', 'D', 'D'],
          ['W', 'D', 'D', 'D', 'D', 'D'],
          ['W', 'D', 'D', 'D', 'D', 'D'],
          ['W', 'D', 'D', 'D', 'D', 'D']]
};

const END_ROOM = {
  name: 'end',
  tiles: [['D', 'D', 'D', 'D', 'D', 'W'],
          ['D', 'D', 'D', 'D', 'D', 'W'],
          ['D', 'D', 'D', 'D', 'D', 'W'],
          ['D', 'D', 'D', 'D', 'D', 'W'],
          ['W', 'W', 'W', 'D', 'W', 'W'],
          ['E', 'E', 'E', 'C', 'E', 'E']]
};


/*
 * Generates a random int between [0, max).
 */
function randInt(max) {
  return Math.floor(Math.random() * max);
}

function removeFrom(obj, array) {
  return array.filter((o) => o !== obj);
}

function cartesianDistance(pointA, pointB) {
  return Math.sqrt((pointB.x - pointA.x) * (pointB.x - pointA.x) +
                   (pointB.y - pointA.y) * (pointB.y - pointA.y));
}

function taxiDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

const LEVEL_WIDTH = 40;
const LEVEL_HEIGHT = 60;
const MIN_ROOMS = 4;
const MAX_ROOMS = 8;
const ROOM_OFFSET = 2;

class Level {
  constructor() {
    this.roomNum = 0;
    this.endpoints = [];
    this.initTiles();
    this.generateRooms();
    this.connectRooms();
    this.cleanupTiles();
    console.log('Created level');
  }

  /*
   * Initializes the tiles for the level.
   */
  initTiles() {
    this.tiles = [];
    for (let i = 0; i < LEVEL_HEIGHT; i++) {
      this.tiles.push(new Array(LEVEL_WIDTH).fill('E'));
    }
    this.placeRoom(START_ROOM, LEVEL_WIDTH - START_ROOM.tiles[0].length,
              LEVEL_HEIGHT - START_ROOM.tiles.length);
    this.placeRoom(END_ROOM, 0, 0);
  }

  /*
   * Randomly select and place rooms in this level.
   */
  generateRooms() {
    let rooms = [];
    for (let i = 0; i < randInt(MAX_ROOMS - MIN_ROOMS + 1) + MIN_ROOMS; i++) {
      rooms.push(ROOMS[randInt(ROOMS.length)]);
    }
    let room = rooms.pop();
    while (room) {
      let x = randInt(LEVEL_WIDTH);
      let y = randInt(LEVEL_HEIGHT);
      if (this.isValidRoom(room, x, y)) {
        this.placeRoom(room, x, y);
        room = rooms.pop();
      }
    }
  }

  /*
   * Connects the rooms together in the level.
   */
  connectRooms() {
    let final = this.endpoints[1]; // Set aside exit room endpoint
    this.endpoints = removeFrom(final, this.endpoints);
    let start = this.endpoints[0]; // Choose start room endpoint
    let end  = undefined;
    let distance = Infinity;
    while (this.endpoints.length > 0) {
      for (let i = 0; i < this.endpoints.length; i++) {
        if (taxiDistance(start, this.endpoints[i]) < distance &&
            start.room !== this.endpoints[i].room) {
          end = this.endpoints[i];
          distance = taxiDistance(start, end);
        }
      }
      if (!end)
        end = final;
      this.connect(start, end);
      this.endpoints = removeFrom(start, this.endpoints);
      this.endpoints = removeFrom(end, this.endpoints);
//      start = this.endpoints.pop();
      start = this.endpoints.filter((e) => e.room === end.room)[0];
      if (!start) {
        start = this.endpoints.pop();
      }
      end = undefined; // Reset end
      distance = Infinity;
    }
  }

  /*
   * Cleans up the tiles and replaces corridors with the floor type and places
   * walls around floor tiles.
   */
  cleanupTiles() {
    for (let j = 0; j < this.tiles.length; j++) {
      for (let i = 0; i < this.tiles[0].length; i++) {
        if (!isNaN(this.tiles[j][i])) {
          this.tiles[j][i] = 'D';
        }
      }
    }
    for (let j = 0; j < this.tiles.length; j++) {
      for (let i = 0; i < this.tiles[0].length; i++) {
        if (this.tiles[j][i] === 'D') {
          for (let k = -1; k <= 1; k++) {
            this.tryWall(k + i, j - 1);
            this.tryWall(k + i, j + 1);
          }
        }
      }
    }
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
   * Connects rooms at the start and end objects with a hallway.
   */
  connect(start, end) {
    let y = start.y;
    let x = start.x;
    let dy = end.y - start.y;
    let dx = end.x - start.x;
    while (dy !== 0 || dx !== 0) {
      if (dy > 0 && y + 1 < this.tiles.length && this.tiles[y + 1][x] === 'E') {
        this.tiles[++y][x] = 'D';
        dy--;
      } else if (dx > 0 && x + 1 < this.tiles[0].length &&
                 this.tiles[y][x + 1] === 'E') {
        this.tiles[y][++x] = 'D';
        dx--;
      } else if (dy < 0 && y - 1 >= 0 && this.tiles[y - 1][x] === 'E') {
        this.tiles[--y][x] = 'D';
        dy++;
      } else if (dx < 0 && x - 1 >= 0 && this.tiles[y][x - 1] === 'E') {
        this.tiles[y][--x] = 'D';
        dx++;
      } else {
        dy = 0; // TODO remove
        dx = 0;
      }
    }
  }

  /*
   * Verifies that the given room object can be placed in the level at the
   * given (x, y) coordinates.
   */
  isValidRoom(room, x, y) {
    if (x + room.tiles[0].length < LEVEL_WIDTH &&
        y + room.tiles.length < LEVEL_HEIGHT) {
      let minX = Math.max(0, x - ROOM_OFFSET);
      let maxX = Math.min(x + room.tiles[0].length + ROOM_OFFSET, LEVEL_WIDTH);
      let minY = Math.max(0, y - ROOM_OFFSET);
      let maxY = Math.min(y + room.tiles.length + ROOM_OFFSET, LEVEL_HEIGHT);
      for (let j = minY; j < maxY; j++) {
        for (let i = minX; i < maxX; i++) {
          if (this.tiles[j][i] !== 'E') {
            return false;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /*
   * Places the given room object at the given (x, y) coordinates.
   */
  placeRoom(room, x, y) {
    this.roomNum++;
    for (let j = y; j < y + room.tiles.length; j++) {
      for (let i = x; i < x + room.tiles[0].length; i++) {
        if (room.tiles[j - y][i - x] === 'C') {
          this.tiles[j][i] = this.roomNum;
          this.endpoints.push({x: i, y: j, room: this.roomNum});
        } else {
          this.tiles[j][i] = room.tiles[j - y][i - x];
        }
      }
    }
  }
}
